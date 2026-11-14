// Four-tier sort (labels: TIER_LABEL). Events use chronologies[]. People use a tier-ranked birth year
// on dates.birth when one is stored. A person with a dates.reign slot and no
// tier-ranked birth year sorts on the reign-start year already stored there
// (year_bc_ad, never a derived year). Kevin's ruling, 2026-10-28 (open question M3).
//
// Within ussher-jones, a reign-start sort prefers the 23rd edition (2026) over
// an older Jones edition when both print a year. Birth sorts keep the first
// matching entry. Importers already place the governing edition first on birth.

export const JONES_23_SOURCE = 'jones-chronology-ot-2026';

// Tier 2 (Kevin, 2026-11-13, P1): every dated CFAH entry that is not an anchor point, from all 19 CFAH papers
// (ARJ CFAH-1 to 6 and the OSF preprints CFAH-7 to 19) and from Griffith & White's Reply to Beckman (OSF 5b64m).
// Tier ids are historical: `cfah-table1` is tier 2 "CFAH non-anchor dates"; it is no longer only CFAH-1 Table 1.
export const CFAH_NON_ANCHOR_BASES = ['table1_baseline', 'paper_text', 'beckman_reply'];

export const TIERS = [
  { tier: 'cfah-anchor', rank: 1, chronology: 'cfah', match: (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point' },
  { tier: 'cfah-table1', rank: 2, chronology: 'cfah', match: (e) => e.source === 'cfah' && CFAH_NON_ANCHOR_BASES.includes(e.cfah_basis) },
  // jones-2019 is the 21st edition, display only. It is not this tier. Kevin, 2026-10-28.
  { tier: 'ussher-jones', rank: 3, chronology: 'ussher-jones', match: (e) => e.source === 'ussher-jones' },
  { tier: 'ussher', rank: 4, chronology: 'ussher', match: (e) => e.source === 'ussher' },
];

// Display labels (Kevin, 2026-11-13). Kevin typed "Nolan"; the book prints "Nolen".
export const TIER_LABEL = {
  'cfah-anchor': 'Tier 1 · CFAH anchor point',
  'cfah-table1': 'Tier 2 · CFAH non-anchor dates',
  'ussher-jones': 'Tier 3 · Floyd Nolen Jones',
  ussher: 'Tier 4 · Ussher, Annals of the World',
};

// Short names used inside sentences ("Sorted by reign start (…)").
export const TIER_NAME = {
  'cfah-anchor': 'CFAH anchor point',
  'cfah-table1': 'CFAH non-anchor dates',
  'ussher-jones': 'Ussher–Jones',
  ussher: 'Ussher',
};

// ---- Order inside tier 2 (deterministic; validate.mjs checks the stored order matches it)
//   1. CFAH-1 Table 1 (cfah_basis table1_baseline).
//   2. Other CFAH paper years (paper_text), latest paper in the series first: CFAH-19 … CFAH-8, CFAH-7B, CFAH-7A,
//      then the ARJ papers CFAH-6 … CFAH-1 (an OSF copy of an ARJ paper ranks with that paper). Within one paper,
//      the order the importer stores (table / text order).
//   3. Griffith & White's Reply to Beckman (beckman_reply): by the same authors but outside the numbered series.
// The first entry in that order with a year_bc_ad sets the sort. A tier 1 anchor point always wins over tier 2.
export function cfahPaperRank(sourceTextId) {
  const m = /^cfah-(\d+)([ab])?(?:-|$)/.exec(sourceTextId || '');
  if (!m) return -1;
  return Number(m[1]) + (m[2] === 'b' ? 0.5 : m[2] === 'a' ? 0.25 : 0);
}
const BASIS_ORDER = { table1_baseline: 0, paper_text: 1, beckman_reply: 2 };
export function tier2Compare(a, b) {
  const ba = BASIS_ORDER[a.cfah_basis] ?? 9, bb = BASIS_ORDER[b.cfah_basis] ?? 9;
  if (ba !== bb) return ba - bb;
  if (a.cfah_basis === 'paper_text') return cfahPaperRank(b.source_text_id) - cfahPaperRank(a.source_text_id);
  return 0;
}
// Canonical stored order of a date list: dated CFAH anchor points (stored order), then tier 2 entries in the
// order above (stable), then the null CFAH placeholder only when no CFAH entry is dated, then every other source.
export function orderCfah(list) {
  const cfahDated = (list || []).filter((e) => e.source === 'cfah' && e.date != null);
  const anchors = cfahDated.filter((e) => e.cfah_basis === 'anchor_point');
  const t2 = cfahDated.filter((e) => e.cfah_basis !== 'anchor_point').map((e, i) => [e, i]).sort((x, y) => tier2Compare(x[0], y[0]) || x[1] - y[1]).map((x) => x[0]);
  const dated = [...anchors, ...t2];
  const nul = (list || []).filter((e) => e.source === 'cfah' && e.date == null);
  return [...dated, ...(dated.length ? [] : nul), ...(list || []).filter((e) => e.source !== 'cfah')];
}

export function isJones23(entry) {
  if (!entry || entry.source !== 'ussher-jones') return false;
  if (entry.source_text_id === JONES_23_SOURCE) return true;
  return /23rd ed/i.test(entry.citation || '');
}

// First tier that has a non-null year_bc_ad. Display-only chronologies never match.
// preferJones23: among ussher-jones hits, a 23rd-edition year wins over an older edition.
// Two 23rd-edition years: the first stored entry is the reign start.
export function tierPick(entries, { preferJones23 = false } = {}) {
  for (const t of TIERS) {
    let hits = (entries || []).filter((x) => t.match(x) && x.year_bc_ad != null);
    if (t.rank === 2) hits = hits.map((e, i) => [e, i]).sort((x, y) => tier2Compare(x[0], y[0]) || x[1] - y[1]).map((x) => x[0]);
    if (!hits.length) continue;
    let entry = hits[0];
    if (preferJones23 && t.tier === 'ussher-jones') {
      const ed23 = hits.find(isJones23);
      if (ed23) entry = ed23;
    }
    return { tier: t.tier, rank: t.rank, chronology: t.chronology, year: entry.year_bc_ad, entry };
  }
  return null;
}

export function reignStartPhrase(tier) {
  return `Sorted by reign start (${TIER_NAME[tier] || tier})`;
}

export function reignSortBasis(pick) {
  return {
    tier: pick.tier,
    tier_rank: pick.rank,
    chronology: pick.chronology,
    slot: 'reign_start',
    note: `${reignStartPhrase(pick.tier)}. No tier 1–4 birth year. The year is the reign-start figure already printed on dates.reign: ${pick.entry.date}.`,
  };
}

// Birth tier wins. Otherwise the reign start, when dates.reign exists and a tier year is stored.
// Returns null when neither slot has a tier 1–4 year (provisional and none stay as they are).
export function personTierSort(doc) {
  const birth = tierPick(doc?.dates?.birth || []);
  if (birth) return { ...birth, slot: 'birth' };
  if (doc?.dates && Object.prototype.hasOwnProperty.call(doc.dates, 'reign')) {
    const reign = tierPick(doc.dates.reign, { preferJones23: true });
    if (reign) return { ...reign, slot: 'reign_start' };
  }
  return null;
}

export function basisMatches(doc, pick) {
  const b = doc.sorting_basis || {};
  if (doc.sorting_year !== pick.year) return false;
  if (b.tier !== pick.tier || b.tier_rank !== pick.rank || b.chronology !== pick.chronology) return false;
  if (pick.slot === 'reign_start') return b.slot === 'reign_start';
  return b.slot == null || b.slot === 'birth';
}
