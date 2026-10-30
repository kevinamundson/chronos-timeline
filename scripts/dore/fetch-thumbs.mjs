#!/usr/bin/env node
// Local thumbnails for the 220 canonical Gustave Doré plates (1866).
//
// Reads the plate list from data/illustrations/dore-1866.json (not a hand list).
// Downloads each file from the Archive.org IIIF Image API at about 240 px wide
// (v2, then v3), converts it to WebP, and writes:
//   site/static/img/dore/thumbs/NNN.webp
// Full-size and medium images are not saved. Apocrypha files (an x after the
// number) are not in the plate list, so they are not fetched.
//
// The 240 px file is also the inline placeholder (the page scales it up and blurs it).
// A 480 px sibling is not written: four times the pixels would not keep the
// thumbnail directory well under 5 MB.
//
// Idempotent: an existing WebP is skipped unless --force is passed.
// Usage: npm run dore:thumbs
//        npm run dore:thumbs -- --force
//
// Thumbnails derived from the Archive.org item gustavedore (Gustave Doré, 1866), public domain.
import { mkdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { iiifScaled, LOCAL_THUMB_W, DORE_THUMB_DIR, doreThumbName } from './urls.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const dataPath = join(root, 'data/illustrations/dore-1866.json');
const outDir = join(root, DORE_THUMB_DIR);
const force = process.argv.includes('--force');
const CONCURRENCY = 2;
const TIMEOUT_MS = 90_000;
const TRIES = 3;
const START_QUALITY = 70;
const QUALITIES = [70, 60, 50, 40, 32];
const FILE_MAX = 100 * 1024;
const BUDGET = 4 * 1024 * 1024; // well under the 5 MB cap
const HARD_CAP = 5 * 1024 * 1024;
const UA = 'chronos-timeline dore-thumbs/1.0 (public-domain thumbnail mirror of archive.org/details/gustavedore)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function fetchJpeg(url) {
  let last;
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'follow',
        headers: { 'User-Agent': UA, Accept: 'image/jpeg,image/*;q=0.8' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100 || buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error(`not a jpeg (${buf.length} bytes)`);
      return buf;
    } catch (e) {
      last = e;
      if (attempt < TRIES) await sleep(1000 * 2 ** (attempt - 1));
    }
  }
  throw last;
}

async function downloadPlate(file) {
  const v2 = iiifScaled(file, LOCAL_THUMB_W, 2);
  try {
    return { jpeg: await fetchJpeg(v2), via: 'v2' };
  } catch (v2err) {
    const v3 = iiifScaled(file, LOCAL_THUMB_W, 3);
    try {
      return { jpeg: await fetchJpeg(v3), via: 'v3' };
    } catch (v3err) {
      throw new Error(`v2: ${v2err.message}; v3: ${v3err.message}`);
    }
  }
}

async function toWebp(jpeg, quality) {
  const out = await sharp(jpeg, { failOn: 'error' })
    .rotate()
    .resize({ width: LOCAL_THUMB_W, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();
  const meta = await sharp(out).metadata();
  if (!meta.width || !meta.height) throw new Error('webp has no dimensions');
  return { buf: out, width: meta.width, height: meta.height };
}

async function pool(items, limit, fn) {
  const ret = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      ret[i] = await fn(items[i], i);
      await sleep(200);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return ret;
}

const doc = JSON.parse(readFileSync(dataPath, 'utf8'));
const plates = doc.illustrations || [];
if (!plates.length) {
  console.error('no plates in data/illustrations/dore-1866.json');
  process.exit(1);
}
const x = plates.find((il) => il.suffix === 'x' || /^\d{3}x /.test(il.file || ''));
if (x) {
  console.error(`refusing to fetch an x-suffix plate: ${x.file}`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const skipped = [];
const todo = [];
for (const il of plates) {
  const name = doreThumbName(il.number);
  const dest = join(outDir, name);
  if (!force && existsSync(dest)) skipped.push({ il, name, dest });
  else todo.push({ il, name, dest });
}

console.log(`plates ${plates.length}; fetch ${todo.length}; skip ${skipped.length}; concurrency ${CONCURRENCY}`);

const fetched = [];
const failed = [];
await pool(todo, CONCURRENCY, async (item, i) => {
  try {
    const got = await downloadPlate(item.il.file);
    fetched.push({ ...item, jpeg: got.jpeg, via: got.via });
    // Save at once, so an interrupted run keeps what it fetched (a re-run skips it).
    // The budget pass below may re-encode these at a lower quality.
    writeFileSync(item.dest, (await toWebp(got.jpeg, START_QUALITY)).buf);
    console.log(`fetched ${item.name} via ${got.via} (${i + 1}/${todo.length})`);
  } catch (e) {
    failed.push({ name: item.name, file: item.il.file, error: e.message });
    console.error(`FAILED ${item.name}: ${e.message}`);
  }
});

if (failed.length) {
  // The plates that did download are already saved, so a re-run skips them.
  console.error(`\n${failed.length} plate(s) failed. ${fetched.length} thumbnail(s) were saved. Re-run to retry the rest.`);
  for (const f of failed) console.error(`  ${f.name}  ${f.file}  ${f.error}`);
  process.exit(1);
}

let quality = START_QUALITY;
const encoded = new Map();
async function encodeFetched(q) {
  let total = 0;
  let max = { bytes: 0, name: '' };
  for (const item of fetched) {
    const webp = await toWebp(item.jpeg, q);
    encoded.set(item.il.number, webp);
    total += webp.buf.length;
    if (webp.buf.length > max.bytes) max = { bytes: webp.buf.length, name: item.name };
  }
  return { total, max };
}

let fetchedBytes = 0;
let fetchedMax = { bytes: 0, name: '' };
if (fetched.length) {
  for (const q of QUALITIES) {
    quality = q;
    const stats = await encodeFetched(q);
    fetchedBytes = stats.total;
    fetchedMax = stats.max;
    const overFile = stats.max.bytes > FILE_MAX;
    const overBudget = stats.total > BUDGET;
    console.log(`encode quality ${q}: fetched bytes ${bytes(stats.total)}, max ${stats.max.name} ${bytes(stats.max.bytes)}`);
    if (!overFile && !overBudget) break;
    if (q === QUALITIES[QUALITIES.length - 1]) {
      console.error(`still over the budget at quality ${q} (${bytes(stats.total)}, max ${bytes(stats.max.bytes)}).`);
      process.exit(1);
    }
    console.log(`over budget or per-file cap; trying a lower quality`);
  }
}

const dims = new Map();
let skippedBytes = 0;
let skippedMax = { bytes: 0, name: '' };
for (const item of skipped) {
  const st = statSync(item.dest);
  const meta = await sharp(item.dest).metadata();
  if (!meta.width || !meta.height) {
    console.error(`${item.name} has no dimensions; re-run with --force`);
    process.exit(1);
  }
  if (st.size > FILE_MAX) {
    console.error(`${item.name} is ${bytes(st.size)}, over 100 KB. Re-run with --force to re-encode.`);
    process.exit(1);
  }
  skippedBytes += st.size;
  if (st.size > skippedMax.bytes) skippedMax = { bytes: st.size, name: item.name };
  dims.set(item.il.number, { width: meta.width, height: meta.height });
}

const totalBytes = fetchedBytes + skippedBytes;
const maxFile = fetchedMax.bytes >= skippedMax.bytes ? fetchedMax : skippedMax;
if (totalBytes >= HARD_CAP) {
  console.error(`thumbnail directory would be ${bytes(totalBytes)}, not under 5 MB.`);
  if (skipped.length) console.error('Re-run with --force so every file can be re-encoded smaller.');
  process.exit(1);
}
if (totalBytes > BUDGET && skipped.length) {
  console.error(`total ${bytes(totalBytes)} is over the ${bytes(BUDGET)} target because ${skipped.length} files were skipped. Re-run with --force.`);
  process.exit(1);
}

for (const item of fetched) {
  const webp = encoded.get(item.il.number);
  writeFileSync(item.dest, webp.buf);
  dims.set(item.il.number, { width: webp.width, height: webp.height });
}

doc.illustrations = plates.map((il) => {
  const d = dims.get(il.number);
  if (!d) throw new Error(`no dimensions for plate ${il.number}`);
  const out = {};
  for (const [k, v] of Object.entries(il)) {
    if (k === 'thumb_width' || k === 'thumb_height') continue;
    out[k] = v;
    if (k === 'display_height') {
      out.thumb_width = d.width;
      out.thumb_height = d.height;
    }
  }
  if (!Object.hasOwn(out, 'thumb_width')) {
    out.thumb_width = d.width;
    out.thumb_height = d.height;
  }
  return out;
});
writeFileSync(dataPath, JSON.stringify(doc, null, 2) + '\n');

console.log('');
console.log(`fetched ${fetched.length}`);
console.log(`skipped ${skipped.length}`);
console.log(`failed ${failed.length}`);
console.log(`quality ${quality}`);
console.log(`total ${bytes(totalBytes)} (${totalBytes} bytes)`);
console.log(`max ${maxFile.name || 'n/a'} ${maxFile.bytes} bytes`);
console.log(`wrote dimensions into ${dataPath}`);
