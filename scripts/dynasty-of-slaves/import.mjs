#!/usr/bin/env node
// Import Dynasty of Slaves (BLK SHP Scott, 2026) as the display-only chronology
// "dynasty-of-slaves". Idempotent:
//   node scripts/dynasty-of-slaves/import.mjs
// Strips previous entries and writes them again from scripts/dynasty-of-slaves/rows.mjs.
// Never changes sorting_year or sorting_basis. A change throws before any write.
// New people are tier "none". This chronology is not a provisional tier.
// A stored BC year must be digits he prints. Intervals and regnal years stay null.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blbFromOsis } from '../blb.mjs';
import { tierPick, TIER_NAME } from '../sort-rule.mjs';
import { applyStandby, computeStandby, makeStandbyContext } from '../standby/compute.mjs';
import { SRC, CHRON, MARK, LISTING, citation } from './edition.mjs';
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
const rawText = new Map();
for (const dir of ['events', 'people']) {
  for (const f of readdirSync(join(DATA, dir)).filter((name) => name.endsWith('.json'))) {
    const path = join(DATA, dir, f);
    const raw = readFileSync(path, 'utf8');
    const doc = JSON.parse(raw);
    recs[doc.id] = { dir, doc, dirty: false, raw, stable: `${JSON.stringify(doc, null, 2)}\n` === raw };
    rawText.set(doc.id, raw);
  }
}
const sortSnap = new Map();
const standbySnap = new Map();
for (const [id, r] of Object.entries(recs)) {
  sortSnap.set(id, JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null }));
  standbySnap.set(id, r.doc.standby ?? null);
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
  if (recs[id]) {
    if (!recs[id].doc.description?.startsWith(MARK)) throw new Error(`${id}: id already exists and was not created by this import`);
    continue;
  }
  if (!['birth', 'reign'].includes(p.slot)) throw new Error(`${id}: shell slot must be birth or reign`);
  recs[id] = {
    dir: 'people', dirty: true, raw: null, stable: true,
    doc: {
      $schema: '../../schema/person.schema.json',
      id,
      type: 'person',
      title: p.title,
      summary: p.summary,
      description: `${MARK}. Display only. Scott’s synchronisms are his view. This chronology never sets a sort, and no tier 1–4 chronology dates this person, so there is no sort year.`,
      sorting_year: null,
      sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year (Dynasty of Slaves is display-only and never sets a sort).' },
      father: null,
      children: [],
      dates: { [p.slot]: [CFAH_NULL()] },
      events: [],
      scripture_refs: p.scripture || [],
      sources: [SRC],
      related: [],
      free_source_links: [],
    },
  };
}

const addSource = (d) => {
  d.sources ||= [];
  if (!d.sources.includes(SRC)) d.sources.push(SRC);
};

const yl = (y) => (y < 0 ? `${-y} BC` : `AD ${y}`);
const fmt = (y, end) => (end == null ? yl(y) : `${yl(y)}–${yl(end)}`);

function span(y, end) {
  const b = end ?? y;
  return [Math.min(y, b), Math.max(y, b)];
}
function relation(y, yEnd, oy, oyEnd) {
  const [a1, a2] = span(y, yEnd);
  const [b1, b2] = span(oy, oyEnd);
  if (a1 === b1 && a2 === b2) return 'agrees';
  if (a1 <= b2 && b1 <= a2) return 'consistent';
  const diff = a1 > b2 ? a1 - b2 : b1 - a2;
  if (diff === 1) return 'close (1 yr)';
  return `CONFLICT (${diff} yrs)`;
}
function compare(list, row, slot) {
  if (row.y == null) return { st: 'n/a', cmp: 'no BC year stored' };
  const pick = tierPick(list, { preferJones23: slot === 'reign' });
  if (pick) {
    return {
      st: relation(row.y, row.yEnd, pick.year, pick.entry.year_bc_ad_end ?? null),
      cmp: `${TIER_NAME[pick.tier] || pick.tier}: ${fmt(pick.year, pick.entry.year_bc_ad_end ?? null)}`,
    };
  }
  const paper = (list || []).find((e) => e.source === 'cfah' && e.cfah_basis === 'paper_text' && e.year_bc_ad != null);
  if (!paper) return { st: 'n/a', cmp: 'no tier 1–4 year' };
  return {
    st: relation(row.y, row.yEnd, paper.year_bc_ad, paper.year_bc_ad_end ?? null),
    cmp: `CFAH paper_text (not a sort tier): ${fmt(paper.year_bc_ad, paper.year_bc_ad_end ?? null)}`,
  };
}

const BANNED = /private-src|Proton|proton\.me|drive\.google|Magdalein/i;
const extract = [];
for (const row of rows) {
  if (!row.date) throw new Error(`${row.ch} / ${row.sec}: missing date`);
  if (row.date.length > 80) throw new Error(`${row.ch} / ${row.sec}: date phrase too long`);
  if ((row.note || '').length > 400) throw new Error(`${row.ch} / ${row.sec}: note longer than 400`);
  if (BANNED.test(`${row.date} ${row.note} ${row.sec}`)) throw new Error(`${row.ch} / ${row.sec}: banned text`);
  if (row.y != null && (!Number.isInteger(row.y) || row.y >= 0)) throw new Error(`${row.ch}: year must be a negative BC year`);
  if (row.yEnd != null && (!Number.isInteger(row.yEnd) || row.yEnd >= 0 || row.y == null || row.yEnd < row.y)) throw new Error(`${row.ch}: bad year end`);
  if (row.y != null && !row.date.includes(String(-row.y))) throw new Error(`${row.ch} / ${row.sec}: date must contain ${-row.y}`);
  if (row.yEnd != null && !row.date.includes(String(-row.yEnd))) throw new Error(`${row.ch} / ${row.sec}: date must contain ${-row.yEnd}`);
  if (row.yEnd != null && row.prec !== 'year-range') throw new Error(`${row.ch}: a range needs precision year-range`);
  const cite = citation(row.ch, row.sec);
  const link = row.ref ? blbFromOsis(row.ref) : LISTING;
  if (!link) throw new Error(`${row.ch} / ${row.sec}: bad scripture ref ${row.ref}`);
  if (row.kind === 'unmapped') {
    if (row.targets.length) throw new Error(`${row.ch}: unmapped row has targets`);
    extract.push({ ...row, cite, link, mapped: [], st: 'not mapped', cmp: '' });
    continue;
  }
  if (!row.targets.length) throw new Error(`${row.ch} / ${row.sec}: no target`);
  const entry = {
    source: CHRON,
    date: row.date,
    year_am: null,
    year_bc_ad: row.y,
    year_bc_ad_end: row.yEnd,
    precision: row.prec,
    citation: cite,
    link,
    source_text_id: SRC,
    note: row.note,
  };
  const mapped = [];
  for (const t of row.targets) {
    const [id, slot] = t.split(':');
    const r = recs[id];
    if (!r) throw new Error(`${row.ch} / ${row.sec}: unknown target ${t}`);
    const d = r.doc;
    let list;
    if (d.type === 'event') {
      if (slot) throw new Error(`${t}: event target must not name a slot`);
      list = d.chronologies;
    } else if (d.type === 'person') {
      if (!slot || !['birth', 'death', 'translated', 'reign'].includes(slot)) throw new Error(`${t}: bad slot`);
      d.dates ||= {};
      if (!d.dates[slot]) d.dates[slot] = [];
      if (!d.dates[slot].some((e) => e.source === 'cfah')) d.dates[slot].unshift(CFAH_NULL());
      list = d.dates[slot];
    } else throw new Error(`${t}: not a person or event`);
    const cmp = compare(list, row, slot || null);
    list.push(entry);
    addSource(d);
    touch(id);
    mapped.push({
      id,
      slot: slot || null,
      isNew: !!d.description?.startsWith(MARK),
      ...cmp,
    });
  }
  let st = uniq(mapped.map((m) => m.st)).join('; ');
  if (row.extra && !st.includes(row.extra)) st = `${st}; ${row.extra}`;
  const cmp = uniq(mapped.map((m) => m.cmp).filter(Boolean)).join('<br>');
  extract.push({ ...row, cite, link, mapped, st, cmp });
}

for (const id of Object.keys(NEW_PEOPLE)) {
  const d = recs[id]?.doc;
  if (!d) throw new Error(`${id}: missing`);
  const lists = Object.values(d.dates || {});
  if (!lists.some((list) => list.some((e) => e.source === CHRON))) throw new Error(`${id}: new person received no entry`);
}

const chronDoc = JSON.parse(readFileSync(join(DATA, 'chronologies.json'), 'utf8'));
const kingDoc = JSON.parse(readFileSync(join(DATA, 'king-lists.json'), 'utf8'));
if (!chronDoc.chronologies.some((c) => c.id === CHRON)) throw new Error('chronologies.json has no dynasty-of-slaves entry');
for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type !== 'person' || !r.doc.description?.startsWith(MARK)) continue;
  const ctx = makeStandbyContext({
    records: Object.values(recs).map((x) => x.doc),
    chronologies: chronDoc.chronologies,
    kingLists: kingDoc.lists || [],
  });
  r.doc = applyStandby(r.doc, computeStandby(r.doc, ctx));
  touch(id);
}
const ctx = makeStandbyContext({
  records: Object.values(recs).map((x) => x.doc),
  chronologies: chronDoc.chronologies,
  kingLists: kingDoc.lists || [],
});
for (const [id, r] of Object.entries(recs)) {
  const now = JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null });
  const before = sortSnap.get(id);
  if (before == null) {
    if (r.doc.type !== 'person' || r.doc.sorting_year !== null || r.doc.sorting_basis?.tier !== 'none') {
      throw new Error(`${id}: a new record must be an unsorted person`);
    }
  } else if (now !== before) throw new Error(`${id}: sort changed`);
  if (r.doc.description?.startsWith(MARK)) {
    const expected = computeStandby(r.doc, ctx);
    if (JSON.stringify(r.doc.standby ?? null) !== JSON.stringify(expected ?? null)) {
      throw new Error(`${id}: standby does not match computeStandby`);
    }
    continue;
  }
  if (!r.dirty) continue;
  const expected = computeStandby(r.doc, ctx);
  if (JSON.stringify(standbySnap.get(id) ?? null) !== JSON.stringify(expected ?? null)) {
    throw new Error(`${id}: this import would change standby`);
  }
}

let wrote = 0;
for (const [id, r] of Object.entries(recs)) {
  if (!r.dirty) continue;
  if (r.raw != null && !r.stable) throw new Error(`${id}: file is not JSON.stringify-stable; refusing to rewrite it`);
  const path = join(DATA, r.dir, `${id}.json`);
  const text = `${JSON.stringify(r.doc, null, 2)}\n`;
  if (r.raw !== text) { writeFileSync(path, text); wrote++; }
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const yearCell = (r) => (r.y == null ? '—' : fmt(r.y, r.yEnd));
const recCell = (m) => `\`${m.id}${m.slot ? `:${m.slot}` : ''}\`${m.isNew ? ' (new)' : ''}`;
const dated = extract.filter((r) => r.kind === 'dated');
const unmapped = extract.filter((r) => r.kind === 'unmapped');
const names = extract.filter((r) => r.kind === 'name');
const conflicts = dated.filter((r) => /CONFLICT/.test(r.st));
const paperConflicts = conflicts.filter((r) => /paper_text/.test(r.cmp) && !/CFAH anchor|CFAH-1 Table 1|Ussher/.test(r.cmp));
const tierConflicts = conflicts.filter((r) => /CFAH anchor|CFAH-1 Table 1|Ussher/.test(r.cmp));
const newPeople = Object.keys(NEW_PEOPLE).sort();
const reusedPeople = uniq(extract.flatMap((r) => (r.mapped || []).filter((m) => !m.isNew && recs[m.id].doc.type === 'person').map((m) => m.id))).sort();
const reusedEvents = uniq(extract.flatMap((r) => (r.mapped || []).filter((m) => recs[m.id].doc.type === 'event').map((m) => m.id))).sort();

let md = `# Dynasty of Slaves (BLK SHP Scott, 2026): dated statements\n\n`;
md += `Generated by \`scripts/dynasty-of-slaves/import.mjs\` from \`scripts/dynasty-of-slaves/rows.mjs\`. Do not edit by hand.\n\n`;
md += `- **Book:** BLK SHP Scott, *Dynasty of Slaves: Uncovering the Archeological Record of Israel in Egypt* (BLK SHP Publishing, 2026). The copyright page prints © BLK SHP Scott, all rights reserved, and first publication in the United States through Kindle Direct Publishing in 2026. eBook ISBN 979-8-9960110-3-2; softcover ISBN 979-8-9960110-0-1; hardcover ISBN 979-8-9960110-2-5; audiobook ISBN 979-8-9960110-1-8. The printed author is BLK SHP Scott.\n`;
md += `- **Copy read:** the owner’s private eBook, converted to Markdown for reading. It is not in this repository and is not linked. The edition has no printed page numbers. Each citation is the chapter and the nearest section heading.\n`;
md += `- **Listing:** [Google Books about page](${LISTING}), opened 2026-11-11. No preview. Catalog ISBN 9798996011001, the softcover. The catalog spaces the author; the stored author is the form the book prints.\n`;
md += `- **Display only:** \`dynasty-of-slaves\` is a secondary display chronology. It never sets or changes \`sorting_year\`, including on records this import creates. It is not a provisional tier.\n`;
md += `- **Years:** a BC year is stored only when he prints that year. A regnal year, a century, or an interval (215, 430, 480, 300, forty, four hundred) is not converted. His own results are stored where he prints them (1446 BC, 1876 BC). Archaeological synchronisms are his view.\n`;
md += `- **Status:** agrees / consistent (ranges overlap) / close (1 yr) / CONFLICT (n yrs) against the record’s tier 1–4 year on that slot. If the slot has no tier year, the comparison is CFAH \`paper_text\` and is labelled not a sort tier. internal = his figures against each other. n/a = no tier year and no paper_text year. Generations, Morecraft, and standby are not the comparison.\n`;
md += `- **Repeats:** a later sentence that only repeats a year already entered for that claim is not copied again. Each chapter or appendix section that states the year as its own claim is entered.\n\n`;
md += `## Summary\n\n`;
md += `| | Count |\n|---|---|\n`;
md += `| Dated statements | ${dated.length} |\n`;
md += `| Mapped dated statements | ${dated.filter((r) => r.mapped.length).length} |\n`;
md += `| Not mapped (modern book titles) | ${unmapped.length} |\n`;
md += `| Named people, no year stored | ${names.length} |\n`;
md += `| Entries on records | ${dated.reduce((n, r) => n + r.mapped.length, 0) + names.reduce((n, r) => n + r.mapped.length, 0)} |\n`;
md += `| Conflicts with a tier 1–4 year | ${tierConflicts.length} |\n`;
md += `| Conflicts with CFAH paper_text only | ${paperConflicts.length} |\n`;
md += `| People created | ${newPeople.length} |\n`;
md += `| People reused | ${reusedPeople.length} |\n`;
md += `| Events reused | ${reusedEvents.length} |\n`;
md += `| Places created | 0 |\n\n`;
md += `New people: ${newPeople.map((id) => `\`${id}\``).join(', ')}.\n\n`;
md += `## Dated statements\n\n`;
md += `| Chapter | Section | Date as printed | Year | Record(s) | Compared with | Status | Note |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
const line = (r) => `| ${esc(r.ch)} | ${esc(r.sec)} | ${esc(r.date)} | ${yearCell(r)} | ${(r.mapped || []).map(recCell).join('<br>') || '—'} | ${esc(r.cmp) || '—'} | ${esc(r.st)} | ${esc(r.note)} |\n`;
for (const r of dated) md += line(r);
md += `\n## Not mapped\n\n`;
md += `These years are titles of modern books in the appendix. They are not ancient dates.\n\n`;
md += `| Chapter | Section | Date as printed | Status | Note |\n|---|---|---|---|---|\n`;
for (const r of unmapped) md += `| ${esc(r.ch)} | ${esc(r.sec)} | ${esc(r.date)} | not mapped | ${esc(r.note)} |\n`;
md += `\n## People named, no year stored\n\n`;
md += `| Chapter | Section | Record(s) | Note |\n|---|---|---|---|\n`;
for (const r of names) md += `| ${esc(r.ch)} | ${esc(r.sec)} | ${r.mapped.map(recCell).join('<br>')} | ${esc(r.note)} |\n`;
md += `\n`;
writeFileSync(join(DATA, 'dynasty-of-slaves-dates-extract.md'), md);
console.log(`Wrote ${wrote} records; dated ${dated.length}; name rows ${names.length}; tier conflicts ${tierConflicts.length}; paper_text conflicts ${paperConflicts.length}`);
console.log(`People created ${newPeople.length}; reused ${reusedPeople.length}; events ${reusedEvents.length}`);
