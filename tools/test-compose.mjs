// Unit tests for insertion formatting: Hebrew runs must be wrapped in
// right-to-left isolates (RLI...PDI) so quotation marks and parentheses stay
// on the Hebrew side when inserted into an English line.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const temporaryDirectory = mkdtempSync(join(tmpdir(), "torah-compose-test-"));
const bundlePath = join(temporaryDirectory, "compose.mjs");

// Built from code points so this file contains no Unicode escapes.
const RLI = String.fromCharCode(0x2067);
const PDI = String.fromCharCode(0x2069);
const DASH = String.fromCharCode(0x2014);
const stripIsolates = (s) => s.split(RLI).join("").split(PDI).join("");

// Sample Hebrew content/reference (the reported inline-quote scenario).
const content = String.fromCharCode(0x05E9, 0x05B8, 0x05DC, 0x05D5, 0x05DD);
const location = String.fromCharCode(0x05D1, 0x05E8, 0x05D0, 0x05E9, 0x05D9, 0x05EA) + " " + String.fromCharCode(0x05D0) + ":" + String.fromCharCode(0x05D0);

try {
	await build({
		entryPoints: [join(ROOT, "src", "compose.ts")],
		outfile: bundlePath,
		bundle: true,
		format: "esm",
		platform: "node",
		target: "node22",
		logLevel: "silent",
	});
	const compose = await import(`${pathToFileURL(bundlePath).href}?test=${Date.now()}`);

	// Sanity: the fixtures really are RTL, otherwise the test is vacuous.
	const hebrewProbe = compose.composeInsertedText(content, location, {
		quoteFormat: false,
		quoteMarks: false,
		inlineReference: true,
	});
	assert.ok(hebrewProbe.includes(RLI), "fixtures must contain RTL characters");

	// 1. Inline, no quote block (the reported case): the quotes must sit INSIDE
	// the RTL isolate so the opening mark renders at the start (right side) of
	// the Hebrew instead of jumping to the English side.
	const inline = compose.composeInsertedText(content, location, {
		quoteFormat: false,
		quoteMarks: true,
		inlineReference: true,
	});
	assert.equal(inline, `${RLI}"${content}"${PDI} ${RLI}(${location})${PDI}`);

	// 2. Quote marks without quote block and without inline ref: same shape.
	const quoted = compose.composeInsertedText(content, location, {
		quoteFormat: false,
		quoteMarks: true,
		inlineReference: false,
	});
	assert.equal(quoted, `${RLI}"${content}"${PDI} ${RLI}(${location})${PDI}\n`);

	// 3. Block quote, inline ref.
	const blockInline = compose.composeInsertedText(content, location, {
		quoteFormat: true,
		quoteMarks: true,
		inlineReference: true,
	});
	assert.equal(blockInline, `> ${RLI}"${content}"${PDI} ${RLI}(${location})${PDI}\n`);

	// 4. Block quote, own-line ref.
	const blockOwnLine = compose.composeInsertedText(content, location, {
		quoteFormat: true,
		quoteMarks: false,
		inlineReference: false,
	});
	assert.equal(blockOwnLine, `> ${RLI}${content}${PDI}\n> ${RLI}${DASH} ${location}${PDI}\n`);

	// 5. Plain text, own-line ref.
	const plain = compose.composeInsertedText(content, location, {
		quoteFormat: false,
		quoteMarks: false,
		inlineReference: false,
	});
	assert.equal(plain, `${RLI}${content}${PDI}\n${RLI}${DASH} ${location}${PDI}\n`);

	// 6. Visible text is unchanged once isolates are stripped.
	for (const out of [inline, quoted, blockInline, blockOwnLine, plain]) {
		assert.ok(stripIsolates(out).includes(content));
		assert.ok(stripIsolates(out).includes(location));
	}

	// 7. Pure LTR text gets no isolates (no invisible chars added).
	const latin = compose.composeInsertedText("Lorem ipsum", "Gen 1:1", {
		quoteFormat: false,
		quoteMarks: true,
		inlineReference: true,
	});
	assert.equal(latin, `"Lorem ipsum" (Gen 1:1)`);
	assert.ok(!latin.includes(RLI) && !latin.includes(PDI));

	// 8. flowIntoSingleLine still collapses segments.
	assert.equal(compose.flowIntoSingleLine("a\n\nb\r\n  c "), "a b c");

	// 9. Inline footnote: the reference moves into ^[...] right after the text
	// and nothing has to be appended at the end of the note.
	const inlineFootnote = compose.composeInsert(content, location, {
		quoteFormat: false,
		quoteMarks: true,
		inlineReference: true,
		footnoteReference: true,
		footnoteStyle: "inline",
	});
	assert.equal(inlineFootnote.text, `${RLI}"${content}"${PDI}^[${RLI}${location}${PDI}]`);
	assert.equal(inlineFootnote.footnoteDefinition, undefined);

	// 10. Numbered footnote in a quote block: the marker closes the last
	// quoted line and the definition is handed back for the end of the note.
	const numbered = compose.composeInsert(content + "\n" + content, location, {
		quoteFormat: true,
		quoteMarks: false,
		inlineReference: false,
		footnoteReference: true,
		footnoteStyle: "numbered",
	}, { footnoteId: "3" });
	assert.equal(
		numbered.text,
		`> ${RLI}${content}${PDI}\n> ${RLI}${content}${PDI}[^3]\n`
	);
	assert.equal(numbered.footnoteDefinition, `[^3]: ${RLI}${location}${PDI}`);
	const numberedDocument = numbered.text + compose.footnoteDefinitionAppendix(
		numbered.text,
		numbered.footnoteDefinition
	);
	assert.ok(numberedDocument.includes("[^3]\n\n[^3]: "), "numbered marker must have a definition at note end");
	assert.ok(numberedDocument.endsWith(`${numbered.footnoteDefinition}\n`));

	// 11. Footnote ids never collide with the ones already in the note.
	assert.equal(compose.nextFootnoteId(""), "1");
	assert.equal(compose.nextFootnoteId("a[^1] b[^4]\n\n[^1]: x\n[^4]: y\n"), "5");
	assert.equal(compose.nextFootnoteId("a[^note] b"), "1");

	// 12. Definitions are separated from prose by a blank line, then stacked
	// one per line, reusing the newlines already at the end of the note.
	assert.equal(compose.footnoteDefinitionAppendix("", "[^1]: x"), "[^1]: x\n");
	assert.equal(compose.footnoteDefinitionAppendix("text", "[^1]: x"), "\n\n[^1]: x\n");
	assert.equal(compose.footnoteDefinitionAppendix("text\n", "[^1]: x"), "\n[^1]: x\n");
	assert.equal(compose.footnoteDefinitionAppendix("text\n\n", "[^1]: x"), "[^1]: x\n");
	assert.equal(compose.footnoteDefinitionAppendix("text\n\n[^1]: x\n", "[^2]: y"), "[^2]: y\n");

	// 13. Footnote layouts keep the visible text and reference intact.
	for (const out of [inlineFootnote, numbered]) {
		const all = stripIsolates(out.text + (out.footnoteDefinition ?? ""));
		assert.ok(all.includes(content));
		assert.ok(all.includes(location));
	}

	console.log("PASS Insertion formatting keeps quotes on the Hebrew side (RLI/PDI isolates).");
} finally {
	rmSync(temporaryDirectory, { recursive: true, force: true });
}
