<!--
  docs/roadmap-pd-sources.md
  Kevin R. Amundson's roadmap of public-domain ancient histories to integrate (attached to the request of 2026-10-22).
  The roadmap text below is reproduced VERBATIM. Its claims (edition years, PD status, creation years, counts)
  are the roadmap's own and must each be verified against the actual edition before any data entry.
  Reviewer notes (Chronos, 2026-10-22) are in a separate section at the end; they are not edits to the roadmap.
-->

> **Kevin's roadmap (verbatim).** Reviewer notes are in the last section, [Reviewer notes (Chronos)](#reviewer-notes-chronos-2026-10-22).

---

# Chronos Contribution Roadmap — Prioritized by Public-Domain Availability

**Prepared for:** chronos-timeline implementation team
**Scope:** Ancient historical records identified for addition to the site, prioritized by (1) public-domain availability, (2) chronological value to a CFAH/Ussher-style comparative framework, (3) effort to integrate.

**Project rule honored throughout:** *No date, URL or citation is entered unless it was read in the source.* Every entry below names a specific public-domain (or permission-required) edition so the team knows exactly what text to read.

**US copyright status as of Oct 2026:** works published **1930 or earlier** are public domain (US). Works published 1931–1964 are copyrighted only if renewed — flag for case-by-case verification. Works 1965+ are under full copyright. Original ancient/medieval texts are always PD; **only the modern translation or critical edition carries copyright.**

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ PD | Fully public domain, ready to read, quote, and link |
| ⚠️ Check | Likely PD or mixed; verify edition/year before committing |
| 🔒 Copyrighted | Must be cited/linked only, or requires permission — matches existing policy for ARJ/CFAH and Jones materials |

Known safe hosts for ✅ items: **Internet Archive (archive.org)**, **Perseus Digital Library (Tufts)**, **Project Gutenberg**, **HathiTrust (full-view only)**, **Google Books (full-view pre-1931)**, **sacred-texts.com**, **Documenta Catholica Omnia / Documenta Latino**, and **Wikisource** (always confirm the scanned edition behind a Wikisource text).

---

## Phase 1 — Quick Wins (1–2 sprints)

Fully public-domain sources with existing English translations and direct chronological value. Each can be added as a new `chronologies.json` column and `sources.json` entry following the Josephus/Raleigh pattern.

### 1.1 Bede — the "Bede's history" you asked about
- **Works:** *De Temporibus* (703) and *De Temporum Ratione*, ch. 66 (*Chronica Maiora*, 725). Computes creation at **3952 BC** (Vulgate tradition).
- **PD edition:** J. A. Giles, *The Miscellaneous Works of Venerable Bede* (1843), on Internet Archive and HathiTrust. ⚠️ Avoid Faith Wallis's Liverpool University Press translation (1999, 🔒) except for private cross-checking.
- **Why first:** Bede is a named figure in your search index already? If not, he is the single most influential medieval chronographer after Eusebius and gives the site its first Vulgate-tradition column. Compact text; ~120 dated statements, mostly one-line regnal entries — very fast to extract.

### 2. Herodotus, *Histories* Book II
- **PD editions:** George Rawlinson translation (1858, all vols., Gutenberg/archive.org); H. Godley Loeb (1920–25, now PD).
- **Value:** Egyptian king-list narration (Book II, chapters 99–146) with Herodotus' own reckoning back to Min/Menes. Gives the site a **pre-Christian Greek chronographer column** — the natural counterpart to Josephus.

### 3. Alfred Edersheim — *The Bible History: Old Testament* (1875–77) — clarifying "Einstein"
- **Status:** ✅ PD, scans on archive.org.
- **Note for the team:** the user's "Albert Einstein" almost certainly refers to **Edersheim**. If a 20th-century figure were truly wanted, Einstein produced no chronology. Edersheim provides harmonized dates aligned with the Ussher tradition and is the easiest mass import of narrative biblical-world dates in existence.
- **Special note — Berossus & Sumerian King List:** **see Phase 1 #6 (Cory's *Ancient Fragments*)** — the best single public-domain access point to both Berossus AND Syncellus excerpts simultaneously.

### 4. Isaac Newton — *The Chronology of Ancient Kingdoms Amended* (1728)
- ✅ PD (English and French editions both on Internet Archive).
- **Value:** A secular-rationalist early-modern chronology to pair with Ussher and Raleigh; covers Greek, Egyptian, Assyrian, Babylonian chronology. Its "shortening" of Greek antiquity parallels CFAH's compression arguments — excellent comparative column.

### 5. William Hales — *A New Analysis of Chronology* (1809–12)
- ✅ PD. The great 19th-century synthesis: compares Ussher, Jackson, Playfair, Kennicott, LXX, Samaritan, Josephus, and rabbinic systems side by side.
- **Value:** Effectively a **ready-made multi-column spreadsheet** of the kind the site already renders. Mining Hales lets you populate several comparanda from one read.

### 6. Isaac Preston Cory — *Ancient Fragments* (1828, expanded 1876)
- ✅ PD on archive.org.
- **Value — highest coverage-per-page in this entire roadmap.** One volume contains English translations of:
  - **Berossus** (Babyloniaca fragments, incl. the pre-Flood ten-kings list via Syncellus/Eusebius)
  - **Manetho excerpts** (the versions preserved by Africanus, Eusebius, Syncellus — bypassing the 🔒 Waddell Loeb of 1940 and the 🔒 Verbrugghe & Wickersham of 1996 entirely)
  - **Sanchoniathon**, the **Tyrian annals** (Menander/Diylles via Josephus), and other lost historians
- **Recommendation:** make this the **first physical/textual acquisition** of Phase 1. It unblocks Berossus, Manetho (partially), Castor of Rhodes, and fragments of the Greek chronographers in one PD reading session.

### 7. Julius Africanus — *Chronographiae* fragments
- ✅ PD: Routh, *Reliquiae Sacrae* (1846–48, Greek + Latin, archive.org); E. Martin's French edition (1885); English fragments in ANF vol. 6 (1897).
- **Value:** Earliest Christian world chronicle (~AD 221); creation ca. 5500 BC in his scheme. Essential comparator for the LXX-vs-MT gap question.

### 8. Hippolytus of Rome — Chronicle fragments & *Refutation*
- ✅ Complete in Ante-Nicene Fathers vols. 4–5 (1885), public domain; his statue-inscription chronology gives another early Christian world-age computation.

### 9. Anglo-Saxon Chronicle (+ Bede pairing)
- ✅ PD translations: Ingram (1823), Thorpe (Rolls Series, 1861). Both on archive.org/Gutenberg.
- **Value:** Extends the Clonmacnoise lineage to Anglo-Saxon England; contains the famous BC 1-to-AD 1 cross-over annotations and its own creation-era reckonings.

---

## Phase 2 — Core Classical & Near Eastern Records (2–4 sprints)

PD originals with good translations, but requiring more extraction discipline (fragmentary material, regnal math).

### 10. Eusebius/Jerome — *Chronicle* (Canon)
- **PD editions:** August Schöne's critical Greek/Latin edition *Eusebi Chronicorum* (1866–75); Joseph Karst's GCS edition (1911, PD); Jerome's Latin in Migne PL 27 (PD, Documenta Catholica Omnia). ⚠️ Modern complete English translations (e.g., recent SCP Press; GoTT) are 🔒 — cite, don't republish.
- **Value:** THE backbone of Christian chronography; Africanus' successor, source for Castor, Berossus, Manetho via the canons. Every entry you've listed as "needs adding" inherits from this one.
- **Effort note:** Greek/Latin reading required if using Schöne; alternatively mine Cory (item 6) and Hales (item 5) for translated excerpts, deferring full-canonical work to Phase 3.

### 11. James Henry Breasted — *Ancient Records of Egypt* (5 vols., 1906)
- ✅ PD. On archive.org.
- **Value — unblocks Egyptian primary sources:** includes translations of the **Palermo Stone**, **Abydos King List (Seti I)**, **Karnak King List (Thutmose III)**, **Saqqara List (Ramesses II)**, plus royal annals and inscriptions. This is how you bring Egyptian records into the site with verified citations while respecting copyright on modern Egyptological handbooks. ⚠️ Mistrust deep URLs; verify on archive.org by ISBN/title.

### 12. Daniel David Luckenbill — *Ancient Records of Assyria and Babylonia* (2 vols., 1926–27)
- ✅ PD (both vols. entered public domain in 2023). Includes eponym-list material and royal inscriptions.

### 13. Herodotus Books I, III–IX; Thucydides; Polybius; Livy; Tacitus
- ✅ PD: Rawlinson (Herodotus); Crawley (Thucydides, 1876); Shuckburgh (Polybius, 1889); Spillan/Bohn (Livy, 1853); Church & Brodribb (Tacitus, 1876). All on Gutenberg/archive.org.
- ⚠️ The Loeb alternates (Smith 1919 Thucydides; Paton 1922–27 Polybius; Foster 1919–29 Livy) are now PD too.

### 14. Ptolemy's Canon
- ⚠️ PD via older Almagest translations (Taliaferro 1939 — check renewal; Manitius German edition 1912, PD) and via Hales/Clinton reproductions of the king list itself. The canon (Nabonassar → Antoninus) is short enough (~40 lines) to reconstruct from PD secondary compilations with citations.
- **Value:** THE fixed reference frame for late-Babylonian/Persian/Greek chronology; every revisionist (YEC and mainstream) must position against it.

### 15. Berossus & Sumerian King List — full treatments
- **Berossus:** Cory (item 6) covers the fragments; supplement with Müller's *Fragmenta Historicorum Graecorum* (1841–70, PD) which adds Castor of Rhodes and Apollodorus fragments in Greek.
- **Sumerian King List:** ⚠️ The standard translation is Jacobsen (1939, AS 11) — renewal status must be checked; if renewed, 🔒. Older: Langdon's Weld-Blundell prism edition in *Oxford Editions of Cuneiform Texts* vol. II (1923) — ✅ PD.
- **Value:** Both are already implicitly referenced by your Berossus/Nimrod entries per the Ussher/CFAH tradition; direct sourcing strengthens the chain of custody.

### 16. Chronicon Paschale
- ⚠️ Greek in Migne PG 92 (Dindorf, 1865, ✅ PD); the Whitby & Whitby English translation (1989) is 🔒. Options: cite-not-quote the modern translation, or translate selectively in-house with a Latin/Greek reader on the team.

### 17. Sulpicius Severus — *Chronica*; Isidore of Seville — *Etymologies* Book V
- ✅ PD: Sulpicius in old NPNF translations; Isidore via Brehaut's abridged translation (1912) for Books I–V chronology (⚠️ Barney et al. 2006 is 🔒).

### 18. Demetrius the Chronographer, Eupolemus, other Jewish Hellenistic chronographers
- ✅ Accessible via E. H. Gifford's 1903 translation of Eusebius, *Praeparatio Evangelica* (archive.org), where most fragments survive. Pair with Cory's fragments (item 6).

---

## Phase 3 — Higher-Barrier Sources (long-term or permission track)

### 19. George Syncellus — *Ecloga Chronographica*
- 🔒 **Modern English translation (Adler & Tuffin, Oxford, 2002) is under copyright.** However: ✅ Dindorf's 1829 Greek edition is PD, and **Cory's *Ancient Fragments* (item 6) translates the most important Syncellus passages** (incl. Manetho's and Berossus' versions he preserves).
- **Route:** (a) use Cory for translated excerpts; (b) if deeper Syncellus coverage is desired, contact OUP for permission (mirroring the existing James B. Jordan permission model), or (c) commission an in-house translation of specific passages from the Dindorf Greek.

### 20. Turin Canon of Kings
- 🔒 Gardiner's *Royal Canon of Turin* (1959) is copyrighted. ⚠️ Translations of the Turin papyrus appear in many academic articles; older or open-access publications exist individually. **Fallback:** Breasted (item 11) discusses it, and the canon's main divisions can be cited via Hales (item 5).
- **Priority note:** medium value added beyond Manetho; keep on the backlog.

### 21. Babylonian Chronicles
- 🔒 Standard translations (Wiseman 1956; Grayson 1975; Glassner 2004) are copyrighted. ⚠️ PD alternatives are fragmentary; individual chronicle translations appear in older journal articles (case-by-case PD check). **Recommend:** link-and-cite only, consistent with existing policy for copyrighted scholarly works, until an open-licensed translation is located.

### 22. Seder Olam Rabbah
- ⚠️ The accessible English translation (Guggenheimer, 1998) is 🔒. The traditional Hebrew text (e.g., Ratner's Vilna edition) is ✅ PD but requires Hebrew.
- **Value is high** (foundational rabbinic chronology; 52-year compressed Persian period directly challenges Ptolemy's Canon), so consider a **permission request or in-house Hebrew translation** as a Phase 3 project.

### 23. Septuagint & Samaritan Pentateuch chronologies
- **LXX:** ✅ Brenton's English Septuagint (1844) and Swete's Cambridge edition (1887–94) — PD. ⚠️ Rahlfs (1935) — renewal check needed. Rahlfs…
  **MT Genesis 5 checks exist in your validator; adding LXX and SP genealogical columns extends the masoretic-genealogy chronology you already have.**
- **Samaritan Pentateuch:** 🔒 the only complete English translation is Tsedaka & Tsedaka (2013). The chronological *numbers*, however, are tabulated in Hales (item 5) and in PD text-critical literature — usable via those secondary routes without touching the modern translation.

### 24. Donovan Courville — *The Exodus Problem and its Ramifications* (1971)
- 🔒 Copyrighted. Cite-and-link only (as done for ARJ/CFAH). Valuable for YEC-internal Egyptian revision context; the CFAH papers already supersede much of it.

### 25. Scaliger — *De Emendatione Temporum* (1583)
- ✅ PD (Latin only; no English translation exists). Requires a Latin-reader. Low urgency despite prestige — its content is largely mediated through Hales and Clinton.
- **Clinton:** ✅ *Fasti Hellenici* (1834) / *Fasti Romani* (1845) — PD, strong Phase 2½ addition for Greek/Roman Olympiad anchoring.

### 26. Irish annals family
- **Annals of the Four Masters:** ✅ O'Donovan's edition (1848–51, Irish + English) and the Connellan 1846 translation — PD, on archive.org. **Best-value Irish annal to add next** (pairs with your existing Clonmacnoise stub).
- **Annals of Ulster:** ⚠️ Mac Airt & Mac Niocaill (1983) is 🔒; Hennessy's 19th-century editions are PD but incomplete.
- **Annals of Tigernach:** ⚠️ scattered older editions, mixed status. Backlog.

---

## Suggested sprint mapping

| Sprint | Deliverables |
|---|---|
| Sprint 1 | **Cory's *Ancient Fragments*** (Berossus + Manetho-via-Syncellus + Castor + Sanchoniathon) and **Hales** (comparative cross-check engine) — two books unlock six roadmap items |
| Sprint 2 | **Bede** (new `chronologies.json` column + `sources.json` entry + ~120 date extracts); **Herodotus II** (second Greek column) |
| Sprint 3 | **Edersheim** (bulk biblical dates); **Newton** + **Breasted** vol. I–II (Egyptian king lists begin) |
| Sprint 4 | **Africanus**, **Hippolytus**, **Anglo-Saxon Chronicle**, **LXX/Brenton** genealogy column (extends `masoretic-genealogy` validator) |
| Sprint 5 | **Luckenbill**, **Ptolemy's Canon** (via PD reproductions), **Four Masters** (Irish annal expansion) |
| Sprint 6+ | Eusebius-Jerome canon work, Sumerian King List (Langdon/OECT if Jacobsen confirmed 🔒), Clinton's Fasti |
| Permission track (parallel) | Adler & Tuffin (Syncellus); Guggenheimer (Seder Olam); Whitby & Whitby (Chronicon Paschale) — template exists from the Jordan permission |

---

## Standing cautions for the team

1. **Loeb volumes 1931–1964 are not automatically PD** — renewal must be checked per volume (Stanford/HathiTrust copyright renewal databases). Anything Loeb 1930 or earlier is safe today (Oct 2026).
2. **Wikisource and Google Books "full view" are fine; "snippet/limited view" scans are not usable citations** — always resolve to the scanned page number of a PD edition, per the project rule.
3. **The existing no-republish rule for ARJ/CFAH and Jones extends naturally** to Waddell/Manetho, Glassner, Adler & Tuffin, and Verbrugghe & Wickersham: cite and link, never republish text.
4. **Suggested schema additions:** a `tradition` field on chronology entries (christian-greek, jewish-rabbinic, egyptian-native, mesopotamian-native, greek-secular, irish-medieval, early-modern) would let the site group the new columns visually, mirroring the existing primary/secondary tier system.

---

## Reviewer notes (Chronos, 2026-10-22)

These notes come from checking the roadmap against the repository at `origin/main` 72dc885. They are not edits to the roadmap above.

1. **Herodotus is already integrated** (roadmap item 2, the Herodotus part of item 13, and "Herodotus II" in Sprint 2).
   - The `herodotus` secondary chronology is built from George Rawlinson's translation: the Roman Roads Media etext (2013) cited by CFAH, linked to the PD Wikisource transcription.
   - It covers **all nine Books, not just Book II**: 116 dated statements, 96 mapped to records and 15 conflicts. See `data/herodotus-dates-extract.md` and `scripts/herodotus/`.
   - So this work reduces to **gap-filling**: the 20 unmapped statements, plus any dated statements the first pass missed. The Godley Loeb (1920–25) would be a second translation and is not needed unless Kevin asks for it.
   - Thucydides, Polybius, Livy and Tacitus (item 13) are new.
2. **Clonmacnoise is not a "stub" in the sense of having no data.**
   - `annals-of-clonmacnoise` is a display-only chronology from the 1896 Murphy edition (Mageoghagan's 1627 translation), on archive.org. It has entries on 4 events: the Flood, the birth of Abraham, the Exodus and the dedication of the Temple.
   - Its interval readings are still unverified against the page images (open question **B5** in `docs/OPEN-QUESTIONS-FOR-KEVIN.md`).
   - The Four Masters (item 26) would be new.
3. **Raleigh** is already a display-only chronology on 8 records. The full 1617 text, EEBO-TCP A10357, is in `sources/raleigh/`. A full Raleigh pass is on hold, because Kevin said "Not now" on 2026-10-22.
4. **Bede already appears as a person and in events** (`data/people/bede.json`, `bede-ecclesiastical-history`, `bede-letter-to-egbert`), from the Generations curriculum. **No Bede chronology column exists yet.** Item 1.1 would add his *De Temporibus* and *De Temporum Ratione* figures as a new display-only column.
5. **The masoretic-genealogy validator checks exist** (Genesis 5 and 11, MT). An LXX or Samaritan Pentateuch column (item 23) must be a **separate display-only chronology**. It must never feed the MT arithmetic checks, and the MT stays the standard.
6. **Unverified claims in the roadmap.** These are the roadmap's own and must be checked against the actual edition before entry:
   - Bede's creation at "3952 BC" and "~120 dated statements" (Giles 1843)
   - Africanus' creation "ca. 5500 BC"
   - Edition years: Rawlinson 1858, Cory 1828/1876, Hales 1809–12, Breasted 1906, Luckenbill 1926–27, Langdon 1923, Brenton 1844, Gifford 1903 and others
   - PD status, and the Loeb, Jacobsen 1939 and Taliaferro 1939 renewal notes
   - "~40 lines" for Ptolemy's Canon
   - Any statement of the form "contains X" about a volume's contents

   The rule in AGENTS.md applies: **no date, URL or citation is entered unless it was read in the source.**
7. **Edersheim / "Einstein" (item 3).** That Kevin meant Alfred Edersheim is the roadmap author's guess. Confirm with Kevin before starting item 3.
8. **Non-English editions** (Schöne, Karst, Dindorf, Migne, Routh, Scaliger, Ratner, Müller's FHG Greek, Manitius) are out of scope for this backlog. Kevin's request is for ancient histories **translated into English**, and in-house translation would be new, unsourced text. These need Kevin's go-ahead.
9. **Permission track** (Adler & Tuffin, Guggenheimer, Whitby & Whitby): Grok Build and Chronos must **not contact publishers**. Kevin decides whether to ask, and does the asking himself.
10. **The suggested `tradition` field** (standing caution 4) is a schema change. It is optional and needs Kevin's approval before anyone adds it.
11. **Order of work:** follow the sprint mapping (Sprint 1: Cory, then Hales) unless Kevin says otherwise. Use **one source per PR**.
