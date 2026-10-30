# Doré local thumbnails

Thumbnails derived from the Archive.org item gustavedore (Gustave Doré, 1866), public domain.

Kevin (2026-10-29) relaxed "no images in the repo" for **thumbnails only**, so that pages load fast. Full-size display images still come from the Internet Archive IIIF Image API (v2 primary, v3 fallback). No full-size or medium image is committed, and there is no thumbnail for the 21 Apocrypha files (an x after the number).

## Status (2026-10-29): 72 of 220 shipped, 148 pending

Archive.org's IIIF Image API returned HTTP 500/504 errors (or timed out) for most plates on 2026-10-29, so PR #25 ships the 72 thumbnails that were fetched (about 873 KB in all; the largest is 089.webp, 18.8 KB). The other 148 plates are recorded in `data/illustrations/dore-thumbs-pending.json` and, as a table, in [`docs/DORE-THUMBS-PENDING.md`](DORE-THUMBS-PENDING.md), which also says how to finish: run `npm run dore:thumbs` (it fetches only the missing ones), remove the fetched plates from the pending file, and when it is empty delete it and drop the validator allowance.

A pending plate has no thumbnail file and no `thumb_width`/`thumb_height`. Its record page keeps the reserved aspect-ratio box and the spinner until the IIIF image loads (and the Archive.org link if it fails); its gallery dot is a plain dot; on the index it loads a lazy 300 px IIIF image (v2, then v3), and if that fails the box stays, showing the file number and "Archive.org" inside the link.

## What is stored

- `site/static/img/dore/thumbs/NNN.webp`: one WebP per plate in `data/illustrations/dore-1866.json` (220 when complete; 72 now, see the status above), about 240 px wide, metadata stripped. The 3-digit name is the Archive.org file number.
- `site/build.mjs` copies `site/static/` to the site root, so a thumbnail is served at `/img/dore/thumbs/NNN.webp`.
- `thumb_width` and `thumb_height` in `data/illustrations/dore-1866.json` are the pixel size of each WebP. Pages use them for the img width/height, so no layout shift. `scripts/dore/generate.mjs` keeps them when it rebuilds the file.

## Where they are used

- **Index** (`/illustrations/dore/`): local thumbnails, lazy, with width/height. Each links to the plate on Archive.org. The page makes no IIIF request for a plate that has a local thumbnail; only pending plates load a small IIIF image.
- **Record pages** (one figure or a gallery): the thumbnail shows at once, blurred, in the reserved box, with the spinner over it (no visible text). The IIIF image loads over it. If v2 and then v3 both fail, the spinner goes, the thumbnail stays (unblurred), and the "Open it on Archive.org" note shows.
- **Gallery navigation:** the dot buttons are the plates' thumbnails.

## Regenerating

```
npm ci
npm run dore:thumbs            # fetch only the missing thumbnails
npm run dore:thumbs -- --force # re-fetch and re-encode all 220
npm run validate
```

`scripts/dore/fetch-thumbs.mjs` reads the plate list from the data (not a hand list) and requests
`https://iiif.archive.org/image/iiif/2/gustavedore%2F<file>/full/240,/0/default.jpg`, falling back to the same path on `/iiif/3/`. It uses 2 requests at a time, a 90 s timeout and 3 tries with backoff. It converts to WebP (sharp, quality 70, lowered step by step only if a file passes 100 KB or the folder passes 4 MB), writes the files, records `thumb_width`/`thumb_height`, and prints fetched, skipped, failed, total bytes and the largest file. Existing files are skipped unless `--force` is given.

## Validator guards (`scripts/validate.mjs`)

- Every plate in the data has its thumbnail, and its size matches `thumb_width` x `thumb_height`, unless it is listed in `data/illustrations/dore-thumbs-pending.json`.
- The pending list must be exactly the plates without a thumbnail: a listed plate has no thumbnail file and no `thumb_width`/`thumb_height`, and its file, title and details_url match the data.
- No thumbnail for a number not in the data, and none for an x-suffix file.
- Only `.webp` in the folder; each file at most 100 KB; the folder under 5 MB.
- No `.jpg`, `.jpeg`, `.png`, `.webp` or `.gif` over 100 KB anywhere under `site/` or `data/` (a guard against committed full-size images). The verify screenshots in `site/screenshots/` and the build output `site/dist/` are exempt.

## Record page layout

- The Doré section on a person or event page has no visible heading. It is labelled for screen readers only ("Illustration", or "Illustrations, n" for a gallery).
- The public-domain credit (Internet Archive item link and a link to /illustrations/dore/) is in the site footer on every page, not in the section.
- From 800px up the section floats right (340px). The sort-year card and the cards after it narrow beside it and go full width below it, so there is no blank space under the sort-year card. Under 800px the plate sits under the title.
