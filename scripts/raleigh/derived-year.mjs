// Display-only BC/AD beside Raleigh's yeere of the World.
// Kevin's ruling, 28 October 2026: Raleigh's first yeere of the World (AM 1) = 4032 BC.
// One constant. BC = 4033 − AM. When AM >= 4033, AD = AM − 4032. No year 0.
// His own Julian offset (To the Reader, sig. 781a: the Julian Period exceeds the
// yeere of the World by 682; the Jehoshaphat example is on sig. 780b) with
// JP 1 = 4713 BC puts AM 1 at JP 683 = 4031 BC.
// That one-year difference is reported to Kevin. It is not the formula used here.
// Never write the result into year_bc_ad, sorting_year, standby, a span, or a tier.

export const RALEIGH_CREATION_BC = 4032;
export const RALEIGH_DERIVED_FROM = 'raleigh-creation-4032-bc';
export const RALEIGH_SOURCE = 'raleigh-history-of-the-world';
export const RALEIGH_DERIVED_NOTE = "Derived by the portal from Raleigh's Creation in 4032 BC; Raleigh prints only the yeere of the World.";

const DERIVED_KEYS = ['derived_bc_ad', 'derived_bc_ad_end', 'derived_from'];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Historical year: negative = BC, positive = AD, no year 0. Null when AM is not a single positive integer. */
export function raleighDerivedYear(am) {
  if (!Number.isInteger(am) || am < 1) return null;
  if (am >= RALEIGH_CREATION_BC + 1) return am - RALEIGH_CREATION_BC;
  return -(RALEIGH_CREATION_BC + 1 - am);
}

export function historicalLabel(y) {
  if (!Number.isInteger(y) || y === 0) return null;
  return y < 0 ? `${-y} BC` : `AD ${y}`;
}

function derivedRangeLabel(am, end) {
  const y1 = raleighDerivedYear(am);
  const y2 = end != null && end !== am ? raleighDerivedYear(end) : null;
  if (y1 == null) return y2 == null ? null : historicalLabel(y2);
  if (y2 == null) return historicalLabel(y1);
  return `${historicalLabel(y1)} – ${historicalLabel(y2)}`;
}

function cleanAm(n) {
  return Number.isInteger(n) && n >= 1 ? n : null;
}

/** Plain display for one stored Raleigh entry. `text` is null when nothing is derived. */
export function raleighAmDisplay(am, end) {
  const hasEnd = end != null && end !== am;
  if (am == null && !hasEnd) {
    return { text: null, amText: null, paren: null, badge: 'Not derived', flag: 'No derived year: the yeere of the World is empty.' };
  }
  const a = cleanAm(am);
  const b = hasEnd ? cleanAm(end) : null;
  if (am != null && a == null) {
    return { text: null, amText: null, paren: null, badge: 'Not derived', flag: 'No derived year: the yeere of the World is illegible or not a single figure.' };
  }
  if (hasEnd && b == null) {
    return { text: null, amText: null, paren: null, badge: 'Not derived', flag: 'No derived year: a two-figure yeere is not fully legible.' };
  }
  const amText = hasEnd ? `AM ${a}–${b}` : `AM ${a}`;
  const label = derivedRangeLabel(a, hasEnd ? b : null);
  if (!label) {
    return { text: null, amText: null, paren: null, badge: 'Not derived', flag: 'No derived year: the yeere of the World is not a single figure.' };
  }
  const paren = `(derived: ${label})`;
  return { text: `${amText} ${paren}`, amText, paren, badge: null, flag: null };
}

export function raleighAmHtml(am, end) {
  const d = raleighAmDisplay(am, end);
  if (!d.amText) {
    return `<span class="flag flag-oq">${esc(d.badge || 'Not derived')}</span> <span class="small">${esc(d.flag || '')}</span>`;
  }
  const paren = d.paren ? ` <span class="derived" title="${esc(RALEIGH_DERIVED_NOTE)}">${esc(d.paren)}</span>` : '';
  const flag = d.flag ? ` <span class="flag flag-oq">${esc(d.badge || 'Not derived')}</span> <span class="small">${esc(d.flag)}</span>` : '';
  return `${esc(d.amText)}${paren}${flag}`;
}

/** One short line for a record, deduped. Empty when the record has no Raleigh entry. */
export function raleighRecordShort(entries) {
  const parts = [];
  const seen = new Set();
  for (const e of entries || []) {
    if (e?.source !== RALEIGH_SOURCE) continue;
    const key = `${e.year_am ?? 'x'}|${e.year_am_end ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const d = raleighAmDisplay(e.year_am, e.year_am_end);
    if (d.text) parts.push(d.text);
    else if (d.flag) parts.push(d.flag);
  }
  return parts.length ? `Raleigh: ${parts.join('; ')}` : '';
}

function blank(text) {
  return { text, status: 'plain', badge: null, flag: null, worlds: [] };
}

function flagged(text, flag) {
  return { text, status: 'flagged', badge: 'Not derived', flag, worlds: [] };
}

function derived(text, worlds, flag = null, badge = null) {
  return { text, status: 'derived', badge, flag, worlds };
}

const TOKEN = '([0-9●◊〈〉]+)';

/**
 * A chronological-table year cell. The greater number is the Julian Period;
 * the next number is the yeere of the World. Derive only a single legible World
 * figure. A pair that does not differ by 682 is not confirmed, so it is flagged
 * and not derived. Two legible AM figures joined by "or" are each derived.
 */
export function annotateWorldYear(raw) {
  const t = String(raw ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return blank(t);
  if (!/^[0-9●◊〈〉]/.test(t)) return flagged(t, 'The yeere of the World is not a single legible figure.');

  const alt = t.match(/^(\d{1,4})\s+or\s+([0-9●◊〈〉]+)([\s\S]*)$/i);
  if (alt) {
    const left = /^\d+$/.test(alt[1]) ? +alt[1] : null;
    const right = /^\d+$/.test(alt[2]) ? +alt[2] : null;
    if (left != null && right != null) {
      const l1 = historicalLabel(raleighDerivedYear(left));
      const l2 = historicalLabel(raleighDerivedYear(right));
      if (l1 && l2) {
        return derived(
          `${alt[1]} (derived: ${l1}) or ${alt[2]} (derived: ${l2})${alt[3]}`,
          [left, right],
          'Both figures are legible, so each is derived on its own.',
          'Two figures',
        );
      }
    }
    return flagged(t, 'A two-figure yeere is not fully legible, so no derived year is shown.');
  }

  const m = t.match(new RegExp(`^${TOKEN}\\s+${TOKEN}([\\s\\S]*)$`));
  if (!m) return flagged(t, 'The yeere of the World is not a single legible figure.');
  const julian = /^\d+$/.test(m[1]) ? +m[1] : null;
  const world = /^\d+$/.test(m[2]) ? +m[2] : null;
  const rest = m[3];
  if (world == null) return flagged(t, 'The yeere of the World is illegible.');
  if (julian == null) {
    const label = historicalLabel(raleighDerivedYear(world));
    if (!label) return flagged(t, 'The yeere of the World is not a single legible figure.');
    return derived(
      `${m[1]} ${m[2]} (derived: ${label})${rest}`,
      [world],
      'The Julian figure is illegible. The derived year uses the legible yeere of the World only.',
      'Julian illegible',
    );
  }
  if (julian - world !== 682) {
    return flagged(t, 'The two printed numbers do not differ by 682, so this yeere of the World is not confirmed.');
  }
  const label = historicalLabel(raleighDerivedYear(world));
  if (!label) return flagged(t, 'The yeere of the World is not a single legible figure.');
  return derived(`${m[1]} ${m[2]} (derived: ${label})${rest}`, [world]);
}

export function formatAnnotatedCell(ann) {
  if (!ann) return '';
  if (!ann.badge && !ann.flag) return ann.text;
  return `${ann.text} [${ann.badge || 'Not derived'}: ${ann.flag || ''}]`;
}

/** Problems with a stored derived_bc_ad. Empty when the entry is allowed. */
export function raleighDerivedProblems(e) {
  const present = DERIVED_KEYS.filter((k) => e?.[k] != null);
  if (e?.source !== RALEIGH_SOURCE) {
    return present.length
      ? ['derived_bc_ad, derived_bc_ad_end, and derived_from are allowed only on raleigh-history-of-the-world']
      : [];
  }
  const problems = [];
  const expect = raleighDerivedYear(e.year_am);
  const expectEnd = e.year_am_end != null && e.year_am_end !== e.year_am ? raleighDerivedYear(e.year_am_end) : null;
  if (e.derived_bc_ad != null && e.derived_bc_ad !== expect) {
    problems.push(`derived_bc_ad ${e.derived_bc_ad} is not the formula for AM ${e.year_am} (${expect})`);
  }
  if (e.derived_bc_ad_end != null && e.derived_bc_ad_end !== expectEnd) {
    problems.push(`derived_bc_ad_end ${e.derived_bc_ad_end} is not the formula for AM ${e.year_am_end} (${expectEnd})`);
  }
  if ((e.derived_bc_ad != null || e.derived_bc_ad_end != null) && e.derived_from !== RALEIGH_DERIVED_FROM) {
    problems.push(`derived_from must be ${RALEIGH_DERIVED_FROM}`);
  }
  if (e.derived_from != null && e.derived_from !== RALEIGH_DERIVED_FROM) {
    problems.push(`derived_from must be ${RALEIGH_DERIVED_FROM}`);
  }
  if (e.derived_from != null && e.derived_bc_ad == null) problems.push('derived_from is set without derived_bc_ad');
  if (e.year_am == null && e.derived_bc_ad != null) problems.push('a null yeere of the World must not carry derived_bc_ad');
  return problems;
}

export function assertRaleighDerived() {
  const cases = [[1, -4032], [1656, -2377], [2513, -1520], [4032, -1], [4033, 1], [4034, 2]];
  for (const [am, y] of cases) {
    const got = raleighDerivedYear(am);
    if (got !== y) throw new Error(`Raleigh formula: AM ${am} derived ${got}, expected ${y}`);
  }
  if (raleighDerivedYear(null) !== null || raleighDerivedYear(0) !== null || raleighDerivedYear(1.5) !== null) {
    throw new Error('Raleigh formula derived a year from an empty or broken figure');
  }
  const flood = raleighAmDisplay(1656, null);
  if (flood.text !== 'AM 1656 (derived: 2377 BC)') throw new Error(`Flood display: ${flood.text}`);
  const range = raleighAmDisplay(1656, 1657);
  if (range.text !== 'AM 1656–1657 (derived: 2377 BC – 2376 BC)') throw new Error(`Range display: ${range.text}`);
  const adam = annotateWorldYear('683 1. Adaˉ 920');
  if (adam.text !== '683 1 (derived: 4032 BC). Adaˉ 920' || adam.status !== 'derived') throw new Error(`Adam cell: ${adam.text}`);
  const tableFlood = annotateWorldYear('2338 1656');
  if (tableFlood.text !== '2338 1656 (derived: 2377 BC)') throw new Error(`Table flood: ${tableFlood.text}`);
  const example = annotateWorldYear('3195 2513');
  if (!example.text.includes('(derived: 1520 BC)') || example.worlds[0] !== 2513) throw new Error(`Example 2513: ${example.text}`);
  const bad = annotateWorldYear('3840 2158 75');
  if (bad.status !== 'flagged' || bad.text.includes('(derived:')) throw new Error(`Unconfirmed pair was derived: ${bad.text}`);
  const illeg = annotateWorldYear('3749 ●0●7 74');
  if (illeg.status !== 'flagged' || illeg.text.includes('(derived:')) throw new Error(`Illegible world was derived: ${illeg.text}`);
  const partial = annotateWorldYear('●066 2384 301');
  if (partial.status !== 'derived' || !partial.text.includes('(derived: 1649 BC)') || partial.badge !== 'Julian illegible') {
    throw new Error(`Legible world beside an illegible Julian: ${partial.text}`);
  }
  const two = annotateWorldYear('1757 or 1758');
  if (two.status !== 'derived' || !two.text.includes('(derived: 2276 BC)') || !two.text.includes('(derived: 2275 BC)') || two.badge !== 'Two figures') {
    throw new Error(`Two-figure cell: ${two.text}`);
  }
  const half = annotateWorldYear('1757 or 17●8');
  if (half.status !== 'flagged' || half.text.includes('(derived:')) throw new Error(`Broken two-figure cell was derived: ${half.text}`);
  const glued = annotateWorldYear('45413859');
  if (glued.status !== 'flagged' || glued.text.includes('(derived:')) throw new Error(`Glued figures were derived: ${glued.text}`);
  const single = annotateWorldYear('4454');
  if (single.status !== 'flagged' || single.text.includes('(derived:')) throw new Error(`A lone figure was derived: ${single.text}`);
  const cite = annotateWorldYear('L. 3. c. 8. §. 4.');
  if (cite.status !== 'flagged' || cite.text.includes('(derived:')) throw new Error(`A citation was derived: ${cite.text}`);
  const repeat = annotateWorldYear('lulian. World. Exodus .');
  if (repeat.status !== 'flagged' || repeat.text.includes('(derived:')) throw new Error(`A repeated heading was derived: ${repeat.text}`);
  const empty = raleighAmDisplay(null, null);
  if (empty.text || empty.badge !== 'Not derived') throw new Error('Empty AM should be flagged');
  const foreign = raleighDerivedProblems({ source: 'ussher', year_am: 1, derived_bc_ad: -4032, derived_from: RALEIGH_DERIVED_FROM });
  if (!foreign.length) throw new Error('A non-Raleigh derived_bc_ad was allowed');
  const mismatch = raleighDerivedProblems({ source: RALEIGH_SOURCE, year_am: 1656, derived_bc_ad: -1, derived_from: RALEIGH_DERIVED_FROM });
  if (!mismatch.length) throw new Error('A derived_bc_ad that breaks the formula was allowed');
  const okStored = raleighDerivedProblems({ source: RALEIGH_SOURCE, year_am: 1656, derived_bc_ad: -2377, derived_from: RALEIGH_DERIVED_FROM });
  if (okStored.length) throw new Error(`A matching derived field was rejected: ${okStored.join('; ')}`);
}
