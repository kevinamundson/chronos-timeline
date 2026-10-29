#!/usr/bin/env node
// Jones 21st ed. (2019) as a display-only comparison. Idempotent:
//   node scripts/jones/import-2019.mjs
// Adds one jones-2019 chronology entry on each listed event.
// Never writes sorting_year, sorting_basis, or sort_order_within_year.
// Throws before any write if one of those would change.
//
// Not imported (Kevin, 2026-10-28): Moses' death (AM only; no portal record)
// and the p. 262 encampment-table heading (no portal record). Both are
// documented in docs/OPEN-QUESTIONS-FOR-KEVIN.md (M6).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARCHIVE = 'https://web.archive.org/web/20221023135542/https://www.floydnolenjonesministries.com/files/135786316.pdf';
const SRC = 'jones-chronology-ot-2019';
const CHRON = 'jones-2019';
const GOV = 'jones-chronology-ot-2026';
const LOCATOR = 'Appendix F, printed p. 280';

// Years and the printed-page cite only. Negative year_bc_ad is BC.
// Hand-read from the 21st ed. (2019) and checked against the 23rd ed. (2026).
const ROWS = [
  { id: 'esther-made-queen', am: 3490, y: -514, am26: 3490, y26: -515 },
  { id: 'ahasuerus-sleepless-night', am: 3495, y: -510, am26: 3495, y26: -509 },
  { id: 'haman-hanged', am: 3495, y: -510, am26: 3495, y26: -509 },
  { id: 'martyrdom-of-stephen', am: 4033, y: 30, am26: 4035, y26: 32 },
  { id: 'conversion-of-paul', am: 4035, y: 32, am26: 4036, y26: 33 },
  { id: 'paul-stoned-at-lystra', am: 4049, y: 46, am26: 4048, y26: 45 },
  { id: 'second-missionary-journey', am: 4056, y: 53, am26: 4055, y26: 51 },
  { id: 'third-missionary-journey', am: 4059, y: 56, am26: 4059, y26: 54 },
  { id: 'paul-arrested-at-the-temple', am: 4063, y: 60, am26: 4063, y26: 58 },
  { id: 'paul-before-felix', am: 4063, y: 60, am26: 4063, y26: 58 },
  { id: 'festus-procurator', am: 4065, y: 62, am26: 4065, y26: 60 },
  { id: 'paul-before-festus-and-agrippa', am: 4065, y: 62, am26: 4065, y26: 60 },
  { id: 'paul-arrives-in-rome', am: 4066, y: 63, am26: 4066, y26: 61 },
  { id: 'persecution-under-nero', am: 4067, y: 64, am26: 4068, y26: 64 },
  { id: 'paul-released', am: 4068, y: 65, am26: 4068, y26: 63 },
];

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = join(root, 'data');

function printed(am, y) {
  const era = y < 0 ? `${-y} BC` : `AD ${y}`;
  return `${am} AM, ${era}`;
}

function sortSnap(doc) {
  return JSON.stringify({
    sorting_year: Object.prototype.hasOwnProperty.call(doc, 'sorting_year') ? doc.sorting_year : undefined,
    sorting_basis: Object.prototype.hasOwnProperty.call(doc, 'sorting_basis') ? doc.sorting_basis : undefined,
    sort_order_within_year: Object.prototype.hasOwnProperty.call(doc, 'sort_order_within_year') ? doc.sort_order_within_year : undefined,
  });
}

function entryFor(row) {
  return {
    source: CHRON,
    date: printed(row.am, row.y),
    year_am: row.am,
    year_bc_ad: row.y,
    precision: 'year',
    citation: `Jones, The Chronology of the Old Testament: A Return to the Basics, 21st ed. (Master Books, 2019), ${LOCATOR}`,
    link: ARCHIVE,
    source_text_id: SRC,
    note: `21st ed. (2019) differs; the 23rd ed. (2026) sets the sort: ${printed(row.am26, row.y26)}.`,
  };
}

function placeAfter(list, sourceId, item) {
  const rest = list.filter((x) => (typeof x === 'string' ? x !== sourceId : x.source_id !== sourceId));
  const key = (x) => (typeof x === 'string' ? x : x.source_id);
  const at = rest.findIndex((x) => key(x) === GOV);
  if (at >= 0) rest.splice(at + 1, 0, item);
  else rest.push(item);
  return rest;
}

const recs = {};
for (const f of readdirSync(join(DATA, 'events')).filter((name) => name.endsWith('.json'))) {
  const text = readFileSync(join(DATA, 'events', f), 'utf8');
  const doc = JSON.parse(text);
  recs[doc.id] = { text, doc };
}
const snaps = new Map(Object.entries(recs).map(([id, r]) => [id, sortSnap(r.doc)]));
const wanted = new Set(ROWS.map((row) => row.id));

for (const row of ROWS) {
  if (!Number.isInteger(row.am) || !Number.isInteger(row.y) || row.y === 0) throw new Error(`${row.id}: bad 2019 year`);
  if (!Number.isInteger(row.am26) || !Number.isInteger(row.y26) || row.y26 === 0) throw new Error(`${row.id}: bad 2026 year`);
  if (row.am === row.am26 && row.y === row.y26) throw new Error(`${row.id}: editions agree; do not add a row`);
  const rec = recs[row.id];
  if (!rec) throw new Error(`${row.id}: record not found`);
  if (rec.doc.type !== 'event') throw new Error(`${row.id}: not an event`);
  const list = rec.doc.chronologies;
  if (!Array.isArray(list)) throw new Error(`${row.id}: no chronologies`);
  for (let i = list.length - 1; i >= 0; i--) if (list[i].source === CHRON) list.splice(i, 1);
  const gov = list.find((e) => e.source === 'ussher-jones' && e.source_text_id === GOV && e.year_am === row.am26 && e.year_bc_ad === row.y26);
  if (!gov) throw new Error(`${row.id}: 23rd-edition ${printed(row.am26, row.y26)} not found; refusing to attach a 2019 comparison`);
  list.splice(list.indexOf(gov) + 1, 0, entryFor(row));
  rec.doc.sources = placeAfter(rec.doc.sources || [], SRC, SRC);
  rec.doc.free_source_links = placeAfter(rec.doc.free_source_links || [], SRC, {
    source_id: SRC,
    url: ARCHIVE,
    locator: LOCATOR,
  });
}

for (const [id, rec] of Object.entries(recs)) {
  if (sortSnap(rec.doc) !== snaps.get(id)) throw new Error(`${id}: sorting_year, sorting_basis, or sort_order_within_year would change`);
  const extras = (rec.doc.chronologies || []).filter((e) => e.source === CHRON);
  if (!wanted.has(id) && extras.length) throw new Error(`${id}: unexpected jones-2019 entry`);
  if (wanted.has(id) && extras.length !== 1) throw new Error(`${id}: expected one jones-2019 entry, found ${extras.length}`);
}

let written = 0;
let entries = 0;
for (const [id, rec] of Object.entries(recs)) {
  entries += (rec.doc.chronologies || []).filter((e) => e.source === CHRON).length;
  const next = `${JSON.stringify(rec.doc, null, 2)}\n`;
  if (next === rec.text) continue;
  writeFileSync(join(DATA, 'events', `${id}.json`), next);
  written += 1;
}
if (entries !== ROWS.length) throw new Error(`expected ${ROWS.length} jones-2019 entries, found ${entries}`);
console.log(`jones-2019 entries: ${entries}; files written: ${written}`);
