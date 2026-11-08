#!/usr/bin/env node
// Writes calculated dates, the gap-fill sort, mother and spouse, and docs/calculated-dates.md.
// Does not run an importer. A record that already has sorting_year keeps that year.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { historicalLabel } from '../raleigh/derived-year.mjs';
import { personTierSort } from '../sort-rule.mjs';
import { assertCalculatedCatalog, calculatedBasisNote, provisionalBirthYear, slotPrinted } from './catalog.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const peopleDir = join(root, 'data/people');
const dry = process.argv.includes('--dry');

const HAM = {
  id: 'ham',
  uncertain: true,
  source: 'johnson-genesis-characters-greek-art',
  note: "Johnson's view: Naamah was the wife of Ham. Genesis does not say this.",
};
const NAAMAH = {
  id: 'naamah',
  uncertain: true,
  source: 'johnson-genesis-characters-greek-art',
  note: "Johnson's view: Naamah was the wife of Ham. Genesis does not say this.",
};

// Relations the records or Scripture state plainly. An uncertain link is an object, never a "?" inside an id.
const FAMILY = {
  naamah: { mother: 'zillah', spouse: [HAM] },
  zillah: { spouse: ['lamech-cainite'] },
  adah: { spouse: ['lamech-cainite'] },
  'lamech-cainite': { spouse: ['adah', 'zillah'] },
  jabal: { mother: 'adah' },
  jubal: { mother: 'adah' },
  'tubal-cain': { father: 'lamech-cainite', mother: 'zillah' },
  ham: { spouse: [NAAMAH] },
  cain: { mother: 'eve' },
  adam: { spouse: ['eve'] },
  eve: { spouse: ['adam'] },
  isaac: { mother: 'sarai' },
  abraham: { spouse: ['sarai', 'hagar', 'keturah'] },
  sarai: { spouse: ['abraham'] },
  hagar: { spouse: ['abraham'] },
  keturah: { spouse: ['abraham'] },
  ishmael: { mother: 'hagar' },
  rachel: { spouse: ['jacob'] },
  jacob: { spouse: ['rachel'] },
  joseph: { mother: 'rachel' },
  benjamin: { mother: 'rachel' },
  'midian-son-of-abraham': { father: 'abraham', mother: 'keturah' },
  iockshan: { father: 'abraham', mother: 'keturah' },
  medan: { father: 'abraham', mother: 'keturah' },
  ishbak: { father: 'abraham', mother: 'keturah' },
  shuah: { father: 'abraham', mother: 'keturah' },
  'semiramis-i': { spouse: ['ninus'] },
  ninus: { spouse: ['semiramis-i'] },
};

const PROSE = {
  naamah: [
    ['Nothing was calculated from the phrase.', 'Her death is calculated as 1994 BC: Noah died in 1998 BC, four years before Naamah, so she died four years later. The year is calculated, and a printed year would replace it.'],
    ['There is no mother or spouse field, so Zillah and Ham are listed under Related.', 'Zillah is her mother. Ham is her spouse, marked uncertain, because that identification is Johnson\'s view.'],
  ],
  zillah: [
    ['No mother or spouse field is stored, so Lamech is Related and is not recorded as her father.', 'Lamech is her husband, not her father. The spouse field records that.'],
  ],
  adah: [
    ['No mother or spouse field is stored, so Lamech is Related and is not recorded as her father.', 'Lamech is her husband, not her father. The spouse field records that.'],
  ],
  jabal: [
    ['No mother field is stored, so Adah is Related.', 'Adah is his mother. The mother field records that.'],
  ],
  jubal: [
    ['No mother field is stored, so Adah is Related.', 'Adah is his mother. The mother field records that.'],
  ],
  ogyges: [
    ['That figure is not a yeere of the World. Display only. No tier 1–4 chronology dates this person, so there is no sort year.', 'That figure is not a yeere of the World. His birth is calculated as 67 years after Jacob\'s tier birth in 1836 BC, which is 1769 BC. The year is calculated, and a printed year would replace it.'],
  ],
};

function kinId(item) {
  return typeof item === 'string' ? item : item.id;
}

function withKeyAfter(obj, after, key, value) {
  const out = {};
  let placed = false;
  for (const [k, v] of Object.entries(obj)) {
    if (k === key) continue;
    out[k] = k === after ? v : v;
    if (k === after) {
      out[k] = v;
      out[key] = value;
      placed = true;
    }
  }
  if (!placed) out[key] = value;
  return out;
}

function withoutKey(obj, key) {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (k !== key) out[k] = v;
  return out;
}

function replaceProse(doc) {
  for (const [from, to] of PROSE[doc.id] || []) {
    if (doc.description.includes(to)) continue;
    if (!doc.description.includes(from)) throw new Error(`${doc.id}: description sentence not found`);
    doc.description = doc.description.replace(from, to);
  }
}

const byId = {};
for (const file of readdirSync(peopleDir)) {
  if (!file.endsWith('.json')) continue;
  const doc = JSON.parse(readFileSync(join(peopleDir, file), 'utf8'));
  byId[doc.id] = doc;
}
const beforeYear = new Map(Object.values(byId).map((d) => [d.id, d.sorting_year]));
const catalog = assertCalculatedCatalog(byId);

const gained = [];
const kept = [];
let motherCount = 0;
let spouseLinks = 0;
const uncertain = [];
const relatedMoves = [];

for (const doc of Object.values(byId)) {
  let next = doc;
  const list = catalog.items.get(doc.id);
  if (list) next = withKeyAfter(next, 'sorting_basis', 'calculated', list);
  const gov = catalog.governing.get(doc.id);
  if (gov) {
    if (beforeYear.get(doc.id) != null) throw new Error(`${doc.id} already has sorting_year ${beforeYear.get(doc.id)}`);
    next.sorting_year = gov.year_bc_ad;
    next.sorting_basis = {
      tier: 'calculated',
      tier_rank: null,
      chronology: gov.source,
      slot: gov.slot,
      note: calculatedBasisNote(gov),
    };
    next = withoutKey(next, 'standby');
    gained.push({ id: doc.id, year: gov.year_bc_ad, slot: gov.slot, arithmetic: gov.arithmetic });
  } else if (beforeYear.get(doc.id) != null && next.sorting_year !== beforeYear.get(doc.id)) {
    throw new Error(`${doc.id} sort moved`);
  } else if (beforeYear.get(doc.id) != null && list) {
    kept.push(doc.id);
  }
  const spec = FAMILY[doc.id];
  if (spec) {
    if (spec.father) next.father = spec.father;
    if (spec.mother) {
      next = withKeyAfter(next, 'father', 'mother', spec.mother);
      motherCount += 1;
    }
    if (spec.spouse) {
      next = withKeyAfter(next, next.mother ? 'mother' : 'father', 'spouse', spec.spouse);
      for (const item of spec.spouse) {
        spouseLinks += 1;
        if (typeof item === 'object' && item.uncertain) uncertain.push(`${doc.id} → ${item.id}`);
      }
    }
    const drop = new Set();
    if (next.father) drop.add(next.father);
    if (spec.mother) drop.add(kinId(spec.mother));
    for (const item of spec.spouse || []) drop.add(kinId(item));
    const removed = (next.related || []).filter((id) => drop.has(id));
    if (removed.length) {
      next.related = next.related.filter((id) => !drop.has(id));
      relatedMoves.push(`${doc.id}: ${removed.join(', ')}`);
    }
  }
  replaceProse(next);
  byId[doc.id] = next;
  if (dry) continue;
  const text = `${JSON.stringify(next, null, 2)}\n`;
  const prev = readFileSync(join(peopleDir, `${doc.id}.json`), 'utf8');
  if (text !== prev) writeFileSync(join(peopleDir, `${doc.id}.json`), text);
}

function yearText(y) {
  return historicalLabel(y) || '—';
}

function statusOf(doc, item, gov) {
  const tier = personTierSort(doc);
  const prov = provisionalBirthYear(doc);
  const fills = !slotPrinted(doc, item.slot);
  const sets = !!(gov && gov.slot === item.slot && gov.year_bc_ad === item.year_bc_ad && gov.kind === item.kind && gov.anchor_record === item.anchor_record && (gov.year_am ?? null) === (item.year_am ?? null) && (gov.delta_years ?? null) === (item.delta_years ?? null));
  let why = '';
  if (sets) why = 'This calculated year sets the sort.';
  else if (tier) why = `Sort stays ${tier.tier} ${yearText(tier.year)} (${tier.slot || 'birth'}).`;
  else if (prov != null) why = `A provisional year (${yearText(prov)}) sets the sort.`;
  else if (slotPrinted(doc, 'birth') && item.slot !== 'birth') why = 'A printed birth year is stored, so a later calculated slot does not set the sort.';
  else if (gov) why = `Another calculated ${gov.slot} (${yearText(gov.year_bc_ad)}) sets the sort.`;
  else why = 'No single calculated year governs.';
  const higher = !!(tier || prov != null);
  return { sets, fills, higher, why };
}

const lines = [];
lines.push('# Calculated dates');
lines.push('');
lines.push('Kevin\'s ruling, 2026-11-08, 11:29 AM CT: "Naamah should be dated, but properly tiered so that as higher tiers arrive, they set the rule. This should be true for any calculable date for a person."');
lines.push('');
lines.push('A calculated year is arithmetic on figures the repo already prints. It is stored on the person in `calculated`, not in a source entry\'s `year_bc_ad`. Precedence is: a tier 1–4 birth, then a tier 1–4 reign start, then a provisional printed year, then one calculated year, then none. Within calculated dates the order is birth, reign start, death, translation. A printed `year_bc_ad` on birth blocks every later slot. Two different calculated birth years do not fall through. The page shows `calc.` and the arithmetic only when that slot has no printed year. Historical years have no year 0.');
lines.push('');
lines.push('Reign lengths were not turned into an end year. A lifespan in years was not added to a birth year. Those would mix a length from one chronology with a year from another, or would be off by a year. See N29 and N30.');
lines.push('');
lines.push(`People with a calculated value: ${catalog.items.size}. Of those, ${gained.length} had no sort year and now have one. ${kept.length} already had a higher sort year; that year is unchanged.`);
lines.push('');
lines.push('## People who gained a sort year');
lines.push('');
lines.push('These records had `sorting_year` null. The calculated tier now sets it. Every other record that already had a `sorting_year` keeps that year.');
lines.push('');
lines.push('| Person | New sort | Slot | Derivation |');
lines.push('| --- | --- | --- | --- |');
for (const row of gained.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))) {
  lines.push(`| \`${row.id}\` | ${yearText(row.year)} | ${row.slot} | ${row.arithmetic.replace(/\|/g, '/')} |`);
}
lines.push('');
lines.push('## Every calculation');
lines.push('');
lines.push('| Person | Slot | Year | Sets sort | Shown on the page | Higher tier overrides | Why | Derivation |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
const ids = [...catalog.items.keys()].sort();
for (const id of ids) {
  const doc = byId[id];
  const gov = catalog.governing.get(id);
  for (const item of catalog.items.get(id)) {
    const st = statusOf(doc, item, gov);
    lines.push(`| \`${id}\` | ${item.slot} | ${yearText(item.year_bc_ad)} | ${st.sets ? 'yes' : 'no'} | ${st.fills ? 'yes' : 'no'} | ${st.higher ? 'yes' : 'no'} | ${st.why.replace(/\|/g, '/')} | ${item.arithmetic.replace(/\|/g, '/')} |`);
  }
}
lines.push('');
lines.push('## Not calculated');
lines.push('');
lines.push('A yeere of the World that is a range, or two different yeeres in one slot, is not reduced to one year. A relative sentence is used only when the anchor and the offset are both printed, as with Naamah and Ogyges.');
lines.push('');
if (!catalog.skipped.length) lines.push('None.');
else {
  lines.push('| Person | Slot | Reason |');
  lines.push('| --- | --- | --- |');
  for (const row of catalog.skipped.sort((a, b) => a.id.localeCompare(b.id) || a.slot.localeCompare(b.slot))) {
    lines.push(`| \`${row.id}\` | ${row.slot} | ${row.reason.replace(/\|/g, '/')} |`);
  }
}
lines.push('');

const docPath = join(root, 'docs/calculated-dates.md');
if (!dry) writeFileSync(docPath, `${lines.join('\n')}\n`);

console.log(`calculated people: ${catalog.items.size}`);
console.log(`new sort positions: ${gained.length}`);
console.log(`higher tier kept: ${kept.length}`);
console.log(`skipped notes: ${catalog.skipped.length}`);
console.log(`mothers set: ${motherCount}`);
console.log(`spouse links: ${spouseLinks}`);
console.log(`uncertain: ${uncertain.join('; ') || 'none'}`);
console.log('related moved out:');
for (const row of relatedMoves) console.log(`  ${row}`);
console.log('new sorts:');
for (const row of gained.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id))) console.log(`  ${row.id} ${yearText(row.year)} ${row.slot}`);
if (dry) console.log('dry run: no files written');
