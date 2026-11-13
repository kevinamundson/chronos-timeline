# AGENTS.md: standing rules for Grok Build (Chronos timeline portal)

Grok Build loads this file automatically at the start of every session in this repo. These rules apply to every task. Where a task brief conflicts with them, the rules win: stop and ask Kevin through the PR.

The rules also apply to any other coding agent working here. Grok Build is the builder, Chronos (Kevin's Grok Bot agent) is the reviewer, and **Kevin R. Amundson approves every merge**.

## 1. What this project is

- **What it is:** the Universal Ancient History Timeline Portal, https://chronos.kevinamundson.me. It is a static JAMstack site built from JSON data in `data/`.
- **Framework:** Young Earth Creation. **The Bible is the infallible standard.** That means the Masoretic Text, with no gaps in Genesis 5 and 11. Scripture governs every other source.
- **Primary sorting chronology:** CFAH, the *Chronological Framework of Ancient History* by Kenneth C. Griffith & Darrell K. White (*Answers Research Journal* CFAH-1 to 6, plus the OSF preprints at https://osf.io/prhfz/).
- **Tone in data, notes and UI text:** precise, scholarly, transparent, reverent toward Scripture. Never sensational, and never mocking any source.
- **Scope:** a full timeline of the mighty works of God among the nations, drawn from the earliest sources possible. Scope statements must not name any temple, including Solomon's Temple, as an endpoint or boundary. The site wording is draft until Kevin approves it in the T3 PR; see task T3 in `docs/GROK-BUILD-TASKS.md`.
- **Mac Mini clone:** `/Users/kevinamundson/GitHub/chronos-timeline`. If a clone already exists there, use it; do not make a second clone.

## 2. Workflow (non-negotiable)

1. **Never push to `main`. Never force-push.** Never merge a PR, never rewrite published history, never delete branches you did not create.
2. **Branches:**
   - Work only on a feature branch named `gb/<task-slug>`, for example `gb/t1-cory`, cut from an up-to-date `origin/main`.
   - Use one task, or one source, per branch and PR.
   - `main` is protected on GitHub: changes reach it only through a pull request, and force-pushes and deletion of `main` are blocked.
3. **Before every push,** run `npm run validate`, `npm run build` and `npm run verify`. All three must pass. Fix the cause of a failure; never weaken a validator rule to make data pass.
4. **Commits:** small, logical, with messages that say what and why (for example "T1 Cory: add sources.json entry + validator rule").
5. **PR:** push the branch and open a **draft PR** against `main` using `.github/pull_request_template.md`, with every section filled in. If you cannot open the PR (`gh` not authenticated), leave the branch pushed and put the filled-in template in the body of the branch's last commit message. Chronos will open the PR from it.
6. **Review:** Chronos reviews the PR against `docs/REVIEW-CHECKLIST.md` and reports to Kevin. Only Kevin approves and merges. A merge to `main` deploys to production automatically on Cloudflare Pages.
7. **Contact and spending:**
   - Do not contact anyone: no email, no issues or comments on other people's repos, and no messages to authors or publishers.
   - Do not sign up for services.
   - Do not create API tokens, and do not read or print credentials.
8. **Cost** is $0–5 a month in total. Hosting must stay free and static: Cloudflare Pages free plan, no server, no database, no paid API or CDN. Add a new npm dependency only if it is free, open-source and justified in the PR.
9. **Build quota:** each push to a `gb/*` branch triggers a Cloudflare preview build, and the free plan allows 500 builds a month. Push in batches, not after every commit.

## 3. Data integrity: the cardinal rule

**Never invent a date, event, person, place, URL, page number or citation.** Every date must be read in the cited source. Each date carries:

- the **edition** (publisher, year, translator or editor),
- the **page, chapter or section** as printed (and the PDF page, if different),
- a **link** you have opened and confirmed shows that edition.

Further rules:

- Record dates **as printed**. Do not convert AM to BC, or reign lengths to BC years, unless the source itself does. A year you work out yourself goes only in the `note`, labelled `DERIVED`, with the arithmetic and its anchor, unless it is the calculated gap-fill below. The display text for Raleigh's yeere of the World (Kevin, 28 Oct 2026) is `AM` and an italic BC or AD year, computed in `scripts/raleigh/derived-year.mjs` from Creation in 4032 BC. Kevin kept 4032 on 2026-10-28 (G11). The Julian Period column implies 4031 BC; that reading is not the formula. The italic year is not written into `year_bc_ad`. It does not set a standby placement, a span, or a tier 1–4 year. Kevin's ruling of 2026-11-08 (N22): the same formula, and any other arithmetic on figures the repo already prints, may fill `sorting_year` only when no tier 1–4 year and no provisional year exist. Store that year on the person in `calculated`, with the source, citation, and arithmetic. Do not write it into `year_bc_ad`. A printed or provisional year replaces it. The catalog is `scripts/calculated/catalog.mjs`. `node scripts/calculated/apply.mjs` writes the field and `docs/calculated-dates.md`. The page marks the year `calc.` and shows the arithmetic. Do not invent an offset. A reign length is not an end year, and a lifespan in years is not added to a birth year.
- If a source is ambiguous, damaged or self-contradictory, record what it says and flag it. **Do not silently resolve it.** Add it to:
  - `docs/OPEN-QUESTIONS-FOR-KEVIN.md`: next free item in the right section, with the question, why it matters, the options and a recommendation.
  - `scripts/cfah/inconsistencies.mjs`: internal CFAH inconsistencies, as the next `I<n>` (currently I1–I22).
- If you cannot verify something, write `pending` or leave it null with a note. Never guess.
- A `cfah` entry is required on every record. If CFAH has no date, set `date: null` and the note `pending CFAH reference`.

## 4. Sort order (enforced by `scripts/validate.mjs`; do not change without Kevin's written approval)

`sorting_year` comes from the first tier with a non-null `year_bc_ad`. Events use `chronologies[]` and people use `dates.birth[]`.

| Rank | Tier | Source |
|---|---|---|
| 1 | `cfah-anchor` | CFAH entry with `cfah_basis: anchor_point`. This includes OSF preprint anchor points, which carry `cfah_preprint` and "OSF preprint" in the citation. |
| 2 | `cfah-table1` | CFAH entry with `cfah_basis: table1_baseline` (CFAH-1 Table 1) |
| 3 | `ussher-jones` | Floyd Nolen Jones. Only years he prints himself; never convert his AM-only figures. |
| 4 | `ussher` | Ussher, *Annals of the World* |

Fallbacks:

- `provisional` (with a badge): used only when no tier 1–4 year exists. It takes the first dated `generations` entry, or a `morecraft` entry only on records the Morecraft import created and that only Morecraft dates.
- `calculated` (with a `calc.` badge): people only, and only when no tier 1–4 year and no provisional year exist. It is one year from `calculated`, in the order birth, reign start, death, translation. A printed `year_bc_ad` on birth blocks every later slot. Two different calculated birth years do not fall through. `sorting_basis.tier` is `calculated`, `tier_rank` is null, and `slot` names the slot. It is not a fifth rank in `sorting_rule.tiers`. Kevin, 2026-11-08 (N22). Do not remove it when a higher year is absent.
- `derived`: events only, copied from the record in `derived_from`.
- `none`: people only, with `sorting_year: null`.

**Display-only chronologies, which never set the sort:**

- `jordan`
- `jordan-compilation`: the Anno Mundi "Outline" compilation, always shown as its own secondary row, separate from `jordan`
- `bible`
- `masoretic-genealogy`
- `josephus`
- `raleigh-history-of-the-world`: the 1617 edition is primary for Raleigh
- `annals-of-clonmacnoise`
- `generations`: except through `provisional`
- `herodotus`: it carries no BC years at all
- `morecraft`: except through `provisional`, as above
- `shuckford`: volume 1 of the 1819 Creighton edition. Anno Mundi is not converted to BC. It is not a provisional sort tier
- `jones-2019`: Jones 21st ed. (2019). Display-only comparison under the Ussher–Jones row. The 23rd ed. (2026) sets the sort. Kevin, 2026-10-28
- `dynasty-of-slaves`: BLK SHP Scott (the pen name of Scott Magdalein), *Dynasty of Slaves* (2026). It is in the Conventional dating group below
- CFAH ruler dates with basis `paper_text`
- **every new source you add**

**Conventional dating group** (Kevin, 2026-11-12). `display_groups` in `data/chronologies.json` has one group, `conventional`, named "Conventional dating". It holds `dynasty-of-slaves`, and each member chronology carries `display_group: "conventional"`. It is not a sort tier and not a fallback:

- Its dates never set or override `sorting_year`, never supply a provisional year, and never supply a standby placement (`scripts/standby/compute.mjs` skips any chronology in a display group).
- They are not on the home timeline. The home timeline places a record only by `sorting_year` or `standby`, so a conventional date cannot reach it.
- On person and event pages they are left out of the main date tables and the disagreement flags. They are shown last, at the bottom of the dates, in a red block (`.conv-dating`: red left border, red-tinted background, red heading "Conventional dating", in light and dark modes) with the note "These views are based on conventional dating practices. They are shown for reference and do not set the timeline’s order."
- `scripts/validate.mjs` enforces the group, and `site/verify.mjs` checks the home timeline, `moses`, and `exodus` in Chromium and WebKit.
- The Dynasty of Slaves timeline, `/chronologies/dynasty-of-slaves/` (Kevin, 2026-11-12), lists the records this book dates in the order of his printed years, then the dynasties (the site's `dynasty` field) and the records named with no year printed. It reads the stored `dynasty-of-slaves` entries and writes nothing. Every red block that holds a `dynasty-of-slaves` entry, the chronology's entry on the Chronologies page, and its source in the sources list link to it.
- A later source that follows conventional dating goes in this group only when Kevin says so.

People sort on a tier-ranked birth year when `dates.birth` has one. A person who has a `dates.reign` slot and no tier-ranked birth year sorts on the start year already stored on that reign (`year_bc_ad`). The same four tiers choose it. Within Ussher–Jones, the 23rd edition (2026) governs over an older Jones edition. Display-only sources never set that reign start, and a reign length is never turned into a year. `sorting_basis.slot` is `reign_start` when the reign start sets the sort. It is omitted when the sort comes from a tier birth. Kevin's ruling, 2026-10-28 (open question M3). A calculated year may use `slot` `birth`, `reign_start`, `death`, or `translated`, and only in the gap below provisional.

**Standby placement (not a sort tier).** Records with no tier date get a standby placement (source-printed BC/AD year, else the linked record's year); it never sets sort; it is replaced automatically when a tier date arrives. The optional `standby` object is written by `scripts/standby/compute.mjs`. It never changes `sorting_year` or `sorting_basis`.

Any change to a tier or year must appear in the PR's "Sort-tier changes" section. CFAH importer changes are also logged in `scripts/cfah/sort-changes.json`.

## 5. Copyright and private files

- **CFAH papers** (© Answers in Genesis): only short quotes of dates and headings on records. Cite them and link to ARJ or OSF; never copy paper text. CFAH charts are **linked to ARJ, not copied** (`data/cfah-charts.json`).
- **F. N. Jones:** cite and link only.
- **James B. Jordan:** his papers may be included in full (`sources/jordan/`, with the owner's stated permission; © Jordan).
- **Generations, Morecraft, the Roman Roads Herodotus etext, and any other copyrighted book:** never commit the PDF, a scan, OCR or extracted text. Commit only dates as printed, citations, and short notes in our own words. The validator limits Morecraft note length.
- **Raleigh, *The History of the World* (1617):** the EarlyPrint and EEBO-TCP transcriptions in `sources/raleigh/` are CC0 (public domain). There is no quote-length limit for this text. The short-quote rules in this section apply to copyrighted works only.
- **Private source folders are never committed.** On the box these are `/workspace/*-src/`; on the Mini, use `private-src/`, which is gitignored. That covers PDFs, OCR, downloads and working text. Before every commit, run `git status` and `git diff --cached --stat` and confirm none are staged.
- **Never publish Proton Drive share links,** or private Google Drive links, in data, docs, commits or PRs. `access: private-copy` sources may never appear in `free_source_links` (the validator checks this).
- **New public-domain sources:** confirm PD status for the exact edition. US: published in 1930 or earlier. 1931–1964 depends on renewal, so check it. A modern translation of an ancient text is copyrighted unless shown otherwise. Use only full-view scans, never snippet or limited view.

## 6. Scripture links

All Scripture links go to the **Berean Literal Bible on BibleHub**:

```
https://biblehub.com/blb/<slug>/<chapter>.htm#<verse>
```

- Build every link with `scripts/blb.mjs`; never hand-type one.
- Slugs follow BibleHub: `1_kings`, `songs`, `psalms`, `1_john`.
- The validator rejects KJV/Gutenberg, BibleGateway, other BibleHub versions and unknown book or chapter slugs.
- Store references in OSIS style (`Gen.5.3`, `Gen.1.1-Gen.2.3`).

## 7. Site rules that must keep working

- **Person timelines:** every Person page has a lifespan timeline (vis-timeline).
  - The person's own events, birth and death are **solid**. Other events in the lifespan are **faded** context.
  - Every item is a real link, with an ordered list fallback and a legend.
  - `site/verify-timelines.mjs` checks this in Chromium and WebKit; it must still pass.
- **BC axis:** no year 0. BC year *y* maps to axis year *y*, and AD year *y* maps to *y − 1*. The build never converts AM to BC, except Raleigh's italic display year, which is not placed on the axis.
- **Asset URLs** are versioned (`?v=<hash>`). Keep the cache-busting step in `site/build.mjs`.
- **Accessibility:** every timeline has a keyboard and screen-reader list alternative. Use colour plus a text or pattern cue, never colour alone.
- **Third-party credit:** OpenBible.info (CC BY 4.0), OSM tiles, LoC maps and the bundled library licences stay credited.

## 8. Repo layout

```
AGENTS.md                this file
data/                    single source of truth (JSON + generated *-extract.md / cfah-coverage.md)
  chronologies.json      sorting_rule + every chronology (one primary: cfah)
  sources.json           every source text with verified URLs, access, licence note
  events/ people/ locations/ maps/   one JSON record per file; id = file name (kebab-case)
  raleigh-accounts.json  2,014 passages of the 1617 History (Preface, contents, Book I Part I ch. I–XII, Book II Part I ch. I–VI) and the records that quote them
  king-lists.json        CFAH/OSF king-list rows (list-only rows have no person record)
  cfah-charts.json       CFAH chart gallery (links only)
schema/                  JSON Schema 2020-12 for all of the above (common.schema.json = shared defs)
scripts/
  validate.mjs           schema + cross-reference + 4-tier sort + MT Genesis 5/11 + BLB + copyright checks
  blb.mjs                Berean Literal Bible link builder
  cfah/                  CFAH importer (import.mjs), curated rows, OSF tables, inconsistencies.mjs, coverage
  generations/ herodotus/ morecraft/ cory/ shuckford/   per-source importers: curated rows -> data/, plus check-source.mjs
  fetch-raleigh.sh       restores the large Raleigh 1617 XML (gitignored)
sources/jordan/          Jordan full texts (permitted); sources/raleigh/ Raleigh 1617 (EEBO-TCP A10357)
site/                    build.mjs (zero-dependency generator -> site/dist), src/ (app.js, styles.css, search.js),
                         serve.mjs, verify.mjs, verify-timelines.mjs, screenshots/
docs/                    OPEN-QUESTIONS-FOR-KEVIN.md, open-questions.md, cfah-anchors.md, cfah-osf-collation.md,
                         GROK-BUILD-TASKS.md, GROK-BUILD-SETUP.md, REVIEW-CHECKLIST.md, roadmap-pd-sources.md
```

Record conventions are in `README.md` under "Key conventions". Read it before you edit data. In particular, `year_bc_ad` uses negative numbers for BC and has no year 0.

**Raleigh's account** (Kevin, 2026-11-07, ruling C). A person or event page that the covered 1617 text discusses has a closed `<details>` section, summary "Raleigh's account". The words are his, in book order, each passage cited by book, part, chapter, section, and signature. Original spelling is in the page; modern spelling uses `scripts/raleigh/spelling.mjs` and is the default, with the same toggle as the chronological table. Passages are stored once in `data/raleigh-accounts.json`. `accounts` maps a person or event id to passage ids. The file is not a field on the record, so an importer that rewrites a person file cannot drop it. `scripts/validate.mjs` requires each passage to occur in `sources/raleigh/A10357.earlyprint-unadorned.xml` after notes and tags are removed and whitespace is collapsed. `scripts/raleigh/covered.mjs` rebuilds the file from that XML and the current people. Do not attach a passage by paraphrasing it.

**Modern reading** (Kevin, 2026-11-08). These rules apply to every passage already stored and to every later pass. The original view stays the printed text. The modern view, in the account dropdowns and on the full-text pages, also does three things. Italics are the unadorned `<hi>` tags. They are not stored in the account file. Build and validate derive `[start, end]` spans and check each `<hi>` string against those spans. An italic stretch stays italic after a word is modernized. A third-person verb in `-eth` takes the modern third person (`maketh` to `makes`, `hath` to `has`, `doth` to `does`, `saith` to `says`). Names, nouns, and ordinals that end in `-eth` stay (`Seth`, `Japheth`, `teeth`, `twentieth`). The list, including the words left unchanged because the verb is uncertain, is `docs/raleigh-eth-words.md`. A word printed with two capitals and then lowercase (`THat`) becomes one capital (`That`). A word printed entirely in capitals, and a Roman numeral, stay as printed. That case question is N17.

## 9. Commands

```
npm ci                      # install (Node 20; see .node-version)
npm run validate            # data + rules; must PASS
npm run build               # validate -> site/build.mjs -> pagefind -> site/dist
npm run preview             # http://localhost:8788
npm run verify              # Playwright: pages, timeline, map, search + person timelines (Chromium + WebKit)
npm run verify:live         # person-timeline checks against production (run after a merge, not before)
```

**Importers** are idempotent and each one rewrites its own extract file:

- `node scripts/generations/import.mjs`
- `node scripts/herodotus/import.mjs`
- `node scripts/morecraft/import.mjs`
- `node scripts/cory/import.mjs`
- `node scripts/shuckford/import.mjs`
- `node scripts/cfah/import.mjs`
- `node scripts/jones/import-2019.mjs` (display-only 21st ed. comparison; does not write an extract and does not touch the sort)
- `node scripts/standby/compute.mjs`

**Importer order:** if you re-run the Herodotus importer (or any other importer), run `node scripts/cfah/import.mjs` **after it**. The Herodotus importer drops CFAH-only reign slots on its people, and the CFAH importer restores them (see E-section notes in `docs/OPEN-QUESTIONS-FOR-KEVIN.md`). Then run `node scripts/standby/compute.mjs` last, so a record that gained a `sorting_year` loses its standby placement and a record that still has none is placed again. Then run `npm run validate`, and check `git diff --stat` for unexpected churn. The Generations, Herodotus, and Morecraft importers must leave a `calculated` sort in place when they have no higher year. A provisional or tier 1–4 year replaces it. Do not run `scripts/standby/compute.mjs` across the corpus unless a sort year changed, and do not let it put `standby` back on a record that has `sorting_year`. A Raleigh rebuild (`scripts/raleigh/covered.mjs`) must keep `calculated`, `mother`, `spouse`, and a calculated `sorting_year`.

`check-source.mjs` scripts verify quotes against private PDFs and are skipped when those files are absent. That is expected on the Mini.

## 10. Adding a new source (pattern)

Each new source needs four things:

1. An entry in `data/sources.json`: id, title, authors, translator or editor, edition year, verified `url`/`alt_urls`, `access`, `license_note`, `verified_on`.
2. A **display-only** chronology in `data/chronologies.json`. Add a validator rule that it can never set the sort, following the herodotus and morecraft rules in `scripts/validate.mjs`.
3. A curated rows file plus an idempotent importer under `scripts/<source>/`.
4. A generated `data/<source>-dates-extract.md`: edition read, every dated statement with its page and section, the record it maps to, and status (agrees / CONFLICT / internal / framework / n/a).

Schema changes, such as a new field, need Kevin's approval. Propose them in the PR's open questions. The proposed `free_links` source field (T2) and the optional `tradition` field are **on hold**: Kevin will return to them. Do not add either field until he approves. Kevin approved `schema/raleigh-accounts.schema.json` on 2026-11-07 (ruling C). It is a separate file, not a field on a person or an event. Kevin approved `mother`, `spouse`, and `calculated` on person records on 2026-11-08 (N22, N24). `mother` is a person id, or null. `spouse` is a list. An uncertain link is `{id, uncertain: true, source, note}` and the page shows `?` after the name. The id never contains `?`. Omit `mother`, `spouse`, and `calculated` when they are empty.

## 11. Where things go when unsure

Ask in the PR's **Open questions** section and in `docs/OPEN-QUESTIONS-FOR-KEVIN.md`. Ship what is certain, and leave the uncertain part out, flagged.
