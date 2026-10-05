// Download public source editions during corpus maintenance only; this is never
// imported by the Obsidian plugin. Run: npm run fetch-study-corpus
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, "tools", "study-cache");
const INDEX_URL = "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/books.json";
const RAMBAM_VERSION = "merged";
const RAMBAM_VERSION_OVERRIDES = {
	// The historical merged text includes a small outside contribution with no
	// license recorded; prefer the complete Wikisource version for this section.
	"Prayer and the Priestly Blessing": "Wikisource Mishneh Torah",
};
const APPROVED_RAMABAM_SOURCES = new Set(["Torat Emet 363", "Wikisource Mishneh Torah"]);
const GEMARA_VERSION = "Wikisource Talmud Bavli";
const CONCURRENCY = 4;

function declaration(name) {
	const source = awaitlessReadStudySource();
	const start = source.indexOf(`export const ${name}:`);
	if (start === -1) throw new Error(`Could not find ${name} in src/study.ts`);
	const end = source.indexOf("\n];", start);
	if (end === -1) throw new Error(`Could not find the end of ${name} in src/study.ts`);
	return source.slice(start, end + 3);
}

// Keep catalog extraction in sync with the runtime study.ts catalog without
// duplicating all 121 names in this download tool.
let studySource;
function awaitlessReadStudySource() {
	if (studySource === undefined) {
		studySource = readFileSync(join(ROOT, "src", "study.ts"), "utf8");
	}
	return studySource;
}

function namesFrom(pattern, text, description) {
	const names = [...text.matchAll(pattern)].map((match) => match[1]);
	if (names.length === 0) throw new Error(`No ${description} found in src/study.ts`);
	return names;
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

async function getJson(url, description) {
	let lastError;
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			const response = await fetch(url, { headers: { "User-Agent": "Torah-Verse-Inserter corpus builder" } });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			return await response.json();
		} catch (error) {
			lastError = error;
			if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 500));
		}
	}
	throw new Error(`Could not download ${description}: ${lastError?.message ?? lastError}`);
}

function chooseVersion(books, title, language, preferredVersions, categoryTest) {
	const candidates = books.filter(
		(book) =>
			book.title === title &&
			book.language === language &&
			Array.isArray(book.categories) &&
			categoryTest(book.categories)
	);
	for (const preferred of preferredVersions) {
		const match = candidates.find((book) => book.versionTitle === preferred && book.json_url);
		if (match) return match;
	}
	throw new Error(`No approved Hebrew source version found for ${title}`);
}

const index = await getJson(INDEX_URL, "Sefaria Export books.json");
if (!Array.isArray(index.books)) throw new Error("Sefaria Export index has no books array");

const jobs = [
	...rambamTopics.map((topic) => {
		const title = `Mishneh Torah, ${topic}`;
		const version = RAMBAM_VERSION_OVERRIDES[topic] ?? RAMBAM_VERSION;
		const entry = chooseVersion(
			index.books,
			title,
			"Hebrew",
			[version],
			(categories) => categories.includes("Halakhah") && categories.includes("Mishneh Torah")
		);
		return { mode: "rambam", name: topic, title, entry };
	}),
	...gemaraTractates.map((name) => {
		const entry = chooseVersion(
			index.books,
			name,
			"Hebrew",
			[GEMARA_VERSION],
			(categories) => categories.includes("Talmud") && categories.includes("Bavli")
		);
		return { mode: "gemara", name, title: name, entry };
	}),
];

for (const mode of ["rambam", "gemara"]) mkdirSync(join(CACHE_DIR, mode), { recursive: true });

const sourceManifest = {
	generatedAt: new Date().toISOString(),
	booksIndex: INDEX_URL,
	booksIndexGeneratedAt: index.generated_at ?? "not provided",
	rambamVersionPolicy: "Sefaria merged Hebrew text; Prayer and the Priestly Blessing uses the direct Wikisource edition. Only Torat Emet 363 and Wikisource Mishneh Torah source versions are accepted.",
	gemaraVersion: GEMARA_VERSION,
	items: [],
};

let cursor = 0;
async function worker() {
	while (cursor < jobs.length) {
		const job = jobs[cursor++];
		const url = job.entry.json_url;
		const data = await getJson(url, `${job.mode} ${job.name}`);
		if (!Array.isArray(data.text) || !data.text.length) {
			throw new Error(`Source file for ${job.name} contains no text array`);
		}
		const versionTitle = data.versionTitle ?? job.entry.versionTitle;
		const versions = data.versions ?? [[versionTitle, data.versionSource ?? ""]];
		const sourceNames = versions.map((version) =>
			Array.isArray(version) ? version[0] : typeof version === "string" ? version : version.versionTitle
		);
		if (job.mode === "rambam") {
			const unapproved = sourceNames.filter((name) => !APPROVED_RAMABAM_SOURCES.has(name));
			if (unapproved.length || sourceNames.length === 0) {
				throw new Error(
					`Unreviewed source version(s) for ${job.name}: ${unapproved.join(", ") || "none recorded"}`
				);
			}
		}
		const versionSource = data.versionSource ?? job.entry.txt_url ?? "";
		const licenses =
			job.mode === "gemara"
				? ["CC BY-SA (Wikisource Talmud Bavli)"]
				: [...new Set(sourceNames.map((name) =>
						name === "Torat Emet 363"
							? "Public Domain (Sefaria source metadata)"
							: "CC BY-SA (Wikisource)"
					))];
		const file = join(CACHE_DIR, job.mode, `${slug(job.name)}.json`);
		writeFileSync(
			file,
			`${JSON.stringify({ text: data.text, versionTitle, versionSource, versions })}\n`
		);
		sourceManifest.items.push({
			mode: job.mode,
			name: job.name,
			versionTitle,
			versionSource,
			versions,
			licenses,
			jsonUrl: url,
		});
		console.log(`Downloaded ${job.mode.padEnd(6)} ${job.name} (${job.entry.versionTitle})`);
	}
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, () => worker()));
sourceManifest.items.sort((a, b) => `${a.mode}:${a.name}`.localeCompare(`${b.mode}:${b.name}`));
writeFileSync(join(CACHE_DIR, "manifest.json"), `${JSON.stringify(sourceManifest, null, 2)}\n`);
console.log(`\n✅ Downloaded ${jobs.length} text files into tools/study-cache/ (build-time only).`);
