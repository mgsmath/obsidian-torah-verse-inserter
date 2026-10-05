// Bundle the downloaded Mishneh Torah and Bavli texts for offline lookup.
// Run: npm run build-study-corpus [optional-cache-directory]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(process.argv[2] ?? join(ROOT, "tools", "study-cache"));
const SOURCE = readFileSync(join(ROOT, "src", "study.ts"), "utf8");
const OUTPUT = join(ROOT, "src", "study-corpus.ts");
const SOURCES_OUTPUT = join(ROOT, "tools", "study-corpus-sources.json");

function declaration(name) {
	const start = SOURCE.indexOf(`export const ${name}:`);
	if (start === -1) throw new Error(`Could not find ${name} in src/study.ts`);
	const end = SOURCE.indexOf("\n];", start);
	if (end === -1) throw new Error(`Could not find the end of ${name} in src/study.ts`);
	return SOURCE.slice(start, end + 3);
}

function namesFrom(pattern, text, description) {
	const matches = [...text.matchAll(pattern)].map((match) => match[1]);
	if (matches.length === 0) throw new Error(`No ${description} found in src/study.ts`);
	return matches;
}

const rambamDeclaration = declaration("RAMBAM_BOOKS");
const topicArrays = [...rambamDeclaration.matchAll(/topics:\s*\[([\s\S]*?)\]/g)];
const rambamTopics = topicArrays.flatMap((match) =>
	namesFrom(/name:\s*"([^"]+)"/g, match[1], "Rambam topic")
);
const gemaraDeclaration = declaration("GEMARA_TRACTATES");
const gemaraTractates = namesFrom(/name:\s*"([^"]+)"/g, gemaraDeclaration, "Gemara tractate");

if (rambamTopics.length !== 84 || gemaraTractates.length !== 37) {
	throw new Error(
		`Unexpected catalog size: ${rambamTopics.length} Rambam sections and ${gemaraTractates.length} Bavli tractates`
	);
}

function slug(value) {
	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^A-Za-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
}

function hasText(value) {
	if (typeof value === "string") return value.trim().length > 0;
	return Array.isArray(value) && value.some(hasText);
}

function cleanSourceText(value) {
	if (typeof value === "string") {
		return value
			.replace(/<i class="footnote">[\s\S]*?<\/i>/gi, "")
			.replace(/<sup class="footnote-marker">[\s\S]*?<\/sup>/gi, "")
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/(?:p|div|li)>/gi, "\n")
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/gi, " ")
			.replace(/&amp;/gi, "&")
			.replace(/&quot;/gi, '"')
			.replace(/&#39;|&apos;/gi, "'")
			.replace(/&lt;/gi, "<")
			.replace(/&gt;/gi, ">")
			.replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, decimal) => {
				const codePoint = parseInt(hex ?? decimal ?? "", hex ? 16 : 10);
				return Number.isFinite(codePoint) && codePoint <= 0x10ffff
					? String.fromCodePoint(codePoint)
					: "";
			})
			.replace(/\r/g, "")
			.replace(/[\t ]+/g, " ")
			.replace(/ *\n */g, "\n")
			.trim();
	}
	if (Array.isArray(value)) return value.map(cleanSourceText);
	return value;
}

function sourceNames(versions) {
	return versions.map((version) =>
		Array.isArray(version) ? version[0] : typeof version === "string" ? version : version.versionTitle
	);
}

function licensesFor(mode, versions) {
	if (mode === "gemara") return ["CC BY-SA (Wikisource Talmud Bavli)"];
	return [...new Set(sourceNames(versions).map((name) => {
		if (name === "Torat Emet 363") return "Public Domain (Sefaria source metadata)";
		if (name === "Wikisource Mishneh Torah") return "CC BY-SA (Wikisource)";
		return `Review upstream license: ${name}`;
	}))];
}

function loadText(mode, name) {
	const file = join(CACHE_DIR, mode, `${slug(name)}.json`);
	let data;
	try {
		data = JSON.parse(readFileSync(file, "utf8"));
	} catch (error) {
		throw new Error(`Could not read cached ${mode} text for “${name}” at ${file}: ${error.message}`);
	}
	if (!Array.isArray(data.text) || !hasText(data.text)) {
		throw new Error(`Cached ${mode} text for “${name}” has no text array or contains no text`);
	}
	if (mode === "rambam" && !data.text.every((chapter) => Array.isArray(chapter))) {
		throw new Error(`Cached Rambam text for “${name}” is not organized as chapters and halachot`);
	}
	return data;
}

function packCorpus(mode, names) {
	const entries = [];
	const sources = [];
	let rawBytes = 0;
	let gzipBytes = 0;

	for (const name of names) {
		const data = loadText(mode, name);
		const json = JSON.stringify(cleanSourceText(data.text));
		const gz = gzipSync(Buffer.from(json, "utf8"), { level: 9 });
		rawBytes += Buffer.byteLength(json, "utf8");
		gzipBytes += gz.length;
		entries.push(`\t${JSON.stringify(name)}: ${JSON.stringify(gz.toString("base64"))},`);
		sources.push({
			name,
			versionTitle: data.versionTitle ?? "not recorded",
			versionSource: data.versionSource ?? "",
			versions: data.versions ?? [],
			licenses: licensesFor(mode, data.versions ?? []),
		});
	}

	return { entries, sources, rawBytes, gzipBytes };
}

const rambam = packCorpus("rambam", rambamTopics);
const gemara = packCorpus("gemara", gemaraTractates);
const generated = `// GENERATED FILE — do not edit by hand. Run: npm run fetch-study-corpus && npm run build-study-corpus
// Offline Hebrew/Aramaic text for the 84 Mishneh Torah sections and 37 Bavli tractates.
// Source editions and licensing notes: STUDY_TEXTS.md and tools/study-corpus-sources.json.
// Each value is gzip+base64 JSON. Decompression is lazy, one section/tractate at a time.

export const RAMBAM_GZ: Record<string, string> = {
${rambam.entries.join("\n")}
};

export const GEMARA_GZ: Record<string, string> = {
${gemara.entries.join("\n")}
};
`;

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, generated);

const cacheManifest = join(CACHE_DIR, "manifest.json");
let sources = {
	generatedFrom: "Sefaria text export",
	cacheManifest: null,
	rambam: rambam.sources,
	gemara: gemara.sources,
};
try {
	sources.cacheManifest = JSON.parse(readFileSync(cacheManifest, "utf8"));
} catch {
	// The per-file version titles remain available when a cache manifest is omitted.
}
writeFileSync(SOURCES_OUTPUT, `${JSON.stringify(sources, null, 2)}\n`);

console.log(
	`✅ Bundled ${rambamTopics.length} Rambam sections and ${gemaraTractates.length} Bavli tractates → src/study-corpus.ts`
);
console.log(
	`   Text JSON ${((rambam.rawBytes + gemara.rawBytes) / 1048576).toFixed(1)} MB`
);
console.log(
	`   Compressed ${((rambam.gzipBytes + gemara.gzipBytes) / 1048576).toFixed(1)} MB gzip`
);
