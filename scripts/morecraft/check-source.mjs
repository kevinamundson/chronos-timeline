#!/usr/bin/env node
// Checks every Morecraft row against the OCR of the private scanned PDF (never committed):
//   MORECRAFT_SRC=/workspace/morecraft-src node scripts/morecraft/check-source.mjs
// - "find" must occur in the first OCR pass of that PDF page (tesseract 300 dpi, psm 3), letters/digits only;
// - every year in "date" must also occur in the second, independent OCR pass (400 dpi, psm 6) of that page, unless the
//   row says imageChecked (read from the page image by eye);
// - writes printed.json (PDF page -> printed page number read at the foot of the page).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MORECRAFT_SRC || '/workspace/morecraft-src';
if (!existsSync(join(SRC, 'ocr'))) { console.log('check-source: OCR text not found; skipped (private copy).'); process.exit(0); }
const N = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ocr = (dir, p) => { const f = join(SRC, dir, `${p}.txt`); return existsSync(f) ? readFileSync(f, 'utf8') : null; };
const printed = {};
for (let p = 1; p <= 417; p++) { const t = ocr('ocr', p); if (!t) continue; const L = t.split('\n').map((l) => l.trim()).filter(Boolean); const m = (L[L.length - 1] || '').match(/(?:^|\s)(\d{1,3})$/); if (m && +m[1] > 0 && +m[1] < 420 && p >= 13) printed[p] = +m[1]; }
writeFileSync(join(here, 'printed.json'), JSON.stringify(printed) + '\n');
let bad = 0, n = 0, second = 0, img = 0;
for (const f of readdirSync(here).filter((x) => /^rows-.*\.mjs$/.test(x)).sort()) {
  const { rows } = await import(pathToFileURL(join(here, f)).href);
  for (const r of rows) {
    n++;
    const t1 = ocr('ocr', r.pdf);
    if (!t1 || !N(t1).includes(N(r.find))) { console.log(`BAD ${f} PDF ${r.pdf}: "${r.find}" not in OCR`); bad++; continue; }
    const years = (r.date.replace(/\(.*?\)/g, '').match(/\d{2,4}/g) || []);
    if (r.imageChecked) { img++; continue; }
    const t2 = ocr('ocr2', r.pdf);
    if (!t2) { console.log(`NO-OCR2 ${f} PDF ${r.pdf}`); bad++; continue; }
    const miss = years.filter((y) => !N(t2).includes(y));
    if (miss.length) { console.log(`CHECK ${f} PDF ${r.pdf}: ${miss.join(', ')} of "${r.date}" not in second OCR pass`); bad++; } else second++;
  }
}
console.log(`check-source: ${n} rows, ${bad} problems; ${second} confirmed by the second OCR pass, ${img} read from the page image.`);
process.exit(bad ? 1 : 0);
