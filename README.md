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
                        raleigh-history-of-the-world
  sources.json          free texts with verified URLs (KJV, Ussher 1658, Josephus/Whiston,
                        Clonmacnoise 1896, Raleigh 1736, OpenBible geo, CFAH papers,
                        F. N. Jones Chart 1 + Chronology of the OT 15th ed.,
                        J. B. Jordan Biblical Chronology issues: biblicalhorizons.com / garynorth.com)
  jordan-dates-extract.md  backlog: Jordan's dates by event + per-issue index of date figures, with URLs
  events/*.json         15: Creation → Ark landing, plus the CFAH anchors (divisions, Babel,
                        Dispersion, Abraham, Joseph, Exodus, Temple)
  people/*.json         19: Adam → Noah's sons, Peleg, Nimrod, Abraham, Joseph, Moses, Solomon
  locations/*.json      9: Eden, Ararat, Babel, Shinar, Canaan, Egypt, Jerusalem,
                        Mount Moriah, Red Sea crossing (uncertain)
  maps/*.json           6: OpenBible Genesis KML + 5 Library of Congress historic maps
                        (thumbnail, IIIF Image API info.json, LoC manifest URL)
docs/
  cfah-anchors.md       proposed CFAH anchor events with exact paper citations
  open-questions.md
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
- **Secondary display chronologies**: `jordan` (James B. Jordan, *Biblical Chronology* newsletter, 1989-1997), `bible`, `masoretic-genealogy`, `josephus`, Clonmacnoise and Raleigh are shown next to the sort tiers but never set `sorting_year`; the validator rejects any `sorting_basis` that points at `jordan`. Jordan's B.C. years are his "SBC" (strictest Biblical chronology), which runs about 74-75 years later than Ussher's (Creation 3930 B.C.), while his Anno Mundi figures mostly match Ussher's. `data/jordan-dates-extract.md` is the backlog: a curated table of Jordan's dates by event, plus a per-issue index of every date figure (a few words of context each, with the article URL; no full-text excerpts).
  If no tier gives a year, an event uses `tier: "derived"`, copying `sorting_year` from the record named in `derived_from`, and a person uses `tier: "none"` with `sorting_year: null`.
  `sort_order_within_year` breaks ties.
- **Scripture refs** use OSIS style (`Gen.5.3`, `Gen.1.1-Gen.2.3`).
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
- `/events/<id>/`, `/people/<id>/`, `/locations/<id>/`, `/maps/<id>/`: description, Scripture refs (KJV links), the chronologies
  table (CFAH anchor point → CFAH-1 Table 1 → Ussher–Jones → Ussher → Jordan → Bible → MT arithmetic → Josephus → Raleigh → Clonmacnoise), the sort
  year with its tier label and note, the row that sets the sort highlighted, "differs from sort year" badges, a *Disagreements & open questions*
  panel (generated only from figures already in the data, plus `open_questions`), OpenBible links (CC BY 4.0 credit), LoC map thumbnails
  linking to the item, IIIF manifest and image, and free source links.
- `/browse/`, `/chronologies/` (sorting rule, every chronology, all sources), `/about/` (framework + credits), `/search/`, `404.html`.

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
```

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
- Scripture references link to the KJV on BibleGateway (free, verse-level). The data's KJV source (Project Gutenberg) has no verse anchors.

## License

- **Code** (`scripts/`, `site/`, `schema/`): MIT License, see [`LICENSE`](LICENSE).
- **Data** (`data/`, `docs/`): the compilation, structure, notes and commentary are licensed
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Please credit "Universal Ancient History Timeline Portal (Kevin R. Amundson)".
- **Third-party material keeps its own terms and must be credited:**
  - Place identifications and coordinates from [OpenBible.info](https://www.openbible.info/geo/), CC BY 4.0.
  - Historic maps are linked from the [Library of Congress](https://www.loc.gov/maps/), "free to use and reuse" per each item's rights statement.
  - Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
  - Dates and short quotations from copyrighted works are cited for reference under fair use. These works are the CFAH papers
    (Griffith & White, © Answers in Genesis), Floyd Nolen Jones, and James B. Jordan's *Biblical Chronology*. The works themselves are linked,
    not reproduced, and are **not** covered by this repository's licences.
  - Public-domain texts (KJV, Ussher 1658, Whiston's Josephus, Clonmacnoise 1896, Raleigh 1736) are linked to free copies.
- Bundled libraries in the built site keep their licences: vis-timeline (Apache-2.0/MIT), Leaflet (BSD-2-Clause), Pagefind (MIT).
