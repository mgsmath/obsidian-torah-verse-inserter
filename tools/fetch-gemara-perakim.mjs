// Build the perek table of the Babylonian Talmud: which daf each perek starts on.
//
// The bundled Bavli corpus is organised by daf only, so the library needs an
// external table saying where every perek begins. Sefaria publishes a small CSV
// that carries exactly that:
//
//   data/Mishnah Map.csv – every mishnah of the 37 tractates with the daf/line
//                          of the Bavli that discusses it. The first daf of a
//                          chapter's first mishnah is the daf its perek opens on.
//
// The chapter numbers in that file are *Mishnah* chapter numbers and the printed
// masechet does not always follow them (Menachot prints "רבי ישמעאל" at 63b
// although the Mishnah counts it as chapter 10; Sanhedrin prints "חלק" last).
// This tool therefore renumbers the perakim by daf order — the order they appear
// in the printed masechet — which is the order the folder hierarchy needs.
//
// The result is cross-checked against the bundled text itself: every perek ends
// with "הדרן עלך …" followed by the next perek's mishnah, and wherever the
// Wikisource text kept that paragraph the boundary it marks must appear in the
// table. The build fails if it does not.
//
// Perek names are deliberately not bundled: Sefaria's other CSV
// (perek_names.csv) numbers chapters differently from Mishnah Map.csv, so the
// two cannot be joined reliably.
//
// Maintainer tool only; never imported by the plugin.
// Run: npm run fetch-gemara-perakim
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, "tools", "perakim-cache");
const OUTPUT = join(ROOT, "src", "gemara-perakim.ts");
const SOURCE_CSV = "data/Mishnah Map.csv";
const CACHE_FILE = "mishnah-map.csv";
const REPO = "Sefaria/Sefaria-Project";

/** 2a -> 2, 2b -> 3, 3a -> 4 … (the bundled corpus is indexed the same way). */
function dafValue(daf) {
	const match = /^(\d{1,3})([ab])$/.exec(String(daf).trim().toLowerCase());
	if (!match) return NaN;
	return Number(match[1]) * 2 - (match[2] === "a" ? 2 : 1);
}

function valueToDaf(value) {
	return `${Math.floor((value + 2) / 2)}${value % 2 === 0 ? "a" : "b"}`;
}

async function readCsv() {
	const cachePath = join(CACHE_DIR, CACHE_FILE);
	if (existsSync(cachePath)) return readFileSync(cachePath, "utf8");
	mkdirSync(CACHE_DIR, { recursive: true });
	const url = `https://raw.githubusercontent.com/${REPO}/master/${SOURCE_CSV.replace(/ /g, "%20")}`;
	const response = await fetch(url, { headers: { "User-Agent": "Torah-Verse-Inserter perakim builder" } });
	if (!response.ok) throw new Error(`Could not download ${url}: HTTP ${response.status}`);
	const text = await response.text();
	writeFileSync(cachePath, text);
	return text;
}

function collectText(value, out) {
	if (typeof value === "string") {
		const text = value.trim();
		if (text) out.push(text);
		return;
	}
	if (Array.isArray(value)) for (const child of value) collectText(child, out);
}

/** Decompress the bundled Bavli corpus so the table can be checked against it. */
function bundledGemara() {
	const source = readFileSync(join(ROOT, "src", "study-corpus.ts"), "utf8");
	const start = source.indexOf("export const GEMARA_GZ");
	const end = source.indexOf("\n};", start);
	const corpus = new Map();
	for (const match of source.slice(start, end).matchAll(/^\t"([^"]+)": "([^"]+)"/gm)) {
		corpus.set(match[1], JSON.parse(gunzipSync(Buffer.from(match[2], "base64")).toString("utf8")));
	}
	return corpus;
}

/**
 * Every amud where the text keeps the "הדרן עלך …" that closes a perek and the
 * mishnah that opens the next one — an independent record of the boundary.
 */
function hadranBoundaries(pages) {
	const found = [];
	for (let index = 2; index < pages.length; index++) {
		const segments = [];
		collectText(pages[index] ?? [], segments);
		for (let line = 0; line < segments.length; line++) {
			if (!segments[line].startsWith("הדרן עלך")) continue;
			const next = segments.slice(line + 1, line + 6).find((text) => /^מתני/.test(text));
			if (next) found.push(index);
		}
	}
	return found;
}

const csv = await readCsv();
const corpus = bundledGemara();

// tractate -> mishnah chapter -> every daf where one of its mishnayot appears.
const chapters = new Map();
for (const line of csv.trim().split(/\r?\n/).slice(1)) {
	const [book, chapter, , , startDaf] = line.split(",");
	const tractate = book.replace(/^Mishnah\s+/, "").trim();
	const value = dafValue(startDaf);
	if (!tractate || !Number.isInteger(Number(chapter)) || Number.isNaN(value)) continue;
	if (!chapters.has(tractate)) chapters.set(tractate, new Map());
	const perChapter = chapters.get(tractate);
	const key = Number(chapter);
	perChapter.set(key, [...(perChapter.get(key) ?? []), value]);
}

const tractateNames = [...corpus.keys()].sort();
const missing = tractateNames.filter((tractate) => !chapters.has(tractate));
if (missing.length) throw new Error(`No perek data for: ${missing.join(", ")}`);

const table = {};
let total = 0;
let checked = 0;
const problems = [];

for (const tractate of tractateNames) {
	const units = [...chapters.get(tractate).entries()]
		.map(([mishnahChapter, values]) => ({ mishnahChapter, value: Math.min(...values) }))
		.sort((a, b) => a.value - b.value);
	const values = units.map((unit) => unit.value);
	const start = valueToDaf(values[0]);
	// Every masechet opens on daf 2a except Tamid, which shares its volume with
	// Meilah and therefore begins on 25b.
	if (start !== "2a" && tractate !== "Tamid") {
		throw new Error(`${tractate} does not start on daf 2a (got ${start})`);
	}
	for (const boundary of hadranBoundaries(corpus.get(tractate))) {
		if (values.includes(boundary)) checked++;
		else problems.push(`${tractate} ${valueToDaf(boundary)}`);
	}
	table[tractate] = units.map((unit, index) => ({ perek: index + 1, daf: valueToDaf(unit.value) }));
	total += units.length;
}

if (problems.length) {
	throw new Error(
		`The bundled text marks perek boundaries that the table is missing: ${problems.join(", ")}`
	);
}

const entries = tractateNames.map((tractate) => {
	const list = table[tractate]
		.map((unit) => `\t\t{ perek: ${unit.perek}, daf: "${unit.daf}" },`)
		.join("\n");
	return `\t${JSON.stringify(tractate)}: [\n${list}\n\t],`;
});

writeFileSync(
	OUTPUT,
	`// GENERATED FILE — do not edit by hand. Run: npm run fetch-gemara-perakim
// Where every perek of the Babylonian Talmud begins, in the order the perakim
// are printed in the masechet (which is not always the Mishnah's chapter order).
//
// Derived from Sefaria's "Mishnah Map.csv" in github.com/Sefaria/Sefaria-Project,
// cached at tools/perakim-cache/mishnah-map.csv, and cross-checked against the
// bundled text: ${total} perakim across ${tractateNames.length} tractates, ${checked} of
// the boundaries also confirmed by a "הדרן עלך" marker in the text itself.

export interface GemaraPerek {
	perek: number;
	daf: string;
}

/** tractate -> its perakim in printed order, each with the daf it opens on. */
export const GEMARA_PERAKIM: Record<string, GemaraPerek[]> = {
${entries.join("\n")}
};
`
);

console.log(`✅ ${tractateNames.length} tractates, ${total} perakim → src/gemara-perakim.ts`);
console.log(`   ${checked} boundaries confirmed by a הדרן marker in the bundled text`);
