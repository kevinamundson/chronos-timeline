#!/usr/bin/env node
// Builds data/illustrations/dore-1866.json.
// File names come from the Archive.org metadata API for item "gustavedore"
// (https://archive.org/metadata/gustavedore). Pass --metadata <file> to use a saved copy.
// Pixel sizes come from scripts/dore/sizes.json (measured 2026-10-29: IIIF info.json v2,
// then v3, then a JPEG SOF header on archive.org/download when both timed out).
// This script does not re-measure, and it does not copy images. Thumbnails: npm run dore:thumbs.
// Record links come from scripts/dore/mappings.mjs. Every non-x file must be mapped
// or listed there with an empty records array. x-suffix files are skipped.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDoreFileName } from './parse.mjs';
import { doreUrls, DISPLAY_W } from './urls.mjs';
import { canonicalNumbers, mappingFor } from './mappings.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const METADATA_URL = 'https://archive.org/metadata/gustavedore';

function namesFromMetadata(meta) {
  const names = [];
  for (const f of meta.files || []) {
    const name = f.name;
    if (typeof name !== 'string' || !name.endsWith('.jpg')) continue;
    if (name.includes('_thumb') || name === '__ia_thumb.jpg') continue;
    const parsed = parseDoreFileName(name);
    if (!parsed || parsed.suffix === 'x') continue;
    names.push(name);
  }
  return names;
}

async function loadNames() {
  const flag = process.argv.indexOf('--metadata');
  if (flag !== -1) {
    const path = process.argv[flag + 1];
    if (!path) throw new Error('--metadata needs a file path');
    return namesFromMetadata(JSON.parse(readFileSync(path, 'utf8')));
  }
  const res = await fetch(METADATA_URL, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`metadata ${METADATA_URL} returned ${res.status}`);
  return namesFromMetadata(await res.json());
}

const names = await loadNames();
// Thumbnail sizes are measured by scripts/dore/fetch-thumbs.mjs from the WebP files it writes.
// Keep them across a regenerate; run npm run dore:thumbs afterwards for any new plate.
const outPath = join(root, 'data/illustrations/dore-1866.json');
const prevThumbs = new Map();
if (existsSync(outPath)) {
  for (const il of JSON.parse(readFileSync(outPath, 'utf8')).illustrations || []) {
    if (Number.isInteger(il.thumb_width) && Number.isInteger(il.thumb_height)) prevThumbs.set(il.file, { w: il.thumb_width, h: il.thumb_height });
  }
}
const sizes = JSON.parse(readFileSync(join(here, 'sizes.json'), 'utf8'));
const byNumber = new Map();
for (const name of names) {
  const parsed = parseDoreFileName(name);
  if (byNumber.has(parsed.number)) throw new Error(`two files for number ${parsed.number}: ${byNumber.get(parsed.number)} and ${name}`);
  byNumber.set(parsed.number, { name, parsed });
}

const expect = canonicalNumbers();
const missing = expect.filter((n) => !byNumber.has(n));
const extra = [...byNumber.keys()].filter((n) => !expect.includes(n)).sort((a, b) => a - b);
if (missing.length || extra.length) {
  throw new Error(`file numbers do not match the canonical set. missing ${missing.join(', ') || 'none'}; extra ${extra.join(', ') || 'none'}`);
}
const unmapped = expect.filter((n) => !mappingFor(n));
if (unmapped.length) throw new Error(`no mapping for ${unmapped.join(', ')}`);

const illustrations = expect.map((number) => {
  const { name, parsed } = byNumber.get(number);
  const size = sizes[name];
  if (!size || !Number.isInteger(size.width) || !Number.isInteger(size.height)) {
    throw new Error(`no size for ${name} in scripts/dore/sizes.json`);
  }
  const map = mappingFor(number);
  const urls = doreUrls(name);
  return {
    number,
    suffix: parsed.suffix,
    title: parsed.title,
    file: name,
    original_width: size.width,
    original_height: size.height,
    display_height: Math.round(DISPLAY_W * size.height / size.width),
    ...(prevThumbs.has(name) ? { thumb_width: prevThumbs.get(name).w, thumb_height: prevThumbs.get(name).h } : {}),
    image: urls.display,
    image_small: urls.small,
    iiif_info: urls.iiif_info,
    details_url: urls.details,
    scripture_ref: map.scripture_ref,
    records: map.records,
  };
});

const doc = {
  description: 'Gustave Doré, Bible illustrations (1866), from the Internet Archive item "gustavedore". Display images are linked, never copied: pages load them from the Internet Archive IIIF Image API (v2; v3 is the fallback). Only a small WebP thumbnail of each plate (thumb_width x thumb_height, about 240 px wide) is stored in site/static/img/dore/thumbs/, made by scripts/dore/fetch-thumbs.mjs. "number" and "title" are the Archive.org file name as uploaded; they are not Doré\'s 1866 plate numbers or captions. scripture_ref is set only where the title names one passage. It is identified from the title, not printed on the plate. A chapter-level ref is used when the title gives the book and chapter and the scene is not pinned to verses. A person is linked only when the plate draws that person: basis named-in-title (the name is in the file title and the person is drawn) or depicted (the person is clearly the figure shown, with a short note of who and where). An event is linked when the plate draws that event (event-depicted). A person is not linked only because a verse names them. This file has the 220 canonical plates. The 21 Apocrypha files, marked with an x after the number, are omitted.',
  source: 'dore-bible-1866-archive',
  checked_on: '2026-10-29',
  illustrations,
};

const out = outPath;
writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
const linked = illustrations.filter((il) => il.records.length).length;
console.log(`wrote ${illustrations.length} plates (${linked} linked) to ${out}`);
