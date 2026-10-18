#!/usr/bin/env node
// Static site generator for the Universal Ancient History Timeline Portal.
// Reads ../data (single source of truth) and writes site/dist/.
// No framework, no server, no database. Pagefind indexes dist/ afterwards (see package.json "build").
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS as BLB_BOOKS, blbFromOsis, blbFromText } from '../scripts/blb.mjs';

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
const ROW_ORDER = ['cfah:anchor_point', 'cfah:table1_baseline', 'cfah:', 'ussher-jones', 'ussher', 'jordan', 'jordan-compilation', 'generations', 'bible', 'masoretic-genealogy', 'josephus', 'raleigh-history-of-the-world', 'annals-of-clonmacnoise'];
const rowKey = (e) => (e.source === 'cfah' ? `cfah:${e.cfah_basis || ''}` : e.source);
const rowRank = (e) => { const i = ROW_ORDER.indexOf(rowKey(e)); return i < 0 ? 99 : i; };
const chronName = (e) => {
  if (e.source === 'cfah') {
    if (e.cfah_basis === 'anchor_point') return 'CFAH <span class="tag tag-t1">anchor point</span>';
    if (e.cfah_basis === 'table1_baseline') return 'CFAH-1 Table 1 <span class="tag tag-t2">Ussher–Jones baseline</span>';
    return 'CFAH';
  }
  if (e.source === 'jordan') return 'Jordan <span class="tag tag-sec" title="Secondary display chronology; never sets the sort year">secondary</span>';
  if (e.source === 'generations') return `Generations <span class="tag tag-sec" title="Generations curriculum (Swanson et al.); secondary display only; supplies a provisional sort only where no tier 1-4 date exists">secondary</span>${e.source_text_id && sourceById[e.source_text_id] ? `<div class="small muted">${esc(sourceById[e.source_text_id].short || sourceById[e.source_text_id].title)}</div>` : ''}`;
  if (e.source === 'jordan-compilation') return 'Jordan (compilation) <span class="tag tag-sec" title="Unnamed compiler\'s charts of Jordan\'s system; secondary display only">secondary</span>';
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
// Which entry set the sort (mirrors scripts/validate.mjs rule)
const sortingEntry = (entries, basis) => {
  if (!basis) return null;
  const has = (e) => e.year_bc_ad != null;
  const t = basis.tier;
  if (t === 'cfah-anchor') return entries.find((e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point' && has(e));
  if (t === 'cfah-table1') return entries.find((e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline' && has(e));
  if (t === 'ussher-jones' || t === 'ussher') return entries.find((e) => e.source === t && has(e));
  if (t === 'provisional') return entries.find((e) => e.source === 'generations' && has(e) && !e.superseded_by);
  return null;
};
// Four-tier rule applied to any date list (birth/death/translated): CFAH AP > CFAH-1 Table 1 > Ussher-Jones > Ussher.
const TIER_PICKS = [
  ['cfah-anchor', (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point'],
  ['cfah-table1', (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline'],
  ['ussher-jones', (e) => e.source === 'ussher-jones'],
  ['ussher', (e) => e.source === 'ussher'],
  // Provisional only (no tier 1-4 date): Generations curriculum, same rule as the record sort.
  ['provisional', (e) => e.source === 'generations' && !e.superseded_by],
];
const tierYear = (entries) => {
  for (const [tier, pick] of TIER_PICKS) {
    const e = (entries || []).find((x) => pick(x) && x.year_bc_ad != null);
    if (e) return { y: e.year_bc_ad, yEnd: e.year_bc_ad_end ?? null, tier };
  }
  return null;
};

function chronTable(entries, { sortYear, basis, caption }) {
  const sorted = [...entries].map((e, i) => ({ e, i })).sort((a, b) => rowRank(a.e) - rowRank(b.e) || a.i - b.i).map((x) => x.e);
  const setter = sortingEntry(entries, basis);
  const rows = sorted.map((e) => {
    // An older edition superseded by a newer one: a collapsed secondary line, with the difference noted; never a sort or diff flag.
    if (e.superseded_by) {
      const nb = sourceById[e.superseded_by];
      return `<tr class="superseded">
<th scope="row">${chronName(e)}</th>
<td colspan="3"><details><summary><span class="tag tag-old">superseded</span> ${esc(e.date)} <span class="small muted">· ${esc(e.edition_note || `superseded by ${nb?.short || e.superseded_by}`)}</span></summary>
<div class="small">${yearLabel(e.year_bc_ad, e.year_bc_ad_end) || ''}${e.precision ? ` · Precision: ${esc(e.precision)}` : ''}</div>
<div>${e.citation ? ext(e.link, esc(e.citation)) : ''}</div>${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}</details></td>
</tr>`;
    }
    const pending = e.date == null;
    const flags = [];
    if (e === setter) flags.push('<span class="flag flag-sort" title="This entry sets the sort year">Sets sort year</span>');
    if (sortYear != null && e.year_bc_ad != null && e.year_bc_ad !== sortYear) {
      const d = e.year_bc_ad - sortYear;
      flags.push(`<span class="flag flag-diff">Differs from sort year by ${Math.abs(d)} yr${Math.abs(d) === 1 ? '' : 's'}</span>`);
    }
    const years = [yearLabel(e.year_bc_ad, e.year_bc_ad_end), amLabel(e.year_am, e.year_am_end)].filter(Boolean).join('<br>');
    return `<tr class="${pending ? 'pending' : ''}${e === setter ? ' is-sort' : ''}">
<th scope="row">${chronName(e)}</th>
<td>${pending ? '<span class="muted">Not yet established</span>' : esc(e.date)}${e.precision && !pending ? `<div class="small muted">Precision: ${esc(e.precision)}</div>` : ''}</td>
<td class="nowrap">${years || '<span class="muted">—</span>'}</td>
<td>${e.citation ? ext(e.link || (['bible', 'masoretic-genealogy'].includes(e.source) ? blbFromText(e.citation) : null), esc(e.citation)) : '<span class="muted">—</span>'}${e.edition_note ? `<div class="note"><span class="tag tag-old">${esc(/not in/.test(e.edition_note) ? 'not in 2nd ed.' : 'edition')}</span> ${esc(e.edition_note)}</div>` : ''}${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}${flags.length ? `<div class="flags">${flags.join(' ')}</div>` : ''}</td>
</tr>`;
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
  const t = TIERS[b.tier] || { cls: 'tn', label: b.tier || 'unknown' };
  const ent = sortingEntry(rec.chronologies || rec.dates?.birth || [], b);
  const yl = yearLabel(rec.sorting_year, ent?.year_bc_ad_end) || 'Undated';
  let extra = '';
  if (b.tier === 'derived' && b.derived_from) extra = ` from ${link(b.derived_from)}`;
  return `<div class="sortbox">
<div class="sortyear"><span class="small muted">Sort year</span><strong>${esc(yl)}</strong></div>
<div><span class="tier tier-${t.cls}">${esc(t.label)}</span>${extra}${b.note ? `<p class="small muted">${esc(b.note)}</p>` : ''}</div></div>`;
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
    <nav aria-label="Primary"><ul>
      <li><a href="/"${path === '/' ? ' aria-current="page"' : ''}>Timeline</a></li>
      <li><a href="/browse/"${path === '/browse/' ? ' aria-current="page"' : ''}>Browse</a></li>
      <li><a href="/chronologies/"${path === '/chronologies/' ? ' aria-current="page"' : ''}>Chronologies</a></li>
      <li><a href="/gallery/"${path === '/gallery/' ? ' aria-current="page"' : ''}>Charts</a></li>
      <li><a href="/about/"${path === '/about/' ? ' aria-current="page"' : ''}>About</a></li>
    </ul></nav>
    <form class="header-search" action="/search/" method="get" role="search">
      <label for="q" class="visually-hidden">Search</label>
      <input id="q" name="q" type="search" placeholder="Search" autocomplete="off">
    </form>
  </div>
</header>
<main id="main" class="wrap"${pagefind ? ' data-pagefind-body' : ''}>
${type ? `<span hidden data-pagefind-filter="type">${esc(type)}</span>` : ''}
${body}
</main>
<footer class="site-footer"><div class="wrap small muted">
<p>Young-Earth Creation framework; the Bible is the infallible standard. Sorted by <a href="/chronologies/">CFAH</a> (Griffith &amp; White, <i>Answers Research Journal</i>), then CFAH-1 Table 1, Ussher–Jones, Ussher.</p>
<p>Place data © <a href="https://www.openbible.info/geo/" rel="noopener">OpenBible.info</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>. Map tiles © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors. Historic maps: <a href="https://www.loc.gov/maps/" rel="noopener">Library of Congress</a>. Timeline: <a href="https://visjs.org/" rel="noopener">vis-timeline</a>; map: <a href="https://leafletjs.com/" rel="noopener">Leaflet</a>; search: <a href="https://pagefind.app/" rel="noopener">Pagefind</a>.</p>
</div></footer>
${scripts}
</body></html>`;
}

const out = (rel, html) => { const p = join(DIST, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); };
const head = (rec) => `<p class="eyebrow">${esc(TYPE_LABEL[rec.type])}</p><h1>${esc(rec.title)}</h1>${rec.alt_names?.length ? `<p class="muted">Also: ${esc(rec.alt_names.join(', '))}</p>` : ''}${rec.summary ? `<p class="lede">${esc(rec.summary)}</p>` : ''}`;
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

const sortKey = (a, b) => (a.sorting_year ?? Infinity) - (b.sorting_year ?? Infinity) || (a.sort_order_within_year ?? 0) - (b.sort_order_within_year ?? 0) || a.title.localeCompare(b.title);
const tierCls = (r) => (TIERS[r.sorting_basis?.tier] || TIERS.none).cls;

// Home
{
  const items = [
    ...events.filter((e) => e.sorting_year != null).map((e) => ({ id: e.id, group: 'events', title: e.title, y: e.sorting_year, yEnd: e.chronologies.find((c) => c === sortingEntry(e.chronologies, e.sorting_basis))?.year_bc_ad_end ?? null, label: yearLabel(e.sorting_year), tier: tierCls(e), url: urlOf(e), order: e.sort_order_within_year ?? 0 })),
    ...people.filter((p) => p.sorting_year != null).map((p) => ({ id: p.id, group: 'people', title: p.title, y: p.sorting_year, label: `born ${yearLabel(p.sorting_year)}`, tier: tierCls(p), url: urlOf(p), order: 0 })),
  ];
  const chrono = [...events].sort(sortKey);
  const undated = [...events, ...people].filter((r) => r.sorting_year == null);
  const body = `
<section class="hero">
  <h1>Universal Ancient History Timeline</h1>
  <p class="lede">From Creation to Solomon's Temple, sorted by the <a href="/chronologies/">Chronological Framework of Ancient History</a> (CFAH), with Ussher–Jones, Ussher, James B. Jordan, Scripture, Josephus, Raleigh and the Annals of Clonmacnoise shown side by side.</p>
</section>
<section class="card" aria-labelledby="tl-h">
  <div class="section-head"><h2 id="tl-h">Timeline</h2>
    <div class="toolbar" role="group" aria-label="Timeline controls">
      <button type="button" data-tl="in" aria-label="Zoom in">+</button>
      <button type="button" data-tl="out" aria-label="Zoom out">−</button>
      <button type="button" data-tl="fit">Show all</button>
    </div></div>
  <p class="small muted">Drag or swipe to scroll, pinch or use the buttons to zoom. Select an item to open it. Axis years are BC.</p>
  <div id="timeline" class="timeline" aria-describedby="tl-alt"></div>
  <ul class="legend small" aria-label="Sort tier legend">${Object.entries(TIERS).filter(([k]) => k !== 'none').map(([, t]) => `<li><span class="swatch tier-${t.cls}" aria-hidden="true"></span>${esc(t.label)}</li>`).join('')}</ul>
  <noscript><p>The interactive timeline needs JavaScript. The chronological list below has the same events.</p></noscript>
</section>
<section class="card" aria-labelledby="map-h">
  <h2 id="map-h">Map</h2>
  <p class="small muted">Places with known coordinates from OpenBible.info. Marker colour shows identification certainty.</p>
  <div id="map" class="map" role="region" aria-label="Map of places"></div>
  <ul class="legend small" aria-label="Certainty legend"><li><span class="dot c-very-high" aria-hidden="true"></span>Very high</li><li><span class="dot c-high" aria-hidden="true"></span>High</li><li><span class="dot c-medium" aria-hidden="true"></span>Medium</li><li><span class="dot c-low" aria-hidden="true"></span>Low</li><li><span class="dot c-unknown" aria-hidden="true"></span>Unknown</li></ul>
  ${locations.some((l) => l.lat == null || l.lng == null) ? `<p class="small">Not mapped (location unknown): ${locations.filter((l) => l.lat == null || l.lng == null).map((l) => `${link(l.id)} <span class="muted">(${esc(l.certainty?.level || 'unknown')}${l.certainty?.percent != null ? `, ${l.certainty.percent}%` : ''})</span>`).join(', ')}</p>` : ''}
</section>
<section class="card" aria-labelledby="list-h" id="tl-alt">
  <h2 id="list-h">Events in order</h2>
  <ol class="chrono-list">${chrono.map((e) => `<li><span class="yr">${esc(yearLabel(e.sorting_year) || 'Undated')}</span><a href="${urlOf(e)}">${esc(e.title)}</a> <span class="tier tier-${tierCls(e)} small">${esc((TIERS[e.sorting_basis?.tier] || TIERS.none).label.split(' · ')[0])}</span></li>`).join('')}</ol>
  ${undated.length ? `<p class="small muted">Undated (no tier gives a year): ${undated.map((r) => link(r.id)).join(', ')}</p>` : ''}
</section>
${jsonScript('tl-data', items)}
${jsonScript('map-data', locations.filter((l) => l.lat != null && l.lng != null).map(locPayload))}`;
  out('index.html', page({ title: 'Timeline', desc: 'Young-Earth Creationist ancient history timeline sorted by CFAH.', body, path: '/', pagefind: false,
    extraHead: `<link rel="stylesheet" href="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.css">${leafletHead}`,
    scripts: `<script src="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.js" defer></script>${leafletScript}<script src="/assets/app.js" defer></script>` }));
}

// Events
for (const e of events) {
  const body = `${crumbs(e)}<article>${head(e)}${sortBadge(e)}
${e.description ? `<section class="card"><h2>Description</h2><p>${esc(e.description)}</p></section>` : ''}
${e.scripture_refs?.length ? `<section class="card"><h2>Scripture</h2>${scriptureList(e.scripture_refs)}</section>` : ''}
<section class="card"><h2>Chronologies</h2>${chronTable(e.chronologies, { sortYear: e.sorting_year, basis: e.sorting_basis, caption: `Dates for ${e.title}, CFAH first` })}</section>
${flagsSection(e, e.chronologies)}
<div class="grid2">${linkList(e.people, 'People')}${linkList(e.locations, 'Places')}</div>
${mapThumbs(e.maps)}
${linkList(e.related, 'Related')}
${chartSection(e.id)}
${sourcesSection(e)}</article>`;
  out(`events/${e.id}/index.html`, page({ title: e.title, desc: e.summary, body, path: urlOf(e), type: 'Event' }));
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
  if (start == null && ys.length) { start = Math.min(...ys); notes.push('Birth year unknown in tiers 1–4 or Generations (provisional): the window starts at the first linked event.'); }
  if (stop == null && ys.length) { stop = Math.max(...ys); notes.push(`Death year unknown in tiers 1–4 or Generations (provisional): the window ends at the last linked event (${own.find((e) => e.sorting_year === stop).title}, ${yearLabel(stop)}).`); }
  if (start == null && stop == null) return { none: true, notes: ['No birth or death year in tiers 1–4 and no dated linked events, so there is no timeline yet.'], ownUndated };
  if (start == null) { start = stop; notes.push('Birth year unknown and no earlier linked event.'); }
  if (stop == null) { stop = start; notes.push('Death year unknown and no linked events after birth: the window shows the birth year only.'); }
  if (stop < start) [start, stop] = [stop, start];
  // own-life events dated outside the lifespan (e.g. a provisional Generations date on a different chronology) widen the window so they stay visible
  const outside = own.filter((e) => e.sorting_year < start || e.sorting_year > stop);
  if (outside.length) {
    notes.push(`The window is widened to show ${outside.length === 1 ? 'a linked event' : `${outside.length} linked events`} dated outside the lifespan: ${outside.map((e) => `${e.title} (${yearLabel(e.sorting_year)}, ${e.sorting_basis?.tier === 'provisional' ? 'provisional Generations date' : e.sorting_basis?.tier || 'unsorted'})`).join('; ')}. See the event page for the conflicting dates.`);
    start = Math.min(start, ...outside.map((e) => e.sorting_year)); stop = Math.max(stop, ...outside.map((e) => e.sorting_year));
  }
  const items = [];
  const isBirthEvt = (e) => birth && e.sorting_year === birth.y && /birth/.test(e.id);
  const isEndEvt = (e) => end && e.sorting_year === end.y && (/death|translated/.test(e.id));
  if (birth && !own.some(isBirthEvt)) items.push({ id: 'birth', group: 'own', own: true, title: `Birth of ${p.title}`, y: birth.y, label: yearLabel(birth.y, birth.yEnd), tier: (TIERS[birth.tier] || TIERS.none).cls, url: '#birth', order: -1 });
  if (end && !own.some(isEndEvt)) items.push({ id: endKind, group: 'own', own: true, title: `${endKind === 'death' ? 'Death' : 'Translation'} of ${p.title}`, y: end.y, label: yearLabel(end.y, end.yEnd), tier: (TIERS[end.tier] || TIERS.none).cls, url: `#${endKind}`, order: 9 });
  for (const e of own) items.push({ id: e.id, group: 'own', own: true, title: e.title, y: e.sorting_year, label: yearLabel(e.sorting_year), tier: tierCls(e), url: urlOf(e), order: e.sort_order_within_year ?? 0 });
  const ctx = events.filter((e) => !ownIds.has(e.id) && e.sorting_year != null && e.sorting_year >= start && e.sorting_year <= stop);
  for (const e of ctx) items.push({ id: e.id, group: 'context', own: false, title: e.title, y: e.sorting_year, label: yearLabel(e.sorting_year), tier: tierCls(e), url: urlOf(e), order: e.sort_order_within_year ?? 0 });
  items.sort((a, b) => a.y - b.y || a.order - b.order || a.title.localeCompare(b.title));
  return { start, stop, birth, end, endKind, items, notes, ownUndated, ownCount: items.filter((i) => i.own).length, ctxCount: ctx.length };
}
const personTimelines = {};

function personTimelineSection(p) {
  const t = personTimelines[p.id] = personTimeline(p);
  const notes = t.notes.map((n) => `<p class="small muted">${esc(n)}</p>`).join('');
  const undated = t.ownUndated.length ? `<p class="small muted">Linked events with no sort year (not shown): ${t.ownUndated.map((e) => link(e.id)).join(', ')}</p>` : '';
  if (t.none) return `<section class="card" aria-labelledby="ptl-h"><h2 id="ptl-h">Timeline</h2>${notes}${undated}</section>`;
  const win = `${yearLabel(t.start)} – ${yearLabel(t.stop)}`;
  const li = (i) => `<li class="${i.own ? 'own' : 'ctx'}"><span class="yr">${esc(i.label)}</span><a href="${esc(i.url)}">${esc(i.title)}</a>${i.own ? ` <span class="tag tag-own">${esc(p.title)}’s life</span>` : ' <span class="tag tag-ctx">context</span>'}</li>`;
  return `<section class="card" aria-labelledby="ptl-h">
  <div class="section-head"><h2 id="ptl-h">Timeline of ${esc(p.title)}’s lifetime</h2>
    <div class="toolbar" role="group" aria-label="Timeline controls">
      <button type="button" data-tl="in" aria-label="Zoom in">+</button>
      <button type="button" data-tl="out" aria-label="Zoom out">−</button>
      <button type="button" data-tl="fit">Show lifetime</button>
    </div></div>
  <p class="small muted">Window: <strong>${esc(win)}</strong> (birth to ${t.endKind || 'last linked event'}, using the four-tier sort rule). Select or Tab to an item and press Enter to open it.</p>
  ${notes}
  <div id="timeline" class="timeline person-timeline" aria-describedby="ptl-list-h"></div>
  <ul class="legend small" aria-label="Timeline legend"><li><span class="lg-own" aria-hidden="true"></span>${esc(p.title)}’s life (${t.ownCount}): solid</li><li><span class="lg-ctx" aria-hidden="true"></span>Other events in their lifetime (${t.ctxCount}): faded, dashed, marked “context”</li></ul>
  <h3 id="ptl-list-h">Events in order</h3>
  <ol class="chrono-list person-list">${t.items.map(li).join('')}</ol>
  ${undated}
  ${jsonScript('tl-data', { mode: 'person', person: p.title, start: t.start, stop: t.stop, items: t.items })}
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
  const fam = `<section class="card"><h2>Family</h2><dl class="facts"><div><dt>Father</dt><dd>${p.father ? link(p.father) : '<span class="muted">Not recorded</span>'}</dd></div>${p.children?.length ? `<div><dt>Children</dt><dd>${p.children.map(link).join(', ')}</dd></div>` : ''}</dl></section>`;
  const tables = ['birth', 'death', 'translated'].filter((k) => d[k]?.length).map((k) => `<section class="card" id="${k}"><h2>${k[0].toUpperCase() + k.slice(1)}</h2>${chronTable(d[k], { sortYear: k === 'birth' ? p.sorting_year : null, basis: k === 'birth' ? p.sorting_basis : null, caption: `${k} of ${p.title}, CFAH first` })}${flagsSection({ sorting_year: null }, d[k]).replace('id="flags-h"', `id="flags-${k}"`).replace('aria-labelledby="flags-h"', `aria-labelledby="flags-${k}"`).replace('<h2', '<h3').replace('</h2>', '</h3>').replace('class="card flags-card"', 'class="flags-inline"')}</section>`).join('\n');
  const evs = [...new Set([...(p.events || []), ...eventsWith(p.id)])];
  const body = `${crumbs(p)}<article>${head(p)}${sortBadge(p)}
${p.description ? `<section class="card"><h2>Description</h2><p>${esc(p.description)}</p></section>` : ''}
${p.scripture_refs?.length ? `<section class="card"><h2>Scripture</h2>${scriptureList(p.scripture_refs)}</section>` : ''}
<div class="grid2">${fam}${facts}</div>
${personTimelineSection(p)}
${tables}
${(p.open_questions || []).length ? flagsSection({ open_questions: p.open_questions }, null) : ''}
${linkList(evs, 'Events')}
${linkList(p.related, 'Related')}
${chartSection(p.id)}
${sourcesSection(p)}</article>`;
  const hasTl = !personTimelines[p.id].none;
  out(`people/${p.id}/index.html`, page({ title: p.title, desc: p.summary, body, path: urlOf(p), type: 'Person',
    extraHead: hasTl ? '<link rel="stylesheet" href="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.css">' : '',
    scripts: hasTl ? '<script src="/assets/vendor/vis-timeline/vis-timeline-graph2d.min.js" defer></script><script src="/assets/app.js" defer></script>' : '' }));
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
  const sec = (key, title, list) => `<section class="card" id="${key}"><h2>${title}</h2><ul class="browse">${[...list].sort(sortKey).map((r) => `<li><a href="${urlOf(r)}">${esc(r.title)}</a>${r.sorting_year !== undefined ? ` <span class="muted small">${esc(yearLabel(r.sorting_year) || 'undated')}</span>` : ''}</li>`).join('')}</ul></section>`;
  const body = `<h1>Browse</h1>${sec('events', 'Events', events)}${sec('people', 'People', people)}${sec('locations', 'Places', locations.map((l) => ({ ...l, sorting_year: undefined })))}${sec('maps', 'Maps', maps.map((m) => ({ ...m, sorting_year: undefined })))}`;
  out('browse/index.html', page({ title: 'Browse', body, path: '/browse/', pagefind: false }));
}

// Chronologies + sources
{
  const rule = chronFile.sorting_rule;
  const body = `<h1>Chronologies &amp; sorting</h1>
<section class="card"><h2>How the timeline is sorted</h2><p>${esc(rule.description)}</p>
<ol class="tiers">${rule.tiers.map((t) => `<li><span class="tier tier-${['t1', 't2', 't3', 't4'][t.rank - 1]}">${esc(TIERS[t.tier]?.label || t.tier)}</span> <span class="muted small">${esc(t.select)}</span></li>`).join('')}</ol>
<p class="small muted">${esc(rule.fallbacks)}</p></section>
${[...chronologies].sort((a, b) => a.sort_priority - b.sort_priority).map((c) => `<section class="card" id="${esc(c.id)}"><h2>${esc(c.name)}${c.primary ? ' <span class="tag tag-t1">primary</span>' : ''}</h2>
${c.authors?.length ? `<p class="muted">${esc(c.authors.join(', '))}</p>` : ''}<p>${esc(c.description)}</p>
${c.year_conventions ? `<p class="small muted">${esc(c.year_conventions)}</p>` : ''}
${c.references?.length ? `<ul class="links">${uniqSrc(c.references).map((s) => `<li>${ext(s.url, esc(s.title))} <span class="tag">${esc(s.access)}</span></li>`).join('')}</ul>` : ''}
${c.open_questions?.length ? `<ul class="flag-list">${c.open_questions.map((q) => `<li><span class="flag flag-oq">Open question</span> ${esc(q)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
<section class="card" id="sources"><h2>All free sources</h2><ul class="links">${sources.map((s) => `<li>${s.superseded_for_links_by ? `${esc(s.title)} <span class="tag">provenance only; links use ${esc(sourceById[s.superseded_for_links_by]?.title || s.superseded_for_links_by)}</span>` : ext(s.url, esc(s.title))}${s.authors?.length ? ` <span class="muted">— ${esc(s.authors.join(', '))}${s.year ? `, ${esc(s.year)}` : ''}</span>` : ''} <span class="tag">${esc(s.access)}</span>${s.license_note ? `<div class="small muted">${esc(s.license_note)}</div>` : ''}</li>`).join('')}</ul></section>`;
  out('chronologies/index.html', page({ title: 'Chronologies', desc: 'Chronologies used and the CFAH-weighted sorting rule.', body, path: '/chronologies/', type: 'Chronology' }));
}

// Gallery
{
  const groups = [...new Set(charts.map((c) => c.paper))];
  const nThumb = charts.filter((c) => c.thumbnail).length;
  const body = `<h1>CFAH charts and figures</h1>
<section class="card"><p>${charts.length} figures from the <i>Chronological Framework of Ancient History</i> papers by Griffith &amp; White. ${nThumb} are published in <i>Answers Research Journal</i> and shown as lazy-loaded thumbnails served by ARJ. The other ${charts.length - nThumb} are files in the CFAH OSF project. OSF serves them only as downloads, so they appear as text cards. No image is copied to this site; every card links to the original image and to its paper. The figures remain © their authors and publishers.</p>
<nav aria-label="Papers"><ul class="chip-list">${groups.map((g) => `<li><a href="#paper-${esc(g.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(g)}</a></li>`).join('')}</ul></nav></section>
${groups.map((g) => `<section aria-labelledby="paper-${esc(g.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}"><h2 id="paper-${esc(g.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(g)} <span class="muted small">(${charts.filter((c) => c.paper === g).length})</span></h2>
<ul class="chart-grid">${charts.filter((c) => c.paper === g).map((c) => chartCard(c, 'h3')).join('')}</ul></section>`).join('\n')}`;
  out('gallery/index.html', page({ title: 'CFAH charts', desc: `Gallery of ${charts.length} CFAH charts and figures, linked to their papers.`, body, path: '/gallery/', type: 'Chart' }));
}

// About
out('about/index.html', page({ title: 'About', path: '/about/', pagefind: false, body: `<h1>About this portal</h1>
<section class="card"><p>This portal presents ancient history within a Young-Earth Creation framework, with the Bible as the infallible standard (Masoretic Text, no gaps in Genesis 5 and 11). The master timeline is weighted and sorted by the <i>Chronological Framework of Ancient History</i> (CFAH) by Kenneth C. Griffith and Darrell K. White, published in <i>Answers Research Journal</i>. Other chronologies are displayed alongside without changing the sort order.</p>
<p>Every date is entered only from a source that was read, with a citation. Where a chronology has not yet been checked the record says so instead of guessing.</p></section>
<section class="card"><h2>Credits &amp; licences</h2><ul class="links">
<li>Place identifications and coordinates: ${ext('https://www.openbible.info/geo/', 'OpenBible.info')}, licensed ${ext('https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0')}.</li>
<li>Base map tiles: © ${ext('https://www.openstreetmap.org/copyright', 'OpenStreetMap')} contributors (ODbL), served under the OSM tile usage policy.</li>
<li>Historic maps: ${ext('https://www.loc.gov/maps/', 'Library of Congress Geography and Map Division')}; thumbnails are loaded from tile.loc.gov.</li>
<li>CFAH papers (© Answers in Genesis) and Floyd Nolen Jones materials are copyrighted: they are cited and linked, never reproduced.</li>
<li>Software: vis-timeline (Apache-2.0/MIT), Leaflet (BSD-2-Clause), Pagefind (MIT).</li>
<li>Scripture links open the Berean Literal Bible on BibleHub (chapter page, at the first verse of the reference).</li></ul></section>` }));

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
writeFileSync(join(DIST, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/pagefind/*\n  Cache-Control: public, max-age=0, must-revalidate\n`);

mkdirSync(join(DIST, 'data'), { recursive: true });
writeFileSync(join(DIST, 'data', 'person-timelines.json'), JSON.stringify(Object.fromEntries(Object.entries(personTimelines).map(([k, t]) => [k, t.none ? { none: true, notes: t.notes } : { window: [t.start, t.stop], birthTier: t.birth?.tier || null, endTier: t.end?.tier || null, endKind: t.endKind, own: t.ownCount, context: t.ctxCount, notes: t.notes, ownUndated: t.ownUndated.map((e) => e.id) }])), null, 1));
const n = events.length + people.length + locations.length + maps.length;
console.log(`Built ${n} record pages (${events.length} events, ${people.length} people, ${locations.length} places, ${maps.length} maps) + home, browse, chronologies, gallery (${charts.length} CFAH charts), about, search, 404 → ${DIST}`);
