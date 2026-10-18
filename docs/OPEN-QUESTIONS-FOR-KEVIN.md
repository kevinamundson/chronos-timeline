# Open questions for Kevin

*Compiled 2026-10-18. It merges the still-open items from `docs/open-questions.md` (numbered "OQ n" there) with new items from batches 1–4, the OSF collation, the chart gallery and the Jordan-compilation work.*

Each item gives the question, why it matters, the options and a recommendation. The items are in priority order:

- **A** changes what the timeline sorts on.
- **B** changes what is shown or flagged.
- **C** is housekeeping.

Answer by number, for example "A1: option 2". Nothing below has been guessed into the data. Where a choice was needed to keep working, the current behaviour is stated and is easy to change.

---

## Resolved

- ~~**(a) Unknown-author Drive file "Anno Mundi_Chronology_Studies2.pdf"**~~: **RESOLVED 2026-10-18.**
  - You confirmed it is an accurate compilation of James B. Jordan's system, by an unnamed compiler.
  - It is now the source `jordan-compilation-anno-mundi` and a separate secondary display chronology, `jordan-compilation`. That chronology is never a sort tier and is distinct from `jordan`.
  - 92 entries are attached to 67 records, with page and chart citations. Each entry says whether it agrees with Jordan's own published AM figure.
  - Where they differ:

    | Item | Compilation | Jordan's own |
    |---|---|---|
    | Enosh's death | AM 1130 | 1140 |
    | Mahalalel's birth | 395 | 396 (Jordan's own misprint) |
    | Arphaxad's death | 2093 at age 435 | 2096 at 438 (MT); compilation slip |
    | Dispersion/Babel | "1780?" | 1871 |
    | Jacob's death | 2315 | 2313 (Jordan's slip) |
    | Moses' death | 2553 | 2554 |
    | Joshua's death | 2584 | 2585 |
    | Jephthah | 2878 | 2879 |
    | Temple | "completed 3000" | dedication 3014 (2993 foundation) |

  - The compilation's own BC column is a flat 4010 − AM: Creation 4010, Flood 2354, Abraham enters Canaan 1927, Exodus 1497, Othniel 1382, Saul 1101, Temple 1010 BC. These figures are displayed, not used for sorting.
  - **Correction:** the Drive id passed along earlier (11zUlqRaS-…) is actually your copy of Jordan's *From Creation to Solomon*. The compilation is id **1dPdwn1EBN10HftM8hbS2DPShHDc3kjsS**. Its Drive link only works for you, so the source is marked `access: private-copy`; see C6.
- ~~Sort-tier fallback~~ (decided 2026-10-17): CFAH anchor point > CFAH-1 Table 1 > Ussher–Jones > Ussher.

---

## A. Questions that change the sort order

### A1. Should CFAH dates from OSF preprints, or CFAH dates that are not anchor points, count as tier 1?
- **Why it matters:** this decides where about 7 records sit on the timeline.
  - Batch 3 used six OSF-preprint anchor points as **tier 1**:
    - AP-82 (CFAH-13 p. 31)
    - AP-88 to AP-91 (CFAH-14 pp. 19–22)
    - AP-92, Sargon 1619 BC (CFAH-15 p. 21)
    - AP-93, Hammurabi's death 989 BC (CFAH-15 p. 28)
  - None of these is peer-reviewed in ARJ yet.
  - Separately, CFAH-6 gives some dates that are neither an AP nor in Table 1, for example "Abraham and Khufu 1921 BC" (which takes Jones's date) and the patriarch overlaps in Fig. 16. These are recorded in the CFAH note with a null date, so those records sort on Jones or Ussher.
- **Options:**
  1. Keep it as now: preprint APs are tier 1, and non-AP CFAH dates are in notes only.
  2. Treat preprint APs as notes only until ARJ publishes them.
  3. Promote non-AP CFAH dates to a new "CFAH text" tier between Table 1 and Jones.
- **Recommendation:** option 1. The authors number them as anchor points. Each record already says "OSF preprint".

### A2. Jones's Chart 4 or Jones's 2002 book for Cushan-rishathaim? (OQ 22)
- **Why it matters:** the oppression begins in 1418 BC on Chart 4 (1993/2007) but in 1400 BC in *Chronology of the Old Testament* (2002, p. 91). That is a 26-year versus a 44-year gap after Joshua. The record sorts on the chart, which agrees with all of Jones's later chart values.
- **Options:**
  1. The chart governs (as now).
  2. The book governs.
  3. Always use the newest Jones publication.
- **Recommendation:** option 1, keeping both figures in the notes.

### A3. Jordan 1991 or Jordan 2001 as the primary Jordan row for the Judges? (OQ 22)
- **Why it matters:** this is display only, not sorting, but it decides which figure gets the "Jordan" row. His Judges dates move by 25–26 years between the two works, and Samuel's age at death is 110 in one and 85 in the other. The 2001 figures (*Studies in Biblical Chronology* 2–3) are shown first now. See `data/jordan-dates-extract.md`, Part 2 C.
- **Options:**
  1. 2001 is primary and 1991 is secondary (as now).
  2. 1991 is primary.
  3. Show both as equals.
- **Recommendation:** option 1, since 2001 is his later, revised view.

### A4. The Temple date (OQ 4, 13 and 21)
- **Why it matters:** the sources disagree on what happened in 1012 BC:
  - CFAH-1 Table 1 says Solomon *dedicates* the Temple in 1012 BC.
  - Jones and Ussher say the Temple was *founded* in 1012 BC. Ussher dates the dedication to 1004 BC.
  - Jordan has the foundation in AM 2993 and the dedication in 3014. The compilation says "completed 3000".
  - The record sorts at tier 2 on 1012 BC.
- **Options:**
  1. Keep one record, `temple-dedication` (1012).
  2. Rename it "Temple foundation" (1012) and add a separate dedication record (Ussher 1004).
  3. Keep it and add the dedication record.
- **Recommendation:** option 2, with CFAH's wording quoted in a flag.

### A5. Rule for which death-year source drives the lifespan bars
- **Why it matters:** right now people appear on the timeline as birth points only. Births follow the 4-tier rule, but deaths have no rule, so lifespan bars can't be drawn safely yet. For the patriarchs, Jones (AM), MT arithmetic and Ussher can differ by a year on a death, and Josephus and the compilation sometimes differ more (for example the compilation's Arphaxad 2093 against MT 2096).
- **Options:**
  1. Use the same 4-tier rule for deaths (CFAH AP > Table 1 > Jones > Ussher).
  2. Use birth + MT lifespan whenever the Bible gives the age.
  3. Use the same source that set the birth.
- **Recommendation:** option 1, falling back to option 2 when no tier gives a death year. I would then add the bars. This guarantees a bar never uses a secondary chronology.

### A6. Edge-case conventions (OQ 2)
- **Why it matters:** three records sort on a convention, not on a stated date:
  - **Cain & Abel** sorts at Ussher's −3874. That is a *latest-possible* date (before Seth's birth), not the year of the event.
  - **The Ark landing** is *derived* from the Flood (−2348), because no tier gives a BC year; Ussher prints only AM 1656 and "May 6".
  - **Ham and Nimrod** are *undated*: no tier gives their birth, so they don't appear as bars. Nimrod's death is now set from AP-48, 2068 BC.
- **Options:** accept each convention, or say otherwise.
- **Recommendation:** accept all three, with the existing flags kept visible on each record page.

### A7. Ussher's Arabians (1538 BC) vs CFAH's Arab dynasty (1477 BC)
- **Why it matters:** CFAH-5 AP-35/42 puts the fall of Akkad and the "Arab" dynasty at 1477 BC. Ussher §167 has the Arabians at 1538 BC. CFAH sorts the record (tier 1), and Ussher shows as a 61-year disagreement flag.
- **Options:**
  1. Keep it as a flagged cross-row.
  2. Drop the Ussher row, because the events may not be the same.
- **Recommendation:** option 1.

---

### A8. Provisional sort for Generations-only records (AD era and some ancient ones), plus the Generations conflicts
- **Why it matters:** the Generations curriculum books (Swanson / Schwisow) add many dated events and people that **no sorting tier reaches**: CFAH, CFAH-1 Table 1, Ussher–Jones and Ussher all stop before most of the AD era. Every event needs an integer `sorting_year` to appear on a timeline, so something has to be decided for these records.
- **What is implemented for now (provisional, least invasive):** a new sort tier `provisional` (no tier rank). The sort year is the **first dated Generations entry** on the record (for people, the birth year), and the record carries a visible badge: "Provisional · Generations curriculum date". The validator **forbids** `provisional` on any record that has a tier 1–4 year, so Generations can never move a CFAH, Ussher–Jones or Ussher date. On records that already had a sort, Generations dates appear only as a secondary display row, with any difference flagged.
- **Ancient records sorted this way (please check):**
  - **Mizraim** had no tier 1–4 birth year. He now sorts at Generations' "around 2478 BC" (Africa, PDF p. 19).
  - **The Great Pyramid** (new record) sorts at Generations' ~2258 BC. CFAH mentions Khufu (~1921 BC) only in a note, not as a tier date.
  - **New biblical events from Preparing the World for Jesus.** With the 1st edition (2020) these sorted on its long chronology. **The 2nd edition (2024) is now the primary reading, and every provisional sort that came from the 1st edition has switched to the 2nd-edition date where there is one.** They now sit with their Ussher-sorted neighbours:

    | Event | 1st ed. (old sort) | 2nd ed. (sort now) | Ussher / Ussher–Jones |
    |---|---|---|---|
    | Destruction of Sodom | c. 2066 BC | c. 1911 BC (heading, p. 177) | about 1897 BC |
    | Joseph sold into Egypt | 1930 BC | c. 1728 BC | about 1728 BC (Joseph born 1745, Ussher–Jones) |
    | Nimrod builds Nineveh | c. 2418 BC | after the Dispersion, 2191 BC | — |
    | Mizraim settles Egypt | c. 2450 BC | 2191 BC | — (CFAH: Egyptian cities 2189 BC) |
    | Forty years in the wilderness | 1446–1406 BC | 1490–1451 BC | Exodus 1491 BC, Moses dies 1451 BC (sort years) |
    | Fall of Jericho | c. 1400 BC | 1450 BC | Jordan crossed 1450 BC (CFAH-1 Table 1) |
    | Shamgar, Samson, Samuel | ~18 years late | the Ussher–Jones table | — |

    Records dated **only** in the 1st edition keep their 1st-edition sort and are flagged "not in 2nd ed." (19 records/slots, e.g. Jonah in Nineveh 811–783 BC, the Hittite treaty 1279 BC, Carthage founded 1215 BC; listed in the extract's difference table). **Recommended fix (unchanged, now less urgent):** add Ussher (tier 4) entries for these biblical events so that they sort by tier.
- **Options:**
  1. Keep the provisional tier as implemented. **(Recommended.)**
  2. Exclude Generations-only records from the timelines: a null `sorting_year`, which needs a schema change, and the records show only as pages.
  3. Build a separate AD / church-history timeline, and keep the main timeline to tiers 1–4.
- **Recommendation:** option 1. It is reversible: one switch in the importer and the validator removes it.
- **Conflicts with the sort year (Taking Africa for Jesus).** Each is shown as a flagged secondary row; the sort is unchanged.

  | Event | Generations | Current sort |
  |---|---|---|
  | Abram goes down to Egypt | 2076 BC | 1921 BC (CFAH-1 Table 1) |
  | Joseph's birth | 1911 BC | 1745 BC (Ussher–Jones) |
  | Moses's birth | 1520 BC | 1571 BC |
  | The Exodus | 1400 BC | 1491 BC |
  | Amenemhat I | ~1990 BC | 1738 BC (CFAH) |
  | Egyptian cities / Mizraim | ~2450 BC | 2189 BC (CFAH) |
  | Seneferu / Dynasty 3 | ~2282 BC | 2029 BC (CFAH) |
  | Goshen / entry into Egypt | 1840 BC | 1706 BC |

  The full list for each book is in `data/generations-dates-extract.md`.
- **Taking Europe for Jesus.** Every date in this book is AD or late BC, so no tier 1–4 date is touched and there are no conflicts with the sort. Where the Generations books disagree with each other or with themselves, both readings are kept and flagged:
  - **Raymond Lull's birth.** Europe gives 1232 (p. 140); Africa gives 1235 (p. 102).
  - **The First Punic War.** Europe gives 264–241 BC (p. 35); Africa gives 246.
  - **The First Crusade began** in 1095 (p. 175) but 1096 in the unit 3 timeline (p. 177). The 1095–1099 span is used.
  - **The Battle of Brunanburh** is 937 in the chapter (p. 169) but "AD 973" in the unit 2 timeline (p. 104). It is entered as 937; 973 is evidently a transposition.
  - **The Roman withdrawal from Britain** is AD 409 (pp. 13–14) but "by AD 410" in chapter 8 (p. 85).
- **Taking Asia for Jesus, ancient Asian dates.** No tier 1–4 record covers these, so each sorts provisionally at the printed date:
  - Harappan civilisation ~2200 BC
  - Huang Di's dynasty 2350–1800 BC
  - Shang 1766 BC
  - Settlements in Japan 2300–2000 BC
  - Aryans ~1500 BC
  - Jimmu Tennō 660–585 BC (traditional)

  **Please note:** the book's 2350 BC start for the first Chinese dynasty is *before* the Flood in the sort chronology (Ussher / CFAH-1 Table 1, 2348 BC). Several of these dates also fall before or close to Babel. They are shown as printed, with a note, but they are not reconciled.
- **Taking the World for Jesus vs the sort.** Only three dates touch tier 1–4 records:
  - **The Flood:** 2348 BC, which agrees with the sort.
  - **Creation:** "4000 BC", a round figure. The sort has 4004 BC, so this is flagged as a 4-year conflict.
  - **Abraham entering Canaan:** "around 1900 BC". The sort has 1921 BC, and Taking Africa for Jesus has 2076 BC.
- **Where the Generations books disagree with each other.** Both readings are kept on the record, and the extract flags them:
  - Thomas reaching India: AD 45/46 (Asia) or AD 52 (World)
  - The City of God: AD 427 (Africa) or 426 (World)
  - Methodius imprisoned: 871 (Europe) or 870 (World)
  - Anskar's mission: 829 (Europe) or 826 (World)
  - Wycliffe's birth: 1330 (Europe) or 1320 (World)
  - First African slaves to Portugal: 1444 (Africa) or 1441 (World)
  - Portuguese reach the Congo: 1485 (Africa) or 1483 (World)
  - Mackay sent to Formosa: 1872 (Asia) or 1871 (World)
  - The persecution under Severus: AD 193 (Europe) or 192 (World)
  - Georg Schmidt's South African mission: 1738–1748 (Africa) or 1737–1744 (World)
- **Printed oddities kept as printed (and flagged):**
  - Punic Wars "246 BC". The conventional start is 264 BC, so this may be a transposition.
  - Mackay "April 1875" printed before the November 1875 appeal.
  - Thutmose I "between 1493 and 1506 BC", printed in reverse order.
- **Preparing the World for Jesus: two editions.** We imported the free S3 PDF first. It is © 2020 with no edition line, so it is labelled the **1st edition (2020)**. That label is *inferred* from the copyright year and the missing edition statement. You then shared the **2nd edition** (© 2024, "2nd Edition, 1st Printing, 2024", same ISBN 978-1-7332304-6-9, "Consultant: Kenneth Griffith, Historian and Researcher"). It has 24 chapters (the 1st has 16) and 752 PDF pages. It is now the primary Generations reading for this book:
  - 2nd-edition entries are added on each record (248 dates).
  - A 1st-edition entry on a record the 2nd edition also dates is kept, labelled "1st ed. (2020)", marked `superseded_by`, shown only as a collapsed line with the difference stated, and never used for a sort.
  - 1st-edition-only entries are flagged "not in 2nd ed.".
  - The source is a private copy (`access: private-copy`, the Drive link works only for accounts it is shared with), so it is cited by PDF and printed page and is not listed among the free source links. See C6.
- **The long chronology question is now largely moot.** The 1st edition used its own long chronology (Creation c. 4174 BC, Flood c. 2518 BC; 170 years early from Creation to Joseph and about 45 years late from Moses to the Conquest). **The 2nd edition drops it** and follows Ussher / CFAH: Creation 4004 BC, Flood 2348–2347 BC, Babel founded 2233 BC, Dispersion 2191 BC, Abram crosses the Euphrates 1921 BC, Joseph sold c. 1728 BC, Moses born c. 1571 BC, Exodus 1491 BC, Jordan crossed 1450 BC, and the judges table matches Ussher–Jones. It also moves to CFAH's revised Mesopotamian chronology: the Akkadian Empire 1638–1477 BC (contains CFAH's Sargon, 1619), the fall of Akkad 1477 BC (= CFAH), and Hammurabi reigning 1041–986 BC, with his code headed 1031–989 BC (CFAH death 989). The earlier question "a site-wide note that Generations uses the conventional Near Eastern chronology?" therefore applies only to the superseded 1st-edition rows. **Question:** keep the superseded 1st-edition rows (collapsed, as now), or drop them from the site and keep them only in the extract? Recommendation: keep them collapsed. They show provenance at no cost to the sort.
- **Remaining 2nd-edition conflicts with tier 1–4 years** (6, all flagged on the records):

  | Record | 2nd ed. | Tier 1–4 | Gap |
  |---|---|---|---|
  | Founding of Babel | 2233 BC (p. 92) | 2234 BC (CFAH) | 1 yr |
  | Dispersion | 2191 BC (p. 99; p. 99 also computes 2192) | 2192 BC (CFAH) | 1 yr |
  | Egyptian cities / Menes | 2191 BC (p. 157) | 2189 BC (CFAH) | 2 yrs |
  | Abraham's death | 1819 BC (Timeline Review, p. 160) | 1821 BC (Ussher) | 2 yrs |
  | Joseph's birth | "around 1911 BC" (p. 204) | 1745 BC (Ussher–Jones) | 166 yrs; a 1st-edition leftover |
  | Death of Hammurabi | around 986 BC (p. 354) | 989 BC (CFAH) | 3 yrs |

- **1st-edition leftovers and slips inside the 2nd edition** (kept as printed or skipped; noted on the records):
  - "2518 BC" for the Flood on pp. 48 and 272
  - Nimrod "around 2448 BC" (p. 93) beside about 2270 BC (p. 143)
  - Joseph's birth "around 1911 BC" on the same page as "sold … c. 1728 BC" (p. 204)
  - Tyre destroyed in 332 BC (pp. 288, 327) and 314 BC (p. 647)
  - The Eurymedon in 476 BC (p. 548) and 466 BC (p. 590)
  - Nehemiah's commission in 455 BC (p. 549) and "about 445 BC" (p. 610)
  - Xerxes 496–475 BC (heading, p. 541) but "518–465 BC" in a caption (p. 542)
  - Samaria falls in 721 BC (p. 361) and 722 BC (p. 388)
  - Solomon 1015–976 BC (p. 372) and 1015–975 BC (p. 375)
  - Christ's death in AD 33 (pp. 102, 278, 687) and "around AD 30" (pp. 551, 555)
  - Cleopatra's death in 30 BC (caption, p. 662) and 29 BC (p. 423)
  - Clear misprints that were skipped: "AD 1074" (p. 413), "around AD 586" (p. 407), "AD 609" (p. 526), and "616 BC" for Darius' sixth year (p. 541)
- **Big 1st→2nd edition changes off the biblical spine** (no tier date; see the difference table in the extract):
  - Tutankhamun's death moves from 1325 BC to the 870–853 BC block of Nefertiti, Smenkare, Tutankhamun and Ay.
  - Rameses II is dated 644–578 BC (new).
  - Ur-Nammu moves from 2112–2095 to 1370–1346 BC, and Urukagina from c. 2360 to 1650 BC.
  - The Great Pyramid moves from c. 2258 to 1923–1903 BC, and Seneferu from c. 2282 to 1952 BC.
  - Ezra's return moves from 458 to 468 BC, and Sennacherib's move on Jerusalem from 701 to 713 BC.
- **1st edition (2020), for the record.** The 1st-edition conflicts listed before (Creation c. 4174, Flood c. 2518, Noah 3118–2168, Babel c. 2418, Abraham born 2166, Joseph c. 1911–1801, Moses c. 1526, Exodus c. 1446, Jordan 1406, Sargon c. 2334, Akkad 2147, Hammurabi 1792–1750, Shamshi-Adad I 1813–1791, judges 18 years late) are all still in the extract, now marked "superseded by the 2nd ed." (or "not in 2nd ed." for Shamshi-Adad I). Its internal inconsistencies and Timeline Review misprints are listed in its extract section.
- **Preparing vs the other Generations books** (1st edition; the 2nd-edition differences are in the extract's "differs from" notes):
  - Carthage founded in 1215 BC (Preparing 1st ed.; not in the 2nd) or 800–900 BC (Africa)
  - Qin empire begins in 231 BC (Preparing, both editions) or 221 BC (World)
  - Assyria takes Egypt c. 674 BC (1st ed.) or 670 BC (2nd ed.) or c. 650 BC (Africa)
  - Alexander takes Egypt in 332 BC (Preparing) or 330 BC (Africa)
  - Muslims take Egypt in AD 642 (Preparing 1st ed.) or 641 (Africa)
  - The Exodus c. 1446 BC (1st ed.) or 1491 BC (2nd ed.) or 1400 BC (Africa)
- **Not yet imported:** the divided-kingdom king tables (1st ed. pp. 209–210; 2nd ed. pp. 375–382, which add synchronism tables), with approximate reign dates for the kings of Israel and Judah from 975 BC). **Question:** import them as about 39 reign records sorting provisionally, or leave the kings to a CFAH/Ussher pass? Recommendation: leave them to Ussher. Ussher covers every king, so the Generations dates would only be secondary entries.

## B. Questions that change what is shown

### B1. Label Jordan's BC dates as "SBC" more prominently? (OQ 21)
- **Why it matters:** Jordan's B.C. figures run about 74–75 years later than Ussher/CFAH (for example Creation 3930, Flood 2274, Exodus 1417 SBC). That raises a "differs" flag on every Jordan row. The compilation uses a different BC column (4010 − AM), which adds a third scale.
- **Options:**
  1. Show "SBC" as a tag on every Jordan BC figure, with a hover note.
  2. Show Jordan's AM only and hide his BC.
  3. Leave it as now.
- **Recommendation:** option 1, and suppress the "differs from sort year" flag on Jordan and compilation rows.

### B2. Add a `flags` field for disagreements in the data?
- **Why it matters:** disagreements are now written into notes and worked out at build time. A structured field, such as `flags: [{type: "disagreement", sources: [...], text}]`, would let the site filter "show me all conflicts" and would make this list easier to keep up.
- **Options:**
  1. Add the field.
  2. Keep the notes as they are.
- **Recommendation:** option 1, as a schema-only change first, then fill it gradually.

### B3. Raleigh's Abraham: AM 2008 or 2009? (OQ 15; you deferred the re-extract, "Not now")
- **Why it matters:** the record uses the 1736 11th edition, which reads AM 2009. The 1617 first edition (the primary text) has Abraham at AM 2008 (Book II, ch. I, §VIII). But the 1617 edition also puts Isaac at 2109, which is not 2008 + 100. So Raleigh is inconsistent within his own text, and from Isaac to Moses he runs one year above Ussher throughout. Batch 4 notes this on Isaac's birth.
- **Options:**
  1. Re-extract all Raleigh rows from the 1617 text later.
  2. Keep the 1736 figures and note the 1617 reading.
- **Recommendation:** option 1 when you are ready. Until then the rows stay as cited, with notes.

### B4. Josephus's Flood figure: 2656 or 1656? (OQ 8)
- **Why it matters:** Whiston's *Antiquities* I.3.3 prints 2656, with "[1656]" in brackets, so it is unclear which figure Josephus's own row should carry.
- **Options:**
  1. Show 2656 as printed, with the bracketed 1656 in the note.
  2. Show 1656.
  3. Show both.
- **Recommendation:** option 1. Josephus is display-only, and that is faithful to the text.

### B5. Clonmacnoise: check the readings against the page images
- **Why it matters:** the interval figures (1656, 0292, 0500, 0480, 0410, 0432, 0134) were paired with their rows from OCR column order. If a pairing is wrong, a displayed figure is wrong.
- **Options:**
  1. You or I check them against the 1896 page scans.
  2. Mark the rows "unverified" until someone does.
- **Recommendation:** option 1. It is a short job if you can share the page images, or point me to a public scan.

### B6. Ararat Wikidata link
- **Why it matters:** OpenBible links "mountains of Ararat" to Wikidata **Q185068**. I checked it on 2026-10-18: it is **"Urartu: Iron Age kingdom located in a large region around Lake Van"**, which is the region, not Mount Ararat itself.
- **Options:**
  1. Keep Q185068, since Gen 8:4 says "mountains of Ararat", the region.
  2. Switch to the mountain.
- **Recommendation:** option 1, and close the question.

### B7. Map marker overlap
- **Why it matters:** many Table of Nations places share or nearly share coordinates (several "land-of-X" pins and city pins in Mesopotamia and Canaan), so markers sit on top of one another.
- **Options:**
  1. Add marker clustering (a small Leaflet plugin).
  2. Offset (spiderfy) overlapping markers.
  3. Leave them.
- **Recommendation:** option 1.

### B8. Low-certainty place pins
- **Why it matters:** several pins are shown with low OpenBible confidence:

  | Place | OpenBible confidence |
  |---|---|
  | Accad | 25% |
  | Calneh | 15% |
  | Mount Hor | 35% |
  | Mount Sinai (Jebel Musa) | 50%; OpenBible lists 14 possible identifications |

  Each page states its certainty, but the main map pin looks the same as a certain one.
- **Options:**
  1. Draw low and medium pins hollow or faded.
  2. Hide pins below 30%.
  3. Leave them.
- **Recommendation:** option 1.

### B9. Places linked only by name
- **Why it matters:** in Gen 10 some people are linked to a place only because the name is the same (for example Sidon the son of Canaan → the city of Sidon, and Asshur → Assyria). The links are flagged on the record, but they read like established identifications.
- **Options:**
  1. Keep them flagged.
  2. Remove them unless a source (Josephus or OpenBible) makes the link.
- **Recommendation:** option 1. Josephus I.6 supports most of them.

### B10. The Jacob figures: Haran 1759 vs 1760, Levi 2248 vs 2257
- **Why it matters:** these show as disagreement flags on two records:
  - **Jacob to Haran:** Jones (p. 65) has 1759 BC and also says Ussher's "about 1760" was right. The one-year difference is probably departure versus the start of his 7 years of service.
  - **Levi's birth:** Ussher has AM 2248, Jordan 2257 (Jordan starts the children after Jacob's marriage in 2252).
- **Options:** accept both as stated disagreements, or ask me to dig further.
- **Recommendation:** accept them. They stay flagged.

### B11. Ussher § numbering and typos (OQ 7)
- **Why it matters:** the free transcription numbers Abraham's birth §63, but CFAH-6 cites it as §64. Some inline paragraph numbers are garbled (for example "1 19."). Known typos in the transcription: Mahalaleel 892 (should be 895), and "Jacob was 77 years old in 2259 AM" (should be 2245). Jones's Compendium also has "Jared born when Mahalaleel was 165" (should be 65).
- **Options:**
  1. Keep the transcription numbers with notes.
  2. Re-key them to the Pierce edition if you have it.
- **Recommendation:** option 1 for now.

### B12. Other dating differences already flagged (OQ 5, 6, 10, 14, 16, 17, 20)
- **Ussher's Flood:** heads AM 1656 as 2349 BC, against 2348 in Jones and CFAH.
- **The Ark landing:** "May 6" in the 1658 text; secondary sources say 5 May.
- **Japheth and Shem:** Ussher makes Japheth the eldest (AM 1556); Jones has Shem born at 1558.
- **Solomon's death:** 976 BC in CFAH, 975 in Ussher and Jones.
- **Raleigh's Exodus:** AM 2514.
- **CFAH's Exodus basis:** 1491 BC is a frame date with no AP number.
- **Ussher's dispersion:** he gives no year.
- **Recommendation:** no action. These are faithful disagreements and stay visible as flags.

### B13. Two inconsistencies inside CFAH itself (to raise with the authors?)
- **AP-17:** the CFAH-3 heading says "Joseph Alive in 1690 B.C.", but the date it computes, and CFAH-6 Table 1, give 1679 BC (Moeris' death). The record uses 1679, with the heading quoted.
- **AP-87:** this number is used twice in CFAH-14 v1.0, once for Sargon II and the fall of Samaria (722 BC) and once for Shamshi-Adad IV (1053 BC). Neither falls in the current scope.
- **Sargon 1619 and Hammurabi 989 BC (AP-92 and 93):** these are centuries below the conventional dates (about 2334 and 1750 BC). That is by design in CFAH. The conventional dates are mentioned in notes only.
- **Recommendation:** keep it as now, and optionally email Griffith and White about AP-87 and AP-17. I won't contact anyone without your go-ahead.

---

## C. Housekeeping

### C1. Retry the OTA (Oxford Text Archive) licence check for Raleigh
- The OTA item page for A10357 returned 504 on 2026-10-17. The CC0 statement was taken from the EarlyPrint/TCP TEI files instead.
- **Recommendation:** I retry it on the next pass; no decision is needed.

### C2. Ussher–Jones edition (OQ 3)
- CFAH cites Jones 2019 (21st edition), but the free PDF returned 404. The 2002 15th edition and Charts 1 and 4 are used instead.
- **Recommendation:** if you have the 2019 PDF, share it and I'll reconcile.

### C3. CFAH coverage (OQ 1)
- Six of a planned twenty CFAH papers are published in ARJ, and OSF holds preprints up to CFAH-19. Many records still say "pending CFAH reference".
- **Recommendation:** re-run the OSF collation monthly; `docs/cfah-osf-collation.md` lists every file.

### C4. OSF licensing
- All 21 OSF nodes have no licence (all rights reserved). The one exception is CFAH-3 (6hpbq), which is labelled GPL-3.0 with a blank holder.
- The site only cites, links and quotes briefly. OSF figures are text cards, and ARJ figures are hotlinked, never copied.
- **Recommendation:** no change.

### C5. Jordan backlog and the Daniel scans (OQ 21)
- The Daniel charts on garynorth.com are OCR'd scans and need checking.
- Backlog candidates that are still not records: the end of the Conquest (2560), the fall of Jerusalem (3425 / 505 SBC) and the decree of Cyrus (3474 / 456 SBC). Arphaxad, Terah, Isaac, Jacob and Aaron are now records.
- **Recommendation:** add them in a later batch.

### C6. Private Drive link on a public site
- The compilation's citation link (Drive id 1dPdwn1E…) only opens for you. Visitors get a sign-in or permission page.
- **Options:**
  1. Keep the link (as now; marked `private-copy`).
  2. Drop the link and keep the page citation.
  3. Share the file publicly, which is your call.
- **Also applies to** `generations-preparing-2e` (2nd edition of *Preparing the World for Jesus*, Drive id 1oWd9zew…). Its entries link to the Drive file, which opens only for accounts it is shared with, and it is not listed among the free source links. The 1st edition keeps its public S3 link.
- **Recommendation:** option 1. It is honest about where the data came from, and the label explains it.

### C7. Maps and IIIF (OQ 11 and 18)
- LoC item pages hit a Cloudflare challenge from the box. The IIIF thumbnails and info.json return 200.
- **Recommendation:** spot-check the 6 map records in a browser.

### C8. Licensing reminder (OQ 12)
- CFAH (© AiG), Jones and Jordan texts are cited and linked, with short quotes only. Jordan's full texts are in `sources/jordan` with your stated permission.
- **Recommendation:** no change.

## D. Herodotus import (2026-10-18)

### D1. Events that only Herodotus dates
- Herodotus describes events that no tier 1–4 chronology dates, such as the fall of Sardis, the Cimmerian raid on Sardis, the Scythian dominion over Asia and the Magus's usurpation. Herodotus gives durations rather than BC years, so these events have no sort year.
- They are listed as "NEW record candidates" in `data/herodotus-dates-extract.md` and not created. The import does not add a Herodotus sort tier.
- **Options:**
  1. Leave them out (as now).
  2. Create them with a sort "derived" from a CFAH anchor through Herodotus's reign lengths. The arithmetic is shown in the extract, e.g. Astyages' fall = AP-7 560/559 BC.
  3. Wait for later CFAH papers.
- **Recommendation:** option 1 for now. Option 2 would make Herodotus's reign lengths drive the sort indirectly.

### D2. Cyrus: 29 years (Herodotus 1.214) or 30 (CFAH-3, AP-8)
- CFAH counts Cyrus's 30 years from 560/559 BC to the accession of Cambyses. Herodotus says Cyrus "fell, after reigning nine and twenty years".
- The site keeps CFAH's year for the sort and flags the difference.
- **Recommendation:** no change; it is flagged on the Cyrus page.

### D3. Moeris "not 900 years" before Herodotus (2.13) and other long Egyptian figures
- CFAH AP-17 places Moeris about 1679 BC, and its own section "Conflicting Information: Herodotus Nine Centuries Below Moeris" deals with this.
- Herodotus's priests' figures conflict with a 4004 BC Creation at any placement: 11,340 years of kings (2.142), Heracles 17,000 years before Amasis (2.43), and Tyre founded 2,300 years before his visit (2.44).
- These are recorded as Herodotus's statements, marked "framework" or "CONFLICT", and never used.
- **Recommendation:** no change.

### D4. The Battle of the Eclipse (1.74) and Generations' 585 BC
- The record `thales-predicts-eclipse` sorts provisionally at Generations' "May 28th, 585 BC".
- Herodotus puts the eclipse in the reign of Cyaxares. The CFAH-derived chain (AP-7 + Astyages 35 + Cyaxares 40) ends that reign at 595/594 BC, about 10 years before 585.
- **Recommendation:** keep the provisional sort and the flag. Ask Griffith/White whether a later CFAH paper treats the Median reigns.

### D5. Unused CFAH anchor points
- The Herodotus import added these CFAH-3/5 anchor points, which `docs/cfah-osf-collation.md` listed as found but unused:
  - AP-7 Era of Cyrus 560/559
  - AP-8 Pelusium 525
  - AP-12 Fall of Troy 1184/1183
  - AP-13 Xerxes 480
  - AP-32 Deioces 710/709
  - AP-10 First Olympiad 776/775 (on `first-olympic-games`)
- These records now sort by CFAH (tier 1) instead of their provisional Generations years:
  - `median-kingdom-under-deioces`: 710 BC instead of 712 BC
  - `first-olympic-games`: 776 BC, unchanged
- **Recommendation:** no decision needed; listed so you can see what changed.

### D6. Xerxes' accession: 486 BC (Herodotus's 36 years for Darius) or 496 BC (Preparing, 2nd ed.)
- `reign-of-xerxes-i` sorts provisionally at 496 BC, from the 2nd edition of Preparing ("496–475 BC"). The 1st edition printed 486–465 BC.
- Herodotus says Darius "reigned in all six-and-thirty years" (7.4). Generations' own 522 BC for Darius plus 36 gives 486 BC.
- The chain back from CFAH AP-13 (480 BC) through Herodotus 7.1–7.37 also gives Darius's death about 486/485 BC.
- **Options:**
  1. Keep 496 (as now; flagged).
  2. Ask Generations or Griffith whether 496 is a misprint.
- **Recommendation:** option 2. The 2nd edition's 496–475 has the same 21-year length as 486–465, which looks like a 10-year slip.

### D7. Plataea, Mycale and Artemisium
- `battle-of-plataea` and `battle-of-thermopylae` sort provisionally by Generations (479, 480). CFAH AP-13 dates the invasion to 480 BC and says it "ended in June 479 B.C.".
- `battle-of-salamis` (new) is "derived" from the AP-13 record `xerxes-invades-greece`.
- **Options:**
  1. Leave Thermopylae and Plataea provisional (as now).
  2. Re-sort them as "derived" from `xerxes-invades-greece`, like Salamis, and add Artemisium and Mycale the same way.
- **Recommendation:** option 2, if you agree that a battle inside CFAH's dated campaign may take the campaign's anchor.
---

## E. CFAH complete pass (added 2026-10-18; appended, earlier items not reordered)

The full checklist (every AP 1–61, every OSF AP, every CFAH-1 Table 1 row, every king list) is `data/cfah-coverage.md`, regenerated by `node scripts/cfah/import.mjs`.

### E1. Internal CFAH inconsistencies found in the complete pass (extends B13)
- **Why it matters:** none of them changes a sort by itself. The records follow the section headings (or the later paper) and quote both readings in the note.
- **I1. AP-87 used twice (OSF CFAH-14 v1.0).** p. 16 gives "Accession of Sargon II, Fall of Samaria - 722 BC - Anchor Point #87" and "Shamshi-Adad IV - 1053 BC - Anchor Point #87". Both are recorded, each with its own record (fall-of-samaria; shamshi-adad-iv-conquers-assur). CFAH-15 p. 10 cites AP-87 for the 1053 BC event.
- **I2. AP-17: 1690 B.C. vs 1679.** CFAH-3 heading "AP-17: Joseph Alive in 1690 B.C."; CFAH-6 Table 1 lists #17 at 1679. The record death-of-moeris keeps the CFAH-6 value it already used, with both cited.
- **I3. Anchor Point #2 = founding of Thinis 2188 BC?.** CFAH-6 "Thinis Group" says "our Anchor Point #2 for the founding of Thinis in 2188 BC", but AP-2 is the Dispersion (2192/2191) and AP-3 is "Egyptian Cities Founded" 2189/2188 (CFAH-2 Table 3; CFAH-6 Table 1). Probably AP-3 was meant. No data change.
- **I4. CFAH-5 Table 3 AP column offset by one.** Table 3 "Kings after the Flood—Berossus reconstructed" numbers Period 2 and Dynasties 1–8 as AP 39–47, but the section headings of the same paper give Dynasty 1 = AP-38, Median Dynasty 2 = AP-39 … Dynasty 8 = AP-45 (and AP-46 to 48 are other events). The records follow the section headings.
- **I5. Berossus dynasty boundaries differ between CFAH-5 Table 3 and its section headings.** Table 3: Dynasty 2 from 2192, Dynasty 7 706–625, Dynasty 8 625–538. Headings: AP-39 2191–1968, AP-44 705–626, AP-45 626–539. AP-43 heading ends Dynasty 6 at 706 while its text gives Sargon II's death as 705 (CFAH-5 calls the 706 a one-year error by Berossus). Records use the headings.
- **I6. Ashur-danin-pal's death: 823 vs 824 B.C. (CFAH-5).** Section "Sardanapalus": "coreigned with his father from 843 to 823 B.C."; AP-43 section: "from 843 until his death in 824 B.C."; AP-33 says he "presumably died in the last year of Shalmaneser III, 823 B.C."
- **I7. Pepi I reign: CFAH-5 vs CFAH-6.** CFAH-5 §8 "Sargon of Akkad and Pepi I": "Pepi I reigned from about 1646 to 1593 B.C."; CFAH-6 (Userkare section): "1637 BC ±2 years, start of Pepi I sole reign". Both kept on the person record (different statements: whole reign vs sole reign).
- **I8. Sargon of Akkad: CFAH-5 range vs OSF CFAH-15 AP-92.** CFAH-5 §8: earliest start of Sargon's reign 1642 B.C., latest death 1553 B.C.; CFAH-15 (OSF) AP-92 fixes the start of his reign over Akkad at 1619 BC (inside the CFAH-5 range).
- **I9. Yu of China: AP-4 2197 BC (CFAH-2) vs AP-94 2192/2191 BC (OSF CFAH-17).** CFAH-17 revises Yu's accession to the Dispersion year. The record keeps the published AP-4 first (sets the sort) and the preprint AP-94 second.
- **I10. AP-23 Kali Yuga: February 7 vs February 6, 3104 B.C. (CFAH-3).** Heading and text give February 7; the Fig. 9 caption reads "February 6, 3104 B.C.". CFAH-3 then uses January 1, 3104 B.C. "for simplicity".
- **I11. AP-26 section: two likely typos (CFAH-3).** It counts "eight cycles back from 2967 B.C." (2697 is the Chinese first-cycle date given just above) and "down from the Saptarshi Cycle in 2176" (the Saptarshi era is 3176 B.C., AP-25).
- **I12. AP-12 Fall of Troy described differently.** CFAH-3 AP-12 is "The Fall of Troy"; CFAH-6 Table 1 lists #12 (1184/1183) as "Fall of Troy, Death of Nilus".
- **I13. AP-73 Treaty of Kadesh: 624/623 vs 623 BC (OSF).** CFAH-9 "AP-73: Treaty of Kadesh, 624/623 BC"; CFAH-13 cites it as "623 BC (CFAH-9, Anchor Point #73)".
- **I14. AP-110: two descriptions (OSF).** CFAH-19 makes AP-110 the 1450 BC high-water event "in the year of Joshua's Conquest"; CFAH-17 cites "CFAH-19, Anchor Point #110, Joshua's Long Day in 1450 BC".
- **I15. Death of Nitocris cited as AP #20 (CFAH-6).** CFAH-6 §D ("The Death of Merenre II …") prints "1479 BC death of Nitocris (CFAH-3, AP #20)"; the same paper earlier cites it as "(CFAH-3, AP #16)", and AP-16 is Nitocris (AP-20 is the Great War).
- **I16. Egyptian Dispersion year 2190 vs "2090 BC" (CFAH-6).** CFAH-6 "Heracleopolis Group": "Several of the Egyptian records seem to use a start date about six months later in 2090 BC", then counts from "the Egyptian date of the Dispersion in 2190 BC". 2090 is evidently a typo for 2190.
- **Recommendation:** keep the data as recorded. Optionally send this list to Griffith and White; I won't contact anyone without your go-ahead.

### E2. Phase 1: the remaining published anchor points now set the sort
- Recorded in this pass: AP-4, 5, 6, 9, 11, 19, 23 to 26, 33, 34 and 42 to 45. That is 12 new events and 4 existing events updated (`xia-dynasty-founded`, `alexander-conquers-egypt`, `founding-of-rome`, `neo-babylonian-empire`).
- AP-7, 8, 10, 12, 13 and 32 were added an hour earlier by the Herodotus import (section D), and those entries are kept. AP-31 was already on Enosh's death. AP-37 does not exist in the papers.
- Every hand-made CFAH anchor entry now carries its AP number (`cfah_ap`). Every OSF entry is marked `cfah_preprint` and shows an "OSF preprint" tag.
- **Sort changes:**
  - Alexander takes Egypt: 330 → 332 BC
  - the Neo-Babylonian Empire: 605 → 626 BC
  - the founding of Rome and the founding of Xia keep their years but are now tier 1
  - all are listed in `data/cfah-coverage.md` section 5 and in each record's sorting note.
- **Recommendation:** no decision needed.

## F. Morecraft import

Source: Joe Morecraft III, *A Christian Survey of World History from Creation to the Reformation* (your scanned PDF, 417 pages). The full table is in `data/morecraft-dates-extract.md`.

### F1. Provisional sorts from Morecraft
- Records that only Morecraft dates (no CFAH, Ussher–Jones, Ussher or Generations date) were created by the import and sort provisionally by his printed year, the same way Generations-only records do (A8). Every other record keeps its sort, and Morecraft is shown as a secondary row.
- **Options:**
  1. Keep the provisional Morecraft sorts until a tier 1–4 date is found (as now).
  2. Leave such records unsorted (people) or derive them from a related record (events).
- **Recommendation:** option 1. The alternative hides these events from the timeline.

### F2. Publication details
- The copy has a cover and a title page but no copyright page, so no publisher, year or edition is printed, and the PDF has no creation date. `data/sources.json` leaves the year empty and links to the Heritage Presbyterian Church listing of the book.
- **Question:** do you know the edition or year of your copy? If so, I will add it.
