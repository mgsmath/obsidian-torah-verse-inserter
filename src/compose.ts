// Formato del texto insertado: compartido por versículos de Tanaj y pasajes de estudio.
import { isolateIfRtl } from "./hebrew";

/**
 * How the reference is written when it goes into a footnote.
 * - "inline": Obsidian inline footnote, `^[Bereshit 1:1]`. Self-contained,
 *   nothing is added at the bottom of the note.
 * - "numbered": standard footnote marker `[^1]` at the cursor plus a
 *   definition line `[^1]: Bereshit 1:1` appended at the end of the note.
 */
export type FootnoteStyle = "inline" | "numbered";

export interface InsertStyle {
	quoteFormat: boolean;
	quoteMarks: boolean;
	inlineReference: boolean;
	footnoteReference?: boolean;
	footnoteStyle?: FootnoteStyle;
}

export interface ComposeOptions {
	footnoteId?: string;
	/**
	 * Obsidian wikilink to the source note, e.g.
	 * `[[מקורות/תנך/בראשית/פרק א/א|בראשית א:א]]`. When present it replaces the
	 * plain-text reference everywhere the reference is printed, so the citation
	 * opens the atomic source file instead of being dead text.
	 */
	locationLink?: string;
}

export interface ComposedInsert {
	/** Text to insert at the cursor. */
	text: string;
	/**
	 * Footnote definition (`[^1]: Bereshit 1:1`) that must be appended at the
	 * end of the note. Only set for the "numbered" footnote style.
	 */
	footnoteDefinition?: string;
}

/**
 * Insertion style shared by Tanakh verses and study passages. `quoteMarks`
 * wraps the text in "quotes" in every format; without a quote block it also
 * keeps the reference in parentheses right after the text.
 *
 *              | quote block on                  | quote block off
 * ------------ | ------------------------------- | -------------------------------
 * inline ref   | > "text" (loc)                  | "text" (loc)
 * own-line ref | > "text"                        | text
 *              | > — loc                         | — loc
 * footnote     | > "text"[^1]                    | "text"[^1]
 *
 * (Quotes are omitted in every layout when quoteMarks is off. The footnote
 * row wins over the inline/own-line reference when footnoteReference is on.)
 *
 * Each Hebrew run (quoted text, parenthesized reference, dash reference) is
 * wrapped in a Unicode right-to-left isolate (RLI…PDI) so neutral characters
 * — the quotation marks, parentheses, and em dash — stay on the Hebrew side
 * when the insertion lands in the middle of an English (left-to-right) line.
 * Without isolation the Unicode bidi algorithm attaches those neutrals to the
 * surrounding English and the opening quote visually jumps to the wrong end
 * of the Hebrew. Runs without RTL characters are left untouched.
 */
export function composeInsert(
	content: string,
	location: string,
	style: InsertStyle,
	options: ComposeOptions = {}
): ComposedInsert {
	// One pair of quotation marks around the text, whatever the format.
	const quoted = style.quoteMarks ? `"${content}"` : content;
	// One isolate per Hebrew run keeps the logical order (quote first, then
	// its reference) in both English and Hebrew surrounding lines. A single
	// isolate around both would flip them visually inside an RTL context.
	const text = isolateIfRtl(quoted);
	// A wikilink is never wrapped in an isolate: the `[[` and `]]` have to stay
	// visible to Obsidian's parser. Its own label is isolated by sourceLink(),
	// so the Hebrew inside the link still reads right to left.
	const reference = options.locationLink ?? isolateIfRtl(location);
	const parenthesizedRef = options.locationLink ? `(${reference})` : isolateIfRtl(`(${location})`);
	const dashRef = options.locationLink ? `— ${reference}` : isolateIfRtl(`— ${location}`);

	// Reference in a footnote: the marker is attached to the text and no
	// visible reference is printed next to it.
	if (style.footnoteReference) {
		const numbered = style.footnoteStyle === "numbered";
		const id = options.footnoteId ?? "1";
		// The marker stays outside the isolate so it follows the text
		// logically (to its left inside an RTL line, to its right in English).
		const marker = numbered ? `[^${id}]` : `^[${reference}]`;
		const footnoteDefinition = numbered ? `[^${id}]: ${reference}` : undefined;
		if (style.quoteFormat) {
			const lines = quoted.split("\n").map((line) => isolateIfRtl(line));
			lines[lines.length - 1] += marker;
			return {
				text: `${lines.map((line) => `> ${line}`).join("\n")}\n`,
				footnoteDefinition,
			};
		}
		return { text: `${text}${marker}`, footnoteDefinition };
	}

	// Reference on the same line, right after the text.
	if (style.inlineReference) {
		if (!style.quoteFormat) return { text: `${text} ${parenthesizedRef}` };
		const lines = quoted.split("\n").map((line) => isolateIfRtl(line));
		lines[lines.length - 1] += ` ${parenthesizedRef}`;
		return { text: `${lines.map((line) => `> ${line}`).join("\n")}\n` };
	}
	// Quote marks without a quote block: reference in parentheses after the
	// closing mark.
	if (style.quoteMarks && !style.quoteFormat) {
		return { text: `${text} ${parenthesizedRef}\n` };
	}
	// Block quote with the reference on its own line below.
	if (style.quoteFormat) {
		return {
			text: `${quoted.split("\n").map((line) => `> ${isolateIfRtl(line)}`).join("\n")}\n> ${dashRef}\n`,
		};
	}
	return { text: `${text}\n${dashRef}\n` };
}

/**
 * Convenience wrapper for callers that only need the text at the cursor
 * (every layout except the numbered footnote, which also needs a definition).
 */
export function composeInsertedText(
	content: string,
	location: string,
	style: InsertStyle,
	options: ComposeOptions = {}
): string {
	return composeInsert(content, location, style, options).text;
}

const FOOTNOTE_MARKER_RE = /\[\^([^\]\s]+)\]/g;
const FOOTNOTE_DEFINITION_RE = /^\[\^[^\]\s]+\]:/;

/**
 * Lowest positive integer not already used as a footnote id in the note, so a
 * new citation never collides with an existing `[^1]` / `[^1]:` pair.
 */
export function nextFootnoteId(documentText: string): string {
	let highest = 0;
	for (const match of documentText.matchAll(FOOTNOTE_MARKER_RE)) {
		const id = Number(match[1]);
		if (Number.isInteger(id) && id > highest) highest = id;
	}
	return String(highest + 1);
}

/**
 * Text to append at the very end of the note for a footnote definition: a
 * blank line before the first definition, and one line per definition
 * afterwards. Newlines already present at the end of the note are reused, so
 * appending never piles up empty lines.
 */
export function footnoteDefinitionAppendix(documentText: string, definition: string): string {
	const body = documentText.replace(/[ \t]+$/, "");
	if (!body.trim()) return `${definition}\n`;
	const withoutTrailingNewlines = body.replace(/\n+$/, "");
	const trailingNewlines = body.length - withoutTrailingNewlines.length;
	const lastLine = withoutTrailingNewlines.slice(withoutTrailingNewlines.lastIndexOf("\n") + 1);
	// Right after another definition one newline is enough; otherwise the
	// definition block needs a blank line separating it from the prose.
	const needed = FOOTNOTE_DEFINITION_RE.test(lastLine) ? 1 : 2;
	return `${"\n".repeat(Math.max(0, needed - trailingNewlines))}${definition}\n`;
}

/**
 * Collapse a study passage (or a preview selection) into one flowing line:
 * Gemara/Rambam segments are inserted as a single paragraph, not one line
 * per segment.
 */
export function flowIntoSingleLine(raw: string): string {
	return raw
		.replace(/\r/g, "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.join(" ");
}
