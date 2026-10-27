# Grok Build task backlog

*Set by Kevin R. Amundson on 2026-10-22, and written up by Chronos from the repo state at `origin/main` 72dc885.*

All rules are in [`AGENTS.md`](../AGENTS.md). Each task, or each source within T1, gets its own `gb/<slug>` branch and draft PR. Chronos reviews it against [`REVIEW-CHECKLIST.md`](REVIEW-CHECKLIST.md), and Kevin approves the merge.

*Updated 2026-10-23 with Kevin's answers to Q-M1, Q-J1, Q-S1, Q-T1, Q-T2 and Q-P1.*

**Order:**

1. **T1** sources, one per PR, in the roadmap's sprint order (confirmed by Kevin): Cory's *Ancient Fragments* first, then Hales, and so on.
2. **T3** scope wording draft (small; the wording needs Kevin's final approval in the PR).
3. **T4** transparent spans.
4. **T4b** Jasher reign lengths (edition settled; see T4b).
5. **T2** free links: **ON HOLD.** Do not start it until Kevin approves the schema.
6. **T5** standby placement for records with no tier date. Kevin approved the schema and the rule on 2026-10-27.

Kevin may reorder these.

---

## T1. Integrate further public-domain ancient histories (English translations)

**Goal:** add the sources in Kevin's roadmap, [`docs/roadmap-pd-sources.md`](roadmap-pd-sources.md), as display-only secondary chronologies, each with verified dates. Read the roadmap's "Reviewer notes" first.

**Order:** follow the roadmap's sprint mapping. Kevin confirmed this order on 2026-10-23.

- **Sprint 1:** Cory, *Ancient Fragments*. Pick 1828 or 1876 and record which edition you read. Then Hales, *A New Analysis of Chronology*.
- **Then:** Bede (Giles 1843), Edersheim, Newton, Breasted, and so on. Kevin confirmed on 2026-10-23 that "Einstein" in the roadmap means **Alfred Edersheim**, *The Bible History: Old Testament*.

**Each source is one PR containing:**

- An entry in `data/sources.json`. Give the exact edition, translator or editor, and the volume(s) read. List the full-view `url`/`alt_urls` you opened (`verified_on` = the day you opened them). Set `access: public-domain` and a `license_note` stating the PD basis, for example "published 1876; US public domain by age".
- A chronology in `data/chronologies.json`, with `primary: false`, the next `sort_priority`, and a `description` containing "SECONDARY DISPLAY" (as on herodotus, morecraft, generations), plus a validator rule in `scripts/validate.mjs` that the source **can never set `sorting_year`**. Model it on the `herodotus` and `morecraft` rules.
- `scripts/<source>/rows*.mjs` (curated rows) and an idempotent `scripts/<source>/import.mjs`, which writes entries onto existing records and creates records only where none exists. A created record must still carry a `cfah` entry, `date: null`, with `pending CFAH reference`.
- A generated `data/<source>-dates-extract.md` in the style of `data/herodotus-dates-extract.md`. Include:
  - the edition read
  - a summary table
  - every dated statement, with volume, page and section, the record it maps to, a derived year (only if any, labelled DERIVED), and status (agrees / consistent / CONFLICT / internal / framework / n/a)
- New conflicts added to `docs/OPEN-QUESTIONS-FOR-KEVIN.md`, in a new lettered section for the source.
- Updates to the README "Key conventions" and to the About and chronologies page text, if they list the chronologies.

**Acceptance criteria:**

- `npm run validate`, `build` and `verify` pass.
- Tier counts in the validate summary are unchanged, except where new records are added, and those have tier `none`, `derived` or `provisional` as the rules allow. No existing record's `sorting_year` changes.
- Every entry has edition, page or section, and a working full-view link. At least 5 entries, or 10% of the batch, are listed for spot-checking in the PR.
- Dates are recorded as printed. AM or regnal arithmetic is not converted unless the source does it. LXX, Samaritan Pentateuch or Vulgate figures are shown, never used to "correct" the MT.

**Files likely touched:** `data/sources.json`, `data/chronologies.json`, `scripts/validate.mjs`, `scripts/<source>/`, `data/events/*.json`, `data/people/*.json`, `data/<source>-dates-extract.md`, `docs/OPEN-QUESTIONS-FOR-KEVIN.md`, `README.md`, `site/build.mjs` (chronology order or labels only).

**Pitfalls:**

- **Herodotus is already done** (all nine Books, 116 statements). Only gap-filling remains, so do not create a second Herodotus chronology.
- Clonmacnoise exists (4 events; B5 unverified). Raleigh is on hold ("Not now").
- Roadmap claims are unverified until you read the edition, for example "3952 BC" for Bede, "~120 statements", or "ca. 5500 BC" for Africanus.
- Wikisource and Gutenberg texts: confirm which printed edition they transcribe, and cite that edition's pages.
- Reject snippet or limited-view Google Books and HathiTrust "search only" items. The roadmap's Loeb, Jacobsen and Taliaferro notes need a renewal check for 1931–1964 works.
- Fragments preserved by later authors, for example Berossus via Syncellus via Cory: cite the chain ("Berossus, ap. Syncellus, tr. Cory 1876, p. N").
- After any importer run, re-run `node scripts/cfah/import.mjs` last (see AGENTS.md §9).
- The `tradition` field the roadmap suggests is a **schema change** and is **on hold**: Kevin will return to it. Do not add it, and do not add `free_links` (T2), to any T1 source. Use the existing `url` and `alt_urls` fields.
- Non-English editions and in-house translation are out of scope.

---

## T2. More free links for every source (ON HOLD)

> **On hold pending Kevin's schema approval (2026-10-23).** Kevin will return to the `free_links` field and the optional `tradition` field. Grok Build must **not** start T2, open a T2 branch, or add either field to the schema or data until Kevin approves. The text below is kept for when he does.

**Goal:** for every source in `data/sources.json`, add every *additional* free full-view copy that exists. Hosts include:

- Google Books (full view only)
- Internet Archive
- HathiTrust (full view only)
- Project Gutenberg
- Wikisource
- Perseus
- CCEL
- sacred-texts

Each link is verified live and checked to be the same edition. Where it is a different edition, label it as such.

**Current schema** (check before changing):

- Each source has `url` (primary) and `alt_urls: [url]`.
- Records have `free_source_links: [{source_id, url, locator}]` (`schema/common.schema.json` → `freeSourceLink`).
- There is **no per-source page**. Sources are rendered in the list on `/chronologies/` and in each record's "Free sources" card (`sourcesSection()` in `site/build.mjs`).

**Minimal extension (proposed):** add an optional `free_links` array on a source:

```json
"free_links": [
  { "host": "archive.org", "url": "https://archive.org/details/…", "edition": "1876 2nd ed., Reeves & Turner", "view": "full", "verified_on": "2026-10-2x", "note": "" }
]
```

- Keep `url` and `alt_urls` as they are, for backward compatibility. Move nothing, and add links only to `free_links`.
- `host` uses an enum allow-list: `books.google.com`, `archive.org`, `babel.hathitrust.org`/`catalog.hathitrust.org`, `gutenberg.org`, `wikisource.org` (any language subdomain), `perseus.tufts.edu`, `ccel.org`, `sacred-texts.com`, plus hosts already used in `sources.json` (osf.io, answersresearchjournal.org, biblehub.com, loc.gov, openbible.info, …).
- `view` must be `"full"`.

**Acceptance criteria:**

- Schema updated in `schema/source.schema.json`. The validator checks that each URL:
  - is well-formed `https:`,
  - has a hostname matching `host` and on the allow-list,
  - has no duplicates within a source,
  - has `view === "full"`,
  - and that `access: private-copy` sources have no `free_links`.
- Links are rendered on `/chronologies/` (per source, grouped by host, with edition labels) and in the record "Free sources" card (primary link plus "other free copies"). External links open with `rel="noopener"`.
- The PR lists every link added, with host, edition and the date it was opened. There must be no link you did not open and check: the title page and imprint must match the edition.
- Validate, build and verify pass.

**Files likely touched:** `schema/source.schema.json`, `data/sources.json`, `scripts/validate.mjs`, `site/build.mjs`, `site/src/styles.css`, `README.md`.

**Pitfalls:**

- Google Books IDs often point to a different printing. HathiTrust full view outside the US differs from inside it, so record US full view. Archive.org has reprints with modern copyright pages; for example, the Cornell Jasher scan is a 2000 Book Tree reprint, © 2000. Avoid those.
- Never add links for copyrighted works beyond the publisher's own free page (CFAH on ARJ and OSF, Jones Ministries). Never link private Drive or Proton copies.
- The KJV Gutenberg source is provenance-only (`superseded_for_links_by: blb-biblehub`). Do not add Scripture links other than BLB.
- Do not run a live link check inside `npm run validate`, which must work offline. If you want one, add an optional `scripts/check-links.mjs`.

---

## T3. Restate the project scope

**Goal:** everywhere the site or docs state the project's scope, restate it as **"a full timeline of the mighty works of God among the nations"**, drawn from the earliest sources possible. Kevin's instruction (2026-10-23): the scope wording must **not reference Solomon's Temple at all**, nor any temple as an endpoint or boundary.

**Current scope wording found by Chronos (re-grep to be sure: `rg -n -i "temple|scope|purpose|from creation|lede|description" README.md site docs`):**

- `site/build.mjs`, home page lede (around line 330). The current lede names a temple as the end point of the timeline; that endpoint must be removed entirely. It also omits the newer chronologies (Generations, Herodotus, Morecraft, Jordan compilation).
- `site/build.mjs`, home `<meta name="description">` (around line 358): "Young-Earth Creationist ancient history timeline sorted by CFAH."
- `site/build.mjs`, About page, first card (around line 583): framework paragraph, which has no scope sentence yet.
- `README.md` line 1 and intro ("Universal Ancient History Timeline Portal … static JSON data …"), and the layout block "events/*.json 15: Creation → Ark landing …", which is stale counts, not scope. Update the counts from the validate summary.
- `package.json` `description`.

**Draft wording (FOR KEVIN'S APPROVAL; mark it so in the PR):**

> *Lede:* "A timeline of the mighty works of God among the nations, beginning at Creation and drawn from the earliest sources available. Records are sorted by the Chronological Framework of Ancient History (CFAH), with Scripture as the infallible standard. Other chronologies (Ussher–Jones, Ussher, Jordan, Josephus, Herodotus, Raleigh, the Irish annals, and more) are shown side by side for comparison."
>
> *Meta description:* "A Young-Earth Creation timeline of the mighty works of God among the nations, drawn from the earliest sources and sorted by CFAH."
>
> *About page scope sentence:* "This portal aims to record the mighty works of God among all the nations, from Creation onward, using the earliest sources that can be read and cited."

This is still **draft wording**. Kevin gives final approval in the T3 PR.

**Acceptance criteria:**

- Every location above is updated, or explicitly left alone with a reason.
- The PR lists each location with its old and new text, and is labelled "wording needs Kevin's approval".
- No scope statement (site, README, `package.json`, docs) mentions Solomon's Temple or any temple as an endpoint. Check with `rg -n -i "temple" README.md package.json site/build.mjs site/src` and explain any remaining hit.
- Data and sort are unchanged. Validate, build and verify pass, and verify's text assertions are updated if they match the old lede.

**Files likely touched:** `site/build.mjs`, `README.md`, `package.json`, `site/verify.mjs` (if it asserts the text).

**Pitfalls:**

- Do not claim the timeline is complete or "full" today. The wording should describe the aim. Keep the reverent, precise tone.
- This is a wording change only. Records *about* the Temple (for example its dedication) stay as they are; only the scope statements change.

---

## T4. Reigns, dynasties and epochs as transparent spans

**Goal:** on every timeline, draw reigns, dynasties and epochs as **semi-transparent range bars** from start to end. Point events stay points.

**Where:**

- The home timeline (`site/src/app.js`, which currently builds every item as `type: 'point'`).
- Person timelines (the same `app.js` path and `site/build.mjs` person-timeline data).
- `/king-lists/`. It is currently tables only, so add a span timeline for lists whose rows have printed start *and* end BC years.

**Data available:**

- Person `dates.reign[]` entries with `year_bc_ad` and `year_bc_ad_end` (display-only).
- CFAH epochs and dynasty rows (`scripts/cfah/kings.mjs` `EPOCHS`).
- `data/king-lists.json` rows with printed BC ranges.

**Design:**

- Use vis-timeline `type: 'range'` or `'background'` with CSS opacity of about 0.25–0.35 and a visible border.
- Use a pattern or label cue as well as colour.
- Group spans into their own rows ("Reigns", "Dynasties", "Epochs").
- Each span links to its person, event or king-list anchor.
- Add a legend entry, and an ordered list fallback with start and end years for keyboard and screen-reader users.
- A span appears only when **both ends are printed in the source**. Where only a start or a length is printed, show a point at the start, and put the length in the tooltip or list text. Never compute an end.
- Where a source disagrees with itself, use the printed start only, for example I17, Rameses II "644 | 678". This is the existing rule.
- **Person timelines keep the solid/faded rule.** The person's own reign is solid, though translucent as a span. Other reigns and dynasties overlapping the lifespan are faded context.

**Acceptance criteria:**

- Spans render in Chromium and WebKit at 1024, 1440 and 390 px.
- Extend `site/verify-timelines.mjs` (and `site/verify.mjs` for the home and king-lists pages). Assert that:
  - range items exist,
  - their computed opacity is below 1,
  - their start and end match the data,
  - point items are unchanged,
  - the item count equals own + context + spans,
  - the legend shows the span swatch.
- Existing person-timeline checks still pass.
- No sort change. The BC axis still has no year 0: spans crossing 1 BC to AD 1 use the existing axis mapping.

**Files likely touched:** `site/src/app.js`, `site/src/styles.css`, `site/build.mjs`, `site/verify.mjs`, `site/verify-timelines.mjs`, possibly `schema/person.schema.json` (no change expected).

**Pitfalls:**

- Very long spans, such as epochs of 1,000+ years, can swamp the view. Put them in their own collapsed or low-height group.
- `year_bc_ad_end` is sometimes used for split years like 2348/2347. Those are not reigns, so only draw spans from `dates.reign`, epochs and dynasty rows, never from split-year events.
- Keep the vendored vis-timeline and do not add a CDN. Keep asset versioning.

### T4b. Book of Jasher: antediluvian reign lengths (display-only)

**Edition (settled 2026-10-23, Q-J1 closed):** the **1840 English translation of *Sefer haYashar***, *The Book of Jasher … Faithfully Translated from the Original Hebrew into English* (New York: M. M. Noah & A. S. Gould, 1840). It is not the 1751 "Pseudo-Jasher" (Jacob Ilive's "Alcuin" forgery).

**Kevin's reading copy:** Kevin owns Ken Johnson, *Ancient Book of Jasher: A New Annotated Edition* (Bibliofacts Ministries / CreateSpace, 2008; ISBN 9781438266756). Johnson's introduction says it reprints the 1840 English translation, adds AM dates to most chapters, timeline tables (Appendix A), a discrepancy analysis (Appendix B), and moves the 1840 prefaces to Appendix C. The edition is **copyrighted** ("Copyright Ken Johnson"). So:

- The **public-domain 1840 scan is the only quotable and linkable source.** Use the Princeton copy, https://archive.org/details/bookofjasherrefe00sefe (preferred).
- Johnson's edition may be used **only as Kevin's reading copy** to locate passages and chapter:verse references.
- **Nothing from Johnson's edition may be quoted or committed:** not his notes, headings, chapter AM dates, timeline tables, appendices or introduction. His AM dates are his own calculations, not Jasher's text, and must never be entered as Jasher figures.
- Every reign length is cited by **Jasher chapter:verse and the 1840 page**, and matched word for word against the 1840 scan before entry.
- If Johnson's chapter or verse numbering differs from the 1840 scan, cite the 1840 numbering and **flag the difference in the PR** (passage, Johnson's reference, 1840 reference).

**Verified free copies of the 1840 edition** (opened by Chronos on 2026-10-22; Grok Build must re-check the title page and imprint):

- Internet Archive, Princeton Theological Seminary copy: https://archive.org/details/bookofjasherrefe00sefe. The catalogue gives "New York : Noah and Gould", 1840, xxiii, 267 p. This is the recommended primary.
- Internet Archive, University of Toronto (Robarts) copy: https://archive.org/details/thebookofjasherr00unknuoft. The catalogue gives "New York : Noah", 1840, 267 p.
- **Avoid:** https://archive.org/details/cu31924088174754. Although catalogued as 1840, the scan is the 2000 Book Tree reprint, © 2000, with ISBN 1-58509-081-6 printed in it.
- sacred-texts.com has a transcription labelled "1887 Edition" (https://sacred-texts.com/chr/apo/jasher/index.htm). That is a later reprint of the same translation. Use it only as an alt link, and cite pages from the 1840 scan.

**Rules:**

- Add `jasher` as a **non-canonical, display-only** secondary chronology. Its label must say "non-canonical (Sefer haYashar, 1840 tr.)".
- It never sets the sort. **Scripture governs.**
- Import only **reign lengths or regnal statements the text itself states**, with chapter, verse and the 1840 page. Never compute BC years. Record AM figures only if the text gives them; do not convert them.
- Compare each figure with the Genesis 5 genealogy (the MT ages already on the records). Flag every conflict as CONFLICT in `data/jasher-dates-extract.md` and in a new open-questions section.
- Put reign lengths in the person's `dates.reign` slot. Draw them as T4 spans only if the text prints both ends, which is unlikely; otherwise show a point with the length.

---

## T5. Standby placement for records with no tier date

**Approved by Kevin on 2026-10-27.** This is a placement, not a sort tier.

**Goal:** people with tier `none` (`sorting_year` null) are absent from the home timeline and from every person page's context timeline. Give each record that still has no tier date an optional `standby` placement so it can be drawn, without ever writing `sorting_year` or `sorting_basis`.

**Rule:** Records with no tier date get a standby placement (source-printed BC/AD year, else the linked record's year); it never sets sort; it is replaced automatically when a tier date arrives.

**Order inside `scripts/standby/compute.mjs`** (idempotent; run after every other importer, including `scripts/cfah/import.mjs`):

1. **source-printed.** A `year_bc_ad` a chronology already stores on birth, death, lifespan, or reign. The first chronology by `sort_priority` wins. Anno Mundi, regnal lengths, and Julian Period figures are not converted.
2. **linked-record.** Otherwise the `sorting_year` of a linked event of that person's own life, else the nearest preceding dated ruler in the same `data/king-lists.json` list, else a parent or child. The year is copied as-is. `from_record` names that record. The note says no reign length or age was added or subtracted.
3. Otherwise no standby. The record stays on the Undated list.

When `sorting_year` is set, the script removes `standby`. The validator rejects a record that has both, checks `from_record` and source-printed years, and prints counts by basis plus the fully undated count.

**Site:** standby records use a dashed grey treatment, not a tier colour. The home timeline and person timelines hide them until “Standby (no tier date)” is turned on. The control is off by default. Tooltips say “standby placement” and name the source, or “placed with” the linked record. Person pages for standby people get a window from that year and a note that it is not a sort year. The Undated list keeps only records with no standby. In a sorted list, tiered records come before standby records in the same year.

**Acceptance criteria:**

- `npm run validate`, `build`, and `verify` pass.
- Tier counts in the validate summary are unchanged. No `sorting_year` changes. The diff of `sorting_year` and `tier` against `origin/main` is empty.
- The PR lists standby counts by basis and at least 10 records for spot-checking.

---

## Kevin's answers (2026-10-23)

- **Q-M1, Mac Mini clone:** `/Users/kevinamundson/GitHub/chronos-timeline` (use an existing clone there if present). Answered.
- **Q-J1, Jasher edition:** the 1840 Noah/Gould translation. Kevin reads Ken Johnson's 2008 annotated edition of it; see T4b for the rules. Answered.
- **Q-S1, scope wording:** must not reference Solomon's Temple at all. Draft rewritten in T3; **final approval still due in the T3 PR.**
- **Q-T1, order:** roadmap sprint order confirmed (Cory, then Hales, …). "Einstein" = Alfred Edersheim. Answered.
- **Q-T2, `free_links` and `tradition` fields:** **deferred.** Kevin will return to this; T2 is on hold.
- **Q-P1, branch protection:** yes. `main` requires a pull request; force-pushes and deletion are blocked.
