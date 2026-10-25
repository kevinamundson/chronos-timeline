#!/usr/bin/env node
// Import Shuckford, Sacred and Profane History, vol. 1 (1819, ed. Creighton),
// as the display-only chronology "shuckford". Idempotent:
//   node scripts/shuckford/import.mjs
// Strips previous shuckford entries and writes them again from scripts/shuckford/rows.mjs.
// Never recomputes sorting_year or sorting_basis. A change to either throws before any write.
// New people are tier "none". Anno Mundi stays Anno Mundi. A BC year is stored only when
// the printed words are "before Christ" or "before our Saviour".
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SRC, ITEM, MARK, CHRON, pageLink, citation } from './edition.mjs';
import { people as NEW_PEOPLE } from './records.mjs';
import { rows } from './rows.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const CFAH_NULL = () => ({
  source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown',
  citation: null, link: null, note: 'pending CFAH reference (no CFAH anchor point or Table 1 entry found for this)',
});

const recs = {};
for (const dir of ['events', 'people']) {
  for (const f of readdirSync(join(DATA, dir)).filter((name) => name.endsWith('.json'))) {
    const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8'));
    recs[doc.id] = { dir, doc, dirty: false };
  }
}
const sortSnap = new Map();
for (const [id, r] of Object.entries(recs)) {
  sortSnap.set(id, JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null }));
}
const touch = (id) => { recs[id].dirty = true; };
const uniq = (a) => [...new Set(a)];

for (const [id, r] of Object.entries(recs)) {
  const d = r.doc;
  const lists = d.type === 'event' ? [d.chronologies] : Object.values(d.dates || {});
  let hit = false;
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].source === CHRON) { list.splice(i, 1); hit = true; }
  }
  if (d.sources?.includes(SRC)) { d.sources = d.sources.filter((s) => s !== SRC); hit = true; }
  if (d.free_source_links?.some((l) => l.source_id === SRC)) {
    d.free_source_links = d.free_source_links.filter((l) => l.source_id !== SRC);
    hit = true;
  }
  if (hit) touch(id);
}

for (const [id, p] of Object.entries(NEW_PEOPLE)) {
  if (recs[id]) continue;
  recs[id] = {
    dir: 'people', dirty: true,
    doc: {
      $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title,
      summary: p.summary,
      description: `${MARK}. Display only. Shuckford’s years are Anno Mundi, or a “years before Christ” figure he is reporting. This chronology never sets a sort, and no tier 1–4 chronology dates this person’s birth, so there is no sort year.`,
      sorting_year: null,
      sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year (Shuckford is display-only).' },
      father: null, children: [],
      dates: { birth: [CFAH_NULL()] },
      events: [], scripture_refs: [], sources: [SRC], related: [], free_source_links: [],
    },
  };
}

const addLink = (d) => {
  d.sources ||= [];
  if (!d.sources.includes(SRC)) d.sources.push(SRC);
  d.free_source_links ||= [];
  if (!d.free_source_links.some((l) => l.source_id === SRC)) {
    d.free_source_links.push({ source_id: SRC, url: ITEM, locator: '1819 Creighton edition, vol. 1, full view' });
  }
};

const amOf = (list) => (list || []).find((e) => e.source !== CHRON && e.year_am != null);
const yl = (y) => (y == null ? '' : y < 0 ? `${-y} BC` : `AD ${y}`);

function compare(list, row, rec) {
  if (row.st) return { st: row.st, cmp: '' };
  if (row.year_am != null) {
    const other = amOf(list);
    if (!other) return { st: 'n/a', cmp: 'no other Anno Mundi on this slot' };
    const same = other.year_am === row.year_am && (row.year_am_end == null || other.year_am_end == null || other.year_am_end === row.year_am_end);
    const diff = Math.abs(other.year_am - row.year_am);
    return {
      st: same ? 'agrees' : `CONFLICT (${diff} yrs)`,
      cmp: `${other.source} AM ${other.year_am}`,
    };
  }
  if (row.year_bc != null) {
    const y = rec.doc.sorting_year;
    if (y == null) return { st: 'n/a', cmp: 'record has no sort year' };
    const diff = Math.abs(y - row.year_bc);
    return { st: y === row.year_bc ? 'agrees' : `CONFLICT (${diff} yrs)`, cmp: `sort year ${yl(y)}` };
  }
  return { st: 'n/a', cmp: '' };
}

const extract = [];
for (const row of rows) {
  if (!row.date) throw new Error(`p. ${row.page}: missing date`);
  if (!row.page || !row.pdf || !row.book) throw new Error(`p. ${row.page}: missing page, pdf, or book`);
  if (row.year_am != null && (!Number.isInteger(row.year_am) || row.year_am <= 0)) throw new Error(`p. ${row.page}: year_am must be a positive integer`);
  if (row.year_am_end != null && (!Number.isInteger(row.year_am_end) || row.year_am_end < row.year_am)) throw new Error(`p. ${row.page}: year_am_end`);
  if (row.year_bc != null) {
    if (!Number.isInteger(row.year_bc) || row.year_bc >= 0) throw new Error(`p. ${row.page}: year_bc must be a negative BC year`);
    if (!/before Christ|before our Saviour/i.test(row.date)) throw new Error(`p. ${row.page}: a BC year requires the printed words “before Christ” or “before our Saviour”`);
    if (row.year_am != null) throw new Error(`p. ${row.page}: both AM and BC stored`);
  }
  const entry = {
    source: CHRON,
    date: row.date,
    year_am: row.year_am ?? null,
    year_am_end: row.year_am_end ?? null,
    year_bc_ad: row.year_bc ?? null,
    year_bc_ad_end: null,
    precision: row.prec,
    citation: citation(row.page, row.pdf, row.book),
    link: pageLink(row.page),
    source_text_id: SRC,
    note: row.note || null,
  };
  const mapped = [];
  const personIds = [];
  const eventIds = [];
  for (const t of row.targets) {
    const [id, slot] = t.split(':');
    const r = recs[id];
    if (!r) throw new Error(`p. ${row.page}: unknown target ${t}`);
    const d = r.doc;
    let list;
    if (d.type === 'event') {
      if (slot) throw new Error(`p. ${row.page}: event target ${t} must not name a slot`);
      if (!d.chronologies.some((e) => e.source === 'cfah')) throw new Error(`${id}: event has no cfah entry`);
      list = d.chronologies;
      eventIds.push(id);
    } else if (d.type === 'person') {
      if (!slot) throw new Error(`p. ${row.page}: person target ${t} needs a slot`);
      if (!['birth', 'death', 'translated', 'reign'].includes(slot)) throw new Error(`p. ${row.page}: bad slot ${slot}`);
      if (!d.dates[slot]) d.dates[slot] = [CFAH_NULL()];
      else if (!d.dates[slot].some((e) => e.source === 'cfah')) throw new Error(`${id}: ${slot} has no cfah entry`);
      list = d.dates[slot];
      personIds.push(id);
    } else throw new Error(`p. ${row.page}: target ${t} is a ${d.type}`);
    const cmp = compare(list, row, r);
    list.push(entry);
    addLink(d);
    touch(id);
    mapped.push({ id, slot: slot || null, isNew: !!d.description?.startsWith(MARK), ...cmp });
  }
  for (const eid of eventIds) {
    const people = recs[eid].doc.people;
    for (const pid of personIds) if (people && !people.includes(pid)) { people.push(pid); touch(eid); }
  }
  const st = row.st || (mapped.length ? uniq(mapped.map((m) => m.st)).join('; ') : 'n/a');
  const cmp = uniq(mapped.map((m) => m.cmp).filter(Boolean)).join('; ');
  extract.push({ ...row, mapped, link: entry.link, st, cmp });
}

for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type !== 'person' || !r.doc.description?.startsWith(MARK)) continue;
  const ev = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people?.includes(id)).map((x) => x.doc.id).sort();
  if (JSON.stringify(ev) !== JSON.stringify([...(r.doc.events || [])].sort())) { r.doc.events = ev; touch(id); }
}
for (const id of Object.keys(NEW_PEOPLE)) {
  const d = recs[id]?.doc;
  if (!d) throw new Error(`${id}: missing`);
  const lists = Object.values(d.dates || {});
  if (!lists.some((list) => list.some((e) => e.source === CHRON))) throw new Error(`${id}: new person received no shuckford entry`);
}

for (const [id, r] of Object.entries(recs)) {
  const now = JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null });
  const before = sortSnap.get(id);
  if (before == null) {
    if (r.doc.type !== 'person' || r.doc.sorting_year !== null || r.doc.sorting_basis?.tier !== 'none') {
      throw new Error(`${id}: a new Shuckford record must be an unsorted person`);
    }
    continue;
  }
  if (now !== before) throw new Error(`${id}: sort changed (${before} -> ${now})`);
}

let wrote = 0;
for (const [id, r] of Object.entries(recs)) {
  if (!r.dirty) continue;
  const path = join(DATA, r.dir, `${id}.json`);
  const text = `${JSON.stringify(r.doc, null, 2)}\n`;
  if (!existsSync(path) || readFileSync(path, 'utf8') !== text) { writeFileSync(path, text); wrote++; }
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const books = uniq(extract.map((r) => r.book));
let md = `# Shuckford, The Sacred and Profane History of the World Connected (1819, ed. James Creighton): dated statements\n\n`;
md += `Generated by \`scripts/shuckford/import.mjs\` from \`scripts/shuckford/rows.mjs\`. Do not edit by hand.\n\n`;
md += `- **Edition read:** Samuel Shuckford, *The Sacred and Profane History of the World Connected*, fifth edition, revised, corrected, and greatly improved by James Creighton, B.A. Four volumes. Volume I. London: printed for William Baynes, Paternoster Row, 1819. The title page prints “THE FIFTH EDITION” and “MDCCCXIX”. The advertisement says the work was last published in 1808. An advertisement to the fourth edition is bound in front.\n`;
md += `- **Copy opened:** a Tolle Lege Press facsimile of that fifth edition, volume 1 (ISBN 978-1-60702-153-7; the facsimile title leaf says “Facsimile of Fifth Edition, 4-Volume Series, printed 1819 for William Baynes”). The facsimile is a modern reprint. Its text is the 1819 edition. The PDF, the scan, and the OCR stay in \`private-src/shuckford/\` and are not committed.\n`;
md += `- **Public-domain link:** Internet Archive item [\`sacredprofanehis01shuc\`](${ITEM}), Princeton Theological Seminary Library, full view, publication date 1819, “Possible copyright status: NOT_IN_COPYRIGHT”. The same title page (Creighton, fifth edition, William Baynes, MDCCCXIX) was read in the item’s text. Printed page 13 was opened at \`page/n100\` and shows Anno Mundi 1656. Printed page 44 was opened at \`page/n131\` and shows the Hebrew table. Printed page 246 was opened at \`page/n339\` and shows Athothes at A. M. 2034 and Diabies at A. M. 2053. Other links use that item’s page-number index in the same way. Public domain in the United States: published 1819, which is 1930 or earlier.\n`;
md += `- **This pass:** volume 1 only. The supplied PDF has no volume 2, 3, or 4. Every Anno Mundi statement the facsimile OCR found in the body (Books I–V, printed pp. 1–331) was opened on the page image and is below. The preface says he counts years from the Creation, and that tables adjusting those years to the Julian period and the Christian era will come when the whole work is done. Those tables are not in this volume. Bishop Clayton’s strictures, bound in the front matter, are not Shuckford’s chronology and are not entered. No marginal year-column was seen on the pages that were opened.\n`;
md += `- **Display only:** \`shuckford\` never sets a sort year. \`year_am\` is the Anno Mundi printed on the page. \`year_bc_ad\` is set only when the page prints “before Christ” or “before our Saviour”. Anno Mundi is not converted to BC. A year worked out by subtraction is labelled DERIVED in the note and is not stored.\n`;
md += `- **Not mapped:** a statement whose event does not already exist. A new event would need a sorting year, and this chronology must not supply one. The statement is quoted here and is not written onto a record.\n`;
md += `- **Status:** agrees / CONFLICT / CONFLICT (internal) / internal / framework / n/a. Framework means the figure is a chronology Shuckford sets out and does not follow. Scripture, in the Masoretic text, governs. Nothing here changes a sort year.\n\n`;

md += `## Summary\n\n| Book | Statements | Mapped | Not mapped | Conflicts (incl. internal and framework) |\n|---|---|---|---|---|\n`;
for (const book of books) {
  const rs = extract.filter((r) => r.book === book);
  md += `| ${book} | ${rs.length} | ${rs.filter((r) => r.mapped.length).length} | ${rs.filter((r) => !r.mapped.length).length} | ${rs.filter((r) => /CONFLICT|framework/.test(r.st)).length} |\n`;
}
md += `| **All** | **${extract.length}** | **${extract.filter((r) => r.mapped.length).length}** | **${extract.filter((r) => !r.mapped.length).length}** | **${extract.filter((r) => /CONFLICT|framework/.test(r.st)).length}** |\n\n`;

for (const book of books) {
  const rs = extract.filter((r) => r.book === book);
  md += `## Book ${book}\n\n| Statement (as printed) | Printed p. | Facsimile PDF p. | Record | Compared with | Status | Note |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rs) {
    const rec = r.mapped.length ? r.mapped.map((m) => `${m.id}${m.slot ? ` (${m.slot})` : ''}`).join(', ') : '—';
    md += `| ${esc(r.date)} | ${r.page} | ${r.pdf} | ${esc(rec)} | ${esc(r.cmp)} | ${esc(r.st)} | ${esc(r.note)} |\n`;
  }
  md += `\n`;
}

const created = Object.values(recs).filter((r) => r.doc.description?.startsWith(MARK));
md += `## Records\n\n`;
md += `- People created, unsorted: ${created.map((r) => r.doc.id).sort().join(', ') || 'none'}.\n`;
md += `- Records with a Shuckford entry: ${extract.reduce((n, r) => n + r.mapped.length, 0)} attachments across ${new Set(extract.flatMap((r) => r.mapped.map((m) => m.id))).size} records.\n`;
md += `- Files rewritten this run: ${wrote}.\n`;

writeFileSync(join(DATA, 'shuckford-dates-extract.md'), md);
console.log(`shuckford: ${extract.length} statements, ${wrote} files, ${created.length} new people`);
