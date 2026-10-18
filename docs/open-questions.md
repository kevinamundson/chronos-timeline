# Open questions

## Resolved
- ~~Fallback for sorting_year~~ and ~~whether CFAH-1 Table 1 dates should be told apart from anchor points~~. **The owner decided on 2026-10-17:**
  1. CFAH anchor point
  2. CFAH-1 Table 1
  3. Ussher-Jones (Floyd Nolen Jones)
  4. Ussher

  This is implemented with `cfah_basis` (`anchor_point` | `table1_baseline`) on cfah entries, a separate `ussher-jones` chronology, and
  `sorting_basis.tier`/`tier_rank`. It is enforced by `scripts/validate.mjs`.

## Open
1. **CFAH coverage.** Only 6 of the planned 20 CFAH papers are published. The current records have these CFAH dates:
   - Tier 1 (anchor points): Creation (AP-30), the Flood (AP-29), Adam (AP-30) and Enosh's death (AP-31, Huang Di = Enosh)
   - Tier 2 (CFAH-1 Table 1): Creation, the Flood, Adam and Noah's death (1998 BC)

   Every other cfah field is null and says "pending CFAH reference".
2. **Edge cases in the sort rule.**
   - **ark-landing:** no tier gives a BC year (Ussher prints AM 1656 and "May 6" only), so it uses `derived` from the-flood (−2348).
   - **cain-and-abel:** this now sorts at Ussher's −3874. That is a *latest-possible* date (before Seth's birth), not the event year.
   - **ham:** no tier dates his birth, so his sorting_year is null.

   Please confirm these conventions.
3. **Ussher-Jones edition.** CFAH cites Jones 2019 (21st ed.). That free PDF (floydnolenjonesministries.com/files/135786316.pdf) returned 404.
   I used the 15th ed. (2002, ntslibrary.com) and Jones's Chart No. 1 (© 1993, from the owner-supplied page https://floydnolenjonesministries.com/chronology/).
   The ministry page's "6 - Creation to Creator" link points to the Chart 5C file, so Chart 6 couldn't be read. Most charts in the 2002 PDF are images.
   Only Creation (0 AM / 4004 BC), the Flood (1656 AM / 2348 BC) and the AM birth years in the "Chronological Compendium" (p. 1) were readable as text. No BC years are inferred from AM figures.
4. **Jones vs CFAH-1 Table 1 on 1012 BC.** Jones's Chart 1 says that in 2992 AM / 1012 BC Solomon *begins* the Temple. CFAH-1 Table 1 lists 1012 as "Solomon *Dedicates* the Temple". This matters for a future Temple anchor.
5. **The Ussher Flood year.** Ussher heads AM 1656 (when the Flood begins, Sunday 7 Dec) as **2349 BC**. Jones and CFAH give 2348 BC.
6. **The Ussher Ark landing.** The 1658 text says "May 6". Many secondary sources say 5 May.
7. **Ussher § numbering** comes from the free modern transcription. It matches CFAH's "Ussher 2005" at §47 (Peleg), but **not** at Abraham's birth: CFAH-6 cites "Ussher 2003, §64" while the transcription numbers it §63. So § numbers may be off by one in places; check against the Pierce edition if one becomes available. The transcription also has a typo: Mahalaleel 892, should be 895.
   The Jones Compendium has a typo too: "Jared born when Mahalaleel was 165", which should be 65.
8. **Josephus Flood figure.** Whiston's Antiquities I.3.3 reads 2656, with "[1656]" in brackets. Decide whether to show both.
9. **Annals of Clonmacnoise / Raleigh.** No dates have been extracted yet. A candidate first entry: Semiramis "after the flood 313 years" (cited in CFAH-4, McGeoghagan 1896, 12–13).
10. **Japheth/Shem order.** Ussher makes Japheth the eldest (AM 1556). Jones's Compendium gives Shem born when Noah was 502 (AM 1558). Nothing gives a date for Ham.
11. **Maps.** No historic map with a IIIF manifest has been chosen yet.
12. **Licensing.** The ARJ/CFAH papers and the Jones materials are free to read but copyrighted. Jones's 2002 book allows free non-profit reproduction but no publishing without permission.
    Cite and link them; don't republish their text.
13. **The Temple date conflict (flagged in temple-dedication).** CFAH-1 Table 1 says "1012 Solomon Dedicates the Temple". Jones's Chart No. 1 says the Temple was *begun* in 1012 BC (2992 AM). Ussher dates the foundation to 1012 BC (§465) and the dedication to 1004 BC (§468). Josephus VIII.3.1 dates the start of building (592 years after the Exodus).
    The sort currently follows the rule (tier 2, 1012 BC). Should the record become "Temple foundation", or should a separate dedication record use 1004 BC?
14. **Solomon's death.** CFAH-1 Table 1 says 976 BC. Ussher (§475) says 975 BC, and Jones's Chart 1 has the kingdom divided in 975 BC.
15. **Abraham's birth.** Straight MT arithmetic (Terah aged 70, Gen 11:26) gives AM 1948. Josephus I.6.5 agrees ("292nd year after the deluge"), and so does Clonmacnoise's 292 years.
    Ussher, Jones, CFAH and Raleigh use Terah aged 130 (AM 2008; Raleigh says AM 2009).
16. **The Exodus year in Raleigh.** Raleigh puts it at "about the beginning of the year of the world 2514", against AM 2513 in Ussher and Jones.
17. **CFAH Exodus basis.** The Exodus year (1491 BC) is entered as Table 1 (tier 2). CFAH-6 uses 1491 BC as a frame and derives the deaths of Concharis and Merenre II in 1491 BC ±6 months, but I found no AP number for the Exodus itself. Similarly, CFAH-6 §3 (Abraham and Khufu, 1921 BC) takes Jones's date.
18. **LoC IIIF manifests.** The manifest URLs come from the LoC item metadata (`iiif_manifest_url`). The thumbnails and IIIF Image API `info.json` all returned HTTP 200. A direct fetch of www.loc.gov (item pages and manifests) hit a Cloudflare challenge (403) from the box, so check the manifests in a browser.
19. **Parents not yet recorded.** Eber, Cush, Terah, Jacob, Amram and David aren't records yet, so `father` is null with a note. Nimrod and Ham have no birth dates (sorting tier "none").
20. **Dispersion in Ussher.** Ussher gives no year. §47 narrates it under 1757 AM / 2247 BC and argues the colonies came "some years after Reu was born" (1787 AM). The Ussher entry is null with that note.
21. **James B. Jordan (secondary chronology, added 2026-10-17).** Jordan's dates come only from the two owner-supplied sources: the biblicalhorizons.com category (83 posts) and the garynorth.com archive (82 issues). Points to decide:
    - His B.C. years are "SBC" figures from BC 5:8 (1993): Creation 3930, Flood 2274, Abram 1922, Exodus 1417, Temple begun 937. They are about 74-75 years later than Ussher/CFAH, so every Jordan row raises a "differs from sort year" flag. Should the site label SBC more prominently?
    - Temple: Jordan dates the foundation AM 2993 (Jones/Ussher 2992), completion AM 3000, and dedication AM 3014 ("virtually forced to assume", BC 5:3). Ussher puts the dedication at 3001 and CFAH-1 Table 1 at 1012 BC. This adds a third view to Q13.
    - Dispersion: Jordan says he puts Babel at AM 1871 (2059 B.C. SBC) "arbitrarily" and "for aesthetic reasons". He denies the division was at Peleg's birth, the event CFAH's final-territorial-division record uses. The entries are marked conjectural.
    - Mahalalel's birth is printed as 396 (MT arithmetic gives 395). Solomon's accession is 2989 in BC 5:8 but his first year is 2990 in BC 6:9. The Temple is 932 B.C. in BC 2:8 but 937 B.C. in BC 5:8. All are recorded as printed.
    - The 14 "Daniel" posts on biblicalhorizons.com have no text (it was held back for a commentary). Their charts exist only as scanned PDFs on garynorth.com. They were OCR'd into the backlog and need checking against the scans.
    - The backlog (`data/jordan-dates-extract.md`, Part A) has candidate new records: Arphaxad (1658), Terah (1878), Isaac (2108), Jacob (2168), Aaron (2430), the end of the Conquest (2560), the fall of Jerusalem (3425 / 505 SBC), and the decree of Cyrus (3474 / 456 SBC).

