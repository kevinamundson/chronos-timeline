#!/usr/bin/env node
// Import Generations-curriculum dates (scripts/generations/<key>.mjs) into data/. Idempotent per book.
//   node scripts/generations/import.mjs africa [europe ...]     (no args = every curated book present)
// Curated files hold only dates as printed, PDF page numbers, and short notes/titles in our own words.
// For each book this script:
//   1. removes that book's previous generations entries, then re-adds them (entries keyed by source_text_id),
//   2. creates or updates the new event and person records the book defines (marked in description),
//   3. sets the sort: records with a tier 1-4 year keep it (Generations is display-only and disagreements are
//      flagged in the entry note). Records with none get tier "provisional" = first dated Generations entry.
//   4. regenerates data/generations-dates-extract.md for all curated books.
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BOOKS } from './books.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const MARK = 'Added from the Generations curriculum import';
// Schema: every chronology list starts with a CFAH entry; for these records it is an explicit null placeholder.
const CFAH_NULL = () => ({ source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown', citation: null, link: null, note: 'pending CFAH reference (the CFAH series does not cover this period; no tier 1–4 date exists)' });
// Always (re)process every curated book present: the import is idempotent and the extract covers them all.
const keys = BOOKS.map((b) => b.key).filter((k) => existsSync(join(here, `${k}.mjs`)));
const bookOrder = BOOKS.map((b) => b.id);

// ---- load records
const recs = {};
for (const dir of ['events', 'people', 'locations']) for (const f of readdirSync(join(DATA, dir)).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8')); recs[doc.id] = { dir, doc, dirty: false };
}
const save = (id) => { recs[id].dirty = true; };
const yl = (y, e) => (y == null ? '—' : (e != null && e !== y ? `${Math.abs(y)}${y < 0 && e < 0 ? '' : y < 0 ? ' BC' : ''}–${Math.abs(e)} ${e < 0 ? 'BC' : 'AD'}`.replace(/^(\d+)–(\d+) AD$/, 'AD $1–$2') : y < 0 ? `${-y} BC` : `AD ${y}`));
const TIER_MATCH = [
  ['cfah-anchor', 1, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point'],
  ['cfah-table1', 2, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline'],
  ['ussher-jones', 3, 'ussher-jones', (e) => e.source === 'ussher-jones'],
  ['ussher', 4, 'ussher', (e) => e.source === 'ussher'],
];
const tierOf = (entries) => { for (const [t, r, c, m] of TIER_MATCH) { const e = entries.find((x) => m(x) && x.year_bc_ad != null); if (e) return { tier: t, rank: r, chron: c, y: e.year_bc_ad }; } return null; };
const genEntries = (doc) => doc.type === 'event' ? doc.chronologies : (doc.dates.birth ||= []);
const sortGen = (list) => list.sort((a, b) => (a.source === 'generations' && b.source === 'generations') ? bookOrder.indexOf(a.source_text_id) - bookOrder.indexOf(b.source_text_id) : 0);

function resort(doc) {
  const entries = doc.type === 'event' ? doc.chronologies : (doc.dates.birth || []);
  if (tierOf(entries)) return; // tiers 1-4 own the sort; never touched here
  const b = doc.sorting_basis;
  if (b?.tier === 'derived') return;
  const g = entries.find((e) => e.source === 'generations' && e.year_bc_ad != null);
  if (g) {
    doc.sorting_year = g.year_bc_ad;
    const bk = BOOKS.find((x) => x.id === g.source_text_id);
    doc.sorting_basis = { tier: 'provisional', tier_rank: null, chronology: 'generations', note: `PROVISIONAL: no CFAH, Ussher–Jones or Ussher date exists, so the sort uses Generations (${bk.short}, PDF p. ${g.citation.match(/PDF p\. (\d+)/)[1]}): ${g.date}. Pending owner decision (open question A8).` };
  } else if (doc.type === 'person') {
    doc.sorting_year = null; doc.sorting_basis = { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year.' };
  } else throw new Error(`${doc.id}: event with no dated entry at all`);
}

const extractRows = {};
for (const key of keys) {
  const book = BOOKS.find((b) => b.key === key); if (!book) throw new Error(`unknown book ${key}`);
  const cur = await import(pathToFileURL(join(here, `${key}.mjs`)).href + `?t=${Date.now()}`);
  const chapterAt = (p) => { let c = null; for (const ch of cur.chapters) if (p >= ch[0]) c = ch; return c; };
  // 1. strip this book's entries
  for (const [id, r] of Object.entries(recs)) {
    const d = r.doc; const lists = d.type === 'event' ? [d.chronologies] : d.type === 'person' ? Object.values(d.dates) : [];
    for (const l of lists) { const n = l.length; for (let i = l.length - 1; i >= 0; i--) if (l[i].source === 'generations' && l[i].source_text_id === book.id) l.splice(i, 1); if (l.length !== n) save(id); }
  }
  // 2. new people / events
  const created = new Set();
  for (const [id, p] of Object.entries(cur.people || {})) {
    if (recs[id] && !recs[id].doc.description?.startsWith(MARK)) continue; // existing curated record: never overwrite
    const old = recs[id]?.doc;
    const doc = { $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title, ...(p.alt ? { alt_names: p.alt } : {}), summary: p.summary,
      description: `${MARK} (${book.short}). Dates are those printed in the cited Generations books; no tier 1–4 chronology covers this person.`,
      sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' }, father: null, children: [], dates: { birth: [CFAH_NULL(), ...(old?.dates.birth?.filter((e) => e.source === 'generations') || [])], death: [CFAH_NULL(), ...(old?.dates.death?.filter((e) => e.source === 'generations') || [])] },
      events: [], scripture_refs: p.refs || [], sources: [...new Set([...(old?.sources || []), book.id])], related: p.related || [] };
    recs[id] = { dir: 'people', doc, dirty: true }; created.add(id);
  }
  for (const [id, e] of Object.entries(cur.events || {})) {
    if (recs[id] && !recs[id].doc.description?.startsWith(MARK)) continue;
    const old = recs[id]?.doc;
    const doc = { $schema: '../../schema/event.schema.json', id, type: 'event', title: e.title, summary: e.summary || e.title,
      description: `${MARK} (${book.short}). Dated only by the Generations books cited below; no tier 1–4 chronology covers this event.`,
      sorting_year: 1, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' }, chronologies: [CFAH_NULL(), ...(old?.chronologies?.filter((c) => c.source === 'generations') || [])],
      people: e.people || [], locations: e.loc || [], maps: [], scripture_refs: e.refs || [], sources: [...new Set([...(old?.sources || []), book.id])], related: e.related || [],
      free_source_links: [{ source_id: book.id, url: book.url, locator: book.short }] };
    if (old) for (const s of old.free_source_links || []) if (!doc.free_source_links.some((x) => x.source_id === s.source_id)) doc.free_source_links.push(s);
    recs[id] = { dir: 'events', doc, dirty: true }; created.add(id);
  }
  // 3. entries
  extractRows[key] = [];
  for (const [page, date, y, yEnd, prec, target, note] of cur.rows) {
    const [id, slot] = target.split(':');
    const r = recs[id]; if (!r) throw new Error(`${key} p.${page}: unknown target ${target}`);
    const ch = chapterAt(page);
    const printed = book.printedOffset != null ? ` (printed p. ${page + book.printedOffset})` : '';
    const entry = { source: 'generations', date, year_am: null, year_bc_ad: y, ...(yEnd != null ? { year_bc_ad_end: yEnd } : {}), precision: prec,
      citation: `${book.short}${ch ? `, ch. ${ch[1]} "${ch[2]}"` : ''}, PDF p. ${page}${printed}`, link: `${book.url}#page=${page}`, source_text_id: book.id, note: note || null };
    const d = r.doc; let list;
    if (d.type === 'event') list = d.chronologies; else if (d.type === 'person') list = (d.dates[slot || 'birth'] ||= []); else throw new Error(`target ${target} is a ${d.type}`);
    // agreement with the sort year (records sorted by tiers 1-4)
    let agree = 'no tier 1–4 date';
    const basisEntries = d.type === 'event' ? d.chronologies : (d.dates.birth || []);
    const t = tierOf(basisEntries);
    if (t && y != null && (d.type === 'event' || (slot || 'birth') === 'birth')) {
      const diff = Math.abs((y < 0 ? y + 1 : y) - (t.y < 0 ? t.y + 1 : t.y));
      const inRange = yEnd != null && ((y <= t.y && t.y <= yEnd) || (y >= t.y && t.y >= yEnd));
      agree = diff === 0 || inRange ? `agrees with sort year ${yl(t.y)} (${t.tier})` : `CONFLICT: ${diff} years from sort year ${yl(t.y)} (${t.tier})`;
      if (!/^agrees/.test(agree)) entry.note = `${entry.note ? entry.note + ' ' : ''}Differs from the sort year (${yl(t.y)}, ${t.tier}) by ${diff} years.`;
    } else if (t && (slot === 'death')) {
      agree = 'death date (sort uses birth)';
    } else if (!t && created.has(id)) agree = 'NEW';
    list.push(entry); sortGen(list); save(id);
    if (d.type === 'event' && (cur.events?.[id]?.people || []).length) for (const pid of cur.events[id].people) if (recs[pid]?.doc.type !== 'person') throw new Error(`${id}: unknown person ${pid}`);
    extractRows[key].push({ page, printed: book.printedOffset != null ? page + book.printedOffset : null, date, event: d.type === 'person' ? `${d.title}: ${slot || 'birth'}` : d.title, id: d.type === 'person' ? `${id} (${slot || 'birth'})` : id, isNew: created.has(id), agree, note });
  }
  // 4. drop records this book created earlier but no longer defines (only if nothing else references them)
  for (const [id, r] of Object.entries(recs)) {
    const d = r.doc; if (!d.description?.startsWith(`${MARK} (${book.short})`) || created.has(id)) continue;
    const left = d.type === 'event' ? d.chronologies.length : Object.values(d.dates).flat().length;
    if (!left) { unlinkSync(join(DATA, r.dir, `${id}.json`)); delete recs[id]; }
  }
}
// link people <-> events, resort, write
for (const [id, r] of Object.entries(recs)) if (r.doc.type === 'person' && r.doc.description?.startsWith(MARK)) {
  r.doc.events = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people.includes(id)).map((x) => x.doc.id).sort(); save(id);
}
for (const [id, r] of Object.entries(recs)) if (r.dirty) { if (r.doc.type !== 'location') resort(r.doc); writeFileSync(join(DATA, r.dir, `${id}.json`), JSON.stringify(r.doc, null, 2) + '\n'); }

// extract markdown (all curated books)
const allKeys = BOOKS.map((b) => b.key).filter((k) => existsSync(join(here, `${k}.mjs`)));
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');
let md = `# Generations curriculum: dates extract\n\nGenerated by \`scripts/generations/import.mjs\` from the curated lists in \`scripts/generations/<book>.mjs\`. Do not edit by hand.\n\n` +
  `- **Copyright:** the five books are © Generations and are **not** in this repository. Only the dates as printed, PDF page numbers and short notes in our own words are kept. Each source link opens the original PDF on Generations' S3 at that page (\`#page=N\`).\n` +
  `- **Sort:** Generations is a secondary display chronology and never one of the four tiers. Records that no tier reaches use the first Generations date as a **provisional** sort (badged on the site); see A8 in \`docs/OPEN-QUESTIONS-FOR-KEVIN.md\`.\n` +
  `- **Agreement column:** "agrees" means the same year as the record's tier 1–4 sort year, or a printed range that contains it. "CONFLICT" gives the gap in years (no year 0). "NEW" means a record created by this import (provisional sort).\n\n`;
for (const k of allKeys) {
  const book = BOOKS.find((b) => b.key === k); const rows = extractRows[k];
  if (!rows) continue;
  md += `## ${book.title}\n\n${book.authors.join(' and ')}${book.editor ? `; ${book.editor}` : ''}. Generations, ${book.year}. [PDF](${book.url}). ${book.note}\n\n${rows.length} dates. ${rows.filter((r) => r.isNew).length} on new records, ${rows.filter((r) => !r.isNew).length} on existing records. ${rows.filter((r) => /^CONFLICT/.test(r.agree)).length} conflicts with a tier 1–4 sort year.\n\n`;
  md += `| Date (as printed) | Event | PDF p. | Record | Agreement with sort date | Note |\n|---|---|---|---|---|---|\n`;
  for (const r of rows) md += `| ${esc(r.date)} | ${esc(r.event)} | ${r.page}${r.printed != null && r.printed !== r.page ? ` (printed ${r.printed})` : ''} | \`${r.id}\`${r.isNew ? ' (NEW)' : ''} | ${esc(r.agree)} | ${esc(r.note)} |\n`;
  const sk = (await import(pathToFileURL(join(here, `${k}.mjs`)).href)).skipped;
  if (sk?.length) md += `\n**Not imported** (with reasons):\n\n${sk.map((s) => `- ${s}`).join('\n')}\n`;
  md += '\n';
}
writeFileSync(join(DATA, 'generations-dates-extract.md'), md);
console.log(Object.entries(extractRows).map(([k, r]) => `${k}: ${r.length} dates, ${r.filter((x) => x.isNew).length} on new records, ${r.filter((x) => /^CONFLICT/.test(x.agree)).length} conflicts`).join('\n'));
