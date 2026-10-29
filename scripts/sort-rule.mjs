// Four-tier sort. Events use chronologies[]. People use a tier-ranked birth year
// on dates.birth when one is stored. A person with a dates.reign slot and no
// tier-ranked birth year sorts on the reign-start year already stored there
// (year_bc_ad, never a derived year). Kevin's ruling, 2026-10-28 (open question M3).
//
// Within ussher-jones, a reign-start sort prefers the 23rd edition (2026) over
// an older Jones edition when both print a year. Birth sorts keep the first
// matching entry. Importers already place the governing edition first on birth.

export const JONES_23_SOURCE = 'jones-chronology-ot-2026';

export const TIERS = [
  { tier: 'cfah-anchor', rank: 1, chronology: 'cfah', match: (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point' },
  { tier: 'cfah-table1', rank: 2, chronology: 'cfah', match: (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline' },
  // jones-2019 is the 21st edition, display only. It is not this tier. Kevin, 2026-10-28.
  { tier: 'ussher-jones', rank: 3, chronology: 'ussher-jones', match: (e) => e.source === 'ussher-jones' },
  { tier: 'ussher', rank: 4, chronology: 'ussher', match: (e) => e.source === 'ussher' },
];

export const TIER_NAME = {
  'cfah-anchor': 'CFAH anchor',
  'cfah-table1': 'CFAH-1 Table 1',
  'ussher-jones': 'Ussher–Jones',
  ussher: 'Ussher',
};

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
    const hits = (entries || []).filter((x) => t.match(x) && x.year_bc_ad != null);
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
