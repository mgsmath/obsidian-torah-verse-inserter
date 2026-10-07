// Atomic source files: one note per verse, per amud, per halacha.
//
// The plugin used to paste the whole source text into the note it inserted
// into. It still inserts the text, but the canonical copy now lives in its own
// note inside a מקורות folder in the vault, and every inserted reference links
// to that note. Everything in this file is pure — no Obsidian imports — so the
// same builders generate the vault library (tools/build-library.mjs), the note
// links (modal.ts) and the on-demand files (mekorot-vault.ts).
import { sefariaRef } from "./books";
import { consonantal, isolateIfRtl, toHebrewNumber } from "./hebrew";
import { GEMARA_PERAKIM } from "./gemara-perakim";

/** Folder the whole library lives in, relative to the vault root. */
export const DEFAULT_SOURCES_FOLDER = "מקורות";

/** Second-level folders, one per collection. */
export const SOURCE_FOLDERS = {
	tanakh: "תנך",
	gemara: "גמרא",
	rambam: "רמבם",
} as const;

/** Chapter folders are `פרק א`, `פרק ב`, … */
export const PEREK_FOLDER = "פרק";

export type SourceKind = keyof typeof SOURCE_FOLDERS;

export interface TanakhSource {
	kind: "tanakh";
	/** Corpus key, also used to build the Sefaria reference. */
	bookKey: string;
	/** Hebrew book name as it is cited (may carry nikud). */
	bookHe: string;
	chapter: number;
	verse: number;
}

export interface GemaraSource {
	kind: "gemara";
	/** English tractate name, the key of the bundled corpus. */
	tractateName: string;
	tractateHe: string;
	perek: number;
	daf: number;
	amud: "a" | "b";
}

export interface RambamSource {
	kind: "rambam";
	/** English section name, the key of the bundled corpus. */
	topicName: string;
	topicHe: string;
	/** The Sefer this section belongs to, e.g. ספר אהבה. */
	bookHe: string;
	chapter: number;
	halacha: number;
}

export type Source = TanakhSource | GemaraSource | RambamSource;

/** A link to another file in the library, used for the prev/next navigation. */
export interface SourceNavTarget {
	path: string;
	label: string;
}

export interface SourceNav {
	prev?: SourceNavTarget;
	next?: SourceNavTarget;
	/** First file of the same perek — a way back up from any verse or amud. */
	up?: SourceNavTarget;
}

// ---------------------------------------------------------------------------
// Hebrew names and numbers
// ---------------------------------------------------------------------------

/** Folder name of a Tanakh book: its Hebrew name without nikud. */
export function bookFolderName(heName: string): string {
	return consonantal(heName);
}

/** `פרק א`, `פרק ב`, `פרק כג` … */
export function perekFolderName(chapter: number): string {
	return `${PEREK_FOLDER} ${toHebrewNumber(chapter)}`;
}

/** Amud file name: `ב עא` for daf 2a, `ב עב` for daf 2b. */
export function amudFileName(daf: number, amud: "a" | "b"): string {
	return `${toHebrewNumber(daf)} ע${amud === "a" ? "א" : "ב"}`;
}

/** 2a -> 2, 2b -> 3, 3a -> 4 … (the bundled corpus is indexed the same way). */
export function dafValue(daf: number, amud: "a" | "b"): number {
	return daf * 2 - (amud === "a" ? 2 : 1);
}

/** The perek a daf belongs to: the last perek that opens on or before it. */
export function perekForDaf(tractateName: string, daf: number, amud: "a" | "b"): number {
	const perakim = GEMARA_PERAKIM[tractateName];
	if (!perakim?.length) return 1;
	const value = dafValue(daf, amud);
	let perek = perakim[0].perek;
	for (const candidate of perakim) {
		const [number, side] = /^(\d+)([ab])$/.exec(candidate.daf)?.slice(1) ?? [];
		if (!number) continue;
		if (dafValue(Number(number), side as "a" | "b") <= value) perek = candidate.perek;
	}
	return perek;
}

/** First daf of a perek, for the "up" navigation link. */
export function perekFirstDaf(tractateName: string, perek: number): { daf: number; amud: "a" | "b" } | null {
	const entry = GEMARA_PERAKIM[tractateName]?.find((candidate) => candidate.perek === perek);
	const match = entry ? /^(\d+)([ab])$/.exec(entry.daf) : null;
	if (!match) return null;
	return { daf: Number(match[1]), amud: match[2] as "a" | "b" };
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** File name without the `.md` extension. */
export function sourceBaseName(source: Source): string {
	switch (source.kind) {
		case "tanakh":
			return toHebrewNumber(source.verse);
		case "gemara":
			return amudFileName(source.daf, source.amud);
		case "rambam":
			return toHebrewNumber(source.halacha);
	}
}

/**
 * Vault-relative path of a source note, without the extension.
 *   מקורות/תנך/בראשית/פרק א/א
 *   מקורות/גמרא/ברכות/פרק א/ב עא
 *   מקורות/רמבם/קריאת שמע/פרק א/א
 */
export function sourcePath(source: Source, root: string = DEFAULT_SOURCES_FOLDER): string {
	const collection = SOURCE_FOLDERS[source.kind];
	switch (source.kind) {
		case "tanakh":
			return [root, collection, bookFolderName(source.bookHe), perekFolderName(source.chapter), sourceBaseName(source)].join("/");
		case "gemara":
			return [root, collection, source.tractateHe, perekFolderName(source.perek), sourceBaseName(source)].join("/");
		case "rambam":
			return [root, collection, source.topicHe, perekFolderName(source.chapter), sourceBaseName(source)].join("/");
	}
}

/** Same path with the `.md` extension — what the vault API wants. */
export function sourceFilePath(source: Source, root: string = DEFAULT_SOURCES_FOLDER): string {
	return `${sourcePath(source, root)}.md`;
}

/**
 * Wikilink to a source note.
 *
 * Only the visible label is wrapped in an RTL isolate: the `[[` and `]]` have to
 * stay outside it, otherwise Obsidian's parser sees invisible characters where
 * the link brackets belong and the citation is inserted as plain text.
 */
export function sourceLink(source: Source, label: string, root: string = DEFAULT_SOURCES_FOLDER): string {
	const path = sourcePath(source, root);
	return `[[${path}|${isolateIfRtl(label)}]]`;
}

/** Wikilink built from an already-computed path (used for navigation). */
export function linkTo(target: SourceNavTarget): string {
	return `[[${target.path}|${target.label}]]`;
}

// ---------------------------------------------------------------------------
// Note content
// ---------------------------------------------------------------------------

function yamlValue(value: string | number): string {
	return JSON.stringify(String(value));
}

function frontmatter(fields: Array<[string, string | number | undefined]>): string {
	const rows = fields
		.filter((field): field is [string, string | number] => field[1] !== undefined && field[1] !== "")
		.map(([key, value]) => `${key}: ${yamlValue(value)}`);
	return `---\n${rows.join("\n")}\n---\n`;
}

/** The citation this source is known by, in Hebrew — also the link label. */
export function sourceLabel(source: Source): string {
	switch (source.kind) {
		case "tanakh":
			return `${source.bookHe} ${toHebrewNumber(source.chapter)}:${toHebrewNumber(source.verse)}`;
		case "gemara":
			return `${source.tractateHe} ${toHebrewNumber(source.daf)}${source.amud === "a" ? "." : ":"}`;
		case "rambam":
			return `רמב״ם:${source.topicHe} ${toHebrewNumber(source.chapter)}:${toHebrewNumber(source.halacha)}`;
	}
}

/** Sefaria reference, kept in the frontmatter so the note stays traceable. */
export function sourceSefariaRef(source: Source): string {
	switch (source.kind) {
		case "tanakh":
			return `${sefariaRef({ key: source.bookKey })}.${source.chapter}.${source.verse}`;
		case "gemara":
			return `${source.tractateName}.${source.daf}${source.amud}`;
		case "rambam":
			return `Mishneh Torah, ${source.topicName}.${source.chapter}.${source.halacha}`;
	}
}

function headingFor(source: Source): string {
	switch (source.kind) {
		case "tanakh":
			return `${bookFolderName(source.bookHe)} ${perekFolderName(source.chapter)}, פסוק ${toHebrewNumber(source.verse)}`;
		case "gemara":
			return `${source.tractateHe} ${perekFolderName(source.perek)}, דף ${amudFileName(source.daf, source.amud)}`;
		case "rambam":
			return `רמב״ם ${source.topicHe} ${perekFolderName(source.chapter)}, הלכה ${toHebrewNumber(source.halacha)}`;
	}
}

function navFooter(nav: SourceNav): string {
	const links = [
		nav.prev ? linkTo({ ...nav.prev, label: `הקודם — ${nav.prev.label}` }) : "",
		nav.up ? linkTo({ ...nav.up, label: nav.up.label }) : "",
		nav.next ? linkTo({ ...nav.next, label: `הבא — ${nav.next.label}` }) : "",
	].filter(Boolean);
	return links.length ? `---\n\n${links.join(" · ")}\n` : "";
}

/**
 * Full contents of one source note: frontmatter, a Hebrew heading, the text
 * itself and the prev/next navigation. `text` may span several lines; Gemara
 * and Rambam keep one line per segment so the note stays readable.
 */
export function sourceNoteContent(source: Source, text: string, nav: SourceNav = {}): string {
	const fields: Array<[string, string | number | undefined]> = [["סוג", "מקור"]];
	switch (source.kind) {
		case "tanakh":
			fields.push(
				["מקור", "תנ״ך"],
				["ספר", bookFolderName(source.bookHe)],
				["פרק", toHebrewNumber(source.chapter)],
				["פסוק", toHebrewNumber(source.verse)]
			);
			break;
		case "gemara":
			fields.push(
				["מקור", "גמרא"],
				["מסכת", source.tractateHe],
				["פרק", toHebrewNumber(source.perek)],
				["דף", toHebrewNumber(source.daf)],
				["עמוד", source.amud === "a" ? "א" : "ב"]
			);
			break;
		case "rambam":
			fields.push(
				["מקור", "רמב״ם"],
				["ספר", source.bookHe],
				["נושא", source.topicHe],
				["פרק", toHebrewNumber(source.chapter)],
				["הלכה", toHebrewNumber(source.halacha)]
			);
			break;
	}
	fields.push(["הפניה", sourceLabel(source)], ["sefaria", sourceSefariaRef(source)]);

	const footer = navFooter(nav);
	return `${frontmatter(fields)}\n# ${headingFor(source)}\n\n${text.trim()}\n${footer ? `\n${footer}` : ""}`;
}

// ---------------------------------------------------------------------------
// Writing the notes
// ---------------------------------------------------------------------------

export interface PreparedSource {
	source: Source;
	/** Text of the source, exactly as the note should hold it. */
	text: string;
	nav?: SourceNav;
}

/** The few vault operations the library needs, so this stays testable. */
export interface VaultWriter {
	exists(path: string): boolean;
	mkdir(folder: string): Promise<void>;
	create(path: string, content: string): Promise<void>;
}

/** Folder part of a vault path. */
export function folderOf(path: string): string {
	const index = path.lastIndexOf("/");
	return index === -1 ? "" : path.slice(0, index);
}

/**
 * Collapse whatever the user typed as the sources folder into one clean vault
 * folder: no surrounding spaces, no doubled or trailing slashes.
 */
export function normalizeFolder(folder: string): string {
	const trimmed = (folder ?? "").trim();
	const cleaned = trimmed
		.replace(/^\/+/, "")
		.replace(/\/{2,}/g, "/")
		.replace(/\/+$/, "");
	return cleaned || DEFAULT_SOURCES_FOLDER;
}

/**
 * Create one source note if the vault does not have it yet, and report what
 * happened.
 *
 * Existing notes are never touched: a source note may carry the user's own
 * highlights and comments, and the library is only ever filled in around them.
 * Rewriting the canonical text is what re-extracting the archive from
 * `npm run build-library` is for.
 */
export async function ensureSourceNote(
	vault: VaultWriter,
	item: PreparedSource,
	root: string = DEFAULT_SOURCES_FOLDER
): Promise<"created" | "skipped"> {
	const folder = normalizeFolder(root);
	const path = sourceFilePath(item.source, folder);
	if (vault.exists(path)) return "skipped";
	const containing = folderOf(path);
	// The adapter's mkdir is idempotent; Obsidian's vault.createFolder is not.
	if (containing) await vault.mkdir(containing);
	await vault.create(path, sourceNoteContent(item.source, item.text, item.nav ?? {}));
	return "created";
}

/** Write every note that is still missing and return how many were created. */
export async function ensureSourceNotes(
	vault: VaultWriter,
	items: PreparedSource[],
	root: string = DEFAULT_SOURCES_FOLDER
): Promise<number> {
	let created = 0;
	for (const item of items) {
		if ((await ensureSourceNote(vault, item, root)) === "created") created++;
	}
	return created;
}
