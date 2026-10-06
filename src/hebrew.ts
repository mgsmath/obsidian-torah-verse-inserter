// Utilidades de texto hebreo: quitar te'amim (cantilación) y/o nikud (vocales).

const TEAMIM_RE = /[֑-֯]/g; // cantilación
const NIKUD_RE = /[ְ-ׇֽׁׂ]/g; // vocales + dagesh + meteg + shin/sin dots
const HEBREW_ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const HEBREW_TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HEBREW_HUNDREDS = ["", "ק", "ר", "ש"];

/** Quita SOLO los te'amim (U+0591–U+05AF), conserva el nikud. */
export function stripTeamim(s: string): string {
	return s.replace(TEAMIM_RE, "");
}

/** Quita el nikud (vocales, dagesh, meteg, puntos de shin/sin). */
export function stripNikud(s: string): string {
	return s.replace(NIKUD_RE, "");
}

/** Texto consonantal puro: sin te'amim ni nikud. */
export function consonantal(s: string): string {
	return stripNikud(stripTeamim(s));
}

/**
 * Compatibilidad de fuentes: MAM usa signos que muchas fuentes no incluyen.
 * Se sustituyen por equivalentes visualmente idénticos:
 *   U+05C7 kamatz katán  -> U+05B8 kamatz
 *   U+05BA jolam jaser   -> U+05B9 jolam
 */
export function normalizeRareMarks(s: string): string {
	return s.replace(/ׇ/g, "ָ").replace(/ֺ/g, "ֹ");
}

/** Aplica el formato elegido por el usuario. */
export function formatHebrew(
	s: string,
	opts: { nikud: boolean; teamim: boolean; fontCompat?: boolean }
): string {
	let out = s;
	if (!opts.teamim) out = stripTeamim(out);
	if (!opts.nikud) out = stripNikud(out);
	if (opts.fontCompat !== false) out = normalizeRareMarks(out);
	return out.replace(/ {2,}/g, " ").trim();
}

/** Convert a positive integer to simple Hebrew numerals without geresh/gershayim. */
export function toHebrewNumber(value: number): string {
	if (!Number.isInteger(value) || value < 1) return String(value);
	let n = value;
	let out = "";

	while (n >= 400) {
		out += "ת";
		n -= 400;
	}
	if (n >= 100) {
		const hundreds = Math.floor(n / 100);
		out += HEBREW_HUNDREDS[hundreds] ?? "";
		n %= 100;
	}
	if (n === 15) return out + "טו";
	if (n === 16) return out + "טז";
	if (n >= 10) {
		const tens = Math.floor(n / 10);
		out += HEBREW_TENS[tens] ?? "";
		n %= 10;
	}
	if (n > 0) out += HEBREW_ONES[n] ?? "";
	return out || String(value);
}

export function formatHebrewChapterVerse(
	chapter: number,
	verseStart: number,
	verseEnd: number = verseStart
): string {
	const chapterHe = toHebrewNumber(chapter);
	const verseRange =
		verseStart === verseEnd
			? toHebrewNumber(verseStart)
			: `${toHebrewNumber(verseStart)}-${toHebrewNumber(verseEnd)}`;
	return `${chapterHe}:${verseRange}`;
}

export function formatHebrewLocation(chapter: number, item: number): string {
	return `${toHebrewNumber(chapter)}:${toHebrewNumber(item)}`;
}

export function formatHebrewDaf(daf: string): string {
	const match = daf.trim().toLowerCase().match(/^(\d{1,3})([ab])$/);
	if (!match) return daf;
	return `דף ${toHebrewNumber(Number(match[1]))} ע״${match[2] === "a" ? "א" : "ב"}`;
}

export function formatHebrewDafShort(daf: string): string {
	const match = daf.trim().toLowerCase().match(/^(\d{1,3})([ab])$/);
	if (!match) return daf;
	return `${toHebrewNumber(Number(match[1]))}${match[2] === "a" ? "." : ":"}`;
}
