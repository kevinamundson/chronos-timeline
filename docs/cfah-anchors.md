# CFAH anchor events (verified against the ARJ papers). All 11 are populated as records

Status: all 11 have event records as of 2026-10-17 (ids: creation-week, the-flood, first-territorial-division, final-territorial-division, founding-of-babel, dispersion, abraham-birth, abraham-enters-canaan, joseph-made-vizier, exodus, temple-dedication).
Founding of Babel is "AP-1" (as cited in CFAH-5) and the Dispersion is "Anchor Point #2" (CFAH-6).

All dates below were read directly in the Answers Research Journal (ARJ) papers on 2026-10-17. **Type** says whether the date is a CFAH
*triangulated anchor point* ("AP-n", derived from extra-biblical durations) or comes from CFAH-1 **Table 1**, which is the
Ussher-Jones *biblical* chronology the authors adopt as their baseline (not independently triangulated).

| # | Event | CFAH date | Type | Exact citation |
|---|-------|-----------|------|----------------|
| 1 | Creation of Adam | 4004 B.C. | AP-30 | CFAH-4, section "AP-30: Creation: 4004 B.C." (also CFAH-1 Table 1; CFAH-3 "AP-24: Satya Yuga: 4004 B.C.") |
| 2 | The Flood | 2348–2347 B.C. (2348/2347) | AP-29 | CFAH-4, section "AP-29: The Flood: 2348–2347 B.C."; CFAH-1 Introduction; CFAH-1 Table 1 ("2348 Flood of Noah") |
| 3 | First Territorial Division | 2254/2253 B.C. | AP-27 | CFAH-4, section "AP-27: First Territorial Division: 2254/2253 B.C." |
| 4 | Second/Final Territorial Division (birth of Peleg) | 2247 B.C. | AP-28 | CFAH-4, section "AP-28: Second/Final Territorial Division: 2247 B.C."; CFAH-1 Table 1 ("2247 Territorial Division of the Earth") |
| 5 | Founding of Babel / root of Chaldean astronomy (start of the Era of the Tower) | 2234/2233 BC (era 2233–2191 BC) | durations (Table 2) | CFAH-2, sections "The Root of Chaldean Astronomy: Vernal Equinox, 2233 BC", "Era of the Tower of Babel: 2233–2191 BC", and Table 2. (Note: the paper's "Summary of Durations to Babel" prints "2234/2333 BC", evidently a typo for 2234/2233.) |
| 6 | Dispersion from Babel | 2192/2191 BC | durations (Table 2) | CFAH-2, section "The Dispersion: 2192/2191 BC" and Table 2; CFAH-1 Introduction |
| 7 | Birth of Abraham | 1996 BC | Table 1 | CFAH-1 Table 1; discussed in CFAH-6, Argument 4 §2 "Terah's Famine and Abraham's Birth" (citing Ussher §64) |
| 8 | Abraham enters Canaan and Egypt | 1921 BC | Table 1 | CFAH-1 Table 1; CFAH-6, Argument 4 §3 "Abraham and Khufu: 1921 BC" |
| 9 | Joseph raised to vizier | 1716/1715 BC | new AP-61 | CFAH-6, Argument 4 §7 "Joseph was Promoted in the Year of Isaac's Death 1716/1715 BC" ("new Anchor Point #61"); CFAH-1 Table 1 gives 1715 |
| 10 | Exodus | 1491 BC | Table 1 | CFAH-1 Table 1; CFAH-6 Introduction ("from the Dispersion in 2191 BC until the Exodus in 1491 BC") |
| 11 | Solomon dedicates the Temple | 1012 BC | Table 1 | CFAH-1 Table 1. **Conflict:** Jones Chart No. 1 puts the Temple's *beginning* in 1012 BC (2992 AM). Ussher has the foundation in 1012 BC (§465) and the dedication in 1004 BC (§468) |

## Papers (URLs verified, HTTP 200)

- CFAH-1 Problem, Data, and Methodology. ARJ 15 (2022): 377–390. https://answersresearchjournal.org/ancient-egypt/chronological-framework-ancient-history-1/
- CFAH-2 Founding of the Nations. ARJ 15 (2022): 405–426. https://answersresearchjournal.org/tower-of-babel/chronological-framework-ancient-history-2/
- CFAH-3 Anchor Points of Ancient History. ARJ 16 (2023): 131–154. https://answersresearchjournal.org/ancient-egypt/chronological-framework-ancient-history-3/
- CFAH-4 Dating Creation and the Deluge. ARJ 16 (2023): 475–489. https://answersresearchjournal.org/noahs-flood/chronological-framework-ancient-history-4/
- CFAH-5 The Babylonian Dynasties of Berossus. ARJ 16 (2023): 635–670. https://answersresearchjournal.org/archaeology/chronological-framework-ancient-history-5/
- CFAH-6 The Old and Middle Kingdoms of Egypt. ARJ 18 (2025): 13–60. https://answersresearchjournal.org/chronology/chronological-framework-ancient-history-6/
- OSF project (series overview/preprints): https://osf.io/prhfz
- Published discussion: https://answersresearchjournal.org/chronology/chronological-framework-ancient-history-1-5-comments/ and reply https://answersresearchjournal.org/chronology/cfah-1-5-reply/ (also ".../chronology/cfah-1-5-comments-tweedy/", ".../chronology/chronological-framework-ancient-history-1-5-response/", ".../chronology/further-comments-griffith-white/", ".../ancient-egypt/chronological-framework-ancient-history-comments-1/", "-comments-2/", "-reply/")

CFAH-7 and later were not found on ARJ (URL pattern checks returned 404) as of 2026-10-17.

## Batch 3 additions (2026-10-17): Egyptian and Mesopotamian synchronisms

37 more anchor-point events were added. Each record cites its paper section, and the CFAH-6 ones also cite CFAH-6 Table 1.
- **Egypt:** AP-3, 14, 16, 17, 18, 20, 21, 22, 49 to 60.
- **Mesopotamia:** AP-15, 35/42, 36, 38 to 41, 46, 47, 48.
- **OSF preprints:** AP-82 (CFAH-13), AP-88 to 91 (CFAH-14), AP-92 and 93 (CFAH-15).

See docs/cfah-osf-collation.md for the OSF inventory, the licences, and the anchor points not yet used.

## CFAH complete pass (2026-10-18)

From here on, CFAH dates are curated in `scripts/cfah/` and applied by `node scripts/cfah/import.mjs`. The importer is idempotent, and its entries carry `cfah_key`. Run it after any other importer (Generations, Herodotus), because those can rewrite the CFAH placeholder on records they manage.

- `anchors.mjs`: the published APs added in phase 1.
- `table1.mjs`: the CFAH-1 Table 1 rows.
- `kings.mjs`: ruler reigns.
- `anchors-osf.mjs`: the OSF preprint APs.

The checklist of every AP, Table 1 row and king list is `data/cfah-coverage.md`. The new fields are `cfah_ap` (the AP number), `cfah_preprint` (OSF) and `cfah_basis: "paper_text"` (a CFAH date that is neither an AP nor a Table 1 row; display only).
