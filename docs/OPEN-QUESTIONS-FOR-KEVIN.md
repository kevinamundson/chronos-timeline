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
