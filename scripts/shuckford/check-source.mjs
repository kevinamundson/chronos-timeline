#!/usr/bin/env node
// Confirm each stored year-number occurs in the OCR of that facsimile page.
// Image-reading is the authority. This only catches a year that the OCR also missed.
// Skipped, exit 0, when the PDF is not on this machine.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rows } from './rows.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const candidates = [
  process.env.SHUCKFORD_PDF,
  join(here, '..', '..', 'private-src', 'shuckford', 'volume1.pdf'),
  '/Users/kevinamundson/Downloads/The Sacred and Profane History of the World (Samuel Shuckford  James Creighton).pdf',
].filter(Boolean);
const pdf = candidates.find((p) => existsSync(p));
if (!pdf) {
  console.log('shuckford check-source: PDF absent, skipped');
  process.exit(0);
}

const textPath = join(here, '..', '..', 'private-src', 'shuckford', 'vol1-ocr.txt');
if (!existsSync(textPath)) {
  console.log('shuckford check-source: OCR text absent, skipped');
  process.exit(0);
}
const raw = readFileSync(textPath, 'utf8');
const parts = raw.split(/\n===== PDF (\d+) =====\n/);
const pages = {};
for (let i = 1; i < parts.length; i += 2) pages[Number(parts[i])] = parts[i + 1] || '';

let fail = 0;
for (const row of rows) {
  const body = (pages[row.pdf] || '').replace(/\s+/g, '');
  const years = [row.year_am, row.year_am_end, row.year_bc != null ? -row.year_bc : null].filter((n) => n != null && n >= 100);
  for (const n of years) {
    if (!body.includes(String(n))) {
      console.log(`MISSING p. ${row.page} (PDF ${row.pdf}) ${n}: ${row.date.slice(0, 80)}`);
      fail++;
    }
  }
}
if (fail) {
  console.log(`shuckford check-source: ${fail} year-numbers not found in the OCR`);
  process.exit(1);
}
console.log(`shuckford check-source: ${rows.length} statements, year-numbers present in the OCR of ${pdf}`);
