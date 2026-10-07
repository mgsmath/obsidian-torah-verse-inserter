# Bundled study texts: sources, offline use, and licensing

The plugin bundles Hebrew/Aramaic text for all **84 Mishneh Torah sections** and **37 Bavli tractates** in `src/study-corpus.ts`. It decompresses one section or tractate locally when needed. The runtime study lookup in `src/study.ts` makes no HTTP/API calls; Sefaria URLs are retained only as citations users may open themselves.

The optional Tanakh translations are separate: they are still fetched from Sefaria when selected and therefore require a connection. Tanakh, Rambam, and Gemara Hebrew/Aramaic text lookup works offline.

## Sources

- **Mishneh Torah:** Sefaria's Hebrew export. The bundled snapshot uses the Sefaria `merged` text, whose underlying editions are Torat Emet 363 (public domain) and *Wikisource Mishneh Torah* (CC BY-SA). Sections not wholly covered by Torat Emet use the Wikisource text. For *Prayer and the Priestly Blessing*, the bundle uses the direct Wikisource edition rather than an additional partial source whose license was not recorded in the export.
- **Babylonian Talmud:** Sefaria's *Wikisource Talmud Bavli* Hebrew/Aramaic text, sourced from [Hebrew Wikisource](https://he.wikisource.org/wiki/תלמוד_בבלי).
- **Gemara perek boundaries:** Sefaria's `data/Mishnah Map.csv` in [Sefaria-Project](https://github.com/Sefaria/Sefaria-Project), which records the daf and line where every mishnah of the 37 tractates is discussed. `npm run fetch-gemara-perakim` turns it into [`src/gemara-perakim.ts`](src/gemara-perakim.ts). The CSV numbers chapters the way the Mishnah does, and the printed masechet does not always follow that order, so the tool renumbers the perakim by daf order; it also refuses to write a table that misses any boundary the bundled text itself marks with a "הדרן עלך" paragraph (215 of the 313 boundaries carry one).
- **Export snapshot:** [Sefaria Export](https://github.com/Sefaria/Sefaria-Export) text data. The bundled snapshot was obtained from the Sefaria-export mirror at commit `343a44e5dd83ffdf4dbc1df55233e27f28e3bdd2`; the complete per-text source/version record is in [`tools/study-corpus-sources.json`](tools/study-corpus-sources.json).

## Attribution and license

The plugin's **code** is MIT-licensed as described in [`LICENSE`](LICENSE). The **bundled text data is separately licensed**: Wikisource-derived portions are distributed under Creative Commons Attribution-ShareAlike (CC BY-SA), consistent with the upstream Wikisource/Sefaria version terms; see the [CC BY-SA license](https://creativecommons.org/licenses/by-sa/4.0/) and the source links above for the applicable version. Attribution: *Sefaria Export; Hebrew Wikisource contributors; Wikisource Talmud Bavli and Wikisource Mishneh Torah*. The underlying Torat Emet 363 text is marked Public Domain by Sefaria.

The data is repackaged as compressed JSON for offline lookup; HTML/footnote markup and source-formatting whitespace are removed by the corpus builder before the plain text is bundled. No English translations are included in this corpus. Please keep this file and the source manifest with redistributed copies of the bundled text.

## The מקורות library

`npm run build-library` writes `mekorot-library.zip`: every verse, amud and halacha as its own note under `מקורות/תנך`, `מקורות/גמרא` and `מקורות/רמבם`, with Hebrew folder and file names. The text is the same bundled text described above — nothing extra is downloaded — and the archive carries the same licensing terms. It is a release artifact, not part of the repo.

## Refreshing the bundle (maintainers)

The committed `src/study-corpus.ts` is what makes installed copies work offline. To refresh it, use a network-connected build environment:

```sh
npm run fetch-study-corpus
npm run build-study-corpus
npm test
```

The fetch script is a **maintainer tool only**, never imported by the plugin. It reads the Sefaria export index, downloads the approved source versions, and refuses to bundle unreviewed Rambam editions. Review changes in `tools/study-corpus-sources.json` and this file whenever updating the text snapshot.
