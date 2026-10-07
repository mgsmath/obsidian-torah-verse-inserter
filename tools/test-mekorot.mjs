// Tests for the atomic source library: the Hebrew paths every citation links
// to, the contents of a source note, and the whole generated library.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateRawSync } from "node:zlib";
import { build } from "esbuild";

const gunzipSyncRaw = (buffer) => inflateRawSync(buffer).toString("utf8");

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const temporaryDirectory = mkdtempSync(join(tmpdir(), "torah-mekorot-test-"));
const mekorotPath = join(temporaryDirectory, "mekorot.mjs");
const libraryPath = join(temporaryDirectory, "library.mjs");
const composePath = join(temporaryDirectory, "compose.mjs");
const perakimPath = join(temporaryDirectory, "perakim.mjs");

// Built from code points so this file needs no Hebrew literals of its own.
const he = (...points) => String.fromCharCode(...points);
const RLI = String.fromCharCode(0x2067);
const PDI = String.fromCharCode(0x2069);

try {
	for (const [entry, out] of [
		["mekorot.ts", mekorotPath],
		["library.ts", libraryPath],
		["compose.ts", composePath],
		["gemara-perakim.ts", perakimPath],
	]) {
		await build({
			entryPoints: [join(ROOT, "src", entry)],
			outfile: out,
			bundle: true,
			format: "esm",
			platform: "node",
			target: "node22",
			logLevel: "silent",
		});
	}

	const stamp = `?t=${Date.now()}`;
	const mekorot = await import(`${pathToFileURL(mekorotPath).href}${stamp}`);
	const library = await import(`${pathToFileURL(libraryPath).href}${stamp}`);
	const compose = await import(`${pathToFileURL(composePath).href}${stamp}`);
	const perakim = await import(`${pathToFileURL(perakimPath).href}${stamp}`);
	const { createZip } = await import(pathToFileURL(join(ROOT, "tools", "zip.mjs")).href);

	// 1. The three paths from the specification, character for character.
	const bereshit = {
		kind: "tanakh",
		bookKey: "Genesis",
		bookHe: he(0x05d1, 0x05b0, 0x05bc, 0x05e8, 0x05b5, 0x05d0, 0x05e9, 0x05b4, 0x05c1, 0x05d9, 0x05ea),
		chapter: 1,
		verse: 1,
	};
	assert.equal(mekorot.sourceFilePath(bereshit), "מקורות/תנך/בראשית/פרק א/א.md");

	const berakhot = {
		kind: "gemara",
		tractateName: "Berakhot",
		tractateHe: "ברכות",
		perek: 1,
		daf: 2,
		amud: "a",
	};
	assert.equal(mekorot.sourceFilePath(berakhot), "מקורות/גמרא/ברכות/פרק א/ב עא.md");
	assert.equal(
		mekorot.sourceFilePath({ ...berakhot, amud: "b" }),
		"מקורות/גמרא/ברכות/פרק א/ב עב.md"
	);

	const shema = {
		kind: "rambam",
		topicName: "Reading the Shema",
		topicHe: "קריאת שמע",
		bookHe: "ספר אהבה",
		chapter: 1,
		halacha: 1,
	};
	assert.equal(mekorot.sourceFilePath(shema), "מקורות/רמבם/קריאת שמע/פרק א/א.md");

	// 2. Numbering is Hebrew letters, with the usual 15/16 spelling.
	assert.equal(mekorot.perekFolderName(15), "פרק טו");
	assert.equal(mekorot.perekFolderName(16), "פרק טז");
	assert.equal(mekorot.perekFolderName(118), "פרק קיח");
	assert.equal(mekorot.amudFileName(55, "b"), "נה עב");

	// 3. A configurable root only changes the first segment.
	assert.equal(
		mekorot.sourceFilePath(bereshit, "Sources"),
		"Sources/תנך/בראשית/פרק א/א.md"
	);

	// 4. Book folders carry no nikud, whatever the citation looks like.
	assert.equal(mekorot.bookFolderName(bereshit.bookHe), "בראשית");
	assert.equal(
		mekorot.sourcePath({ ...bereshit, bookHe: "תְּהִלִּים", bookKey: "Psalms", chapter: 23, verse: 1 }),
		"מקורות/תנך/תהלים/פרק כג/א"
	);

	// 5. The perek a daf sits in, from the generated table.
	assert.equal(mekorot.perekForDaf("Berakhot", 2, "a"), 1);
	assert.equal(mekorot.perekForDaf("Berakhot", 12, "b"), 1);
	assert.equal(mekorot.perekForDaf("Berakhot", 13, "a"), 2);
	assert.equal(mekorot.perekForDaf("Berakhot", 54, "b"), 9);
	// Tamid opens on 25b, not 2a, and its first perek still starts there.
	assert.equal(mekorot.perekForDaf("Tamid", 25, "b"), 1);
	assert.equal(mekorot.perekForDaf("Tamid", 28, "a"), 1);
	assert.equal(mekorot.perekForDaf("Tamid", 28, "b"), 2);

	// 6. The wikilink keeps its brackets outside the RTL isolate so Obsidian can
	// parse it, and isolates only the visible label.
	const link = mekorot.sourceLink(bereshit, "בראשית א:א");
	assert.equal(link, `[[מקורות/תנך/בראשית/פרק א/א|${RLI}בראשית א:א${PDI}]]`);
	assert.ok(link.startsWith("[["), "the link must open with clean brackets");

	// 7. A source note contains only its location heading, text and navigation.
	const note = mekorot.sourceNoteContent(
		bereshit,
		"בְּרֵאשִׁית בָּרָא",
		{
			next: { path: "מקורות/תנך/בראשית/פרק א/ב", label: "בראשית א:ב" },
			up: { path: "מקורות/תנך/בראשית/פרק א/א", label: "פרק א" },
		}
	);
	assert.ok(note.startsWith("# בראשית פרק א, פסוק א\n"), "note must begin with its location heading");
	assert.ok(!note.startsWith("---\n"), "note must not have frontmatter");
	for (const field of ["סוג:", "מקור:", "ספר:", "פרק:", "פסוק:", "הפניה:", "sefaria:"]) {
		assert.ok(!note.includes(field), `note must not include metadata field ${field}`);
	}
	assert.ok(note.includes("בְּרֵאשִׁית בָּרָא"));
	assert.ok(note.includes("[[מקורות/תנך/בראשית/פרק א/ב|הבא — בראשית א:ב]]"));
	assert.ok(note.includes("[[מקורות/תנך/בראשית/פרק א/א|פרק א]]"));
	// Rambam and Gemara notes also retain just the location, text and navigation.
	const rambamNote = mekorot.sourceNoteContent(shema, "טקסט");
	assert.ok(rambamNote.startsWith("# רמב״ם קריאת שמע פרק א, הלכה א\n"));
	assert.ok(!rambamNote.includes("ספר אהבה") && !rambamNote.includes("נושא:"));
	assert.ok(!rambamNote.includes("הלכות קריאת שמע"));
	const gemaraNote = mekorot.sourceNoteContent(berakhot, "מתני׳");
	assert.ok(gemaraNote.startsWith("# ברכות פרק א, דף ב עא\n"));
	assert.ok(!gemaraNote.includes("sefaria:"));

	// 8. The composed insertion points the reference at the source note in every
	// layout, and stays plain text when no link is given.
	const content = he(0x05e9, 0x05b8, 0x05dc, 0x05d5, 0x05dd);
	const location = "בראשית א:א";
	const style = { quoteFormat: true, quoteMarks: false, inlineReference: false };
	assert.equal(
		compose.composeInsertedText(content, location, style, { locationLink: link }),
		`> ${RLI}${content}${PDI}\n> — ${link}\n`
	);
	assert.equal(
		compose.composeInsertedText(content, location, { ...style, quoteFormat: false }, {
			locationLink: link,
		}),
		`${RLI}${content}${PDI}\n— ${link}\n`
	);
	const inline = compose.composeInsertedText(
		content,
		location,
		{ quoteFormat: false, quoteMarks: true, inlineReference: true },
		{ locationLink: link }
	);
	assert.equal(inline, `${RLI}"${content}"${PDI} (${link})`);
	const footnote = compose.composeInsert(
		content,
		location,
		{ quoteFormat: false, quoteMarks: false, inlineReference: false, footnoteReference: true, footnoteStyle: "inline" },
		{ locationLink: link }
	);
	assert.equal(footnote.text, `${RLI}${content}${PDI}^[${link}]`);
	const numbered = compose.composeInsert(
		content,
		location,
		{ quoteFormat: false, quoteMarks: false, inlineReference: false, footnoteReference: true, footnoteStyle: "numbered" },
		{ locationLink: link, footnoteId: "2" }
	);
	assert.equal(numbered.text, `${RLI}${content}${PDI}[^2]`);
	assert.equal(numbered.footnoteDefinition, `[^2]: ${link}`);
	// Without a link nothing changes.
	assert.equal(
		compose.composeInsertedText(content, location, style),
		`> ${RLI}${content}${PDI}\n> ${RLI}— ${location}${PDI}\n`
	);

	// 9. The whole library: one note per verse, amud and halacha, unique paths,
	// all of them inside the sources folder, and the spec paths present.
	const { files, tanakh, gemara, rambam, catalogues } = await library.buildLibrary();
	const BOOKS_BY_FOLDER = new Map(catalogues.books.map((book) => [book.folder, book]));
	const TRACTATES_BY_HE = new Map(catalogues.tractates.map((t) => [t.he, t]));
	const TOPICS_BY_HE = new Map(catalogues.topics.map((t) => [t.he, t]));
	assert.ok(tanakh > 23000 && tanakh < 24000, `tanakh count: ${tanakh}`);
	assert.ok(gemara > 5000 && gemara < 6000, `gemara count: ${gemara}`);
	assert.ok(rambam > 14000 && rambam < 16000, `rambam count: ${rambam}`);
	assert.equal(files.length, tanakh + gemara + rambam);

	const seen = new Set();
	for (const file of files) {
		assert.ok(file.path.startsWith("מקורות/"), file.path);
		assert.ok(file.path.endsWith(".md"), file.path);
		assert.ok(!seen.has(file.path), `duplicate path ${file.path}`);
		seen.add(file.path);
		assert.ok(file.content.startsWith("# "), `note must begin with a location heading: ${file.path}`);
		assert.ok(!file.content.includes("sefaria:"), `note must not contain Sefaria metadata: ${file.path}`);
	}

	assert.ok(seen.has("מקורות/תנך/בראשית/פרק א/א.md"));
	assert.ok(seen.has("מקורות/גמרא/ברכות/פרק א/ב עא.md"));
	assert.ok(seen.has("מקורות/רמבם/קריאת שמע/פרק א/א.md"));
	// The last verse of the Torah, and a daf well into Shabbat.
	assert.ok(seen.has("מקורות/תנך/דברים/פרק לד/יב.md"));
	assert.ok(seen.has("מקורות/גמרא/שבת/פרק כד/קנז עב.md"));

	// 10. Navigation never leaves its own book, masechet or section.
	const first = files.find((file) => file.path === "מקורות/רמבם/קריאת שמע/פרק א/א.md");
	assert.ok(!first.content.includes("הקודם"), "the first halacha has no previous one");
	assert.ok(first.content.includes("[[מקורות/רמבם/קריאת שמע/פרק א/ב|הבא"));
	const lastVerse = files.find((file) => file.path === "מקורות/תנך/בראשית/פרק א/א.md");
	assert.ok(!lastVerse.content.includes("הקודם"));
	const secondVerse = files.find((file) => file.path === "מקורות/תנך/בראשית/פרק א/ב.md");
	assert.ok(secondVerse.content.includes("[[מקורות/תנך/בראשית/פרק א/א|הקודם"));
	assert.ok(secondVerse.content.includes("[[מקורות/תנך/בראשית/פרק א/א|פרק א]]"));

	// 11. Writing into a vault: create what is missing, never touch what is there.
	const files1 = new Map();
	const folders = [];
	const writer = {
		exists: (path) => files1.has(path),
		mkdir: async (folder) => void folders.push(folder),
		create: async (path, content) => void files1.set(path, content),
	};
	const prepared = [
		{ source: bereshit, text: "א" },
		{ source: { ...bereshit, verse: 2 }, text: "ב" },
	];
	assert.equal(await mekorot.ensureSourceNotes(writer, prepared), 2);
	assert.equal(files1.get("מקורות/תנך/בראשית/פרק א/א.md").includes("# בראשית פרק א, פסוק א"), true);
	assert.deepEqual(folders, ["מקורות/תנך/בראשית/פרק א", "מקורות/תנך/בראשית/פרק א"]);
	// A second pass writes nothing new and does not overwrite what is there.
	files1.set("מקורות/תנך/בראשית/פרק א/ב.md", "הערות שלי");
	assert.equal(await mekorot.ensureSourceNotes(writer, prepared), 0);
	assert.equal(files1.get("מקורות/תנך/בראשית/פרק א/ב.md"), "הערות שלי");
	// A custom folder is honoured, and a messy one is cleaned up.
	assert.equal(mekorot.normalizeFolder("  /מקורות//חדש/  "), "מקורות/חדש");
	assert.equal(mekorot.normalizeFolder("   "), "מקורות");
	assert.equal(mekorot.normalizeFolder("מקורות//חדש/"), "מקורות/חדש");
	// The link and the note written for the same setting must agree.
	const messy = new Map();
	await mekorot.ensureSourceNotes(
		{ exists: (p) => messy.has(p), mkdir: async () => {}, create: async (p, c) => void messy.set(p, c) },
		prepared,
		"  /מקורות//חדש/ "
	);
	assert.deepEqual([...messy.keys()], [
		"מקורות/חדש/תנך/בראשית/פרק א/א.md",
		"מקורות/חדש/תנך/בראשית/פרק א/ב.md",
	]);
	assert.ok(messy.has(mekorot.sourceLink(bereshit, "בראשית", "  /מקורות//חדש/ ").slice(2).split("|")[0] + ".md"));
	const custom = new Map();
	await mekorot.ensureSourceNotes(
		{ exists: (p) => custom.has(p), mkdir: async () => {}, create: async (p, c) => void custom.set(p, c) },
		prepared,
		"Sources"
	);
	assert.deepEqual([...custom.keys()], ["Sources/תנך/בראשית/פרק א/א.md", "Sources/תנך/בראשית/פרק א/ב.md"]);

	// 12. Every note in the library is reachable by rebuilding its own source:
	// the plugin asks for a path from a reference, the builder asks for one from
	// the corpus, and the two must agree or citations end up dangling.
	const hebrewToNumber = (letters) => {
		const ones = { "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9 };
		const tens = { "י": 10, "כ": 20, "ל": 30, "מ": 40, "נ": 50, "ס": 60, "ע": 70, "פ": 80, "צ": 90 };
		const hundreds = { "ק": 100, "ר": 200, "ש": 300, "ת": 400 };
		if (letters === "טו") return 15;
		if (letters === "טז") return 16;
		let total = 0;
		for (const letter of letters) {
			total += hundreds[letter] ?? tens[letter] ?? ones[letter] ?? 0;
		}
		return total;
	};
	let roundTripped = 0;
	for (const file of files) {
		const parts = file.path.slice(0, -3).split("/");
		const [, collection, work, perek, name] = parts;
		const chapter = hebrewToNumber(perek.split(" ")[1]);
		let rebuilt;
		if (collection === "תנך") {
			const book = BOOKS_BY_FOLDER.get(work);
			assert.ok(book, `unknown book folder ${work}`);
			rebuilt = mekorot.sourceFilePath({
				kind: "tanakh",
				bookKey: book.key,
				bookHe: book.he,
				chapter,
				verse: hebrewToNumber(name),
			});
		} else if (collection === "גמרא") {
			const tractate = TRACTATES_BY_HE.get(work);
			assert.ok(tractate, `unknown tractate folder ${work}`);
			const [dafLetters, amudLetter] = name.split(" ");
			const daf = hebrewToNumber(dafLetters);
			const amud = amudLetter.endsWith("א") ? "a" : "b";
			// The plugin computes the perek with perekForDaf; the library must
			// have filed this amud under exactly that perek.
			assert.equal(
				mekorot.perekForDaf(tractate.name, daf, amud),
				chapter,
				`${work} ${name} filed under the wrong perek`
			);
			rebuilt = mekorot.sourceFilePath({
				kind: "gemara",
				tractateName: tractate.name,
				tractateHe: tractate.he,
				perek: chapter,
				daf,
				amud,
			});
		} else {
			const topic = TOPICS_BY_HE.get(work);
			assert.ok(topic, `unknown Rambam section folder ${work}`);
			rebuilt = mekorot.sourceFilePath({
				kind: "rambam",
				topicName: topic.name,
				topicHe: topic.he,
				bookHe: topic.bookHe,
				chapter,
				halacha: hebrewToNumber(name),
			});
		}
		assert.equal(rebuilt, file.path);
		roundTripped++;
	}
	assert.equal(roundTripped, files.length);

	// 13. Every perek of every masechet is in the table, numbered from 1 and
	// strictly increasing in daf order.
	for (const [tractate, list] of Object.entries(perakim.GEMARA_PERAKIM)) {
		assert.ok(list.length >= 3, `${tractate} has too few perakim`);
		let previous = 0;
		list.forEach((entry, index) => {
			assert.equal(entry.perek, index + 1, `${tractate} perek numbering`);
			const [daf, amud] = /^([ab]?)(\d+)([ab])$/.exec(entry.daf) ?? [];
			const match = /^(\d+)([ab])$/.exec(entry.daf);
			assert.ok(match, `${tractate} bad daf ${entry.daf}`);
			const value = mekorot.dafValue(Number(match[1]), match[2]);
			assert.ok(value > previous, `${tractate} perakim out of order at ${entry.daf}`);
			previous = value;
		});
	}
	assert.equal(
		Object.values(perakim.GEMARA_PERAKIM).reduce((sum, list) => sum + list.length, 0),
		313,
		"the Bavli has 313 perakim"
	);

	// 14. The ZIP writer round-trips, including Hebrew file names.
	const zip = createZip([
		{ name: "מקורות/תנך/בראשית/פרק א/א.md", data: "# בראשית\nבְּרֵאשִׁית\n" },
		{ name: "מקורות/גמרא/ברכות/פרק א/ב עא.md", data: "x".repeat(4096) },
	]);
	const names = [];
	let cursor = 0;
	const decoder = new TextDecoder();
	while (cursor + 4 <= zip.length && zip.readUInt32LE(cursor) === 0x04034b50) {
		const method = zip.readUInt16LE(cursor + 8);
		const compressed = zip.readUInt32LE(cursor + 18);
		const nameLength = zip.readUInt16LE(cursor + 26);
		const extraLength = zip.readUInt16LE(cursor + 28);
		const name = decoder.decode(zip.subarray(cursor + 30, cursor + 30 + nameLength));
		const body = zip.subarray(cursor + 30 + nameLength + extraLength, cursor + 30 + nameLength + extraLength + compressed);
		const text = method === 8 ? gunzipSyncRaw(body) : body.toString("utf8");
		names.push([name, text]);
		cursor += 30 + nameLength + extraLength + compressed;
	}
	assert.equal(names.length, 2);
	assert.equal(names[0][0], "מקורות/תנך/בראשית/פרק א/א.md");
	assert.equal(names[0][1], "# בראשית\nבְּרֵאשִׁית\n");
	assert.equal(names[1][1].length, 4096);
	assert.equal(zip.readUInt32LE(cursor), 0x02014b50, "the central directory must follow the entries");

	console.log(
		`PASS Atomic source library: ${files.length} notes (תנ״ך ${tanakh}, גמרא ${gemara}, רמב״ם ${rambam}).`
	);
} finally {
	rmSync(temporaryDirectory, { recursive: true, force: true });
}
