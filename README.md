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

- Include nikud
- Include te'amim
- Insert as quote block
- Maximum search results
- Rambam search terms
- Gemara search terms
- Gemara tractate aliases
- Default Rambam book
- Default Rambam section
- Default Gemara tractate
- Font compatibility

## Notes

- Tanakh, Rambam, and Gemara text lookup works offline.
- Rambam and Gemara insertion no longer appends Sefaria or Wikisource links.
- Hebrew references are used in inserted citations.

## Development

```bash
npm install
npm run build
```

Repository: https://github.com/mgsmath/obsidian-torah-verse-inserter
