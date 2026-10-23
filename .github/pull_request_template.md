<!-- Grok Build / Chronos PR template. Fill every section; write "none" rather than deleting a section.
     Rules: AGENTS.md. Review: docs/REVIEW-CHECKLIST.md. Only Kevin merges. -->

## Task
- Backlog item: <!-- e.g. T1 / Cory, Ancient Fragments (1876) -->
- Branch: `gb/...`
- Summary (2–4 sentences, what and why):

## What changed
<!-- Bullet list by area: data/, schema/, scripts/, site/, docs/ -->
- 

## Sources read
| Source id | Edition (publisher, year, translator/editor) | PD / licence basis | Link opened (full view) | Pages / sections read |
|---|---|---|---|---|
| | | | | |

## Records
| | New | Changed | Removed |
|---|---|---|---|
| Events | | | |
| People | | | |
| Locations | | | |
| Sources (`sources.json`) | | | |
| Chronologies (`chronologies.json`) | | | |
| Other (king-lists, charts, extracts) | | | |

`npm run validate` summary line (before → after):
```
before:
after:
```

## Sort-tier changes
<!-- Must be "none" unless Kevin approved a sort change. List every record whose sorting_year or tier changed: id, old → new, why. -->
- none

## Spot-check list for the reviewer
<!-- 5+ dates (or 10% of new dated entries, whichever is more), chosen across the batch: record id, date as entered, source page/section, link. -->
| Record | Date entered | Source + page/section | Link |
|---|---|---|---|
| | | | |

## Copyright and privacy
- [ ] No PDF, scan, OCR or extracted copyrighted text committed (`git diff --stat origin/main` reviewed)
- [ ] Nothing from `private-src/` or any `*-src/` folder committed; no Proton or private Drive links
- [ ] CFAH text only as short quotes; CFAH charts linked, not copied
- [ ] New sources: PD status checked for the exact edition (basis stated above)
- Notes:

## Checks run locally
- [ ] `npm run validate`: PASS
- [ ] `npm run build`: OK
- [ ] `npm run verify`: PASS (Chromium + WebKit)
- [ ] Scripture links built with `scripts/blb.mjs` (BLB only)
- Cloudflare preview URL: <!-- https://gb-<slug>.chronos-bfi.pages.dev (posted by the Cloudflare bot) -->

## Inconsistencies and open questions
<!-- New items added to docs/OPEN-QUESTIONS-FOR-KEVIN.md (ids) and scripts/cfah/inconsistencies.mjs (I-numbers); questions Kevin must answer before merge. -->
- 
