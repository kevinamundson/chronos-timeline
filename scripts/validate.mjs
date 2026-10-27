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
//       1 cfah (cfah_basis=anchor_point) > 2 cfah (cfah_basis=table1_baseline)  [cfah_basis=paper_text never sorts]
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
const kingDoc = existsSync(join(root, 'data/king-lists.json')) ? validate('data/king-lists.json', 'king-lists') : null;
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
    if (e.source === 'cfah' && e.date !== null && !['anchor_point', 'table1_baseline', 'paper_text'].includes(e.cfah_basis)) err(rel, `${label}: dated cfah entry needs cfah_basis`);
    // CFAH anchor point numbers and OSF preprint marking
    if (e.cfah_ap && !(e.source === 'cfah' && e.cfah_basis === 'anchor_point')) err(rel, `${label}: cfah_ap only belongs on a CFAH anchor_point entry`);
    if ((e.cfah_preprint || e.cfah_key) && e.source !== 'cfah') err(rel, `${label}: cfah_preprint/cfah_key only belong on cfah entries`);
    if (e.source === 'cfah' && e.date !== null) {
      const osf = /-osf$/.test(e.source_text_id || '');
      if (osf && !e.cfah_preprint) err(rel, `${label}: CFAH entry from an OSF preprint (${e.source_text_id}) must set cfah_preprint`);
      if (!osf && e.cfah_preprint) err(rel, `${label}: cfah_preprint set but source_text_id "${e.source_text_id}" is not an OSF (*-osf) source`);
      if (osf && !/OSF preprint/.test(e.citation || '')) err(rel, `${label}: OSF preprint entry must say "OSF preprint" in its citation`);
    }
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
  } else if (b.tier === 'provisional') {
    // Generations (secondary) may only supply a PROVISIONAL sort where no tier 1-4 year exists.
    // Morecraft may do the same only for a record the Morecraft import created, and only where Generations gives no date either.
    const g = entries.find((e) => e.source === 'generations' && e.year_bc_ad != null && !e.superseded_by);
    const m = entries.find((e) => e.source === 'morecraft' && e.year_bc_ad != null);
    if (b.tier_rank !== null) err(rel, 'provisional tier must have tier_rank null');
    if (b.chronology === 'morecraft') {
      if (g) err(rel, 'provisional (morecraft) sort used although a dated generations entry exists; generations comes first');
      if (!doc.description?.startsWith('Added from the Morecraft import')) err(rel, 'morecraft may supply a provisional sort only for records the Morecraft import created');
      if (!m) err(rel, 'provisional (morecraft) tier needs a dated morecraft entry');
      else if (doc.sorting_year !== m.year_bc_ad) err(rel, `provisional sorting_year should be ${m.year_bc_ad} (first dated morecraft entry), found ${doc.sorting_year}`);
    } else if (b.chronology !== 'generations') err(rel, 'provisional tier must name chronology "generations" or "morecraft"');
    else if (!g) err(rel, 'provisional tier needs a dated generations entry');
    else if (doc.sorting_year !== g.year_bc_ad) err(rel, `provisional sorting_year should be ${g.year_bc_ad} (first dated, non-superseded generations entry), found ${doc.sorting_year}`);
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
// Generations curriculum: secondary display chronology; never a sort tier, never overrides tiers 1-4.
{
  const gen = chronDoc.chronologies.find((c) => c.id === 'generations');
  if (gen && (gen.primary || !/SECONDARY DISPLAY/.test(gen.description))) err('data/chronologies.json', 'generations must be a non-primary SECONDARY DISPLAY chronology');
  const GEN_SRC = new Set(srcDoc.sources.filter((s) => /^generations-/.test(s.id)).map((s) => s.id));
  for (const { rel, doc, entries } of sortingTargets) {
    const b = doc.sorting_basis || {};
    if ((b.chronology === 'generations' || b.derived_from === 'generations') && b.tier !== 'provisional') err(rel, 'generations may never set the sort except via the explicit "provisional" tier');
    if (b.tier === 'provisional' && expectedSort(entries)) err(rel, 'provisional (generations) sort used although a tier 1-4 year exists');
  }
  for (const { rel, doc } of Object.values(records)) {
    const all = [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()];
    for (const e of all.filter((x) => x.source === 'generations')) {
      if (!GEN_SRC.has(e.source_text_id)) err(rel, `generations entry needs source_text_id of a generations-* source, got "${e.source_text_id}"`);
      if (e.date !== null && !/PDF p\. \d+/.test(e.citation || '')) err(rel, `generations entry "${e.date}" needs a "PDF p. N" page citation`);
      const src = srcDoc.sources.find((s) => s.id === e.source_text_id);
      if (src && e.link && !e.link.startsWith(src.url)) err(rel, `generations entry link must point at the original PDF (${src.url})`);
      if (e.superseded_by) {
        const nb = srcDoc.sources.find((s) => s.id === e.superseded_by);
        if (!nb || !GEN_SRC.has(e.superseded_by) || e.superseded_by === e.source_text_id) err(rel, `superseded_by "${e.superseded_by}" must be another generations-* source`);
        else if (!all.some((x) => x.source === 'generations' && x.source_text_id === e.superseded_by)) err(rel, `entry superseded by ${e.superseded_by}, but the record has no entry from it`);
        if (!e.edition_note) err(rel, 'superseded entry needs an edition_note');
      }
      if (src?.access === 'private-copy' && doc.free_source_links?.some((l) => l.source_id === src.id)) err(rel, `private copy ${src.id} may not be listed in free_source_links`);
    }
  }
}
// Morecraft (A Christian Survey of World History): secondary display chronology. Never a sort tier; it may supply a
// provisional sort only to records the Morecraft import created (checked with the provisional tier above).
{
  const mc = chronDoc.chronologies.find((c) => c.id === 'morecraft');
  if (mc && (mc.primary || !/SECONDARY DISPLAY/.test(mc.description))) err('data/chronologies.json', 'morecraft must be a non-primary SECONDARY DISPLAY chronology');
  const MC_SRC = new Set(srcDoc.sources.filter((s) => /^morecraft-/.test(s.id)).map((s) => s.id));
  for (const { rel, doc } of sortingTargets) { const b = doc.sorting_basis || {}; if ((b.chronology === 'morecraft' || b.derived_from === 'morecraft') && b.tier !== 'provisional') err(rel, 'morecraft may never set the sort except via the explicit "provisional" tier'); }
  for (const { rel, doc } of Object.values(records)) {
    for (const e of [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()].filter((x) => x.source === 'morecraft')) {
      if (!MC_SRC.has(e.source_text_id)) err(rel, `morecraft entry needs source_text_id of a morecraft-* source, got "${e.source_text_id}"`);
      if (!/PDF p\. \d+\)?$/.test(e.citation || '')) err(rel, 'morecraft entry needs a "(PDF p. N)" page citation');
      if (!e.date) err(rel, 'morecraft entry needs the date as printed');
      if (e.year_am != null) err(rel, 'morecraft gives no AM years');
      if ((e.note || '').length > 400) err(rel, 'morecraft note too long: the book is copyrighted, keep notes short and in our own words');
    }
    for (const id of MC_SRC) if (doc.free_source_links?.some((l) => l.source_id === id)) err(rel, `private copy ${id} may not be listed in free_source_links`);
  }
}
// Herodotus (The Histories, tr. Rawlinson): secondary display chronology; never sets the sort, never carries a BC year.
{
  const her = chronDoc.chronologies.find((c) => c.id === 'herodotus');
  if (her && (her.primary || !/SECONDARY DISPLAY/.test(her.description))) err('data/chronologies.json', 'herodotus must be a non-primary SECONDARY DISPLAY chronology');
  const HER_SRC = new Set(srcDoc.sources.filter((s) => /^herodotus-/.test(s.id)).map((s) => s.id));
  for (const { rel, doc } of sortingTargets) if (doc.sorting_basis?.chronology === 'herodotus' || doc.sorting_basis?.derived_from === 'herodotus') err(rel, 'herodotus may never set the sort');
  for (const { rel, doc } of Object.values(records)) {
    for (const e of [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()].filter((x) => x.source === 'herodotus')) {
      if (e.year_bc_ad != null || e.year_bc_ad_end != null || e.year_am != null) err(rel, 'herodotus entries record Herodotus\'s own words only: year_bc_ad/year_am must be null (put derived years in the note, labelled DERIVED)');
      if (!HER_SRC.has(e.source_text_id)) err(rel, `herodotus entry needs source_text_id of a herodotus-* source, got "${e.source_text_id}"`);
      if (!/Histories \d\.\d+/.test(e.citation || '') || !/PDF p\. \d+/.test(e.citation || '')) err(rel, 'herodotus entry needs a "Histories B.C" and "PDF p. N" citation');
      if (!(e.link || '').startsWith('https://en.wikisource.org/wiki/The_History_of_Herodotus_(Rawlinson)/Book_')) err(rel, 'herodotus entry link must point at the public-domain Wikisource text');
    }
    for (const l of doc.free_source_links || []) { const s = srcDoc.sources.find((x) => x.id === l.source_id); if (s?.access === 'private-copy') err(rel, `private copy ${s.id} may not be listed in free_source_links`); }
  }
}
// Raleigh, The History of the World (1617): secondary display. Never sets the sort. AM as printed; no BC conversion.
{
  const ral = chronDoc.chronologies.find((c) => c.id === 'raleigh-history-of-the-world');
  if (ral && (ral.primary || !/SECONDARY DISPLAY/.test(ral.description))) err('data/chronologies.json', 'raleigh-history-of-the-world must be a non-primary SECONDARY DISPLAY chronology');
  for (const { rel, doc } of sortingTargets) if (doc.sorting_basis?.chronology === 'raleigh-history-of-the-world' || doc.sorting_basis?.derived_from === 'raleigh-history-of-the-world') err(rel, 'raleigh-history-of-the-world may never set the sort');
  for (const { rel, doc } of Object.values(records)) {
    for (const e of [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()].filter((x) => x.source === 'raleigh-history-of-the-world')) {
      if (e.year_bc_ad != null || e.year_bc_ad_end != null) err(rel, 'raleigh entries keep year_bc_ad null; AM is not converted to BC');
      if (e.source_text_id !== 'raleigh-history-of-the-world-1617') err(rel, `raleigh entry needs source_text_id raleigh-history-of-the-world-1617, got "${e.source_text_id}"`);
      if (!/1617/.test(e.citation || '') || !(/Chronological Table/.test(e.citation || '') || /Book /.test(e.citation || ''))) err(rel, 'raleigh citation must name the 1617 text and a Book or the Chronological Table');
      if (!e.date) err(rel, 'raleigh entry needs the words as printed');
    }
  }
}
// Cory, Ancient Fragments (1876 Hodges): secondary display. Durations and sari, never a BC year, never a sort.
{
  const cory = chronDoc.chronologies.find((c) => c.id === 'cory');
  if (cory && (cory.primary || !/SECONDARY DISPLAY/.test(cory.description))) err('data/chronologies.json', 'cory must be a non-primary SECONDARY DISPLAY chronology');
  const CORY_SRC = new Set(srcDoc.sources.filter((s) => /^cory-/.test(s.id)).map((s) => s.id));
  for (const { rel, doc } of sortingTargets) if (doc.sorting_basis?.chronology === 'cory' || doc.sorting_basis?.derived_from === 'cory') err(rel, 'cory may never set the sort');
  for (const { rel, doc } of Object.values(records)) {
    for (const e of [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()].filter((x) => x.source === 'cory')) {
      if (e.year_bc_ad != null || e.year_bc_ad_end != null || e.year_am != null) err(rel, 'cory entries record the edition\'s own words only: year_bc_ad, year_bc_ad_end and year_am must be null (put derived years in the note, labelled DERIVED)');
      if (!CORY_SRC.has(e.source_text_id)) err(rel, `cory entry needs source_text_id of a cory-* source, got "${e.source_text_id}"`);
      if (!/p\. \d+/.test(e.citation || '')) err(rel, 'cory entry needs a "p. N" citation');
      if (!(e.link || '').startsWith('https://archive.org/details/corysancientfrag00coryuoft/')) err(rel, 'cory entry link must point at the public-domain Internet Archive scan');
    }
  }
}
// Shuckford, Sacred and Profane History (1819 Creighton), vol. 1: secondary display. Never sets the sort.
{
  const sh = chronDoc.chronologies.find((c) => c.id === 'shuckford');
  if (sh && (sh.primary || !/SECONDARY DISPLAY/.test(sh.description))) err('data/chronologies.json', 'shuckford must be a non-primary SECONDARY DISPLAY chronology');
  const SH_SRC = new Set(srcDoc.sources.filter((s) => /^shuckford-/.test(s.id)).map((s) => s.id));
  for (const { rel, doc } of sortingTargets) if (doc.sorting_basis?.chronology === 'shuckford' || doc.sorting_basis?.derived_from === 'shuckford') err(rel, 'shuckford may never set the sort');
  for (const { rel, doc } of Object.values(records)) {
    for (const e of [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()].filter((x) => x.source === 'shuckford')) {
      if (!SH_SRC.has(e.source_text_id)) err(rel, `shuckford entry needs source_text_id of a shuckford-* source, got "${e.source_text_id}"`);
      if (!/1819/.test(e.citation || '') || !/p\. \d+/.test(e.citation || '')) err(rel, 'shuckford entry needs an 1819 citation with a printed page');
      if (!(e.link || '').startsWith('https://archive.org/details/sacredprofanehis01shuc/page/n')) err(rel, 'shuckford entry link must point at the 1819 Internet Archive scan');
      if (e.year_bc_ad != null && !/before Christ|before our Saviour/i.test(e.date || '')) err(rel, 'shuckford may store a BC year only when the printed words are “before Christ” or “before our Saviour”');
      if (e.year_am != null && e.year_bc_ad != null) err(rel, 'shuckford entry stores Anno Mundi or a printed BC year, not both');
    }
  }
}
// Hales, A New Analysis of Chronology (1830, 2nd ed.): secondary display. He prints B.C. Never sets the sort.
{
  const hales = chronDoc.chronologies.find((c) => c.id === 'hales');
  if (hales && (hales.primary || !/SECONDARY DISPLAY/.test(hales.description))) err('data/chronologies.json', 'hales must be a non-primary SECONDARY DISPLAY chronology');
  const HALES_SRC = new Set(srcDoc.sources.filter((s) => /^hales-/.test(s.id)).map((s) => s.id));
  for (const { rel, doc } of sortingTargets) if (doc.sorting_basis?.chronology === 'hales' || doc.sorting_basis?.derived_from === 'hales') err(rel, 'hales may never set the sort');
  for (const { rel, doc } of Object.values(records)) {
    for (const e of [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()].filter((x) => x.source === 'hales')) {
      if (!HALES_SRC.has(e.source_text_id)) err(rel, `hales entry needs source_text_id of a hales-* source, got "${e.source_text_id}"`);
      if (!/1830/.test(e.citation || '') || !/vol\. /.test(e.citation || '') || !/p\. /.test(e.citation || '')) err(rel, 'hales entry needs an 1830 citation with a volume and a page');
      if (!/^https:\/\/archive\.org\/details\/newanalysisofchr0[1-4]hale\/page\/n\d+\/mode\/1up$/.test(e.link || '')) err(rel, 'hales entry link must point at a full-view page of the 1830 Internet Archive scan');
      if (e.year_am != null) err(rel, 'hales entries in this pass store no Anno Mundi: year_am must be null (a printed B.C. year is year_bc_ad; Anno Mundi is not converted)');
      if (e.year_bc_ad != null && !(e.date || '').includes(String(Math.abs(e.year_bc_ad)))) err(rel, 'hales year_bc_ad must be the B.C. digits printed in the quotation');
    }
  }
}
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
// Name forms: data/name-forms.json. Letters must be the ones the citation quotes.
const NAME_HISTORY = new Set([
  'raleigh-history-of-the-world-1617', 'josephus-antiquities-whiston', 'herodotus-rawlinson-wikisource',
  'ussher-annals-1658', 'ussher-annals-transcription', 'annals-of-clonmacnoise-1896', 'cory-ancient-fragments-1876',
]);
const nameDoc = validate('data/name-forms.json', 'name-forms');
const seenNameIds = new Set();
for (const person of nameDoc.people || []) {
  if (seenNameIds.has(person.id)) err('data/name-forms.json', `duplicate person ${person.id}`);
  seenNameIds.add(person.id);
  if (records[person.id]?.kind !== 'person') err('data/name-forms.json', `${person.id}: not a person`);
  for (const f of person.forms) {
    const where = `${person.id} “${f.form}”`;
    if (!f.citation.includes(f.form)) err('data/name-forms.json', `${where}: citation does not contain the form`);
    if (!srcIds.has(f.source_text_id)) err('data/name-forms.json', `${where}: unknown source ${f.source_text_id}`);
    const src = srcDoc.sources.find((s) => s.id === f.source_text_id);
    if (src?.access === 'private-copy') err('data/name-forms.json', `${where}: private copy ${f.source_text_id} cannot witness a name`);
    if (f.role === 'alternate' && f.script !== 'latin') err('data/name-forms.json', `${where}: an alternate spelling is in Latin letters`);
    if (f.role === 'rendering' && f.script !== 'greek') err('data/name-forms.json', `${where}: a later rendering is Greek`);
    if (f.role === 'original' && !['hebrew', 'aramaic', 'greek'].includes(f.script)) err('data/name-forms.json', `${where}: original language is Hebrew, Aramaic or Greek`);
    if ((f.script === 'hebrew' || f.script === 'aramaic') && !/[\u0590-\u05FF]/.test(f.form)) err('data/name-forms.json', `${where}: ${f.script} form has no Hebrew letters`);
    if (f.script === 'greek' && !/[\u0370-\u03FF\u1F00-\u1FFF]/.test(f.form)) err('data/name-forms.json', `${where}: Greek form has no Greek letters`);
    if (f.script === 'latin' && !/[A-Za-z]/.test(f.form)) err('data/name-forms.json', `${where}: Latin-letter form has no Latin letter`);
    if (f.witness === 'bible') {
      if (f.source_text_id !== 'stepbible-tipnr') err('data/name-forms.json', `${where}: a Bible form cites stepbible-tipnr`);
      if (!f.scripture_ref) err('data/name-forms.json', `${where}: a Bible form needs a scripture_ref`);
      else if (f.link !== blbFromOsis(f.scripture_ref)) err('data/name-forms.json', `${where}: link is not the BLB verse for ${f.scripture_ref}`);
    } else if (f.scripture_ref) err('data/name-forms.json', `${where}: scripture_ref is only for a Bible witness`);
    if (f.witness === 'history' && !NAME_HISTORY.has(f.source_text_id)) err('data/name-forms.json', `${where}: ${f.source_text_id} is not a history source for names`);
  }
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

// King lists (CFAH pass, phase 3): every row links to an existing record of the right kind; ids unique; source known.
if (kingDoc) {
  const seen = new Set();
  for (const l of kingDoc.lists) {
    if (seen.has(l.id)) err('data/king-lists.json', `duplicate list id ${l.id}`); seen.add(l.id);
    if (!srcIds.has(l.source)) err('data/king-lists.json', `${l.id}: unknown source ${l.source}`);
    for (const e of l.entries) {
      if (e.person && records[e.person]?.kind !== 'person') err('data/king-lists.json', `${l.id}: person ${e.person} not found`);
      if (e.event && records[e.event]?.kind !== 'event') err('data/king-lists.json', `${l.id}: event ${e.event} not found`);
      if (!e.person && !e.event && !l.unrecorded_reason && !e.note) err('data/king-lists.json', `${l.id}: row "${e.name}" has no record and the list gives no unrecorded_reason`);
    }
  }
}
if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) in ${checked} files\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${checked} files valid (chronologies, sources, ${counts}, ${chartIds.size} CFAH charts); cross-references, 4-tier sorting rule and MT Genesis 5 and 11 arithmetic consistent.`);
console.log('Sorting tiers used: ' + Object.entries(tierCount).map(([k, v]) => `${k}=${v}`).join(', '));
