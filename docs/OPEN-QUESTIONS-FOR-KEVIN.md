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
  - **New biblical events from Preparing the World for Jesus** sort on that book's long chronology until a tier 1–4 date is added, so several sit earlier than their Ussher-sorted neighbours:
    - Destruction of Sodom c. 2066 BC (Ussher about 1897)
    - Joseph sold into Egypt 1930 BC (Ussher 1728)
    - Nimrod builds Nineveh c. 2418 BC
    - Mizraim settles Egypt c. 2450 BC
    - Forty years in the wilderness 1446–1406 BC
    - Fall of Jericho c. 1400 BC
    - Shamgar, Samson and Samuel as judges, about 18 years later than Ussher–Jones

    **Recommended fix:** add Ussher (tier 4) entries for these events from the Annals, which cover all of them. They would then sort by tier and Generations would stay secondary. Not done in this pass. The Timeline Reviews also print an asterisked Ussher-equivalent year for some events (Sodom "2066/1896*", Joseph "1930/1760*"); these are kept in the notes but are not used for sorting.
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
- **Preparing the World for Jesus: the book's own chronology.** This book does not follow Ussher. It dates Creation to "around 4174 BC" (p. 16) and the Flood to "about the year 2518 BC" (p. 29). End note 1 (p. 526) explains why: 60 years between Terah's firstborn and Abraham, a full 400 years in Egypt, and Solomon's death in 931 BC. Its "Timeline Review" pages print pairs such as "2518/2348* bc", where the asterisked year is the Ussher equivalent. We record the book's own year and keep the asterisked year in the note. As a result, every date from Creation to Joseph runs **170 years earlier than the sort**, and every date from Moses to the Conquest runs **about 45 years later**. All of these are flagged as conflicts in the extract, and none of them changes the sort. The main ones:
  - Creation c. 4174 BC (sort 4004)
  - Flood c. 2518 BC (sort 2348)
  - Noah born 3118 and died 2168 BC (Ussher 2948 and 1998)
  - Tower of Babel c. 2418 BC (CFAH founding of Babel 2234)
  - Abraham born 2166 BC (sort 1996)
  - Abram enters Egypt 2076 BC (sort 1921)
  - Joseph born c. 1911 and died c. 1801 BC (Ussher–Jones 1745 and 1635)
  - Moses born c. 1526 BC (sort 1571)
  - Exodus c. 1446 BC (sort 1491)
  - Jordan crossed in 1406 BC (sort 1450)
- **Preparing vs CFAH's Mesopotamian dates.** The book uses the conventional (secular) dates, while CFAH uses its revised chronology. The gaps are very large:
  - Sargon of Akkad c. 2334 BC (CFAH anchor 1619 BC)
  - End of Akkad 2147 BC (CFAH 1477)
  - Hammurabi reigned 1792–1750 BC (CFAH death 989 BC)
  - Shamshi-Adad I 1813–1791 BC (CFAH 1841)
  
  These are kept as secondary entries. **Question:** do you want a site-wide note explaining that Generations uses the conventional Near Eastern chronology here?
- **Preparing's judges table (p. 192)** runs 18 years later than Ussher–Jones from Othniel to Jair. Jephthah, Ibzan, Elon and Abdon agree exactly, and so does Saul's accession (1095 BC).
- **Inconsistencies inside Preparing (kept as printed, flagged on the record):**
  - The Fall of Samaria is 722 BC (p. 204) and 721 BC (p. 305).
  - Tutankhamun dies in 1325 BC (p. 128) and 1323 BC (p. 298).
  - Alexander destroys Tyre in 332 BC (Timeline Review, p. 238) and 314 BC (p. 478).
  - The Elamite raid on Babylon is c. 1150 BC (p. 106) and 1160 BC (p. 388).
  - The Zhou dynasty is 1027–249 BC (p. 262), but p. 50 gives "1046 through 206 BC" for Zhou and Qin together.
  - Caesar crosses the Rubicon on 10 January 49 BC (p. 491), but the Timeline Review (p. 506) says 50 BC.
  - The Peloponnesian War is 431–404 BC (p. 421), but the Timeline Review (p. 434) says it began in 433.
  - In the p. 166 and p. 238 Timeline Reviews, Moses and the Exodus are printed as "1571/1526*" and "1491/1446*" (or "1440*"). The order is reversed: the asterisked year is the book's own.
- **Timeline Review misprints that were not imported** (listed in the extract's skipped items):
  - "Sargon I Rules 2100/2164* bc" (p. 114)
  - "Gospel Reaches Ireland 432 bc" (p. 66; AD 432 is meant)
  - "Phillip II of Macedon Takes Throne 466 bc" and "Alexander II of Macedon Takes Throne 336 bc" (p. 434; the text has 359 BC and Alexander III)
  - "Hannah Gives Birth to Samuel 950 bc" and "Jochebed Gives Birth to Moses 1440 bc" (p. 456). The Moses entry is mentioned in the note on Moses' birth.
- **Preparing vs the other Generations books:**
  - Carthage founded in 1215 BC (Preparing) or 800–900 BC (Africa)
  - Qin empire begins in 231 BC (Preparing) or 221 BC (World)
  - Assyria takes Egypt c. 674 BC (Preparing) or c. 650 BC (Africa); Preparing also has 650 BC
  - Alexander takes Egypt in 332 BC (Preparing) or 330 BC (Africa)
  - Muslims take Egypt in AD 642 (Preparing) or 641 (Africa)
  - The Exodus c. 1446 BC (Preparing) or 1400 BC (Africa)
- **Not yet imported:** the divided-kingdom king tables on pp. 209–210 (approximate reign dates for the kings of Israel and Judah from 975 BC). **Question:** import them as about 39 reign records sorting provisionally, or leave the kings to a CFAH/Ussher pass? Recommendation: leave them to Ussher. Ussher covers every king, so the Generations dates would only be secondary entries.

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
- **Recommendation:** option 1. It is honest about where the data came from, and the label explains it.

### C7. Maps and IIIF (OQ 11 and 18)
- LoC item pages hit a Cloudflare challenge from the box. The IIIF thumbnails and info.json return 200.
- **Recommendation:** spot-check the 6 map records in a browser.

### C8. Licensing reminder (OQ 12)
- CFAH (© AiG), Jones and Jordan texts are cited and linked, with short quotes only. Jordan's full texts are in `sources/jordan` with your stated permission.
- **Recommendation:** no change.
