// Formato del texto insertado: compartido por versículos de Tanaj y pasajes de estudio.
import { isolateIfRtl } from "./hebrew";

export interface InsertStyle {
	quoteFormat: boolean;
	quoteMarks: boolean;
	inlineReference: boolean;
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
 *
 * (Quotes are omitted in every layout when quoteMarks is off.)
 *
 * Each Hebrew run (quoted text, parenthesized reference, dash reference) is
 * wrapped in a Unicode right-to-left isolate (RLI…PDI) so neutral characters
 * — the quotation marks, parentheses, and em dash — stay on the Hebrew side
 * when the insertion lands in the middle of an English (left-to-right) line.
 * Without isolation the Unicode bidi algorithm attaches those neutrals to the
 * surrounding English and the opening quote visually jumps to the wrong end
 * of the Hebrew. Runs without RTL characters are left untouched.
 */
export function composeInsertedText(
	content: string,
	location: string,
	style: InsertStyle
): string {
	// One pair of quotation marks around the text, whatever the format.
	const quoted = style.quoteMarks ? `"${content}"` : content;
	// One isolate per Hebrew run keeps the logical order (quote first, then
	// its reference) in both English and Hebrew surrounding lines. A single
	// isolate around both would flip them visually inside an RTL context.
	const text = isolateIfRtl(quoted);
	const parenthesizedRef = isolateIfRtl(`(${location})`);
	const dashRef = isolateIfRtl(`— ${location}`);
	// Reference on the same line, right after the text.
	if (style.inlineReference) {
		if (!style.quoteFormat) return `${text} ${parenthesizedRef}`;
		const lines = quoted.split("\n").map((line) => isolateIfRtl(line));
		lines[lines.length - 1] += ` ${parenthesizedRef}`;
		return `${lines.map((line) => `> ${line}`).join("\n")}\n`;
	}
	// Quote marks without a quote block: reference in parentheses after the
	// closing mark.
	if (style.quoteMarks && !style.quoteFormat) {
		return `${text} ${parenthesizedRef}\n`;
	}
	// Block quote with the reference on its own line below.
	if (style.quoteFormat) {
		return `${quoted.split("\n").map((line) => `> ${isolateIfRtl(line)}`).join("\n")}\n> ${dashRef}\n`;
	}
	return `${text}\n${dashRef}\n`;
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
