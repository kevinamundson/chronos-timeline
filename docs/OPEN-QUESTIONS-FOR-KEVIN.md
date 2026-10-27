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
- **Now recorded (2026-10-23).** The re-extract is done. The 1617 narrative and the chronological table both print 2009. Book II, ch. I, §VIII, sig. 164a: "which happened in the yeere of the World, 2009." Table sig. 782b: "1. Abram. 175", year cell "2691 2009 352". The same section also prints "An. mundi 2008 dil. 352. natus Abraham, Eus. Aug. de Ciuit. Dei", introduced with "I conclude" and naming Eusebius and Augustine. That 2008 is quoted in the note on Abraham's birth and is not a second year. Isaac's table birth is World 2109. The line above that treated 2008 as the 1617 narrative reading was the marginal citation.

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

### C9. Mothers, and sons, daughters and adopted children, on the family chart
- Issue 6 asks each person page to show a father and a mother, and sons, daughters and adopted children.
- Person records store `father` and `children` only. There is no mother, no sex and no adoption mark. The chart shows the recorded father, a dashed card that says the other parent is not recorded, and the named children. It does not call a child a son or a daughter, and it does not mark adoption.
- **Options:**
  1. Leave the schema as it is (as now). Add a mother, a sex or an adoption mark only when a source has been read for that person.
  2. Add optional `mother`, `sex` and `adopted` fields now, still empty until a source is read.
- **Recommendation:** option 1. A new field needs your approval, and an empty field would not change the chart.

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

### F3. Morecraft against the provisional Generations dates
None of these records has a tier 1–4 date, so the sort stays on Generations and Morecraft is shown as a second row. Pages are printed (PDF).
- `ezra-returns-to-jerusalem`: Morecraft's section heading "458–445 B.C." (p. 19 (PDF 28)) vs Generations 468 BC.
- `sennacherib-besieges-jerusalem`: Morecraft gives Sennacherib's reign as 704–681 B.C. (p. 42 (PDF 50)). Generations puts the siege at 713 BC, before that reign begins. This is the familiar gap between Hezekiah's "fourteenth year" in Ussher-style reckoning and the Assyrian king lists.
- `martyrdom-of-polycarp`: Morecraft gives A.D. 162 (p. 103 (PDF 111)); Generations gives AD 156.
- `augustine-succeeds-valerius`: Morecraft gives A.D. 395 (p. 123 (PDF 131)); Generations gives AD 397.
- `alfred-the-great` death: Morecraft gives "848–901" (p. 169 (PDF 177)); Generations gives AD 899.
- `william-tyndale` birth: Morecraft gives "probably in 1484" (p. 220 (PDF 228)); Generations gives 1494.
- **Recommendation:** no change. These are display rows, and the extract lists them. Tell me if you want Morecraft preferred over Generations anywhere.

### F4. Morecraft against himself
- The fall of Babylon is dated 539 B.C. on p. 27 (PDF 35) but 536 B.C. on p. 44 (PDF 52), the "Ancient Empires" pages. Both are recorded on `fall-of-babylon-539-bc`.
- Servetus is "sentenced to death" on "October 26, 1533" (p. 187 (PDF 195), checked against the page image). The book itself places this during Calvin's second Geneva ministry (1541–1564), so 1533 is probably a misprint for 1553. The statement is listed but not mapped to any record.
- **Recommendation:** no change.

### F5. Dates to check against other sources
- Council of Ephesus: the book's table prints "(A.D. 432)" (p. 81 (PDF 89), checked against the page image). The council is usually dated 431. The new record `council-of-ephesus` sorts provisionally at 432 as printed.
- Assyria "founded as early as 1700 B.C." (p. 41 (PDF 49)) comes far after CFAH's Assyrian anchor points (e.g. Shamshi-Adad I). It is listed as a conflict and not mapped.
- **Recommendation:** for Ephesus, add a CFAH or Ussher date if one is found (it would then set the sort automatically).

### F6. New records and the "Ancient Empires" pages
- 34 new records (23 events, 11 people) are listed in the extract. Kings with only a reign (Henry VIII, Edward VI, Elizabeth I, James I, Charles I) have no birth year, so they are unsorted people; their timelines show the reign.
- PDF pp. 49–59 ("Ancient Empires") appear to reproduce outside "Fact Finder" material, with an image credited to "Daily Bible Study www.keyway.ca" (PDF p. 57). Their dates (Assyrian, Babylonian and Persian king lists) are recorded as Morecraft's, with a note.
- **Question:** keep the dates from these pages, or drop them as not the author's own?
## E (continued). CFAH complete pass

### E3. Phase 2: every CFAH-1 Table 1 row now has a record
- All 22 rows of CFAH-1 Table 1 ("Biblically derived dates from Ussher and Jones") now carry a `table1_baseline` entry.
- Six rows were missing, and are now recorded:
  - 721 or 720 BC on `fall-of-samaria`
  - 606 BC on `daniel-taken-to-babylon`
  - 597 BC on `second-siege-of-jerusalem`
  - 586 BC on `fall-of-jerusalem-586-bc`
  - 536 BC on the new `cyrus-decree-of-return`
  - 516 BC on `second-temple-completed`
- **Sort changes** (provisional Generations sort replaced by tier 2):
  - Daniel taken to Babylon: 605 → 606 BC
  - Samaria, the second siege, 586 BC and the Second Temple keep their years but are now tier 2
- **Recommendation:** no decision needed.

### E4. Phase 3: rulers and king lists
- **New person records (24), each with CFAH reign or death entries:**
  - From CFAH-6 (Egypt, Old and Middle Kingdoms): Nebka, Merenre I, Merenre II, Nitocris, Pepi I, Userkare, Unas, Inteff III, Mentuhotep IV, Amenemhat III, Senusret III, Neferhotep I and Sobekneferu.
  - From CFAH-5 (Mesopotamia): Cush's reign at Babel, Semiramis I, Ninyas/Gilgamesh, Sargon of Akkad, Ghandash, Shalmaneser I, Tukulti-Ninurta I, Kashtiliash, Ashur-danin-pal, Sargon II, Kandalanu and Nabopolassar.
- **Existing records updated:**
  - Two existing people got CFAH dates: Cush (reign) and Mycerinus/Menkaure (death "about 1790 BC").
  - Two CFAH-2 epochs were attached to existing events: Sicyon "2089 or 2076 BC" and Trier "2053 BC".
  - The rulers' 22 linked events now list them under People.
- **How these dates behave:**
  - None of these dates is an anchor point or a Table 1 row, so they use the new display-only basis `paper_text`. They never set a sort; rulers with no birth year have no sort year.
  - Their lifetime timelines use the CFAH reign (and a CFAH death year where one is printed) to set the window.
- **King lists:** `data/king-lists.json` (schema and validator check added) holds 7 lists, shown at /king-lists/:
  - Berossus's eight dynasties
  - the Dynasty 7 Royal Canon
  - the Mesopotamian rulers
  - the Egyptian rulers
  - CFAH-6 Table 6 (dynasty dates)
  - the dated rows of the Sothis King List
  - the CFAH-2 epochs
- **Not stored, with reasons** (also in `data/cfah-coverage.md` section 4):
  - Lists that give lengths or ages only: Eratosthenes, Ctesias and the Chinese patriarchs.
  - Peru and Yao–Shun: there is no event for them, and they are not anchor points (A1).
- **Open choice:** should the people schema let a CFAH reign set a ruler's sort year when no birth year exists? At present persons sort on birth only, so these rulers sit in the "undated" group of people lists. **Recommendation:** leave as is, because the sort rule is birth-based by design.
- **Importer order:**
  - The Herodotus importer keeps only the first CFAH entry per slot on its own people, and drops CFAH-only reign slots.
  - So the CFAH importer (`node scripts/cfah/import.mjs`) must run after it. It is idempotent and restores its entries.
  - I put CFAH dates on only one Herodotus person (Mycerinus), and only in the death slot.

### E5. Phase 4: OSF preprint anchor points, and what is still out
- **Every numbered OSF anchor point found (AP-62 to AP-110, 44 numbers) is now recorded.**
  - This pass added 37 of them: 29 new events, and AP entries on 9 existing events.
  - AP-82 and AP-88 to 93 were already recorded.
  - Numbers 81 and 95 to 98 occur in no OSF file.
  - All are marked `cfah_preprint`, cite "OSF preprint", and rank as CFAH anchor points (A1, option 1).
  - Six OSF sources were added (`cfah-8/9/10/17/18/19-osf`). Their licenses were checked through the OSF API: none set.
- **Sort changes:**
  - **`egyptian-hittite-peace-treaty`: 1279 BC (provisional) → 624 BC (OSF AP-73, "Treaty of Kadesh, 624/623 BC").** CFAH-9 places Rameses II in the 7th century BC, so this record moves about 650 years.
  - **`fall-of-samaria`: 721 BC (CFAH-1 Table 1, published) → 722 BC (OSF AP-87, preprint).** Under the tier rule a preprint anchor point outranks a published Table 1 row.
  - `partholan-colonizes-ireland`: 2036 → 2035 BC (AP-103).
  - `exodus` and `fall-of-nineveh` keep their years but are now tier 1.
- **Where a published anchor point exists, it still sets the sort** and the OSF entry is shown second:
  - Xia: AP-4 2197 BC over AP-94 2192/2191 BC
  - Joseph's famine: AP-58 over AP-101
  - Djoser's famine: AP-49 over AP-102
  - Death of Sargon II: AP-34 over AP-86
- **Done (2026-10-18, phase 5; see E6).** ~~Not imported:~~ the per-king rows of the OSF king lists and supplementary tables (CFAH-7B Dynasties 1–13; CFAH-9 and 10 Dynasties 19 to 26; CFAH-14 Assyria; CFAH-15 Sumer, Akkad and Babylon; CFAH-16 Israel and Judah). They are long reconstruction tables with hundreds of rows. Only their numbered anchor points are recorded.
- **Options:**
  1. Leave as is.
  2. Import them paper by paper as display-only `paper_text` preprint entries on new ruler records.
- **Recommendation:** for the 624 BC treaty, keep the CFAH sort, since that is what the tier rule says, but tell me if OSF preprints should not move records this far. For the king lists, option 1 for now, and option 2 for CFAH-16 first if you want the kings of Israel and Judah.

### E6. Phase 5: the per-king rows of the OSF tables (E5 done)
- **Done.** You asked for "the rulers and people from the six papers AND OSF", so E5 option 2 is now applied to every OSF king-list and supplementary table in docs/cfah-osf-collation.md. The data is in `scripts/cfah/osf-tables/` (76 tables), the person matching in `scripts/cfah/osf-kings-map.mjs`, and the engine in `scripts/cfah/osf-kings.mjs` (run by `node scripts/cfah/import.mjs`).
- **Rules followed:**
  - A row with BC years printed in the table gets a `paper_text` reign entry on a person record. The entry is marked `cfah_preprint` and cites the OSF file, version, table and page. The date text is the table's cells, verbatim.
  - These entries are display only: no person's sort changed (E4).
  - A row with regnal lengths only is listed in data/king-lists.json with its lengths as printed, without a record. No BC year was computed from a length.
  - Groups, gaps, totals, headings and damaged names are listed with the reason.
- **Counts:** 76 lists, 755 rows.
  - 410 reign entries on 360 people: 322 new records and 38 existing ones reused.
  - The reused records include the Herodotus kings (Cheops, Chephren, Mycerinus, Sabacos, Psammetichus I, Necho II, Psammis, Apries, Amasis II and Psammenitus), the CFAH phase 3 rulers, the Genesis and Generations people (Mizraim, Cush, Nimrod, David, Solomon, Samson and Samuel), and Morecraft's Alexander.
  - 24 more rows link to existing records without a date: AKL kings to the Genesis patriarchs, and the Median kings of CFAH-13.
  - 11 rows link to events (Xia, Shang, Zhou, the yugas and Cecrops), and 310 rows have no record.
- **Identifications taken from CFAH, please check:**
  - CFAH-9 pairs each Dynasty 19 king with a Dynasty 26 king. Seti I's row is on psammetichus-i, "Rameses B" on necho-ii, Khaemwaset on psammis, Merneptah on apries and Amenmesse on amasis-ii.
  - CFAH-11 makes Alexander the Great the alter ego of Rameses VII (331–323 BC, now a CFAH reign entry on alexander-the-great).
  - CFAH-15: Gišur and Meš-ki'ag-gašer are Cush, En-mer-kar is Nimrod, Dumuzi is Semiramis, and Gilgamesh is Ninyas.
  - CFAH-16: the kings of Qatna are Saul, Ishbosheth, David, Solomon, Jeroboam I, Nadab, Ahaziah and Jehu.
  - CFAH-7B: Menes is Mizraim, Usimare (Dynasty 12) is Userkare, and Neferirkare Kakai appears in both Dynasty 2 and Dynasty 5.
- **Still out, with reasons:**
  - Synchronism and event tables: they date events, not reigns. These are CFAH-8 Tables 1–4 and 8–10, CFAH-9 Tables 1, 3, 7–9, CFAH-13 Tables 1 and 4, CFAH-14 Tables 2 and 4, CFAH-15 Tables 1 and 2, CFAH-16 Table 3, CFAH-17 Table 2, and CFAH-19 Tables 3–7.
  - CFAH-8 Table 11 is a cross-reference grid in which a row does not name a single king. Its kings are in CFAH-9 Table 6 and CFAH-10 Tables 6–9.
  - CFAH-7B Tables 4, 5, 11 and 18 are not king lists: turning points, anchor points, Egyptologists' durations and pyramids. The timeline figures and the gmx5j master chart are graphics.
  - CFAH-6 on OSF duplicates the published paper, and t3vu5 is an older copy of CFAH-7A.
  - CFAH-16 has no full table of the kings of Israel and Judah. Only its Tables 1 and 2 give per-king dates, so most kings of Judah (and Israel after Jehu) still have no CFAH date.
  - Third-party dates quoted in CFAH tables are listed but not put on records:
    - Hamilton's Chinese sovereigns (CFAH-17).
    - The chroniclers' dates for Cecrops and Crotopus (CFAH-19).
    - Kitchen's and current scholarship's Dynasty 22 (CFAH-8 Table 12, CFAH-10 Table 2).
  - CFAH-10 Table 7, row "Osorkon III" (757/719–713 BC): listed without a person. The text gives these years to Bocchoris (I18).
- **New internal inconsistencies (continuing E1):**
  - **I17. Rameses II end year 678 vs 578 BC (CFAH-9 Table 2).** Table 3 and Table 7 have him die in 578. The entry keeps "644 | 678" and uses only 644 for the timeline.
  - **I18. CFAH-10 Table 7 "Osorkon III" in Dynasty 24.** The text interprets "the 6 years of Bocchoris/Bakenranef as his sole reign from 719 to 713 BC".
  - **I19. CFAH-10 in-table captions differ from the list of tables.** Tables 6 and 8 read "Data for Dynasty 23", and Table 9 reads "CFAH Solution for Dynasty 24". The list-of-tables titles (Dynasties 24, 25, 25) are used.
  - **I20. CFAH-8 has two tables numbered 14** (Dynasty 18 reigns; Amenemhab vs Thutmose annals).
  - **I21. Huang-di "2763 - 2863" in the Hamilton table (CFAH-17).** The end year is before the start, probably 2663.
  - **I22. Ishbosheth's end year, 1049 (CFAH-16 Table 1) vs 1048 BC (Table 2).** Both are kept.
- **Recommendation:** keep the entries display only, as now. Tell me if any of the CFAH identifications above should not attach CFAH dates to the existing records (especially Alexander and the Herodotus kings of Dynasty 26). If so, I will list those rows without a person instead.

## H. Cory, Ancient Fragments (1876 Hodges), pass 1

Source: Isaac Preston Cory, *Ancient Fragments*, new and enlarged edition, ed. E. Richmond Hodges (London: Reeves & Turner, 1876). Internet Archive `corysancientfrag00coryuoft`, opened 2026-10-23. The table is `data/cory-dates-extract.md`. Cory is display only. No sort year changed. `year_bc_ad` is null on every Cory entry.

### H1. Sammuges, his unnamed brother, and Sardanapallus
- Polyhistor (p. 87, the word "years" at the top of p. 88) prints "Then Sammuges (Saulmugina ?) reigned 21 years, and likewise his brother 21 years." The brother is not named. The next sentences give Sardanapallus the Chaldean 21 years "After Samuges".
- The three figures are stored separately. The brother has no record. Sammuges and Sardanapallus are not merged.
- **Recommendation:** leave them separate.

### H2. The parenthesis "(b.c. 878)" at the founding of Carthage
- Menander (p. 30) prints: "In the seventh year of his reign, his sister (Dido), fled from him, and founded the city of Carthage in Libya (b.c. 878)". The parenthesis sits in the sentence, immediately before the Josephus citation.
- It is stored only inside the quotation. `year_bc_ad` is null. `founding-of-carthage` stays on its Generations provisional sort ("Sometime between 800 and 900 BC"). 878, if it is a year, falls inside that range. Status in the extract: consistent.
- **Options:**
  1. Keep it as a quotation only (as now).
  2. Store 878 as `year_bc_ad` on the Cory row, still without letting Cory set the sort.
- **Recommendation:** option 1. The parenthesis may be Hodges's gloss, and Cory must not become a sort tier.

### H3. Ninus and Nimrod
- Castor (p. 91) prints "Ninus reigned over the Assyrians 52 years." That statement is a display entry on the existing person `ninus`, which the Raleigh import already created. The Raleigh document was not replaced, and its sort was not changed. He is not linked to `nimrod`.
- **Recommendation:** leave them unlinked unless you want Ninus identified with Nimrod.

### H4. Which edition: 1826, 1832, 1876, and the roadmap's 1828
- The title page prints "LONDON: REEVES & TURNER, 196, STRAND" and "1876". The editor signs "LONDON, 1876".
- The preface prints "The first edition of this work appeared in 1826".
- An advertisement footnote prints "The 2nd edition was published in 1832".
- The roadmap names an 1828 edition. That year was not on the pages opened for this pass. This pass uses the 1876 Hodges edition throughout.
- **Question:** keep 1876 as the Cory source, or do you want the 1828 printing read as well?

### H5. Hodges's introduction (printed pp. 43–50)
- Those pages are the editor's own BC dates (a Nabonassar era, dynasty lengths, an eclipse). They were not entered. They are not fragments.
- **Recommendation:** do not add them in a later pass.

### H6. Manetho as the next Cory pass
- Manetho, the Old Chronicle and the Laterculus in this volume were not read. A later pass can add them as further display rows on this same `cory` chronology, not as a new source.
- **Recommendation:** next Cory pass, same source, still display only. Hales stays a separate pull request.

### H7. Xisuthrus and Noah
- Apollodorus, Abydenus and Polyhistor place the flood in the time of Xisuthrus, the tenth antediluvian king. The text does not call him Noah. He was not added to `the-flood`'s people. The Flood's sort stays CFAH AP-29, 2348 BC.
- The 120 sari and the printed 432,000 years are on `the-flood` as display rows, status framework. They do not move the Flood.
- **Recommendation:** do not identify Xisuthrus with Noah.

### H8. Salmanasar and Shalmaneser I
- The Tyrian heading on p. 30 is "Of the Invasion of Salmanasar (or Shalmaneser)." Elulæus's 36 years were not attached to `shalmaneser-i`.
- **Recommendation:** leave them unlinked.

### H9. Eleven kings with no number
- Polyhistor (p. 85) prints "eleven kings during . . . . years". The footnote says "No number is given in the original text." CFAH's 33 years for Babylon dynasty 3 were not written into the blank.
- **Recommendation:** leave the blank.

### H10. Two kings named Hiromus, and two named Ithobalus
- Hiromus son of Abibalus (p. 28: thirty-four years, lived fifty-three; Solomon's contemporary) is `hiram-of-tyre`. Hiromus brother of Merbalus (p. 32: twenty years; "In his time Cyrus was king of Persia") is `hiram-of-tyre-ii`.
- Ithobalus priest of Astarte (p. 30: thirty-two years, lived sixty-eight) is `ithobalus`. Ithobalus of the siege (p. 32: Nebuchadnezzar "beseiged Tyre for thirteen years"; no reign length) is `ithobalus-ii`.
- **Recommendation:** keep the pairs separate.

### H11. Semiramis's 42 years
- Castor (p. 91) prints that Semiramis "reigned over the Assyrians 42 years." That length is on `semiramis-i` and on `reign-of-semiramis-i`. The person's CFAH note already says "Her 42-year reign". Status: agrees. No BC year was stored.
- An OSF king-list row elsewhere gives Dumuzi/Semiramis 30 years. This pass does not change that row and does not treat 42 as a correction of 30.
- **Recommendation:** leave both figures on their own rows.

### H12. Records Raleigh already had
- `belus` and `ninus` already exist from the Raleigh import. Cory's statements for those names were appended as display entries on those same records. Their descriptions still begin "Added from the Raleigh import". Their Raleigh entries and sorts were kept. The Cory person summaries were not applied.
- These pairs were not linked and were not merged: `sardanapallus` (Cory) and `sardanapalus` (Raleigh); `esarhaddon` (Cory) and `asarhaddon` (Raleigh); `semiramis-i` and `semiramis`; `ninyas` and `ninias`; `cambyses-ii` and `cambyses`; `evil-merodach` (Cory) and `euilmerodach` (Raleigh).
- **Recommendation:** leave each pair as two records until you say they are the same person.

### H6, addressed by pass 2 (2026-10-27)
- Manetho, the Old Chronicle and Eratosthenes are now display rows on the same `cory` chronology. This edition prints one English Manetho list, with bracketed variants, and cites Syncellus and Eusebius at the ends of the books. It does not print separate Africanus, Eusebius and Syncellus columns. The editor's note on p. 125 points to Bunsen. Those parallel lists were not copied from Bunsen.
- No Lydian king list with reign lengths was found. The Periplus of Hanno has no reign list. Castor's Assyrian canon was already in pass 1. Persian kings appear inside Manetho's 27th and 31st dynasties and in the Berossus fragments.
- **Recommendation:** keep this one list. A later pass is needed only if you want a different edition that prints the parallel columns.

### H13. One English Manetho list
- See H6. Brackets such as "[or, Assis]" and "(or Shishak)" are the edition's own words and are inside the quotation.
- **Recommendation:** do not invent an Africanus column for this edition.

### H14. Printed totals that do not match the printed reigns
- Both figures are kept, status internal. A sum we add is labelled "Our check (not a figure of the text)" and is not stored as a year.
- Dynasty 1: "253 [or 263, according to the true reckoning]". Our check is 263.
- Dynasty 4: "274 years [or 284, according to the correct computation.]" Our check is 284.
- Dynasty 5: "248 years [or, 218 years.]" Our check is 218.
- Dynasty 6: Phiops "reigned till he had completed his hundredth year". The total is 203. Our check is 203 if that hundredth year is counted as 100. The 100 is not stored.
- Dynasty 12: "Altogether 160 years", and Sesostris is "41 [or, 48]". Our check is 153 with 41, and 160 with 48.
- Dynasty 18: "Altogether 263 [or, 259]". Amōs has no length. Our check of the printed lengths is 262.
- Dynasty 19: "Altogether 209 years". Thuoris has no length. Our check of the six lengths is 204.
- Dynasty 22: "Altogether reigned 120 years". Our check is 116.
- Dynasty 29: the heading says four kings and five names are printed. "Altogether 20 years and four months". Our check of the year figures is 21, plus 4 months.
- Africanus, p. 99: the prose says 744 years from the Exodus to the Temple. The table's 4457 minus 3705 is 752. Our check only.
- **Recommendation:** keep both printed figures. Do not pick one.

### H15. Josephus's numbers are not the dynasty list's numbers
- Apachnas is 61 years in the dynasty list and thirty-six years and seven months in Josephus. Assis is 49 years, and forty-nine years and two months. The eighteenth-dynasty lengths and Josephus's lengths on pp. 129–130 were not merged by position. Ianias (fifty years and one month) was not merged with Staan (50 years).
- **Recommendation:** leave them as separate statements.

### H16. Eratosthenes' years of the world
- They are inside the quotation. `year_am` is null. Nothing was converted to BC.
- Mines, (Menes), sixty-two years, is on `menes`. Athothes (59 years) is not `athothis`. Phruron, "who is Nilus", is `phruron` and was not attached to `nilus`. Nitokris (6 years) is `nitocris-theban`, not `nitocris`.
- The 36th king is printed as dots (14 years). No person was created.
- **Recommendation:** leave the years of the world unconverted, and leave Phruron and nilus unmerged.

### H17. The Africanus table is the editor's summary
- pp. 98–99 are the biographical notice, which says it is abridged from Bunsen. It is the only printed Hebrew chronology of Africanus in the volume, so it was entered, labelled as that summary, with null year fields.
- The Incarnation is year of the world 5500, and the editor adds "(which we, following the Hebrew text, according to Archbishop Usher, make 4004)". Neither number is stored. Status CONFLICT on `birth-of-jesus`. The Flood is A.M. 2262, status CONFLICT on `the-flood`. The sort is unchanged.
- The 215 years of the sojourn, the 744, the 1020 from Ogyges and Phoroneus, the same 1020 between Moses and Solomon, and the 25 years for Joshua are the editor's prose on p. 99.
- **Recommendation:** keep them as display quotations. Say if an editorial summary is out of scope (H5) and they should be removed.

### H18. Names that were attached, and names that were not
- Attached because the 1876 text, or the existing record, is already that king: Athothis, Sethenes (`senedj`), Kenkenes (CFAH Dynasty 1), Cheops (the Suphis of 66 years, not the Suphis of 63), Nitocris (12 years), Bocchoris (6), Psammetichus (54), Nechao the 2nd and Joahaz, Vaphris/Hophra and Apries, Amosis/Amasis, Nepherites, Achoris, Psammuthis (1 year) and Nephorites, Darius son of Hystaspes (36, agrees with pass 1), Xerxes the Great (21), Artaxerxes (41, on `artaxerxes-longimanus`; the text does not say Longimanus), Cambyses, Ochus, Arses, Kephren, Diabies (Shuckford already has this Theban king at 19 years).
- Josephus p. 65, twenty-nine years, is Nabopolassar (pass 1 prints 20). p. 67, two years, is Evil-Merodach (pass 1 prints 12). Neriglissar's four years agree. Nabonidus's seventeenth year is the same reign as pass 1's 17 years, status consistent. Nebuchadnezzar's forty-three years agree.
- Not attached: the first Nechao (8 years) is `nechao-d26`, not any other Necho. Amōs of the eighteenth dynasty is `amos-d18`, not `ahmose-i`. Teos of the thirtieth dynasty is `teos-d30`, not `teos`. Nectanebes and Nectanebos are new records, not `nectanebus`. Sesonchis (or Shishak) is `sesonchis`, not `shoshenq-i`. Tarkos [Tirhakah] is `tarkos`, not `taharqa`. Sesostris is not Senusret III. Sesoosis (33 years) is not Sesostris. Zeet is not `zet`. Amyrteos is not `setnakht`. Dynasty 18 and 19 Ramesses are not Rameses I, II or III. Chembres (50 years) is not Cheops or Suphis. Phruron is not `nilus`. Sanchoniathon's Ilus is `ilus-sanchoniathon`, not Raleigh's `ilus`. Hecataeus's high priest is `hezekiah-high-priest`, not king `hezekiah`. Darius the son of Xerxes (19 years) is not `darius-nothus`. The Xerxes of 2 months is not Xerxes the Great.
- **Recommendation:** leave these pairs unmerged until you say they are the same person. The Artaxerxes of 41 years, and Tarkos [Tirhakah], are the two I would most want a yes or no on.

### H19. Diodorus's closing citation says Book ii
- The canon ends: "From Diodorus Siculus, Hist., Book ii." It was left as printed.
- **Recommendation:** do not correct the book number in the citation.

### H20. The fifteenth dynasty and Eusebius's seventeenth
- A footnote on the Hyksos says "This is the Seventeenth Dynasty according to Eusebius." The kings were recorded as the edition's fifteenth dynasty.
- **Recommendation:** keep the edition's number.

### H21. Osarsiph
- The editorial footnote on p. 132 says "By Osarsiph he means Moses." That footnote was not used as a link. The fragment itself, on p. 135, says his name was changed and he was called Moyses (Mouses or Moses). That sentence is on `moses`. Osarsiph has no record.
- **Recommendation:** keep the fragment's sentence on Moses, and do not add a record for Osarsiph.

### H22. Totals that belong to no king
- "Total 990 years" is the line after Bocchoris and is not his reign. "Total 1,050 years" closes book 3. "192, who reigned 2,308 years" and "96 kings, and 2121 years" are book totals. None of these was given a new event. An event with no tier 1–4 year cannot be created.
- **Recommendation:** leave them unmapped.

### H23. Thallus, "Theophylact"
- p. 83 prints "From Theophylact ad Autolycus". The citation was left as printed. It was not corrected to Theophilus.
- **Recommendation:** leave the printed name.

## G. Raleigh, *The History of the World* (1617), full table (2026-10-23)

The chronological table (sig. 781b to the FINIS trailer) is entered as display only. Nothing was converted from his yeere of the World to BC. No `sorting_year` on an existing record was changed. New people are tier `none`, with `sorting_year` null. Display titles of people taken from the table are modern English spelling. His printed spelling is an alternate name (G10). The importer is `scripts/raleigh/import.mjs`. Counts and every skipped cell are in `docs/raleigh-pass-log.md` and `data/raleigh-dates-extract.md`.

### G1. No chart for a person who has only his yeere of the World

A new person has a Raleigh year and a null CFAH birth. `site/build.mjs` draws a lifespan only from a tier birth or death, a CFAH reign that already has a BC year, or a linked event with a sort year. These people therefore render as `{none: true}`. His number is on the page. It is not placed on the BC axis. Say if you want a display-only AM axis for them.

### G2. No new events

The table was attached only to events the portal already had: the Flood, Enoch's translation, the Passover (Exodus), and the births of Abraham, Isaac, and Moses, plus Moses' flight to Midian. Other dated sentences stay in the skip log. One to decide:

- World 2994, sig. 786b: "Salomon beganne to build the Temple 480. yeeres compleat after the deliuerance out of Aegypt." Solomon's own reign is entered ("1. Salomon, 40", World 2991, sig. 786b). The temple sentence was not attached to `temple-dedication`.

### G3. Figures he prints twice, entered once

The table year is the one stored. The other figure is quoted in the note and has no second `year_am`.

- Abraham: body and table 2009; the 2008 line names Eusebius and Augustine (B3, now recorded).
- Passover: table and sig. 184a print 2514. Sig. 174a also prints "2514. to Codoman, or after our account, 2513."
- Moses' flight: the table row is World 2473. Sig. 184a says "in the yeere of the World 2474."
- Moses' death: the table row is "The Last yeere of Moses." at World 2553. Sig. 206b prints "yeere of the World 25 54", with a space. That spaced figure was not joined into 2554.
- Peleg: the table has "1. Peleg." at World 1758, with no length. Sig. 113a says "yeere of the World 1757. or 1758." 1757 was not entered.
- Nimrod: the table reign is "1. Nim rod. 114" at World 1788 (sig. 782a). Book II, ch. I, §VIII, sig. 164a also prints "which number of 114. necessitie bestoweth on Nimrod", and then "liued in all but one hundred seuenty nine yeeres: whereof hee reigned one hundred and twelue". The 179 and the 112 are in the note, not as years.
- Birth plus the printed span is not always the death row. Both stay as printed: Adam 1 + 920 and a death at 930; Enoch's birth cell prints 265 and the translation row is World 987; Abraham 2009 + 175 and a death at 2183; Salah 1694 + 433 and a death at 2126; Eber 1724 + 464 and a death at 2187. His own note on the table says the patriarchs' years are reckoned complete.

### G4. Year cells that are not Julian = World + 682

These were not corrected and were not entered. The full list is in the extract. The two that touch people already in the portal:

- "The last yeere of Sem." prints 3840 and 2158 (sig. 783a). 3840 − 2158 is not 682, so the row was not entered and the figures were not corrected.
- "The last yeere of Isaac." prints 2970 and 2298 (sig. 783b). The difference is 672, not 682.

Shem's birth cell is ". Sem. 600" at World 1559. It has no "1." The birth is entered, and the note says the "1." is not printed. Arphaxad's "1. Arphaxad 438" sits on a heading row with no yeere of the World and was skipped. Jared's birth "1. ●ared. 962" is illegible; "Iared dyed" at 1422 is entered. Serug's "1. Sarug. 2●0" is illegible; "The last of Sarug" at 2049 is entered. "Seth ay ed" at World 1042 is printed that way and was not read as "dyed".

### G5. Two figures after one name

His notation is "1. Name, LENGTH". Some cells then print a second figure, and the following rows of that column carry a rising pair (for example 33, then 50, then 66, then 89). The second figure was not taken as the length, and the first was not taken either, because the cell does not print a single length. They are listed. Among them:

- "1. Sesac 26 167" (World 3010, sig. 786b)
- "1. Cephrenes 50. 121" (World 3142, sig. 787b)
- "3 1. Antiochus Theus. 16 50" (World 3771)
- "4 1. Selencus Callenicus 20 66" (World 3787)
- "1. Simon the iust 28 219" (World 3792)
- "5 1. Antiochus the Great . 36. 89" (World 3810)
- "6 1. Selencus Philopator, 12. 125" (World 3846)
- "7 1. Antiochus Epiphanes, 12. 137" (World 3858)

Say if the first figure should be entered as the length, with the second quoted and unused. "247 1. Onias high Priest 39." (World 3820, sig. 793b) has one figure after the name, so 39 is the length entered. The 247 stands in the column where neighbouring rows print the rising total. It is in the date string and is not a second year.

### G6. Names that share a cell, and names that are not persons

One length for two names was not split: "Debora & Ba", "Atreus and Thyestes", "Salmanassar or Nabanassar", "Cyaxares or Darius the Mede", "Antipater and Alexander the sonne of Cassander". "1. Dynastie. 178", "1. Interregnum, 2.", and "Iehoram againe" were not made into people. "1. Philip King of Macedon 24. yeeres, and part of the 25." (World 3672) is listed. A later cell, "4 1. Philip. 42." at World 3812, is a separate person, `philip`.

### G7. People kept apart on purpose

- `cyrus-the-great` carries "1 Cyrus 7." at World 3495 (sig. 790a). "Cyras in Persia, 23" is a different new person, `cyras-in-persia`. They were not merged.
- "1. Darius the Mede 2." is `darius-the-mede`. The combined cell "Cyaxares or Darius the Mede" was not attached to `cyaxares`.
- Egyptian "1 Cham 161" is `cham`, a reign under the kings of Egypt. It was not attached to Ham son of Noah.
- `iudas-macchabaeus` is "1. Iudas Macchabaeus, 6." at World 3867 (sig. 794a), column "Iewes and Daniel". He was not attached to Judah. A rowspan on the row above had put that cell under Rome until the column was read with the span.
- `hosea` is column Israel. The same rowspan had put him under Judah.
- `demtrius` is the brace expansion of "1. Demtri{us}. 6." at World 3739. A later cell, "2 1 Demetrius 10" at World 3790, is `demetrius`. The spelling was not corrected.
- The table's "1 1. leroboam, 22." (World 3031, sig. 787a) is on `jeroboam-i`. The printed spelling was kept in the date.
- Manasseh the king was not attached to `manasseh` (son of Joseph). The high-priest cell "1. Manasses high Priest, 27. 191" is listed with the two-figure cells and was not entered.
- Death labels with no existing person were not made into people: Codrus, Amasis, Epaminondas, Alexander ("Alexander dyed 17. dayes before the Summer Solstice", World 3708; not attached to `alexander-the-great`), and "Hiero King of Syracuse dyes" (World 3815).

### G8. His own years that have no event to receive them

- Sig. 94b: Bucholzerus has Rome "in the Worlds yeere 3219", and "the account which I follow" has it "built in the Worlds yeere 3280". The table row at 3280 enters Romulus ("1 1. Romulus, 37.", sig. 788b). The 3280 was not made into a founding event. The same row's long note begins "Rome built" and then turns illegible.
- Sig. 273b: "The persecution of the Ammonites lasted 18. yeeres, and ended in the yeere of the World 2820."
- Sig. 263a: "which terme expired in the Worlds yeere 2691. In the dayes of Ehud..." Othniel and Ehud have their own reign cells. 2691 was not stored as a death.
- Sig. 161b: "the yeere of Ismaels birth was the Worlds yeere 2094". The table row is "Ismael borne" at World 2095. No Ishmael person was created.

### G9. What I need from you

1. Whether G5's first figure should be entered as the length.
2. Whether the temple sentence at World 2994 should be attached to `temple-dedication`.
3. Whether `cyras-in-persia` is Cyrus the Great, and whether `darius-the-mede` is the portal's Cyaxares.
4. Whether AM-only people should stay off the chart (G1).

### G10. Modern display names, and no BC parenthetical (2026-10-23)

People taken from the table now have a modern English display title. Raleigh's printed spelling is `alt_names`, so a search for the 1617 form still finds the person. The date string is still his cell, verbatim. Record ids were not renamed. The separations in G7 are unchanged. `demtrius` and `demetrius` are both titled Demetrius. `cham` is titled Ham (Egypt) and is not Ham son of Noah. `cyras-in-persia` is titled Cyrus in Persia. `manasses` is titled Manasseh and is not `manasseh` (son of Joseph). The printed names lephta, Iair, and Thola are alternate names on the existing judges Jephthah, Jair, and Tola. Those three were not given a second person.

No BC year was added. To the Reader, sig. 780b, says: "This IVLIAN Perioà, after the present accompt, alwayes exceedes the yeares of the World by 682." His example is Jehoshaphat beginning in the 3774th year of the Julian Period, the 3092nd of the World, and the 99th of the Temple. 3774 − 3092 is 682. He does not state a year before Christ, and he does not give the epoch that would turn that offset into one. `year_bc_ad` on his entries stays null. "seuen hundred and fourtie yeeres before Christ borne" dates the Erythraean Sibyl. It is not a rule for turning a yeere of the World into a year before Christ.

Decision: Raleigh stays AM only. No BC parenthetical will be added. `year_bc_ad` on his entries stays null.

## I. Names on person pages (2026-10-24)

### I1. Approve the name-form file, and say how far the witnesses should go

- **Why it matters:** every person page now has a Name section (alternate spellings, original-language letters, and footnotes). The letters live in a new file, `data/name-forms.json`, with `schema/name-forms.schema.json`. A new field or file needs your approval before merge.
- **What is entered:**
  - Biblical Hebrew, Aramaic and Greek are the forms printed by STEPBible TIPNR (CC BY 4.0), read 2026-10-24. The TIPNR file is not copied into the repo. A form is attached only when one of its verses is already a `scripture_refs` entry on that person, and the English name matches. 109 of 110 people who have a scripture reference matched. None were ambiguous.
  - History spellings are letters already printed inside a passage stored on the person: Raleigh 1617, Josephus (Whiston), Herodotus (Rawlinson), Ussher 1658, and Cory 1876. The footnote quotes the name, not the whole sentence.
  - `alt_names` that do not appear in one of those passages stay on the page as “Written source not yet attached.”
  - No inscription is entered. The page says so.
- **Not equated:** `apries` cites Jeremiah 44:30. TIPNR’s individual for that king is headed Hophra, and it does not list the English “Apries,” so the Hebrew was not copied onto Apries. Herodotus’s English spelling “Apries” is footnoted from the passage already on the record.
- **Options:**
  1. Keep this boundary: original letters only from a verse the person record already cites; Greek only when that verse is one of them; inscriptions empty until a writing has been read.
  2. Also show the Greek form TIPNR gives for a matched individual even when the person record does not cite the New Testament verse (Abraham would gain Ἀβραάμ at Matthew 1:1).
  3. Add a named Hebrew edition (for example a facsimile of the Leningrad Codex) as a second check before the letters are called the Masoretic writing rather than “as printed in TIPNR.”
  4. Name the inscription editions to read next. Nothing is invented in the meantime.
- **Recommendation:** option 1 for this merge, and option 3 before any caption says “Masoretic text” rather than “TIPNR.” The footnotes already say the letters are the ones TIPNR prints.

## J. Bible reference popover (2026-10-24)

### J1. Amundson Interpretive Version address — answered 2026-10-25

- **Answer:** the files are at `https://aivbible.kevinamundson.me/usx/`, with each book in a subfolder.
- **What the popover does now:** the Berean Standard Bible still comes from `https://bible.helloao.org/api/BSB/{book}/{chapter}.simple.json`. The Amundson Interpretive Version is read as USX. For 1 Samuel it tries, in order, `/usx/1SA/08-1SA.usx`, `/usx/08-1SA/08-1SA.usx`, `/usx/08-1SA.usx`, and `/usx/1SA/1SA.usx`. The other books use the same pattern. The names `08-1SA.usx` and the rest are the file names in the local AIV USX set. Footnotes are left out. If every request fails, the Berean Standard Bible still shows and the AIV block says it could not be loaded.
- **Still open:** on 2026-10-25 the host returned HTTP 520 for `/usx/` and for those files, with no `Access-Control-Allow-Origin` header, so the filename inside the folder could not be confirmed from the live site. When the host is up it still has to send that header, or the browser cannot read the USX.

## K. Shuckford, *The Sacred and Profane History of the World Connected* (1819, ed. Creighton), volume 1

Source: Samuel Shuckford, fifth edition, revised by James Creighton (London: William Baynes, 1819), volume 1. Read 2026-10-24 in a Tolle Lege Press facsimile of that edition (ISBN 978-1-60702-153-7). Links point at the Princeton Theological Seminary scan, Internet Archive `sacredprofanehis01shuc`, full view, published 1819. The table is `data/shuckford-dates-extract.md`. Shuckford is display only. No sort year changed. Anno Mundi is not converted to BC. A BC year is stored only where the page prints “before Christ” or “before our Saviour”.

These items were first written as section J. The Bible reference popover already uses J, so this section is K.

### K1. Only volume 1 was in the file
- The supplied PDF is volume 1. It ends with “END OF VOL. I”. Volumes 2–4 were not imported.
- The preface says tables that adjust his years of the world to the Julian period and the Christian era will come when the whole work is done. Those tables are not in this volume.
- **Recommendation:** ship this volume as display only. Read volumes 2–4 in a later pass on the same chronology, still without converting Anno Mundi to BC.

### K2. Adam’s birth is year of the world 1
- The Hebrew table on printed p. 44 counts Adam’s birth as year of the world 1, and his death as 930. The same row prints a life of 930 years.
- The repo’s Masoretic check uses AM 0 for Adam’s birth. His death at AM 930 agrees with `masoretic-genealogy`.
- The display row records 1. The sort is unchanged.
- **Recommendation:** leave both figures. Do not move the Masoretic birth to year 1, and do not rewrite Shuckford’s 1 as 0.

### K3. Abraham born A. M. 2008 and A. M. 2001
- Printed p. 169: “by the Hebrew chronology, that Abraham was born A. M. 2008”.
- Printed p. 251: “Abram was born in the one hundred and thirtieth year of Terah, three hundred and fifty-two years after the Flood, A. M. 2001”. Page 252 says this birth was fixed by the Hebrew chronology.
- Page 44 places the Flood at anno mundi 1656. He does not reconcile 2008 with 2001, or 1656 plus 352 with 2001.
- Both years are on `abraham` birth and on `abraham-birth`. Neither changes the sort.
- The Tolle Lege facsimile prints a clear 1 in A. M. 2001. Internet Archive leaf `page/n344` is printed p. 251 and has the same sentence. The last digit on that leaf is blotted, so the scan alone does not confirm 1 or 8. The stored year is the clear facsimile digit.
- **Recommendation:** leave both of his printed years, with 2001 taken from the facsimile. Do not change 2001 to 2008 because of the blot. Scripture governs.

### K4. Ninus at A. M. 2017 and at A. M. 1957
- Printed p. 164: “after a reign of two and fifty years, died A. M. 2017”.
- Printed p. 171: “A. M. 1957, the year in which I have placed the beginning of Ninus’s reign”, counted 1,300 years back from Sardanapalus at A. M. 3257.
- A start of 1965 is not printed in the death sentence and is not stored. 1957 plus 52 is not 2017. Both statements are entered.
- **Recommendation:** leave both. Do not store a computed start.

### K5. Mizraim, or Menes, at A. M. 1772 and at A. M. 1805
- Printed p. 183 and p. 186: Menes began A. M. 1772, called the Hebrew chronology.
- Printed p. 187: another computation “consequently began A. M. 1805”. He writes that he cannot say which of them, or whether either, is the exact truth.
- A rejected count that would place Mizraim A. M. 1633, twenty-three years before the Flood, is in the extract only. It is not on the person.
- **Recommendation:** keep 1772 and 1805. Do not adopt 1633.

### K6. Enoch’s table column is headed “Died”
- The Hebrew table’s last column is “Died in the year of the world”. Enoch’s cell is 987.
- The entry is on `enoch` translated, which is where this repo keeps his end. The note says the heading is “Died”.
- **Recommendation:** keep it on translated. Do not add a death slot for Enoch.

### K7. Athothes and the existing Athothis
- Printed p. 246: “A. M. 2034, when Athothes, the second king of Thebes, died”. The spelling is Athothes.
- The year is on the existing person `athothis`. CFAH equates that person with Narmer. Shuckford does not say Narmer.
- **Recommendation:** leave the attachment, with the doubt in the note. Do not rename the person, and do not add Narmer as his name.

### K8. Fohi and Noah
- Printed p. 26 reports Fohi about 2952 years before Christ, and a second figure of 2847 years before our Saviour. Shuckford says the age of Fohi coincides with that of Moses’ Noah, and he treats them as the same person.
- `fohi` is a separate unsorted person. He is not an alternate name on `noah`.
- **Recommendation:** keep the records apart. Scripture’s Noah is not renamed from a Chinese king-list.

### K9. Sardanapalus, and Ananim
- Printed p. 171: “The death of Sardanapalus happened A. M. 3257”. That year is on Raleigh’s `sardanapalus`, not on Cory’s `sardanapallus`.
- Printed p. 191: Ananim, also called Curudes, “reigned sixty-three years, and so died A. M. 2006”, from Syncellus. The year is on the Genesis 10 person `anamim`. No second person was created.
- **Recommendation:** leave both attachments. Do not merge the two Sardanapalus records.

### K10. Dated statements with no record to receive them
- No new events were created. A new event would need a sorting year, and this chronology must not supply one. These stay in the extract only:
  - Abraham’s move from Ur to Haran, A. M. 2078 (the year is the first line of p. 252).
  - Jacob’s pillar, “even as ancient as A. M. 2246” (p. 314).
  - The start of Chaldean astronomy, A. M. 1771 (p. 170).
  - A later Scythian settlement, “about A. M. 3400” (p. 89).
  - The rejected Mizraim year A. M. 1633 (p. 185).
  - The Parian Chronicon composed A. M. 3741, a footnote reporting Ussher (p. 306).
- **Recommendation:** leave them unmapped until an event already exists, or until you approve a new event that can sort from a tier 1–4 year.

### K11. The facsimile and the 1819 scan
- The file that was read is a modern Tolle Lege facsimile. The dates were read in that facsimile. Printed pages 13, 44, and 246 were also opened on the 1819 scan (`page/n100`, `page/n131`, `page/n339`) and agree. Links use the scan.
- The Septuagint table on p. 50 was seen. Only the prose result, “so fix it A. M. 2263, instead of 1657”, is entered, and it is marked framework. He does not adopt it. Individual Septuagint cells are not entered: Seth’s death-year in that table does not agree with that row’s own addition.
- **Recommendation:** keep the links on the 1819 scan. Do not enter the Septuagint cells in this pass.

### K12. Six new people stay unsorted
- `fohi`, `nilus`, `egialeus`, `diabies`, `syphis`, and `danaus` have no tier 1–4 birth year. Each is tier `none`, with `sorting_year` null.
- **Recommendation:** do not make Shuckford a provisional sort tier.

### K13. Branch name
- You asked for the branch `Samuel-Shuckford`. The standing rule is `gb/<task-slug>`. The branch was cut from `origin/main` at `999da18` and was not pushed to `main`.
- **Recommendation:** keep the name you asked for on this pull request.

### K14. The letters on p. 26 are Sevedo
- The page prints “Alvarez Sevedo places his reign not so early, imagining it to be but 2060 years”.
- The clause does not repeat “before Christ”, so no BC year is stored. The name is entered as Sevedo. It was not corrected to another spelling.
- **Recommendation:** keep Sevedo, as printed. A later pass can cite another edition if that edition prints a different name.

## L. Hales, *A New Analysis of Chronology* (1830, 2nd ed.), pass 1

Source: Rev. William Hales, D.D., second edition, corrected and improved, four volumes (London: printed for C. J. G. & F. Rivington, 1830; printers Gilbert and Rivington, St. John’s Square). Title pages and imprints of all four volumes were opened on 2026-10-27. The scans are Boston Public Library copies, Internet Archive `newanalysisofchr01hale` through `newanalysisofchr04hale`, full view. The table is `data/hales-dates-extract.md`. Hales is display only. No sort year changed. He prints a B.C. column in these tables, so that figure is `year_bc_ad`. Anno Mundi is not stored and is not converted.

### L1. The edition is 1830, not the 1809–1812 first edition
- The roadmap names *A New Analysis of Chronology* (1809–12).
- The full-view scans that were opened are the second edition, 1830, four volumes. Each title page prints “SECOND EDITION, CORRECTED AND IMPROVED” and “MDCCCXXX”.
- No 1809 URL was used.
- **Recommendation:** keep the 1830 second edition as the source of these rows. A later pass can add the first edition only after its own title pages are opened.

### L2. The synopsis opening is cited as p. xxxii
- Volume II, the first synopsis leaf, has no page numeral in the header. The next leaf is headed xxxiii.
- The link is Archive `page/n35`. The citation says p. xxxii.
- **Recommendation:** keep p. xxxii, with that note. Do not invent a printed numeral that is not on the leaf.

### L3. He adopts the longer ages. Creation is B.C. 5411
- The parenthesis on a patriarchal line is the Hebrew age. The other age is the one he adopts. Only the B.C. column is stored.
- His Creation is B.C. 5411 and his Deluge is B.C. 3155. Both conflict with the Masoretic years. Scripture governs. The sort is unchanged.
- Period 2 goes Arphaxad, Salah, Heber, Peleg. He prints no second Cainan. None was added.
- The line “1. Deluge, Shem 2 3155” is not stored as Shem’s birth. The 2 is the Y-column interval to Arphaxad at 3153.
- **Recommendation:** leave his printed B.C. years on display. Do not store the parenthetical Hebrew ages, and do not move the Masoretic figures.

### L4. Judah’s kings were not merged with Israel’s
- Abijah, Jehoshaphat, Jehoram, Ahaziah, Joash, Amaziah, Uzziah, Jotham, Ahaz, Amon, Jehoahaz, Jehoiachin, and Zedekiah of Judah had no record. New people were created, tier `none`.
- They were not attached to Raleigh’s Israel-column records (`iehoabaz`, `ioas`, `ahaziah-king-of-israel`).
- Manasseh the king is on `manasses`. He is not `manasseh`, the son of Joseph.
- Jehoiakim the king is on `iehoiakim`. Jehoiakim the high priest is a new person.
- Jeshua the high priest is not Joshua the son of Nun.
- **Recommendation:** keep the Judah kings and the high priests apart from the lookalikes.

### L5. Darius the Mede, Darius Hystaspes, Menes, and Sesostris
- “Darius the Mede, or Cyaxares” is on `darius-the-mede` only. The existing `cyaxares` record was not used.
- “Darius Hystaspes” is on `darius-i` only. `darius-hystaspis` was left unlinked.
- “Menes reigns in Egypt” 2412 is a new person `menes`. He is not `menes-abdul-noor`.
- “Sesostris reigns in Egypt” 1308 is in the extract only. It was not placed on `reign-of-senusret-iii`.
- “Cecrops reigns at Athens” 1558 is on `reign-of-cecrops`, not Cecrops II.
- **Recommendation:** leave these attachments. Do not merge the pairs.

### L6. The Temple lines
- Synopsis “Temple begun” 1027 and Table XI “Foundation of Solomon’s Temple” 1027 have no foundation event. They stay in the extract.
- “finished” 1020 is on `temple-dedication`. The note says the record is the dedication.
- “Second Temple begun” 535 is on `temple-rebuilding-begins`. “Temple finished” 516 is on `second-temple-completed`.
- **Recommendation:** do not put 1027 on the dedication. Leave 1020 there, labelled as his “finished”.

### L7. Lines with no event to receive them
- No new events were created. A new event would need a sorting year, and this chronology must not supply one.
- Unmapped lines include the servitudes, Job’s trial, Abraham’s move to Charran and to Egypt, the rescue of Lot, Gerar, the intended sacrifice, Nathan’s prophecy, the offences and flights in Saul’s and David’s reigns, Esther’s marriage, Sesostris, the Cali yuga, the Chinese Tcheou line, the Julian Period, and the Era of Iphitus.
- “Dispersion of mankind” 2614 and “Division of the Earth” 2614 are on `first-territorial-division`. “Nimrod’s kingdom and Confusion of Tongues” 2554 is on `dispersion` and on `nimrod` reign. Those are different years in his table.
- “takes Babylon” 536 is on `fall-of-babylon-539-bc`. His year and the event’s year disagree. The attachment is kept so the conflict is visible.
- **Recommendation:** leave the unmapped lines in the extract until an event already exists, or until you approve a new event that can sort from a tier 1–4 year.

### L8. What this pass does not contain
- The rest of Table XI on p. 101: the Seleucid era (312), Era Cæsarea (49), Era Juliana (46), Era Hispanica (38), and Vict. Actiaca (30).
- All of p. 102, headed A.D., from the Vulgar Christian Era through the Netherlands (1566), then the Arundel Marbles.
- Synopsis Periods VIII–X, which begin on the same page as Nehemiah’s reform (high priests from Eliashib’s last 7 years, the Maccabees, and the New Testament).
- The narrative of volumes I–III, and the patriarchal comparison tables in volume I.
- Volume IV, the synopsis of profane king lists.
- **Recommendation:** stop here. A later pass can take the next clean block, still display only.

### L9. Twenty-one new people stay unsorted
- `abijah-of-judah`, `jehoshaphat`, `jehoram-of-judah`, `ahaziah-of-judah`, `joash-of-judah`, `amaziah`, `uzziah`, `jotham`, `ahaz`, `amon`, `jehoahaz-of-judah`, `jehoiachin`, `zedekiah`, `ishmael`, `gedaliah`, `belshazzar`, `zerubbabel`, `jeshua-high-priest`, `jehoiakim-high-priest`, `eliashib`, and `menes` have no tier 1–4 birth year. Each is tier `none`, with `sorting_year` null.
- Belshazzar’s five years from B.C. 558 are not on Nabonidus and not on `belshazzar-co-regent`.
- Jehoahaz and Jehoiachin print “3 m.” and have no B.C. year. Nebuchadnezzar’s “25 last” and Darius Nothus’s “3 first” are stored as he prints them, not as worked-out accessions.
- **Recommendation:** do not make Hales a provisional sort tier.

### L10. “Our check” is not a stored year
- The adopted ages from Adam through Noah sum to his printed 2256, and 5411 minus 2256 is his Deluge 3155. The period totals 1002, 545, 498, 120, 404, and 166 match the B.C. column the same way. Accession steps inside Judah match the reign lengths he prints, including the interregnum of 11 years after Amaziah.
- Those products are already his printed figures. The notes say “Our check”. Nothing extra is stored.
- **Recommendation:** leave the checks in the notes. Do not add a derived year.
