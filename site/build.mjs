#!/usr/bin/env node
// Static site generator for the Universal Ancient History Timeline Portal.
// Reads ../data (single source of truth) and writes site/dist/.
// No framework, no server, no database. Pagefind indexes dist/ afterwards (see package.json "build").
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS as BLB_BOOKS, blbFromOsis, blbFromText } from '../scripts/blb.mjs';
import { loadChronologicalTable, toCsv, toMarkdown, toXls, yearColumnIndex } from '../scripts/raleigh/table.mjs';
import { annotateWorldYear, assertRaleighDerived, raleighAmHtml, raleighRecordHtml, raleighRecordShort, showsItalicDerived, RALEIGH_DERIVED_NOTE, ITALICS_NOTE } from '../scripts/raleigh/derived-year.mjs';
import { standbyCounts, standbySummaryLine } from '../scripts/standby/compute.mjs';
import { isJones23, reignStartPhrase } from '../scripts/sort-rule.mjs';
import { redirectLines, redirectsFileHasSennacherib } from '../scripts/redirects.mjs';
import { protectHtml } from './email-protect.mjs';
import { doreUrls, DISPLAY_W, SMALL_W, THUMB_W } from '../scripts/dore/urls.mjs';

assertRaleighDerived();

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const DATA = join(root, 'data');
const DIST = join(here, 'dist');
const NM = join(root, 'node_modules');

// ---------- load data ----------
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));
const loadDir = (d) => readdirSync(join(DATA, d)).filter((f) => f.endsWith('.json')).sort().map((f) => readJSON(join(DATA, d, f)));
const events = loadDir('events');
const people = loadDir('people');
const locations = loadDir('locations');
const maps = loadDir('maps');
const chronFile = readJSON(join(DATA, 'chronologies.json'));
const chronologies = chronFile.chronologies;
const sources = readJSON(join(DATA, 'sources.json')).sources;
const chartDoc = readJSON(join(DATA, 'cfah-charts.json'));
const charts = chartDoc.charts;
const kingDoc = existsSync(join(DATA, 'king-lists.json')) ? readJSON(join(DATA, 'king-lists.json')) : { lists: [], not_recorded: [] };
const doreDoc = existsSync(join(DATA, 'illustrations/dore-1866.json')) ? readJSON(join(DATA, 'illustrations/dore-1866.json')) : { illustrations: [] };
const nameFormDoc = readJSON(join(DATA, 'name-forms.json'));
const nameForms = Object.fromEntries((nameFormDoc.people || []).map((p) => [p.id, p.forms]));
const kingListsOf = (id) => kingDoc.lists.filter((l) => l.entries.some((e) => e.person === id || e.event === id));

const byId = {};
for (const r of [...events, ...people, ...locations, ...maps]) byId[r.id] = r;
const chronById = Object.fromEntries(chronologies.map((c) => [c.id, c]));
const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));
// A source superseded for links (e.g. KJV/Gutenberg → BLB on BibleHub) is shown as its replacement wherever it is linked.
const linkSrc = (id) => { const s = sourceById[id]; return s?.superseded_for_links_by ? sourceById[s.superseded_for_links_by] || s : s; };
const uniqSrc = (ids) => [...new Map(ids.map(linkSrc).filter(Boolean).map((s) => [s.id, s])).values()];

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DIRS = { event: 'events', person: 'people', location: 'locations', map: 'maps' };
const TYPE_LABEL = { event: 'Event', person: 'Person', location: 'Place', map: 'Map' };
const urlOf = (r) => `/${DIRS[r.type]}/${r.id}/`;
const link = (id) => { const r = byId[id]; return r ? `<a href="${urlOf(r)}">${esc(r.title)}</a>` : `<span class="muted">${esc(id)} (not yet a record)</span>`; };
const ext = (href, text) => href ? `<a href="${esc(href)}" rel="noopener" target="_blank">${text}<span class="visually-hidden"> (opens in a new tab)</span></a>` : text;
// CFAH on /chronologies/ is two platform sections (ARJ and OSF), built from sources
// with platform, role, parent, and copy_kind. Responses are a fork tree: a top-level
// comment names the papers it addresses, and a reply hangs under the first response
// in responds_to. Copies nest under the paper or response they duplicate.
const byListOrder = (a, b) => (a.list_order ?? 9999) - (b.list_order ?? 9999) || String(a.title).localeCompare(String(b.title));
const cfahKids = (id, role) => sources.filter((s) => s.parent === id && s.role === role).sort(byListOrder);
const responseKind = (title) => {
  const kinds = [
    /\bReply\b/.test(title) ? 'Reply' : '',
    /\bResponse\b/.test(title) ? 'Response' : '',
    /\bComments?\b/.test(title) ? 'Comment' : '',
  ].filter(Boolean);
  return kinds.length === 1 ? kinds[0] : '';
};
const paperRangeLabel = (ids) => {
  const papers = ids.map((id) => sourceById[id]).filter((s) => s?.role === 'paper');
  const nums = papers.map((s) => {
    const m = String(s.id).match(/^cfah-(\d+)$/);
    return m ? Number(m[1]) : null;
  });
  if (!nums.length || nums.some((n) => n == null)) return '';
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  if (uniq.length === 1) return `Paper ${uniq[0]}`;
  const contiguous = uniq.every((n, i) => i === 0 || n === uniq[i - 1] + 1);
  if (contiguous) return `Papers ${uniq[0]}–${uniq[uniq.length - 1]}`;
  if (uniq.length === 2) return `Papers ${uniq[0]} and ${uniq[1]}`;
  return `Papers ${uniq.slice(0, -1).join(', ')} and ${uniq[uniq.length - 1]}`;
};
const responseShortLabel = (s) => {
  const comments = s.title.match(/Comments\s+\d+/);
  if (comments) return comments[0];
  const parts = s.title.match(/Parts\s+\d+[–-]\d+\.\s*Reply/);
  if (parts) return parts[0];
  if (/^Further Comments\b/.test(s.title)) return 'Further Comments';
  const papers = s.title.match(/Papers\s+\d+[–-]\d+\s*[:.]\s*(?:Comments|Response)/);
  if (papers) {
    const surname = String(s.authors?.[0] || '').split(/\s+/).filter(Boolean).pop();
    return /Comments/.test(papers[0]) && surname ? `${papers[0]} (${surname})` : papers[0];
  }
  return s.title;
};
const cfahItemHtml = (s) => {
  const copies = cfahKids(s.id, 'copy');
  const tag = s.role === 'copy'
    ? ` <span class="tag tag-copy">${esc(s.copy_kind)}</span>`
    : (s.access ? ` <span class="tag">${esc(s.access)}</span>` : '');
  const nest = copies.length ? `<ul class="links cfah-copies">${copies.map(cfahItemHtml).join('')}</ul>` : '';
  return `<li>${ext(s.url, esc(s.title))}${tag}${nest}</li>`;
};
const cfahThreadHtml = (responses) => {
  const ids = new Set(responses.map((s) => s.id));
  const children = new Map();
  const tops = [];
  for (const s of responses) {
    const parent = (s.responds_to || []).map((id) => sourceById[id]).find((t) => t?.role === 'response');
    if (parent) {
      if (!ids.has(parent.id)) throw new Error(`CFAH response ${s.id} answers ${parent.id}, which is not in this Responses list`);
      if (!children.has(parent.id)) children.set(parent.id, []);
      children.get(parent.id).push(s);
    } else tops.push(s);
  }
  const fork = (s) => {
    const kind = responseKind(s.title);
    if (!kind) throw new Error(`CFAH response ${s.id} has no single Comment, Reply, or Response in its title`);
    const targets = s.responds_to || [];
    const responseTargets = targets.map((id) => sourceById[id]).filter((t) => t?.role === 'response');
    const paperIds = targets.filter((id) => sourceById[id]?.role === 'paper');
    const onPapers = responseTargets.length ? '' : paperRangeLabel(paperIds);
    if (!responseTargets.length && paperIds.length && !onPapers) throw new Error(`CFAH response ${s.id} has no paper-range label`);
    const authors = (s.authors || []).map((a) => String(a).trim()).filter(Boolean);
    const onHtml = onPapers ? ` <span class="cfah-on">on ${esc(onPapers)}</span>` : '';
    const alsoHtml = responseTargets.length > 1
      ? ` <span class="cfah-also">also answers: ${responseTargets.slice(1).map((t) => ext(t.url, esc(responseShortLabel(t)))).join('; ')}</span>`
      : '';
    const authorHtml = authors.length ? ` <span class="cfah-author">${esc(authors.join(', '))}</span>` : '';
    const copies = cfahKids(s.id, 'copy');
    const copyHtml = copies.length ? `<ul class="links cfah-copies">${copies.map(cfahItemHtml).join('')}</ul>` : '';
    const kids = (children.get(s.id) || []).slice().sort(byListOrder);
    const nest = kids.length ? `<ol class="cfah-thread">${kids.map(fork).join('')}</ol>` : '';
    return `<li class="cfah-fork" data-id="${esc(s.id)}"><div class="cfah-fork-node"><span class="tag tag-kind">${kind}</span> ${ext(s.url, esc(s.title))}${authorHtml}${onHtml}${alsoHtml}</div>${copyHtml}${nest}</li>`;
  };
  return `<ol class="cfah-thread">${tops.sort(byListOrder).map(fork).join('')}</ol>`;
};
const cfahPlatformListHtml = (ulId) => {
  const sections = sources.filter((s) => s.role === 'series' && (s.platform === 'arj' || s.platform === 'osf')).sort(byListOrder);
  return `<ul class="links cfah-platforms" id="${esc(ulId)}">${sections.map((sec) => {
    const papers = cfahKids(sec.id, 'paper');
    const responses = cfahKids(sec.id, 'response');
    const headTag = sec.access ? ` <span class="tag">${esc(sec.access)}</span>` : '';
    const resp = `<li class="cfah-responses"><p class="cfah-responses-label">Responses</p>${cfahThreadHtml(responses)}</li>`;
    return `<li class="cfah-platform">${ext(sec.url, esc(sec.series_label || sec.title))}${headTag}<ul class="links">${papers.map(cfahItemHtml).join('')}${resp}</ul></li>`;
  }).join('')}</ul>`;
};
const onCfahList = (s) => s.platform === 'arj' || s.platform === 'osf';

// Historical years: negative = BC, no year 0.
const yearLabel = (y, end) => {
  if (y == null) return null;
  const one = (v) => (v < 0 ? `${-v} BC` : `AD ${v}`);
  if (end != null && end !== y) {
    if (y < 0 && end < 0) return `${-y}/${-end} BC`;
    return `${one(y)} – ${one(end)}`;
  }
  return one(y);
};
const amLabel = (am, end) => (am == null ? null : end != null && end !== am ? `AM ${am}–${end}` : `AM ${am}`);
const dateEntries = (rec) => [...(rec?.chronologies || []), ...Object.values(rec?.dates || {}).flat()];
const raleighAside = (rec) => {
  const html = raleighRecordHtml(dateEntries(rec));
  return html ? ` <span class="muted small raleigh-derived" title="${esc(RALEIGH_DERIVED_NOTE)}">${html}</span>` : '';
};
const italicsNote = () => `<p class="small muted raleigh-derived-note">${esc(ITALICS_NOTE)} ${esc(RALEIGH_DERIVED_NOTE)}</p>`;
const placeYear = (r) => (r.sorting_year != null ? r.sorting_year : (r.standby?.year_bc_ad ?? null));
const standbyPhrase = (rec) => {
  const s = rec?.standby;
  if (!s) return '';
  if (s.basis === 'source-printed') {
    const c = chronById[s.source_chronology];
    return `printed by ${c?.abbreviation || c?.name || s.source_chronology}`;
  }
  const from = byId[s.from_record];
  return `placed with ${from?.title || s.from_record}`;
};
const standbyItemLabel = (rec) => `${yearLabel(rec.standby.year_bc_ad)} · standby placement · ${standbyPhrase(rec)}`;

// OSIS → readable reference + Berean Literal Bible link (scripts/blb.mjs: first chapter/verse of the range)
const BOOKS = Object.fromEntries(Object.entries(BLB_BOOKS).map(([k, v]) => [k, v[0]]));
const osis = (ref) => {
  const [a, b] = ref.split('-');
  const pa = a.split('.');
  const book = BOOKS[pa[0]] || pa[0];
  const cv = (p) => (p.length > 1 ? p.join(':') : p[0]);
  let text = `${book} ${cv(pa.slice(1))}`;
  if (b) {
    let pb = b.split('.');
    if (BOOKS[pb[0]] || /^[1-4]?[A-Z]/.test(pb[0])) {
      if (pb[0] !== pa[0]) { text += `–${BOOKS[pb[0]] || pb[0]} ${cv(pb.slice(1))}`; pb = null; } else pb = pb.slice(1);
    }
    if (pb) text += pb.length === 1 && pa.length === 3 ? `–${pb[0]}` : `–${cv(pb)}`;
  }
  return { text, href: blbFromOsis(ref) };
};
const scriptureList = (refs) => !refs?.length ? '' : `<ul class="chips">${refs.map((r) => { const o = osis(r); return `<li>${ext(o.href, esc(o.text))}</li>`; }).join('')}</ul>`;

// Chronology display order (owner spec): CFAH anchor, CFAH-1 Table 1, Ussher-Jones, Ussher, Jordan (secondary, display only), Bible, (MT arithmetic), Josephus, Raleigh, Clonmacnoise.
const ROW_ORDER = ['cfah:anchor_point', 'cfah:table1_baseline', 'cfah:paper_text', 'cfah:', 'ussher-jones', 'jones-2019', 'ussher', 'jordan', 'jordan-compilation', 'generations', 'herodotus', 'morecraft', 'cory', 'shuckford', 'hales', 'bible', 'masoretic-genealogy', 'josephus', 'raleigh-history-of-the-world', 'annals-of-clonmacnoise'];
const rowKey = (e) => (e.source === 'cfah' ? `cfah:${e.cfah_basis || ''}` : e.source);
const rowRank = (e) => { const i = ROW_ORDER.indexOf(rowKey(e)); return i < 0 ? 99 : i; };
const chronName = (e, opts = {}) => {
  if (e.source === 'cfah') {
    if (e.cfah_basis === 'anchor_point') return 'CFAH <span class="tag tag-t1">anchor point</span>';
    if (e.cfah_basis === 'table1_baseline') return 'CFAH-1 Table 1 <span class="tag tag-t2">Ussher–Jones baseline</span>';
    if (e.cfah_basis === 'paper_text') return 'CFAH <span class="tag">paper text (not an anchor point)</span>';
    return 'CFAH';
  }
  if (e.source === 'jordan') return 'Jordan <span class="tag tag-sec" title="Secondary display chronology; never sets the sort year">secondary</span>';
  if (e.source === 'herodotus') return `Herodotus <span class="tag tag-sec" title="Herodotus, The Histories (tr. Rawlinson); secondary display only; never sets the sort and gives no BC years">secondary</span><div class="small muted">The Histories, tr. Rawlinson</div>`;
  if (e.source === 'generations') {
    const book = !opts.hideBook && e.source_text_id && sourceById[e.source_text_id] ? `<div class="small muted">${esc(sourceById[e.source_text_id].short || sourceById[e.source_text_id].title)}</div>` : '';
    return `Generations <span class="tag tag-sec" title="Generations curriculum (Swanson et al.); secondary display only; supplies a provisional sort only where no tier 1-4 date exists">secondary</span>${book}`;
  }
  if (e.source === 'morecraft') return `Morecraft <span class="tag tag-sec" title="Joe Morecraft III, A Christian Survey of World History; secondary display only; supplies a provisional sort only to records it alone dates">secondary</span><div class="small muted">A Christian Survey of World History</div>`;
  if (e.source === 'cory') return `Cory <span class="tag tag-sec" title="Cory, Ancient Fragments (1876, ed. Hodges); secondary display only; never sets the sort and gives no BC years">secondary</span><div class="small muted">Ancient Fragments, 1876</div>`;
  if (e.source === 'shuckford') return `Shuckford <span class="tag tag-sec" title="Shuckford, Sacred and Profane History (1819, ed. Creighton), vol. 1; secondary display only; never sets the sort. Anno Mundi is not converted to BC.">secondary</span><div class="small muted">Sacred and Profane History, 1819</div>`;
  if (e.source === 'hales') return `Hales <span class="tag tag-sec" title="Hales, A New Analysis of Chronology (1830, 2nd ed.); secondary display only; never sets the sort. He prints B.C. years. Anno Mundi is not converted.">secondary</span><div class="small muted">A New Analysis of Chronology, 1830</div>`;
  if (e.source === 'jordan-compilation') return 'Jordan (compilation) <span class="tag tag-sec" title="Unnamed compiler\'s charts of Jordan\'s system; secondary display only">secondary</span>';
  if (e.source === 'jones-2019') return 'Ussher–Jones <div class="small muted edition">21st ed. (2019)</div>';
  const c = chronById[e.source];
  return esc(c ? c.abbreviation || c.name : e.source);
};
const TIERS = {
  'cfah-anchor': { cls: 't1', label: 'Tier 1 · CFAH anchor point' },
  'cfah-table1': { cls: 't2', label: 'Tier 2 · CFAH-1 Table 1 (Ussher–Jones baseline)' },
  'ussher-jones': { cls: 't3', label: 'Tier 3 · Ussher–Jones (Floyd Nolen Jones)' },
  ussher: { cls: 't4', label: 'Tier 4 · Ussher, Annals of the World' },
  derived: { cls: 'td', label: 'Derived · sort year copied from a related record' },
  provisional: { cls: 'tp', label: 'Provisional · Generations curriculum date (no CFAH / Ussher–Jones / Ussher date exists; pending owner decision)' },
  none: { cls: 'tn', label: 'Undated · no tier gives a year' },
};
// Which entry set the sort (mirrors scripts/sort-rule.mjs).
// A reign-start ussher-jones year prefers the 23rd edition, then the stored year.
const sortingEntry = (entries, basis, sortYear) => {
  if (!basis) return null;
  const has = (e) => e.year_bc_ad != null;
  const t = basis.tier;
  const list = entries || [];
  const byYear = (hits) => (sortYear == null ? hits[0] : hits.find((e) => e.year_bc_ad === sortYear) || hits[0]) || null;
  if (t === 'cfah-anchor') return list.find((e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point' && has(e));
  if (t === 'cfah-table1') return list.find((e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline' && has(e));
  if (t === 'ussher-jones') {
    const hits = list.filter((e) => e.source === 'ussher-jones' && has(e));
    if (basis.slot === 'reign_start') {
      const ed23 = hits.filter(isJones23);
      return byYear(ed23.length ? ed23 : hits);
    }
    return byYear(hits);
  }
  if (t === 'ussher') return byYear(list.filter((e) => e.source === 'ussher' && has(e)));
  if (t === 'provisional') return basis.chronology === 'morecraft' ? list.find((e) => e.source === 'morecraft' && has(e)) : list.find((e) => e.source === 'generations' && has(e) && !e.superseded_by);
  return null;
};
const sortEntriesOf = (rec) => {
  if (rec.sorting_basis?.slot === 'reign_start') return rec.dates?.reign || [];
  return rec.chronologies || rec.dates?.birth || [];
};
// Four-tier rule applied to any date list (birth/death/translated): CFAH AP > CFAH-1 Table 1 > Ussher-Jones > Ussher.
const TIER_PICKS = [
  ['cfah-anchor', (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point'],
  ['cfah-table1', (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline'],
  ['ussher-jones', (e) => e.source === 'ussher-jones'],
  ['ussher', (e) => e.source === 'ussher'],
  // Provisional only (no tier 1-4 date): Generations curriculum, same rule as the record sort.
  ['provisional', (e) => e.source === 'generations' && !e.superseded_by],
  // ... then Morecraft, for people only it dates (the same order as the record sort).
  ['provisional', (e) => e.source === 'morecraft'],
];
const tierYear = (entries) => {
  for (const [tier, pick] of TIER_PICKS) {
    const e = (entries || []).find((x) => pick(x) && x.year_bc_ad != null);
    if (e) return { y: e.year_bc_ad, yEnd: e.year_bc_ad_end ?? null, tier };
  }
  return null;
};

// Display only. One top-level row per author (CFAH anchor, CFAH-1 Table 1 and CFAH paper text stay separate chronologies).
// Quotes that share a year nest under that date. A different year is a sub-row. Nothing here writes sorting_year, a tier or standby.
// Jones 2019 is the same author as Ussher–Jones. A differing year is a sub-row under that row.
const authorKey = (e) => {
  if (e.source === 'cfah') return `cfah:${e.cfah_basis || ''}`;
  if (e.source === 'jones-2019') return 'ussher-jones';
  return e.source;
};
const dateIdentity = (e) => {
  const years = [e.year_bc_ad, e.year_bc_ad_end, e.year_am, e.year_am_end];
  const sup = e.superseded_by || '';
  if (!years.some((y) => y != null)) return `text:${e.date ?? ''}\u001f${sup}`;
  return `year:${years.map((y) => (y == null ? '' : String(y))).join(',')}\u001f${sup}`;
};
const plainYear = (e) => {
  if (e.source === 'raleigh-history-of-the-world') return amLabel(e.year_am, e.year_am_end) || '';
  return [yearLabel(e.year_bc_ad, e.year_bc_ad_end), amLabel(e.year_am, e.year_am_end)].filter(Boolean).join(' · ');
};
const yearCell = (e) => {
  const years = e.source === 'raleigh-history-of-the-world'
    ? raleighAmHtml(e.year_am, e.year_am_end)
    : [yearLabel(e.year_bc_ad, e.year_bc_ad_end), amLabel(e.year_am, e.year_am_end)].filter(Boolean).join('<br>');
  return years || '<span class="muted">—</span>';
};
const apTags = (e) => `${e.cfah_ap ? `<span class="tag tag-ap">${esc(e.cfah_ap)}</span> ` : ''}${e.cfah_preprint ? '<span class="tag tag-preprint" title="OSF preprint: not peer-reviewed in Answers Research Journal">OSF preprint</span>' : ''}`;
const entryFlags = (e, setter, sortYear) => {
  const flags = [];
  if (e === setter) flags.push('<span class="flag flag-sort" title="This entry sets the sort year">Sets sort year</span>');
  if (sortYear != null && e.year_bc_ad != null && e.year_bc_ad !== sortYear) {
    const d = e.year_bc_ad - sortYear;
    flags.push(`<span class="flag flag-diff">Differs from sort year by ${Math.abs(d)} yr${Math.abs(d) === 1 ? '' : 's'}</span>`);
  }
  return flags;
};
const flagHtml = (flags) => (flags.length ? `<div class="flags">${flags.join(' ')}</div>` : '');
const citeBody = (e) => {
  const href = e.link || (['bible', 'masoretic-genealogy'].includes(e.source) ? blbFromText(e.citation) : null);
  const link = e.citation ? ext(href, esc(e.citation)) : '<span class="muted">—</span>';
  const edition = e.edition_note ? `<div class="note"><span class="tag tag-old">${esc(/not in/.test(e.edition_note) ? 'not in 2nd ed.' : 'edition')}</span> ${esc(e.edition_note)}</div>` : '';
  const note = e.note ? `<div class="note">${esc(e.note)}</div>` : '';
  return `${link}${edition}${note}`;
};
const sourceLine = (e) => {
  const src = e.source_text_id && sourceById[e.source_text_id];
  return src ? `<div class="small muted">${esc(src.short || src.title)}</div>` : '';
};
function supersededDetails(entries) {
  if (entries.length === 1) {
    const e = entries[0];
    const nb = sourceById[e.superseded_by];
    return `<details><summary><span class="tag tag-old">superseded</span> ${esc(e.date)} <span class="small muted">· ${esc(e.edition_note || `superseded by ${nb?.short || e.superseded_by}`)}</span></summary>
<div class="small">${yearLabel(e.year_bc_ad, e.year_bc_ad_end) || ''}${e.precision ? ` · Precision: ${esc(e.precision)}` : ''}</div>
<div>${e.citation ? ext(e.link, esc(e.citation)) : ''}</div>${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}</details>`;
  }
  const e0 = entries[0];
  const nb = sourceById[e0.superseded_by];
  const label = plainYear(e0) || e0.date || 'superseded';
  const sameText = entries.every((e) => e.date === e0.date);
  const items = entries.map((e) => {
    const quote = !sameText && e.date ? `<div class="date-quote">${esc(e.date)}</div>` : '';
    return `<li>${quote}${sourceLine(e)}<div>${e.citation ? ext(e.link, esc(e.citation)) : ''}</div>${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}</li>`;
  }).join('');
  return `<details><summary><span class="tag tag-old">superseded</span> ${esc(label)} <span class="small muted">· ${esc(e0.edition_note || `superseded by ${nb?.short || e0.superseded_by}`)}</span></summary>
<ul class="date-quotes">${items}</ul></details>`;
}
function dateCell(entries) {
  const pending = entries.every((e) => e.date == null);
  const texts = entries.map((e) => e.date ?? null);
  const sameText = texts.every((t) => t === texts[0]);
  const body = pending
    ? '<span class="muted">Not yet established</span>'
    : esc(sameText ? texts[0] : (plainYear(entries[0]) || texts.find(Boolean) || ''));
  const apSame = new Set(entries.map((e) => e.cfah_ap || '')).size === 1 && new Set(entries.map((e) => (e.cfah_preprint ? '1' : ''))).size === 1;
  const tagged = entries.find((e) => e.cfah_ap || e.cfah_preprint);
  const tags = apSame && tagged ? `<div>${apTags(tagged)}</div>` : '';
  const precisions = new Set(entries.map((e) => e.precision || ''));
  const prec = !pending && precisions.size === 1 && [...precisions][0] ? `<div class="small muted">Precision: ${esc([...precisions][0])}</div>` : '';
  const edition = entries.every((e) => e.source === 'jones-2019') ? '<div class="small muted edition">21st ed. (2019)</div>' : '';
  return `${edition}${body}${tags}${prec}`;
}
function quoteList(entries, setter, sortYear) {
  const sameText = entries.every((e) => (e.date ?? null) === (entries[0].date ?? null));
  const showSource = new Set(entries.map((e) => e.source_text_id || '')).size > 1;
  const showAp = new Set(entries.map((e) => e.cfah_ap || '')).size > 1 || new Set(entries.map((e) => (e.cfah_preprint ? '1' : ''))).size > 1;
  const showPrec = new Set(entries.map((e) => (e.date == null ? '' : (e.precision || '')))).size > 1;
  const items = entries.map((e) => {
    const quote = !sameText && e.date != null ? `<div class="date-quote">${esc(e.date)}</div>` : '';
    const src = showSource ? sourceLine(e) : '';
    const ap = showAp && (e.cfah_ap || e.cfah_preprint) ? `<div>${apTags(e)}</div>` : '';
    const prec = showPrec && e.precision && e.date != null ? `<div class="small muted">Precision: ${esc(e.precision)}</div>` : '';
    return `<li>${quote}${src}${citeBody(e)}${ap}${prec}</li>`;
  }).join('');
  const who = entries.find((e) => e === setter) || entries.find((e) => e.year_bc_ad != null) || entries[0];
  return `<ul class="date-quotes">${items}</ul>${flagHtml(entryFlags(who, setter, sortYear))}`;
}
function authorLabel(entries) {
  const ids = new Set(entries.map((e) => e.source_text_id || ''));
  return chronName(entries[0], { hideBook: ids.size > 1 });
}
function renderSingleRow(e, setter, sortYear) {
  const key = esc(authorKey(e));
  if (e.superseded_by) {
    return `<tr class="superseded" data-author="${key}">
<th scope="row">${chronName(e)}</th>
<td colspan="3">${supersededDetails([e])}</td>
</tr>`;
  }
  const pending = e.date == null;
  return `<tr class="${pending ? 'pending' : ''}${e === setter ? ' is-sort' : ''}" data-author="${key}">
<th scope="row">${chronName(e)}</th>
<td>${dateCell([e])}</td>
<td class="nowrap">${yearCell(e)}</td>
<td>${citeBody(e)}${flagHtml(entryFlags(e, setter, sortYear))}</td>
</tr>`;
}
function renderDateRow(key, label, entries, setter, sortYear, { sub, span }) {
  const sup = entries.every((e) => e.superseded_by);
  const pending = entries.every((e) => e.date == null);
  const sets = entries.some((e) => e === setter);
  const classes = [];
  if (pending && !sup) classes.push('pending');
  if (sets) classes.push('is-sort');
  if (sup && span === 1) classes.push('superseded');
  if (sub) classes.push('chron-sub');
  const cls = classes.length ? ` class="${classes.join(' ')}"` : '';
  const attr = sub ? ` data-author-sub="${esc(key)}"` : ` data-author="${esc(key)}"`;
  const th = sub ? '' : `<th scope="${span > 1 ? 'rowgroup' : 'row'}"${span > 1 ? ` rowspan="${span}"` : ''}>${label}</th>`;
  if (sup) {
    const cellCls = span > 1 ? ' class="superseded"' : '';
    return `<tr${cls}${attr}>
${th}<td colspan="3"${cellCls}>${supersededDetails(entries)}</td>
</tr>`;
  }
  const dateCls = sub ? ' class="date-sub"' : '';
  const cites = entries.length === 1 ? `${citeBody(entries[0])}${flagHtml(entryFlags(entries[0], setter, sortYear))}` : quoteList(entries, setter, sortYear);
  return `<tr${cls}${attr}>
${th}<td${dateCls}>${dateCell(entries)}</td>
<td class="nowrap">${yearCell(entries[0])}</td>
<td>${cites}</td>
</tr>`;
}
function chronTable(entries, { sortYear, basis, caption }) {
  const sorted = [...entries].map((e, i) => ({ e, i })).sort((a, b) => rowRank(a.e) - rowRank(b.e) || a.i - b.i).map((x) => x.e);
  const setter = sortingEntry(entries, basis, sortYear);
  const groups = [];
  const index = new Map();
  for (const e of sorted) {
    const key = authorKey(e);
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ key, entries: [] });
    }
    groups[index.get(key)].entries.push(e);
  }
  const rows = groups.map((group) => {
    if (group.entries.length === 1) return renderSingleRow(group.entries[0], setter, sortYear);
    const dates = [];
    const seen = new Map();
    for (const e of group.entries) {
      const id = dateIdentity(e);
      if (!seen.has(id)) {
        seen.set(id, dates.length);
        dates.push([]);
      }
      dates[seen.get(id)].push(e);
    }
    const label = authorLabel(group.entries);
    if (dates.length === 1) return renderDateRow(group.key, label, dates[0], setter, sortYear, { sub: false, span: 1 });
    return dates.map((list, i) => renderDateRow(group.key, label, list, setter, sortYear, { sub: i > 0, span: dates.length })).join('\n');
  }).join('\n');
  return `<div class="table-wrap" role="region" aria-label="${esc(caption)}" tabindex="0"><table class="chron">
<caption>${esc(caption)}</caption>
<thead><tr><th scope="col">Chronology</th><th scope="col">Date as stated</th><th scope="col">Year (BC / AM)</th><th scope="col">Citation &amp; note</th></tr></thead>
<tbody>${rows}</tbody></table></div>`;
}

// Data-driven disagreement detection (no new dates: compares stated figures only)
function disagreements(entries, sortYear) {
  const out = [];
  const bc = {}; const am = {};
  for (const e of entries) {
    if (e.superseded_by) continue; // older edition: noted on its collapsed row instead
    const name = e.source === 'cfah' ? (e.cfah_basis === 'table1_baseline' ? 'CFAH-1 Table 1' : 'CFAH') : (chronById[e.source]?.abbreviation || chronById[e.source]?.name || e.source);
    if (e.year_bc_ad != null) (bc[e.year_bc_ad] ||= new Set()).add(name);
    if (e.year_am != null) (am[e.year_am] ||= new Set()).add(name);
  }
  const fmt = (o, f) => Object.entries(o).sort((a, b) => a[0] - b[0]).map(([y, s]) => `<strong>${esc(f(+y))}</strong> (${esc([...s].join(', '))})`).join('; ');
  if (Object.keys(bc).length > 1) out.push(`BC years differ: ${fmt(bc, (y) => yearLabel(y))}.`);
  if (Object.keys(am).length > 1) out.push(`Anno Mundi figures differ: ${fmt(am, (y) => `AM ${y}`)}.`);
  return out;
}

function flagsSection(rec, entries) {
  const auto = entries ? disagreements(entries, rec.sorting_year) : [];
  const oq = rec.open_questions || [];
  if (!auto.length && !oq.length) return '';
  return `<section class="card flags-card" aria-labelledby="flags-h"><h2 id="flags-h">Disagreements &amp; open questions</h2>
${auto.length ? `<ul class="flag-list">${auto.map((t) => `<li><span class="flag flag-diff">Chronologies disagree</span> ${t}</li>`).join('')}</ul>` : ''}
${oq.length ? `<ul class="flag-list">${oq.map((t) => `<li><span class="flag flag-oq">Open question</span> ${esc(t)}</li>`).join('')}</ul>` : ''}
<p class="small muted">Flags are generated from the figures stored in the data. The master timeline still sorts by the CFAH-weighted sort year.</p></section>`;
}

function sortBadge(rec) {
  const b = rec.sorting_basis || {};
  const t = (b.tier === 'provisional' && b.chronology === 'morecraft' ? { cls: 'tp', label: 'Provisional · Morecraft date (no CFAH / Ussher–Jones / Ussher / Generations date exists; pending owner decision)' } : TIERS[b.tier]) || { cls: 'tn', label: b.tier || 'unknown' };
  const ent = sortingEntry(sortEntriesOf(rec), b, rec.sorting_year);
  const yl = yearLabel(rec.sorting_year, b.slot === 'reign_start' ? null : ent?.year_bc_ad_end) || 'Undated';
  let extra = '';
  if (b.tier === 'derived' && b.derived_from) extra = ` from ${link(b.derived_from)}`;
  const slotLine = b.slot === 'reign_start' ? `<p class="sort-slot">${esc(reignStartPhrase(b.tier))}.</p>` : '';
  return `<div class="sortbox">
<div class="sortyear"><span class="small muted">Sort year</span><strong>${esc(yl)}</strong></div>
<div><span class="tier tier-${t.cls}">${esc(t.label)}</span>${extra}${slotLine}${b.note ? `<p class="small muted">${esc(b.note)}</p>` : ''}</div></div>`;
}

const linkList = (ids, title) => !ids?.length ? '' : `<section class="card"><h2>${esc(title)}</h2><ul class="links">${ids.map((id) => `<li>${link(id)}</li>`).join('')}</ul></section>`;

// ---------- CFAH chart gallery (links only; images are never copied) ----------
const chartCard = (c, h = 'h2') => `<li class="chart-card" id="${esc(c.id)}">
${c.thumbnail ? `<a class="chart-thumb" href="${esc(c.image_url)}" rel="noopener" target="_blank"><img src="${esc(c.thumbnail)}" alt="${esc(c.caption)}" loading="lazy" decoding="async" referrerpolicy="strict-origin-when-cross-origin"><span class="visually-hidden"> (full image opens in a new tab)</span></a>` : `<div class="chart-text" aria-hidden="true"><span>${esc(c.paper)}</span><span>${esc(c.figure)}</span></div>`}
<div class="chart-body"><${h} class="chart-title">${esc(c.paper)} · ${esc(c.figure)}</${h}>
<p>${esc(c.caption)}</p>
<p class="small muted">${esc(c.section)}</p>
${c.credit ? `<p class="small muted">Image credit (per the paper): ${esc(c.credit)}</p>` : ''}
<ul class="links small"><li>${ext(c.image_url, c.thumbnail ? 'Open image' : 'Open file on OSF')}</li><li>${ext(c.paper_url, 'Open paper')}</li></ul>
${c.related?.length ? `<p class="small">Records: ${c.related.map(link).join(', ')}</p>` : ''}
<p class="small muted">${esc(c.host)}</p></div></li>`;
const chartsFor = (id) => charts.filter((c) => c.related?.includes(id));
const chartSection = (id) => { const cs = chartsFor(id); return !cs.length ? '' : `<section class="card"><h2>CFAH charts</h2><ul class="chart-grid chart-grid-small">${cs.map((c) => chartCard(c, 'h3')).join('')}</ul><p class="small"><a href="/gallery/">All CFAH charts</a></p></section>`; };

// ---------- Gustave Doré, Bible illustrations (1866) ----------
// Images come from the Internet Archive IIIF Image API (data/illustrations/dore-1866.json); none is copied.
// v2 is the image the page requests. v3 is the fallback (site/src/dore.js retries once, then links to Archive.org).
// One illustration: a figure. Two or more: a swipeable gallery (scroll-snap).
// The figure sits beside the title. On a narrow screen it stacks under the title.
const doreIds = (il) => il.records.map((r) => r.id);
const doreFor = (id) => doreDoc.illustrations.filter((il) => doreIds(il).includes(id)).sort((a, b) => a.number - b.number);
const doreFigure = (il, i, n, currentId) => {
  const ref = il.scripture_ref ? osis(il.scripture_ref) : null;
  const others = doreIds(il).filter((r) => r !== currentId && byId[r]);
  const urls = doreUrls(il.file);
  const fileNo = `${String(il.number).padStart(3, '0')}${il.suffix || ''}`;
  return `<figure class="dore-fig${n > 1 ? ' dore-slide' : ''}"${n > 1 ? ` role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}: ${esc(il.title)}"` : ''}>
<div class="dore-frame" style="aspect-ratio: ${il.original_width} / ${il.original_height}" aria-busy="true"><div class="dore-loading" role="status"><span class="dore-spinner" aria-hidden="true"></span><span class="visually-hidden">Loading illustration</span></div>
<a href="${esc(il.details_url)}" rel="noopener" target="_blank"><img class="dore-img" src="${esc(il.image_small)}" srcset="${esc(il.image_small)} ${SMALL_W}w, ${esc(il.image)} ${DISPLAY_W}w" sizes="(min-width: 800px) 340px, 92vw" width="${DISPLAY_W}" height="${il.display_height}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fallback-src="${esc(urls.small_v3)}" data-fallback-srcset="${esc(urls.small_v3)} ${SMALL_W}w, ${esc(urls.display_v3)} ${DISPLAY_W}w" alt="Gustave Doré, ${esc(il.title)} (wood engraving, 1866)"><span class="visually-hidden"> (opens on Archive.org in a new tab)</span></a>
<p class="dore-unavailable small muted" hidden>The Internet Archive did not return this image just now. ${ext(il.details_url, 'Open it on Archive.org')}.</p></div>
<figcaption><span class="dore-title">${esc(il.title)}</span><br><span class="small">Gustave Doré, 1866. Archive.org file ${fileNo}.${ref ? ` Scene: ${ext(ref.href, esc(ref.text))}.` : ''}</span>
<ul class="links small"><li>${ext(il.details_url, 'Open on Archive.org')}</li>${others.length ? `<li>Also on: ${others.map(link).join(', ')}</li>` : ''}</ul></figcaption></figure>`;
};
const doreSection = (id) => {
  const ils = doreFor(id);
  if (!ils.length) return '';
  const n = ils.length;
  const credit = `<p class="small muted">Public domain. Images are served by the Internet Archive (${ext('https://archive.org/details/gustavedore', 'Gustave Doré Bible Illustrations (1866)')}) and are not copied to this site. Titles and numbers are the Archive.org file names. <a href="/illustrations/dore/">All ${doreDoc.illustrations.length} plates</a>.</p>`;
  if (n === 1) return `<section class="card dore record-dore" aria-labelledby="dore-h"><h2 id="dore-h">Illustration</h2>${doreFigure(ils[0], 0, 1, id)}${credit}</section>`;
  return `<section class="card dore record-dore" aria-labelledby="dore-h"><h2 id="dore-h">Illustrations <span class="muted small">(${n})</span></h2>
<div class="dore-gallery" data-dore-gallery role="region" aria-roledescription="carousel" aria-labelledby="dore-h">
<div class="dore-track" tabindex="0" aria-label="Illustrations: swipe, or use the arrow keys">${ils.map((il, i) => doreFigure(il, i, n, id)).join('')}</div>
<div class="dore-controls"><button type="button" class="dore-btn" data-dore="prev" aria-label="Previous illustration">‹ Prev</button>
<ol class="dore-dots">${ils.map((il, i) => `<li><button type="button" class="dore-dot" aria-label="Show ${i + 1}: ${esc(il.title)}"></button></li>`).join('')}</ol>
<button type="button" class="dore-btn" data-dore="next" aria-label="Next illustration">Next ›</button><span class="dore-status small muted" aria-live="polite"></span></div>
</div>${credit}</section>`;
};
const recordTop = (id, identity) => {
  const dore = doreSection(id);
  if (!dore) return identity;
  return `<div class="record-top"><div class="record-head">${identity}</div>${dore}</div>`;
};
const doreScript = (id) => (doreFor(id).length ? '<script src="/assets/dore.js" defer></script>' : '');

function sourcesSection(rec) {
  const fsl = rec.free_source_links || [];
  const ids = uniqSrc(rec.sources || []).filter((s) => !fsl.some((l) => l.source_id === s.id));
  if (!fsl.length && !ids.length) return '';
  const li = (s, url, locator) => `<li>${ext(url || s?.url, esc(s?.title || 'Source'))}${locator ? ` <span class="muted">— ${esc(locator)}</span>` : ''}${s?.access ? ` <span class="tag">${esc(s.access)}</span>` : ''}</li>`;
  return `<section class="card"><h2>Free sources</h2><ul class="links">
${fsl.map((l) => li(sourceById[l.source_id], l.url, l.locator)).join('')}
${ids.map((s) => li(s, null, null)).join('')}</ul>
<p class="small muted">Copyrighted works (CFAH papers, F. N. Jones) are linked, not reproduced.</p></section>`;
}

function mapThumbs(ids) {
  const list = (ids || []).map((id) => byId[id]).filter(Boolean);
  if (!list.length) return '';
  return `<section class="card"><h2>Maps</h2><ul class="thumbs">${list.map((m) => `<li><a class="thumb" href="${urlOf(m)}">${m.thumbnail ? `<img src="${esc(m.thumbnail)}" alt="Thumbnail of ${esc(m.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<span class="noimg" aria-hidden="true">🗺</span>'}<span>${esc(m.title)}</span></a></li>`).join('')}</ul></section>`;
}

// ---------- layout ----------
function page({ title, desc, body, path, pagefind = true, extraHead = '', scripts = '', type }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} · Ancient History Timeline</title>
<meta name="description" content="${esc(desc || '')}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/styles.css">
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/">Ancient History Timeline</a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" hidden>
      <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 5h14M3 10h14M3 15h14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
      <span class="visually-hidden">Menu</span>
    </button>
    <nav id="primary-nav" aria-label="Primary"><ul>
      <li><a href="/"${path === '/' ? ' aria-current="page"' : ''}>Timeline</a></li>
      <li><a href="/browse/"${path === '/browse/' ? ' aria-current="page"' : ''}>Browse</a></li>
      <li><a href="/chronologies/"${path === '/chronologies/' || path.startsWith('/chronologies/') ? ' aria-current="page"' : ''}>Chronologies</a></li>
      <li><a href="/gallery/"${path === '/gallery/' ? ' aria-current="page"' : ''}>Charts</a></li>
      <li><a href="/about/"${path === '/about/' ? ' aria-current="page"' : ''}>About</a></li>
    </ul></nav>
    <form class="header-search" action="/search/" method="get" role="search">
      <label for="q" class="visually-hidden">Search</label>
      <input id="q" name="q" type="search" placeholder="Search" autocomplete="off">
    </form>
  </div>
</header>
<script src="/assets/nav.js"></script>
<main id="main" class="wrap"${pagefind ? ' data-pagefind-body' : ''}>
${type ? `<span hidden data-pagefind-filter="type">${esc(type)}</span>` : ''}
${body}
</main>
<footer class="site-footer"><div class="wrap small muted">
<p>Young-Earth Creation framework; the Bible is the infallible standard. Sorted by <a href="/chronologies/">CFAH</a> (Griffith &amp; White, <i>Answers Research Journal</i>), then CFAH-1 Table 1, Ussher–Jones, Ussher.</p>
<p>Place data © <a href="https://www.openbible.info/geo/" rel="noopener">OpenBible.info</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>. Map tiles © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors. Historic maps: <a href="https://www.loc.gov/maps/" rel="noopener">Library of Congress</a>. Timeline: <a href="https://visjs.org/" rel="noopener">vis-timeline</a>; family chart: <a href="https://github.com/donatso/family-chart" rel="noopener">family-chart</a>; map: <a href="https://leafletjs.com/" rel="noopener">Leaflet</a>; search: <a href="https://pagefind.app/" rel="noopener">Pagefind</a>. Reference finding: <a href="https://github.com/bibleup/bibleup" rel="noopener">BibleUp</a>.</p>
<p>A written Bible reference opens the Berean Standard Bible from <a href="https://bible.helloao.org/" rel="noopener">bible.helloao.org</a>, with the Amundson Interpretive Version from <a href="https://aivbible.kevinamundson.me" rel="noopener">aivbible.kevinamundson.me</a>. Scripture links still open the Berean Literal Bible on BibleHub.</p>
</div></footer>
${scripts}
<script src="/assets/bibleup.js" defer></script>
</body></html>`;
}

const out = (rel, html) => { const p = join(DIST, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, protectHtml(html)); };
const head = (rec, opts = {}) => `<p class="eyebrow">${esc(TYPE_LABEL[rec.type])}</p><h1>${esc(rec.title)}</h1>${!opts.hideAlt && rec.alt_names?.length ? `<p class="muted">Also: ${esc(rec.alt_names.join(', '))}</p>` : ''}${rec.summary ? `<p class="lede">${esc(rec.summary)}</p>` : ''}`;
const crumbs = (rec) => `<nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Timeline</a></li><li><a href="/browse/#${DIRS[rec.type]}">${esc(TYPE_LABEL[rec.type])}s</a></li><li aria-current="page">${esc(rec.title)}</li></ol></nav>`;
const leafletHead = '<link rel="stylesheet" href="/assets/vendor/leaflet/leaflet.css">';
const leafletScript = '<script src="/assets/vendor/leaflet/leaflet.js" defer></script>';

// ---------- reverse indexes ----------
const eventsAt = (locId) => events.filter((e) => e.locations?.includes(locId)).map((e) => e.id);
const recordsUsingMap = (mapId) => [...events, ...locations].filter((r) => r.maps?.includes(mapId)).map((r) => r.id);
const eventsWith = (pid) => events.filter((e) => e.people?.includes(pid)).map((e) => e.id);

// Location payload for client maps
const locPayload = (l) => ({ id: l.id, title: l.title, lat: l.lat, lng: l.lng, url: urlOf(l), certainty: l.certainty?.level || 'unknown', percent: l.certainty?.percent ?? null, summary: l.summary || '' });
const jsonScript = (id, obj) => `<script type="application/json" id="${id}">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ---------- build ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(here, 'src'), join(DIST, 'assets'), { recursive: true });
mkdirSync(join(DIST, 'assets/vendor/leaflet'), { recursive: true });
cpSync(join(NM, 'leaflet/dist/leaflet.js'), join(DIST, 'assets/vendor/leaflet/leaflet.js'));
cpSync(join(NM, 'leaflet/dist/leaflet.css'), join(DIST, 'assets/vendor/leaflet/leaflet.css'));
cpSync(join(NM, 'leaflet/dist/images'), join(DIST, 'assets/vendor/leaflet/images'), { recursive: true });
cpSync(join(NM, 'leaflet/LICENSE'), join(DIST, 'assets/vendor/leaflet/LICENSE.txt'));
mkdirSync(join(DIST, 'assets/vendor/vis-timeline'), { recursive: true });
cpSync(join(NM, 'vis-timeline/standalone/umd/vis-timeline-graph2d.min.js'), join(DIST, 'assets/vendor/vis-timeline/vis-timeline-graph2d.min.js'));
cpSync(join(NM, 'vis-timeline/styles/vis-timeline-graph2d.min.css'), join(DIST, 'assets/vendor/vis-timeline/vis-timeline-graph2d.min.css'));
cpSync(join(NM, 'vis-timeline/LICENSE.MIT.txt'), join(DIST, 'assets/vendor/vis-timeline/LICENSE.MIT.txt'));
mkdirSync(join(DIST, 'assets/vendor/bibleup'), { recursive: true });
cpSync(join(NM, '@bibleup/bibleup/LICENSE'), join(DIST, 'assets/vendor/bibleup/LICENSE.txt'));
{
  // BibleUp's matcher, then site/src/bibleup.js. One file, one script tag on every page.
  const lib = readFileSync(join(NM, '@bibleup/bibleup/dist/umd/bibleup-core.min.js'), 'utf8').replace(/\n?\/\/# sourceMappingURL=.*\s*$/, '\n');
  const init = readFileSync(join(here, 'src/bibleup.js'), 'utf8');
  writeFileSync(join(DIST, 'assets/bibleup.js'), `${lib}${init}`);
}
mkdirSync(join(DIST, 'assets/vendor/d3'), { recursive: true });
cpSync(join(NM, 'd3/dist/d3.min.js'), join(DIST, 'assets/vendor/d3/d3.min.js'));
cpSync(join(NM, 'd3/LICENSE'), join(DIST, 'assets/vendor/d3/LICENSE.txt'));
mkdirSync(join(DIST, 'assets/vendor/family-chart'), { recursive: true });
cpSync(join(NM, 'family-chart/dist/family-chart.min.js'), join(DIST, 'assets/vendor/family-chart/family-chart.min.js'));
cpSync(join(NM, 'family-chart/dist/styles/family-chart.css'), join(DIST, 'assets/vendor/family-chart/family-chart.css'));
cpSync(join(NM, 'family-chart/LICENSE.txt'), join(DIST, 'assets/vendor/family-chart/LICENSE.txt'));

// Tiered records sort before a standby placement in the same year. A null year stays last.
const sortKey = (a, b) => {
  const ya = placeYear(a);
  const yb = placeYear(b);
  if (ya == null && yb == null) return a.title.localeCompare(b.title);
  if (ya == null) return 1;
  if (yb == null) return -1;
  if (ya !== yb) return ya - yb;
  const sa = a.sorting_year == null && a.standby ? 1 : 0;
  const sb = b.sorting_year == null && b.standby ? 1 : 0;
  if (sa !== sb) return sa - sb;
  return (a.sort_order_within_year ?? 0) - (b.sort_order_within_year ?? 0) || a.title.localeCompare(b.title);
};
const tierCls = (r) => (TIERS[r.sorting_basis?.tier] || TIERS.none).cls;

// Home
{
  const standbyRecords = [...events, ...people].filter((r) => r.sorting_year == null && r.standby);
  const standbySummary = standbyCounts([...events, ...people]);
  const stamp = (rec, item) => {
    const short = raleighRecordShort(dateEntries(rec));
    return short ? { ...item, raleigh: short } : item;
  };
  const items = [
    ...events.filter((e) => e.sorting_year != null).map((e) => stamp(e, { id: e.id, group: 'events', title: e.title, y: e.sorting_year, yEnd: e.chronologies.find((c) => c === sortingEntry(e.chronologies, e.sorting_basis))?.year_bc_ad_end ?? null, label: yearLabel(e.sorting_year), tier: tierCls(e), url: urlOf(e), order: e.sort_order_within_year ?? 0 })),
    ...people.filter((p) => p.sorting_year != null).map((p) => {
      const reignSort = p.sorting_basis?.slot === 'reign_start';
      const end = reignSort ? null : (tierYear(p.dates?.death) || tierYear(p.dates?.translated));
      const yEnd = end && end.y != null && end.y > p.sorting_year ? end.y : null;
      const label = reignSort ? `reign start ${yearLabel(p.sorting_year)}` : (yEnd != null ? `${yearLabel(p.sorting_year)} – ${yearLabel(yEnd)}` : `born ${yearLabel(p.sorting_year)}`);
      return stamp(p, { id: p.id, group: 'people', title: p.title, y: p.sorting_year, yEnd, label, tier: tierCls(p), url: urlOf(p), order: 0 });
    }),
    ...standbyRecords.map((r) => stamp(r, { id: r.id, group: r.type === 'event' ? 'events' : 'people', title: r.title, y: r.standby.year_bc_ad, yEnd: null, label: standbyItemLabel(r), tier: 'standby', standby: true, url: urlOf(r), order: 50 })),
  ];
  const chrono = [...events.filter((e) => e.sorting_year != null), ...standbyRecords].sort(sortKey);
  const undated = [...events, ...people].filter((r) => r.sorting_year == null && !r.standby);
  const chronoLi = (r) => {
    const standby = r.sorting_year == null && !!r.standby;
    const y = placeYear(r);
    const mark = standby
      ? '<span class="tag tag-standby">standby</span>'
      : `<span class="tier tier-${tierCls(r)} small">${esc((TIERS[r.sorting_basis?.tier] || TIERS.none).label.split(' · ')[0])}</span>`;
    return `<li data-placement="${standby ? 'standby' : 'tier'}" data-year="${y ?? ''}"><span class="yr">${esc(yearLabel(y) || 'Undated')}</span><a href="${urlOf(r)}">${esc(r.title)}</a> ${mark}${raleighAside(r)}</li>`;
  };
  const body = `
<section class="hero">
  <h1>Universal Ancient History Timeline</h1>
  <p class="lede">A timeline of the mighty works of God among the nations, beginning at Creation and drawn from the earliest sources available. Records are sorted by the <a href="/chronologies/">Chronological Framework of Ancient History</a> (CFAH), with Scripture as the infallible standard. Other chronologies (Ussher–Jones, Ussher, Jordan, Josephus, Herodotus, Raleigh, Cory, Shuckford, Hales, the Irish annals, and more) are shown side by side for comparison.</p>
</section>
<section class="card" aria-labelledby="tl-h">
  <div class="section-head"><h2 id="tl-h">Timeline</h2>
    <div class="toolbar" role="group" aria-label="Timeline controls">
      <button type="button" data-tl="in" aria-label="Zoom in">+</button>
      <button type="button" data-tl="out" aria-label="Zoom out">−</button>
      <button type="button" data-tl="fit">Show all</button>
    </div></div>
  <p class="small muted">Drag, swipe, or use the scroll bars. Events and People each stay on screen, with a scroll bar of their own. Tier 1 is on. Turn other dating tiers on for more detail. Standby (no tier date) is off: it places a record that has no tier date, and it is not a sort year. Select an item to open it. Axis years are BC.</p>
  <div class="tl-split" id="timeline">
    <div class="tl-block">
      <div id="timeline-events" class="timeline home-timeline" aria-label="Events"></div>
    </div>
    <div class="tl-block">
      <div id="timeline-people" class="timeline home-timeline" aria-label="People"></div>
    </div>
  </div>
  <div class="tier-toggles" role="group" aria-label="Dating tiers">${Object.entries(TIERS).filter(([k]) => k !== 'none').map(([k, t]) => `<button type="button" class="tier-toggle" data-tier-toggle="${t.cls}" aria-pressed="${k === 'cfah-anchor' ? 'true' : 'false'}"><span class="swatch tier-${t.cls}" aria-hidden="true"></span>${esc(t.label)}</button>`).join('')}<button type="button" class="tier-toggle" data-tier-toggle="standby" aria-pressed="false"><span class="swatch standby" aria-hidden="true"></span>Standby (no tier date)</button></div>
  <ul class="legend small" aria-label="Timeline legend"><li><span class="lg-standby" aria-hidden="true"></span>Standby (no tier date): dashed and grey, off until that control is on. Not a sort year.</li></ul>
  <noscript><p>The interactive timeline needs JavaScript. The chronological list below has the same records.</p></noscript>
</section>
<section class="card" aria-labelledby="map-h">
  <h2 id="map-h">Map</h2>
  <p class="small muted">Places with known coordinates from OpenBible.info. Marker colour shows identification certainty.</p>
  <div id="map" class="map" role="region" aria-label="Map of places"></div>
  <ul class="legend small" aria-label="Certainty legend"><li><span class="dot c-very-high" aria-hidden="true"></span>Very high</li><li><span class="dot c-high" aria-hidden="true"></span>High</li><li><span class="dot c-medium" aria-hidden="true"></span>Medium</li><li><span class="dot c-low" aria-hidden="true"></span>Low</li><li><span class="dot c-unknown" aria-hidden="true"></span>Unknown</li></ul>
  ${locations.some((l) => l.lat == null || l.lng == null) ? `<p class="small">Not mapped (location unknown): ${locations.filter((l) => l.lat == null || l.lng == null).map((l) => `${link(l.id)} <span class="muted">(${esc(l.certainty?.level || 'unknown')}${l.certainty?.percent != null ? `, ${l.certainty.percent}%` : ''})</span>`).join(', ')}</p>` : ''}
</section>
<section class="card" aria-labelledby="list-h" id="tl-alt">
  <h2 id="list-h">Records in order</h2>
  <p class="small muted">Tiered records are listed by their sort year. A standby placement is listed by its standby year and marked “standby”; a tiered record in the same year comes first. Standby is not a sort year.</p>
  <ol class="chrono-list">${chrono.map(chronoLi).join('')}</ol>
  ${undated.length ? `<p class="small muted undated-list">Undated (no tier gives a year): ${undated.map((r) => link(r.id)).join(', ')}</p>` : ''}
  ${chrono.some((r) => showsItalicDerived(dateEntries(r))) ? italicsNote() : ''}
</section>
${jsonScript('tl-data', items)}
${jsonScript('standby-summary', { ...standbySummary, line: standbySummaryLine(standbySummary) })}
${jsonScript('map-data', locations.filter((l) => l.lat != null && l.lng != null).map(locPayload))}`;
  out('index.html', page({ title: 'Timeline', desc: 'A Young-Earth Creation timeline of the mighty works of God among the nations, drawn from the earliest sources and sorted by CFAH.', body, path: '/', pagefind: false,
    extraHead: `<link rel="stylesheet" href="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.css">${leafletHead}`,
    scripts: `<script src="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.js" defer></script>${leafletScript}<script src="/assets/app.js" defer></script>` }));
}

// Events
for (const e of events) {
  const body = `${crumbs(e)}<article>${recordTop(e.id, `${head(e)}${sortBadge(e)}`)}
${e.description ? `<section class="card"><h2>Description</h2><p>${esc(e.description)}</p></section>` : ''}
${e.scripture_refs?.length ? `<section class="card"><h2>Scripture</h2>${scriptureList(e.scripture_refs)}</section>` : ''}
<section class="card"><h2>Chronologies</h2>${chronTable(e.chronologies, { sortYear: e.sorting_year, basis: e.sorting_basis, caption: `Dates for ${e.title}, CFAH first` })}</section>
${flagsSection(e, e.chronologies)}
${showsItalicDerived(e.chronologies) ? italicsNote() : ''}
<div class="grid2">${linkList(e.people, 'People')}${linkList(e.locations, 'Places')}</div>
${mapThumbs(e.maps)}
${linkList(e.related, 'Related')}
${chartSection(e.id)}
${sourcesSection(e)}</article>`;
  out(`events/${e.id}/index.html`, page({ title: e.title, desc: e.summary, body, path: urlOf(e), type: 'Event', scripts: doreScript(e.id) }));
}

// Person timeline: window = lifespan (four-tier birth/death), own-life events solid, other events in the window as context.
function personTimeline(p) {
  const d = p.dates || {};
  const birth = tierYear(d.birth);
  const end = tierYear(d.death) || tierYear(d.translated);
  const endKind = tierYear(d.death) ? 'death' : (end ? 'translated' : null);
  const ownIds = new Set([...(p.events || []), ...eventsWith(p.id)]);
  const own = events.filter((e) => ownIds.has(e.id) && e.sorting_year != null);
  const ownUndated = events.filter((e) => ownIds.has(e.id) && e.sorting_year == null);
  const ys = own.map((e) => e.sorting_year);
  const notes = [];
  let start = birth?.y ?? null, stop = end?.y ?? null;
  // Rulers dated only by CFAH reign (or a display-only CFAH death year): use those before falling back to linked events.
  const cfahDated = (list) => (list || []).find((e) => e.source === 'cfah' && e.year_bc_ad != null);
  const cfahReign = cfahDated(d.reign);
  const textDeath = end ? null : cfahDated(d.death);
  if (start == null && cfahReign) { start = cfahReign.year_bc_ad; notes.push(`Birth year unknown: the window starts at the CFAH reign date (${cfahReign.date}).`); }
  if (stop == null && textDeath) { stop = textDeath.year_bc_ad; notes.push(`Death year from CFAH paper text (${textDeath.date}); it is display only, not a sort tier.`); }
  else if (stop == null && cfahReign?.year_bc_ad_end != null) { stop = cfahReign.year_bc_ad_end; notes.push(`Death year unknown: the window ends at the end of the CFAH reign (${cfahReign.date}).`); }
  if (start == null && ys.length) { start = Math.min(...ys); notes.push('Birth year unknown in tiers 1–4 or Generations (provisional): the window starts at the first linked event.'); }
  if (stop == null && ys.length) { stop = Math.max(...ys); notes.push(`Death year unknown in tiers 1–4 or Generations (provisional): the window ends at the last linked event (${own.find((e) => e.sorting_year === stop).title}, ${yearLabel(stop)}).`); }
  // no birth or death year: a reign gives the window
  const reign = start == null && stop == null ? tierYear(d.reign) : null;
  if (reign) { start = reign.y; stop = reign.yEnd ?? reign.y; notes.push(`No birth or death year in tiers 1–4 or the provisional sources: the window shows the reign (${yearLabel(start)}${stop !== start ? `–${yearLabel(stop)}` : ''}${reign.tier === 'provisional' ? ', provisional' : ''}).`); }
  let fromStandby = false;
  if (start == null && stop == null && p.standby?.year_bc_ad != null) {
    start = stop = p.standby.year_bc_ad;
    fromStandby = true;
  }
  if (start == null && stop == null) return { none: true, notes: ['No birth or death year in tiers 1–4 and no dated linked events, so there is no timeline yet.'], ownUndated };
  if (start == null) { start = stop; notes.push('Birth year unknown and no earlier linked event.'); }
  if (stop == null) { stop = start; notes.push(cfahReign && birth == null ? 'Death year and reign end unknown, and no later linked event: the window shows the reign date only.' : 'Death year unknown and no linked events after birth: the window shows the birth year only.'); }
  if (stop < start) [start, stop] = [stop, start];
  // own-life events dated outside the lifespan (e.g. a provisional Generations date on a different chronology) widen the window so they stay visible
  const outside = own.filter((e) => e.sorting_year < start || e.sorting_year > stop);
  if (outside.length) {
    notes.push(`The window is widened to show ${outside.length === 1 ? 'a linked event' : `${outside.length} linked events`} dated outside the lifespan: ${outside.map((e) => `${e.title} (${yearLabel(e.sorting_year)}, ${e.sorting_basis?.tier === 'provisional' ? `provisional ${e.sorting_basis.chronology === 'morecraft' ? 'Morecraft' : 'Generations'} date` : e.sorting_basis?.tier || 'unsorted'})`).join('; ')}. See the event page for the conflicting dates.`);
    start = Math.min(start, ...outside.map((e) => e.sorting_year)); stop = Math.max(stop, ...outside.map((e) => e.sorting_year));
  }
  if (p.standby && !fromStandby && (p.standby.year_bc_ad < start || p.standby.year_bc_ad > stop)) {
    start = Math.min(start, p.standby.year_bc_ad);
    stop = Math.max(stop, p.standby.year_bc_ad);
  }
  const items = [];
  const isBirthEvt = (e) => birth && e.sorting_year === birth.y && /birth/.test(e.id);
  const isEndEvt = (e) => end && e.sorting_year === end.y && (/death|translated/.test(e.id));
  // Same end rule as the home chart: tier death, or translation when death has no year, and only when it is after the tier birth. Not the widened window, a reign, or lifespan_years.
  const life = birth && end && end.y > birth.y ? { y: birth.y, yEnd: end.y, label: `${yearLabel(birth.y)} – ${yearLabel(end.y)}` } : null;
  if (life) items.push({ id: 'lifespan', group: 'own', own: true, span: true, raleighOn: 'person', title: p.title, y: life.y, yEnd: life.yEnd, label: life.label, tier: tierCls(p), url: '#birth', order: -2 });
  if (birth && !life && !own.some(isBirthEvt)) items.push({ id: 'birth', group: 'own', own: true, raleighOn: 'person', title: `Birth of ${p.title}`, y: birth.y, label: yearLabel(birth.y, birth.yEnd), tier: (TIERS[birth.tier] || TIERS.none).cls, url: '#birth', order: -1 });
  if (end && !life && !own.some(isEndEvt)) items.push({ id: endKind, group: 'own', own: true, raleighOn: 'person', title: `${endKind === 'death' ? 'Death' : 'Translation'} of ${p.title}`, y: end.y, label: yearLabel(end.y, end.yEnd), tier: (TIERS[end.tier] || TIERS.none).cls, url: `#${endKind}`, order: 9 });
  if (cfahReign) items.push({ id: 'cfah-reign', group: 'own', own: true, raleighOn: 'person', title: `Reign of ${p.title} (CFAH: ${cfahReign.date})`, y: cfahReign.year_bc_ad, label: yearLabel(cfahReign.year_bc_ad, cfahReign.year_bc_ad_end ?? null), tier: TIERS.none.cls, url: '#reign', order: 0 });
  if (textDeath) items.push({ id: 'cfah-death', group: 'own', own: true, raleighOn: 'person', title: `Death of ${p.title} (CFAH: ${textDeath.date})`, y: textDeath.year_bc_ad, label: yearLabel(textDeath.year_bc_ad), tier: TIERS.none.cls, url: '#death', order: 9 });
  for (const e of own) items.push({ id: e.id, group: 'own', own: true, title: e.title, y: e.sorting_year, label: yearLabel(e.sorting_year), tier: tierCls(e), url: urlOf(e), order: e.sort_order_within_year ?? 0 });
  const ctx = events.filter((e) => !ownIds.has(e.id) && e.sorting_year != null && e.sorting_year >= start && e.sorting_year <= stop);
  for (const e of ctx) items.push({ id: e.id, group: 'context', own: false, title: e.title, y: e.sorting_year, label: yearLabel(e.sorting_year), tier: tierCls(e), url: urlOf(e), order: e.sort_order_within_year ?? 0 });
  if (p.standby) items.push({ id: 'standby', group: 'own', own: true, standby: true, raleighOn: 'person', title: p.title, y: p.standby.year_bc_ad, label: standbyItemLabel(p), tier: 'standby', url: '#standby', order: -1 });
  for (const other of [...events, ...people]) {
    if (other.id === p.id || other.sorting_year != null || !other.standby) continue;
    const y = other.standby.year_bc_ad;
    if (y < start || y > stop) continue;
    items.push({ id: other.id, group: 'context', own: false, standby: true, title: other.title, y, label: standbyItemLabel(other), tier: 'standby', url: urlOf(other), order: 80 });
  }
  items.sort((a, b) => a.y - b.y || (a.standby ? 1 : 0) - (b.standby ? 1 : 0) || a.order - b.order || a.title.localeCompare(b.title));
  for (const it of items) {
    const rec = it.raleighOn === 'person' ? p : byId[it.id];
    const short = raleighRecordShort(dateEntries(rec));
    const html = raleighRecordHtml(dateEntries(rec));
    if (short) it.raleigh = short;
    if (html) it.raleighHtml = html;
    delete it.raleighOn;
  }
  const standbyNote = p.standby
    ? (fromStandby
      ? `No tier date gives a lifespan. The window is a standby placement at ${yearLabel(p.standby.year_bc_ad)} (${standbyPhrase(p)}). It is not a sort year. No reign length or age was added or subtracted.`
      : `Standby placement at ${yearLabel(p.standby.year_bc_ad)} (${standbyPhrase(p)}). It is not a sort year, and it does not change the tier dates. Turn on Standby (no tier date) to show standby records.`)
    : null;
  return {
    start, stop, birth, end: end || (textDeath ? { y: textDeath.year_bc_ad, yEnd: null, tier: 'none' } : null), endKind: endKind || (textDeath ? 'death' : null), life, items, notes, ownUndated, fromStandby, standbyNote, standbyOwn: !!p.standby,
    ownCount: items.filter((i) => i.own && !i.standby).length,
    ctxCount: items.filter((i) => !i.own && !i.standby).length,
    standbyCount: items.filter((i) => i.standby).length,
  };
}
const personTimelines = {};

function personTimelineSection(p) {
  const t = personTimelines[p.id] = personTimeline(p);
  const notes = t.notes.map((n) => `<p class="small muted">${esc(n)}</p>`).join('');
  const undated = t.ownUndated.length ? `<p class="small muted">Linked events with no sort year (not shown): ${t.ownUndated.map((e) => link(e.id)).join(', ')}</p>` : '';
  if (t.none) return `<section class="card" aria-labelledby="ptl-h"><h2 id="ptl-h">Timeline</h2>${notes}${undated}</section>`;
  const win = `${yearLabel(t.start)} – ${yearLabel(t.stop)}`;
  const winLead = t.fromStandby
    ? `Window: <strong>${esc(win)}</strong> (standby placement, not a sort year).`
    : `Window: <strong>${esc(win)}</strong> (birth to ${t.endKind || 'last linked event'}, using the four-tier sort rule).${t.life ? ` The lifespan is one bar, ${esc(t.life.label)}.` : ''}`;
  const li = (i) => {
    const tag = i.standby
      ? '<span class="tag tag-standby">standby</span>'
      : (i.own ? `<span class="tag tag-own">${esc(p.title)}’s life</span>` : '<span class="tag tag-ctx">context</span>');
    const aside = i.raleighHtml ? ` <span class="muted small raleigh-derived" title="${esc(RALEIGH_DERIVED_NOTE)}">${i.raleighHtml}</span>` : '';
    return `<li class="${i.own ? 'own' : 'ctx'}${i.standby ? ' standby' : ''}" data-placement="${i.standby ? 'standby' : 'tier'}" data-year="${i.y}"><span class="yr">${esc(i.label)}</span><a href="${esc(i.url)}">${esc(i.title)}</a> ${tag}${aside}</li>`;
  };
  return `<section class="card" aria-labelledby="ptl-h">
  <div class="section-head"><h2 id="ptl-h">Timeline of ${esc(p.title)}’s lifetime</h2>
    <div class="toolbar" role="group" aria-label="Timeline controls">
      <button type="button" data-tl="in" aria-label="Zoom in">+</button>
      <button type="button" data-tl="out" aria-label="Zoom out">−</button>
      <button type="button" data-tl="fit">Show lifetime</button>
    </div></div>
  <p class="small muted">${winLead} Select or Tab to an item and press Enter to open it.</p>
  ${notes}
  ${t.standbyNote ? `<p class="small muted" id="standby">${esc(t.standbyNote)}</p>` : ''}
  <div id="timeline" class="timeline person-timeline" aria-describedby="ptl-list-h"></div>
  ${t.standbyCount ? `<div class="tier-toggles" role="group" aria-label="Dating tiers"><button type="button" class="tier-toggle" data-tier-toggle="standby" aria-pressed="false"><span class="swatch standby" aria-hidden="true"></span>Standby (no tier date)</button></div>` : ''}
  <ul class="legend small" aria-label="Timeline legend"><li><span class="lg-own" aria-hidden="true"></span>${esc(p.title)}’s life (${t.ownCount}): solid</li><li><span class="lg-ctx" aria-hidden="true"></span>Other events in their lifetime (${t.ctxCount}): faded, dashed, marked “context”</li>${t.standbyCount ? `<li><span class="lg-standby" aria-hidden="true"></span>Standby placement (${t.standbyCount}): dashed and grey, off until Standby (no tier date) is on</li>` : ''}</ul>
  <h3 id="ptl-list-h">Records in order</h3>
  <ol class="chrono-list person-list">${t.items.map(li).join('')}</ol>
  ${undated}
  ${jsonScript('tl-data', { mode: 'person', person: p.title, start: t.start, stop: t.stop, items: t.items })}
</section>`;
}

const SCRIPT_LABEL = { hebrew: 'Hebrew', aramaic: 'Aramaic', greek: 'Greek', latin: 'Latin letters' };
const ROLE_LABEL = { original: 'Original language', rendering: 'Later rendering', alternate: 'Alternate spelling' };
const WITNESS_LABEL = { bible: 'Bible', history: 'History', inscription: 'Inscription' };
const SCRIPT_LANG = { hebrew: 'he', aramaic: 'arc', greek: 'grc', latin: 'en' };
const foldName = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

function nameSection(p) {
  const forms = nameForms[p.id] || [];
  const covered = new Set(forms.map((f) => foldName(f.form)));
  const loose = (p.alt_names || []).filter((a) => a && !covered.has(foldName(a)));
  const notes = [];
  const noteKey = new Map();
  const noteFor = (f) => {
    const key = `${f.citation}\n${f.link}\n${f.source_text_id}\n${f.note || ''}`;
    if (!noteKey.has(key)) {
      noteKey.set(key, notes.length + 1);
      notes.push(f);
    }
    return noteKey.get(key);
  };
  const fn = (n) => `<a class="fn" href="#${p.id}-fn-${n}" id="${p.id}-fnref-${n}"><sup>${n}</sup><span class="visually-hidden"> Footnote</span></a>`;
  const formCell = (f) => `<bdi class="name-form" lang="${SCRIPT_LANG[f.script] || 'en'}" dir="${f.script === 'hebrew' || f.script === 'aramaic' ? 'rtl' : 'ltr'}">${esc(f.form)}</bdi>`;
  // One row per spelling. Form + writing + kind. Pointing stays distinct. Witnesses share the row. Render only; source rows stay.
  const spellingKey = (form, writing, kind) => `${String(form).normalize('NFC')}\u001f${writing}\u001f${kind}`;
  const witnessCell = (items) => {
    const witnesses = [];
    const seen = new Map();
    for (const item of items) {
      const w = item.f.witness;
      if (!seen.has(w)) {
        seen.set(w, witnesses.length);
        witnesses.push({ w, ns: [] });
      }
      const group = witnesses[seen.get(w)];
      if (!group.ns.includes(item.n)) group.ns.push(item.n);
    }
    return witnesses.map((g) => `<span class="name-witness">${esc(WITNESS_LABEL[g.w] || g.w)} ${g.ns.map(fn).join(' ')}</span>`).join('<span class="name-witness-sep" aria-hidden="true"> · </span>');
  };
  const grouped = [];
  const groupAt = new Map();
  for (const f of forms) {
    const key = spellingKey(f.form, f.script, f.role);
    if (!groupAt.has(key)) {
      groupAt.set(key, grouped.length);
      grouped.push({ key, f, items: [] });
    }
    grouped[groupAt.get(key)].items.push({ f, n: noteFor(f) });
  }
  const looseGroups = [];
  const looseAt = new Map();
  for (const a of loose) {
    const key = spellingKey(a, 'latin', 'alternate');
    if (!looseAt.has(key)) {
      looseAt.set(key, looseGroups.length);
      looseGroups.push(a);
    }
  }
  const rows = [
    ...grouped.map((g) => {
      const writing = SCRIPT_LABEL[g.f.script] || g.f.script;
      const kind = ROLE_LABEL[g.f.role] || g.f.role;
      return `<tr data-spelling="${esc(spellingKey(g.f.form, writing, kind))}"><th scope="row">${formCell(g.f)}</th><td>${esc(writing)}</td><td>${esc(kind)}</td><td>${witnessCell(g.items)}</td></tr>`;
    }),
    ...looseGroups.map((a) => `<tr data-spelling="${esc(spellingKey(a, 'Latin letters', 'Alternate spelling'))}"><th scope="row">${esc(a)}</th><td>Latin letters</td><td>Alternate spelling</td><td><span class="muted">Written source not yet attached</span></td></tr>`),
  ];
  const hasOriginal = forms.some((f) => f.role === 'original');
  const hasInscription = forms.some((f) => f.witness === 'inscription');
  const tipnr = forms.some((f) => f.source_text_id === 'stepbible-tipnr');
  const tipnrSrc = sourceById['stepbible-tipnr'];
  const footnotes = notes.map((f, i) => {
    const n = i + 1;
    const src = sourceById[f.source_text_id];
    const open = f.witness === 'bible' ? 'Berean Literal Bible' : 'Open the passage';
    const index = src && src.url !== f.link ? ` ${ext(src.url, esc(src.title))}.` : '';
    return `<li id="${p.id}-fn-${n}" role="listitem"><a class="fn" href="#${p.id}-fnref-${n}"><span class="visually-hidden">Back to footnote </span>${n}</a> ${esc(f.citation)}${f.note ? ` ${esc(f.note)}` : ''} ${ext(f.link, open)}.${index}</li>`;
  }).join('');
  return `<section class="card" id="name" aria-labelledby="name-h">
  <h2 id="name-h">Name</h2>
  <p>The name on this page is <strong>${esc(p.title)}</strong>.</p>
  ${rows.length ? `<div class="table-wrap"><table class="chron names"><caption>Spellings and original-language writings. A number leads to the footnote that names the text.</caption><thead><tr><th scope="col">Form</th><th scope="col">Writing</th><th scope="col">Kind</th><th scope="col">Witness</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>` : ''}
  ${hasOriginal ? '' : '<p class="small muted">No original-language writing of this name has been entered. A form is added only after it has been read in Scripture, a history, or an inscription.</p>'}
  ${hasInscription ? '' : '<p class="small muted">No inscription that writes this name has been entered.</p>'}
  ${notes.length ? `<details class="name-notes-twirl" id="${p.id}-name-notes"><summary>Footnotes</summary><ol class="name-notes" role="list">${footnotes}</ol></details>` : ''}
  ${tipnr && tipnrSrc ? `<p class="small muted">Hebrew, Aramaic and Greek letters are the forms printed in ${ext(tipnrSrc.url, 'STEPBible TIPNR')}, ${ext('https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0')}. The data file is not copied here.</p>` : ''}
</section>`;
}

// Family chart: recorded fathers and named children only. There is no mother, sex or adoption field.
// A child's `father` and a parent's `children` array are joined. Where they disagree, the father field wins.
const fatherOf = {};
const childSet = Object.fromEntries(people.map((p) => [p.id, new Set()]));
for (const p of people) {
  if (p.father && byId[p.father]?.type === 'person') fatherOf[p.id] = p.father;
  for (const c of p.children || []) if (byId[c]?.type === 'person') childSet[p.id].add(c);
}
for (const [child, father] of Object.entries(fatherOf)) childSet[father].add(child);
for (const p of people) for (const c of childSet[p.id]) if (!fatherOf[c]) fatherOf[c] = p.id;
for (const p of people) for (const c of [...childSet[p.id]]) if (fatherOf[c] !== p.id) childSet[p.id].delete(c);
const byBirth = (a, b) => (byId[a].sorting_year ?? Infinity) - (byId[b].sorting_year ?? Infinity) || byId[a].title.localeCompare(byId[b].title);
const ancestorIds = (id, depth) => {
  const out = [];
  let cur = id;
  for (let gen = 1; gen <= depth; gen++) {
    const f = fatherOf[cur];
    if (!f) break;
    out.push({ gen, id: f });
    cur = f;
  }
  return out;
};
const descendantLevels = (id, depth) => {
  const levels = [];
  let frontier = [id];
  const seen = new Set([id]);
  for (let gen = 1; gen <= depth; gen++) {
    const next = [];
    for (const pid of frontier) for (const c of [...childSet[pid]].sort(byBirth)) if (!seen.has(c)) { seen.add(c); next.push(c); }
    levels.push(next);
    frontier = next;
  }
  return levels;
};
const cardYears = (p) => {
  const birth = tierYear(p.dates?.birth);
  const end = tierYear(p.dates?.death) || tierYear(p.dates?.translated);
  if (birth && end) return yearLabel(birth.y, end.y);
  if (birth) return yearLabel(birth.y);
  if (end) return yearLabel(end.y);
  return null;
};
function familyData(id, depth) {
  const ids = new Set([id]);
  for (const a of ancestorIds(id, depth)) ids.add(a.id);
  for (const level of descendantLevels(id, depth)) for (const c of level) ids.add(c);
  const rows = [];
  for (const pid of ids) {
    const p = byId[pid];
    const parents = fatherOf[pid] && ids.has(fatherOf[pid]) ? [fatherOf[pid]] : [];
    const children = [...childSet[pid]].filter((c) => ids.has(c)).sort(byBirth);
    const years = cardYears(p);
    const row = { id: pid, data: { label: p.title, url: urlOf(p), y: p.sorting_year }, rels: { parents, children, spouses: [] } };
    if (childSet[pid].size) row.data.gender = 'M';
    if (years) row.data.years = years;
    rows.push(row);
  }
  for (const row of rows) for (const c of row.rels.children) {
    const child = rows.find((r) => r.id === c);
    if (!child?.rels.parents.includes(row.id)) throw new Error(`Family chart: ${c} is a child of ${row.id} but does not list that father`);
  }
  rows.sort((a, b) => (a.id === id ? -1 : b.id === id ? 1 : a.data.label.localeCompare(b.data.label)));
  return rows;
}
const relNames = (ids) => ids.length ? ids.map(link).join(', ') : '<span class="muted">None recorded</span>';
const ANC_LABELS = ['Father', "Father's father", "Father's father's father"];
const DESC_LABELS = ['Children', 'Grandchildren', 'Great-grandchildren'];
const familyHead = '<link rel="stylesheet" href="/assets/vendor/family-chart/family-chart.css">';
const familyScripts = '<script src="/assets/vendor/d3/d3.min.js" defer></script><script src="/assets/vendor/family-chart/family-chart.min.js" defer></script>';

function familySection(p) {
  const anc = ancestorIds(p.id, 3);
  const desc = descendantLevels(p.id, 3);
  const ancItems = ANC_LABELS.map((label, i) => `<li><span class="rel">${label}</span> ${anc.find((a) => a.gen === i + 1) ? link(anc.find((a) => a.gen === i + 1).id) : '<span class="muted">Not recorded</span>'}</li>`).join('');
  const descBlocks = DESC_LABELS.map((label, i) => `<h3>${label}</h3><p>${relNames(desc[i] || [])}</p>`).join('');
  return `<section class="card" id="family" aria-labelledby="family-h">
  <h2 id="family-h">Family</h2>
  <ul class="family-list" id="family-brief">
    <li><span class="rel">Father</span> ${anc[0] ? link(anc[0].id) : '<span class="muted">Not recorded</span>'}</li>
    <li><span class="rel">Mother</span> <span class="muted">Not recorded</span></li>
    <li><span class="rel">Children</span> ${relNames(desc[0] || [])}</li>
  </ul>
  <details class="family-twirl" id="family-chart-details">
    <summary>Family chart</summary>
    <div class="toolbar" role="group" aria-label="Family chart controls">
      <button type="button" data-family="in" aria-label="Zoom in">+</button>
      <button type="button" data-family="out" aria-label="Zoom out">−</button>
      <button type="button" data-family="fit">Fit</button>
      <label class="family-switch"><input type="checkbox" role="switch" id="family-wide" aria-controls="family-dialog"><span>Expand Family Chart</span></label>
    </div>
  <p id="family-note" class="small muted">The chart shows the parents and children recorded for ${esc(p.title)}. A father is drawn when the data names him. Mothers are not stored, so a dashed card says the other parent is not recorded. Named children are not marked as son, daughter or adopted. A name with a page is a link.</p>
  <div class="family-chart-slot" id="family-chart-slot"><div id="family-chart" class="f3 family-chart" role="group" aria-label="Family chart of ${esc(p.title)}"></div></div>
  <ul class="legend small" aria-label="Family chart legend"><li><span class="lg-father" aria-hidden="true"></span>Recorded as a father, solid bar</li><li><span class="lg-missing" aria-hidden="true"></span>Other parent, not recorded, dashed</li><li><span class="lg-person" aria-hidden="true"></span>Named person, role not recorded</li></ul>
  <noscript><p>The chart needs JavaScript. The names above list the same parents and children.</p></noscript>
  <dialog id="family-dialog" class="family-dialog" aria-labelledby="family-dialog-h">
    <div class="family-dialog-bar"><h2 id="family-dialog-h">Family of ${esc(p.title)}</h2>
      <div class="toolbar" role="group" aria-label="Wider family chart controls">
        <button type="button" data-family="in" aria-label="Zoom in">+</button>
        <button type="button" data-family="out" aria-label="Zoom out">−</button>
        <button type="button" data-family="fit">Fit</button>
        <button type="button" data-family-close>Close</button>
      </div></div>
    <p class="small muted">Three generations of recorded fathers, and three generations of recorded descendants.</p>
    <div class="family-dialog-chart"></div>
    <h3>Recorded ancestors</h3>
    <ul class="family-list">${ancItems}</ul>
    ${descBlocks}
  </dialog>
  </details>
  ${jsonScript('family-data', { id: p.id, near: familyData(p.id, 1), wide: familyData(p.id, 3) })}
</section>`;
}

// People
for (const p of people) {
  const d = p.dates || {};
  const sf = p.scripture_facts;
  const facts = sf ? `<section class="card"><h2>Scripture facts</h2><dl class="facts">
${sf.age_at_named_son != null ? `<div><dt>Age at son's birth</dt><dd>${esc(sf.age_at_named_son)}${sf.named_son ? ` (${link(sf.named_son)})` : ''}</dd></div>` : ''}
${sf.lifespan_years != null ? `<div><dt>Lifespan</dt><dd>${esc(sf.lifespan_years)} years</dd></div>` : ''}
</dl>${scriptureList(sf.refs)}</section>` : '';
  const sortSlot = p.sorting_basis?.slot === 'reign_start' ? 'reign' : 'birth';
  const tables = ['birth', 'death', 'translated', 'reign'].filter((k) => d[k]?.length).map((k) => `<section class="card" id="${k}"><h2>${k[0].toUpperCase() + k.slice(1)}</h2>${chronTable(d[k], { sortYear: k === sortSlot ? p.sorting_year : null, basis: k === sortSlot ? p.sorting_basis : null, caption: `${k} of ${p.title}, CFAH first` })}${flagsSection({ sorting_year: null }, d[k]).replace('id="flags-h"', `id="flags-${k}"`).replace('aria-labelledby="flags-h"', `aria-labelledby="flags-${k}"`).replace('<h2', '<h3').replace('</h2>', '</h3>').replace('class="card flags-card"', 'class="flags-inline"')}</section>`).join('\n');
  const evs = [...new Set([...(p.events || []), ...eventsWith(p.id)])];
  const kls = kingListsOf(p.id);
  const kingCard = p.dynasty || kls.length ? `<section class="card" id="king-lists"><h2>Dynasty and king lists</h2>${p.dynasty ? `<p>Dynasty: ${esc(p.dynasty)}</p>` : ''}${kls.length ? `<p>Listed in: ${kls.map((l) => `<a href="/king-lists/#${esc(l.id)}">${esc(l.title)}</a>`).join('; ')}</p>` : ''}</section>` : '';
  const standbyLine = p.standby && p.sorting_year == null ? `<p class="small muted">Standby placement: <strong>${esc(yearLabel(p.standby.year_bc_ad))}</strong> (${esc(standbyPhrase(p))}). This is not a sort year.</p>` : '';
  const body = `${crumbs(p)}<article>${recordTop(p.id, `${head(p, { hideAlt: true })}${sortBadge(p)}${standbyLine}`)}
${nameSection(p)}
${p.description ? `<section class="card"><h2>Description</h2><p>${esc(p.description)}</p></section>` : ''}${kingCard}
${p.scripture_refs?.length ? `<section class="card"><h2>Scripture</h2>${scriptureList(p.scripture_refs)}</section>` : ''}
${familySection(p)}
${facts}
${personTimelineSection(p)}
${tables}
${(p.open_questions || []).length ? flagsSection({ open_questions: p.open_questions }, null) : ''}
${(showsItalicDerived(Object.values(d).flat()) || (personTimelines[p.id].items || []).some((it) => (it.raleighHtml || '').includes('<em>'))) ? italicsNote() : ''}
${linkList(evs, 'Events')}
${linkList(p.related, 'Related')}
${chartSection(p.id)}
${sourcesSection(p)}</article>`;
  const hasTl = !personTimelines[p.id].none;
  out(`people/${p.id}/index.html`, page({ title: p.title, desc: p.summary, body, path: urlOf(p), type: 'Person',
    extraHead: `${familyHead}${hasTl ? '<link rel="stylesheet" href="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.css">' : ''}`,
    scripts: `${familyScripts}${hasTl ? '<script src="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.js" defer></script>' : ''}<script src="/assets/app.js" defer></script>${doreScript(p.id)}` }));
}

// Locations
for (const l of locations) {
  const has = l.lat != null && l.lng != null;
  const c = l.certainty || {};
  const body = `${crumbs(l)}<article>${head(l)}
<section class="card"><h2>Location</h2>
<dl class="facts">
<div><dt>Type</dt><dd>${esc(l.location_type || '—')}</dd></div>
<div><dt>Coordinates</dt><dd>${has ? `${l.lat.toFixed(4)}, ${l.lng.toFixed(4)}` : '<span class="muted">Unknown (not mapped)</span>'}</dd></div>
<div><dt>Certainty</dt><dd><span class="dot c-${esc(c.level || 'unknown')}" aria-hidden="true"></span>${esc(c.level || 'unknown')}${c.percent != null ? ` (${c.percent}%)` : ''}</dd></div>
</dl>
${c.basis ? `<p class="small">${esc(c.basis)}</p>` : ''}
${l.coordinate_basis ? `<p class="small muted">${esc(l.coordinate_basis)}</p>` : ''}
${has ? `<div id="locmap" class="map map-small" role="region" aria-label="Map showing ${esc(l.title)}"></div>${jsonScript('map-data', [locPayload(l)])}` : ''}
<ul class="links">
${l.openbible_url ? `<li>${ext(l.openbible_url, 'OpenBible.info entry')} <span class="muted small">(CC BY 4.0, OpenBible.info)</span></li>` : ''}
${l.openbible_geojson ? `<li>${ext(l.openbible_geojson, 'OpenBible GeoJSON')}</li>` : ''}
${l.wikidata ? `<li>${ext(`https://www.wikidata.org/wiki/${l.wikidata}`, `Wikidata ${esc(l.wikidata)}`)}</li>` : ''}
</ul></section>
${l.scripture_refs?.length ? `<section class="card"><h2>Scripture</h2>${scriptureList(l.scripture_refs)}</section>` : ''}
${flagsSection(l, null)}
${linkList(eventsAt(l.id), 'Events here')}
${mapThumbs(l.maps)}
${linkList(l.related, 'Related')}
${chartSection(l.id)}
${sourcesSection(l)}</article>`;
  out(`locations/${l.id}/index.html`, page({ title: l.title, desc: l.summary, body, path: urlOf(l), type: 'Place',
    extraHead: has ? leafletHead : '', scripts: has ? `${leafletScript}<script src="/assets/app.js" defer></script>` : '' }));
}

// Maps
for (const m of maps) {
  const body = `${crumbs(m)}<article>${head(m)}
<section class="card">
${m.thumbnail ? `<figure class="mapfig"><a href="${esc(m.image_url || m.url)}" rel="noopener" target="_blank"><img src="${esc(m.thumbnail)}" alt="${esc(m.title)}${m.summary ? ` — ${esc(m.summary)}` : ''}" loading="lazy" referrerpolicy="no-referrer"></a><figcaption class="small muted">${esc(m.license_note || '')}</figcaption></figure>` : `<p class="small muted">${esc(m.license_note || '')}</p>`}
<dl class="facts">${m.date_of_map ? `<div><dt>Date of map</dt><dd>${esc(m.date_of_map)}</dd></div>` : ''}</dl>
<ul class="links">
${m.url ? `<li>${ext(m.url, 'Catalogue / viewer page')}</li>` : ''}
${m.image_url ? `<li>${ext(m.image_url, 'Full image')}</li>` : ''}
${m.iiif_manifest ? `<li>${ext(m.iiif_manifest, 'IIIF manifest')}</li>` : ''}
${m.api_link ? `<li>${ext(m.api_link, m.iiif_manifest ? 'IIIF Image API (info.json)' : 'Data (API / KML)')}</li>` : ''}
</ul>
${m.description ? `<p class="small muted">${esc(m.description)}</p>` : ''}</section>
${flagsSection(m, null)}
${linkList(m.locations, 'Places shown')}
${linkList([...new Set([...(m.related || []), ...recordsUsingMap(m.id)])], 'Used by')}
${sourcesSection(m)}</article>`;
  out(`maps/${m.id}/index.html`, page({ title: m.title, desc: m.summary, body, path: urlOf(m), type: 'Map' }));
}

// Browse
{
  const yearBit = (r) => {
    const bits = [];
    if (r.sorting_year !== undefined) {
      if (r.sorting_year != null) bits.push(`<span class="muted small">${esc(yearLabel(r.sorting_year))}</span>`);
      else if (r.standby) bits.push(`<span class="muted small">${esc(yearLabel(r.standby.year_bc_ad))} <span class="tag tag-standby">standby</span></span>`);
      else bits.push('<span class="muted small">undated</span>');
    }
    const aside = raleighAside(r);
    if (aside) bits.push(aside.trim());
    return bits.length ? ` ${bits.join(' ')}` : '';
  };
  const sec = (key, title, list) => `<section class="card" id="${key}"><h2>${title}</h2><ul class="browse">${[...list].sort(sortKey).map((r) => `<li><a href="${urlOf(r)}">${esc(r.title)}</a>${yearBit(r)}</li>`).join('')}</ul></section>`;
  const browseDerived = [...events, ...people].some((r) => showsItalicDerived(dateEntries(r)));
  const body = `<h1>Browse</h1>${sec('events', 'Events', events)}${sec('people', 'People', people)}${sec('locations', 'Places', locations.map((l) => ({ ...l, sorting_year: undefined })))}${sec('maps', 'Maps', maps.map((m) => ({ ...m, sorting_year: undefined })))}${browseDerived ? italicsNote() : ''}`;
  out('browse/index.html', page({ title: 'Browse', body, path: '/browse/', pagefind: false }));
}

// Chronologies + sources
{
  const rule = chronFile.sorting_rule;
  let cfahPlaced = false;
  const freeSourceItems = sources.map((s) => {
    if (onCfahList(s)) {
      if (cfahPlaced) return '';
      cfahPlaced = true;
      return `<li id="cfah-sources-list">${cfahPlatformListHtml('cfah-platforms-sources')}</li>`;
    }
    if (s.series_parent) return '';
    const linkHtml = s.superseded_for_links_by
      ? `${esc(s.title)} <span class="tag">provenance only; links use ${esc(sourceById[s.superseded_for_links_by]?.title || s.superseded_for_links_by)}</span>`
      : ext(s.url, esc(s.title));
    const who = s.authors?.length ? ` <span class="muted">— ${esc(s.authors.join(', '))}${s.year ? `, ${esc(s.year)}` : ''}</span>` : '';
    const note = s.license_note ? `<div class="small muted">${esc(s.license_note)}</div>` : '';
    return `<li>${linkHtml}${who} <span class="tag">${esc(s.access)}</span>${note}</li>`;
  }).join('');
  const body = `<h1>Chronologies &amp; sorting</h1>
<section class="card"><h2>How the timeline is sorted</h2><p>${esc(rule.description)}</p>
<ol class="tiers">${rule.tiers.map((t) => `<li><span class="tier tier-${['t1', 't2', 't3', 't4'][t.rank - 1]}">${esc(TIERS[t.tier]?.label || t.tier)}</span> <span class="muted small">${esc(t.select)}</span></li>`).join('')}</ol>
<p class="small muted">${esc(rule.fallbacks)}</p>${kingDoc.lists.length ? `<p><a href="/king-lists/">CFAH king lists and dynasty tables</a></p>` : ''}</section>
${[...chronologies].sort((a, b) => a.sort_priority - b.sort_priority).map((c) => `<section class="card" id="${esc(c.id)}"><h2>${esc(c.name)}${c.primary ? ' <span class="tag tag-t1">primary</span>' : ''}</h2>
${c.id === 'raleigh-history-of-the-world' ? '<p><a href="/chronologies/raleigh-chronological-table/">A Chronological Table</a></p>' : ''}
${c.authors?.length ? `<p class="muted">${esc(c.authors.join(', '))}</p>` : ''}<p>${esc(c.description)}</p>
${c.year_conventions ? `<p class="small muted">${esc(c.year_conventions)}</p>` : ''}
${c.id === 'cfah' ? cfahPlatformListHtml('cfah-platforms') : (c.references?.length ? `<ul class="links">${uniqSrc(c.references).map((s) => `<li>${ext(s.url, esc(s.title))} <span class="tag">${esc(s.access)}</span></li>`).join('')}</ul>` : '')}
${c.open_questions?.length ? `<ul class="flag-list">${c.open_questions.map((q) => `<li><span class="flag flag-oq">Open question</span> ${esc(q)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
<section class="card" id="sources"><h2>All free sources</h2><ul class="links">${freeSourceItems}</ul></section>`;
  out('chronologies/index.html', page({ title: 'Chronologies', desc: 'Chronologies used and the CFAH-weighted sorting rule.', body, path: '/chronologies/', type: 'Chronology' }));
}

// Raleigh's 1617 chronological table. Printed years stay the Julian Period and the yeere of the World.
// A parenthetical beside a confirmed World year is display text only.
{
  const table = loadChronologicalTable();
  const base = '/chronologies/raleigh-chronological-table';
  const files = {
    modern: { csv: 'a-chronological-table.csv', md: 'a-chronological-table.md', xls: 'a-chronological-table.xls' },
    original: { csv: 'a-chronological-table-original-spelling.csv', md: 'a-chronological-table-original-spelling.md', xls: 'a-chronological-table-original-spelling.xls' },
  };
  const dir = join(DIST, 'chronologies/raleigh-chronological-table');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, files.modern.csv), `\uFEFF${toCsv(table, 'modern')}`);
  writeFileSync(join(dir, files.original.csv), `\uFEFF${toCsv(table, 'original')}`);
  writeFileSync(join(dir, files.modern.md), toMarkdown(table, 'modern'));
  writeFileSync(join(dir, files.original.md), toMarkdown(table, 'original'));
  writeFileSync(join(dir, files.modern.xls), toXls(table, 'modern'));
  writeFileSync(join(dir, files.original.xls), toXls(table, 'original'));

  const spell = (original, modern) => (original === modern
    ? esc(modern)
    : `<span class="spell-modern">${esc(modern)}</span><span class="spell-original">${esc(original)}</span>`);
  const spellHtml = (originalHtml, modernHtml) => (originalHtml === modernHtml
    ? modernHtml
    : `<span class="spell-modern">${modernHtml}</span><span class="spell-original">${originalHtml}</span>`);
  let tableHasItalic = false;
  const chipLabel = (text) => {
    const t = String(text || '').replace(/^(Iulian|Julian)\.?,?\s*/i, '').replace(/\s+/g, ' ').trim();
    return (t.length > 32 ? `${t.slice(0, 30).trim()}…` : t) || 'Columns';
  };
  const rowHtml = (row, width, yearIdx) => {
    const parts = [row.header
      ? '<th scope="col" title="1617 sheet signature. This column is not in the printed table.">Sig.</th>'
      : `<th scope="row">${esc(row.sig)}</th>`];
    for (let i = 0; i < width; i++) {
      const cell = row.cells[i];
      if (cell?.covered) continue;
      const span = Math.min(cell?.colSpan || 1, Math.max(1, width - i));
      const down = cell?.rowSpan || 1;
      const original = cell?.original || '';
      const modern = cell?.modern || '';
      const long = original.length > 48 || modern.length > 48;
      let flag = null;
      let inner = '';
      if (!row.header && i === yearIdx && (original || modern)) {
        const a0 = annotateWorldYear(original);
        const a1 = annotateWorldYear(modern);
        if (a0.html.includes('<em>') || a1.html.includes('<em>')) tableHasItalic = true;
        inner = spellHtml(a0.html, a1.html);
        flag = a0.badge || a0.flag ? a0 : null;
      } else if (original || modern) inner = spell(original, modern);
      const tag = row.header ? 'th' : 'td';
      const attrs = `${row.header ? ' scope="col"' : ''}${span > 1 ? ` colspan="${span}"` : ''}${down > 1 ? ` rowspan="${down}"` : ''}${long ? ' class="prose"' : ''}`;
      const flagHtml = flag ? `<div class="note raleigh-flag"><span class="flag flag-oq">${esc(flag.badge || 'Not derived')}</span> ${esc(flag.flag || '')}</div>` : '';
      parts.push(`<${tag}${attrs}>${inner}${flagHtml}</${tag}>`);
      i += span - 1;
    }
    return `<tr>${parts.join('')}</tr>`;
  };
  const downloadLinks = (mode) => ['csv', 'md', 'xls'].map((extName) => {
    const label = { csv: 'CSV', md: 'Markdown', xls: 'Excel' }[extName];
    const name = files[mode][extName];
    return `<a download="${name}" href="${base}/${name}">${label}</a>`;
  }).join('');
  const src = sourceById['raleigh-history-of-the-world-1617'];
  const sectionsHtml = table.sections.map((section, i) => {
    const id = `raleigh-s-${i}`;
    const headRow = section.rows[0];
    const bodyRows = section.rows.slice(1);
    const yearIdx = yearColumnIndex(section);
    return `<section class="card" id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h">${spell(section.heading.original, section.heading.modern)}</h2>
<div class="table-wrap raleigh-wrap"><table class="chron raleigh"><caption class="visually-hidden">Sheet ${esc(section.sig)}</caption>
<thead>${rowHtml(headRow, section.width, yearIdx)}</thead>
<tbody>${bodyRows.map((row) => rowHtml(row, section.width, yearIdx)).join('')}</tbody></table></div></section>`;
  }).join('\n');
  const body = `<nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Timeline</a></li><li><a href="/chronologies/">Chronologies</a></li><li aria-current="page">A Chronological Table</li></ol></nav>
<article id="raleigh-table" data-spelling="modern">
<h1>A Chronological Table</h1>
<p class="lede">${spell(table.heading.original, table.heading.modern)}</p>
<section class="card"><p>Sir Walter Raleigh, <i>The History of the World</i> (1617), sheets ${esc(table.signatures[0])}–${esc(table.signatures[1])}. ${src ? ext(src.url, esc(src.title)) : ''}</p>
<p>The years are the Julian Period and the yeere of the World, as printed. Beside each confirmed yeere of the World this page adds the year of the World and an italic year, for example AM 1656 (<em>2377 BC</em>). ${esc(RALEIGH_DERIVED_NOTE)} His first yeere of the World is taken as 4032 BC: a year before Christ is 4033 minus that yeere, and a year of our Lord, once the count passes 4032, is the yeere of the World minus 4032. There is no year 0. Each end of a printed range is converted on its own. A figure that is illegible, a pair of numbers that do not differ by 682, or a yeere that is not one legible figure, stays as printed and is marked not derived. Two legible figures joined by “or” are each derived and marked. Modern spelling updates names and ordinary 1617 spellings. The figures stay as printed, including illegible marks.</p>
<p>The Sig. column is the 1617 sheet. It is not a column of his table. <a href="/chronologies/#raleigh-history-of-the-world">Raleigh, The History of the World (1614/1617)</a></p>
<div class="raleigh-toolbar">
<div role="group" aria-label="Spelling">
<button type="button" data-set-spelling="modern" aria-pressed="true">Modern spelling</button>
<button type="button" data-set-spelling="original" aria-pressed="false">Original spelling</button>
</div>
<p class="raleigh-downloads"><span data-for="modern">${downloadLinks('modern')}</span><span data-for="original">${downloadLinks('original')}</span></p>
</div>
<noscript><p class="small">Original spelling files: ${downloadLinks('original')}</p></noscript>
<nav aria-label="Sections of the table"><ul class="chip-list">${table.sections.map((section, i) => `<li><a href="#raleigh-s-${i}">${esc(section.sig)} ${spell(chipLabel(section.heading.original), chipLabel(section.heading.modern))}</a></li>`).join('')}</ul></nav>
</section>
${sectionsHtml}
${tableHasItalic ? italicsNote() : ''}
</article>`;
  out('chronologies/raleigh-chronological-table/index.html', page({
    title: 'A Chronological Table',
    desc: "Raleigh's 1617 chronological table: years of the Julian Period and the yeere of the World.",
    body,
    path: '/chronologies/raleigh-chronological-table/',
    type: 'Chronology',
    scripts: `<script>
document.getElementById('raleigh-table')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-set-spelling]');
  if (!button) return;
  const root = document.getElementById('raleigh-table');
  const mode = button.getAttribute('data-set-spelling');
  if (mode !== 'modern' && mode !== 'original') return;
  root.dataset.spelling = mode;
  for (const el of root.querySelectorAll('[data-set-spelling]')) el.setAttribute('aria-pressed', el === button ? 'true' : 'false');
});
</script>`,
  }));
  const nRows = table.sections.reduce((n, s) => n + s.rows.length, 0);
  console.log(`Raleigh chronological table: ${table.sections.length} sections, ${nRows} rows (${table.dataRows} under the headings), ${table.signatures[0]}–${table.signatures[1]}`);
}

// Gallery
{
  const groups = [...new Set(charts.map((c) => c.paper))];
  const nThumb = charts.filter((c) => c.thumbnail).length;
  const body = `<h1>CFAH charts and figures</h1>
<section class="card"><p>${charts.length} figures from the <i>Chronological Framework of Ancient History</i> papers by Griffith &amp; White. ${nThumb} are published in <i>Answers Research Journal</i> and shown as lazy-loaded thumbnails served by ARJ. The other ${charts.length - nThumb} are files in the CFAH OSF project. OSF serves them only as downloads, so they appear as text cards. No image is copied to this site; every card links to the original image and to its paper. The figures remain © their authors and publishers.</p>
<p>Bible illustrations: <a href="/illustrations/dore/">Gustave Doré, 1866</a> (${doreDoc.illustrations.length} plates, linked on the records they depict).</p>
<nav aria-label="Papers"><ul class="chip-list">${groups.map((g) => `<li><a href="#paper-${esc(g.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(g)}</a></li>`).join('')}</ul></nav></section>
${groups.map((g) => `<section aria-labelledby="paper-${esc(g.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}"><h2 id="paper-${esc(g.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(g)} <span class="muted small">(${charts.filter((c) => c.paper === g).length})</span></h2>
<ul class="chart-grid">${charts.filter((c) => c.paper === g).map((c) => chartCard(c, 'h3')).join('')}</ul></section>`).join('\n')}`;
  out('gallery/index.html', page({ title: 'CFAH charts', desc: `Gallery of ${charts.length} CFAH charts and figures, linked to their papers.`, body, path: '/gallery/', type: 'Chart' }));
}

// Gustave Doré, 1866: every canonical plate, in file order. Apocrypha (x suffix) are not listed.
{
  const plates = [...doreDoc.illustrations].sort((a, b) => a.number - b.number);
  const item = (il) => {
    const urls = doreUrls(il.file);
    const thumbH = Math.round(THUMB_W * il.original_height / il.original_width);
    const ref = il.scripture_ref ? osis(il.scripture_ref) : null;
    const ids = doreIds(il).filter((r) => byId[r]);
    const fileNo = `${String(il.number).padStart(3, '0')}${il.suffix || ''}`;
    return `<li class="dore-index-item" id="dore-${fileNo}">
<a class="dore-index-thumb" href="${esc(il.details_url)}" rel="noopener" target="_blank"><span class="dore-frame" style="aspect-ratio: ${il.original_width} / ${il.original_height}" aria-busy="true"><span class="dore-loading" role="status"><span class="dore-spinner" aria-hidden="true"></span><span class="visually-hidden">Loading illustration</span></span><img class="dore-img" src="${esc(urls.thumb)}" width="${THUMB_W}" height="${thumbH}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fallback-src="${esc(urls.thumb_v3)}" alt="Gustave Doré, ${esc(il.title)} (wood engraving, 1866)"></span><span class="visually-hidden"> (opens on Archive.org in a new tab)</span></a>
<div class="dore-index-body"><h2><span class="muted">${fileNo}</span> ${esc(il.title)}</h2>
<p class="small">${ref ? `Scene: ${ext(ref.href, esc(ref.text))}` : '<span class="muted">—</span>'}</p>
<p class="small">${ids.length ? `Records: ${ids.map(link).join(', ')}` : '<span class="muted">No matching record</span>'}</p>
</div></li>`;
  };
  const body = `<h1>Gustave Doré, 1866</h1>
<section class="card"><p>${plates.length} Bible illustrations from the Internet Archive item <a href="https://archive.org/details/gustavedore" rel="noopener">gustavedore</a>. The 21 Apocrypha files, whose number has an x after it, are not listed. Titles and numbers are the Archive.org file names, not Doré's 1866 plate numbers. A Scripture link is given only where the title names one passage. It is identified from the title, not printed on the plate. A person is linked only when that plate draws the person. An event is linked when the plate draws that event. Images are served by the Archive.org IIIF Image API and are not copied to this site.</p></section>
<ol class="dore-index">${plates.map(item).join('\n')}</ol>`;
  out('illustrations/dore/index.html', page({
    title: 'Gustave Doré, 1866',
    desc: `${plates.length} Gustave Doré Bible illustrations (1866), with the records they depict.`,
    body,
    path: '/illustrations/dore/',
    scripts: plates.length ? '<script src="/assets/dore.js" defer></script>' : '',
  }));
}

// King lists (CFAH pass, phase 3)
if (kingDoc.lists.length) {
  const rowCell = (e) => [e.person ? link(e.person) : '', e.event ? link(e.event) : ''].filter(Boolean).join(' · ') || `<span class="muted">No record${e.note ? `: ${esc(e.note)}` : ''}</span>`;
  const chips = (ls) => `<ul class="chip-list">${ls.map((l) => `<li><a href="#${esc(l.id)}">${esc(l.title)}</a></li>`).join('')}</ul>`;
  const arjLists = kingDoc.lists.filter((l) => !l.preprint); const osfLists = kingDoc.lists.filter((l) => l.preprint);
  const isLen = (l) => l.entries.some((e) => e.lengths) && !l.entries.some((e) => e.dates);
  const body = `<h1>King lists and dynasty tables (CFAH)</h1>
<section class="card"><p>${esc(kingDoc.note || '')}</p><nav aria-label="King lists"><h2 class="h3">From the published papers (Answers Research Journal)</h2>${chips(arjLists)}${osfLists.length ? `<h2 class="h3">From the OSF preprints (per-king tables)</h2><p class="small muted">These tables come from preprints in the CFAH OSF project that are not peer reviewed in Answers Research Journal. Rows with BC dates printed in the table link to person records, where the dates are shown for display only (they never change the sort order). Rows giving only regnal lengths are listed here without person records; no BC year is computed from a length.</p>${chips(osfLists)}` : ''}</nav></section>
${kingDoc.lists.map((l) => `<section class="card" id="${esc(l.id)}" aria-labelledby="${esc(l.id)}-h"><h2 id="${esc(l.id)}-h">${esc(l.title)}${l.preprint ? ' <span class="tag tag-preprint" title="OSF preprint: not peer-reviewed in Answers Research Journal">OSF preprint</span>' : ''}</h2><p class="small muted">${esc(l.region)} · ${esc(l.citation_short)}${sourceById[l.source] ? ` · ${ext(sourceById[l.source].url, esc(sourceById[l.source].title))}` : ''}</p>
<div class="table-wrap"><table class="chron"><caption class="visually-hidden">${esc(l.title)}</caption><thead><tr><th scope="col">Ruler or dynasty</th><th scope="col">${isLen(l) ? 'Regnal lengths as printed' : 'Dates as printed'}</th><th scope="col">Records</th></tr></thead><tbody>${l.entries.map((e) => `<tr><th scope="row">${esc(e.name)}</th><td>${e.dates ? esc(e.dates) : e.lengths ? esc(e.lengths) : e.details ? `<span class="muted">No BC date.</span> ${esc(e.details)}` : '<span class="muted">No BC date</span>'}${e.ap ? ` <span class="tag tag-ap">${esc(e.ap)}</span>` : ''}</td><td>${rowCell(e)}</td></tr>`).join('')}</tbody></table></div>
${l.unrecorded_reason ? `<p class="small muted">${esc(l.unrecorded_reason)}</p>` : ''}</section>`).join('\n')}
${kingDoc.not_recorded?.length ? `<section class="card"><h2>Lists not stored</h2><ul>${kingDoc.not_recorded.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>` : ''}`;
  out('king-lists/index.html', page({ title: 'King lists', desc: 'CFAH king lists and dynasty tables, linked to rulers and events.', body, path: '/king-lists/', type: 'Chronology' }));
}

// About
out('about/index.html', page({ title: 'About', path: '/about/', pagefind: false, body: `<h1>About this portal</h1>
<section class="card"><p class="bu-ignore">This portal presents ancient history within a Young-Earth Creation framework, with the Bible as the infallible standard (Masoretic Text, no gaps in Genesis 5 and 11). The master timeline is weighted and sorted by the <i>Chronological Framework of Ancient History</i> (CFAH) by Kenneth C. Griffith and Darrell K. White, published in <i>Answers Research Journal</i>. Other chronologies are displayed alongside without changing the sort order.</p>
<p>Every date is entered only from a source that was read, with a citation. Where a chronology has not yet been checked the record says so instead of guessing.</p>
<p>A reference written in the page, such as John 3:16, opens the Berean Standard Bible beside the sentence. Scripture links still open the Berean Literal Bible on BibleHub.</p></section>
<section class="card"><h2>Credits &amp; licences</h2><ul class="links">
<li>Place identifications and coordinates: ${ext('https://www.openbible.info/geo/', 'OpenBible.info')}, licensed ${ext('https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0')}.</li>
<li>Base map tiles: © ${ext('https://www.openstreetmap.org/copyright', 'OpenStreetMap')} contributors (ODbL), served under the OSM tile usage policy.</li>
<li>Historic maps: ${ext('https://www.loc.gov/maps/', 'Library of Congress Geography and Map Division')}; thumbnails are loaded from tile.loc.gov.</li>
<li>CFAH papers (© Answers in Genesis) and Floyd Nolen Jones materials are copyrighted: they are cited and linked, never reproduced.</li>
<li>Software: vis-timeline (Apache-2.0/MIT), ${ext('https://github.com/donatso/family-chart', 'family-chart')} (MIT) with D3 (ISC), Leaflet (BSD-2-Clause), Pagefind (MIT), ${ext('https://github.com/bibleup/bibleup', 'BibleUp')} (MIT).</li>
<li>Scripture links open the Berean Literal Bible on BibleHub (chapter page, at the first verse of the reference).</li>
<li>Reference popovers show the Berean Standard Bible from the ${ext('https://bible.helloao.org/', 'Free Use Bible API')}, under the terms at ${ext('https://berean.bible/', 'berean.bible')}. The Amundson Interpretive Version is requested from ${ext('https://aivbible.kevinamundson.me', 'aivbible.kevinamundson.me')} and is not the standard text.</li>
<li>Hebrew, Aramaic and Greek spellings of biblical names: ${ext('https://github.com/STEPBible/STEPBible-Data', 'STEPBible TIPNR')}, ${ext('https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0')}. The name file itself is not copied here.</li></ul></section>` }));

// Search
out('search/index.html', page({ title: 'Search', path: '/search/', pagefind: false,
  extraHead: '<link rel="stylesheet" href="/pagefind/pagefind-ui.css">',
  body: `<h1>Search</h1><div id="search" class="card"></div><noscript><p>Search needs JavaScript.</p></noscript>`,
  scripts: '<script src="/pagefind/pagefind-ui.js" defer></script><script src="/assets/search.js" defer></script>' }));

// 404 + Cloudflare Pages headers
out('404.html', page({ title: 'Not found', path: '', pagefind: false, body: '<h1>Page not found</h1><p><a href="/">Back to the timeline</a></p>' }));
// Cache-busting: every /assets/... URL in the HTML gets ?v=<content hash>, so a browser can never pair new HTML
// with an old cached app.js/styles.css (Cloudflare served them with a 4-hour browser TTL). Versioned assets are then
// safe to cache for a year; HTML stays max-age=0 (Pages default); Pagefind entry files are revalidated.
{
  const { createHash } = await import('node:crypto');
  const hashes = new Map();
  const ver = (rel) => {
    if (!hashes.has(rel)) { const f = join(DIST, rel); hashes.set(rel, existsSync(f) ? createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 10) : null); }
    return hashes.get(rel);
  };
  const walkHtml = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkHtml(join(d, e.name)) : e.name.endsWith('.html') ? [join(d, e.name)] : []));
  for (const f of walkHtml(DIST)) {
    const html = readFileSync(f, 'utf8');
    const outHtml = html.replace(/(href|src)="\/(assets\/[^"?#]+)"/g, (m, attr, rel) => { const h = ver(rel); return h ? `${attr}="/${rel}?v=${h}"` : m; });
    if (outHtml !== html) writeFileSync(f, outHtml);
  }
}
writeFileSync(join(DIST, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/pagefind/*\n  Cache-Control: public, max-age=0, must-revalidate\n/chronologies/raleigh-chronological-table/*.csv\n  Content-Type: text/csv; charset=utf-8\n/chronologies/raleigh-chronological-table/*.md\n  Content-Type: text/markdown; charset=utf-8\n/chronologies/raleigh-chronological-table/*.xls\n  Content-Type: application/vnd.ms-excel\n`);
const redirectBody = `${redirectLines(events).join('\n')}\n`;
if (!redirectsFileHasSennacherib(redirectBody)) {
  console.error('build: _redirects is missing the Sennacherib 301');
  process.exit(1);
}
writeFileSync(join(DIST, '_redirects'), redirectBody);

mkdirSync(join(DIST, 'data'), { recursive: true });
writeFileSync(join(DIST, 'data', 'person-timelines.json'), JSON.stringify(Object.fromEntries(Object.entries(personTimelines).map(([k, t]) => [k, t.none ? { none: true, notes: t.notes, standby: 0, standbyOwn: false } : { window: [t.start, t.stop], birthTier: t.birth?.tier || null, endTier: t.end?.tier || null, endKind: t.endKind, life: t.life ? { start: t.life.y, end: t.life.yEnd, label: t.life.label } : null, own: t.ownCount, context: t.ctxCount, standby: t.standbyCount, standbyOwn: !!t.standbyOwn, notes: t.notes, ownUndated: t.ownUndated.map((e) => e.id) }])), null, 1));
const n = events.length + people.length + locations.length + maps.length;
console.log(`Built ${n} record pages (${events.length} events, ${people.length} people, ${locations.length} places, ${maps.length} maps) + home, browse, chronologies, Raleigh chronological table, gallery (${charts.length} CFAH charts), about, search, 404 → ${DIST}`);
