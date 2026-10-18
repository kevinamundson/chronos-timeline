#!/usr/bin/env node
// Validates every JSON file in data/ against schema/ (JSON Schema draft 2020-12),
// then runs cross-record integrity checks:
//   - ids unique and equal to file name
//   - all referenced ids (related, people, locations, maps, father/children, sources,
//     chronology `source`, source_text_id) exist
//   - every non-null chronology date has a citation (also enforced by schema)
//   - Scripture links: every Scripture URL is the Berean Literal Bible on BibleHub (scripts/blb.mjs);
//     KJV/Gutenberg, BibleGateway and other Bible-text links are rejected; scripture_refs must map to a BLB chapter
//   - masoretic-genealogy AM figures for the Genesis 5 line match the KJV/MT numbers
//   - sorting_year follows the 4-tier fallback (data/chronologies.json sorting_rule):
//       1 cfah (cfah_basis=anchor_point) > 2 cfah (cfah_basis=table1_baseline)
//       > 3 ussher-jones > 4 ussher; else "derived" (events) or "none" (people, null)
//     and sorting_basis.tier / tier_rank / chronology name the tier actually used
// Usage: npm install && npm run validate
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { isBlbUrl, isNonBlbScripture, blbFromOsis } from './blb.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = (f) => JSON.parse(readFileSync(join(root, 'schema', f), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
for (const f of readdirSync(join(root, 'schema')).filter((f) => f.endsWith('.json'))) ajv.addSchema(S(f));
const V = (name) => ajv.getSchema(`https://timeline-portal.local/schema/${name}.schema.json`);

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const load = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'));
let checked = 0;
function validate(rel, schemaName) {
  const doc = load(rel);
  const v = V(schemaName);
  if (!v(doc)) for (const e of v.errors) err(rel, `${e.instancePath || '/'} ${e.message} ${JSON.stringify(e.params)}`);
  checked++;
  return doc;
}

const chronDoc = validate('data/chronologies.json', 'chronology');
const srcDoc = validate('data/sources.json', 'source');
const chronIds = new Set(chronDoc.chronologies.map((c) => c.id));
const srcIds = new Set(srcDoc.sources.map((s) => s.id));
if (chronIds.size !== chronDoc.chronologies.length) err('data/chronologies.json', 'duplicate chronology id');
if (srcIds.size !== srcDoc.sources.length) err('data/sources.json', 'duplicate source id');
if (chronDoc.chronologies.filter((c) => c.primary).length !== 1) err('data/chronologies.json', 'exactly one chronology must be primary');
for (const c of chronDoc.chronologies) for (const r of c.references) if (!srcIds.has(r)) err('data/chronologies.json', `${c.id}: unknown source ${r}`);

const collections = { events: 'event', people: 'person', locations: 'location', maps: 'map' };
const records = {}; // id -> {rel, doc, kind}
for (const [dir, schema] of Object.entries(collections)) {
  const p = join(root, 'data', dir);
  if (!existsSync(p)) continue;
  for (const f of readdirSync(p).filter((f) => f.endsWith('.json')).sort()) {
    const rel = `data/${dir}/${f}`;
    const doc = validate(rel, schema);
    if (doc.id !== basename(f, '.json')) err(rel, `id "${doc.id}" does not match file name`);
    if (records[doc.id]) err(rel, `id "${doc.id}" already used by ${records[doc.id].rel}`);
    records[doc.id] = { rel, doc, kind: schema };
  }
}
for (const c of chronDoc.chronologies) for (const a of c.anchors) if (a.event_id && records[a.event_id]?.kind !== 'event') err('data/chronologies.json', `${c.id}: anchor event_id ${a.event_id} not found`);

const need = (rel, id, kind, field) => {
  if (id == null) return;
  const r = records[id];
  if (!r) err(rel, `${field}: unknown id "${id}"`);
  else if (kind && r.kind !== kind) err(rel, `${field}: "${id}" is a ${r.kind}, expected ${kind}`);
};
function checkEntries(rel, label, entries) {
  for (const e of entries || []) {
    if (!chronIds.has(e.source)) err(rel, `${label}: unknown chronology "${e.source}"`);
    if (e.source_text_id && !srcIds.has(e.source_text_id)) err(rel, `${label}: unknown source_text_id "${e.source_text_id}"`);
    if (e.source === 'cfah' && e.date !== null && !['anchor_point', 'table1_baseline'].includes(e.cfah_basis)) err(rel, `${label}: dated cfah entry needs cfah_basis`);
    if (e.date !== null && !e.citation) err(rel, `${label}: dated entry without citation`);
    if (e.date === null && e.source === 'cfah' && !/pending CFAH reference/.test(e.note || '')) err(rel, `${label}: null cfah entry must note "pending CFAH reference"`);
  }
  const cf = (entries || []).find((e) => e.source === 'cfah');
  return cf && cf.year_bc_ad != null ? cf.year_bc_ad : null;
}

// Scripture links: Berean Literal Bible on BibleHub only.
{
  const scan = (rel, node, path) => {
    if (Array.isArray(node)) return node.forEach((x, i) => scan(rel, x, `${path}[${i}]`));
    if (node && typeof node === 'object') {
      if (node.superseded_for_links_by) return; // a superseded source entry may keep its own (non-link) URL
      const scriptural = ['bible', 'masoretic-genealogy'].includes(node.source) || node.source_id === 'blb-biblehub';
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'string') {
          if (isNonBlbScripture(v)) err(rel, `${path}.${k}: non-BLB Scripture link ${v} (use scripts/blb.mjs)`);
          else if (/^https?:\/\/(www\.)?biblehub\.com\/blb\//.test(v) && !isBlbUrl(v)) err(rel, `${path}.${k}: malformed BLB link ${v}`);
          else if (scriptural && ['link', 'url'].includes(k) && !isBlbUrl(v)) err(rel, `${path}.${k}: Scripture entry must link to the BLB, got ${v}`);
        } else scan(rel, v, `${path}.${k}`);
      }
    }
  };
  for (const { rel, doc } of Object.values(records)) {
    scan(rel, doc, '');
    for (const r of doc.scripture_refs || []) if (!blbFromOsis(r)) err(rel, `scripture_refs: "${r}" cannot be mapped to a BLB chapter`);
  }
  scan('data/chronologies.json', chronDoc, '');
  scan('data/sources.json', srcDoc, '');
}
const sortingTargets = [];
for (const { rel, doc, kind } of Object.values(records)) {
  for (const id of doc.related || []) need(rel, id, null, 'related');
  for (const s of doc.sources || []) if (!srcIds.has(s)) err(rel, `sources: unknown source "${s}"`);
  for (const l of doc.free_source_links || []) if (!srcIds.has(l.source_id)) err(rel, `free_source_links: unknown source "${l.source_id}"`);
  if (doc.sorting_basis && !chronIds.has(doc.sorting_basis.chronology)) err(rel, 'sorting_basis: unknown chronology');
  if (kind === 'event') {
    doc.people.forEach((id) => need(rel, id, 'person', 'people'));
    doc.locations.forEach((id) => need(rel, id, 'location', 'locations'));
    doc.maps.forEach((id) => need(rel, id, 'map', 'maps'));
    checkEntries(rel, 'chronologies', doc.chronologies);
    sortingTargets.push({ rel, doc, entries: doc.chronologies, kind });
  }
  if (kind === 'person') {
    need(rel, doc.father, 'person', 'father');
    doc.children.forEach((id) => need(rel, id, 'person', 'children'));
    (doc.events || []).forEach((id) => need(rel, id, 'event', 'events'));
    for (const [k, entries] of Object.entries(doc.dates)) checkEntries(rel, `dates.${k}`, entries);
    sortingTargets.push({ rel, doc, entries: doc.dates.birth || [], kind });
  }
  if (kind === 'location' || kind === 'map') (doc.maps || []).forEach((id) => need(rel, id, 'map', 'maps'));
  if (kind === 'map') (doc.locations || []).forEach((id) => need(rel, id, 'location', 'locations'));
}

// 4-tier sorting rule
const TIERS = [
  { tier: 'cfah-anchor', rank: 1, chronology: 'cfah', match: (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point' },
  { tier: 'cfah-table1', rank: 2, chronology: 'cfah', match: (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline' },
  { tier: 'ussher-jones', rank: 3, chronology: 'ussher-jones', match: (e) => e.source === 'ussher-jones' },
  { tier: 'ussher', rank: 4, chronology: 'ussher', match: (e) => e.source === 'ussher' },
];
const ruleTiers = (chronDoc.sorting_rule?.tiers || []).map((t) => t.tier).join(',');
if (ruleTiers !== TIERS.map((t) => t.tier).join(',')) err('data/chronologies.json', `sorting_rule tiers must be ${TIERS.map((t) => t.tier).join(' > ')}`);
const expectedSort = (entries) => {
  for (const t of TIERS) { const e = entries.find((x) => t.match(x) && x.year_bc_ad != null); if (e) return { ...t, year: e.year_bc_ad }; }
  return null;
};
const tierCount = {};
for (const { rel, doc, entries, kind } of sortingTargets) {
  const b = doc.sorting_basis; const exp = expectedSort(entries);
  tierCount[b.tier] = (tierCount[b.tier] || 0) + 1;
  if (exp) {
    if (b.tier !== exp.tier || b.tier_rank !== exp.rank || b.chronology !== exp.chronology) err(rel, `sorting_basis should be tier ${exp.rank} "${exp.tier}" (${exp.chronology}), found "${b.tier}"/${b.tier_rank}/${b.chronology}`);
    if (doc.sorting_year !== exp.year) err(rel, `sorting_year should be ${exp.year} (tier ${exp.rank} ${exp.tier}), found ${doc.sorting_year}`);
  } else if (b.tier === 'derived') {
    const src = records[b.derived_from];
    if (!src) err(rel, `sorting_basis.derived_from "${b.derived_from}" not found`);
    else if (src.doc.sorting_basis?.tier === 'derived' || src.doc.sorting_basis?.tier === 'none') err(rel, 'derived_from must point at a record sorted by tiers 1-4');
    else if (doc.sorting_year !== src.doc.sorting_year) err(rel, `derived sorting_year ${doc.sorting_year} != ${b.derived_from} sorting_year ${src.doc.sorting_year}`);
    if (b.tier_rank !== null) err(rel, 'derived tier must have tier_rank null');
  } else if (b.tier === 'none') {
    if (kind !== 'person') err(rel, 'tier "none" (null sorting_year) is only allowed for people; events need a derived sort');
    if (doc.sorting_year !== null) err(rel, 'tier "none" requires sorting_year null');
    if (b.tier_rank !== null) err(rel, 'tier "none" must have tier_rank null');
  } else err(rel, `no tier 1-4 year available, but sorting_basis claims "${b.tier}"`);
}

// Secondary display chronologies must never drive sorting
const SORT_CHRONS = new Set(['cfah', 'ussher-jones', 'ussher']);
for (const t of chronDoc.sorting_rule?.tiers || []) if (!SORT_CHRONS.has(t.chronology)) err('data/chronologies.json', `sorting_rule tier uses non-sort chronology "${t.chronology}"`);
for (const c of chronDoc.chronologies) if ((c.id === 'jordan' || c.id === 'jordan-compilation') && (c.primary || !/SECONDARY DISPLAY/.test(c.description))) err('data/chronologies.json', `${c.id} must be a non-primary SECONDARY DISPLAY chronology`);
for (const { rel, doc } of sortingTargets) if (['jordan', 'jordan-compilation'].some((j) => doc.sorting_basis?.chronology === j || doc.sorting_basis?.derived_from === j)) err(rel, 'sorting_basis may not use a secondary Jordan chronology');

// Masoretic Genesis 5 cross-check (KJV/MT figures: [id, age at named son, lifespan])
const GEN5 = [['adam',130,930],['seth',105,912],['enosh',90,905],['kenan',70,910],['mahalalel',65,895],['jared',162,962],['enoch',65,365],['methuselah',187,969],['lamech',182,777],['noah',500,950]];
let am = 0;
for (const [id, age, life] of GEN5) {
  const r = records[id];
  if (r) {
    const mt = (k) => (r.doc.dates[k] || []).find((e) => e.source === 'masoretic-genealogy');
    const b = mt('birth'); const d = mt('death') || mt('translated');
    if (!b || b.year_am !== am) err(r.rel, `MT birth should be AM ${am}, found ${b?.year_am}`);
    if (!d || d.year_am !== am + life) err(r.rel, `MT death/translation should be AM ${am + life}, found ${d?.year_am}`);
    if (r.doc.scripture_facts?.lifespan_years !== life) err(r.rel, `lifespan should be ${life}`);
  }
  am += age;
}
// Masoretic Genesis 11 cross-check (Shem's son Arphaxad AM 1658 = 2 years after the Flood; [id, age at named son, lifespan])
const GEN11 = [['arphaxad',35,438],['salah',30,433],['eber',34,464],['peleg',30,239],['reu',32,239],['serug',30,230],['nahor',29,148],['terah',null,205]];
let am11 = 1658;
for (const [id, age, life] of GEN11) {
  const r = records[id];
  if (r) {
    const mt = (k) => (r.doc.dates[k] || []).find((e) => e.source === 'masoretic-genealogy');
    const b = mt('birth'); const d = mt('death');
    if (!b || b.year_am !== am11) err(r.rel, `MT birth should be AM ${am11}, found ${b?.year_am}`);
    if (d && d.year_am !== am11 + life) err(r.rel, `MT death should be AM ${am11 + life}, found ${d?.year_am}`);
    if (r.doc.scripture_facts?.lifespan_years != null && r.doc.scripture_facts.lifespan_years !== life) err(r.rel, `lifespan should be ${life}`);
  }
  if (age != null) am11 += age;
}
const flood = records['the-flood'];
if (flood) {
  const mt = flood.doc.chronologies.find((e) => e.source === 'masoretic-genealogy');
  if (mt?.year_am !== 1056 + 600) err(flood.rel, `MT Flood should be AM 1656 (Noah born 1056 + 600), found ${mt?.year_am}`);
}

const counts = Object.entries(collections).map(([d, k]) => `${Object.values(records).filter((r) => r.kind === k).length} ${d}`).join(', ');
// CFAH chart gallery: data/cfah-charts.json (links only; images are never copied into the repo)
const chartDoc = validate('data/cfah-charts.json', 'cfah-charts');
const chartIds = new Set();
for (const c of chartDoc.charts || []) {
  if (chartIds.has(c.id)) err('data/cfah-charts.json', `duplicate chart id ${c.id}`);
  chartIds.add(c.id);
  if (!srcIds.has(c.source)) err('data/cfah-charts.json', `${c.id}: unknown source ${c.source}`);
  for (const r of c.related || []) if (!records[r]) err('data/cfah-charts.json', `${c.id}: related record ${r} not found`);
  if (c.thumbnail && !c.thumbnail.startsWith('https://assets.answersresearchjournal.org/')) err('data/cfah-charts.json', `${c.id}: thumbnails may only hotlink publicly served ARJ images`);
}

if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) in ${checked} files\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${checked} files valid (chronologies, sources, ${counts}, ${chartIds.size} CFAH charts); cross-references, 4-tier sorting rule and MT Genesis 5 and 11 arithmetic consistent.`);
console.log('Sorting tiers used: ' + Object.entries(tierCount).map(([k, v]) => `${k}=${v}`).join(', '));
