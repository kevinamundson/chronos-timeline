// Calculated dates. Kevin, 2026-11-08, 11:29 AM CT.
// A year worked out from printed figures is stored on the person. It is not written
// into a source entry's year_bc_ad. It sets sorting_year only when no tier 1–4 year
// and no provisional year exist, and only from a slot that itself has no printed year.
// A printed birth year blocks every later slot. Disagreeing birth figures do not fall through.
import { addHistoricalYears, historicalLabel, raleighDerivedYear, RALEIGH_CREATION_BC, RALEIGH_SOURCE } from '../raleigh/derived-year.mjs';
import { personTierSort } from '../sort-rule.mjs';

export const CALC_SLOTS = ['birth', 'reign_start', 'death', 'translated'];

const SLOT_KEY = { birth: 'birth', reign_start: 'reign', death: 'death', translated: 'translated' };

export function slotEntries(doc, slot) {
  return doc?.dates?.[SLOT_KEY[slot]] || [];
}

export function slotPrinted(doc, slot) {
  return slotEntries(doc, slot).some((e) => e?.year_bc_ad != null);
}

/** First non-superseded generations birth year, else Morecraft on a record that import created. */
export function provisionalBirthYear(doc) {
  const births = doc?.dates?.birth || [];
  const g = births.find((e) => e.source === 'generations' && e.year_bc_ad != null && !e.superseded_by);
  if (g) return g.year_bc_ad;
  if (String(doc?.description || '').startsWith('Added from the Morecraft import')) {
    const m = births.find((e) => e.source === 'morecraft' && e.year_bc_ad != null);
    if (m) return m.year_bc_ad;
  }
  return null;
}

function label(year) {
  return historicalLabel(year) || String(year);
}

function relativeNaamah(byId, skipped) {
  const noah = byId.noah;
  const entry = (noah?.dates?.death || []).find((e) => e.source === 'generations' && e.source_text_id === 'generations-preparing-2e' && e.year_bc_ad === -1998 && /four years before Naamah/.test(e.note || ''));
  if (!entry) {
    skipped.push({ id: 'naamah', slot: 'death', reason: 'Noah\'s 2nd-edition death does not print 1998 BC and "four years before Naamah." Not calculated.' });
    return null;
  }
  const year = addHistoricalYears(-1998, 4);
  return {
    slot: 'death',
    year_bc_ad: year,
    kind: 'relative',
    source: 'generations',
    citation: entry.citation,
    link: entry.link ?? null,
    arithmetic: `Noah died ${label(-1998)}, four years before Naamah (Generations, Preparing the World for Jesus, 2nd ed., ch. 7, PDF p. 153 / printed p. 139). ${label(-1998)} + 4 years = ${label(year)}. No year 0.`,
    anchor_record: 'noah',
    anchor_slot: 'death',
    anchor_year_bc_ad: -1998,
    anchor_source: 'generations',
    delta_years: 4,
  };
}

function relativeOgyges(byId, skipped) {
  const og = byId.ogyges;
  const entry = (og?.dates?.birth || []).find((e) => e.source === RALEIGH_SOURCE && /67/.test(e.date || '') && /after/i.test(e.date || '') && /borne|born/i.test(e.date || ''));
  const jacob = personTierSort(byId.jacob);
  if (!entry || !jacob || jacob.slot !== 'birth' || jacob.year !== -1836) {
    skipped.push({ id: 'ogyges', slot: 'birth', reason: 'The 67 yeeres after Jacob need Jacob\'s tier birth at 1836 BC and Raleigh\'s sentence on Ogyges. Not calculated.' });
    return null;
  }
  const year = addHistoricalYears(-1836, 67);
  return {
    slot: 'birth',
    year_bc_ad: year,
    kind: 'relative',
    source: RALEIGH_SOURCE,
    citation: entry.citation,
    link: entry.link ?? null,
    arithmetic: `Jacob's tier birth is ${label(-1836)} (${jacob.tier}). Raleigh says Ogyges "was borne 67. yeeres after him" (Book I, Part I, Chapter VII, §. II, sig. 94b). ${label(-1836)} + 67 years = ${label(year)}. No year 0.`,
    anchor_record: 'jacob',
    anchor_slot: 'birth',
    anchor_year_bc_ad: -1836,
    anchor_source: jacob.chronology,
    delta_years: 67,
  };
}

function raleighSlot(doc, slot, skipped) {
  const entries = slotEntries(doc, slot).filter((e) => e.source === RALEIGH_SOURCE && !e.superseded_by);
  const ranges = entries.filter((e) => Number.isInteger(e.year_am) && e.year_am_end != null && e.year_am_end !== e.year_am);
  const singles = entries.filter((e) => Number.isInteger(e.year_am) && e.year_am >= 1 && (e.year_am_end == null || e.year_am_end === e.year_am));
  const years = [...new Set(singles.map((e) => e.year_am))];
  if (years.length > 1) {
    skipped.push({ id: doc.id, slot, reason: `Raleigh prints more than one yeere of the World in this slot (${years.join(', ')}). Not calculated.` });
    return null;
  }
  if (years.length === 0) {
    if (ranges.length) skipped.push({ id: doc.id, slot, reason: 'Raleigh\'s yeere of the World in this slot is a range. Not calculated.' });
    return null;
  }
  const am = years[0];
  const year = raleighDerivedYear(am);
  if (year == null) {
    skipped.push({ id: doc.id, slot, reason: `AM ${am} is not a single yeere the formula can convert. Not calculated.` });
    return null;
  }
  if (ranges.length) skipped.push({ id: doc.id, slot, reason: `A range in this slot was left unused. The single yeere ${am} was calculated.` });
  const first = singles.find((e) => e.year_am === am);
  const how = am >= RALEIGH_CREATION_BC + 1
    ? `AD = AM − ${RALEIGH_CREATION_BC}`
    : `BC = ${RALEIGH_CREATION_BC + 1} − AM`;
  return {
    slot,
    year_bc_ad: year,
    kind: 'raleigh-am',
    source: RALEIGH_SOURCE,
    citation: first.citation,
    link: first.link ?? null,
    arithmetic: `Raleigh prints the yeere of the World ${am}. Creation is ${RALEIGH_CREATION_BC} BC (Kevin, 2026-10-28). ${how}, so AM ${am} = ${label(year)}. The figure is not written into year_bc_ad.`,
    anchor_record: doc.id,
    anchor_slot: slot,
    anchor_year_bc_ad: -RALEIGH_CREATION_BC,
    anchor_source: RALEIGH_SOURCE,
    year_am: am,
  };
}

function itemsFor(doc, byId, skipped) {
  const items = [];
  if (doc.id === 'naamah') {
    const row = relativeNaamah(byId, skipped);
    if (row) items.push(row);
  }
  if (doc.id === 'ogyges') {
    const row = relativeOgyges(byId, skipped);
    if (row) items.push(row);
  }
  for (const slot of CALC_SLOTS) {
    const row = raleighSlot(doc, slot, skipped);
    if (row) items.push(row);
  }
  items.sort((a, b) => CALC_SLOTS.indexOf(a.slot) - CALC_SLOTS.indexOf(b.slot) || (a.kind === 'relative' ? 0 : 1) - (b.kind === 'relative' ? 0 : 1));
  return items;
}

/** The one calculated item that may set the sort, or null. */
export function governingCalculated(doc, items) {
  if (personTierSort(doc)) return null;
  if (provisionalBirthYear(doc) != null) return null;
  const of = (slot) => (items || []).filter((i) => i.slot === slot);
  const years = (list) => [...new Set(list.map((i) => i.year_bc_ad))];
  if (slotPrinted(doc, 'birth')) return null;
  const birth = of('birth');
  const birthYears = years(birth);
  if (birthYears.length > 1) return null;
  if (birthYears.length === 1) return birth[0];
  for (const slot of ['reign_start', 'death', 'translated']) {
    if (slotPrinted(doc, slot)) continue;
    const list = of(slot);
    const ys = years(list);
    if (ys.length === 1) return list[0];
  }
  return null;
}

export function calculatedBasisNote(item) {
  return `Calculated from printed figures. No tier 1–4 birth, no tier reign start, and no provisional year. ${item.arithmetic} A printed year for this person would replace it.`;
}

/**
 * @param {Record<string, object>} byId person id to person document. The stored `calculated` field is ignored.
 * @returns {{ items: Map<string, object[]>, governing: Map<string, object>, skipped: object[] }}
 */
export function buildCalculated(byId) {
  const items = new Map();
  const governing = new Map();
  const skipped = [];
  for (const doc of Object.values(byId)) {
    if (!doc || doc.type !== 'person') continue;
    const list = itemsFor(doc, byId, skipped);
    if (list.length) items.set(doc.id, list);
    const gov = governingCalculated(doc, list);
    if (gov) governing.set(doc.id, gov);
  }
  return { items, governing, skipped };
}

export function assertCalculatedCatalog(byId) {
  const built = buildCalculated(byId);
  const death = built.items.get('naamah')?.find((i) => i.slot === 'death' && i.kind === 'relative');
  if (!death || death.year_bc_ad !== -1994 || death.delta_years !== 4 || death.anchor_year_bc_ad !== -1998 || death.anchor_record !== 'noah') {
    throw new Error(`Naamah's calculated death is ${death ? death.year_bc_ad : 'missing'}, expected -1994`);
  }
  const naamahSort = built.governing.get('naamah');
  if (!naamahSort || naamahSort.year_bc_ad !== -1994 || naamahSort.slot !== 'death') {
    throw new Error('Naamah\'s calculated death should set the sort');
  }
  const og = built.governing.get('ogyges');
  if (!og || og.year_bc_ad !== -1769 || og.slot !== 'birth' || og.delta_years !== 67) {
    throw new Error(`Ogyges's calculated birth is ${og ? og.year_bc_ad : 'missing'}, expected -1769`);
  }
  for (const id of ['noah', 'adam', 'jacob', 'abraham']) {
    if (built.governing.has(id)) throw new Error(`${id} already has a higher sort year and must not take a calculated one`);
  }
  return built;
}
