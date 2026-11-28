# Raleigh's History of the World (1617) — stored modern edition

Sir Walter Raleigh, *The History of the World* (1617), London: Stansby for
Walter Burre. Source text: EarlyPrint A10357 (EEBO-TCP), the unadorned
transcription in `sources/raleigh/A10357.earlyprint-unadorned.xml`.

## What these files are

Pre-generated, stored modern files. The site serves these files when the
Modern switch is selected; it does not run a script against the originals
at serve time. Each passage is addressable by the same passage id the
intake uses (`data/raleigh-accounts.json`, p00001...), so a future intake
pass can link a passage to its modern form directly.

- One file per section (book / part / chapter / §), plus `preface.md` and
  one `contents-book-<n>.md` per book. A chapter opening before the first
  § is `-intro.md`. A section number that repeats inside one chapter
  takes a letter suffix (the second §. VIII is `section-8b`).
- Each passage is a `## pNNNNN · sig. ...` heading followed by its modern
  text. Italics are the 1617 `<hi>` spans, carried as `*`...\*`.
- `index.json` is the site's lookup: passage id -> modern HTML and plain
  text, file, section, citation. It is generated from the same model as
  these Markdown files, so the two cannot drift. Do not edit it by hand;
  regenerate with `node scripts/raleigh/modern-edition.mjs`.

## Rules

- Every word is Modern English; the output passes spellcheck
  (`node scripts/raleigh/spellcheck-modern.mjs`, nspell with the en-US
  and en-GB dictionaries, plus `scripts/raleigh/modern-allowlist.txt`).
- A word with no certain modern equivalent stays as printed and carries a
  footnote, numbered per section: `cuened¹`, with the note at the end of
  the section file and in the passage's `notes` field in `index.json`.
  (N106, Kevin's rulings, Nov 27, 2026.)
- Proper names and place names use their modern form. A name changed from
  the original carries a reference to the original name, in italics, on
  its first occurrence in each section: `Gideon *Gedeon*`.
- Every foreign-language phrase carries an English translation alongside
  it; the original stays as a quotation: `*Sic vos non vobis* ("Thus you
  labour not for yourselves")`. Translations are in
  `scripts/raleigh/translations.json`.
- Dates, figures, and citations are never rewritten. The original text is
  untouched.

## Scope

The Preface, the contents, and Books I-V, Part I, whole. The Chronological
Table is a separate artifact (`scripts/raleigh/table.mjs`) and is not part
of these files. The title page, sonnet, epistle to the reader, list of
kings, index, and colophon are not passages in the intake and are not
included here.

## Regenerate

`node scripts/raleigh/modern-edition.mjs`
