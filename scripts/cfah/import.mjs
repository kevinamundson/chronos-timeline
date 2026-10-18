#!/usr/bin/env node
// CFAH importer: adds the CFAH anchor points, CFAH-1 Table 1 rows, ruler reigns and OSF preprint anchor points
// curated in scripts/cfah/*.mjs to data/, idempotently, and regenerates data/cfah-coverage.md.
//   node scripts/cfah/import.mjs
// Entries it manages carry `cfah_key`; a re-run replaces them. Hand-curated CFAH entries are never removed; the
// script only backfills `cfah_ap` (the AP number) and `cfah_preprint` (OSF) on them.
// Sort: a record the script touches is re-sorted by the four-tier rule; any change of tier or year is logged
// in scripts/cfah/sort-changes.json (cumulative) and noted in the record's sorting_basis note.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ARJ, arjCitation, OSF, osfUrl, osfCitation } from './papers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const TODAY = '2026-10-18';
const GEN_MARK = 'Added from the Generations curriculum import';
const opt = async (f, name) => existsSync(join(here, f)) ? (await import(pathToFileURL(join(here, f)).href))[name] || [] : [];
const { PHASE1 } = await import(pathToFileURL(join(here, 'anchors.mjs')).href);
const PHASE4 = await opt('anchors-osf.mjs', 'PHASE4');
const TABLE1 = await opt('table1.mjs', 'TABLE1');
const KINGS = await opt('kings.mjs', 'RULERS');

// ---- load
const recs = {};
for (const dir of ['events', 'people', 'locations']) for (const f of readdirSync(join(DATA, dir)).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8')); recs[doc.id] = { dir, doc, dirty: false, touched: false };
}
const sources = JSON.parse(readFileSync(join(DATA, 'sources.json'), 'utf8')).sources;
const srcIds = new Set(sources.map((s) => s.id));
const changesFile = join(here, 'sort-changes.json');
const sortChanges = existsSync(changesFile) ? JSON.parse(readFileSync(changesFile, 'utf8')) : {};
const createdFile = join(here, 'created.json'); // record id -> phase in which this importer first created it
const createdBy = existsSync(createdFile) ? JSON.parse(readFileSync(createdFile, 'utf8')) : {};

const isOsf = (id) => /-osf$/.test(id || '');
const paperLabel = (id) => (isOsf(id) ? `OSF preprint CFAH-${OSF[id].n}` : id.toUpperCase());
const linkOf = (id) => (isOsf(id) ? osfUrl(id) : ARJ[+id.split('-')[1]].url);
const citationOf = (id, where) => (isOsf(id) ? osfCitation(id, where) : arjCitation(+id.split('-')[1], where));
const yl = (y, e) => (y == null ? '—' : e != null && e !== y ? `${-y}–${-e} BC` : y < 0 ? `${-y} BC` : `AD ${y}`);
const entriesOf = (doc, slot) => (doc.type === 'event' ? doc.chronologies : (doc.dates[slot || 'birth'] ||= []));
const setEntries = (doc, slot, list) => { if (doc.type === 'event') doc.chronologies = list; else doc.dates[slot || 'birth'] = list; };

// ---- CFAH-first ordering: dated anchor points, then Table 1, then other CFAH paper dates; the null placeholder only if none
function orderCfah(list) {
  const c = (b) => list.filter((e) => e.source === 'cfah' && e.date != null && e.cfah_basis === b);
  const dated = [...c('anchor_point'), ...c('table1_baseline'), ...c('paper_text')];
  const nul = list.filter((e) => e.source === 'cfah' && e.date == null);
  return [...dated, ...(dated.length ? [] : nul), ...list.filter((e) => e.source !== 'cfah')];
}

function ensureRecord(id, create, kind = 'event', phase) {
  if (recs[id]) return recs[id];
  createdBy[id] ||= phase;
  if (!create) throw new Error(`target "${id}" does not exist and no create block was given`);
  const base = { $schema: `../../schema/${kind}.schema.json`, id, type: kind, title: create.title, summary: create.summary, description: create.description };
  const doc = kind === 'event'
    ? { ...base, sorting_year: 1, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' }, chronologies: [], people: create.people || [], locations: create.locations || [], maps: [], scripture_refs: create.scripture_refs || [], sources: [], related: create.related || [], free_source_links: [] }
    : { ...base, ...(create.alt_names ? { alt_names: create.alt_names } : {}), sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year.' }, father: create.father || null, children: [], dates: {}, events: create.events || [], scripture_refs: create.scripture_refs || [], sources: [], related: create.related || [], free_source_links: [], ...(create.dynasty ? { dynasty: create.dynasty } : {}) };
  recs[id] = { dir: kind === 'event' ? 'events' : 'people', doc, dirty: true, touched: true, created: true };
  return recs[id];
}

const managed = new Set(); // cfah_key values produced in this run
const log = { phase1: { new: new Set(), updated: new Set() }, phase2: { new: new Set(), updated: new Set() }, phase3: { new: new Set(), updated: new Set() }, phase4: { new: new Set(), updated: new Set() } };

const present = []; // anchor points another import already put on the target (hand-curated entry kept; nothing added)
function addEntry(phase, item, basis) {
  if (item.ap && recs[item.target]) {
    const d0 = recs[item.target].doc;
    const list0 = d0.type === 'event' ? d0.chronologies : d0.dates?.[item.slot || 'birth'] || [];
    const re = new RegExp(`(AP-|AP #|Anchor Point #)${item.ap}(?![0-9])`);
    const has = list0.find((e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point' && !e.cfah_key && (e.cfah_ap === `AP-${item.ap}` || re.test(e.citation || '')));
    if (has) { present.push({ phase, ap: item.ap, target: item.target, date: has.date }); return null; }
  }
  const r = ensureRecord(item.target, item.create, item.kind || 'event', phase);
  (createdBy[item.target] === phase ? log[phase].new : log[phase].updated).add(item.target);
  const d = r.doc; r.dirty = r.touched = true;
  const key = `cfah:${item.key || (item.ap ? `ap-${item.ap}` : basis)}:${item.target}${item.slot ? `:${item.slot}` : ''}`;
  if (managed.has(key)) throw new Error(`duplicate cfah_key ${key}`);
  managed.add(key);
  const e = { source: 'cfah', date: item.date, year_am: null, year_bc_ad: item.y };
  if (item.yEnd != null && item.yEnd !== item.y) e.year_bc_ad_end = item.yEnd;
  Object.assign(e, { precision: item.precision, citation: citationOf(item.src, item.where), link: linkOf(item.src), source_text_id: item.src, note: item.note || null, cfah_basis: basis });
  if (item.ap) e.cfah_ap = `AP-${item.ap}`;
  if (isOsf(item.src)) e.cfah_preprint = true;
  e.cfah_key = key;
  const list = entriesOf(d, item.slot).filter((x) => x.cfah_key !== key);
  list.push(e);
  setEntries(d, item.slot, orderCfah(list));
  if (!d.sources.includes(item.src)) d.sources.push(item.src);
  const loc = item.locator || item.where.slice(0, 120);
  if (!d.free_source_links.some((l) => l.source_id === item.src && l.locator === loc)) d.free_source_links.push({ source_id: item.src, url: linkOf(item.src), locator: loc });
  if (d.description?.startsWith(GEN_MARK)) {
    d.description = d.description.replace(GEN_MARK, 'Record first created by the Generations curriculum import').replace(/ ?(Dated only by the Generations books cited below; no tier 1–4 chronology covers this (event|person)\.|Dates are those printed in the cited Generations books; no tier 1–4 chronology covers this person\.)/, '') + ' CFAH dates it as well (added by the CFAH pass); the sort follows the four-tier rule.';
  }
  return e;
}

// ---- remove stale managed entries (keys no longer produced) after all additions
function dropStale() {
  for (const r of Object.values(recs)) {
    const d = r.doc; if (d.type === 'location') continue;
    const slots = d.type === 'event' ? [[null, d.chronologies]] : Object.entries(d.dates || {});
    for (const [slot, list] of slots) {
      if (!list.some((e) => e.cfah_key && !managed.has(e.cfah_key))) continue;
      setEntries(d, slot, orderCfah(list.filter((e) => !e.cfah_key || managed.has(e.cfah_key))));
      r.dirty = r.touched = true;
    }
  }
}

// ---- backfill AP numbers / preprint flags on hand-curated CFAH anchor entries
const AP_OVERRIDE = { 'death-of-moeris': 17, 'fall-of-akkad': 35, 'semiramis-ii': 15, dispersion: 2, 'founding-of-babel': 1, 'isaac:death': 61 };
function backfill() {
  for (const r of Object.values(recs)) {
    const d = r.doc; if (d.type === 'location') continue;
    const slots = d.type === 'event' ? [['', d.chronologies]] : Object.entries(d.dates || {});
    for (const [slot, list] of slots) for (const e of list) {
      if (e.source !== 'cfah' || e.date == null || e.cfah_key) continue;
      if (isOsf(e.source_text_id) && !e.cfah_preprint) { e.cfah_preprint = true; r.dirty = true; }
      if (e.cfah_basis !== 'anchor_point' || e.cfah_ap) continue;
      let n = AP_OVERRIDE[slot ? `${d.id}:${slot}` : d.id];
      if (!n) for (const t of [e.citation, e.note, d.sorting_basis?.note]) { const m = (t || '').match(/(?:AP-|AP #|Anchor Point #|anchor point #|Table 1 "Anchor Points for early Egyptian history" #)(\d+)/); if (m) { n = +m[1]; break; } }
      if (n) { e.cfah_ap = `AP-${n}`; r.dirty = true; }
    }
  }
}

// ---- four-tier sort
const TIERS = [
  ['cfah-anchor', 1, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point'],
  ['cfah-table1', 2, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline'],
  ['ussher-jones', 3, 'ussher-jones', (e) => e.source === 'ussher-jones'],
  ['ussher', 4, 'ussher', (e) => e.source === 'ussher'],
];
const tierOf = (entries) => { for (const [t, r, c, m] of TIERS) { const e = entries.find((x) => m(x) && x.year_bc_ad != null); if (e) return { tier: t, rank: r, chron: c, y: e.year_bc_ad, e }; } return null; };
const basisLabel = (b, y) => `${b.tier === 'provisional' ? 'provisional (Generations)' : b.tier}${y == null ? '' : ` ${yl(y)}`}`;
function resort(r) {
  const d = r.doc; const entries = d.type === 'event' ? d.chronologies : d.dates.birth || [];
  const t = tierOf(entries); if (!t) return;
  const b = d.sorting_basis || {};
  if (b.tier === t.tier && b.tier_rank === t.rank && b.chronology === t.chron && d.sorting_year === t.y) return;
  const created = r.created;
  const e = t.e;
  const what = t.rank === 1 ? `Tier 1: CFAH anchor point: ${e.date}${e.cfah_ap ? ` (${e.cfah_ap}${e.cfah_preprint ? `, ${paperLabel(e.source_text_id)}` : ''})` : ''}`
    : t.rank === 2 ? `Tier 2: CFAH-1 Table 1 baseline: ${e.date}` : `Tier ${t.rank}: ${t.chron}: ${e.date}`;
  if (!created) {
    const was = basisLabel(b, d.sorting_year);
    sortChanges[d.id] = { from: { tier: b.tier, year: d.sorting_year }, to: { tier: t.tier, year: t.y }, by: e.cfah_ap || (e.cfah_basis === 'table1_baseline' ? 'CFAH-1 Table 1' : t.chron), on: TODAY, was_note: b.note || '' };
    d.sorting_basis = { tier: t.tier, tier_rank: t.rank, chronology: t.chron, note: `${what}. Sort changed by the CFAH pass (${TODAY}): was ${was}.` };
  } else d.sorting_basis = { tier: t.tier, tier_rank: t.rank, chronology: t.chron, note: what };
  d.sorting_year = t.y;
}

// ---- run
for (const it of PHASE1) addEntry('phase1', it, 'anchor_point');
for (const it of TABLE1) addEntry('phase2', it, 'table1_baseline');
for (const it of KINGS) for (const [slot, ent] of Object.entries(it.dates || {})) for (const x of ent) addEntry('phase3', { ...x, target: it.id, kind: 'person', slot, create: it.create, key: x.key }, x.basis || 'paper_text');
for (const it of PHASE4) addEntry('phase4', it, 'anchor_point');
dropStale();
backfill();
for (const r of Object.values(recs)) if (r.touched && r.doc.type !== 'location') resort(r);
for (const [id, r] of Object.entries(recs)) if (r.dirty) writeFileSync(join(DATA, r.dir, `${id}.json`), JSON.stringify(r.doc, null, 2) + '\n');
writeFileSync(changesFile, JSON.stringify(sortChanges, null, 2) + '\n');
writeFileSync(createdFile, JSON.stringify(Object.fromEntries(Object.entries(createdBy).filter(([id]) => recs[id]).sort()), null, 2) + '\n');
for (const [p, v] of Object.entries(log)) if (v.new.size || v.updated.size) console.log(`${p}: ${v.new.size} new, ${v.updated.size} updated records`);
for (const x of present) console.log(`${x.phase}: AP-${x.ap} already on ${x.target} (${x.date}, entry from another import kept)`);
for (const id of Object.keys(sortChanges)) if (!recs[id]) console.warn(`sort-changes.json: ${id} no longer exists`);
writeFileSync(join(here, 'last-run.json'), JSON.stringify(Object.fromEntries(Object.entries(log).map(([p, v]) => [p, { new: [...v.new].sort(), updated: [...v.updated].sort() }])), null, 2) + '\n');

// ---- coverage checklist
const { writeCoverage } = await import(pathToFileURL(join(here, 'coverage.mjs')).href);
writeCoverage({ recs, sortChanges, DATA, PHASE1, PHASE4, TABLE1, KINGS, present });
console.log('wrote data/cfah-coverage.md');
