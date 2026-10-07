# Shiur Notes Inserter

Insert bundled offline **Tanakh**, **Rambam (Mishneh Torah)**, and **Gemara** passages into Obsidian notes.

## What changed

- Plugin name: **Shiur Notes Inserter**
- Maintainer / fork author: **mgsmath**
- Original plugin author: **Saleh Penhos**
- Inserted Tanakh references are formatted in **Hebrew**, for example:

```md
> וַתֹּאמֶר הָאִשָּׁה...
> — בְּרֵאשִׁית כ:ד
```

- **Translation output was removed**
- **AlHaTorah links were removed**
- **Study-text source links were removed**
- **Rambam and Gemara selectors now use Hebrew names**
- **Gemara tractate aliases can be customized in settings**
- If you highlight part of a Rambam or Gemara passage, **pressing Enter inserts the current selection**

## Features

- Search Tanakh by:
  - reference: `Gen 1:1`, `בראשית 1:1`, `bereshit 1:1`
  - transliteration
  - Hebrew text
- Insert Tanakh verses as plain text or Markdown quote blocks
- Offline Hebrew Tanakh text bundled with the plugin
- Offline Rambam and Bavli text bundled with the plugin
- Select only the part of a Rambam or Gemara passage you want to insert
- Hebrew citations for inserted references
- **Atomic source library**: one note per verse, per amud and per halacha, in Hebrew folders
- Citations are **wikilinks** that open the source note

## Source library (מקורות)

Every primary source has its own note in the vault, named in Hebrew with Hebrew-letter numbering:

| Source | Granularity | Path |
| --- | --- | --- |
| Tanakh (תנ״ך) | 1 verse per file | `מקורות/תנך/[ספר]/פרק [אות]/[אות].md` |
| Gemara (גמרא) | 1 amud per file | `מקורות/גמרא/[מסכת]/פרק [אות]/[דף עמוד].md` |
| Rambam (רמב״ם) | 1 halacha per file | `מקורות/רמבם/[נושא]/פרק [אות]/[אות].md` |

Examples:

```text
מקורות/תנך/בראשית/פרק א/א.md
מקורות/גמרא/ברכות/פרק א/ב עא.md        ← דף ב עמוד א
מקורות/גמרא/ברכות/פרק א/ב עב.md        ← דף ב עמוד ב
מקורות/רמבם/קריאת שמע/פרק א/א.md      ← no "הלכות" prefix in the folder
```

Each note contains only its Hebrew location heading and source text, followed by links to the previous and next source and to the first source of its perek:

```md
# בראשית פרק א, פסוק א

בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים...

---

[[מקורות/תנך/בראשית/פרק א/א|פרק א]] · [[מקורות/תנך/בראשית/פרק א/ב|הבא — בְּרֵאשִׁית א:ב]]
```

**Filling the folder.** `mekorot-library.zip` — attached to every release, and built locally with `npm run build-library` — contains the whole library: 23,206 verses, 5,349 amudim and 15,210 halachot, about 43,700 notes. Extract it at the root of your vault and every citation resolves.

The plugin also creates any source note that is still missing at the moment you insert from it, so a citation is never left dangling even in a vault without the archive. Notes that already exist are **never overwritten**, which means your own highlights in a source note are safe.

**Gemara perek numbering** follows the order the perakim are printed in the masechet, which is not always the Mishnah's chapter order (Sanhedrin prints "חלק" last, Menachot prints "רבי ישמעאל" at 63b). The boundaries come from Sefaria's mishnah-to-daf map and are cross-checked against the bundled text — see [`STUDY_TEXTS.md`](STUDY_TEXTS.md).

**Ranges.** A reference that covers several verses (`Gen 1:1-3`, `Gen 1`) writes every verse it covers and links to the first of them, with the range shown in the citation.

## Gemara shortcuts

The default Gemara shortcut is `gm`.

Examples:

- `gm ברכות 2a`
- `gm בבא מציעא 4b`
- `gm bm 4b`

Per-tractate aliases are editable in **Settings → Gemara tractate aliases**.

Example format:

```text
בבא מציעא=bm
בבא קמא=bk
בבא בתרא=bb
```

You can also use English names on the left side:

```text
Bava Metzia=bm,bava metzia
Sanhedrin=sanh
```

## Rambam input

The default Rambam shortcuts are `rmbm` and `rm`.

Workflow:

1. Type `rm`
2. Choose the Rambam **book** in Hebrew
3. Choose the **section** in Hebrew
4. Enter a location such as `2:4`

Inserted Rambam citations use `רמב״ם:<section> <chapter>:<halacha>`:

```md
> הַחוֹבֵל בַּחֲבֵרוֹ חַיָּב לְשַׁלֵּם לוֹ חֲמִשָּׁה דְּבָרִים...
> — רמב״ם:חובל ומזיק א:א
```

## Usage

1. Enable the plugin in Obsidian.
2. Run the command **Insert Torah text (Tanakh, Rambam, Gemara)**.
3. Search Tanakh normally, or use a study shortcut:
   - `gm` for Gemara
   - `rm` / `rmbm` for Rambam
4. For Rambam or Gemara:
   - load the passage
   - optionally highlight only the words you want
   - click **Insert selection**, or highlight the text and press **Enter** directly —
     no need to click back into the search box first
5. For Tanakh, choose a result and it will be inserted with a Hebrew reference.

## Settings

- Sources folder
- Link references to source files
- Create missing source files
- Include nikud
- Include te'amim
- Insert as quote block
- Quotation marks (wrap the text in "quotes" in every format)
- Reference as footnote (the reference goes into a footnote attached to the text)
- Footnote style (inline `^[Bereshit 1:1]`, or numbered `[^1]` with the definition at the end of the note)
- Maximum search results
- Rambam search terms
- Gemara search terms
- Gemara tractate aliases
- Default Rambam book
- Default Rambam section
- Default Gemara tractate
- Font compatibility

## Notes

- Inserted Hebrew is wrapped in invisible Unicode directional isolates (RLI…PDI), so quotation marks and parentheses stay on the correct side of the Hebrew when inserted into an English line.
- Tanakh, Rambam, and Gemara text lookup works offline.
- Rambam and Gemara insertion no longer appends Sefaria or Wikisource links.
- Hebrew references are used in inserted citations.

## Development

```bash
npm install
npm run build           # typecheck + bundle main.js
npm test                # insertion formatting, offline lookup, source library
npm run build-library   # mekorot-library.zip: the whole מקורות library
```

| Script | What it does |
| --- | --- |
| `npm run build-corpus` | Packs the Tanakh corpus into `src/data/corpus.ts` |
| `npm run fetch-study-corpus` / `build-study-corpus` | Refreshes the bundled Rambam and Bavli text |
| `npm run fetch-gemara-perakim` | Regenerates `src/gemara-perakim.ts` (where each perek starts) |
| `npm run build-library` | Writes `mekorot-library.zip` |

`src/mekorot.ts` holds the path and note builders, `src/library.ts` walks the whole corpus with them, and the plugin uses the same functions on demand — so the archive and the notes the plugin creates cannot drift apart.

Repository: https://github.com/mgsmath/obsidian-torah-verse-inserter
