#!/usr/bin/env node
// Standby placement for records with no tier sort year. Idempotent.
//   node scripts/standby/compute.mjs
// Run it last, after the other importers and after scripts/cfah/import.mjs.
// It writes the optional `standby` object and never changes sorting_year or sorting_basis.
// When a record has a sorting_year, any standby object is removed.
//
// For each person or event with sorting_year == null, in order:
//   1. source-printed: a year_bc_ad a chronology already stores on birth, death,
//      lifespan, reign (people) or chronologies[] (events). The data field is used
//      as stored. Anno Mundi, regnal lengths, and Julian Period figures are not
//      converted. The first hit by chronology sort_priority wins. A tie uses slot
//      order birth, death, lifespan, reign, then translated (the data has no
//      lifespan array; translated is only a fallback), then array order.
//   2. linked-record: otherwise the sorting_year of a related record, taken as-is:
//      a linked event of that person's own life (events listed on the person, else
//      events that name the person; the earliest sorting_year, then id); else the
//      nearest preceding person in the same king-lists.json list who has a
//      sorting_year; else a parent, else a child, who has a sorting_year.
//   3. otherwise no standby. The record stays fully undated.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SLOT_ORDER = ['birth', 'death', 'lifespan', 'reign', 'translated', 'chronologies'];

export function printedEntries(doc) {
  if (!doc) return [];
  if (doc.type === 'event') return (doc.chronologies || []).map((e, i) => ({ e, slot: 'chronologies', i }));
  if (doc.type !== 'person') return [];
  const out = [];
  for (const slot of ['birth', 'death', 'lifespan', 'reign', 'translated']) {
    for (const [i, e] of (doc.dates?.[slot] || []).entries()) out.push({ e, slot, i });
  }
  return out;
}

export function hasPrintedYear(doc, source, year) {
  return printedEntries(doc).some((x) => x.e.source === source && x.e.year_bc_ad === year);
}

function bestPrinted(doc, ctx) {
  // jones-2019 is a display comparison. It never places a record.
  const cands = printedEntries(doc).filter((x) => Number.isInteger(x.e.year_bc_ad) && x.e.year_bc_ad !== 0 && x.e.source !== 'jones-2019');
  if (!cands.length) return null;
  cands.sort((a, b) => {
    const pa = ctx.priority[a.e.source] ?? 99;
    const pb = ctx.priority[b.e.source] ?? 99;
    if (pa !== pb) return pa - pb;
    const sa = SLOT_ORDER.indexOf(a.slot);
    const sb = SLOT_ORDER.indexOf(b.slot);
    if (sa !== sb) return sa - sb;
    return a.i - b.i;
  });
  return cands[0];
}

function sourceNote(ctx, slot, entry) {
  const chron = ctx.chronById[entry.source];
  const name = chron?.name || entry.source;
  const printed = entry.date ? ` (${entry.date})` : '';
  return `Standby placement only. ${name} prints this BC/AD year on the ${slot} entry${printed}. It is not a sort year. No Anno Mundi, regnal length, or Julian Period figure was converted to obtain it.`;
}

function linkedNote(rec, kind, extra) {
  const via = {
    event: "a linked event of this person's life",
    king: 'the nearest preceding dated ruler in the same king list',
    parent: 'a parent',
    child: 'a child',
  }[kind] || 'a linked record';
  const list = extra?.listTitle ? `, list "${extra.listTitle}"` : '';
  return `Standby placement only, placed with "${rec.title}" (${via}${list}). The year is that record's sort year, taken as-is. No reign length or age was added or subtracted. It is not a sort year.`;
}

function linkedObject(rec, kind, extra) {
  return {
    year_bc_ad: rec.sorting_year,
    basis: 'linked-record',
    source_chronology: null,
    from_record: rec.id,
    note: linkedNote(rec, kind, extra),
  };
}

function ownLifeEvent(person, ctx) {
  const listed = [];
  for (const id of person.events || []) {
    const ev = ctx.byId[id];
    if (ev?.type === 'event' && ev.sorting_year != null) listed.push(ev);
  }
  const pool = listed.length ? listed : (ctx.eventsByPerson[person.id] || []).filter((e) => e.sorting_year != null);
  if (!pool.length) return null;
  pool.sort((a, b) => a.sorting_year - b.sorting_year || String(a.id).localeCompare(String(b.id)));
  return pool[0];
}

function nearestRuler(person, ctx) {
  let best = null;
  for (const list of ctx.kingLists) {
    list.entries.forEach((entry, i) => {
      if (entry.person !== person.id) return;
      for (let j = i - 1; j >= 0; j--) {
        const id = list.entries[j].person;
        if (!id || id === person.id) continue;
        const rec = ctx.byId[id];
        if (rec?.sorting_year == null) continue;
        const dist = i - j;
        if (!best || dist < best.dist || (dist === best.dist && list.id < best.listId)) {
          best = { rec, dist, listId: list.id, listTitle: list.title };
        }
        break;
      }
    });
  }
  return best;
}

function linkedKin(person, ctx) {
  const father = person.father && ctx.byId[person.father];
  if (father && father.id !== person.id && father.sorting_year != null) return { rec: father, kind: 'parent' };
  for (const id of person.children || []) {
    const child = ctx.byId[id];
    if (child && child.id !== person.id && child.sorting_year != null) return { rec: child, kind: 'child' };
  }
  return null;
}

function linkedPerson(person, ctx) {
  const ev = ownLifeEvent(person, ctx);
  if (ev) return linkedObject(ev, 'event');
  const ruler = nearestRuler(person, ctx);
  if (ruler) return linkedObject(ruler.rec, 'king', ruler);
  const kin = linkedKin(person, ctx);
  if (kin) return linkedObject(kin.rec, kin.kind);
  return null;
}

function linkedEventRecord(event, ctx) {
  const pool = [];
  for (const id of event.people || []) {
    const person = ctx.byId[id];
    if (person?.sorting_year != null) pool.push(person);
  }
  if (!pool.length) return null;
  pool.sort((a, b) => a.sorting_year - b.sorting_year || String(a.id).localeCompare(String(b.id)));
  return linkedObject(pool[0], 'event');
}

// Returns the standby object, or null when the record must not carry one.
export function computeStandby(doc, ctx) {
  if (!doc || (doc.type !== 'person' && doc.type !== 'event')) return null;
  if (doc.sorting_year != null) return null;
  const printed = bestPrinted(doc, ctx);
  if (printed) {
    return {
      year_bc_ad: printed.e.year_bc_ad,
      basis: 'source-printed',
      source_chronology: printed.e.source,
      from_record: null,
      note: sourceNote(ctx, printed.slot, printed.e),
    };
  }
  if (doc.type === 'person') return linkedPerson(doc, ctx);
  return linkedEventRecord(doc, ctx);
}

export function makeStandbyContext({ records, chronologies, kingLists }) {
  const byId = Object.fromEntries(records.map((r) => [r.id, r]));
  const priority = Object.fromEntries(chronologies.map((c) => [c.id, c.sort_priority ?? 99]));
  const chronById = Object.fromEntries(chronologies.map((c) => [c.id, c]));
  const eventsByPerson = {};
  for (const r of records) {
    if (r.type !== 'event') continue;
    for (const pid of r.people || []) (eventsByPerson[pid] ||= []).push(r);
  }
  return { byId, priority, chronById, eventsByPerson, kingLists: kingLists || [] };
}

export function applyStandby(doc, standby) {
  const out = {};
  let placed = false;
  for (const [k, v] of Object.entries(doc)) {
    if (k === 'standby') continue;
    out[k] = v;
    if (k === 'sorting_basis') {
      if (standby) out.standby = standby;
      placed = true;
    }
  }
  if (standby && !placed) out.standby = standby;
  return out;
}

export function standbyCounts(docs) {
  const counts = { 'source-printed': 0, 'linked-record': 0, undated: 0 };
  for (const doc of docs) {
    if (doc.type !== 'person' && doc.type !== 'event') continue;
    if (doc.standby?.basis === 'source-printed' || doc.standby?.basis === 'linked-record') counts[doc.standby.basis]++;
    else if (doc.sorting_year == null) counts.undated++;
  }
  return counts;
}

export function standbySummaryLine(counts) {
  return `Standby placements: source-printed=${counts['source-printed']}, linked-record=${counts['linked-record']}; fully undated=${counts.undated}`;
}

export function loadStandbyCounts(root) {
  const docs = [];
  for (const dir of ['events', 'people']) {
    const p = join(root, 'data', dir);
    for (const f of readdirSync(p).filter((name) => name.endsWith('.json'))) docs.push(JSON.parse(readFileSync(join(p, f), 'utf8')));
  }
  return standbyCounts(docs);
}

function loadCorpus(root) {
  const records = [];
  const files = [];
  for (const dir of ['events', 'people', 'locations', 'maps']) {
    const p = join(root, 'data', dir);
    for (const f of readdirSync(p).filter((name) => name.endsWith('.json')).sort()) {
      const doc = JSON.parse(readFileSync(join(p, f), 'utf8'));
      records.push(doc);
      if (dir === 'events' || dir === 'people') files.push({ dir, file: f, doc });
    }
  }
  const chronologies = JSON.parse(readFileSync(join(root, 'data/chronologies.json'), 'utf8')).chronologies;
  const kingLists = JSON.parse(readFileSync(join(root, 'data/king-lists.json'), 'utf8')).lists;
  return { records, files, chronologies, kingLists };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const { records, files, chronologies, kingLists } = loadCorpus(root);
  const ctx = makeStandbyContext({ records, chronologies, kingLists });
  const snap = (doc) => JSON.stringify({ y: doc.sorting_year ?? null, b: doc.sorting_basis ?? null });
  let wrote = 0;
  let cleared = 0;
  for (const { dir, file, doc } of files) {
    const before = snap(doc);
    const expected = computeStandby(doc, ctx);
    if (JSON.stringify(doc.standby ?? null) === JSON.stringify(expected ?? null)) continue;
    if (doc.standby && !expected) cleared++;
    const next = applyStandby(doc, expected);
    if (snap(next) !== before) throw new Error(`${doc.id}: standby compute changed sorting_year or sorting_basis`);
    writeFileSync(join(root, 'data', dir, file), `${JSON.stringify(next, null, 2)}\n`);
    wrote++;
  }
  const counts = loadStandbyCounts(root);
  console.log(`Standby: wrote ${wrote} file(s), cleared ${cleared}.`);
  console.log(standbySummaryLine(counts));
}
