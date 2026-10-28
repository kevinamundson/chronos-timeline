// Display-only BC/AD beside Raleigh's yeere of the World.
// Kevin's ruling, 28 October 2026: Raleigh's first yeere of the World (AM 1) = 4032 BC.
// One constant. BC = 4033 − AM. When AM >= 4033, AD = AM − 4032. No year 0.
// His own Julian offset (To the Reader, sig. 781a: the Julian Period exceeds the
// yeere of the World by 682; the Jehoshaphat example is on sig. 780b) with
// JP 1 = 4713 BC puts AM 1 at JP 683 = 4031 BC (table sig. 781b).
// Kevin chose 4032 on 2026-10-28 (G11). The 4031 reading is recorded and is not the formula.
// Display is "AM <year> (<em>BC/AD</em>)". Only the BC or AD year is italic.
// Never write the result into year_bc_ad, sorting_year, standby, a span, or a tier.

export const RALEIGH_CREATION_BC = 4032;
export const RALEIGH_DERIVED_FROM = 'raleigh-creation-4032-bc';
export const RALEIGH_SOURCE = 'raleigh-history-of-the-world';
export const RALEIGH_DERIVED_NOTE = "Derived by the portal from Raleigh's Creation in 4032 BC; Raleigh prints only the yeere of the World.";
export const ITALICS_NOTE = 'Dates in italics are derived.';

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
    return { text: null, html: null, amText: null, paren: null, label: null, badge: 'Not derived', flag: 'No derived year: the yeere of the World is empty.' };
  }
  const a = cleanAm(am);
  const b = hasEnd ? cleanAm(end) : null;
  if (am != null && a == null) {
    return { text: null, html: null, amText: null, paren: null, label: null, badge: 'Not derived', flag: 'No derived year: the yeere of the World is illegible or not a single figure.' };
  }
  if (hasEnd && b == null) {
    return { text: null, html: null, amText: null, paren: null, label: null, badge: 'Not derived', flag: 'No derived year: a two-figure yeere is not fully legible.' };
  }
  const amText = hasEnd ? `AM ${a}–${b}` : `AM ${a}`;
  const label = derivedRangeLabel(a, hasEnd ? b : null);
  if (!label) {
    return { text: null, html: null, amText: null, paren: null, label: null, badge: 'Not derived', flag: 'No derived year: the yeere of the World is not a single figure.' };
  }
  const paren = `(${label})`;
  const html = `${esc(amText)} (<em>${esc(label)}</em>)`;
  return { text: `${amText} ${paren}`, html, amText, paren, label, badge: null, flag: null };
}

export function raleighAmHtml(am, end) {
  const d = raleighAmDisplay(am, end);
  if (!d.html) {
    return `<span class="flag flag-oq">${esc(d.badge || 'Not derived')}</span> <span class="small">${esc(d.flag || '')}</span>`;
  }
  const flag = d.flag ? ` <span class="flag flag-oq">${esc(d.badge || 'Not derived')}</span> <span class="small">${esc(d.flag)}</span>` : '';
  return `${d.html}${flag}`;
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

/** Safe HTML for one record. Empty when the record has no Raleigh entry. */
export function raleighRecordHtml(entries) {
  const parts = [];
  const seen = new Set();
  for (const e of entries || []) {
    if (e?.source !== RALEIGH_SOURCE) continue;
    const key = `${e.year_am ?? 'x'}|${e.year_am_end ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const d = raleighAmDisplay(e.year_am, e.year_am_end);
    if (d.html) parts.push(d.html);
    else if (d.flag) parts.push(esc(d.flag));
  }
  return parts.length ? `Raleigh: ${parts.join('; ')}` : '';
}

/** True when at least one entry renders an italic derived year. */
export function showsItalicDerived(entries) {
  for (const e of entries || []) {
    if (e?.source !== RALEIGH_SOURCE || e.superseded_by) continue;
    if (raleighAmDisplay(e.year_am, e.year_am_end).html) return true;
  }
  return false;
}

function blank(text) {
  return { text, html: esc(text), status: 'plain', badge: null, flag: null, worlds: [] };
}

function flagged(text, flag) {
  return { text, html: esc(text), status: 'flagged', badge: 'Not derived', flag, worlds: [] };
}

function derived(text, worlds, flag = null, badge = null, html = null) {
  return { text, html: html ?? esc(text), status: 'derived', badge, flag, worlds };
}

function emParen(label) {
  return `(<em>${esc(label)}</em>)`;
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
        const plain = `AM ${alt[1]} (${l1}) or AM ${alt[2]} (${l2})${alt[3]}`;
        const html = `AM ${esc(alt[1])} ${emParen(l1)} or AM ${esc(alt[2])} ${emParen(l2)}${esc(alt[3])}`;
        return derived(plain, [left, right], 'Both figures are legible, so each is derived on its own.', 'Two figures', html);
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
    const plain = `${m[1]} AM ${m[2]} (${label})${rest}`;
    const html = `${esc(m[1])} AM ${esc(m[2])} ${emParen(label)}${esc(rest)}`;
    return derived(
      plain,
      [world],
      'The Julian figure is illegible. The derived year uses the legible yeere of the World only.',
      'Julian illegible',
      html,
    );
  }
  if (julian - world !== 682) {
    return flagged(t, 'The two printed numbers do not differ by 682, so this yeere of the World is not confirmed.');
  }
  const label = historicalLabel(raleighDerivedYear(world));
  if (!label) return flagged(t, 'The yeere of the World is not a single legible figure.');
  return derived(`${m[1]} AM ${m[2]} (${label})${rest}`, [world], null, null, `${esc(m[1])} AM ${esc(m[2])} ${emParen(label)}${esc(rest)}`);
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
  if (flood.text !== 'AM 1656 (2377 BC)' || flood.html !== 'AM 1656 (<em>2377 BC</em>)') throw new Error(`Flood display: ${flood.text} / ${flood.html}`);
  const range = raleighAmDisplay(1656, 1657);
  if (range.text !== 'AM 1656–1657 (2377 BC – 2376 BC)' || range.html !== 'AM 1656–1657 (<em>2377 BC – 2376 BC</em>)') throw new Error(`Range display: ${range.text} / ${range.html}`);
  const ad = raleighAmDisplay(4033, null);
  if (ad.text !== 'AM 4033 (AD 1)' || ad.html !== 'AM 4033 (<em>AD 1</em>)') throw new Error(`AD display: ${ad.text} / ${ad.html}`);
  const adam = annotateWorldYear('683 1. Adaˉ 920');
  if (adam.text !== '683 AM 1 (4032 BC). Adaˉ 920' || adam.html !== '683 AM 1 (<em>4032 BC</em>). Adaˉ 920' || adam.status !== 'derived') throw new Error(`Adam cell: ${adam.text} / ${adam.html}`);
  const tableFlood = annotateWorldYear('2338 1656');
  if (tableFlood.text !== '2338 AM 1656 (2377 BC)' || tableFlood.html !== '2338 AM 1656 (<em>2377 BC</em>)') throw new Error(`Table flood: ${tableFlood.text} / ${tableFlood.html}`);
  const example = annotateWorldYear('3195 2513');
  if (!example.text.includes('AM 2513 (1520 BC)') || !example.html.includes('<em>1520 BC</em>') || example.worlds[0] !== 2513) throw new Error(`Example 2513: ${example.text}`);
  const keptPlain = (ann, label) => ann.status === 'flagged' && !ann.text.includes('(derived:') && !ann.html.includes('<em>') || (() => { throw new Error(`${label}: ${ann.text}`); })();
  const bad = annotateWorldYear('3840 2158 75');
  keptPlain(bad, 'Unconfirmed pair was derived');
  const illeg = annotateWorldYear('3749 ●0●7 74');
  keptPlain(illeg, 'Illegible world was derived');
  const partial = annotateWorldYear('●066 2384 301');
  if (partial.status !== 'derived' || !partial.text.includes('AM 2384 (1649 BC)') || !partial.html.includes('<em>1649 BC</em>') || partial.badge !== 'Julian illegible') {
    throw new Error(`Legible world beside an illegible Julian: ${partial.text}`);
  }
  const two = annotateWorldYear('1757 or 1758');
  if (two.status !== 'derived' || !two.html.includes('AM 1757 (<em>2276 BC</em>)') || !two.html.includes('AM 1758 (<em>2275 BC</em>)') || two.badge !== 'Two figures') {
    throw new Error(`Two-figure cell: ${two.text} / ${two.html}`);
  }
  const half = annotateWorldYear('1757 or 17●8');
  keptPlain(half, 'Broken two-figure cell was derived');
  const glued = annotateWorldYear('45413859');
  keptPlain(glued, 'Glued figures were derived');
  const single = annotateWorldYear('4454');
  keptPlain(single, 'A lone figure was derived');
  const cite = annotateWorldYear('L. 3. c. 8. §. 4.');
  keptPlain(cite, 'A citation was derived');
  const repeat = annotateWorldYear('lulian. World. Exodus .');
  keptPlain(repeat, 'A repeated heading was derived');
  const empty = raleighAmDisplay(null, null);
  if (empty.text || empty.badge !== 'Not derived') throw new Error('Empty AM should be flagged');
  const foreign = raleighDerivedProblems({ source: 'ussher', year_am: 1, derived_bc_ad: -4032, derived_from: RALEIGH_DERIVED_FROM });
  if (!foreign.length) throw new Error('A non-Raleigh derived_bc_ad was allowed');
  const mismatch = raleighDerivedProblems({ source: RALEIGH_SOURCE, year_am: 1656, derived_bc_ad: -1, derived_from: RALEIGH_DERIVED_FROM });
  if (!mismatch.length) throw new Error('A derived_bc_ad that breaks the formula was allowed');
  const okStored = raleighDerivedProblems({ source: RALEIGH_SOURCE, year_am: 1656, derived_bc_ad: -2377, derived_from: RALEIGH_DERIVED_FROM });
  if (okStored.length) throw new Error(`A matching derived field was rejected: ${okStored.join('; ')}`);
}
