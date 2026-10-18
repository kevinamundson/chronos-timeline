#!/usr/bin/env node
// Import Herodotus (The Histories, tr. Rawlinson) as the display-only secondary chronology "herodotus". Idempotent:
//   node scripts/herodotus/import.mjs
// 1. removes every previous herodotus entry, then re-adds the curated rows (scripts/herodotus/rows-*.mjs);
// 2. applies the CFAH anchor points Herodotus is checked against and creates the records in records.mjs
//    (new events sort by a CFAH anchor or are "derived" from one; new people have tier "none");
// 3. herodotus entries never carry a BC year (year_bc_ad null): Herodotus gives durations and synchronisms, not BC dates.
//    Any BC year we derive is stated in the note as DERIVED with its arithmetic and anchor, and in the extract;
// 4. rewrites data/herodotus-dates-extract.md.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SRC_EDITION, SRC_PUBLIC, wsBook, WS_NUMBERED, citation, MARK, PRINTED_OFFSET } from './edition.mjs';
import { cfahAnchors, events as NEW_EVENTS, people as NEW_PEOPLE, locations as NEW_LOCS, eventPeople, eventLocations } from './records.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..'); const DATA = join(root, 'data');
const CFAH_NULL = () => ({ source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown', citation: null, link: null, note: 'pending CFAH reference (no CFAH anchor point or Table 1 entry found for this)' });
const recs = {};
for (const dir of ['events', 'people', 'locations']) for (const f of readdirSync(join(DATA, dir)).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8')); recs[doc.id] = { dir, doc, dirty: false };
}
const touch = (id) => { recs[id].dirty = true; };
const uniq = (a) => [...new Set(a)];
const wsIndex = existsSync(join(here, 'ws-index.json')) ? JSON.parse(readFileSync(join(here, 'ws-index.json'), 'utf8')) : {};
const files = readdirSync(here).filter((f) => /^rows-.*\.mjs$/.test(f)).sort();
const groups = [];
for (const f of files) groups.push({ file: f, rows: (await import(pathToFileURL(join(here, f)).href)).rows });

// ---- 1. remove old herodotus entries everywhere
for (const [id, r] of Object.entries(recs)) {
  const d = r.doc; const lists = d.type === 'event' ? [d.chronologies] : d.type === 'person' ? Object.values(d.dates) : [];
  for (const l of lists) for (let i = l.length - 1; i >= 0; i--) if (l[i].source === 'herodotus') { l.splice(i, 1); touch(id); }
  if (d.type === 'person' && d.dates.reign && !d.dates.reign.some((e) => e.source !== 'cfah' || e.date)) { delete d.dates.reign; touch(id); }
}
// ---- 2. new locations, people, events
for (const [id, l] of Object.entries(NEW_LOCS)) {
  if (recs[id] && !recs[id].doc.summary) continue;
  if (recs[id] && !(recs[id].doc.sources || []).includes('openbible-geo')) continue;
  const [ob, slug] = l.ob;
  recs[id] = { dir: 'locations', dirty: true, doc: { $schema: '../../schema/location.schema.json', id, type: 'location', title: l.title, location_type: 'settlement', summary: l.summary,
    lat: l.lat, lng: l.lng, coordinate_basis: `OpenBible.info first-ranked identification (${l.basis.split(':')[0]}); representative point ${l.lng.toFixed(6)},${l.lat.toFixed(6)} (lon,lat).`,
    certainty: { level: 'very-high', percent: null, basis: `OpenBible.info: "${l.basis}" (page fetched 2026-10-18).` },
    openbible_id: ob, openbible_url: `https://www.openbible.info/geo/ancient/${ob}/${slug}`, openbible_geojson: `https://a.openbible.info/geo/data/${ob}.geojson`, wikidata: l.wikidata,
    scripture_refs: l.refs, sources: ['openbible-geo', 'blb-biblehub', SRC_EDITION, SRC_PUBLIC], free_source_links: [{ source_id: 'openbible-geo', url: `https://www.openbible.info/geo/ancient/${ob}/${slug}` }],
    related: l.related, maps: [] } };
}
for (const [id, p] of Object.entries(NEW_PEOPLE)) {
  const old = recs[id]?.doc;
  if (old && !old.description?.startsWith(MARK)) continue; // a record curated elsewhere: entries only
  // entries the CFAH importer manages (cfah_key) are kept as they are; scripts/cfah/import.mjs owns them
  const keep = (k) => (old?.dates?.[k] || []).filter((e) => e.source !== 'herodotus' && (e.source !== 'cfah' || e.cfah_key));
  const cf = (k) => (old?.dates?.[k] || []).find((e) => e.source === 'cfah' && !e.cfah_key) || ((old?.dates?.[k] || []).some((e) => e.cfah_key) ? null : CFAH_NULL());
  const doc = { $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title, ...(p.alt ? { alt_names: p.alt } : {}), summary: p.summary,
    description: `${MARK} (The Histories, tr. Rawlinson). Herodotus gives reign lengths and synchronisms, not BC years, and no tier 1–4 chronology dates this person, so there is no sort year.`,
    sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year (Herodotus is display-only and gives none).' },
    father: p.father || null, children: p.children || [], dates: { birth: [cf('birth'), ...keep('birth')].filter(Boolean), death: [cf('death'), ...keep('death')].filter(Boolean) },
    events: uniq([...(p.events || []), ...(old?.events || [])]), scripture_refs: p.refs || [], sources: uniq([...(old?.sources || []), SRC_EDITION, SRC_PUBLIC]), related: p.related || [] };
  for (const [k, v] of Object.entries(old?.dates || {})) if (!doc.dates[k] && v.some((e) => (e.source !== 'herodotus' && e.source !== 'cfah') || e.cfah_key)) doc.dates[k] = v.filter((e) => e.source !== 'herodotus' && (e.source !== 'cfah' || e.cfah_key || !v.some((x) => x.cfah_key)));
  recs[id] = { dir: 'people', doc, dirty: true };
}
for (const [id, e] of Object.entries(NEW_EVENTS)) {
  const old = recs[id]?.doc;
  if (old && !old.description?.startsWith(MARK)) continue;
  const doc = { $schema: '../../schema/event.schema.json', id, type: 'event', title: e.title, summary: e.summary,
    description: `${MARK} (The Histories, tr. Rawlinson). ${e.derived_from ? 'The sort year is derived from a CFAH anchor point (see the sort note); Herodotus entries are display only.' : 'Sorted by the CFAH anchor point cited below; Herodotus entries are display only.'}`,
    sorting_year: 1, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' },
    chronologies: [CFAH_NULL(), ...(old?.chronologies || []).filter((c) => c.source !== 'herodotus' && c.source !== 'cfah')],
    people: uniq([...(e.people || []), ...(old?.people || [])]), locations: uniq([...(eventLocations[id] || []), ...(old?.locations || [])]), maps: old?.maps || [], scripture_refs: old?.scripture_refs || [],
    sources: uniq([...(old?.sources || []), SRC_EDITION, SRC_PUBLIC]), related: uniq([...(e.related || []), ...(old?.related || [])]), free_source_links: old?.free_source_links || [] };
  if (e.derived_from) doc._derived = { from: e.derived_from, note: e.derived_note };
  recs[id] = { dir: 'events', doc, dirty: true };
}
// ---- 3. CFAH anchors (replace the null placeholder; never overwrite a different dated CFAH entry)
for (const [id, a] of Object.entries(cfahAnchors)) {
  const r = recs[id]; if (!r) throw new Error(`cfah anchor target ${id} missing`);
  const l = r.doc.chronologies; const i = l.findIndex((e) => e.source === 'cfah');
  if (i >= 0 && l[i].date && l[i].citation !== a.citation) { console.warn(`${id}: keeps its existing CFAH entry (${l[i].date})`); continue; }
  if (i >= 0) l[i] = a; else l.unshift(a);
  if (!r.doc.sources.includes(a.source_text_id)) r.doc.sources.push(a.source_text_id);
  if (!r.doc.free_source_links.some((x) => x.source_id === a.source_text_id)) r.doc.free_source_links.push({ source_id: a.source_text_id, url: a.link, locator: a.citation.match(/section "([^"]+)"/)[1] });
  // Generations-created records now sorted by CFAH: say so (the record stays managed by the Generations importer)
  r.doc.description = r.doc.description?.replace(' Dated only by the Generations books cited below; no tier 1–4 chronology covers this event.', ' Sorted by the CFAH anchor point cited below (added by the Herodotus import); the Generations dates are display only.');
  touch(id);
}
// ---- 4. links
const addPeople = (eid, pids) => { const d = recs[eid]?.doc; if (!d) throw new Error(`event ${eid} missing`); for (const p of pids) { if (!recs[p]) throw new Error(`person ${p} missing`); if (!d.people.includes(p)) { d.people.push(p); touch(eid); } } };
for (const [eid, pids] of Object.entries(eventPeople)) addPeople(eid, pids);
for (const [eid, lids] of Object.entries(eventLocations)) { const d = recs[eid].doc; for (const l of lids) if (!d.locations.includes(l)) { d.locations.push(l); touch(eid); } }
for (const [id, e] of Object.entries(NEW_EVENTS)) for (const p of e.people || []) if (recs[p]?.doc.type !== 'person') throw new Error(`${id}: unknown person ${p}`);
for (const [pid, p] of Object.entries(NEW_PEOPLE)) for (const eid of p.events || []) addPeople(eid, [pid]);

// ---- 5. rows -> entries
const extract = [];
for (const g of groups) for (const row of g.rows) {
  const book = +row.ref.split('.')[0];
  const frag = wsIndex[`${row.ref}|${row.quote}`];
  const link = wsBook(book) + (typeof frag === 'string' ? `#:~:text=${encodeURIComponent(frag).replace(/-/g, '%2D')}` : '');
  const noteParts = [row.note, row.der ? `DERIVED (not Herodotus's figure): ${row.der.replace(/^Derived: /, '')}` : null, row.cmp].filter(Boolean);
  const mapped = [];
  for (const t of row.targets) {
    const [id, slot] = t.split(':'); const r = recs[id]; if (!r) throw new Error(`${row.ref}: unknown target ${t}`);
    const d = r.doc;
    const entry = { source: 'herodotus', date: `“${row.quote}”`, year_am: null, year_bc_ad: null, precision: 'unknown', citation: citation(row.ref, row.page), link, source_text_id: SRC_EDITION, note: noteParts.join(' ') || null };
    let list;
    if (d.type === 'event') list = d.chronologies;
    else if (d.type === 'person') list = (d.dates[slot || 'reign'] ||= [CFAH_NULL()]);
    else throw new Error(`${row.ref}: target ${t} is a ${d.type}`);
    list.push(entry); touch(id);
    if (!d.sources.includes(SRC_EDITION)) d.sources.push(SRC_EDITION);
    if (!d.sources.includes(SRC_PUBLIC)) d.sources.push(SRC_PUBLIC);
    d.free_source_links ||= [];
    const loc = `Book ${book}${WS_NUMBERED.has(book) ? '' : ' (unnumbered chapters on Wikisource)'}`;
    if (!d.free_source_links.some((x) => x.source_id === SRC_PUBLIC && x.url === wsBook(book))) d.free_source_links.push({ source_id: SRC_PUBLIC, url: wsBook(book), locator: loc });
    mapped.push({ id, slot: d.type === 'person' ? (slot || 'reign') : null, isNew: d.description?.startsWith(MARK) });
  }
  extract.push({ ...row, file: g.file, mapped, link });
}
// ---- 6. sort (same rule as scripts/validate.mjs) for every touched record
const TIERS = [['cfah-anchor', 1, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point'], ['cfah-table1', 2, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline'], ['ussher-jones', 3, 'ussher-jones', (e) => e.source === 'ussher-jones'], ['ussher', 4, 'ussher', (e) => e.source === 'ussher']];
const yl = (y) => (y < 0 ? `${-y} BC` : `AD ${y}`);
for (const [id, r] of Object.entries(recs)) {
  if (!r.dirty || r.doc.type === 'location') continue;
  const d = r.doc; const entries = d.type === 'event' ? d.chronologies : (d.dates.birth || []);
  let t = null; for (const [tier, rank, chron, m] of TIERS) { const e = entries.find((x) => m(x) && x.year_bc_ad != null); if (e) { t = { tier, rank, chron, e }; break; } }
  if (t) {
    const ap = t.e.citation?.match(/AP-\d+/)?.[0];
    if (d.sorting_basis?.tier !== t.tier || d.sorting_year !== t.e.year_bc_ad) { d.sorting_year = t.e.year_bc_ad; d.sorting_basis = { tier: t.tier, tier_rank: t.rank, chronology: t.chron, note: t.tier === 'cfah-anchor' ? `Tier 1: CFAH anchor point: ${t.e.date}${ap ? ` (${ap})` : ''}` : `Tier ${t.rank}: ${t.e.date}` }; }
  } else if (d._derived) { /* second pass below */ } else if (d.sorting_basis?.tier === 'provisional' || d.sorting_basis?.tier === 'derived') { /* unchanged: owned by the Generations importer / curated */ }
  else if (d.type === 'person') { d.sorting_year = null; d.sorting_basis ||= { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year.' }; }
  else throw new Error(`${id}: event without a sort year`);
}
for (const r of Object.values(recs)) if (r.doc._derived) { const d = r.doc; const src = recs[d._derived.from].doc; d.sorting_year = src.sorting_year; d.sorting_basis = { tier: 'derived', tier_rank: null, chronology: 'cfah', derived_from: d._derived.from, note: d._derived.note }; delete d._derived; }
// person <-> event links for the people this import owns
for (const [id, r] of Object.entries(recs)) if (r.doc.type === 'person' && r.doc.description?.startsWith(MARK)) {
  const ev = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people.includes(id)).map((x) => x.doc.id);
  const next = uniq([...ev]).sort(); if (JSON.stringify(next) !== JSON.stringify(r.doc.events)) { r.doc.events = next; touch(id); }
}
for (const [id, r] of Object.entries(recs)) if (r.dirty) { delete r.doc._derived; writeFileSync(join(DATA, r.dir, `${id}.json`), JSON.stringify(r.doc, null, 2) + '\n'); }

// ---- 7. extract
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const BOOKS = ['Clio', 'Euterpe', 'Thalia', 'Melpomene', 'Terpsichore', 'Erato', 'Polymnia', 'Urania', 'Calliope'];
let md = `# Herodotus, The Histories (tr. George Rawlinson): dated statements\n\nGenerated by \`scripts/herodotus/import.mjs\` from \`scripts/herodotus/rows-*.mjs\`. Do not edit by hand.\n\n` +
  `- **Edition read:** *The Histories*, Herodotus, translated by George Rawlinson. A Roman Roads Media etext ("Copyright © 2013 by Roman Roads Media, LLC", Moscow, Idaho), 631 PDF pages; printed page = PDF page ${PRINTED_OFFSET}. CFAH-2 and CFAH-6 cite this same edition ("Herodotus. 2013. The Histories. Translated by George Rawlinson. Moscow, Idaho: Roman Roads Media"). It is the site owner's private copy and is not in this repository. Rawlinson's translation (1858–60) is in the public domain; quotations here are Rawlinson's words.\n` +
  `- **Public text:** every entry links to the public-domain Wikisource transcription, [The History of Herodotus (Rawlinson)](https://en.wikisource.org/wiki/The_History_of_Herodotus_(Rawlinson)), one page per Book, with a text-fragment link to the opening words of the quote where they occur literally there (all ${extract.length} quotes were found in the Wikisource text, ignoring punctuation and line-break hyphens; ${extract.filter((r) => r.link.includes('#:~:text=')).length} have a fragment link). Wikisource numbers the chapters in Books 1, 7, 8 and 9 (and part of 2); in Books 3–6 the chapters are unnumbered.\n` +
  `- **Display only:** \`herodotus\` is a secondary display chronology. It never sets a sort year (the validator rejects it), and its entries carry **no BC year**: Herodotus gives reign lengths, intervals and synchronisms, and the archon and Olympic references he makes (e.g. "the archonship of Calliades", 8.51) are not numbered.\n` +
  `- **Derived years:** a BC year appears only in the "Derived" column. It is never Herodotus's own figure, and each one shows its arithmetic and its anchor: a CFAH anchor point (tier 1), or CFAH-3's date for Herodotus's visit to Egypt (450 BC) for his "before my time" figures. Derivations that CFAH itself makes are marked as such.\n` +
  `- **Status column:** agrees / consistent (with the CFAH, Ussher or provisional years); CONFLICT; internal (Herodotus against himself); framework (incompatible with a young-earth chronology at any placement); n/a (no comparison possible).\n\n`;
const st = (r) => r.st || 'n/a';
md += `## Summary\n\n| Book | Statements | Mapped to records | Not mapped | Conflicts (incl. framework) |\n|---|---|---|---|---|\n`;
for (let b = 1; b <= 9; b++) { const rs = extract.filter((r) => +r.ref.split('.')[0] === b); if (!rs.length) continue; md += `| ${b} (${BOOKS[b - 1]}) | ${rs.length} | ${rs.filter((r) => r.mapped.length).length} | ${rs.filter((r) => !r.mapped.length).length} | ${rs.filter((r) => /CONFLICT|framework/.test(st(r))).length} |\n`; }
md += `| **All** | **${extract.length}** | **${extract.filter((r) => r.mapped.length).length}** | **${extract.filter((r) => !r.mapped.length).length}** | **${extract.filter((r) => /CONFLICT|framework/.test(st(r))).length}** |\n\n`;
for (let b = 1; b <= 9; b++) {
  const rs = extract.filter((r) => +r.ref.split('.')[0] === b); if (!rs.length) continue;
  md += `## Book ${b} (${BOOKS[b - 1]})\n\n| Statement (Rawlinson) | Book.ch | p. (PDF) | Record | Derived year and basis | Status | Comparison / note |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rs) md += `| “${esc(r.quote)}” | [${r.ref}](${r.link}) | ${r.page + PRINTED_OFFSET} (${r.page}) | ${r.mapped.length ? r.mapped.map((m) => `\`${m.id}\`${m.slot ? ` (${m.slot})` : ''}${m.isNew ? ' NEW' : ''}`).join(', ') : '— not mapped'} | ${esc(r.der || '')} | ${esc(st(r))} | ${esc([r.cmp, r.note].filter(Boolean).join(' '))} |\n`;
  md += '\n';
}
const created = Object.values(recs).filter((r) => r.doc.description?.startsWith(MARK));
md += `## Records created by this import\n\n${created.map((r) => `- \`${r.doc.id}\` (${r.doc.type}${r.doc.type === 'event' ? `, sort ${yl(r.doc.sorting_year)} ${r.doc.sorting_basis.tier}` : ''})`).join('\n')}\n\nLocations: ${Object.keys(NEW_LOCS).map((x) => `\`${x}\``).join(', ')} (OpenBible.info identifications).\n\n`;
md += `## CFAH anchor points added\n\n${Object.entries(cfahAnchors).map(([id, a]) => `- \`${id}\`: ${a.date}, ${a.citation.match(/section "([^"]+)"/)[1]} (${a.source_text_id.toUpperCase()})`).join('\n')}\n`;
const extra = (await import(pathToFileURL(join(here, 'notes.mjs')).href).catch(() => ({}))).notes;
if (extra) md += `\n${extra}\n`;
writeFileSync(join(DATA, 'herodotus-dates-extract.md'), md);
console.log(`herodotus: ${extract.length} statements (${extract.filter((r) => r.mapped.length).length} mapped, ${extract.filter((r) => !r.mapped.length).length} not mapped), ${extract.reduce((n, r) => n + r.mapped.length, 0)} entries; ${extract.filter((r) => /CONFLICT|framework/.test(st(r))).length} conflicts; ${created.length} records created.`);
