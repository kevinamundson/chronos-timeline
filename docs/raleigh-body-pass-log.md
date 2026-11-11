# Raleigh body pass log

Raleigh stays display-only. No `sorting_year` and no tier was changed. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World.

Modern reading, from 2026-11-08, applies to every passage below and to later passes. The original view is the printed text. The modern view keeps the 1617 italics (the unadorned `<hi>` tags, derived at build time, not stored), turns a third-person `-eth` verb into the modern third person, and reduces a doubled capital (`THat`) to one capital. Names, nouns, and ordinals in `-eth` stay. All-capital words and Roman numerals stay as printed (open question N17). The `-eth` list is `docs/raleigh-eth-words.md`.

## The table importer and body statements

Pass 1 said the table importer would wipe body statements on the next run. The citation test in that version does not delete the four creation-week statements. Their citations say Book I, not Chronological Table, so the test leaves them.

A re-run of that version is still unsafe. It duplicates the importer's own narrative sentences on events, because those sentences also lack the words Chronological Table and the writer always appends. It deletes people whose description begins "Added from the Raleigh import" and writes them again from the table alone, which drops later standby, Shuckford, and Cory text. It moves Ilus, Inachus, and Xerxes onto later people who share the title and are not from this importer.

The change does not add a schema field. A body statement's note begins with the words `Body intake.` The importer leaves that entry alone: it does not strip it, rewrite the note, or treat it as a table row. A re-run no longer deletes people. It does not retitle a person it did not create in that run. A table row stays where it is when the same quote and the same yeere of the World will be written again. If exactly one person from this importer matches the name, the row stays on that person, so Ilus, Inachus, and Xerxes stay on the Raleigh records. Two created people with one title still take the column suffix.

`node scripts/raleigh/import.mjs --write` was run twice on that change, before the statements of pass 2. Both runs planned 216 statements, 149 people, and 448 skipped, the same counts as the committed table. The second run changed no further table JSON. The four creation-week statements remained, each note starting `Body intake.`, with `year_am` and `year_bc_ad` null. Moyses was still on `moses`. The table pass log then printed `balthasar` as Balthasar (Raleigh: Belshazzar), because that alternate name was already on the person. No `sorting_year` changed.

Pass 2 uses the same note prefix. A further `--write`, after these statements were added, changed no file. All 31 body statements remained. Each note still starts `Body intake.`, and `year_bc_ad` is still null. Rome stayed at `year_am` 3280, and its sort stayed −753. That run again planned 216 statements, 149 people, and 448 skipped.

## Pass 1

The body of the 1617 *History of the World*, from the Preface through Book I, Part I, Chapter I. This range gives no yeere of the World, so the new statements also have `year_am` null.

## Counts

- Dated statements written: 4
- People created: 0
- Places created: 0
- Events created: 0
- Records updated: 2 (`creation-week`, `moses`)
- Name forms added: 1 (Moyses, on `moses`)
- Figures skipped: 15

Every skipped figure is quoted in `data/raleigh-body-extract.md`.

## What was written

Four statements on `creation-week`, Book I, Part I, Chapter I, §. VII and §. IX (sig. 47a, 48a, and 49a). They are his order of the creation days: the first three days before the sun’s formal perfection, the light’s substance on the first day and its perfection on the fourth, and the works of the first three days and of the last three days. The existing CFAH year 4004 BC was not changed.

`moses` gained the alternate name Moyses, from Book I, Part I, ch. I, §. IV, sig. 45a. That section gives him no year.

Pass 2 began at Book I, Part I, Chapter II, §. I, sig. 54a. The heading is “Of the Image of God, according to which man was first created.” Chapter I ends on the same signature.

## Pass 2

Book I, Part I, Chapter II, §. I, sig. 54a, through Chapter VII, §. X. Chapter VIII opens on sig. 111b. The same rules as pass 1. One yeere of the World was stored: Rome built in the Worlds yeere 3280, on `founding-of-rome`. Every other new statement is an age, a length, or a count of years after the Flood, so `year_am` is null. The Flood at 1656 and Jacob’s birth at 2169 were already the importer’s narrative sentences. They were not entered again. The 513 yeeres between them was.

### Counts

- Dated statements written: 27
- People created: 0
- Places created: 0
- Events created: 0
- Records updated: 16 (`seth`, `kenan`, `mahalalel`, `enoch`, `jared`, `methuselah`, `lamech`, `noah`, `abraham`, `jacob`, `cush`, `nimrod`, `the-flood`, `founding-of-babel`, `founding-of-rome`, `flood-of-ogyges`)
- Name forms added: 4 (Cenan on `kenan`, Mahaleel on `mahalalel`, lared on `jared`, Mathusalem on `methuselah`)
- Figures skipped: 24

Every skipped figure is quoted in `data/raleigh-body-extract.md`. The count is the quoted bullets in that pass. Chapter II and Chapter VI were read and gave no figure of his own, so they are not in the count.

### What was written

Chapter II (sig. 54a–59b) gives no year, no age, and no reign.

Chapter V, §. III and §. IV (sig. 82a–82b), gives the ages at which the patriarchs begat, and Seth’s 807 yeeres after his son and his 912 yeeres. Chapter V, §. V (sig. 83a), gives Seth’s 105 with the son printed Enosh. Chapter V, §. VI (sig. 84b), gives Abraham at fiftie and eight when Noah died, and Noah with Methusalem no lesse then fiue hundred yeeres. The word in “two hundred 〈◊ 〉 and three” is illegible and was not entered.

Chapter VII, §. X (sig. 101b and 103b), gives Noah’s 600 yeeres before the Flood, the command 100 yeares before the waters, and Nimrod at about 131 yeares after the Flood, which he also calls the 131st yeere after the Flood according to Berosus. Glycas’s fortie yeeres for Babel, and his own 170 yeeres after the Flood before a colony went to East India, are on `founding-of-babel`. The earth lay waste 130 or 140 yeeres, on `the-flood`. Cush’s 130 yeares of thickets is on `cush`. Moses wrote of Paradise about 850 yeeres after the Flood, on `the-flood`.

`founding-of-rome` has his Worlds yeere 3280 (Chapter VII, §. II, sig. 94b). `flood-of-ogyges` has his 580 and his 613 yeeres after the general Flood. Eusebius’s 3440 was not entered.

### Cumulative

- Dated statements written: 31 (4 in pass 1, 27 in pass 2)
- People created: 0
- Places created: 0
- Events created: 0
- Records updated: 18
- Name forms added: 5
- Figures skipped: 39 (15 in pass 1, 24 in pass 2)

## Pass 3

Kevin’s rulings of 2026-11-07, recorded in section N:

- N3 is answered with option 2. A person record is made for every person Raleigh names, dated or not. An undated person gets a null CFAH date, the note `pending CFAH reference`, tier `none`, and `sorting_year` null. An existing record or name form is used first. A group is not split into invented individuals.
- The 1617 text is public domain (CC0 transcription in `sources/raleigh/`). There is no quote-length limit for Raleigh. AGENTS.md section 5 says the short-quote rules apply to copyrighted works only.
- Every person and event the covered text discusses has a closed `<details>` section, summary “Raleigh’s account”, with his passages in book order. The passages are stored once in `data/raleigh-accounts.json`. `scripts/validate.mjs` requires each passage to occur in the committed 1617 XML after whitespace is collapsed. The spelling toggle matches the chronological table. Example pages: `/events/creation-week/` and `/people/moses/`.

The backfill is the Preface, the contents, and Book I, Part I, Chapters I–VII. The new chapter is Book I, Part I, Chapter VIII, §. I, sig. 111b, through Chapter VIII, §. XV, subsection VI, sig. 135b–136a. The same citation rules as passes 1 and 2. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. Chapter VIII printed one such year that was not already the table cell: 1757 or 1758 at Phaleg’s birth. The table cell on `peleg` is World 1758. 1757 was not entered as a second Raleigh year.

N5 and N6 were carried out as option 2 of each item, because ruling A requires the person. Kevin did not answer N5 or N6 in those words. The notes say so, and section N says so, so he can correct them.

### Counts

- Dated statements written: 4 (three on `deucalion`, one on `ogyges`)
- People created: 271 (230 first named in the Preface, the contents, or Chapters I–VII; 41 first named in Chapter VIII)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0
- Name forms added: 231 (147 on the new people, 84 on people who already had records)
- Accounts: 1389 passages, on 389 people and 5 events (`creation-week`, `the-flood`, `founding-of-babel`, `flood-of-ogyges`, `founding-of-rome`)

The statements and the Chapter VIII years that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement.

### Cumulative

- Dated statements written: 35 (4 in pass 1, 27 in pass 2, 4 in pass 3)
- People created: 271
- Places created: 0
- Events created: 0
- Name forms added: 236 (5 through pass 2, 231 in pass 3)
- Accounts: 1389 passages on 394 records

## Pass 4

Book I, Part I, Chapter IX, §. I, sig. 136a, through Chapter XII, §. V, sig. 157a. The opening heading is “CHAP. IX. Of the beginning and establishing of Gouernement.” Book I ends on sig. 157a with “Finis Libri primi.” The same rules as pass 3. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. Chapter IX printed none. Two statements were added. Lengths already on the chronological table were not entered again.

### Counts

- Dated statements written: 2 (`ninus` death at the yeere of the World 2019; `rabanus`, archbishop of Mentz in the yeere of Christ 854, with `year_am` null)
- People created: 73 (16 first named in the Preface, the contents, or Chapters I–VII; 3 first named in Chapter VIII; 54 first named in Chapters IX–XII)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. `ninus` and `rabanus` each gained one statement. No other person or event file was edited.
- Name forms added: 47 (30 on the new people, 17 on people who already had records). No existing form was rewritten.
- Accounts: 1,546 passages, on 467 people and 6 events. The sixth event is the existing `nimrod-builds-nineveh`. The first 1,389 passages are unchanged.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. `sorting_year`, `sorting_basis`, and `standby` are unchanged on the 2,028 people and events that already exist on `origin/main`.

### Cumulative

- Dated statements written: 37 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4)
- People created: 344
- Places created: 0
- Events created: 0
- Name forms added: 283 (5 through pass 2, 231 in pass 3, 47 in pass 4)
- Accounts: 1,546 passages on 473 records

## Pass 5

Book II, Part I, Chapter I, §. I, sig. 157b, through §. XIII, sig. 167a–167b. The book heading is “THE SECOND BOOKE.” The chapter heading is “CHAP. I. Of the time of the birth of ABRAHAM: and of the vse of this question, for the ordering of the Storie of the Assyrian Empire.” The next chapter, “CHAP. II. Of the Kings of Aegypt from the first peopling of it after the Floud, to the time of the deliuerie of the Israelites from thence,” opens on sig. 168a and was not entered. The same rules as passes 3 and 4, plus the modern-reading rules of 2026-11-08. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. Three such sentences were new. The 2009 birth sentence was already on `abraham`.

### Counts

- Dated statements written: 3 (`sarai` death at the yeere of the World 2145; `terah` death at 2083; `ishmael` birth at the Worlds yeere 2094)
- People created: 40 (9 first named in the Preface, the contents, or Chapters I–VII; 1 first named in Chapter VIII, `rebecca`; 30 first named in Book II, Part I, Chapter I)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. `sarai`, `terah`, and `ishmael` each gained one statement. No other person or event file was edited. `abraham` already had the 2009 sentence. The existing event `abraham-birth` gained that passage in the account file.
- Name forms added: 20 (2 on the new people, Areta on `aretas` and Nicholas Damascenus on `nicholas-damascenus`; 18 on people who already had records). No existing form was rewritten.
- Accounts: 1,615 passages, on 514 people and 7 events. The seventh event is the existing `abraham-birth`. The first 1,546 passages are unchanged.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. `sorting_year` on the three edited people stays `sarai` −1987, `terah` −2126, and `ishmael` −1910. `sorting_year`, `sorting_basis`, and `standby` are unchanged on the 2,028 people and events that already exist on `origin/main`.

### Cumulative

- Dated statements written: 40 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5)
- People created: 384
- Places created: 0
- Events created: 0
- Name forms added: 303 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5)
- Accounts: 1,615 passages on 521 records

## Pass 6

Book II, Part I, Chapter II, §. I, sig. 168a, through §. VIII, sig. 172b–173a. The heading is “CHAP. II. Of the Kings of Aegypt from the first peopling of it after the Floud, to the time of the deliuerie of the Israelites from thence.” Chapter III, “CHAP. III. Of the deliuery of Israel out of Aegypt,” opens on sig. 173b and was not entered. The same rules as passes 3, 4, and 5, plus the modern-reading rules of 2026-11-08. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. The Egyptian table in §. I is headed An. Mundi and gave eleven such years. Cham’s chronological-table year 1848 was already stored; 1847 from this table was stored beside it. Lengths already on the chronological table were not entered again.

### Counts

- Dated statements written: 29 (11 An. Mundi years from the §. I table; Cham’s 191 years after the Flood; William of Tyre’s yeere of our Lord 1180; 16 reign lengths and one war length)
- People created: 28 (9 first named in the Preface, the contents, or Chapters I–VII; 1 first named in Chapter VIII, `ortelius`; 1 first named in Chapter X, `telegonus`; 1 first named in Chapter XI, `bunting`; 16 first named in Book II, Part I, Chapter II)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Eleven existing people gained statements: `cham`, `osiris`, `typhon`, `hercules`, `orus`, `sesostris`, `thermutis`, `acherrhes`, `armais`, `danaus`, and `ramesses`. No event file was edited. Six existing events gained account passages: `exodus`, `jacob-enters-egypt`, `joseph-made-vizier`, `joseph-sold-into-egypt`, `moses-birth`, and `mizraim-settles-egypt`.
- Name forms added: 45 (36 on the new people, 9 on people who already had records). No existing form was rewritten.
- Accounts: 1,642 passages, on 559 people and 13 events. The first 1,615 passages are unchanged.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. Six existing people gained a calculated sort from a new An. Mundi year, per N22: `osiris` −2025, `hercules` −1764, `typhon` −1764, `orus` −1757, `sesostris` −1642, `thermutis` −1557. `year_bc_ad` stays null. `cham` keeps −2185 from 1848. Four new people also received a calculated reign-start sort: `busiris` −1595, `sesostris-the-blinde` −1609, `rathoris` −1545, `chencres` −1536.

### Cumulative

- Dated statements written: 69 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6)
- People created: 412
- Places created: 0
- Events created: 0
- Name forms added: 348 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6)
- Accounts: 1,642 passages on 572 records

## RESUME POINT

Book II, Part I, Chapter III, §. I, sig. 173b. The heading is “CHAP. III. Of the deliuery of Israel out of Aegypt.” Pass 6 stopped at the end of Chapter II. The last stored passage is p01642, Book II, Part I, Chapter II, §. VIII, sig. 172b–173a. Do not start again inside Chapter II.
