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

## Pass 7

Book II, Part I, Chapter III, sig. 173b, through §. IX, sig. 183a–183b. The heading is “CHAP. III. Of the deliuery of Israel out of Aegypt.” Fifty passages, p01643–p01692. Chapter IV, “CHAP. IIII. Of the iournying of the Israelites from the Red Sea, to the place where the Law was giuen them: with a discourse of Lawes,” opens on sig. 184a and was not entered. The same rules as passes 3, 4, 5, and 6. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. The one new printed World year in this chapter, Joseph at 2370, was stored with `year_am` null beside the table’s 2369 (N41). Lengths already on the chronological table were not entered again. No calculated sort was written.

### Counts

- Dated statements written: 21 (reign lengths for Saphrus, Mamelus, Cecrops, Ascatades, and Chencres; Moses’s age, the Midian 40, the Hebrew-year 40, the oppression interval, the Saphrus synchronism, and the Ethiopian war; Joseph’s 54, 64, and 2370; Onias’s 333; the cycles of Meton, Calippus, and Hipparchus; Pope Gregory XIII at Anno Domini 1582; Orosius about 400 years after Christ)
- People created: 46 (5 first named in the Preface, the contents, or Chapters I–VII; 1 first named in Chapter VIII, `brochard`; 40 first named in Book II, Part I, Chapter III)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Seven existing people gained statements: `ascatades`, `cecrops`, `chencres`, `joseph`, `moses`, `onias-high-priest`, and `orosius`. Six new people also received statements: `saphrus`, `mamelus`, `meton`, `calippus`, `hipparchus`, and `gregorie-xiii`. No event file was edited. Four existing events gained account passages: `exodus` (19), `moses-birth` (11), `moses-flees-to-midian` (3; its first account), and `burning-bush` (1; its first account). The two Chapter III sentences that say “the floud” are the Red Sea tide. They were not put on `the-flood`.
- Name forms added: 21 (3 on the new people, Spherus on `saphrus`, SIGONIVS on `sigonius`, and Gama on `steaen-gama`; 18 on people who already had records). No existing form was rewritten. Six clause-length forms the engine drafted were dropped before they were committed, because they are sentences rather than spellings.
- Accounts: 1,692 passages, on 614 people and 15 events. The first 1,642 passages are unchanged. Nine existing people received their first account: `aaron`, `amosis-mendesius`, `apis-of-argiues`, `bocchorus`, `herod-the-great`, `onias-high-priest`, `sethosis`, `sparetus`, and `thmosis`.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. No `year_am` was stored, so no calculated sort changed. `sorting_year` stays `ascatades` −1527, `chencres` −1536, `joseph` −1745, `moses` −1571, and `onias-high-priest` −213. `cecrops` and `orosius` stay without a sort year.

### Cumulative

- Dated statements written: 90 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7)
- People created: 458
- Places created: 0
- Events created: 0
- Name forms added: 369 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7)
- Accounts: 1,692 passages on 629 records

## Pass 8

Book II, Part I, Chapter IV, sig. 184a, through §. XVI, sig. 198b–199a. The heading is “CHAP. IIII. Of the iournying of the Israelites from the Red Sea, to the place where the Law was giuen them: with a discourse of Lawes.” One hundred sixty-five passages, p01693–p01857. Chapter V opens on sig. 199b and was not entered. The body heading there is “CHAP. V. The Storie of the 〈◊ 〉 from the receiuing of the Law to the death of MOSES.” The contents line for that chapter was already stored. The same rules as passes 3, 4, 5, 6, and 7. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. No new yeere of the World was stored. The birth at 2434, the flight at 2474 beside the table’s 2473, and the Passover at 2514 were already on the table importer’s notes and were not entered again. No calculated sort was written.

### Counts

- Dated statements written: 9 (Moses’s wandering 40, the year 2515, the camp of almost a year, the Sinai stay, and the 2513 whole yeeres; Abraham’s 430 after the promise; Homer’s 80 after Troy; Troy’s 335 after the Exodus; the Twelve Tables’ 303 after the city)
- People created: 22 (2 first named in Book I and reached by a spelling this chapter uses, `danaeus` and `solon`; 20 first named in Book II, Part I, Chapter IV)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Three existing people gained statements: `moses`, `abraham`, and `homer`. Three existing events gained statements: `wilderness-wanderings`, `twelve-tables`, and `fall-of-troy`. Their `sorting_year` values stay −1490, −450, and −1184. Four existing events gained account passages: `exodus` (4), `moses-birth` (1), `moses-flees-to-midian` (1), and `the-flood` (1; the sentence is Noah, p01760). Four events received their first account: `arrival-at-sinai` (4), `wilderness-wanderings` (1), `fall-of-troy` (2), and `twelve-tables` (1). One existing person received a first account: `dinah`.
- Name forms added: 22 (3 on the new people, M r. Hooker on `hooker`, G. Valentia on `valentia`, and Master Doctor Willet on `willet`; 19 on people who already had records). No existing form was rewritten. Seven clause-length forms the engine drafted were dropped before they were committed, because they are sentences rather than spellings. Raguel, Hobab, and NOA were added by hand. The engine’s first-hit gate had skipped them.
- Accounts: 1,857 passages, on 637 people and 19 events. The first 1,692 passages are unchanged.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. No `year_am` was stored, so no calculated sort changed. `sorting_year` stays `ascatades` −1527, `triopas` −1560, `joseph` −1745, `moses` −1571, `onias-high-priest` −213, `john-the-baptist` −5, `twelve-tables` −450, `wilderness-wanderings` −1490, and `fall-of-troy` −1184. `cecrops` and `homer` stay without a sort year.

### Cumulative

- Dated statements written: 99 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8)
- People created: 480
- Places created: 0
- Events created: 0
- Name forms added: 391 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8)
- Accounts: 1,857 passages on 656 records

## Pass 9

Book II, Part I, Chapter V, sig. 199b, through §. X, sig. 206b–207a. The heading is “CHAP. V. The Storie of the 〈◊ 〉 from the receiuing of the Law to the death of MOSES.” Fifty-two passages, p01858–p01909. Chapter VI, “CHAP. VI. Of the Nations with whom the Israelites had dealing after their comming out of Aegypt; and of the men of renowne in other Nations, about the times of MOSES and IOSVA, with the summe of the Historie of IOSVA,” opens on sig. 207a and was not entered. The contents line for Chapter V was already stored. The body heading leaves the nation as a gap. That gap was not filled. The same rules as passes 3, 4, 5, 6, 7, and 8. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. The one printed World year in this chapter is “which happened in the yeere of the World 25 54”, with a space in the figures. It was not joined and was not stored (N51). The table row “The Last yeere of Moses.” at World 2553 was not entered again. No calculated sort was written.

### Counts

- Dated statements written: 7 (Jethro’s 42 yeeres before the request; the Passover on the foureteenth day of the second moneth of the second yeere; the 38 yeeres consumed; the nine and thirtieth yeere at Esiongaber; Aaron’s death on the first day of the fifth Moneth of the fortieth yeere; Miriam’s leprosy of seuen daies; the first Moneth of the fortieth yeere in the wilderness of Zin, which is Kadesh)
- People created: 46 (4 first named before this chapter and reached by a spelling this chapter uses, `amos`, `nathan`, `sehon`, and `theodoretus`; 42 first named in Book II, Part I, Chapter V)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Four existing people gained statements: `jethro`, `moses`, `aaron`, and `miriam`. Two existing events gained statements: `wilderness-wanderings` and `return-to-kadesh`. Their `sorting_year` values stay `moses` −1571, `aaron` −1574, `wilderness-wanderings` −1490, and `return-to-kadesh` −1452. `miriam` and `jethro` stay without a sort year. `cambyses` stays −531. Six existing events gained account passages: `exodus` (1), `moses-birth` (1), `moses-flees-to-midian` (1), `burning-bush` (1), `the-flood` (1; p01902, “before and after the floud”), and `wilderness-wanderings` (3). Three events received their first account: `tabernacle-set-up` (1), `return-to-kadesh` (2), and `sihon-of-heshbon-conquered` (6). Sixteen existing people received their first account: `asher`, `benjamin`, `caleb`, `cambyses`, `ephraim`, `gad`, `issachar`, `jehoshaphat`, `levi`, `manasseh`, `manasses`, `miriam`, `naphtali`, `rachel`, `simeon`, and `zebulun`.
- Name forms added: 25 (6 on the new people, Ieedo the Seer on `ieedo`, Naashon on `naason`, Nathaniel on `nethaneel`, Schon and Sihon on `sehon`, and VAHEBVM on `vaheb`; 19 on people who already had records). No existing form was rewritten. One clause-length form the engine drafted, “Regiments of Manasse”, was dropped before it was committed, because it is a sentence rather than a spelling. Ten spellings the engine’s first-hit gate skipped were added by hand: Belonius, Beniamin, Iosuah, Hieromes, Leui, Nephtali, Rabbi Salomon, Ruben, Sihon, and Zabulon.
- Accounts: 1,909 passages, on 699 people and 22 events. The first 1,857 passages are unchanged.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. No `year_am` was stored, so no calculated sort changed. `sorting_year` stays `moses` −1571, `aaron` −1574, `cambyses` −531, `wilderness-wanderings` −1490, and `return-to-kadesh` −1452. `jethro` and `miriam` stay without a sort year.

### Cumulative

- Dated statements written: 106 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9)
- People created: 526
- Places created: 0
- Events created: 0
- Name forms added: 416 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9)
- Accounts: 1,909 passages on 721 records

## Pass 10

Book II, Part I, Chapter VI, sig. 207a, through §. VIII, sig. 216b–217a. The heading is “CHAP. VI. Of the Nations with whom the Israelites had dealing after their comming out of Aegypt; and of the men of renowne in other Nations, about the times of MOSES and IOSVA, with the summe of the Historie of IOSVA.” One hundred five passages, p01910–p02014. Chapter VII opens after sig. 217a and was not entered. The contents line for Chapter VI was already stored. The same rules as passes 3–9. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. This chapter printed none. The 18 yeeres of Joshua’s rule and Sthenelus’s 11 are already the table lengths and were not entered again. No calculated sort was written.

This pass also split the Julian Period year from the World column on A Chronological Table, and linked uniquely matched person and event names in the table cells.

### Counts

- Dated statements written: 15 (Prometheus 94 after Ogyges; Joshua’s 110, the other writers’ lengths, and the fifth year of his government; Jabin the second’s 20; Danaus’s 50; Crotopus’s tenth year; Deucalion’s reign with Moses; Mercurius’s 300; Saul’s 400 after Joshua; the Midianite 7; the 480 to the Temple; no void years before Othniel; the 41st year of the Egression at the Jordan)
- People created: 101 (26 first named before this chapter and reached by a spelling this chapter uses; 75 first named in Book II, Part I, Chapter VI)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Seven existing people gained statements: `prometheus`, `iosua`, `danaus`, `crotopus`, `deucalion`, `mercurius`, and `saul`. Five existing events gained statements: `midianite-oppression`, `founding-of-solomons-temple`, `death-of-joshua`, `othniel-judges-israel`, and `crossing-the-jordan`. Ten events received their first account: `conquest-of-canaan`, `crossing-the-jordan`, `fall-of-jericho`, `joshuas-long-day`, `death-of-joshua`, `gideon-defeats-midian`, `midianite-oppression`, `deborah-and-barak`, `othniel-judges-israel`, and `founding-of-solomons-temple`. Their `sorting_year` values are unchanged.
- Name forms added: 32 (on new and existing people). No existing form was rewritten. Thirty-five clause-length forms the engine drafted were dropped before they were committed, because they are sentences rather than spellings.
- Accounts: 2,014 passages, on 809 people and 32 events. The first 1,909 passages are unchanged.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer was re-run. The new people are display-only, and none of them has a standby placement. No `year_am` was stored, so no calculated sort changed.

### Cumulative

- Dated statements written: 121 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10)
- People created: 627
- Places created: 0
- Events created: 0
- Name forms added: 448 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10)
- Accounts: 2,014 passages on 841 records

## Pass 11

Book II, Part I, Chapter VII, sig. 217a, through §. VII, subsection II, sig. 231b. The heading is “CHAP. VII. Of the Tribes of 〈◊ 〉, that were planted in the borders of Phoenicia, with sundrie Stories depending vpon those places.” One hundred fifty-six passages, p02015–p02170. Chapter VIII opens after sig. 231b and was not entered. The same rules as passes 3–10. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. This chapter printed none. No calculated sort was written.

Chapter VII is a description of the land. It prints most places in capitals, so the automatic linker would have made people of cities, rivers, and headings. In this chapter the people and events on each passage are named by hand in `scripts/raleigh/ch7-attach.mjs`, and only those links are kept. 140 of the 156 passages carry at least one link. See N59.

### Counts

- Dated statements written: 8 (Tyre elder than the Temple by 240 or 361 yeeres; Elulaeus’s 26 yeeres; Salmanassar’s 5 yeeres before Tyre; Nebuchadnezzar about 200 yeeres before Alexander, and his 13 yeeres’ siege; Iabin the second 137 yeeres after the first; Iabin’s 20 yeeres of servitude; Paul two yeeres prisoner under Felix)
- People created: 119, all first named in Book II, Part I, Chapter VII
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Four existing people gained statements: `elulaeus`, `salmanassar`, `nebuchadnezzar-ii` (two), and `jabin-the-second`. Three existing events gained statements: `founding-of-tyre`, `oppression-of-jabin`, and `paul-before-felix`. `salmanassar` also gained the leading `cfah` null reign entry the schema requires. Twenty events received Chapter VII accounts, 17 of them their first: `alexander-destroys-tyre`, `assyria-invades-israel-740-bc`, `battle-of-aphek`, `conversion-of-cornelius`, `death-of-herod-agrippa-i`, `fall-of-jerusalem-586-bc`, `founding-of-carthage`, `founding-of-tyre`, `founding-of-utica`, `oppression-of-jabin`, `paul-before-felix`, `paul-before-festus-and-agrippa`, `reign-of-abimelech`, `reign-of-julian-the-apostate`, `saul-defeats-the-ammonites`, `third-crusade`, and `transfiguration`. Their `sorting_year` values are unchanged. Eighteen existing people received their first account, among them `ahab`, `jehu`, `jephthah`, `zedekiah`, and `tiglath-pileser-iii`.
- Name forms added: 67 (on new and existing people). No existing form was rewritten.
- Accounts: 2,170 passages, on 946 people and 49 events. The first 2,014 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. No importer except the CFAH import and the standby compute was re-run, and both wrote nothing new. The new people are display-only, and none of them has a standby placement. No `year_am` was stored, so no calculated sort changed. The open questions for this chapter are N59–N64.

### Cumulative

- Dated statements written: 129 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11)
- People created: 746
- Places created: 0
- Events created: 0
- Name forms added: 515 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11)
- Accounts: 2,170 passages on 995 records

## Pass 12

Book II, Part I, Chapter VIII, sig. 231b, through Chapter IX, §. III, sig. 239b. The headings are “CHAP. VIII. Of the Kingdome of Phoenicia.” and “CHAP. IX. Of the Tribe of EPHRAIM, and of the Kings of the tenne Tribes, whose head was EPHRAIM.” One hundred two passages, p02171–p02272: 51 in Chapter VIII (p02171–p02221) and 51 in Chapter IX (p02222–p02272). Chapter VIII alone was short, so Chapter IX was taken with it. Chapter X opens after sig. 239b and was not entered. The same rules as passes 3–11. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. He prints one, 3292, for the carrying away of the ten Tribes. It is on `fall-of-samaria`, which keeps its tier 1–4 sort. No calculated sort was written.

As in Chapter VII, the people and events on each passage are named by hand, in `scripts/raleigh/ch8-9-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the Chapter VII table. In these two chapters a spelling that is already the title or a stored form of another record is not added as a name form. 97 of the 102 passages carry at least one link. The five without one are the Chapter VIII heading, its §. I and §. II headings, the Gosna passage, and the sentence that defers the first Kings of Israel. See N65.

### Counts

- Dated statements written: 32. Seventeen are on the Kings of Tyre and on Carthage: Hiram’s 53 yeeres of life, and the reigns of Baleastartus, Abdastartus, Astartus, Astarimus, Phelles, Ithobalus, Badezor, Mettimus, Pygmalion, Eluleus, Ethobales, Baal, Balatorus, Merbalus, and the second Irom, plus Carthage in Pygmalion’s 7th yeere. Fourteen are on the Kings of the ten Tribes: Nadab, Baasha, Ela, Zambris, Ambris, Achab, Ochozias, Ioram, Ieroboam the second, Zacharias, Shallum, Menahem, and Pekah, plus Shishak in the fifth yeere of Rehoboam. One is the yeere of the World 3292 for the ten Tribes.
- People created: 61, all first named in Book II, Part I, Chapters VIII and IX
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Twenty-nine existing people gained statements. `hiram-of-tyre` also gained the leading `cfah` null death entry the schema requires. Three existing events gained statements: `founding-of-carthage`, `shishak-sacks-the-temple`, and `fall-of-samaria`. Fourteen events received accounts from these chapters, seven of them their first: `division-of-the-kingdom`, `fall-of-samaria`, `menahem-pays-tribute-to-pul`, `shalmaneser-besieges-samaria`, `shishak-sacks-the-temple`, `trojan-war`, and `xerxes-invades-greece`. Their `sorting_year` values are unchanged. Forty-five existing people received their first account, among them the Cory Kings of Tyre and the Kings of Israel from Nadab to Hosea.
- Name forms added: 75 (on new and existing people). No existing form was rewritten.
- Accounts: 2,272 passages, on 1,052 people and 56 events. The first 2,170 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run and wrote nothing new. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for these chapters are N65–N70.

### Cumulative

- Dated statements written: 161 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12)
- People created: 807
- Places created: 0
- Events created: 0
- Name forms added: 590 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12)
- Accounts: 2,272 passages on 1,108 records

## Pass 13

Book II, Part I, Chapter X, sig. 240a, through §. VII, sig. 252a. The heading is “CHAP. X. Of the memorable places of DAN, SIMEON, IVDA, RVBEN, GAD, and the other halfe of MANASSE.” One hundred thirty passages, p02273–p02402. Chapter XI opens after sig. 252a and was not entered. The same rules as passes 3–12. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. This chapter printed none. No calculated sort was written.

As in Chapters VII–IX, the people and events on each passage are named by hand, in `scripts/raleigh/ch10-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the Chapter VII–IX tables. A spelling that is already the title or a stored form of another record is not added as a name form. 128 of the 130 passages carry at least one link. The two without one are the Moab-coast paragraph (p02335) and the Dead Sea heading (p02354). See N71.

### Counts

- Dated statements written: 2. The Ark remained twentie yeeres at Cariathiarim, on `ark-at-kiriath-jearim`. Eglon commanded Israel eighteene yeeres, on `eglon` and `oppression-of-eglon`.
- People created: 66, all first named in Book II, Part I, Chapter X
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Two existing events gained statements: `ark-at-kiriath-jearim` and `oppression-of-eglon`. Fifteen events received accounts from this chapter, nine of them their first: `ark-at-kiriath-jearim`, `ark-brought-to-jerusalem`, `baptism-of-jesus`, `david-slays-goliath`, `destruction-of-sodom`, `jephthah-defeats-ammon`, `john-the-baptist-beheaded`, `oppression-of-eglon`, and `rebellion-of-absalom`. Their `sorting_year` values are unchanged. Eleven existing people received their first account: `athanasius-of-alexandria`, `cleopatra`, `ehud`, `gedaliah`, `ibzan`, `ish-bosheth`, `jehoram-of-judah`, `melchizedek`, `philip-ii-of-macedon`, `sosus`, and `uzziah`.
- Name forms added: 55 (on new and existing people). No existing form was rewritten.
- Accounts: 2,402 passages, on 1,129 people and 65 events. The first 2,272 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run and wrote nothing new. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for this chapter are N71–N76.

### Cumulative

- Dated statements written: 163 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12, 2 in pass 13)
- People created: 873
- Places created: 0
- Events created: 0
- Name forms added: 645 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12, 55 in pass 13)
- Accounts: 2,402 passages on 1,194 records

## Pass 14

Book II, Part I, Chapter XI, sig. 252b, through Chapter XIII, §. VIII, sig. 276b. The headings are “CHAP. XI. The Historie of the Syrians the chiefe borderers of the Jsraelites that dwelt on the East of Jordan.”, “CHAP. XII. Of the Tribe of BENIAMIN, and of Hierusalem.”, and “CHAP. XIII. Of the memorable things that happened in the world, from the death of IOSVA to the Warre of Troy: which was about the time of IEPHTHA.” One hundred sixty-nine passages, p02403–p02571: 24 in Chapter XI, 34 in Chapter XII, and 111 in Chapter XIII. Chapter XI alone was short, so XII and XIII were taken with it. Chapter XIV opens after sig. 276b and was not entered. The same rules as passes 3–13. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. He prints one, 2691, for the end of the fourescore yeeres of peace from Othoniel’s death. It is on `ehud-delivers-israel`, which keeps its tier 1–4 sort. No calculated sort was written.

As in Chapters VII–X, the people and events on each passage are named by hand, in `scripts/raleigh/ch11-13-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the Chapter VII–X tables. A spelling that is already the title or a stored form of another record is not added as a name form. 154 of the 169 passages carry at least one link. The fifteen without one are chapter and section headings of places, the short later-history notes on Hierusalem after Titus that name no person, the divinity paragraph after Tantalus, and the Argive-kings and Argonauts and Theban-war headings. See N77.

### Counts

- Dated statements written: 3. The fourescore yeeres of peace expired in the Worlds yeere 2691, on `ehud-delivers-israel`. The eight yeeres under Chushan Rishathaim, on `oppression-of-cushan-rishathaim`. The fourtie yeeres of peace in Othoniel’s time, on `othniel-judges-israel`.
- People created: 203, all first named in Book II, Part I, Chapters XI–XIII
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Three existing events gained statements: `ehud-delivers-israel`, `oppression-of-cushan-rishathaim`, and `othniel-judges-israel`. Events received accounts from these chapters; their `sorting_year` values are unchanged.
- Name forms added: 114 (on new and existing people). No existing form was rewritten. Abrabon was not stored (it would have been a ninth Abraham row). Rezon and Razin were not stored on `rezin`, and Razin was not stored on `rezon`, because those letters name both men.
- Accounts: 2,571 passages, on 1,449 records. The first 2,402 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run and wrote nothing new. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for these chapters are N77–N82.

### Cumulative

- Dated statements written: 166 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12, 2 in pass 13, 3 in pass 14)
- People created: 1,076
- Places created: 0
- Events created: 0
- Name forms added: 759 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12, 55 in pass 13, 114 in pass 14)
- Accounts: 2,571 passages on 1,449 records

## Pass 15

Book II, Part I, Chapter XIV, sig. 277a, through Chapter XVII, §. X, sig. 302b. The headings are “CHAP. XIIII. Of the Warre of Troy.”, “CHAP. XV. Of SAMSON, ELI, and SAMVEL.”, “CHAP. XVI. Of SAVL.”, and “CHAP. XVII. Of DAVID.” One hundred eighty-six passages, p02572–p02757: 37 in Chapter XIV, 20 in Chapter XV, 41 in Chapter XVI, and 88 in Chapter XVII. Chapters XIV–XVI together were under the floor, and XVII is one chapter, so the pass stops at the end of XVII. Chapter XVIII opens on sig. 302b and was not entered. The same rules as passes 3–14. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. He prints two. 2848, for the fall of Troy, is on `fall-of-troy`, which keeps its tier 1 sort. Mercator’s 3046 for Homer is another man’s reckoning and is not stored. “Dauid died in the yeere 2991” does not say yeere of the World and is not stored. No calculated sort was written.

As in Chapters VII–XIII, the people and events on each passage are named by hand, in `scripts/raleigh/ch14-17-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the Chapter VII–XIII tables. A spelling that is already the title or a stored form of another record is not added as a name form. 177 of the 186 passages carry at least one link. The nine without one are p02573, p02580, p02592, p02612, p02630, p02638, p02734, p02749, and p02754. See N83.

### Counts

- Dated statements written: 1. Troy fell about the worlds yeere 2848, on `fall-of-troy`.
- People created: 177, all first named in Book II, Part I, Chapters XIV–XVII
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 1. `fall-of-troy` gained the worlds yeere 2848. Its `sorting_year` stays −1184. Events received accounts from these chapters. No existing person file was replaced.
- Name forms added: 94 (on new and existing people). No existing form was rewritten. A surface already held by another record was not stored, including Darius, Iosua, Abimelech, Aminadab, Ioel, Ioas, Eleazar, and Pyrrhus.
- Accounts: 2,757 passages, on 1,654 records. The first 2,571 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run after the accounts were written. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for these chapters are N83–N88.

### Cumulative

- Dated statements written: 167 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12, 2 in pass 13, 3 in pass 14, 1 in pass 15)
- People created: 1,253
- Places created: 0
- Events created: 0
- Name forms added: 853 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12, 55 in pass 13, 114 in pass 14, 94 in pass 15)
- Accounts: 2,757 passages on 1,654 records

## Pass 16

This entry covers the work that would have been pass 17. Kevin asked on 2026-11-17 that the two be folded into pass 16. Book II, Part I, Chapter XVIII, sig. 302b, through Chapter XXIII, §. VII, sig. 345a. The headings are “CHAP. XVIII. Of SALOMON.”, “CHAP. XIX. Of SALOMONS Successors vntill the end of IEHOSAPHAT.”, “CHAP. XX. Of IEHORAM the sonne of IEHOSAPHAT, and AHAZIA.”, “CHAP. XXI. Of ATHALIA, and whose Sonne he was that succeeded vnto her.”, “CHAP. XXII. Of IOAS and AMASIA, with their Contemporaries; where somewhat of the building of Carthage.”, and “CHAP. XXIII. Of VZZIA.” Three hundred thirty-five passages, p02758–p03092: 50 in Chapter XVIII, 49 in Chapter XIX, 36 in Chapter XX, 44 in Chapter XXI, 63 in Chapter XXII, and 93 in Chapter XXIII. Chapter XXII ends at 242, under the floor, and XXIII is one chapter, so the pass stops at the end of XXIII. Chapter XXIV opens on sig. 345b and was not entered. The same rules as passes 3–15. `year_bc_ad` stays null. A `year_am` is stored only when he prints a yeere of the World. He prints one, 2991, and it is already the calculated reign start on `solomon` (Chronological Table, sig. 786b). It was not stored again. The sort stays −1036, tier `ussher-jones`. p03059 says “the true yeare of the World” and prints no number. Anno Domini 1588 is not a yeere of the World. Mercator’s account of Baliastrus is another man’s reckoning and is not stored. No calculated sort was written.

As in Chapters VII–XVII, the people and events on each passage are named by hand, in `scripts/raleigh/ch18-23-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the Chapter VII–XVII tables. A spelling that is already the title or a stored form of another record is not added as a name form. 320 of the 335 passages carry at least one link. The fifteen without one are p02782, p02833, p02878, p02891, p02897, p02911, p02918, p02925, p02927, p02931, p02951, p02959, p02990, p03053, and p03071. See N89.

### Counts

- Dated statements written: 0
- People created: 117, all first named in Book II, Part I, Chapters XVIII–XXIII, all display-only
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Events received accounts from these chapters. No existing person file was replaced.
- Name forms added: 136 (on new and existing people). No existing form was rewritten. A surface already held by another record was not stored. `Iehorams` is on both `jehoram` and `joram-king-of-israel`, because the sentence names the two kings. The name-link review leaves that token unmatched.
- Accounts: 3,092 passages, on 1,808 records. The first 2,757 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run after the accounts were written. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for these chapters are N89–N93.

### Cumulative

- Dated statements written: 167 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12, 2 in pass 13, 3 in pass 14, 1 in pass 15, 0 in pass 16)
- People created: 1,370
- Places created: 0
- Events created: 0
- Name forms added: 989 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12, 55 in pass 13, 114 in pass 14, 94 in pass 15, 136 in pass 16)
- Accounts: 3,092 passages on 1,808 records

## Pass 18

Book II, Part I, Chapter XXIV, sig. 345b, through Chapter XXVIII, §. VI, sig. 380b. The headings are “CHAP. XXIIII. Of the Antiquities of 〈◊ 〉, and 〈◊ 〉 of Rome in the time of AHAS.” (both gaps stay empty), “CHAP. XXV. Of EZEKIA, and his Contemporaries.”, “CHAP. XXVI. Of the Kings that raigned in Aegypt, betweene the deliuerance of ISRAEL from thence, and the raigne of EZEKIA in Juda.”, “CHAP. XXVII. Of MANASSE and his Contemporaries.”, and “CHAP. XXVIII. Of the times from the death of MANASSES to the destruction of Jerusalem.” Two hundred sixty-six passages, p03093–p03358: 35 in Chapter XXIV, 38 in Chapter XXV, 56 in Chapter XXVI, 57 in Chapter XXVII, and 80 in Chapter XXVIII. Chapter XXVII ends at 186, under the floor, and XXVIII is one chapter, so the pass stops at the end of the book. The next words are “Finis Libri secundi.” Book III was not entered. The same rules as passes 3–16. `year_bc_ad` stays null. No yeere of the World is printed, so no `year_am` was stored. Reign lengths and other men’s reckonings were not stored. No calculated sort was written.

As in Chapters VII–XXIII, the people and events on each passage are named by hand, in `scripts/raleigh/ch24-28-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the earlier tables. A spelling that is already the title or a stored form of another record is not added as a name form. `Ananias` is on both the companion of Daniel and the false Prophet, because the passages name two men. 239 of the 266 passages carry at least one link. The twenty-seven without one are p03094, p03100, p03101, p03118, p03120, p03185, p03188, p03201, p03229, p03234, p03254, p03255, p03265, p03269, p03298, p03310, p03311, p03313, p03315, p03318, p03320, p03321, p03325, p03330, p03333, p03334, and p03347. See N94.

### Counts

- Dated statements written: 0
- People created: 168, all first named in Book II, Part I, Chapters XXIV–XXVIII, all display-only (53, 33, 24, 35, and 23)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Events received accounts from these chapters. No existing person file was replaced.
- Name forms added: 147 (45, 33, 30, 19, and 20). No existing form was rewritten. A surface already held by another record was not stored. `Ananias` is on both new records. The name-link review leaves that token unmatched.
- Accounts: 3,358 passages, on 2,009 records. The first 3,092 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run after the accounts were written. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for these chapters are N94–N97.

### Cumulative

- Dated statements written: 167 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12, 2 in pass 13, 3 in pass 14, 1 in pass 15, 0 in pass 16, 0 in pass 18)
- People created: 1,538
- Places created: 0
- Events created: 0
- Name forms added: 1,136 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12, 55 in pass 13, 114 in pass 14, 94 in pass 15, 136 in pass 16, 147 in pass 18)
- Accounts: 3,358 passages on 2,009 records

## Pass 19

Book III, Part I, Chapter I, sig. 381b, through Chapter VI, §. XI, sig. 419b. The headings are “CHAP. I. Of the time passing betweene the destruction of 〈◊ 〉, and the fall of the Assyrian Empire.” (the gap stays empty), “CHAP. II. Of the originall and first greatnesse of the Persians.”, “CHAP. III. Of CYRVS.”, “CHAP. I III. The estate of things from the death of CYRVS to the Raigne of DARIVS.” (a space in the Roman), “CHAP. V. Of DARIVS the sonne of HYSTASPES.”, and “CHAP. VI. Of XERXES.” Three hundred fifteen passages, p03359–p03673: 66 in Chapter I, 38 in Chapter II, 59 in Chapter III, 47 in Chapter IV, 45 in Chapter V, and 60 in Chapter VI. Chapter VII would make 348, past the top of the range, so the pass stops at the end of Chapter VI. The same rules as passes 11–18. `year_bc_ad` stays null. No yeere of the World is printed, so no `year_am` was stored. Reign lengths, the second and sixth yeeres of Darius, the Olympiad, the 36 yeeres, the four yeeres of gathering the army, and “in the yeere 1588” were not stored. No calculated sort was written.

The people and events on each passage are named by hand, in `scripts/raleigh/b3-ch1-attach.mjs`. `scripts/raleigh/hand-attach.mjs` joins it with the earlier tables. `BOOK3_THROUGH` is 6. A spelling that is already the title or a stored form of another record is not added as a name form. 285 of the 315 passages carry at least one link. The thirty without one are p03359, p03360, p03371, p03374, p03382, p03425, p03434, p03443, p03448, p03485, p03491, p03493, p03523, p03530, p03543, p03549, p03555, p03565, p03583, p03587, p03592, p03596, p03604, p03620, p03642, p03653, p03657, p03662, p03667, and p03672. See N98.

### Counts

- Dated statements written: 0
- People created: 158, all first named in Book III, Part I, Chapters I–VI, all display-only (15, 24, 17, 20, 60, and 22)
- Places created: 0
- Events created: 0
- Existing person and event files rewritten: 0. Events received accounts from these chapters. No existing person file was replaced.
- Name forms added: 87 (25, 11, 14, 14, 15, and 8). The note on each of these forms is “Spelling only. Read in Book III, Part I, Chapters I–VI.” No earlier form was rewritten. A surface already held by another record was not stored.
- Accounts: 3,673 passages, on 2,191 records. The first 3,358 passages are unchanged, and no earlier link was dropped.

The statements and the figures that were not entered are quoted in `data/raleigh-body-extract.md`. The CFAH import and the standby compute were run after the accounts were written. No other importer was re-run. The new people are display-only, and none of them has a standby placement. The open questions for these chapters are N98–N101.

### Cumulative

- Dated statements written: 167 (4 in pass 1, 27 in pass 2, 4 in pass 3, 2 in pass 4, 3 in pass 5, 29 in pass 6, 21 in pass 7, 9 in pass 8, 7 in pass 9, 15 in pass 10, 8 in pass 11, 32 in pass 12, 2 in pass 13, 3 in pass 14, 1 in pass 15, 0 in pass 16, 0 in pass 18, 0 in pass 19)
- People created: 1,696
- Places created: 0
- Events created: 0
- Name forms added: 1,223 (5 through pass 2, 231 in pass 3, 47 in pass 4, 20 in pass 5, 45 in pass 6, 21 in pass 7, 22 in pass 8, 25 in pass 9, 32 in pass 10, 67 in pass 11, 75 in pass 12, 55 in pass 13, 114 in pass 14, 94 in pass 15, 136 in pass 16, 147 in pass 18, 87 in pass 19)
- Accounts: 3,673 passages on 2,191 records

## RESUME POINT

Book III, Part I, Chapter VII. The heading is “CHAP. VII. Of things that passed in Greece from the end of the Persian Warre, to the beginning of the Peloponnesian.” Pass 19 stopped at the end of Chapter VI. The last stored passage is p03673, Book III, Part I, Chapter VI, §. XI, sig. 419b. The next passage is p03674, sig. 420a. Do not start again inside Chapters I–VI. The hand table is `scripts/raleigh/b3-ch1-attach.mjs`. `BOOK3_THROUGH` is 6. The next pass raises it when Chapter VII is stored, and adds that chapter to `B3_CHAPTERS` before the covered write. The chapter names many people who share letters with records already stored.
