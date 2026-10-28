# Review checklist (Chronos)

Chronos, Kevin's Grok Bot agent, runs this checklist on every Grok Build PR before reporting to Kevin. **Chronos never merges.** Only Kevin approves and merges. Record the result of each item in a PR review comment, or in the report to Kevin if commenting isn't possible: ✅, ❌ (with what failed), or n/a (with why).

## 0. Setup

```bash
cd /workspace/timeline-portal
git fetch origin
git switch --detach origin/gb/<slug>          # review the exact pushed head; note its SHA
git diff --stat origin/main...HEAD
npm ci
```

## 1. Automated checks

- [ ] `npm run validate` passes. Compare its summary line with `main`: file, event and people counts, and the tier counts.
- [ ] `npm run build` succeeds.
- [ ] `npm run verify` passes. This covers pages, timeline, map, search and the person timelines in Chromium and WebKit.
- [ ] The PR's stated counts (records new, changed and removed) match `git diff --stat` and the validate summary.

## 2. Sources and dates (the cardinal rule)

- [ ] **Spot-check at least 5 dated entries, or 10% of new ones, whichever is more** (cap at 20). Use the PR's list, plus **at least 2 that Chronos picks at random** with `git diff origin/main...HEAD -- data/ | rg '"date"'`. For each one, open the cited edition at the cited page or section and confirm:
  - the date or figure as printed
  - the edition, translator and year
  - the page number
  - that the link opens a **full-view** copy of that edition
- [ ] **No invented material:** no date, event, person, place, URL or citation without a source that was read.
  - Every new URL resolves: `curl -sIL` each new host, or open it.
  - No URL is a guessed pattern: open at least one per host.
- [ ] No conversions the source does not make (AM→BC, reign length→BC year). Any derived year is in the note, labelled DERIVED, with its arithmetic. The one display exception is Raleigh's yeere of the World: a parenthetical from Creation in 4032 BC (`scripts/raleigh/derived-year.mjs`). It does not change `year_bc_ad`, sort, standby, spans, or tiers.
- [ ] Conflicts and self-contradictions are recorded in `docs/OPEN-QUESTIONS-FOR-KEVIN.md`, or for CFAH as a new `I<n>` in `scripts/cfah/inconsistencies.mjs`, and not silently resolved.
- [ ] The PD basis is stated for every new source and fits the edition. US: 1930 or earlier; 1931–1964 needs a renewal check; modern translations count as copyrighted.

## 3. Sort rules

- [ ] `data/chronologies.json` → `sorting_rule` is unchanged: CFAH anchor point (incl. OSF) > CFAH-1 Table 1 > Ussher–Jones > Ussher.
- [ ] Every new chronology is `primary: false`, has "SECONDARY DISPLAY" in its `description`, and has a validator rule stopping it from setting the sort.
- [ ] **No `sorting_year` or tier changed on an existing record**, unless the PR lists the change and Kevin approved it. Check with:

  ```bash
  git diff origin/main...HEAD -- data/events data/people | rg '^[-+].*"(sorting_year|tier)"'
  ```

- [ ] `provisional` is used only as the rules allow (Generations, or Morecraft on records only Morecraft dates). Jordan and the Jordan compilation are never a sort basis.
- [ ] **Standby placements (T5).** A record has `standby` only when `sorting_year` is null. The validator prints `Standby placements: source-printed=N, linked-record=M; fully undated=K`. No `sorting_year` or tier changed. On the home timeline, standby items stay off until “Standby (no tier date)” is pressed, use the `standby` class (dashed, not a tier colour), and the label says “standby placement”. The Undated list has no standby record. A standby year is a year the cited source already prints, or the linked record’s sort year taken as-is. It is not a new calculation.

## 4. Copyright and privacy

- [ ] No PDF, scan, image of a copyrighted page, OCR output or extracted copyrighted text is committed:

  ```bash
  git diff --stat origin/main...HEAD
  git diff --name-only origin/main...HEAD | rg -i '\.(pdf|djvu|tiff?|jpe?g|png|txt|hocr)$|-src/|private-src/'
  ```

  The PNGs under `site/screenshots/` from `npm run verify` are allowed.
- [ ] Notes on copyrighted books (Generations, Morecraft, the Roman Roads etext, CFAH) are short and in our own words. CFAH text appears only as short quotes, and CFAH charts are linked, not copied.
- [ ] Jordan full texts appear only under `sources/jordan/`, as permitted.
- [ ] **Jasher (T4b):** quotes and links come only from the PD 1840 Noah/Gould scan (archive.org `bookofjasherrefe00sefe`). Nothing from Ken Johnson's 2008 annotated edition (notes, headings, AM dates, tables, appendices, introduction) is quoted or committed (`rg -n -i 'ken johnson|bibliofacts|biblefacts'` on the diff should show only provenance notes). Any Johnson vs 1840 verse-numbering difference is flagged in the PR.
- [ ] No `free_links` or `tradition` field is added (on hold until Kevin approves the schema).
- [ ] Scope wording (T3) names no temple as an endpoint.
- [ ] No Proton Drive links (`rg -n 'proton\.me|drive\.proton'`), no private Google Drive links outside existing `private-copy` provenance entries, and no tokens or secrets (`rg -n -i 'ghp_|github_pat_|api[_-]?key|secret'`).

## 5. Scripture and links

- [ ] **BLB links only:** `https://biblehub.com/blb/<slug>/<chapter>.htm#<verse>`, built through `scripts/blb.mjs`. The validator enforces this; also check with `rg -n 'biblegateway|gutenberg.org/.*/10|biblehub.com/(kjv|niv|esv)'` on the diff.
- [ ] New external links are on the host allow-list (once T2 is approved and done), are `https`, and are full-view, not snippet or limited.

## 6. Site behaviour

- [ ] **Person timelines still render.** `npm run verify` covers this. Also open 2 people from the diff locally (`npm run preview`) or on the preview URL, and confirm:
  - the chart is drawn,
  - own items are solid and context items faded,
  - items are links,
  - the list fallback is present.
- [ ] Home timeline, map, search and `/king-lists/` load without console errors.
- [ ] **Standby (T5).** The home “Standby (no tier date)” control is off by default. Turning it on draws standby items with the `standby` class and no tier class. Person pages for a standby record name the placement and say it is not a sort year.
- [ ] After T4: spans are translucent, start and end match the data, there is a legend and list fallback, and point events are unchanged.
- [ ] UI text keeps the project's tone: precise, scholarly, transparent and reverent toward Scripture.

## 7. Cloudflare Pages branch preview

**Status, checked by Chronos on 2026-10-22 via the Cloudflare API:**

- The `chronos` Pages project builds from GitHub `kevinamundson/chronos-timeline`, with production branch `main`.
- Preview deployments are **enabled for all branches** (`preview_deployment_setting: all`, includes `*`).
- **PR comments are enabled**: Cloudflare's bot posts the preview URL on the PR.
- No preview deployment existed at that time, so the first `gb/*` push will be the first one.
- The project subdomain is `chronos-bfi.pages.dev`.

**Preview URL patterns:**

- Each deployment gets an immutable `https://<hash>.chronos-bfi.pages.dev`.
- The branch alias is `https://<branch-alias>.chronos-bfi.pages.dev`. Cloudflare lowercases the branch name and replaces non-alphanumerics with `-`, so `gb/t1-cory` becomes `https://gb-t1-cory.chronos-bfi.pages.dev`. Use the URL the Cloudflare bot posts on the PR.
- Previews are **public by default** (Cloudflare Access is not enabled). The repo is public too, so nothing new is exposed, but the private-file rules above matter just as much for previews.

**Checks:**

- [ ] The Cloudflare preview build for the PR head succeeded. See the PR checks, or the "Cloudflare Pages" comment.
- [ ] Run the person-timeline checks against the preview with `node site/verify-timelines.mjs --base <preview-url>`. Also open the home, `/king-lists/` and one changed record on the preview.

## 8. Report to Kevin

Send a short summary to Kevin:

- the PR link and head SHA
- the result of each section (✅ / ❌ / n/a)
- the spot-check table (record, date, source page, result)
- record counts
- sort changes (expected: none)
- copyright notes
- new open questions, with recommendations
- the preview URL
- a recommendation: **approve**, **approve after fixes**, or **request changes**

Kevin approves and merges. After the merge, Chronos runs `npm run verify:live` against https://chronos.kevinamundson.me and reports the result.

If Chronos finds problems, it requests changes on the PR with specific file:line notes. It does not push fixes to the `gb/*` branch unless Kevin asks.
