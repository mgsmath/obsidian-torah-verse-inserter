// Parser de referencias: "Gen 1:1", "bereshit 1:1-3", "Salmos 23", "תהלים כג" (futuro).
import { BookInfo, resolveBook } from "./books";
import { bookShape } from "./corpus";
import { formatHebrewChapterVerse, toHebrewNumber } from "./hebrew";

export interface ParsedRef {
	book: BookInfo;
	chapter: number;
	verseStart: number;
	verseEnd: number;
	wholeChapter: boolean;
}

// "<libro> <cap>[:<v>[-<v2>]]" — separadores aceptados: ":", ".", ","
const REF_RE = /^(.+?)\s+(\d{1,3})(?:\s*[:.,]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?)?$/;

export function parseRef(input: string): ParsedRef | null {
	const m = input.trim().match(REF_RE);
	if (!m) return null;
	const book = resolveBook(m[1]);
	if (!book) return null;
	const shape = bookShape(book.key);
	if (!shape) return null;

	const chapter = parseInt(m[2], 10);
	if (chapter < 1 || chapter > shape.length) return null;
	const maxV = shape[chapter - 1];

	if (!m[3]) {
		// capítulo completo
		return { book, chapter, verseStart: 1, verseEnd: maxV, wholeChapter: true };
	}
	const v1 = parseInt(m[3], 10);
	const v2 = m[4] ? parseInt(m[4], 10) : v1;
	if (v1 < 1 || v1 > maxV || v2 < v1) return null;
	return { book, chapter, verseStart: v1, verseEnd: Math.min(v2, maxV), wholeChapter: false };
}

export function formatBookReferenceInHebrew(
	book: BookInfo,
	chapter: number,
	verseStart: number,
	verseEnd: number = verseStart,
	wholeChapter: boolean = false
): string {
	if (wholeChapter) return `${book.he} ${toHebrewNumber(chapter)}`;
	return `${book.he} ${formatHebrewChapterVerse(chapter, verseStart, verseEnd)}`;
}

export function formatRefLabel(ref: ParsedRef, lang: "es" | "en" | "he"): string {
	if (lang === "he") {
		return formatBookReferenceInHebrew(
			ref.book,
			ref.chapter,
			ref.verseStart,
			ref.verseEnd,
			ref.wholeChapter
		);
	}
	const name = lang === "es" ? ref.book.es : ref.book.en;
	if (ref.wholeChapter) return `${name} ${ref.chapter}`;
	const range = ref.verseStart === ref.verseEnd ? `${ref.verseStart}` : `${ref.verseStart}-${ref.verseEnd}`;
	return `${name} ${ref.chapter}:${range}`;
}
