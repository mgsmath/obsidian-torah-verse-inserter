// Generates the whole מקורות library: one note per verse, per amud, per halacha.
//
// Imported only by tools/build-library.mjs (bundled with esbuild and run under
// Node), never by the plugin itself — but it lives in src/ and uses the same
// builders as the plugin so the archive it produces and the notes the plugin
// writes on demand can never drift apart.
import { BOOKS } from "./books";
import { bookShape, loadBook } from "./corpus";
import { GEMARA_GZ, RAMBAM_GZ } from "./study-corpus";
import { GEMARA_TRACTATES, RAMBAM_BOOKS, collectText, decodeBundledText } from "./study";
import { formatHebrew } from "./hebrew";
import {
	DEFAULT_SOURCES_FOLDER,
	GemaraSource,
	bookFolderName,
	RambamSource,
	Source,
	TanakhSource,
	perekFolderName,
	perekForDaf,
	sourceFilePath,
	sourceLabel,
	sourceNoteContent,
	sourcePath,
} from "./mekorot";

export interface LibraryFile {
	/** Vault-relative path, including the `.md` extension. */
	path: string;
	content: string;
}

interface LibraryItem {
	source: Source;
	text: string;
}

/** The library keeps the text as complete as the corpus has it. */
const FULL_TEXT = { nikud: true, teamim: true, fontCompat: true };

function segmentsOf(value: unknown): string[] {
	const out: string[] = [];
	collectText(value, out);
	return out.map((segment) => formatHebrew(segment, FULL_TEXT)).filter(Boolean);
}

/** Tanakh sources, one group per book so navigation never leaves the book. */
function tanakhItems(): LibraryItem[][] {
	const groups: LibraryItem[][] = [];
	for (const book of BOOKS) {
		const shape = bookShape(book.key);
		if (!shape) continue;
		// Loaded synchronously from the module cache; build-corpus has run by now.
		const chapters = cachedBook(book.key);
		if (!chapters) continue;
		const items: LibraryItem[] = [];
		for (let chapter = 0; chapter < chapters.length; chapter++) {
			const verses: string[] = chapters[chapter] ?? [];
			for (let verse = 0; verse < verses.length; verse++) {
				const source: TanakhSource = {
					kind: "tanakh",
					bookKey: book.key,
					bookHe: book.he,
					chapter: chapter + 1,
					verse: verse + 1,
				};
				items.push({ source, text: formatHebrew(verses[verse], FULL_TEXT) });
			}
		}
		if (items.length) groups.push(items);
	}
	return groups;
}

// loadBook is async (it decompresses), but the library builder is the only
// caller and it wants the whole Tanakh at once, so warm the cache up front.
let warmed: Map<string, string[][]> | null = null;
async function warmTanakh(): Promise<Map<string, string[][]>> {
	if (warmed) return warmed;
	warmed = new Map();
	for (const book of BOOKS) {
		if (!bookShape(book.key)) continue;
		warmed.set(book.key, await loadBook(book.key));
	}
	return warmed;
}

function cachedBook(key: string): string[][] | null {
	return warmed?.get(key) ?? null;
}

/** Gemara sources, one group per masechet. */
async function gemaraItems(): Promise<LibraryItem[][]> {
	const groups: LibraryItem[][] = [];
	for (const tractate of GEMARA_TRACTATES) {
		const encoded = GEMARA_GZ[tractate.name];
		if (!encoded) continue;
		const items: LibraryItem[] = [];
		const pages = (await decodeBundledText(encoded)) as unknown[];
		if (!Array.isArray(pages)) continue;
		for (let index = 2; index < pages.length; index++) {
			const text = segmentsOf(pages[index]).join("\n");
			if (!text) continue;
			const daf = Math.floor((index + 2) / 2);
			const amud: "a" | "b" = index % 2 === 0 ? "a" : "b";
			const source: GemaraSource = {
				kind: "gemara",
				tractateName: tractate.name,
				tractateHe: tractate.heName,
				perek: perekForDaf(tractate.name, daf, amud),
				daf,
				amud,
			};
			items.push({ source, text });
		}
		if (items.length) groups.push(items);
	}
	return groups;
}

/** Rambam sources, one group per section of the Mishneh Torah. */
async function rambamItems(): Promise<LibraryItem[][]> {
	const groups: LibraryItem[][] = [];
	for (const book of RAMBAM_BOOKS) {
		for (const topic of book.topics) {
			const encoded = RAMBAM_GZ[topic.name];
			if (!encoded) continue;
			const items: LibraryItem[] = [];
			const chapters = (await decodeBundledText(encoded)) as unknown[];
			if (!Array.isArray(chapters)) continue;
			for (let chapter = 0; chapter < chapters.length; chapter++) {
				const halachot = chapters[chapter];
				if (!Array.isArray(halachot)) continue;
				for (let halacha = 0; halacha < halachot.length; halacha++) {
					const text = segmentsOf(halachot[halacha]).join("\n");
					if (!text) continue;
					const source: RambamSource = {
						kind: "rambam",
						topicName: topic.name,
						topicHe: topic.heName,
						bookHe: book.heName,
						chapter: chapter + 1,
						halacha: halacha + 1,
					};
					items.push({ source, text });
				}
			}
			if (items.length) groups.push(items);
		}
	}
	return groups;
}

/** Key of the perek a source sits in, used to build the "up" navigation link. */
function perekKey(source: Source): string {
	return source.kind === "gemara" ? String(source.perek) : String(source.chapter);
}

function perekOf(source: Source): number {
	return source.kind === "gemara" ? source.perek : source.chapter;
}

/**
 * Turn an ordered list of sources into notes, linking each one to the source
 * before and after it and to the first source of its own perek.
 */
function renderItems(items: LibraryItem[], root: string): LibraryFile[] {
	return items.map((item, index) => {
		const neighbour = (at: number) => {
			const other = items[at];
			if (!other) return undefined;
			return { path: sourcePath(other.source, root), label: sourceLabel(other.source) };
		};
		const upIndex = items.findIndex((candidate) => perekKey(candidate.source) === perekKey(item.source));
		const up = upIndex !== -1 && upIndex !== index ? neighbour(upIndex) : undefined;
		return {
			path: sourceFilePath(item.source, root),
			content: sourceNoteContent(item.source, item.text, {
				prev: neighbour(index - 1),
				next: neighbour(index + 1),
				up: up ? { ...up, label: perekFolderName(perekOf(item.source)) } : undefined,
			}),
		};
	});
}

export interface LibrarySummary {
	files: LibraryFile[];
	tanakh: number;
	gemara: number;
	rambam: number;
	/** The Hebrew names the folders were built from, so callers can check them. */
	catalogues: {
		books: Array<{ key: string; he: string; folder: string }>;
		tractates: Array<{ name: string; he: string }>;
		topics: Array<{ name: string; he: string; bookHe: string }>;
	};
}

function flatten(groups: LibraryItem[][], root: string): LibraryFile[] {
	return groups.flatMap((group) => renderItems(group, root));
}

function count(groups: LibraryItem[][]): number {
	return groups.reduce((sum, group) => sum + group.length, 0);
}

/** Every note of the library, in reading order. */
export async function buildLibrary(root: string = DEFAULT_SOURCES_FOLDER): Promise<LibrarySummary> {
	await warmTanakh();
	const tanakh = tanakhItems();
	const gemara = await gemaraItems();
	const rambam = await rambamItems();
	return {
		files: [...flatten(tanakh, root), ...flatten(gemara, root), ...flatten(rambam, root)],
		tanakh: count(tanakh),
		gemara: count(gemara),
		rambam: count(rambam),
		catalogues: {
			books: BOOKS.map((book) => ({ key: book.key, he: book.he, folder: bookFolderName(book.he) })),
			tractates: GEMARA_TRACTATES.map((tractate) => ({ name: tractate.name, he: tractate.heName })),
			topics: RAMBAM_BOOKS.flatMap((book) =>
				book.topics.map((topic) => ({ name: topic.name, he: topic.heName, bookHe: book.heName }))
			),
		},
	};
}
