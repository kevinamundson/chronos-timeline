#!/usr/bin/env node
// Static site generator for the Universal Ancient History Timeline Portal.
// Reads ../data (single source of truth) and writes site/dist/.
// No framework, no server, no database. Pagefind indexes dist/ afterwards (see package.json "build").
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const byId = {};
for (const r of [...events, ...people, ...locations, ...maps]) byId[r.id] = r;
const chronById = Object.fromEntries(chronologies.map((c) => [c.id, c]));
const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));

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

// OSIS → readable + free KJV link
const BOOKS = { Gen: 'Genesis', Exod: 'Exodus', Lev: 'Leviticus', Num: 'Numbers', Deut: 'Deuteronomy', Josh: 'Joshua', Judg: 'Judges', Ruth: 'Ruth', '1Sam': '1 Samuel', '2Sam': '2 Samuel', '1Kgs': '1 Kings', '2Kgs': '2 Kings', '1Chr': '1 Chronicles', '2Chr': '2 Chronicles', Ezra: 'Ezra', Neh: 'Nehemiah', Esth: 'Esther', Job: 'Job', Ps: 'Psalms', Prov: 'Proverbs', Eccl: 'Ecclesiastes', Song: 'Song of Solomon', Isa: 'Isaiah', Jer: 'Jeremiah', Lam: 'Lamentations', Ezek: 'Ezekiel', Dan: 'Daniel', Hos: 'Hosea', Joel: 'Joel', Amos: 'Amos', Obad: 'Obadiah', Jonah: 'Jonah', Mic: 'Micah', Nah: 'Nahum', Hab: 'Habakkuk', Zeph: 'Zephaniah', Hag: 'Haggai', Zech: 'Zechariah', Mal: 'Malachi', Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John', Acts: 'Acts', Rom: 'Romans', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians', Gal: 'Galatians', Eph: 'Ephesians', Phil: 'Philippians', Col: 'Colossians', '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians', '1Tim': '1 Timothy', '2Tim': '2 Timothy', Titus: 'Titus', Phlm: 'Philemon', Heb: 'Hebrews', Jas: 'James', '1Pet': '1 Peter', '2Pet': '2 Peter', '1John': '1 John', '2John': '2 John', '3John': '3 John', Jude: 'Jude', Rev: 'Revelation' };
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
  const q = text.replace(/–/g, '-');
  return { text, href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(q)}&version=KJV` };
};
const scriptureList = (refs) => !refs?.length ? '' : `<ul class="chips">${refs.map((r) => { const o = osis(r); return `<li>${ext(o.href, esc(o.text))}</li>`; }).join('')}</ul>`;

// Chronology display order (owner spec): CFAH anchor, CFAH-1 Table 1, Ussher-Jones, Ussher, Jordan (secondary, display only), Bible, (MT arithmetic), Josephus, Raleigh, Clonmacnoise.
const ROW_ORDER = ['cfah:anchor_point', 'cfah:table1_baseline', 'cfah:', 'ussher-jones', 'ussher', 'jordan', 'jordan-compilation', 'bible', 'masoretic-genealogy', 'josephus', 'raleigh-history-of-the-world', 'annals-of-clonmacnoise'];
const rowKey = (e) => (e.source === 'cfah' ? `cfah:${e.cfah_basis || ''}` : e.source);
const rowRank = (e) => { const i = ROW_ORDER.indexOf(rowKey(e)); return i < 0 ? 99 : i; };
const chronName = (e) => {
  if (e.source === 'cfah') {
    if (e.cfah_basis === 'anchor_point') return 'CFAH <span class="tag tag-t1">anchor point</span>';
    if (e.cfah_basis === 'table1_baseline') return 'CFAH-1 Table 1 <span class="tag tag-t2">Ussher–Jones baseline</span>';
    return 'CFAH';
  }
  if (e.source === 'jordan') return 'Jordan <span class="tag tag-sec" title="Secondary display chronology; never sets the sort year">secondary</span>';
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
  return null;
};

function chronTable(entries, { sortYear, basis, caption }) {
  const sorted = [...entries].map((e, i) => ({ e, i })).sort((a, b) => rowRank(a.e) - rowRank(b.e) || a.i - b.i).map((x) => x.e);
  const setter = sortingEntry(entries, basis);
  const rows = sorted.map((e) => {
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
<td>${e.citation ? ext(e.link, esc(e.citation)) : '<span class="muted">—</span>'}${e.note ? `<div class="note">${esc(e.note)}</div>` : ''}${flags.length ? `<div class="flags">${flags.join(' ')}</div>` : ''}</td>
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

function sourcesSection(rec) {
  const fsl = rec.free_source_links || [];
  const ids = (rec.sources || []).filter((id) => !fsl.some((l) => l.source_id === id));
  if (!fsl.length && !ids.length) return '';
  const li = (s, url, locator) => `<li>${ext(url || s?.url, esc(s?.title || 'Source'))}${locator ? ` <span class="muted">— ${esc(locator)}</span>` : ''}${s?.access ? ` <span class="tag">${esc(s.access)}</span>` : ''}</li>`;
  return `<section class="card"><h2>Free sources</h2><ul class="links">
${fsl.map((l) => li(sourceById[l.source_id], l.url, l.locator)).join('')}
${ids.map((id) => li(sourceById[id], null, null)).join('')}</ul>
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
${sourcesSection(e)}</article>`;
  out(`events/${e.id}/index.html`, page({ title: e.title, desc: e.summary, body, path: urlOf(e), type: 'Event' }));
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
  const tables = ['birth', 'death', 'translated'].filter((k) => d[k]?.length).map((k) => `<section class="card"><h2>${k[0].toUpperCase() + k.slice(1)}</h2>${chronTable(d[k], { sortYear: k === 'birth' ? p.sorting_year : null, basis: k === 'birth' ? p.sorting_basis : null, caption: `${k} of ${p.title}, CFAH first` })}${flagsSection({ sorting_year: null }, d[k]).replace('id="flags-h"', `id="flags-${k}"`).replace('aria-labelledby="flags-h"', `aria-labelledby="flags-${k}"`).replace('<h2', '<h3').replace('</h2>', '</h3>').replace('class="card flags-card"', 'class="flags-inline"')}</section>`).join('\n');
  const evs = [...new Set([...(p.events || []), ...eventsWith(p.id)])];
  const body = `${crumbs(p)}<article>${head(p)}${sortBadge(p)}
${p.description ? `<section class="card"><h2>Description</h2><p>${esc(p.description)}</p></section>` : ''}
${p.scripture_refs?.length ? `<section class="card"><h2>Scripture</h2>${scriptureList(p.scripture_refs)}</section>` : ''}
<div class="grid2">${fam}${facts}</div>
${tables}
${(p.open_questions || []).length ? flagsSection({ open_questions: p.open_questions }, null) : ''}
${linkList(evs, 'Events')}
${linkList(p.related, 'Related')}
${sourcesSection(p)}</article>`;
  out(`people/${p.id}/index.html`, page({ title: p.title, desc: p.summary, body, path: urlOf(p), type: 'Person' }));
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
${c.references?.length ? `<ul class="links">${c.references.map((id) => sourceById[id]).filter(Boolean).map((s) => `<li>${ext(s.url, esc(s.title))} <span class="tag">${esc(s.access)}</span></li>`).join('')}</ul>` : ''}
${c.open_questions?.length ? `<ul class="flag-list">${c.open_questions.map((q) => `<li><span class="flag flag-oq">Open question</span> ${esc(q)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
<section class="card" id="sources"><h2>All free sources</h2><ul class="links">${sources.map((s) => `<li>${ext(s.url, esc(s.title))}${s.authors?.length ? ` <span class="muted">— ${esc(s.authors.join(', '))}${s.year ? `, ${esc(s.year)}` : ''}</span>` : ''} <span class="tag">${esc(s.access)}</span>${s.license_note ? `<div class="small muted">${esc(s.license_note)}</div>` : ''}</li>`).join('')}</ul></section>`;
  out('chronologies/index.html', page({ title: 'Chronologies', desc: 'Chronologies used and the CFAH-weighted sorting rule.', body, path: '/chronologies/', type: 'Chronology' }));
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
<li>Scripture links open the KJV on BibleGateway.</li></ul></section>` }));

// Search
out('search/index.html', page({ title: 'Search', path: '/search/', pagefind: false,
  extraHead: '<link rel="stylesheet" href="/pagefind/pagefind-ui.css">',
  body: `<h1>Search</h1><div id="search" class="card"></div><noscript><p>Search needs JavaScript.</p></noscript>`,
  scripts: '<script src="/pagefind/pagefind-ui.js" defer></script><script src="/assets/search.js" defer></script>' }));

// 404 + Cloudflare Pages headers
out('404.html', page({ title: 'Not found', path: '', pagefind: false, body: '<h1>Page not found</h1><p><a href="/">Back to the timeline</a></p>' }));
writeFileSync(join(DIST, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n/assets/vendor/*\n  Cache-Control: public, max-age=31536000, immutable\n`);

const n = events.length + people.length + locations.length + maps.length;
console.log(`Built ${n} record pages (${events.length} events, ${people.length} people, ${locations.length} places, ${maps.length} maps) + home, browse, chronologies, about, search, 404 → ${DIST}`);
