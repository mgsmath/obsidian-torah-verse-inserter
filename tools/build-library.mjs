// Package the whole מקורות library into a ZIP that can be extracted straight
// into an Obsidian vault.
//
// The archive holds one note per verse, per amud and per halacha, with the same
// Hebrew paths the plugin links to, so dropping it into a vault makes every
// citation the plugin inserts resolve.
//
// Run: npm run build-library [--out mekorot-library.zip] [--dir <folder>]
import { build } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { createZip } from "./zip.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function option(name, fallback) {
	const index = process.argv.indexOf(`--${name}`);
	return index === -1 ? fallback : process.argv[index + 1];
}

const OUTPUT = resolve(ROOT, option("out", "mekorot-library.zip"));
const TREE = option("dir", null);

const temporaryDirectory = join(tmpdir(), `torah-library-${Date.now()}`);
const bundlePath = join(temporaryDirectory, "library.mjs");

try {
	// Bundle the plugin's own builders so the archive and the notes the plugin
	// writes on demand can never drift apart.
	await build({
		entryPoints: [join(ROOT, "src", "library.ts")],
		outfile: bundlePath,
		bundle: true,
		format: "esm",
		platform: "node",
		target: "node22",
		logLevel: "silent",
	});

	const { buildLibrary } = await import(`${pathToFileURL(bundlePath).href}?built=${Date.now()}`);
	const started = Date.now();
	const { files, tanakh, gemara, rambam } = await buildLibrary();

	if (TREE) {
		for (const file of files) {
			const target = join(resolve(TREE), file.path);
			mkdirSync(dirname(target), { recursive: true });
			writeFileSync(target, file.content);
		}
		console.log(`   tree written to ${resolve(TREE)}`);
	}

	const zip = createZip(
		files.map((file) => ({ name: file.path, data: file.content })),
		{ comment: "מקורות — Torah source library for Shiur Notes Inserter" }
	);
	writeFileSync(OUTPUT, zip);

	const rawBytes = files.reduce((sum, file) => sum + Buffer.byteLength(file.content, "utf8"), 0);
	console.log(
		`✅ ${files.length} notes → ${OUTPUT}\n` +
			`   תנ״ך ${tanakh} verses · גמרא ${gemara} amudim · רמב״ם ${rambam} halachot\n` +
			`   ${(rawBytes / 1048576).toFixed(1)} MB of notes → ${(zip.length / 1048576).toFixed(1)} MB zipped ` +
			`in ${((Date.now() - started) / 1000).toFixed(1)}s`
	);
} finally {
	rmSync(temporaryDirectory, { recursive: true, force: true });
}
