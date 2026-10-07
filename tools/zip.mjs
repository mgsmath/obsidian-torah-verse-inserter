// Minimal ZIP writer, so packaging the library needs no extra dependency and
// no external `zip` binary (which Windows users do not have).
// Deflate-compressed entries, UTF-8 file names (flag bit 11).
import { deflateRawSync } from "node:zlib";

const CRC_TABLE = (() => {
	const table = new Int32Array(256);
	for (let index = 0; index < 256; index++) {
		let value = index;
		for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
		table[index] = value;
	}
	return table;
})();

function crc32(buffer) {
	let crc = -1;
	for (let index = 0; index < buffer.length; index++) {
		crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[index]) & 0xff];
	}
	return (crc ^ -1) >>> 0;
}

function dosStamp(date) {
	const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
	const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
	return { time, day };
}

/**
 * Build a ZIP archive in memory.
 * @param {Array<{name: string, data: Buffer|string, date?: Date}>} entries
 * @param {{comment?: string, level?: number}} [options]
 * @returns {Buffer}
 */
export function createZip(entries, options = {}) {
	const level = options.level ?? 9;
	const comment = Buffer.from(options.comment ?? "", "utf8");
	const locals = [];
	const centrals = [];
	let offset = 0;

	for (const entry of entries) {
		const name = Buffer.from(entry.name, "utf8");
		const raw = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, "utf8");
		const deflated = deflateRawSync(raw, { level });
		// Keep the entry stored when deflate would only make it bigger.
		const useDeflate = deflated.length < raw.length;
		const body = useDeflate ? deflated : raw;
		const method = useDeflate ? 8 : 0;
		const crc = crc32(raw);
		const { time, day } = dosStamp(entry.date ?? new Date());

		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4); // version needed to extract
		local.writeUInt16LE(0x0800, 6); // general purpose flag: UTF-8 names
		local.writeUInt16LE(method, 8);
		local.writeUInt16LE(time, 10);
		local.writeUInt16LE(day, 12);
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(body.length, 18);
		local.writeUInt32LE(raw.length, 22);
		local.writeUInt16LE(name.length, 26);
		local.writeUInt16LE(0, 28); // extra field length
		locals.push(local, name, body);

		const central = Buffer.alloc(46);
		central.writeUInt32LE(0x02014b50, 0);
		central.writeUInt16LE((3 << 8) | 20, 4); // made by: unix, version 2.0
		central.writeUInt16LE(20, 6);
		central.writeUInt16LE(0x0800, 8);
		central.writeUInt16LE(method, 10);
		central.writeUInt16LE(time, 12);
		central.writeUInt16LE(day, 14);
		central.writeUInt32LE(crc, 16);
		central.writeUInt32LE(body.length, 20);
		central.writeUInt32LE(raw.length, 24);
		central.writeUInt16LE(name.length, 28);
		central.writeUInt16LE(0, 30); // extra field length
		central.writeUInt16LE(0, 32); // file comment length
		central.writeUInt16LE(0, 34); // disk number start
		central.writeUInt16LE(0, 36); // internal file attributes
		central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external: regular file, 0644
		central.writeUInt32LE(offset, 42); // offset of the local header
		centrals.push(central, name);

		offset += local.length + name.length + body.length;
	}

	const directory = Buffer.concat(centrals);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(0, 4); // this disk
	end.writeUInt16LE(0, 6); // disk with the directory
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(directory.length, 12);
	end.writeUInt32LE(offset, 16);
	end.writeUInt16LE(comment.length, 20);

	return Buffer.concat([...locals, directory, end, comment]);
}
