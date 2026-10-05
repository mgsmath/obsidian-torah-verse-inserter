// Exercise the actual offline lookup code with all network access stubbed out.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const studySource = readFileSync(join(ROOT, "src", "study.ts"), "utf8");
assert.doesNotMatch(studySource, /requestUrl|fetch\s*\(/, "study lookup must not call a network API");

const temporaryDirectory = mkdtempSync(join(tmpdir(), "torah-study-test-"));
const bundlePath = join(temporaryDirectory, "study.mjs");
const originalFetch = globalThis.fetch;

try {
	await build({
		entryPoints: [join(ROOT, "src", "study.ts")],
		outfile: bundlePath,
		bundle: true,
		format: "esm",
		platform: "node",
		target: "node22",
		logLevel: "silent",
	});

	globalThis.fetch = async () => {
		throw new Error("Network access is disabled for this test");
	};
	const study = await import(`${pathToFileURL(bundlePath).href}?test=${Date.now()}`);

	const rambamMatch = study.matchStudyPrefix("rm Sabbath 2:4", "rmbm/rm", "gm");
	assert.equal(rambamMatch?.mode, "rambam");
	const gemaraMatch = study.matchStudyPrefix("gm Berakhot 55b", "rmbm/rm", "gm");
	assert.equal(gemaraMatch?.mode, "gemara");

	const rambam = await study.lookupStudyHebrew("Mishneh Torah, Sabbath.2.4", "rambam");
	assert.ok(rambam.length > 0, "Rambam 2:4 should be available from the bundled corpus");
	assert.match(rambam.join(" "), /הַחוֹשֵׁשׁ/, "Rambam lookup should return the requested halacha");

	const gemara = await study.lookupStudyHebrew("Berakhot.55b", "gemara");
	assert.ok(gemara.length > 0, "Berakhot 55b should be available from the bundled corpus");
	assert.match(gemara.join(" "), /לעולם יצפה אדם לחלום טוב/, "Gemara lookup should return the requested daf");

	assert.deepEqual(await study.lookupStudyHebrew("Berakhot.1a", "gemara"), []);
	assert.deepEqual(await study.lookupStudyHebrew("Mishneh Torah, Sabbath.0.4", "rambam"), []);
	console.log(`✅ Offline lookup passed with network disabled (${rambam.length} Rambam segment, ${gemara.length} Gemara lines).`);
} finally {
	globalThis.fetch = originalFetch;
	rmSync(temporaryDirectory, { recursive: true, force: true });
}
