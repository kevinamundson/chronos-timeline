#!/usr/bin/env node
// Verifies every curated Herodotus quote against the private PDF (never committed) and the public Wikisource text.
//   HERODOTUS_SRC=/workspace/herodotus-src node scripts/herodotus/check-source.mjs [--fix]
// For each row: the quote must occur in the stated Book.chapter of the PDF text (letters/digits compared, so line-break
// hyphenation and punctuation do not matter) and on the stated PDF page (or the page where the quote begins).
// --fix rewrites wrong page numbers in the rows files. Writes ws-index.json (which quotes Wikisource also contains).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.HERODOTUS_SRC || '/workspace/herodotus-src';
const PDF = join(SRC, 'herodotus-rawlinson.pdf');
if (!existsSync(PDF)) { console.log(`check-source: ${PDF} not found; skipped (the PDF is a private copy).`); process.exit(0); }
const N = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const cache = join(SRC, 'pages'); mkdirSync(cache, { recursive: true });
const nPages = +execFileSync('pdfinfo', [PDF]).toString().match(/Pages:\s+(\d+)/)[1];
const pages = [];
for (let p = 1; p <= nPages; p++) { const f = join(cache, `${p}.txt`); if (!existsSync(f)) execFileSync('pdftotext', ['-f', `${p}`, '-l', `${p}`, PDF, f]); pages[p] = readFileSync(f, 'utf8'); }
// chapter index: Book headings "BOOK n", chapter markers "[n]"
const chap = {}; let book = 0, ch = 0;
for (let p = 1; p <= nPages; p++) for (const L of pages[p].split('\n')) {
  const bm = L.match(/^BOOK (\d)\s*$/); if (bm) { book = +bm[1]; ch = 0; continue; }
  if (!book || /^(A ROMAN ROADS ETEXT|HERODOTUS: THE HISTORIES|\d+)\s*$/.test(L)) continue;
  const re = /\[(\d+)\]/g; let last = 0, m;
  while ((m = re.exec(L))) { const n = +m[1]; if (n === ch + 1 || n === ch + 2) { if (ch) chap[`${book}.${ch}`].text += L.slice(last, m.index) + ' '; ch = n; chap[`${book}.${ch}`] = { pages: [p], text: '' }; last = m.index + m[0].length; } }
  if (ch) { const c = chap[`${book}.${ch}`]; c.text += L.slice(last) + ' '; if (!c.pages.includes(p)) c.pages.push(p); }
}
// Wikisource (public domain) raw text, cached
const wsDir = join(SRC, 'ws'); mkdirSync(wsDir, { recursive: true });
const ws = {}; const wsPlain = {};
for (let b = 1; b <= 9; b++) {
  const f = join(wsDir, `b${b}.wiki`);
  if (!existsSync(f)) execFileSync('curl', ['-sL', '-o', f, `https://en.wikisource.org/w/index.php?title=The_History_of_Herodotus_(Rawlinson)/Book_${b}&action=raw`]);
  const plain = readFileSync(f, 'utf8').replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/\{\{[^}]*\}\}/g, ' ').replace(/'''?/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  wsPlain[b] = plain;
  ws[b] = N(readFileSync(f, 'utf8').replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/\{\{[^}]*\}\}/g, ' '));
}
const files = readdirSync(here).filter((f) => /^rows-.*\.mjs$/.test(f)).sort();
let bad = 0, fixed = 0, total = 0; const wsIndex = {};
for (const f of files) {
  const { rows } = await import(pathToFileURL(join(here, f)).href);
  let text = readFileSync(join(here, f), 'utf8');
  for (const r of rows) {
    total++;
    const c = chap[r.ref]; const q = N(r.quote);
    if (!c) { console.log(`BAD ${f} ${r.ref}: no such chapter`); bad++; continue; }
    if (!N(c.text).includes(q)) { console.log(`BAD ${f} ${r.ref}: quote not in chapter: "${r.quote.slice(0, 70)}"`); bad++; continue; }
    const head = q.slice(0, 30);
    let pg = c.pages.find((p) => N(pages[p]).includes(head)) ?? c.pages.find((p) => N(pages[p]).includes(q.slice(0, 12)));
    if (pg == null) pg = c.pages[0];
    if (pg !== r.page) {
      if (process.argv.includes('--fix')) { const from = `R('${r.ref}', ${r.page}, ${JSON.stringify(r.quote).slice(0, 1)}`; const i = text.indexOf(`R('${r.ref}', ${r.page}, '${r.quote.slice(0, 20).replace(/'/g, "\\'")}`); if (i >= 0) { text = text.slice(0, i) + `R('${r.ref}', ${pg}, ` + text.slice(i + `R('${r.ref}', ${r.page}, `.length); fixed++; } else { console.log(`cannot fix ${r.ref} (${from})`); bad++; } }
      else { console.log(`PAGE ${f} ${r.ref}: row says ${r.page}, quote starts on PDF p. ${pg}`); bad++; }
    }
    // exact words for a text-fragment link: the longest leading run (8 down to 3 words) found literally in the Wikisource text
    let frag = false;
    if (ws[+r.ref.split('.')[0]].includes(q)) { const w = r.quote.split(/\s+/); for (let k = Math.min(8, w.length); k >= 3 && !frag; k--) { const c = w.slice(0, k).join(' ').replace(/[,;:.!?()]+$/, ''); if (wsPlain[+r.ref.split('.')[0]].includes(c.toLowerCase())) frag = c; } if (!frag) frag = true; }
    wsIndex[`${r.ref}|${r.quote}`] = frag;
  }
  if (process.argv.includes('--fix')) writeFileSync(join(here, f), text);
}
writeFileSync(join(here, 'ws-index.json'), JSON.stringify(wsIndex, null, 0) + '\n');
console.log(`check-source: ${total} quotes, ${bad} problems${fixed ? `, ${fixed} page numbers fixed` : ''}; ${Object.values(wsIndex).filter(Boolean).length} also found in the Wikisource text, ${Object.values(wsIndex).filter((v) => typeof v === 'string').length} with an exact text-fragment link.`);
process.exit(bad ? 1 : 0);
