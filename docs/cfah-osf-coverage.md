# CFAH OSF preprint coverage: Griffith & White, *A Reply to Beckman*, and Tier 2 · CFAH non-anchor dates

Written 2026-11-13 from `scripts/cfah/beckman-reply.mjs` (imported as phase 6 of `node scripts/cfah/import.mjs`) and the sort diff of this branch. Change the data module and re-run the importer, then `node scripts/standby/compute.mjs`.

## What "Tier 2" was taken to mean

Kevin (2026-11-13): "Make sure all the names Evens and dates from Griffith and Whites OSF Preprint are included in Tier 2."

- **The preprint** is Griffith & White's three-part *A Reply to Beckman's Defense of Thiele's Chronology* (OSF project [5b64m](https://osf.io/5b64m/)), the same three papers now linked to Academia.edu under the CFAH links on /chronologies/:
  - Part 1, Jewish Sources for the Chronology of the Divided Kingdom: https://osf.io/xjzbm/ (doi:10.17605/OSF.IO/XJZBM, v1.4)
  - Part 2, An Objectivist Answer to the Assyrian Synchronisms: https://osf.io/dt6gx/ (doi:10.17605/OSF.IO/DT6GX, v2.10)
  - Part 3, The Founding Dates of Tyre and Carthage: https://osf.io/9v65s/ (doi:10.17605/OSF.IO/9V65S, v1.2)
- **Tier 2 (ruled):** Kevin (2026-11-13, open question P1): "Tier 2 should let the papers non-anchor dates set sort." Tier names: "Tier 1 · CFAH anchor point", "Tier 2 · CFAH non-anchor dates", "Tier 3 · Floyd Nolen Jones" (Kevin typed "Nolan"; the book prints "Nolen"), "Tier 4 · Ussher, Annals of the World". Tier 2 (id `cfah-table1`, kept for history) is now every dated CFAH entry that is not an anchor point, from all 19 CFAH papers (ARJ CFAH-1 to 6, OSF CFAH-7 to 19) and from the Reply to Beckman: `cfah_basis` `table1_baseline`, `paper_text`, or `beckman_reply`. A CFAH anchor point (tier 1) still wins.
- **Order inside tier 2** (`orderCfah` / `tier2Compare` in `scripts/sort-rule.mjs`; validate checks every stored list follows it):
  1. CFAH-1 Table 1 (`table1_baseline`).
  2. Other CFAH paper years (`paper_text`), latest paper in the series first: CFAH-19, 18, … 8, then CFAH-7B, CFAH-7A, then the ARJ papers CFAH-6 … CFAH-1. An OSF copy of an ARJ paper ranks with that paper. Within one paper, the importer's table/text order.
  3. Griffith & White's Reply to Beckman (`beckman_reply`): same authors, outside the numbered series.
  - The first entry in that order with a BC/AD year sets the sort. Dates are only as printed; a reign length is never turned into an end year, and Anno Mundi is never converted.
  - **Conflict rule:** where two CFAH papers print different non-anchor years for the same slot, the later paper in the series governs (the order above); both years stay on the page. Every case is listed below and in open question P7.
- **What counts as the authors' date:** a year they give as their own, as CFAH's, or as Ussher-Jones / Jones (the chronology they defend). Years they attribute only to Thiele, Young, Gertoux, Josephus, Demetrius, the Seder Olam, a single classical chronicler, or conventional scholarship are listed below as not entered.
- **The other reading** ("OSF preprint" = the CFAH OSF preprint series, CFAH-7 to CFAH-19 and the OSF CFAH-1): already covered. See `data/cfah-coverage.md`: all 44 OSF anchor points are recorded (tier 1, open question A1), the OSF CFAH-1 Table 1 is identical to the ARJ Table 1 and all 22 rows are recorded (tier 2), and the 76 OSF king tables are `paper_text`, which now sets the sort at tier 2 (P1, ruled).

## Counts

- Dated items in the three papers checked: **114** (90 entered, 24 groups listed as not entered).
- Entered: **90** tier 2 entries.
  - Year already present on the record as a CFAH tier 1 or tier 2 year (citation added, no sort effect): **10**.
  - Added to existing records: **30**.
  - On new records: **50**.
- New events: **39**. New people: **11** (hazael, ben-hadad-son-of-hazael, shalmaneser-iii, shamshi-adad-v, adad-nirari-iii, tiglath-pileser-iii, shalmaneser-v, humbanigash, bel-ibni, ashur-nadin-shumi, bali-mazer).
- Sort changes against origin/main: **446** records (table below): 74 from the Reply to Beckman (first commit), the rest from tier 2 taking every CFAH non-anchor date.

## Checklist: entered items

| Key | Part | Where | Date as printed | Record | Result |
|---|---|---|---|---|---|
| p1-jerusalem-586 | 1 | section “The Date of the Destruction of Solomon’s Temple”, p. 5 | 586 BC | `events/fall-of-jerusalem-586-bc` | year already present (CFAH tier 1/2); citation added |
| p1-joash-death | 1 | section “Midrashic Literature”, item 1 (252 years), p. 6 | 839 BC | `people/joash-of-judah` (death) | added |
| p1-ark-captured | 1 | section “Midrashic Literature”, item 2 (369 years of the Tabernacle), p. 6 | 1121 BC | `events/battle-of-aphek` | added |
| p1-conquest | 1 | section “Midrashic Literature”, item 3 (850 + 14 years), p. 7 | 1450 BC (CFAH) | `events/conquest-of-canaan` | added |
| p1-ark-jerusalem | 1 | section “Precise Durations that Agree with Ussher’s Divided Kingdom”, item 2, p. 17 | 1048 BC (Ussher-Jones) | `events/ark-brought-to-jerusalem` | added |
| p1-saul-accession | 1 | section “The Prophets: 490 years and 390 years”, p. 18 | 1096 BC | `events/saul-made-king` | added |
| p1-saul-reign | 1 | section “The Prophets: 490 years and 390 years”, p. 18 | 1096 BC (accession) | `people/saul` (reign) | added |
| p1-daniel-606 | 1 | section “The Prophets: 490 years and 390 years”, p. 18 | 606 BC | `events/daniel-taken-to-babylon` | year already present (CFAH tier 1/2); citation added |
| p1-solomon-death | 1 | section “The Prophets: 490 years and 390 years”, p. 19 | 976 BC | `people/solomon` (death) | year already present (CFAH tier 1/2); citation added |
| p1-division | 1 | section “The Prophets: 490 years and 390 years”, p. 19 | 975 BC | `events/division-of-the-kingdom` | added |
| p1-cyrus-decree | 1 | section “Discrepancies in Josephus”, p. 15 | 536 BC | `events/cyrus-decree-of-return` | year already present (CFAH tier 1/2); citation added |
| p1-second-temple | 1 | section “Discrepancies in Josephus”, p. 15 | 516 BC (6th year of Darius) | `events/second-temple-completed` | year already present (CFAH tier 1/2); citation added |
| p3-david-anointed | 3 | section “The Chronology of Josephus”, item c, p. 10 | 1075/1074 BC | `events/death-of-apophis-anointing-of-david` | added |
| p2-hazael-jerusalem | 2 | section “Hazael”, p. 13 | 855 BC | `events/hazael-threatens-jerusalem` | new event |
| p2-qarqar | 2 | section “Hazael”, p. 13; Table 1, p. 36 | 853 BC (Battle of Qarqar, Shalmaneser III year 6) | `events/shalmaneser-iii-invades-syria` | added |
| p2-shalm-sole-rex | 2 | section “The Black Obelisk - Jehu”, p. 10 | 859 BC (sole rex) | `people/shalmaneser-iii` (reign) | new person |
| p3-shalm-accession | 3 | section “Balimanzer”, p. 28 | 860 BC (accession) | `people/shalmaneser-iii` (reign) | new person |
| p2-shalm-hazael-841 | 2 | Table 1 “Claimed Assyrian Synchronisms”, row 841 (Nimrud annals, defeat of Hazael, year 18), p. 37; section “Akkadian Lacks the Pluperfect Tense”, p. 7 | 841 BC | `events/shalmaneser-iii-defeats-hazael` | new event |
| p2-jehu-tribute | 2 | Table 1, row 841 (Black Obelisk, Iaua bit Khumry tribute), p. 37; section “The Black Obelisk - Jehu”, pp. 10–11 | 841 BC (annal year of the claim) | `events/jehu-tribute-claim-black-obelisk` | new event |
| p3-bali-mazer | 3 | Table 2 “Harmonized Chronology of Tyre and Carthage”, row ~841, p. 46; Part 2 Table 1, row 841, p. 37 | ~841 BC | `events/bali-mazer-tribute-to-shalmaneser-iii` | new event |
| p2-hazael-cities-838 | 2 | Table 1, row 838, p. 37 | 838 BC | `events/shalmaneser-iii-advances-against-the-cities-of-hazael` | new event |
| p2-hazael-death | 2 | section “Hazael”, p. 13 | circa 841–838 BC | `people/hazael` (death) | new person |
| p2-benhadad-reign | 2 | section “Hazael”, p. 13 | c. 838 to no later than 807 BC | `people/ben-hadad-son-of-hazael` (reign) | new person |
| p2-black-obelisk | 2 | section “The Black Obelisk - Jehu”, p. 10 | 825 BC | `events/black-obelisk-erected` | new event |
| p2-cilicia-830 | 2 | section “The Tell al-Rimah Stela”, p. 15 | 830 BC | `events/shalmaneser-iii-campaign-against-cilicia` | new event |
| p2-jehoash-death | 2 | section “The Tell al-Rimah Stela”, p. 14 | 825 BC (Jones) | `people/ioas` (death) | added |
| p2-shamshi-adad-death | 2 | section “The Tell al-Rimah Stela”, p. 15 | 811 BC | `people/shamshi-adad-v` (death) | new person |
| p2-adad-nirari-reign | 2 | section “The Tell al-Rimah Stela”, p. 15 | 811 BC (accession) | `people/adad-nirari-iii` (reign) | new person |
| p2-damascus-806 | 2 | section “The Tell al-Rimah Stela”, p. 14; Table 1, rows 806, pp. 37–38 | 806/805 BC | `events/conquest-of-damascus-806-bc` | year already present (CFAH tier 1/2); citation added |
| p2-menahem-reign | 2 | Table 1, row ~738 (CFAH identification), p. 38 | 772–761 BC | `people/menahem` (reign) | added |
| p2-menahem-death | 2 | section “Menahem and Azariah (Uzziah)”, p. 16 | 761/760 BC | `people/menahem` (death) | added |
| p2-uzziah-death | 2 | section “Menahem and Azariah (Uzziah)”, p. 16 | 757 BC | `people/uzziah` (death) | added |
| p2-menahem-pul | 2 | Table 4 “Thiele’s Bad Synchronisms Classified”, row 10, p. 47; Table 1, row ~738, p. 38 | circa 765 BC | `events/menahem-pays-tribute-to-pul` | new event |
| p2-tp3-reign | 2 | section “Menahem”, p. 17 | 745 to 727 BC | `people/tiglath-pileser-iii` (reign) | new person |
| p2-tp3-738 | 2 | section “Menahem”, pp. 17–18; Table 1, row ~738, p. 38 | 738 BC (9th palu) | `events/tiglath-pileser-iii-lists-menahems-tribute` | new event |
| p2-azriyau | 2 | Table 1, row 738, p. 38 | 738 BC | `events/azriyau-rebels-against-tiglath-pileser-iii` | new event |
| p2-shalm-v-reign | 2 | Table 3 “Reconstruction of the Reigns of Sargon II and Sennacherib to 700 BC”, rows 726–722, p. 44 | 726–722 BC (years 1–5) | `people/shalmaneser-v` (reign) | new person |
| p2-hezekiah-reign | 2 | Table 3, row 726, p. 44 | 726 BC (Hezekiah year 1) | `people/hezekiah` (reign) | added |
| p2-samaria-siege | 2 | Table 3, rows 723–722, p. 44 | 723–722 BC | `events/shalmaneser-besieges-samaria` | added |
| p2-sargon-reign | 2 | Table 3, rows 722–705, pp. 44–45; Table 2, row 722/721, p. 39 | accession 722 BC (Tebeth, January 721); killed 705 BC | `people/sargon-ii` (reign) | added |
| p2-mb-722 | 2 | Table 3, row 722, p. 44 | 722 BC (seized the throne of Babylon) | `people/merodach-baladan` (reign) | added |
| p2-mb-721 | 2 | Table 2 “Objective Sources for the Chronology of Sargon and Sennacherib”, row 721, p. 40 | 1 Nisan (April) 721 BC (ascended the throne) | `people/merodach-baladan` (reign) | added |
| p2-samaria-falls | 2 | Table 1, row 723/721, p. 38; section “Dating the Fall of Samaria”, pp. 21–23; Table 3, row 721, p. 44 | 721 BC, early Spring (1st month) | `events/fall-of-samaria` | year already present (CFAH tier 1/2); citation added |
| p2-der-720 | 2 | Table 3, row 720, p. 44; Table 2, row 720, p. 40 | 720 BC | `events/humbanigash-defeats-sargon-at-der` | new event |
| p2-humbanigash-death | 2 | Table 2, row 717, p. 40 | 717 BC | `people/humbanigash` (death) | new person |
| p2-tabal-718 | 2 | Table 3, row 718, p. 44 | 718 BC (Sargon year 4) | `events/sargon-against-tabal` | new event |
| p2-dur-sharrukin-717 | 2 | Table 3, row 717, p. 44; section “Confirmation from the Lachish Reliefs”, p. 26 | 717 BC (Sargon year 5) | `events/dur-sharrukin-founded` | new event |
| p2-mannea-716 | 2 | Table 3, row 716, p. 44 | 716 BC (Sargon year 6) | `events/sargon-against-mannea` | new event |
| p2-governors-715 | 2 | Table 3, row 715, p. 44 | 715 BC (Sargon year 7) | `events/sargon-appoints-governors` | new event |
| p2-urartu-714 | 2 | Table 3, row 714, p. 44 | 714 BC (Sargon year 8) | `events/sargon-against-urartu-and-musasir` | new event |
| p2-ashdod-713 | 2 | Table 1, row 713, p. 39; Table 3, row 713, p. 44 | 713 BC | `events/sargon-besieges-ashdod` | added |
| p2-lachish-713 | 2 | Table 3, row 713, pp. 44–45; section “Confirmation from the Lachish Reliefs”, p. 27 | 713 BC | `events/sennacherib-besieges-lachish` | new event |
| p2-eltekah-713 | 2 | section “The Dilemma of Sennacherib’s Truthfulness”, pp. 29–30; Table 1, row 701, p. 39 | 713 BC | `events/battle-of-eltekah` | new event |
| p2-jerusalem-713 | 2 | Table 3, row 713, p. 44; Table 1, row 701, p. 39; section “Dating the Fall of Samaria”, p. 23 | 713 BC (Hezekiah year 14) | `events/sennacherib-besieges-jerusalem` | added |
| p2-angel-713 | 2 | Table 3, row 713 comment, pp. 44–45; section “Confirmation from Taharqa and the Tangi-Var Inscription”, p. 24 | 713 BC (early Autumn) | `events/angel-slays-the-assyrians` | added |
| p2-mb-embassy-713 | 2 | Table 2, row 713 (Ussher-Jones column), p. 40 | 713 BC | `events/merodach-baladan-embassy` | added |
| p2-ellipi-713 | 2 | Table 3, row 713, pp. 44–45; Table 2, row 713 (Eponym), p. 40 | 713 BC | `events/assyrian-nobles-against-ellipi` | new event |
| p2-shebitku-713 | 2 | Table 2, row 713 comment, p. 40; section “Confirmation from Taharqa and the Tangi-Var Inscription”, p. 25 | 713 BC (took the throne of Egypt; conquest of the Delta) | `people/shebitku` (reign) | added |
| p2-712 | 2 | Table 3, rows 712–711, p. 45; Table 2, row 712, p. 41 | 712 BC (Sargon year 10) | `events/sargon-stays-in-the-land-712` | new event |
| p2-mb-712 | 2 | Table 3, row 712, p. 45; Table 2, row 712, p. 41 | 712 BC (MB-10) | `events/merodach-baladan-attacks-an-assyrian-town` | new event |
| p2-babylon-710 | 2 | Table 3, row 710, p. 45; Table 2, row 710, p. 41 | 710 BC (Sargon year 12) | `events/sargon-conquers-babylon` | new event |
| p2-bit-yakin-709 | 2 | Table 3, row 709, p. 45; Table 2, row 709, p. 41 | 709 BC (Sargon year 13) | `events/sargon-fights-merodach-baladan-in-bit-yakin` | new event |
| p2-kummuhu-708 | 2 | Table 3, row 708, p. 45; Table 2, row 708, p. 41 | 708 BC (Sargon year 14) | `events/kummuhu-captured` | new event |
| p2-temples-707 | 2 | Table 3, row 707, p. 45; Table 2, row 707, p. 41 | 707 BC (Sargon year 15) | `events/dur-sharrukin-temples-dedicated` | new event |
| p2-dur-sharrukin-706 | 2 | Table 3, row 706, p. 45; Table 2, row 706, p. 41; section “Confirmation from the Lachish Reliefs”, p. 26 | 706 BC (Sargon year 16) | `events/dur-sharrukin-completed` | new event |
| p2-sargon-killed | 2 | Table 2, row 705, p. 41; Table 3, row 705, p. 45 | 705 BC | `events/sargon-ii-killed-in-tabal` | new event |
| p2-sargon-death | 2 | Table 2, row 705, p. 41; Table 3, row 705, p. 45 | 705 BC (killed in Tabal) | `people/sargon-ii` (death) | added |
| p2-sennacherib-reign | 2 | Table 2, row 705, p. 41; Table 3, row 705, p. 45 | Abu 12 (August) 705 BC (ascends the throne) | `people/sennacherib` (reign) | added |
| p2-kullamean-704 | 2 | Table 3, row 704, p. 45; Table 2, row 704, pp. 41–42 | 704 BC (Sennacherib year 1) | `events/sennacherib-sends-nobles-against-the-kullamean` | new event |
| p2-babylon-703 | 2 | Table 3, row 703, p. 45; Table 2, row 703, p. 42 | 703 BC (Sennacherib year 2) | `events/sennacherib-installs-bel-ibni` | new event |
| p2-bel-ibni-reign | 2 | Table 2, rows 703–700, p. 42 | installed 703 BC (first year 702; third year 700) | `people/bel-ibni` (reign) | new person |
| p2-hirimma-702 | 2 | Table 3, row 702, p. 45; Table 2, row 702, p. 42 | 702 BC (Sennacherib year 3) | `events/sennacherib-against-hirimma-and-hararatum` | new event |
| p2-palace-702 | 2 | section “Confirmation from the Lachish Reliefs”, pp. 25–26 | 702 BC (Sennacherib’s third year) | `events/sennacherib-palace-without-rival-inscription` | new event |
| p2-halzi-701 | 2 | Table 3, row 701, p. 45; Table 2, row 701, p. 42; section “Reconstructing the Reigns of Sargon and Sennacherib”, p. 21 | 701 BC (Sennacherib year 4) | `events/sennacherib-campaign-to-halzi` | new event |
| p2-and-700 | 2 | Table 3, row 700, pp. 45–46; Table 2, row 700, p. 42 | 700 BC (Sennacherib year 5) | `events/ashur-nadin-shumi-made-king-of-babylon` | new event |
| p2-and-reign | 2 | Table 3, row 700, p. 45; Table 2, row 700, p. 42 | 700 BC | `people/ashur-nadin-shumi` (reign) | new person |
| p2-ahab-death | 2 | section “The Kurkh Monolith - Ahab and Ben Hadad II - 853 BC”, p. 8 | 897 BC (Ussherian chronology) | `people/ahab` (death) | added |
| p3-gideon | 3 | section “The Book of Judges”, p. 17 | 1251 BC (Jones) | `events/gideon-defeats-midian` | year already present (CFAH tier 1/2); citation added |
| p3-tyre | 3 | Table 2 “Harmonized Chronology of Tyre and Carthage”, row 1251–1249, p. 46 | 1251 - 1249 BC | `events/founding-of-tyre` | added |
| p3-panionia | 3 | Table 2, row 1248, p. 46 | 1248 BC | `events/first-panionia` | new event |
| p3-origo-1 | 3 | Table 2, row 1233, p. 46 | 1233 BC | `events/first-colony-to-origo` | new event |
| p3-atreus | 3 | Table 2, row 1221, p. 46 | 1221 BC | `events/atreus-games-with-heracles` | new event |
| p3-troy | 3 | Table 2, row “1248, 1212, 1208, or 1183”, p. 46 | 1248, 1212, 1208, or 1183 BC | `events/fall-of-troy` | added |
| p3-origo-2 | 3 | Table 2, row “1050, 1040”, p. 46 | 1050, 1040 BC | `events/second-colony-to-origo` | new event |
| p3-temple | 3 | Table 2, row 1012/1011, p. 46 | 1012/1011 BC | `events/temple-dedication` | year already present (CFAH tier 1/2); citation added |
| p3-homer | 3 | Table 2, row 914–866, p. 46 | 914 - 866 BC | `events/homer-iliad-odyssey` | added |
| p3-lycurgus | 3 | Table 2, row c. 884, p. 46 | c. 884 BC | `events/lycurgus-competes-in-the-iphitus-games` | new event |
| p3-carthage | 3 | Table 2, row 869/868, p. 46 | 869/868 BC | `events/founding-of-carthage` | added |
| p3-utica | 3 | section “Pliny: 1,178 y”, p. 21 | 1156/1155 BC | `events/founding-of-utica` | new event |
| p3-olympiad | 3 | Table 2, row 776, p. 46 | 776 BC | `events/first-olympic-games` | year already present (CFAH tier 1/2); citation added |

## Names printed without a year

Kept in the event descriptions and notes, not made people: Gurdi the Kullammaean (Sargon's killer), Mari of Damascus, Azriyau, Ashur-Dan III, Ashur-nasirpal, Yamani of Ashdod, Hadad-ezer / Bir-Hadad (read by the authors as Ben-Hadad son of Hazael), the crown prince "Jehoash II", and Dido’s husband the high priest (Part 3). Existing people linked to new events: Jehu, Menahem, Hezekiah, Joash of Judah, Sargon II, Sennacherib, Merodach-Baladan, Heracles, Lycurgus, Ashur-danin-pal.

## Printed but not entered

| Part | Where | Dates | Why |
|---|---|---|---|
| 1 | p. 5 | 587 BC Fall of the Temple; 583 BC death of Seraiah / Nebuzaradan | Dates of the ancient Jewish sources and of Ussher/Young, not the authors’ (they use 586). |
| 1 | p. 7 | 1451 BC Conquest (Seder Olam with 587) | Seder Olam result; the authors’ own CFAH date, 1450, is entered. |
| 1 | pp. 8–9 | 1438, 1406, 1446, 754, 574 BC | Young’s and the Seder Olam’s dates, which the authors reject. |
| 1 | pp. 11–12; Part 2 pp. 23–24 | 582 BC final captivity; 817, 722n BC Samaria; 714, 711 BC Sennacherib (Demetrius) | Demetrius’ durations as the authors reconstruct them; their own dates (721, 713) are entered. |
| 1 | p. 12 | 701 BC Sennacherib (Thiele) | Thiele’s date, rejected. |
| 1 | pp. 14–17 | Josephus: Fall of Samaria Feb–Mar 721; Temple founded 1056, 1015/1014, 1011; 1004 dedication; 513 Second Temple | Josephus’ chronology as reconstructed; 1004 is Ussher’s dedication year. Part 3 Table 2 (1012/1011) is entered instead. |
| 1 | p. 17 | 1094 BC Saul (Josephus) | Josephus’ figure; the Ussher-Jones 1096 is entered. |
| 1 | pp. 8, 19 | 835–796 BC Joash, 931 BC death of Solomon, 541 BC (Thiele) | Thiele’s dates. |
| 2 | pp. 4–6 | 699/698 BC end of the Eponym Chronicle | Background about a source, not an event of the chronology. |
| 2 | p. 9 | 854 / 899 BC (George Smith) | Quoted from Smith 1875. |
| 2 | p. 10 | 865 BC (year 18 of Ashur-nasirpal) for Jehu’s tribute | Given as the most probable occasion, undated (“shortly before”); kept in the note on the 841 tribute-claim event. |
| 2 | p. 13 | 798, 812 BC (Thiele); 796 BC (Assyriologists) | Thiele’s and others’ dates, rejected. |
| 2 | p. 15 | Jehoash II as a crown prince in 806 BC; tribute 830 BC | Offered as possibilities, not dated events. |
| 2 | pp. 17–18 | 742, 752 BC (Thiele); 743–742 BCE Mati‘-El rebellion (quoted from Gertoux) | Thiele’s dates; a date inside a quotation. |
| 2 | p. 21 | 720/719 BC Fall of Samaria (Gertoux) | Gertoux’s date, rejected. |
| 2 | Table 3, pp. 44–46 | 725–723 “Against [?]”; 719 [lacuna]; 711 probable second year without a campaign; 699 “…” | No event named; 711 is folded into the 712 event note. |
| 2 | pp. 24–25 | Taharqa c. 690–664; Thebes 663; Esarhaddon 671; Spalinger’s 712 for Shebitku | Conventional background dates the authors take as known, or a date they correct (713 is entered). |
| 2 | p. 27 | 712 BCE capture of Lachish (quoted from Gertoux) | Inside a quotation; the authors date Lachish to 713. |
| 3 | pp. 4, 15–16 | 146 BC destruction of Carthage; 202, 241, 262 BC | Background dates used to count durations. |
| 3 | pp. 13–27 | Chronicler-derived years: 884 Homer (Herodotus), 883/886/880/846 Carthage, 2784 and 1250.7 Tyre, 1217, 1209, 442, 484 birth of Herodotus, AD 23/24 birth of Pliny, 335 death of Philip | Results of single chroniclers’ durations; the harmonized years of Table 2 are entered. |
| 3 | pp. 22–27; Table 2 | Founding of Rome 818, 816, 815, 814, 753; Fall of Troy 1248 (Timaeus), 1208 (Parian) | Variants used by Cato, Cicero, Timaeus, and Varro, not the authors’ own year. |
| 3 | p. 28 | Balezeros II 890–884 BC | Conditional (“Using the dates of Josephus … would have reigned”). |
| 3 | pp. 29–30 | Nora Stone 890–840 BC | Quoted from Gertoux. |
| 3 | pp. 5–6 | Sidon destroyed by Ascalon “early in the 13th century”; death of Heracles 33–40 years before the Fall of Troy | No year printed. |

## Sort diff against origin/main

Every record whose `sorting_year`, tier, slot, or standby year differs from origin/main. `cfah-table1` is Tier 2 · CFAH non-anchor dates; `none` with [standby …] is a standby placement, not a sort year.

| Record | origin/main | This branch |
|---|---|---|
| `events/angel-slays-the-assyrians` | ussher-jones 709 BC | cfah-table1 713 BC |
| `events/ark-brought-to-jerusalem` | ussher-jones 1047 BC | cfah-table1 1048 BC |
| `events/ashur-nadin-shumi-made-king-of-babylon` | (new record) | cfah-table1 700 BC |
| `events/assyrian-nobles-against-ellipi` | (new record) | cfah-table1 713 BC |
| `events/atreus-games-with-heracles` | (new record) | cfah-table1 1221 BC |
| `events/azriyau-rebels-against-tiglath-pileser-iii` | (new record) | cfah-table1 738 BC |
| `events/bali-mazer-tribute-to-shalmaneser-iii` | (new record) | cfah-table1 841 BC |
| `events/battle-of-aphek` | ussher-jones 1122 BC | cfah-table1 1121 BC |
| `events/battle-of-eltekah` | (new record) | cfah-table1 713 BC |
| `events/black-obelisk-erected` | (new record) | cfah-table1 825 BC |
| `events/conquest-of-canaan` | provisional 1450 BC | cfah-table1 1450 BC |
| `events/division-of-the-kingdom` | ussher-jones 975 BC | cfah-table1 975 BC |
| `events/dur-sharrukin-completed` | (new record) | cfah-table1 706 BC |
| `events/dur-sharrukin-founded` | (new record) | cfah-table1 717 BC |
| `events/dur-sharrukin-temples-dedicated` | (new record) | cfah-table1 707 BC |
| `events/first-colony-to-origo` | (new record) | cfah-table1 1233 BC |
| `events/first-panionia` | (new record) | cfah-table1 1248 BC |
| `events/founding-of-carthage` | provisional 900 BC | cfah-table1 869 BC |
| `events/founding-of-sicyon` | provisional 2089 BC | cfah-table1 2089 BC |
| `events/founding-of-trier` | provisional 2053 BC | cfah-table1 2053 BC |
| `events/founding-of-tyre` | provisional 1250 BC | cfah-table1 1251 BC |
| `events/founding-of-utica` | (new record) | cfah-table1 1156 BC |
| `events/hazael-threatens-jerusalem` | (new record) | cfah-table1 855 BC |
| `events/homer-iliad-odyssey` | provisional 800 BC | cfah-table1 914 BC |
| `events/humbanigash-defeats-sargon-at-der` | (new record) | cfah-table1 720 BC |
| `events/jehu-tribute-claim-black-obelisk` | (new record) | cfah-table1 841 BC |
| `events/kummuhu-captured` | (new record) | cfah-table1 708 BC |
| `events/lycurgus-competes-in-the-iphitus-games` | (new record) | cfah-table1 884 BC |
| `events/menahem-pays-tribute-to-pul` | (new record) | cfah-table1 765 BC |
| `events/merodach-baladan-attacks-an-assyrian-town` | (new record) | cfah-table1 712 BC |
| `events/merodach-baladan-embassy` | ussher-jones 712 BC | cfah-table1 713 BC |
| `events/sargon-against-mannea` | (new record) | cfah-table1 716 BC |
| `events/sargon-against-tabal` | (new record) | cfah-table1 718 BC |
| `events/sargon-against-urartu-and-musasir` | (new record) | cfah-table1 714 BC |
| `events/sargon-appoints-governors` | (new record) | cfah-table1 715 BC |
| `events/sargon-besieges-ashdod` | ussher-jones 713 BC | cfah-table1 713 BC |
| `events/sargon-conquers-babylon` | (new record) | cfah-table1 710 BC |
| `events/sargon-fights-merodach-baladan-in-bit-yakin` | (new record) | cfah-table1 709 BC |
| `events/sargon-ii-killed-in-tabal` | (new record) | cfah-table1 705 BC |
| `events/sargon-stays-in-the-land-712` | (new record) | cfah-table1 712 BC |
| `events/saul-made-king` | ussher-jones 1095 BC | cfah-table1 1096 BC |
| `events/second-colony-to-origo` | (new record) | cfah-table1 1050 BC |
| `events/sennacherib-against-hirimma-and-hararatum` | (new record) | cfah-table1 702 BC |
| `events/sennacherib-besieges-jerusalem` | ussher-jones 713 BC | cfah-table1 713 BC |
| `events/sennacherib-besieges-lachish` | (new record) | cfah-table1 713 BC |
| `events/sennacherib-campaign-to-halzi` | (new record) | cfah-table1 701 BC |
| `events/sennacherib-installs-bel-ibni` | (new record) | cfah-table1 703 BC |
| `events/sennacherib-palace-without-rival-inscription` | (new record) | cfah-table1 702 BC |
| `events/sennacherib-sends-nobles-against-the-kullamean` | (new record) | cfah-table1 704 BC |
| `events/shalmaneser-besieges-samaria` | ussher-jones 723 BC | cfah-table1 723 BC |
| `events/shalmaneser-iii-advances-against-the-cities-of-hazael` | (new record) | cfah-table1 838 BC |
| `events/shalmaneser-iii-campaign-against-cilicia` | (new record) | cfah-table1 830 BC |
| `events/shalmaneser-iii-defeats-hazael` | (new record) | cfah-table1 841 BC |
| `events/shalmaneser-iii-invades-syria` | provisional 853 BC | cfah-table1 853 BC |
| `events/tiglath-pileser-iii-lists-menahems-tribute` | (new record) | cfah-table1 738 BC |
| `people/abdon` | none — [standby 1129 BC] | cfah-table1 (reign start) 1129 BC |
| `people/abimelech-son-of-gideon` | none — [standby 1217 BC] | cfah-table1 (reign start) 1217 BC |
| `people/abirattash` | none — [standby 1224 BC] | cfah-table1 (reign start) 1224 BC |
| `people/achoris` | none — [standby 392 BC] | cfah-table1 (reign start) 392 BC |
| `people/adad-nadin-shumi` | none — [standby 774 BC] | cfah-table1 (reign start) 774 BC |
| `people/adad-nirari-iii` | (new record) | cfah-table1 (reign start) 811 BC |
| `people/adad-shuma-usur-ii` | none — [standby 768 BC] | cfah-table1 (reign start) 768 BC |
| `people/agga` | none — [standby 1999 BC] | cfah-table1 (reign start) 1999 BC |
| `people/agum-ii-kakrime` | none — [standby 840 BC] | cfah-table1 (reign start) 840 BC |
| `people/agum-the-first` | none — [standby 1266 BC] | cfah-table1 (reign start) 1266 BC |
| `people/ahaziah-king-of-israel` | none — [standby 898 BC] | cfah-table1 (reign start) 898 BC |
| `people/ahmose-i` | none — [standby 1081 BC] | cfah-table1 (reign start) 1081 BC |
| `people/aidara` | none — [standby 886 BC] | cfah-table1 (reign start) 886 BC |
| `people/akhenaten` | none — [standby 889 BC] | cfah-table1 (reign start) 889 BC |
| `people/akurgal` | none — [standby 1756 BC] | cfah-table1 (reign start) 1756 BC |
| `people/alexander-the-great` | provisional 356 BC | cfah-table1 (reign start) 331 BC |
| `people/amar-sin` | none — [standby 1285 BC] | cfah-table1 (reign start) 1285 BC |
| `people/amasis-ii` | none — [standby 570 BC] | cfah-table1 (reign start) 570 BC |
| `people/amenemhat-i` | none — [standby 1745 BC] | cfah-table1 (reign start) 1738 BC |
| `people/amenemhat-ii` | none — [standby 1686 BC] | cfah-table1 (reign start) 1686 BC |
| `people/amenemhat-iii` | none — [standby 1586 BC] | cfah-table1 (reign start) 1574 BC |
| `people/amenemhat-iv` | none — [standby 1543 BC] | cfah-table1 (reign start) 1543 BC |
| `people/amenhotep-i` | none — [standby 1056 BC] | cfah-table1 (reign start) 1056 BC |
| `people/amenhotep-ii` | none — [standby 948 BC] | cfah-table1 (reign start) 948 BC |
| `people/amenhotep-iii` | none — [standby 920 BC] | cfah-table1 (reign start) 920 BC |
| `people/ammiditana` | none — [standby 929 BC] | cfah-table1 (reign start) 929 BC |
| `people/ammisaduga` | none — [standby 904 BC] | cfah-table1 (reign start) 904 BC |
| `people/anamim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/ansud` | none — [standby 1785 BC] | cfah-table1 (reign start) 1785 BC |
| `people/apachnan` | none — [standby 1428 BC] | cfah-table1 (reign start) 1428 BC |
| `people/apil-sin` | none — [standby 1080 BC] | cfah-table1 (reign start) 1080 BC |
| `people/apophis-i` | none — [standby 1392 BC] | cfah-table1 (reign start) 1392 BC |
| `people/apophis-iii` | none — [standby 1114 BC] | cfah-table1 (reign start) 1114 BC |
| `people/apries` | none — [standby 589 BC] | cfah-table1 (reign start) 589 BC |
| `people/argandea` | none — [standby 1648 BC] | cfah-table1 (reign start) 1648 BC |
| `people/arwium` | none — [standby 1942 BC] | cfah-table1 (reign start) 1942 BC |
| `people/asharid-apil-ekur` | none — [standby 1075 BC] | cfah-table1 (reign start) 1075 BC |
| `people/ashur-bel-kala` | none — [standby 1073 BC] | cfah-table1 (reign start) 1073 BC |
| `people/ashur-dan-i` | none — [standby 1178 BC] | cfah-table1 (reign start) 1178 BC |
| `people/ashur-danin-pal` | none — [standby 843 BC] | cfah-table1 (reign start) 843 BC |
| `people/ashur-nadin-apli` | none — [standby 1195 BC] | cfah-table1 (reign start) 1195 BC |
| `people/ashur-nadin-shumi` | (new record) | cfah-table1 (reign start) 700 BC |
| `people/ashur-nirari-iii` | none — [standby 1192 BC] | cfah-table1 (reign start) 1192 BC |
| `people/ashur-resh-ishi-i` | none — [standby 1132 BC] | cfah-table1 (reign start) 1132 BC |
| `people/assis` | none — [standby 1281 BC] | cfah-table1 (reign start) 1281 BC |
| `people/atab` | none — [standby 1982 BC] | cfah-table1 (reign start) 1982 BC |
| `people/athothis` | none — [standby 2164 BC] | cfah-table1 (reign start) 2164 BC |
| `people/ay` | none — [standby 851 BC] | cfah-table1 (reign start) 851 BC |
| `people/baba-aha-iddina` | none — [standby 812 BC] | cfah-table1 (reign start) 812 BC |
| `people/babum` | none — [standby 2129 BC] | cfah-table1 (reign start) 2129 BC |
| `people/bali-mazer` | (new record) | none — [standby 841 BC] |
| `people/balih` | none — [standby 1879 BC] | cfah-table1 (reign start) 1879 BC |
| `people/balulu` | none — [standby 1827 BC] | cfah-table1 (reign start) 1827 BC |
| `people/barsal-nuna` | none — [standby 1824 BC] | cfah-table1 (reign start) 1824 BC |
| `people/baufra` | none — [standby 1875 BC] | cfah-table1 (reign start) 1875 BC |
| `people/bebty` | none — [standby 1763 BC] | cfah-table1 (reign start) 1763 BC |
| `people/bel-ibni` | (new record) | cfah-table1 (reign start) 703 BC |
| `people/ben-hadad-son-of-hazael` | (new record) | cfah-table1 (reign start) 838 BC |
| `people/bnon` | none — [standby 1472 BC] | cfah-table1 (reign start) 1472 BC |
| `people/bur-sin` | none — [standby 1135 BC] | cfah-table1 (reign start) 1135 BC |
| `people/burnaburiash-ii` | none — [standby 920 BC] | cfah-table1 (reign start) 920 BC |
| `people/caphtorim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/casluhim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/certos` | none — [standby 1281 BC] | cfah-table1 (reign start) 1281 BC |
| `people/cheops` | none — [standby 1934 BC] | cfah-table1 (reign start) 1934 BC |
| `people/chephren` | none — [standby 1892 BC] | cfah-table1 (reign start) 1892 BC |
| `people/cush` | none — [standby 2233 BC] | cfah-table1 (reign start) 2233 BC |
| `people/dadase` | none — [standby 1698 BC] | cfah-table1 (reign start) 1698 BC |
| `people/dadusha` | none — [standby 1031 BC] | cfah-table1 (reign start) 1031 BC |
| `people/damiq-ilisu` | none — [standby 1055 BC] | cfah-table1 (reign start) 1055 BC |
| `people/damqiili` | none — [standby 1068 BC] | cfah-table1 (reign start) 1068 BC |
| `people/dannum-tahaz` | none — [standby 1051 BC] | cfah-table1 (reign start) 1051 BC |
| `people/djedkare-isesi` | none — [standby 1761 BC] | cfah-table1 (reign start) 1761 BC |
| `people/djoser` | none — [standby 2011 BC] | cfah-table1 (reign start) 2011 BC |
| `people/dudu` | none — [standby 1474 BC] | cfah-table1 (reign start) 1474 BC |
| `people/eaga` | none — [standby 825 BC] | cfah-table1 (reign start) 825 BC |
| `people/eannatum` | none — [standby 1751 BC] | cfah-table1 (reign start) 1751 BC |
| `people/ebishum` | none — [standby 954 BC] | cfah-table1 (reign start) 954 BC |
| `people/ekurul` | none — [standby 858 BC] | cfah-table1 (reign start) 858 BC |
| `people/ellil-nadin-shumi` | none — [standby 777 BC] | cfah-table1 (reign start) 777 BC |
| `people/ellilnadin-ahhe` | none — [standby 709 BC] | cfah-table1 (reign start) 709 BC |
| `people/elon` | none — [standby 1139 BC] | cfah-table1 (reign start) 1139 BC |
| `people/elulu` | none — [standby 1852 BC] | cfah-table1 (reign start) 1852 BC |
| `people/en-anna-tum-i` | none — [standby 1726 BC] | cfah-table1 (reign start) 1726 BC |
| `people/en-dara-ana` | none — [standby 2141 BC] | cfah-table1 (reign start) 2141 BC |
| `people/en-hegal` | none — [standby 1786 BC] | cfah-table1 (reign start) 1786 BC |
| `people/en-sakus-ana` | none — [standby 1828 BC] | cfah-table1 (reign start) 1828 BC |
| `people/enannatum-ii` | none — [standby 1686 BC] | cfah-table1 (reign start) 1686 BC |
| `people/enbi-istar` | none — [standby 1651 BC] | cfah-table1 (reign start) 1651 BC |
| `people/enlil-bani` | none — [standby 1101 BC] | cfah-table1 (reign start) 1101 BC |
| `people/enlil-kudurri-usur` | none — [standby 1186 BC] | cfah-table1 (reign start) 1186 BC |
| `people/enme-nuna` | none — [standby 1868 BC] | cfah-table1 (reign start) 1868 BC |
| `people/enmen-baragesi` | none — [standby 2024 BC] | cfah-table1 (reign start) 2024 BC |
| `people/enna-dagan` | none — [standby 1664 BC] | cfah-table1 (reign start) 1664 BC |
| `people/ennun-dara-ana` | none — [standby 1914 BC] | cfah-table1 (reign start) 1914 BC |
| `people/entemena` | none — [standby 1711 BC] | cfah-table1 (reign start) 1711 BC |
| `people/eriba-adad-ii` | none — [standby 1055 BC] | cfah-table1 (reign start) 1055 BC |
| `people/eriba-marduk` | none — [standby 769 BC] | cfah-table1 (reign start) 769 BC |
| `people/etana` | none — [standby 1920 BC] | cfah-table1 (reign start) 1920 BC |
| `people/ghandash` | none — [standby 1282 BC] | cfah-table1 (reign start) 1282 BC |
| `people/gulki` | none — [standby 991 BC] | cfah-table1 (reign start) 991 BC |
| `people/hammurabi` | none — [standby 1044 BC] | cfah-table1 (reign start) 1032 BC |
| `people/hammurabi-i-of-yamhad` | none — [standby 1004 BC] | cfah-table1 (reign start) 1004 BC |
| `people/hatanis` | none — [standby 1633 BC] | cfah-table1 (reign start) 1633 BC |
| `people/hatshepsut` | none — [standby 1002 BC] | cfah-table1 (reign start) 1002 BC |
| `people/havilah-son-of-cush` | none — | none — [standby 2233 BC] |
| `people/hazael` | (new record) | none — [standby 841 BC] |
| `people/heracles` | none — | none — [standby 1221 BC] |
| `people/hidar` | none — [standby 1653 BC] | cfah-table1 (reign start) 1653 BC |
| `people/hor-khaba` | none — [standby 1976 BC] | cfah-table1 (reign start) 1976 BC |
| `people/horemheb` | none — [standby 841 BC] | cfah-table1 (reign start) 841 BC |
| `people/hotepsekhemwy` | none — [standby 1924 BC] | cfah-table1 (reign start) 1924 BC |
| `people/hudjefa-i` | none — [standby 1781 BC] | cfah-table1 (reign start) 1781 BC |
| `people/humbanigash` | (new record) | none — [standby 717 BC] |
| `people/huni` | none — [standby 1970 BC] | cfah-table1 (reign start) 1970 BC |
| `people/ibal-pi-el-ii` | none — [standby 1021 BC] | cfah-table1 (reign start) 1021 BC |
| `people/ibbi-sin` | none — [standby 1265 BC] | cfah-table1 (reign start) 1265 BC |
| `people/iblul-il` | none — [standby 1707 BC] | cfah-table1 (reign start) 1707 BC |
| `people/ibzan` | none — [standby 1146 BC] | cfah-table1 (reign start) 1146 BC |
| `people/iddin-dagan` | none — [standby 1215 BC] | cfah-table1 (reign start) 1215 BC |
| `people/ikun-ishar` | none — [standby 1661 BC] | cfah-table1 (reign start) 1661 BC |
| `people/ikun-mari` | none — [standby 1726 BC] | cfah-table1 (reign start) 1726 BC |
| `people/ikun-shamagan` | none — [standby 1804 BC] | cfah-table1 (reign start) 1804 BC |
| `people/ikun-shamash` | none — [standby 1824 BC] | cfah-table1 (reign start) 1824 BC |
| `people/ilima` | none — [standby 1184 BC] | cfah-table1 (reign start) 1184 BC |
| `people/ilkuu` | none — [standby 1781 BC] | cfah-table1 (reign start) 1781 BC |
| `people/ilta-sadum` | none — [standby 1756 BC] | cfah-table1 (reign start) 1756 BC |
| `people/intef-i` | none — [standby 1861 BC] | cfah-table1 (reign start) 1861 BC |
| `people/intef-ii` | none — [standby 1841 BC] | cfah-table1 (reign start) 1841 BC |
| `people/intef-iii` | none — [standby 1816 BC] | cfah-table1 (reign start) 1823 BC |
| `people/intef-the-elder` | none — [standby 1917 BC] | cfah-table1 (reign start) 1917 BC |
| `people/ipiq-adad-ii` | none — [standby 1104 BC] | cfah-table1 (reign start) 1104 BC |
| `people/irra-imitti` | none — [standby 1109 BC] | cfah-table1 (reign start) 1109 BC |
| `people/isbi-irra` | none — [standby 1258 BC] | cfah-table1 (reign start) 1258 BC |
| `people/ish-bosheth` | none — [standby 1056 BC] | cfah-table1 (reign start) 1056 BC |
| `people/ishar-lim` | none — [standby 1019 BC] | cfah-table1 (reign start) 1019 BC |
| `people/ishki` | none — [standby 1032 BC] | cfah-table1 (reign start) 1032 BC |
| `people/ishqi-mari` | none — [standby 1633 BC] | cfah-table1 (reign start) 1633 BC |
| `people/ishtup-isar` | none — [standby 1746 BC] | cfah-table1 (reign start) 1746 BC |
| `people/isme-dagan` | none — [standby 1194 BC] | cfah-table1 (reign start) 1194 BC |
| `people/isme-samas` | none — [standby 1617 BC] | cfah-table1 (reign start) 1617 BC |
| `people/istar-muti` | none — [standby 1618 BC] | cfah-table1 (reign start) 1618 BC |
| `people/isu-il` | none — [standby 1623 BC] | cfah-table1 (reign start) 1623 BC |
| `people/iter-pisa` | none — [standby 1074 BC] | cfah-table1 (reign start) 1074 BC |
| `people/ittili` | none — [standby 1124 BC] | cfah-table1 (reign start) 1124 BC |
| `people/jair` | none — [standby 1192 BC] | cfah-table1 (reign start) 1192 BC |
| `people/jehu` | none — [standby 885 BC] | cfah-table1 (reign start) 885 BC |
| `people/jephthah` | none — [standby 1152 BC] | cfah-table1 (reign start) 1152 BC |
| `people/jeroboam-i` | none — [standby 975 BC] | cfah-table1 (reign start) 975 BC |
| `people/joash-of-judah` | none — [standby 889 BC] | none — [standby 839 BC] |
| `people/kadashman-enlil-i` | none — [standby 940 BC] | cfah-table1 (reign start) 940 BC |
| `people/kadashman-harbe` | none — [standby 775 BC] | cfah-table1 (reign start) 775 BC |
| `people/kadashman-harbe-i` | none — [standby 1000 BC] | cfah-table1 (reign start) 1000 BC |
| `people/kadashman-harbe-ii` | none — [standby 902 BC] | cfah-table1 (reign start) 902 BC |
| `people/kalbum` | none — [standby 1671 BC] | cfah-table1 (reign start) 1671 BC |
| `people/kalibum` | none — [standby 2097 BC] | cfah-table1 (reign start) 2097 BC |
| `people/kalumum` | none — [standby 2072 BC] | cfah-table1 (reign start) 2072 BC |
| `people/kandalanu` | none — [standby 627 BC] | cfah-table1 (reign start) 627 BC |
| `people/karaindash` | none — [standby 980 BC] | cfah-table1 (reign start) 980 BC |
| `people/kashta` | none — [standby 798 BC] | cfah-table1 (reign start) 798 BC |
| `people/kashtiliash-i` | none — [standby 1232 BC] | cfah-table1 (reign start) 1254 BC |
| `people/kashtiliash-ii` | none — [standby 866 BC] | cfah-table1 (reign start) 866 BC |
| `people/kashtiliash-iii` | none — [standby 785 BC] | cfah-table1 (reign start) 785 BC |
| `people/kawab` | none — [standby 1923 BC] | cfah-table1 (reign start) 1923 BC |
| `people/kenkenes` | none — [standby 2068 BC] | cfah-table1 (reign start) 2068 BC |
| `people/khamudi` | none — [standby 1074 BC] | cfah-table1 (reign start) 1074 BC |
| `people/khyan` | none — [standby 1331 BC] | cfah-table1 (reign start) 1331 BC |
| `people/ku-baba` | none — [standby 1633 BC] | cfah-table1 (reign start) 1633 BC |
| `people/kuda` | none — [standby 1464 BC] | cfah-table1 (reign start) 1464 BC |
| `people/kudur-enlil` | none — [standby 804 BC] | cfah-table1 (reign start) 804 BC |
| `people/kullassina-bel` | none — [standby 2200 BC] | cfah-table1 (reign start) 2200 BC |
| `people/kurigalzu-a` | none — [standby 1150 BC] | cfah-table1 (reign start) 1150 BC |
| `people/kurigalzu-i` | none — [standby 960 BC] | cfah-table1 (reign start) 960 BC |
| `people/kurigalzu-ii` | none — [standby 894 BC] | cfah-table1 (reign start) 894 BC |
| `people/la-baser` | none — [standby 1923 BC] | cfah-table1 (reign start) 1923 BC |
| `people/lehabim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/lipit-enlil` | none — [standby 1114 BC] | cfah-table1 (reign start) 1114 BC |
| `people/lipit-istar` | none — [standby 1174 BC] | cfah-table1 (reign start) 1174 BC |
| `people/ludim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/lugal-ane-mundu` | none — [standby 1723 BC] | cfah-table1 (reign start) 1723 BC |
| `people/lugal-banda` | none — [standby 2068 BC] | cfah-table1 (reign start) 2068 BC |
| `people/lugal-ki-gin` | none — [standby 1864 BC] | cfah-table1 (reign start) 1864 BC |
| `people/lugal-ure` | none — [standby 1768 BC] | cfah-table1 (reign start) 1768 BC |
| `people/lugalgu` | none — [standby 1643 BC] | cfah-table1 (reign start) 1643 BC |
| `people/lugalzagesi` | none — [standby 1641 BC] | cfah-table1 (reign start) 1641 BC |
| `people/lycurgus` | none — | none — [standby 884 BC] |
| `people/mamagal` | none — [standby 1696 BC] | cfah-table1 (reign start) 1696 BC |
| `people/manishtushu` | none — [standby 1554 BC] | cfah-table1 (reign start) 1554 BC |
| `people/marduk-apla-iddina-kassite` | none — [standby 723 BC] | cfah-table1 (reign start) 723 BC |
| `people/marduk-balassu-iqbi` | none — [standby 823 BC] | cfah-table1 (reign start) 823 BC |
| `people/marduk-zakir-sumi-i` | none — [standby 855 BC] | cfah-table1 (reign start) 855 BC |
| `people/masda` | none — [standby 1965 BC] | cfah-table1 (reign start) 1965 BC |
| `people/mel-shipak-i` | none — [standby 1185 BC] | cfah-table1 (reign start) 1185 BC |
| `people/melamma` | none — [standby 832 BC] | cfah-table1 (reign start) 832 BC |
| `people/melem-ana` | none — [standby 1870 BC] | cfah-table1 (reign start) 1870 BC |
| `people/melem-kis` | none — [standby 1849 BC] | cfah-table1 (reign start) 1849 BC |
| `people/melishipak-ii` | none — [standby 738 BC] | cfah-table1 (reign start) 738 BC |
| `people/men-nuna` | none — [standby 1656 BC] | cfah-table1 (reign start) 1656 BC |
| `people/menahem` | ussher-jones (reign start) 772 BC | cfah-table1 (reign start) 772 BC |
| `people/menkauhor` | none — [standby 1752 BC] | cfah-table1 (reign start) 1752 BC |
| `people/mentuhotep-i` | none — [standby 1887 BC] | cfah-table1 (reign start) 1887 BC |
| `people/mentuhotep-ii` | none — [standby 1801 BC] | cfah-table1 (reign start) 1801 BC |
| `people/mentuhotep-iii` | none — [standby 1757 BC] | cfah-table1 (reign start) 1757 BC |
| `people/mentuhotep-iv` | none — [standby 1745 BC] | cfah-table1 (reign start) 1745 BC |
| `people/merenre-i` | none — [standby 1586 BC] | cfah-table1 (reign start) 1606 BC |
| `people/merenre-ii` | none — [standby 1491 BC] | cfah-table1 (reign start) 1495 BC |
| `people/merodach-baladan` | none — [standby 712 BC] | cfah-table1 (reign start) 722 BC |
| `people/meryabra-khety` | none — [standby 1859 BC] | cfah-table1 (reign start) 1859 BC |
| `people/merykare` | none — [standby 1796 BC] | cfah-table1 (reign start) 1796 BC |
| `people/mes-ane-pada` | none — [standby 1968 BC] | cfah-table1 (reign start) 1968 BC |
| `people/mes-kiag-nanna` | none — [standby 1658 BC] | cfah-table1 (reign start) 1658 BC |
| `people/mes-kiag-nuna` | none — [standby 1888 BC] | cfah-table1 (reign start) 1888 BC |
| `people/meshe` | none — [standby 1906 BC] | cfah-table1 (reign start) 1906 BC |
| `people/miebidos` | none — [standby 2006 BC] | cfah-table1 (reign start) 2006 BC |
| `people/mizraim` | provisional 2478 BC | cfah-table1 (reign start) 2191 BC |
| `people/mycerinus` | none — [standby 1790 BC] | cfah-table1 (reign start) 1851 BC |
| `people/nabopolassar` | none — [standby 626 BC] | cfah-table1 (reign start) 626 BC |
| `people/nabu-mukin-zeri` | none — [standby 731 BC] | cfah-table1 (reign start) 731 BC |
| `people/nabu-nadin-zeri` | none — [standby 734 BC] | cfah-table1 (reign start) 734 BC |
| `people/nabu-nasir` | none — [standby 747 BC] | cfah-table1 (reign start) 747 BC |
| `people/nabu-suma-iskun` | none — [standby 761 BC] | cfah-table1 (reign start) 761 BC |
| `people/nabu-suma-ukin-ii` | none — [standby 732 BC] | cfah-table1 (reign start) 732 BC |
| `people/nadab-king-of-israel` | none — [standby 953 BC] | cfah-table1 (reign start) 953 BC |
| `people/nan-gis-lisma` | none — [standby 2175 BC] | cfah-table1 (reign start) 2175 BC |
| `people/nanne` | none — [standby 1719 BC] | cfah-table1 (reign start) 1719 BC |
| `people/nanniya` | none — [standby 1617 BC] | cfah-table1 (reign start) 1617 BC |
| `people/naphtuhim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/naram-sin-of-akkad` | none — [standby 1539 BC] | cfah-table1 (reign start) 1539 BC |
| `people/naram-sin-of-eshnunna` | none — [standby 1060 BC] | cfah-table1 (reign start) 1060 BC |
| `people/nazi-maruttash` | none — [standby 890 BC] | cfah-table1 (reign start) 890 BC |
| `people/nebka` | none — [standby 2001 BC] | cfah-table1 (reign start) 2030 BC |
| `people/nebkaura-khety` | none — [standby 1881 BC] | cfah-table1 (reign start) 1881 BC |
| `people/nebra` | none — [standby 1916 BC] | cfah-table1 (reign start) 1916 BC |
| `people/necho-ii` | none — [standby 611 BC] | cfah-table1 (reign start) 611 BC |
| `people/neferefre` | none — [standby 1781 BC] | cfah-table1 (reign start) 1781 BC |
| `people/neferhotep-i` | none — [standby 1576 BC] | cfah-table1 (reign start) 1576 BC |
| `people/neferirkare-kakai` | none — [standby 1806 BC] | cfah-table1 (reign start) 1806 BC |
| `people/neferkasokar` | none — [standby 1781 BC] | cfah-table1 (reign start) 1781 BC |
| `people/nefertiti` | none — [standby 871 BC] | cfah-table1 (reign start) 871 BC |
| `people/nepherites-i` | none — [standby 399 BC] | cfah-table1 (reign start) 399 BC |
| `people/nepherites-ii` | none — [standby 379 BC] | cfah-table1 (reign start) 379 BC |
| `people/nimrod` | provisional 2270 BC | cfah-table1 (reign start) 2192 BC |
| `people/ninurta-apil-ekur` | none — [standby 1181 BC] | cfah-table1 (reign start) 1181 BC |
| `people/ninurta-tukulti-assur` | none — [standby 1133 BC] | cfah-table1 (reign start) 1133 BC |
| `people/ninyas` | none — [standby 2006 BC] | cfah-table1 (reign start) 2006 BC |
| `people/nitocris` | none — [standby 1497 BC] | cfah-table1 (reign start) 1491 BC |
| `people/niuserre-ini` | none — [standby 1781 BC] | cfah-table1 (reign start) 1781 BC |
| `people/nizi` | none — [standby 1667 BC] | cfah-table1 (reign start) 1667 BC |
| `people/nynetjer` | none — [standby 1885 BC] | cfah-table1 (reign start) 1885 BC |
| `people/osorkon-i` | none — [standby 793 BC] | cfah-table1 (reign start) 793 BC |
| `people/osorkon-ii` | none — [standby 737 BC] | cfah-table1 (reign start) 737 BC |
| `people/osorkon-iii` | none — [standby 662 BC] | cfah-table1 (reign start) 662 BC |
| `people/osorkon-iv` | none — [standby 602 BC] | cfah-table1 (reign start) 602 BC |
| `people/pami` | none — [standby 650 BC] | cfah-table1 (reign start) 650 BC |
| `people/pathrusim` | none — [standby 2478 BC] | none — [standby 2191 BC] |
| `people/pedubast-i` | none — [standby 694 BC] | cfah-table1 (reign start) 694 BC |
| `people/pepi-i` | none — [standby 1637 BC] | cfah-table1 (reign start) 1646 BC |
| `people/pepi-ii` | none — [standby 1592 BC] | cfah-table1 (reign start) 1592 BC |
| `people/pepi-the-child` | none — [standby 1485 BC] | cfah-table1 (reign start) 1485 BC |
| `people/peshgal` | none — [standby 936 BC] | cfah-table1 (reign start) 936 BC |
| `people/phygmalion` | none — [standby 900 BC] | none — [standby 869 BC] |
| `people/piye` | none — [standby 778 BC] | cfah-table1 (reign start) 778 BC |
| `people/psammenitus` | none — [standby 526 BC] | cfah-table1 (reign start) 526 BC |
| `people/psammetichus-i` | none — [standby 663 BC] | cfah-table1 (reign start) 663 BC |
| `people/psammis` | none — [standby 594 BC] | cfah-table1 (reign start) 594 BC |
| `people/psammuthis` | none — [standby 392 BC] | cfah-table1 (reign start) 392 BC |
| `people/puannum` | none — [standby 2121 BC] | cfah-table1 (reign start) 2121 BC |
| `people/puzur-ili` | none — [standby 1458 BC] | cfah-table1 (reign start) 1458 BC |
| `people/puzur-nirah` | none — [standby 1643 BC] | cfah-table1 (reign start) 1643 BC |
| `people/puzur-sin` | none — [standby 1630 BC] | cfah-table1 (reign start) 1630 BC |
| `people/raamah` | none — | none — [standby 2233 BC] |
| `people/radjedef` | none — [standby 1917 BC] | cfah-table1 (reign start) 1917 BC |
| `people/rameses-i` | none — [standby 671 BC] | cfah-table1 (reign start) 671 BC |
| `people/rameses-ii` | none — [standby 644 BC] | cfah-table1 (reign start) 644 BC |
| `people/rameses-iii` | none — [standby 379 BC] | cfah-table1 (reign start) 379 BC |
| `people/rameses-ix` | none — [standby 463 BC] | cfah-table1 (reign start) 463 BC |
| `people/rameses-vi` | none — [standby 360 BC] | cfah-table1 (reign start) 360 BC |
| `people/rameses-viii` | none — [standby 343 BC] | cfah-table1 (reign start) 343 BC |
| `people/rameses-x` | none — [standby 444 BC] | cfah-table1 (reign start) 444 BC |
| `people/rameses-xi` | none — [standby 441 BC] | cfah-table1 (reign start) 441 BC |
| `people/rimush` | none — [standby 1563 BC] | cfah-table1 (reign start) 1563 BC |
| `people/sabacos` | none — [standby 705 BC] | cfah-table1 (reign start) 705 BC |
| `people/sabtah` | none — | none — [standby 2233 BC] |
| `people/sabtechah` | none — | none — [standby 2233 BC] |
| `people/sabu` | none — [standby 1094 BC] | cfah-table1 (reign start) 1094 BC |
| `people/sahure` | none — [standby 1814 BC] | cfah-table1 (reign start) 1814 BC |
| `people/salitis` | none — [standby 1491 BC] | cfah-table1 (reign start) 1491 BC |
| `people/samsu-iluna` | none — [standby 989 BC] | cfah-table1 (reign start) 989 BC |
| `people/samsuditana` | none — [standby 882 BC] | cfah-table1 (reign start) 882 BC |
| `people/samug` | none — [standby 1791 BC] | cfah-table1 (reign start) 1791 BC |
| `people/sar-kalli-shari` | none — [standby 1502 BC] | cfah-table1 (reign start) 1502 BC |
| `people/sargon-i-of-akkad` | none — [standby 1642 BC] | cfah-table1 (reign start) 1619 BC |
| `people/sargon-ii` | none — [standby 705 BC] | cfah-table1 (reign start) 721 BC |
| `people/saul` | none — [standby 1095 BC] | cfah-table1 (reign start) 1096 BC |
| `people/saumu` | none — [standby 1765 BC] | cfah-table1 (reign start) 1765 BC |
| `people/seba` | none — | none — [standby 2233 BC] |
| `people/sekkemkhet` | none — [standby 1982 BC] | cfah-table1 (reign start) 1982 BC |
| `people/semempses` | none — [standby 1969 BC] | cfah-table1 (reign start) 1969 BC |
| `people/semiramis-i` | none — [standby 2036 BC] | cfah-table1 (reign start) 2036 BC |
| `people/senedj` | none — [standby 1822 BC] | cfah-table1 (reign start) 1822 BC |
| `people/sennacherib` | none — [standby 713 BC] | cfah-table1 (reign start) 705 BC |
| `people/senusret-i` | none — [standby 1729 BC] | cfah-table1 (reign start) 1686 BC |
| `people/senusret-ii` | none — [standby 1655 BC] | cfah-table1 (reign start) 1655 BC |
| `people/senusret-iii` | none — [standby 1613 BC] | cfah-table1 (reign start) 1606 BC |
| `people/seti-ii` | none — [standby 475 BC] | cfah-table1 (reign start) 475 BC |
| `people/setnakht` | none — [standby 411 BC] | cfah-table1 (reign start) 411 BC |
| `people/shagarak-ti` | none — [standby 798 BC] | cfah-table1 (reign start) 798 BC |
| `people/shalmaneser-i` | none — [standby 1261 BC] | cfah-table1 (reign start) 1262 BC |
| `people/shalmaneser-iii` | (new record) | cfah-table1 (reign start) 859 BC |
| `people/shalmaneser-v` | (new record) | cfah-table1 (reign start) 726 BC |
| `people/shamshi-adad-iv` | none — [standby 1053 BC] | cfah-table1 (reign start) 1076 BC |
| `people/shamshi-adad-v` | (new record) | none — [standby 811 BC] |
| `people/shebitku` | none — [standby 713 BC] | cfah-table1 (reign start) 713 BC |
| `people/shepseskaf` | none — [standby 1825 BC] | cfah-table1 (reign start) 1825 BC |
| `people/shepseskara` | none — [standby 1788 BC] | cfah-table1 (reign start) 1788 BC |
| `people/shoshenq-i` | none — [standby 814 BC] | cfah-table1 (reign start) 814 BC |
| `people/shoshenq-ii` | none — [standby 758 BC] | cfah-table1 (reign start) 758 BC |
| `people/shoshenq-iii` | none — [standby 702 BC] | cfah-table1 (reign start) 702 BC |
| `people/shoshenq-iv` | none — [standby 663 BC] | cfah-table1 (reign start) 663 BC |
| `people/shoshenq-v` | none — [standby 640 BC] | cfah-table1 (reign start) 640 BC |
| `people/shoshenq-vi` | none — [standby 669 BC] | cfah-table1 (reign start) 669 BC |
| `people/shu-sin-of-akshak` | none — [standby 1599 BC] | cfah-table1 (reign start) 1599 BC |
| `people/shu-sin-of-ur` | none — [standby 1274 BC] | cfah-table1 (reign start) 1274 BC |
| `people/shushshi` | none — [standby 1017 BC] | cfah-table1 (reign start) 1017 BC |
| `people/shuzigash` | none — [standby 896 BC] | cfah-table1 (reign start) 896 BC |
| `people/simudara` | none — [standby 1619 BC] | cfah-table1 (reign start) 1619 BC |
| `people/sin-magir` | none — [standby 1066 BC] | cfah-table1 (reign start) 1066 BC |
| `people/sinmuballit` | none — [standby 1062 BC] | cfah-table1 (reign start) 1062 BC |
| `people/sneferu` | none — [standby 1952 BC] | cfah-table1 (reign start) 1952 BC |
| `people/sobekneferu` | none — [standby 1525 BC] | cfah-table1 (reign start) 1530 BC |
| `people/su-durul` | none — [standby 1453 BC] | cfah-table1 (reign start) 1453 BC |
| `people/su-ilisu` | none — [standby 1235 BC] | cfah-table1 (reign start) 1235 BC |
| `people/su-suda` | none — [standby 1722 BC] | cfah-table1 (reign start) 1722 BC |
| `people/sulgi` | none — [standby 1331 BC] | cfah-table1 (reign start) 1331 BC |
| `people/sumu-abum` | none — [standby 1144 BC] | cfah-table1 (reign start) 1144 BC |
| `people/sumu-yamam` | none — [standby 1037 BC] | cfah-table1 (reign start) 1037 BC |
| `people/sumulail` | none — [standby 1129 BC] | cfah-table1 (reign start) 1129 BC |
| `people/taharqa` | none — [standby 691 BC] | cfah-table1 (reign start) 691 BC |
| `people/takelot-i` | none — [standby 750 BC] | cfah-table1 (reign start) 750 BC |
| `people/takelot-iii` | none — [standby 653 BC] | cfah-table1 (reign start) 653 BC |
| `people/tantamani` | none — [standby 664 BC] | cfah-table1 (reign start) 664 BC |
| `people/tausret` | none — [standby 484 BC] | cfah-table1 (reign start) 484 BC |
| `people/tefnakht` | none — [standby 757 BC] | cfah-table1 (reign start) 757 BC |
| `people/teos` | none — [standby 361 BC] | cfah-table1 (reign start) 361 BC |
| `people/teti` | none — [standby 1682 BC] | cfah-table1 (reign start) 1682 BC |
| `people/thampthis` | none — [standby 1825 BC] | cfah-table1 (reign start) 1825 BC |
| `people/thutmose-i` | none — [standby 1035 BC] | cfah-table1 (reign start) 1035 BC |
| `people/thutmose-ii` | none — [standby 1015 BC] | cfah-table1 (reign start) 1015 BC |
| `people/thutmose-iii` | none — [standby 980 BC] | cfah-table1 (reign start) 980 BC |
| `people/thutmose-iv` | none — [standby 929 BC] | cfah-table1 (reign start) 929 BC |
| `people/tiglath-pileser-i` | none — [standby 1114 BC] | cfah-table1 (reign start) 1114 BC |
| `people/tiglath-pileser-iii` | (new record) | cfah-table1 (reign start) 745 BC |
| `people/tizkar` | none — [standby 1787 BC] | cfah-table1 (reign start) 1787 BC |
| `people/tola` | none — [standby 1215 BC] | cfah-table1 (reign start) 1215 BC |
| `people/tug` | none — [standby 1666 BC] | cfah-table1 (reign start) 1666 BC |
| `people/tukulti-ninurta-i` | none — [standby 1232 BC] | cfah-table1 (reign start) 1232 BC |
| `people/tutankhamun` | none — [standby 860 BC] | cfah-table1 (reign start) 860 BC |
| `people/ubienthes` | none — [standby 1950 BC] | cfah-table1 (reign start) 1950 BC |
| `people/udul-kalama` | none — [standby 1938 BC] | cfah-table1 (reign start) 1938 BC |
| `people/uenephes` | none — [standby 2036 BC] | cfah-table1 (reign start) 2036 BC |
| `people/unas` | none — [standby 1715 BC] | cfah-table1 (reign start) 1732 BC |
| `people/undalulu` | none — [standby 1655 BC] | cfah-table1 (reign start) 1655 BC |
| `people/unzi` | none — [standby 1685 BC] | cfah-table1 (reign start) 1685 BC |
| `people/ur-gigir` | none — [standby 1470 BC] | cfah-table1 (reign start) 1470 BC |
| `people/ur-nammu` | none — [standby 1349 BC] | cfah-table1 (reign start) 1349 BC |
| `people/ur-nanshe` | none — [standby 1776 BC] | cfah-table1 (reign start) 1776 BC |
| `people/ur-nigin` | none — [standby 1477 BC] | cfah-table1 (reign start) 1477 BC |
| `people/ur-ninurta` | none — [standby 1163 BC] | cfah-table1 (reign start) 1163 BC |
| `people/ur-nungal` | none — [standby 1968 BC] | cfah-table1 (reign start) 1968 BC |
| `people/ur-utu` | none — [standby 1453 BC] | cfah-table1 (reign start) 1453 BC |
| `people/ur-zababa` | none — [standby 1629 BC] | cfah-table1 (reign start) 1629 BC |
| `people/urdukuga` | none — [standby 1070 BC] | cfah-table1 (reign start) 1070 BC |
| `people/urukagina` | none — [standby 1646 BC] | cfah-table1 (reign start) 1646 BC |
| `people/urur` | none — [standby 1649 BC] | cfah-table1 (reign start) 1649 BC |
| `people/userkaf` | none — [standby 1822 BC] | cfah-table1 (reign start) 1822 BC |
| `people/userkare` | none — [standby 1637 BC] | cfah-table1 (reign start) 1637 BC |
| `people/ushshi` | none — [standby 1232 BC] | cfah-table1 (reign start) 1232 BC |
| `people/usi-watar` | none — [standby 1618 BC] | cfah-table1 (reign start) 1618 BC |
| `people/usiphaidos` | none — [standby 2014 BC] | cfah-table1 (reign start) 2014 BC |
| `people/utu-hegal` | none — [standby 1356 BC] | cfah-table1 (reign start) 1356 BC |
| `people/wahkare-khety` | none — [standby 1838 BC] | cfah-table1 (reign start) 1838 BC |
| `people/weneg` | none — [standby 1846 BC] | cfah-table1 (reign start) 1846 BC |
| `people/yaggid-lim` | none — [standby 1077 BC] | cfah-table1 (reign start) 1067 BC |
| `people/yahdun-lim` | none — [standby 1067 BC] | cfah-table1 (reign start) 1057 BC |
| `people/yarim-lim-i` | none — [standby 1045 BC] | cfah-table1 (reign start) 1045 BC |
| `people/yasmah-addu` | none — [standby 1036 BC] | cfah-table1 (reign start) 1053 BC |
| `people/zababa-shumiddin` | none — [standby 710 BC] | cfah-table1 (reign start) 710 BC |
| `people/zambija` | none — [standby 1077 BC] | cfah-table1 (reign start) 1077 BC |
| `people/zet` | none — [standby 644 BC] | cfah-table1 (reign start) 644 BC |
| `people/zimri-lim` | none — [standby 1019 BC] | cfah-table1 (reign start) 1020 BC |
| `people/zuqaqip` | none — [standby 2049 BC] | cfah-table1 (reign start) 2049 BC |

## Conflicts flagged (docs/OPEN-QUESTIONS-FOR-KEVIN.md, section P)

- Ark captured at Aphek: Part 1 prints 1121 ("when Jones has the Philistine capture"); the Jones Appendix F entry on the record reads 1122. The sort moves to 1121.
- Ark brought to Jerusalem: 1048 (Ussher-Jones, Part 1) vs 1047 (Jones Appendix F). The sort moves to 1048.
- Saul made king: 1096 (Ussher-Jones, Part 1) vs 1095 (Jones). The sort moves to 1096.
- The angel slays 185,000: 713 (Part 2 Table 3) vs 709 (Jones). The sort moves to 713.
- Merodach-Baladan's embassy: 713 (Part 2 Table 2, Ussher-Jones column) vs 712 (Jones).
- Merodach-Baladan's accession: 722 (Table 3) vs 721 (Table 2): CFAH inconsistency I23.
- Shalmaneser III: sole rex 859 (Part 2) and accession 860 (Part 3); the reign-start sort uses 859, the first stored.
- Temple: dedication 1012/1011 (Part 3 Table 2); Part 3 also uses "Josephus' 1011 BC date for Solomon's Temple" as its founding date. The record keeps the CFAH-1 Table 1 1012.

## Tier 2 conflicts: CFAH papers printing different non-anchor years for one slot

The first entry governs (the order above); the others still show on the page. Same-paper cases follow the paper's own table order.

| Slot | Governs | Also printed | Effect |
|---|---|---|---|
| `people/amenemhat-i#reign` | Start: 1738; End: 1727 (cfah-7b-osf) | Start Co-Rex: 1745; Start Sole-rex: 1738; End Sole-rex: 1729 & 1718; Death or Deposition: 1708 (cfah-7a-osf) | sets the sort |
| `people/amenemhat-iii#reign` | Start: 1574; End: 1539 (cfah-7b-osf) | Start Co-Rex: 1586; Start Sole-rex: 1575; End Sole-rex: 1542; Death or Deposition: 1539 (cfah-7a-osf); 1586 BC ±1.5 years (cfah-6) | sets the sort |
| `people/cush#reign` | Reign (y): 33.3; Start (BC): 2233; End (BC): 2200 (cfah-15-osf) | Reign (y): 54; Start (BC): 2247; End (BC): 2192 (cfah-15-osf) | sets the sort |
| `people/david#reign` | Start: 1056; End: 1016 (cfah-16-osf) | Column: Ruler of Israel; Name row (Year BC): 1049; Last regnal-year row (Year BC): 1016 (year 40) (cfah-14-osf) | no sort effect (a tier birth year governs) |
| `people/hammurabi#reign` | Start: 1032; End: 989 (cfah-16-osf) | Reign (y): 55, 42; Start (BC): 1044, 1032; End (BC): 989 (cfah-15-osf) | sets the sort |
| `people/intef-i#reign` | Start: 1861; End: 1841 (cfah-7b-osf) | Start Co-Rex: unknown; Start Sole-rex: unknown; End Sole-rex: unknown; Death or Deposition: 1865 (cfah-7b-osf) | sets the sort |
| `people/intef-ii#reign` | Start: 1841; End: 1822 (cfah-7b-osf) | Start Co-Rex: unknown; Start Sole-rex: 1865; End Sole-rex: unknown; Death or Deposition: 1816 (cfah-7b-osf) | sets the sort |
| `people/intef-iii#reign` | Start: 1823; End: 1801 (cfah-7b-osf) | Start Co-Rex: unknown; Start Sole-rex: 1816; End Sole-rex: unknown; Death or Deposition: 1808 (cfah-7b-osf); 1816 to 1808 BC (cfah-6) | sets the sort |
| `people/mentuhotep-i#reign` | Start: 1887; End: 1861 (cfah-7b-osf) | Start Co-Rex: unknown; Start Sole-rex: 1881; End Sole-rex: unknown; Death or Deposition: unknown (cfah-7b-osf) | sets the sort |
| `people/mentuhotep-ii#reign` | Start: 1801; End: 1787 (cfah-7b-osf) | Start Co-Rex: unknown; Start Sole-rex: 1808; End Sole-rex: unknown; Death or Deposition: 1757 (cfah-7b-osf) | sets the sort |
| `people/merodach-baladan#reign` | 722 BC (seized the throne of Babylon) (griffith-beckman-reply-2) | 1 Nisan (April) 721 BC (ascended the throne) (griffith-beckman-reply-2) | sets the sort |
| `people/naram-sin-of-eshnunna#reign` | Reign (y): 9; REL #: 158-149; CFAH Date: 1060-1051 (cfah-14-osf) | Column: King of Eshnunna; Name row (Year BC): 1059; Last regnal-year row (Year BC): 1051 (year 9) (cfah-14-osf) | sets the sort |
| `people/nebka#reign` | Start Sole-rex: 2030/2029; End Sole-rex: 2011/2010; Death or Deposition: 2001 (cfah-7b-osf) | 2029 BC (cfah-6) | sets the sort |
| `people/nitocris#reign` | Start Sole-rex: 1491; End Sole-rex: 1485; Death or Deposition: 1479 (cfah-7b-osf) | 1497–1479 (cfah-6) | sets the sort |
| `people/pepi-i#reign` | Start Co-Rex: 1646; Start Sole-rex: 1637; End Sole-rex: 1606; Death or Deposition: 1593 (cfah-7b-osf) | 1637 BC ±2 years (cfah-6) | sets the sort |
| `people/pepi-ii#reign` | Start: 1592; End: 1492 (cfah-7b-osf) | Start Sole-rex: 1586; End Sole-rex: 1495; Death or Deposition: 1492 (cfah-7b-osf) | sets the sort |
| `people/sargon-i-of-akkad#reign` | Reign (y): 56; Start (BC): 1619; End (BC): 1563 (cfah-15-osf) | earliest … 1642 B.C. … latest date for his death in 1553 B.C. (cfah-5) | sets the sort |
| `people/sargon-ii#reign` | 720 or 721 (cfah-5) | accession 722 BC (Tebeth, January 721); killed 705 BC (griffith-beckman-reply-2) | sets the sort |
| `people/saul#reign` | Start: 1096; End: 1056 (cfah-16-osf) | Column: Ruler of Israel; Name row (Year BC): 1095; Last regnal-year row (Year BC): 1056 (year 40) (cfah-14-osf) | sets the sort |
| `people/senusret-i#reign` | Start: 1686; End: 1655 (cfah-7b-osf) | Start Co-Rex: 1729 & 1718; Start Sole-rex: 1708; End Sole-rex: 1686/1685; Death or Deposition: 1683 (cfah-7a-osf) | sets the sort |
| `people/senusret-iii#reign` | Start: 1606; End: 1574 (cfah-7b-osf) | Start Co-Rex: 1613; Start Sole-rex: 1606; End Sole-rex: 1586; Death or Deposition: 1573 (cfah-7a-osf); 1613 to 1573 BC (cfah-6) | sets the sort |
| `people/shalmaneser-i#reign` | Column: Assyrian King List; Name row (Year BC): 1262; Last regnal-year row (Year BC): 1233 (year 30) (cfah-14-osf) | 1261 (cfah-5) | sets the sort |
| `people/shalmaneser-iii#reign` | 859 BC (sole rex) (griffith-beckman-reply-2) | 860 BC (accession) (griffith-beckman-reply-3) | sets the sort |
| `people/shamshi-adad-iv#reign` | Start: 1076, 1053; End: 1020 (cfah-16-osf) | Column: Assyrian King List; Name row (Year BC): 1053; Last regnal-year row (Year BC): 1050 (year 4) (cfah-14-osf) | sets the sort |
| `people/solomon#reign` | Start: 1016; End: 976 (cfah-16-osf) | Column: Ruler of Israel; Name row (Year BC): 1015; Last regnal-year row (Year BC): 976 (year 40) (cfah-14-osf) | no sort effect (a tier birth year governs) |
| `people/taharqa#reign` | Reign: 26 / 20 / 18; Start: 691 / 690; End: 671 / 664 (cfah-10-osf) | Year BC: 713 - 664; Yrs: 40 (cfah-8-osf) | sets the sort |
| `people/tausret#reign` | Rgn: 7/50; BC Dates: 484 - 475 - 434? (cfah-11-osf) | Start: ~482; End: 475 (cfah-9-osf) | sets the sort |
| `people/unas#reign` | Start Co-Rex: 1732; Start Sole-rex: 1716; End Sole-rex: 1682; Death or Deposition: 1682 (cfah-7b-osf) | 1715 to 1682 BC (cfah-6) | sets the sort |
| `people/userkare#reign` | Start: 1637; End: 1606 (cfah-7b-osf) | Start Sole-rex: 1652; End Sole-rex: 1646; Death or Deposition: 1637 (cfah-7b-osf) | sets the sort |
| `people/yaggid-lim#reign` | Start: ~1067; End: ~1057 (cfah-16-osf) | Reign (y): ~10; Start (BC): ~1077; End (BC): ~1067 (cfah-15-osf) | sets the sort |
| `people/yahdun-lim#reign` | Start: 1057; End: 1035 (cfah-16-osf) | Reign (y): ~30; Start (BC): ~1067; End (BC): 1037 (cfah-15-osf) | sets the sort |
| `people/yasmah-addu#reign` | Start: ~1053 (Elsewhere), 1035 (Mari); End: 1020 (cfah-16-osf) | Reign (y): 17; Start (BC): 1036; End (BC): 1019 (cfah-15-osf) | sets the sort |
| `people/zimri-lim#reign` | Start: 1020; End: 996 (cfah-16-osf) | Reign (y): 21; Start (BC): 1019; End (BC): 998 (cfah-15-osf) | sets the sort |
