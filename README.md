# Universal Ancient History Timeline Portal

These are static JSON data, JSON Schemas and docs for a JAMstack timeline. The data uses a Young Earth Creation framework with the Bible as the infallible standard.
**CFAH** (*Chronological Framework of Ancient History*, Kenneth C. Griffith & Darrell K. White, *Answers Research Journal* 2022–) is the
primary sorting chronology.

```
schema/                 JSON Schema draft 2020-12
  common.schema.json    shared defs: slug, OSIS ref, chronology entry, base record
  event / person / location / map .schema.json
  chronology.schema.json  (validates data/chronologies.json)
  source.schema.json      (validates data/sources.json)
data/
  chronologies.json     sorting_rule + cfah (primary), ussher-jones, ussher, jordan (secondary), bible,
                        masoretic-genealogy, josephus, annals-of-clonmacnoise,
                        raleigh-history-of-the-world, cory (secondary display)
  sources.json          free texts with verified URLs (Berean Literal Bible on BibleHub for all
                        Scripture links; KJV kept for provenance only; Ussher 1658, Josephus/Whiston,
                        Clonmacnoise 1896, Raleigh 1736, OpenBible geo, CFAH papers,
                        F. N. Jones Chart 1 + Chronology of the OT 15th ed.,
                        J. B. Jordan Biblical Chronology issues: biblicalhorizons.com / garynorth.com)
  jordan-dates-extract.md  backlog: Jordan's dates by event + every dated statement by issue, with URLs
  events/*.json         15: Creation → Ark landing, plus the CFAH anchors (divisions, Babel,
                        Dispersion, Abraham, Joseph, Exodus, Temple)
  people/*.json         19: Adam → Noah's sons, Peleg, Nimrod, Abraham, Joseph, Moses, Solomon
  locations/*.json      9: Eden, Ararat, Babel, Shinar, Canaan, Egypt, Jerusalem,
                        Mount Moriah, Red Sea crossing (uncertain)
  maps/*.json           6: OpenBible Genesis KML + 5 Library of Congress historic maps
                        (thumbnail, IIIF Image API info.json, LoC manifest URL)
sources/
  jordan/               full texts of James B. Jordan, Biblical Chronology (93 issues, 1989-1997), one Markdown
                        file per issue + README index; © James B. Jordan, included with the owner's stated permission;
                        books/ = full texts of 7 Jordan books (C&C symposia: Jordan's essays only) and Studies in Biblical Chronology Nos. 2-3
docs/
  cfah-anchors.md       proposed CFAH anchor events with exact paper citations
  open-questions.md
  GROK-BUILD-SETUP.md    Mac Mini setup for Grok Build; GROK-BUILD-TASKS.md = task backlog;
  REVIEW-CHECKLIST.md    Chronos's PR review checklist; roadmap-pd-sources.md = Kevin's PD-sources roadmap
AGENTS.md               standing rules for Grok Build (and any coding agent); only Kevin merges to main
scripts/validate.mjs    schema + cross-reference + 4-tier sorting + MT Genesis 5 checks
site/                   static website (MVP); data/ stays the single source of truth
  build.mjs             zero-dependency Node generator: reads data/, writes site/dist/
  src/                  styles.css (HIG-style, light/dark), app.js (timeline + maps), search.js, favicon.svg
  serve.mjs             tiny local preview server (not used in production)
  verify.mjs            headless Chromium (Playwright) checks + screenshots
  screenshots/          output of verify.mjs
  dist/                 build output (git-ignored)
```

## Key conventions
- **id** is a kebab-case slug that matches the file name. `related`, `people`, `locations`, `maps`, `father` and `children` hold ids.
- **Multi-chronology dates**: each event's `chronologies` (and each person's `dates.birth|death|translated`) is an array of
  `{source, date, year_am, year_bc_ad, year_bc_ad_end?, precision, citation, link, note, source_text_id?}`.
  `source` is a chronology id. A `cfah` entry is required on every record. If CFAH has no date for it, `date` is null and the note says
  `pending CFAH reference`. Any non-null date must have a citation.
- **Years**: `year_bc_ad` is a historical year number where negative means BC and there is no year 0, so 2348/2347 BC is stored as `-2348` with end `-2347`.
- **CFAH basis**: every dated `cfah` entry has `cfah_basis` set to either `anchor_point` or `table1_baseline`. `anchor_point` is a date the CFAH papers derive themselves, such as CFAH-4 AP-29 or AP-30. `table1_baseline` is CFAH-1 Table 1, the Ussher-Jones biblical baseline the authors adopt. One `cfah` chronology id is kept, so the rule "every record has a cfah entry" still holds.
- **sorting_year**: this is a four-tier fallback, also defined in `data/chronologies.json` → `sorting_rule` and enforced by the validator. It uses the year from the first tier that has a non-null `year_bc_ad`:
  1. `cfah-anchor`: cfah entry with `cfah_basis: anchor_point`
  2. `cfah-table1`: cfah entry with `cfah_basis: table1_baseline`
  3. `ussher-jones`: Floyd Nolen Jones (only years he prints himself; AM-only figures are never converted)
  4. `ussher`: Ussher's *Annals*

  Events take this from `chronologies[]` and people from `dates.birth[]`. `sorting_basis` records `{tier, tier_rank, chronology, note}`.
- **Secondary display chronologies**: `jordan` (James B. Jordan, *Biblical Chronology* newsletter, 1989-1997), `bible`, `masoretic-genealogy`, `josephus`, Clonmacnoise and Raleigh are shown next to the sort tiers but never set `sorting_year`; the validator rejects any `sorting_basis` that points at `jordan`. Jordan's B.C. years are his "SBC" (strictest Biblical chronology), which runs about 74-75 years later than Ussher's (Creation 3930 B.C.), while his Anno Mundi figures mostly match Ussher's. `data/jordan-dates-extract.md` lists every dated statement in the two Jordan sources as a backlog. The full texts of the 93 issues read are in `sources/jordan/`.
  If no tier gives a year, an event uses `tier: "derived"`, copying `sorting_year` from the record named in `derived_from`, and a person uses `tier: "none"` with `sorting_year: null`.
  `sort_order_within_year` breaks ties.
- **Standby placement** (not a sort year): a record with `sorting_year: null` may carry `standby`. Records with no tier date get a standby placement (source-printed BC/AD year, else the linked record's year); it never sets sort; it is replaced automatically when a tier date arrives. The object is `{year_bc_ad, basis, source_chronology, from_record, note}`. `basis` is `source-printed` (a `year_bc_ad` a chronology already stores on birth, death, lifespan, or reign; the first chronology by `sort_priority`) or `linked-record` (the `sorting_year` of a linked event of that person's life, else the nearest preceding dated ruler in the same king list, else a parent or child). Anno Mundi, regnal lengths, and Julian Period figures are never converted. The site draws these placements only when “Standby (no tier date)” is on. Run `node scripts/standby/compute.mjs` after the other importers, and after `node scripts/cfah/import.mjs`.
- **Generations curriculum** (`generations`, secondary): the dates come from five Generations textbooks by Kevin Swanson and Joshua Schwisow (see `data/sources.json`, `generations-*`). Each entry cites the book, chapter and PDF page, and links to the PDF on Generations' public S3 bucket. The books are copyrighted: the PDFs and their extracted text stay in `/workspace/generations-src/`, outside the repo and gitignored. Only dates, short notes in our own words and citations are kept here.
  - Records that no sort tier reaches (mostly AD missions and church history) use `tier: "provisional"`: the sort is the first Generations date, shown with a "Provisional" badge. The validator forbids this tier whenever a tier 1–4 year exists. This is pending the owner's decision (open question A8).
  - Curated per-book rows are in `scripts/generations/<book>.mjs`. Run `node scripts/generations/import.mjs` to apply them; it is idempotent and rewrites `data/generations-dates-extract.md`.
- **Herodotus** (`herodotus`, secondary): statements from *The Histories* in George Rawlinson's translation, recorded exactly as Herodotus words them, with Book.chapter and the page of the Roman Roads Media etext (2013) that CFAH cites. That PDF is a private copy kept outside the repo. Each entry links to the same words in the public-domain [Wikisource text](https://en.wikisource.org/wiki/The_History_of_Herodotus_(Rawlinson)). Entries carry no BC year: a year worked out from a CFAH anchor and Herodotus's figures appears only in the note, marked DERIVED. The validator forbids Herodotus from setting a sort. Reign lengths go in a person's `dates.reign` slot. Run `node scripts/herodotus/check-source.mjs` to check every quote and page against the PDF (it is skipped when the PDF is absent), then `node scripts/herodotus/import.mjs`. The output is `data/herodotus-dates-extract.md`.
- **Morecraft** (`morecraft`, secondary): dates printed in Joe Morecraft III, *A Christian Survey of World History from Creation to the Reformation* (no publisher, year or edition is printed in the copy read). The book is copyrighted and the scan is a private copy kept outside the repo, so only the dates as printed, the printed and PDF page, and short notes in our own words are recorded; entries link to a public [listing of the book](https://heritagepresbyterianchurch.com/product/a-christian-survey-of-world-history-from-creation-to-the-reformation/). Morecraft never changes the sort of a record that any tier 1–4 chronology or Generations dates. Records that only Morecraft dates (created by its import) sort provisionally by his year, and the validator enforces both rules. Run `node scripts/morecraft/check-source.mjs` (checks every statement and year against two OCR passes of the scan; skipped without it), then `node scripts/morecraft/import.mjs`. The output is `data/morecraft-dates-extract.md`.
- **Cory** (`cory`, secondary): statements from Isaac Preston Cory, *Ancient Fragments* (London: Reeves & Turner, 1876, ed. E. Richmond Hodges), quoted as printed, with the printed page and the fragment chain. The copy read is the University of Toronto scan on the Internet Archive, item `corysancientfrag00coryuoft`. Pass 1 (2026-10-23) reads the Tyrian Annals (pp. 28–32), Berossus's antediluvian kings (pp. 51–54 and p. 60) and the Chaldean and Assyrian lists (pp. 85–92). Pass 2 (2026-10-27) adds Manetho's dynasties (pp. 111–125), Josephus's quotation of Manetho (pp. 126–135), the Old Egyptian Chronicle (pp. 136–137), Eratosthenes' Theban kings (pp. 138–141), Diodorus's Egyptian canon (pp. 199–203), the editor's Africanus table (pp. 98–100) and the other dated fragments in the volume. Entries carry no BC year and no stored Anno Mundi: a year of the world stays inside the quotation, and it is not converted. A product worked from the text's own definitions of sarus, neros and sossus appears only in the note, marked DERIVED. A sum we add is marked as our check, not as the book's figure. A parenthetical "(b.c. 878)" stays inside the quotation. The validator forbids Cory from setting a sort. Reign lengths go in a person's `dates.reign` slot. A birth or a death that the text names as such goes in that slot, still with a null year. Run `node scripts/cory/import.mjs`. The output is `data/cory-dates-extract.md`.
- **Shuckford** (`shuckford`, secondary): volume 1 of Samuel Shuckford, *The Sacred and Profane History of the World Connected*, fifth edition, revised by James Creighton (London: William Baynes, 1819). The copy read is a Tolle Lege facsimile of that edition. Links go to the Princeton Theological Seminary scan, Internet Archive item `sacredprofanehis01shuc`, opened 2026-10-24. He counts by the year of the world. `year_am` is that printed Anno Mundi. `year_bc_ad` is set only when the page prints “before Christ” or “before our Saviour”. Anno Mundi is not converted to BC. A year worked by subtraction is labelled DERIVED in the note and is not stored. The validator forbids Shuckford from setting a sort. People this import creates are tier `none`. Run `node scripts/shuckford/import.mjs`. The output is `data/shuckford-dates-extract.md`. Volumes 2–4 are not in this pass.
- **Scripture refs** use OSIS style (`Gen.5.3`, `Gen.1.1-Gen.2.3`).
- **Name forms** (`data/name-forms.json`): each person page has a Name section. A form is stored only when its letters were read in the cited witness. Biblical Hebrew, Aramaic and Greek letters come from STEPBible TIPNR (CC BY 4.0), and only for a verse the person record already cites. History spellings are letters already printed in a Raleigh, Josephus, Herodotus, Ussher, Clonmacnoise or Cory passage on that person. An `alt_names` spelling with no such passage is shown as “written source not yet attached.” No inscription is entered until one has been read. Rebuild with `node scripts/names/build-forms.mjs` (the TIPNR file stays outside the repo; set `TIPNR` or use `/tmp/tipnr.txt`).
- **Locations** carry `lat`/`lng` (null if unknown), `certainty`, `openbible_id` and `openbible_url` (verified pages on openbible.info/geo).
- No date, URL or citation is entered unless it was read in the source. See `docs/open-questions.md`.

## Validate
```
npm install
npm run validate      # node scripts/validate.mjs
```

## Website (MVP)

**Stack (all open source, $0/month):** a plain Node build script (no framework, no Vite), [vis-timeline](https://visjs.org/) for the
zoomable timeline, [Leaflet](https://leafletjs.com/) + OpenStreetMap tiles for maps, [Pagefind](https://pagefind.app/) for static
search built at build time. No server, database, CMS or paid service. Vendor JS/CSS is copied from `node_modules` into `dist/assets/vendor/`
(self-hosted, no CDN).

**Pages generated**
- `/`: timeline (events + people by birth, sorted by `sorting_year`, coloured by sort tier), map of places with coordinates
  (marker colour = OpenBible certainty; places with null coordinates are listed as "not mapped"), and an ordered text list of events
  (the keyboard and screen-reader alternative to the timeline).
- `/events/<id>/`, `/people/<id>/`, `/locations/<id>/`, `/maps/<id>/`: description, Scripture refs (Berean Literal Bible links), the chronologies
  table (CFAH anchor point → CFAH-1 Table 1 → Ussher–Jones → Ussher → Jordan → Bible → MT arithmetic → Josephus → Raleigh → Clonmacnoise), the sort
  year with its tier label and note, the row that sets the sort highlighted, "differs from sort year" badges, a *Disagreements & open questions*
  panel (generated only from figures already in the data, plus `open_questions`), OpenBible links (CC BY 4.0 credit), LoC map thumbnails
  linking to the item, IIIF manifest and image, and free source links.
- **Person timelines** (`/people/<id>/`): a vis-timeline whose window is the person's lifespan. Birth and death years each follow the same
  four-tier rule (CFAH AP → CFAH-1 Table 1 → Ussher–Jones → Ussher); `translated` stands in for death (Enoch). If the death year is unknown the
  window ends at the last linked event, and if the birth year is unknown it starts at the first; the page says so. Events listing the person
  in `people` (or in the person's `events`), plus birth/death markers, are solid. Every other event whose `sorting_year` falls in the window
  is shown as context: faded, dashed, italic, marked "(context)", in its own row. Items are real links (Tab + Enter), and an ordered list below
  repeats them. Per-person counts are written to `dist/data/person-timelines.json`.
- `/browse/`, `/chronologies/` (sorting rule, every chronology, all sources, and Raleigh's chronological table), `/about/` (framework + credits), `/search/`, `404.html`.

**BC years on the timeline.** Data years are historical (negative = BC, no year 0). JavaScript dates need a continuous axis, so `app.js`
maps BC year *y* to axis year *y* and AD year *y* to *y − 1*, and the axis labels convert back ("4500 BC"). Round ticks therefore read as round
BC years and no year 0 is ever shown. AM figures are shown per record exactly as each chronology gives them; the build never converts between
AM and BC.

### Build and preview locally
```
npm install
npm run build      # validate data → node site/build.mjs → pagefind --site site/dist
npm run preview    # http://localhost:8788
```

### Verify (optional, dev only)
```
npx playwright install chromium   # one time
npm run verify     # serves dist, checks pages, timeline, map, search; writes site/screenshots/*.png
npm run verify:live   # person-timeline checks (Chromium + WebKit) against https://chronos.kevinamundson.me, live screenshots
```
`site/verify-timelines.mjs` loads Joseph, Abraham, Noah, Moses and a one-event person in Chromium **and WebKit** at 1024/1440/390 px,
each in a fresh (empty-cache) context. It asserts the chart is drawn (> 100 px tall), the rendered items equal own + context, every dot and
label sits inside the chart, own items are solid and context items faded, the legend swatches are visible, and all `/assets/` URLs are
versioned. Locally it repeats every load with the vis-timeline CSS delayed by 1.5 s.

**Caching.** The build appends `?v=<sha256 prefix>` to every `/assets/…` URL in the HTML, and `_headers` caches `/assets/*` for a year
(immutable). HTML is `max-age=0`, so a browser never pairs new HTML with an old cached `app.js`/`styles.css`. `/pagefind/*` is revalidated.

### Deploy to Cloudflare Pages (free plan)
Connect the Git repository in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git) with:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `site/dist` |
| Root directory | `/` (repository root) |
| Environment variable | `NODE_VERSION=20` (also pinned in `.node-version`) |

Every push to the production branch rebuilds the site; other branches get free preview URLs. A `_headers` file with basic security and
cache headers is emitted into `dist/`. Alternative without Git: `npx wrangler pages deploy site/dist` (needs a Cloudflare login).
Cost: $0/month on the free plan (500 builds/month, unlimited static requests). A custom domain is optional (~$10/year if newly registered;
a subdomain of an existing domain is free).

### Attribution and third-party services
- Map tiles are loaded from `tile.openstreetmap.org` with the required "© OpenStreetMap contributors" credit. The OSM tile policy is for
  light use; if traffic grows, switch the tile URL in `site/src/app.js` to another free/self-hosted provider.
- OpenBible.info geodata is CC BY 4.0, credited in the map attribution, footer, About page and every place page.
- LoC thumbnails are hot-linked from `tile.loc.gov` (free to use and reuse, per each map record's `license_note`).
- CFAH papers and F. N. Jones materials are cited and linked, never copied.
- **Scripture links use the Berean Literal Bible (BLB) on BibleHub only** (source `blb-biblehub`; the BLB is public domain since
  30 April 2023). Pattern: `https://biblehub.com/blb/<slug>/<chapter>.htm`, plus `#<verse>` for a verse; the BLB chapter pages carry verse
  anchors, and BibleHub has no BLB-only verse page (`/blb/genesis/5-3.htm` is 404; `/genesis/5-3.htm` is a parallel page of many versions).
  A range links its first chapter/verse and the full reference text is kept. Slugs follow BibleHub (`1_kings`, `songs` for Song of
  Solomon, `psalms`, `1_john`); all 66 were checked live. `scripts/blb.mjs` builds every link (OSIS `scripture_refs` on pages, citations in
  chronology rows, `free_source_links`); `scripts/validate.mjs` rejects any other Scripture link (KJV/Gutenberg, BibleGateway, other
  BibleHub versions, etc.) and any BLB link with an unknown book or chapter. `scripts/blb-migrate.mjs` is the one-off, idempotent rewrite of
  existing data. The KJV (Project Gutenberg #10) stays in `sources.json` marked `superseded_for_links_by: blb-biblehub`. It is kept only
  as provenance (`source_text_id`), because the Genesis 5/11 figures were first read from its full-text download.

## License

- **Code** (`scripts/`, `site/`, `schema/`): MIT License, see [`LICENSE`](LICENSE).
- **Data** (`data/`, `docs/`): the compilation, structure, notes and commentary are licensed
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Please credit "Universal Ancient History Timeline Portal (Kevin R. Amundson)".
- **Third-party material keeps its own terms and must be credited:**
  - Place identifications and coordinates from [OpenBible.info](https://www.openbible.info/geo/), CC BY 4.0.
  - Historic maps are linked from the [Library of Congress](https://www.loc.gov/maps/), "free to use and reuse" per each item's rights statement.
  - Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
  - **James B. Jordan, *Biblical Chronology* (1989–1997):** the full texts in `sources/jordan/` (and the excerpts in
    `data/jordan-dates-extract.md`) are included with the repository owner's stated permission. They remain **© James B. Jordan** and
    are **not** covered by this repository's MIT or CC BY 4.0 licences. Do not reuse them without the copyright holder's permission.
  - **CFAH papers** (Griffith & White, *Answers Research Journal*, © Answers in Genesis) and **Floyd Nolen Jones** materials are not
    reproduced. Records cite them by paper and section, with only short quotations of dates and section headings, and link to the free
    originals. They are **not** covered by this repository's licences.
  - Public-domain texts (BLB on BibleHub for Scripture; Ussher 1658, Whiston's Josephus, Clonmacnoise 1896, Raleigh 1736) are linked to free copies.
- Bundled libraries in the built site keep their licences: vis-timeline (Apache-2.0/MIT), Leaflet (BSD-2-Clause), Pagefind (MIT).
