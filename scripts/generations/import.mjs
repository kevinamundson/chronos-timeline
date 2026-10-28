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
import { personTierSort, reignSortBasis } from '../sort-rule.mjs';

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
  const t = tierOf(entries);
  if (t) { // tiers 1-4 own the sort; a record rebuilt here keeps the sort its tier entry gives (e.g. a CFAH anchor added by another import)
    if (doc.sorting_basis?.tier !== t.tier || doc.sorting_year !== t.y) { const e = entries.find((x) => x.year_bc_ad === t.y && x.source === t.chron); const ap = e?.citation?.match(/AP-\d+/)?.[0]; doc.sorting_year = t.y; doc.sorting_basis = { tier: t.tier, tier_rank: t.rank, chronology: t.chron, note: t.tier === 'cfah-anchor' ? `Tier 1: CFAH anchor point: ${e.date}${ap ? ` (${ap})` : ''}` : `Tier ${t.rank}: ${e?.date}` }; }
    return;
  }
  // No tier birth (or, for an event, no tier year). A reign start still outranks a provisional birth.
  if (doc.type === 'person') {
    const reign = personTierSort(doc);
    if (reign?.slot === 'reign_start') {
      const next = reignSortBasis(reign);
      const b = doc.sorting_basis || {};
      if (doc.sorting_year !== reign.year || b.tier !== reign.tier || b.tier_rank !== reign.rank || b.chronology !== reign.chronology || b.slot !== 'reign_start') {
        doc.sorting_year = reign.year;
        doc.sorting_basis = next;
      }
      return;
    }
  }
  const b = doc.sorting_basis;
  if (b?.tier === 'derived') return;
  // superseded entries (an older edition replaced by a newer one) never set the provisional sort
  const g = entries.find((e) => e.source === 'generations' && e.year_bc_ad != null && !e.superseded_by);
  if (g) {
    doc.sorting_year = g.year_bc_ad;
    const bk = BOOKS.find((x) => x.id === g.source_text_id);
    doc.sorting_basis = { tier: 'provisional', tier_rank: null, chronology: 'generations', note: `PROVISIONAL: no CFAH, Ussher–Jones or Ussher date exists, so the sort uses Generations (${bk.short}, PDF p. ${g.citation.match(/PDF p\. (\d+)/)[1]}): ${g.date}. Pending owner decision (open question A8).` };
  } else if (doc.type === 'person') {
    doc.sorting_year = null; doc.sorting_basis = { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year.' };
  } else throw new Error(`${doc.id}: event with no dated entry at all`);
}

// Other imports (e.g. Herodotus) may add entries, a dated CFAH anchor and links to records this import created:
// rebuilding a record keeps them (only this import's own fields are replaced).
const keepCfah = (list) => list?.find((e) => e.source === 'cfah' && e.date) || CFAH_NULL();
const keepOther = (list) => (list || []).filter((e) => e.source !== 'generations' && e.source !== 'cfah');
const merge = (a, b) => [...new Set([...(a || []), ...(b || [])])];
const CFAH_DESC = ' Sorted by the CFAH anchor point cited below (added by the Herodotus import); the Generations dates are display only.';
const extractRows = {};
// Records created in this run, by any book: a later book merges into them instead of replacing them.
const runCreated = new Set();
const addBookLinks = (doc, book) => {
  if (!doc.sources.includes(book.id)) doc.sources.push(book.id);
  // free_source_links are for publicly readable texts only; a private copy (book.private) is cited but not listed there
  if (doc.type === 'event' && !book.private && !doc.free_source_links.some((x) => x.source_id === book.id)) doc.free_source_links.push({ source_id: book.id, url: book.url, locator: book.short });
};
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
    if (runCreated.has(id)) { const d = recs[id].doc; if (p.alt) d.alt_names = [...new Set([...(d.alt_names || []), ...p.alt])]; addBookLinks(d, book); created.add(id); continue; }
    if (recs[id] && !recs[id].doc.description?.startsWith(MARK)) continue; // existing curated record: never overwrite
    const old = recs[id]?.doc;
    const doc = { $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title, ...(p.alt ? { alt_names: p.alt } : {}), summary: p.summary,
      description: `${MARK} (${book.short}). Dates are those printed in the cited Generations books; no tier 1–4 chronology covers this person.`,
      sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' }, father: null, children: [], dates: { birth: [keepCfah(old?.dates.birth), ...(old?.dates.birth?.filter((e) => e.source === 'generations') || []), ...keepOther(old?.dates.birth)], death: [keepCfah(old?.dates.death), ...(old?.dates.death?.filter((e) => e.source === 'generations') || []), ...keepOther(old?.dates.death)] },
      events: old?.events || [], scripture_refs: merge(p.refs, old?.scripture_refs), sources: [...new Set([...(old?.sources || []), book.id])], related: merge(p.related, old?.related) };
    if (old) { for (const [k, v] of Object.entries(old.dates)) if (!doc.dates[k]) doc.dates[k] = v; if (old.father) doc.father = old.father; doc.children = old.children || []; if (old.free_source_links) doc.free_source_links = old.free_source_links; }
    recs[id] = { dir: 'people', doc, dirty: true }; created.add(id);
  }
  for (const [id, e] of Object.entries(cur.events || {})) {
    if (runCreated.has(id)) { const d = recs[id].doc; d.people = [...new Set([...d.people, ...(e.people || [])])]; d.related = [...new Set([...d.related, ...(e.related || [])])]; d.scripture_refs = [...new Set([...d.scripture_refs, ...(e.refs || [])])]; addBookLinks(d, book); created.add(id); continue; }
    if (recs[id] && !recs[id].doc.description?.startsWith(MARK)) continue;
    const old = recs[id]?.doc;
    const doc = { $schema: '../../schema/event.schema.json', id, type: 'event', title: e.title, summary: e.summary || e.title,
      description: `${MARK} (${book.short}).${old?.chronologies?.some((c) => c.source === 'cfah' && c.date) ? CFAH_DESC : ' Dated only by the Generations books cited below; no tier 1–4 chronology covers this event.'}`,
      sorting_year: 1, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' }, chronologies: [keepCfah(old?.chronologies), ...(old?.chronologies?.filter((c) => c.source === 'generations') || []), ...keepOther(old?.chronologies)],
      people: merge(e.people, old?.people), locations: merge(e.loc, old?.locations), maps: old?.maps || [], scripture_refs: merge(e.refs, old?.scripture_refs), sources: [...new Set([...(old?.sources || []), book.id])], related: merge(e.related, old?.related),
      free_source_links: book.private ? [] : [{ source_id: book.id, url: book.url, locator: book.short }] };
    if (old) for (const s of old.free_source_links || []) if (!doc.free_source_links.some((x) => x.source_id === s.source_id)) doc.free_source_links.push(s);
    recs[id] = { dir: 'events', doc, dirty: true }; created.add(id);
  }
  // 3. entries
  extractRows[key] = [];
  for (const [page, date, y, yEnd, prec, target, note] of cur.rows) {
    const [id, slot] = target.split(':');
    const r = recs[id]; if (!r) throw new Error(`${key} p.${page}: unknown target ${target}`);
    if (runCreated.has(id)) { created.add(id); addBookLinks(r.doc, book); }
    const ch = chapterAt(page);
    const printed = book.printedOffset != null ? ` (printed p. ${page + book.printedOffset})` : book.printedSpread ? ` (printed pp. ${2 * page - 1}–${2 * page})` : '';
    const entry = { source: 'generations', date, year_am: null, year_bc_ad: y, ...(yEnd != null ? { year_bc_ad_end: yEnd } : {}), precision: prec,
      citation: `${book.short}${ch ? `, ch. ${ch[1]} "${ch[2]}"` : ''}, PDF p. ${page}${printed}`, link: book.private ? book.url : `${book.url}#page=${page}`, source_text_id: book.id, note: note || null };
    const d = r.doc; let list;
    if (d.type === 'event') list = d.chronologies; else if (d.type === 'person') list = (d.dates[slot || 'birth'] ||= [CFAH_NULL()]); else throw new Error(`target ${target} is a ${d.type}`);
    // agreement with the sort year (records sorted by tiers 1-4)
    let agree = 'no tier 1–4 date';
    const basisEntries = d.type === 'event' ? d.chronologies : (d.dates.birth || []);
    const t = tierOf(basisEntries);
    if (t && y != null && (d.type === 'event' || (slot || 'birth') === 'birth')) {
      const diff = Math.abs((y < 0 ? y + 1 : y) - (t.y < 0 ? t.y + 1 : t.y));
      const inRange = yEnd != null && ((y <= t.y && t.y <= yEnd) || (y >= t.y && t.y >= yEnd));
      agree = diff === 0 || inRange ? `agrees with sort year ${yl(t.y)} (${t.tier})` : `CONFLICT: ${diff} years from sort year ${yl(t.y)} (${t.tier})`;
      if (!/^agrees/.test(agree)) entry.note = `${entry.note ? entry.note + ' ' : ''}Differs from the sort year (${yl(t.y)}, ${t.tier}) by ${diff} years.`;
    } else if (d.type === 'person' && slot === 'death' && y != null) {
      // the sort uses birth; compare a death year with the tier 1-4 death year when one exists
      const td = tierOf(d.dates.death || []);
      if (td) {
        const diff = Math.abs((y < 0 ? y + 1 : y) - (td.y < 0 ? td.y + 1 : td.y));
        const inRange = yEnd != null && ((y <= td.y && td.y <= yEnd) || (y >= td.y && td.y >= yEnd));
        agree = diff === 0 || inRange ? `agrees with ${td.tier} death year ${yl(td.y)}` : `CONFLICT: ${diff} years from ${td.tier} death year ${yl(td.y)}`;
        if (!/^agrees/.test(agree)) entry.note = `${entry.note ? entry.note + ' ' : ''}Differs from the ${td.tier} death year (${yl(td.y)}) by ${diff} years.`;
      } else agree = t ? 'death date (sort uses birth; no tier 1–4 death year)' : created.has(id) ? 'NEW' : 'no tier 1–4 date';
    } else if (!t && created.has(id)) agree = 'NEW';
    list.push(entry); sortGen(list); save(id);
    if (d.type === 'event' && (cur.events?.[id]?.people || []).length) for (const pid of cur.events[id].people) if (recs[pid]?.doc.type !== 'person') throw new Error(`${id}: unknown person ${pid}`);
    extractRows[key].push({ page, printed: book.printedOffset != null ? page + book.printedOffset : book.printedSpread ? `${2 * page - 1}–${2 * page}` : null, date, event: d.type === 'person' ? `${d.title}: ${slot || 'birth'}` : d.title, id: d.type === 'person' ? `${id} (${slot || 'birth'})` : id, isNew: created.has(id), agree, note, _id: id, _slot: d.type === 'person' ? (slot || 'birth') : null, _y: y, _yEnd: yEnd, _book: book.id });
  }
  for (const id of created) runCreated.add(id);
  // 4. drop records this book created earlier but no longer defines (only if nothing else references them)
  for (const [id, r] of Object.entries(recs)) {
    const d = r.doc; if (!d.description?.startsWith(`${MARK} (${book.short})`) || runCreated.has(id)) continue;
    const left = (d.type === 'event' ? d.chronologies : Object.values(d.dates).flat()).filter((e) => e.source === 'generations').length;
    if (!left) { unlinkSync(join(DATA, r.dir, `${id}.json`)); delete recs[id]; }
  }
}
// edition supersession: where a newer edition (book.supersedes) dates the same record/slot, the older edition's entries are
// kept but marked superseded_by (the site shows them collapsed, and they never set a provisional sort); older-edition
// entries the newer edition does not date are flagged "not in <newer edition>".
const pg = (e) => e.citation.match(/PDF p\. (\d+)/)[1];
const astro = (y) => (y < 0 ? y + 1 : y);
const span = (e) => [Math.min(e.year_bc_ad, e.year_bc_ad_end ?? e.year_bc_ad), Math.max(e.year_bc_ad, e.year_bc_ad_end ?? e.year_bc_ad)];
const change = (o, n) => {
  if (o.year_bc_ad == null || n.year_bc_ad == null) return 'not comparable';
  const d = astro(n.year_bc_ad) - astro(o.year_bc_ad);
  if (d === 0) return (o.year_bc_ad_end ?? null) === (n.year_bc_ad_end ?? null) ? 'same' : 'same start year';
  const [a1, b1] = span(o), [a2, b2] = span(n);
  const ov = !(b1 < a2 || b2 < a1) && (o.year_bc_ad_end != null || n.year_bc_ad_end != null);
  return `${Math.abs(d)} year${Math.abs(d) === 1 ? '' : 's'} ${d > 0 ? 'later' : 'earlier'}${ov ? ' (ranges overlap)' : ''}`;
};
const editionDiff = {};
for (const nb of BOOKS.filter((b) => b.supersedes && keys.includes(b.key))) {
  const ob = BOOKS.find((b) => b.id === nb.supersedes); const out = (editionDiff[nb.id] = []);
  for (const [id, r] of Object.entries(recs)) {
    const d = r.doc; const slots = d.type === 'event' ? [[null, d.chronologies]] : d.type === 'person' ? Object.entries(d.dates) : [];
    for (const [slot, list] of slots) {
      const olds = list.filter((e) => e.source === 'generations' && e.source_text_id === ob.id);
      const news = list.filter((e) => e.source === 'generations' && e.source_text_id === nb.id);
      if (!olds.length && !news.length) continue;
      for (const o of olds) {
        if (news.length) {
          o.superseded_by = nb.id;
          o.edition_note = `${ob.edition}; superseded by the ${nb.edition}, which prints "${news[0].date}" (PDF p. ${pg(news[0])}): ${change(o, news[0]).replace(/^same$/, 'the same date')}.`;
        } else { delete o.superseded_by; o.edition_note = `${ob.edition}; not in ${nb.edition}: no dated statement for this was found in the ${nb.edition}.`; }
        save(id);
      }
      out.push({ id, slot, title: d.title, olds, news, tier: tierOf(d.type === 'event' ? d.chronologies : (d.dates[slot] || [])) });
    }
  }
}
// link people <-> events, resort, write
for (const [id, r] of Object.entries(recs)) if (r.doc.type === 'person' && r.doc.description?.startsWith(MARK)) {
  r.doc.events = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people.includes(id)).map((x) => x.doc.id).sort(); save(id);
}
const herodotusLast = (l) => { const h = l.filter((e) => e.source === 'herodotus'); if (h.length) { const o = l.filter((e) => e.source !== 'herodotus'); l.splice(0, l.length, ...o, ...h); } };
for (const [id, r] of Object.entries(recs)) if (r.dirty) { if (r.doc.type === 'event') herodotusLast(r.doc.chronologies); if (r.doc.type === 'person') Object.values(r.doc.dates).forEach(herodotusLast); if (r.doc.type !== 'location') resort(r.doc); writeFileSync(join(DATA, r.dir, `${id}.json`), JSON.stringify(r.doc, null, 2) + '\n'); }

// cross-book check (after every book is loaded): other Generations books that print a different year for the same record/slot
for (const rows of Object.values(extractRows)) for (const r of rows) {
  if (r._y == null) continue;
  const d = recs[r._id].doc; const list = d.type === 'event' ? d.chronologies : d.dates[r._slot] || [];
  const lo2 = Math.min(r._y, r._yEnd ?? r._y), hi2 = Math.max(r._y, r._yEnd ?? r._y);
  for (const o of list) {
    if (o.source !== 'generations' || o.source_text_id === r._book || o.year_bc_ad == null) continue;
    const rb = BOOKS.find((b) => b.id === r._book);
    if (o.source_text_id === rb.supersedes || o.source_text_id === rb.supersededBy) continue; // editions are compared in their own table
    const lo = Math.min(o.year_bc_ad, o.year_bc_ad_end ?? o.year_bc_ad), hi = Math.max(o.year_bc_ad, o.year_bc_ad_end ?? o.year_bc_ad);
    if (hi2 < lo || lo2 > hi) r.agree += `; differs from ${BOOKS.find((b) => b.id === o.source_text_id).short} ("${o.date}", PDF p. ${o.citation.match(/PDF p\. (\d+)/)[1]})`;
  }
}
for (const rows of Object.values(extractRows)) for (const r of rows) {
  const rb = BOOKS.find((b) => b.id === r._book); if (!rb.supersededBy) continue;
  const d = recs[r._id].doc; const list = d.type === 'event' ? d.chronologies : d.dates[r._slot] || [];
  const nb = BOOKS.find((b) => b.id === rb.supersededBy);
  const n = list.find((e) => e.source === 'generations' && e.source_text_id === nb.id);
  r.agree += n ? `; superseded by the ${nb.edition} ("${n.date}", PDF p. ${pg(n)})` : `; not in ${nb.edition}`;
}
// extract markdown (all curated books)
const allKeys = BOOKS.map((b) => b.key).filter((k) => existsSync(join(here, `${k}.mjs`)));
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');
let md = `# Generations curriculum: dates extract\n\nGenerated by \`scripts/generations/import.mjs\` from the curated lists in \`scripts/generations/<book>.mjs\`. Do not edit by hand.\n\n` +
  `- **Copyright:** the five books (six PDFs: both editions of *Preparing the World for Jesus*) are © Generations and are **not** in this repository. Only the dates as printed, PDF page numbers and short notes in our own words are kept. Each source link opens the original PDF on Generations' S3 at that page (\`#page=N\`), except the 2nd edition of *Preparing the World for Jesus*, which is a private copy with no public link.\n` +
  `- **Editions:** *Preparing the World for Jesus* is imported in both editions. The 2nd edition (2024) is the primary Generations reading; a 1st-edition (2020) entry on a record the 2nd edition also dates is kept but marked \`superseded_by\` and shown collapsed, and it never sets a sort. 1st-edition entries the 2nd edition does not date are flagged "not in 2nd ed.".\n` +
  `- **Sort:** Generations is a secondary display chronology and never one of the four tiers. Records that no tier reaches use the first Generations date as a **provisional** sort (badged on the site); see A8 in \`docs/OPEN-QUESTIONS-FOR-KEVIN.md\`.\n` +
  `- **Agreement column:** "agrees" means the same year as the record's tier 1–4 sort year, or a printed range that contains it. "CONFLICT" gives the gap in years (no year 0). "NEW" means a record created by this import (provisional sort).\n\n`;
for (const k of allKeys) {
  const book = BOOKS.find((b) => b.key === k); const rows = extractRows[k];
  if (!rows) continue;
  md += `## ${book.title}${book.edition ? ` — ${book.edition}` : ''}\n\n${book.authors.join(' and ')}${book.editor ? `; ${book.editor}` : ''}. Generations, ${book.year}. ${book.private ? `[Private copy](${book.url}) (no public link)` : `[PDF](${book.url})`}. ${book.note}\n\n${rows.length} dates. ${rows.filter((r) => r.isNew).length} on records created by this import, ${rows.filter((r) => !r.isNew).length} on existing records. ${rows.filter((r) => /^CONFLICT/.test(r.agree)).length} conflicts with a tier 1–4 sort year; ${rows.filter((r) => /differs from/.test(r.agree)).length} differ from another Generations book.\n\n`;
  md += `| Date (as printed) | Event | PDF p. | Record | Agreement with sort date | Note |\n|---|---|---|---|---|---|\n`;
  for (const r of rows) md += `| ${esc(r.date)} | ${esc(r.event)} | ${r.page}${r.printed != null && r.printed !== r.page ? ` (printed ${r.printed})` : ''} | \`${r.id}\`${r.isNew ? ' (NEW)' : ''} | ${esc(r.agree)} | ${esc(r.note)} |\n`;
  const sk = (await import(pathToFileURL(join(here, `${k}.mjs`)).href)).skipped;
  if (sk?.length) md += `\n**Not imported** (with reasons):\n\n${sk.map((s) => `- ${s}`).join('\n')}\n`;
  md += '\n';
  const diff = editionDiff[book.id];
  if (diff) {
    const ob = BOOKS.find((b) => b.id === book.supersedes);
    const cell = (l) => l.length ? l.map((e) => `${esc(e.date)} (p. ${pg(e)})`).join('; ') : '—';
    const st = (x) => !x.olds.length ? `new in ${book.edition}` : !x.news.length ? `not in ${book.edition}` : change(x.olds[0], x.news[0]);
    md += `### ${ob.edition} vs ${book.edition}: differences\n\nEvery record (and person date slot) dated by either edition. "Change" compares the first year of the 1st-edition entry with the first year of the 2nd-edition entry (later = closer to the present). Pages are PDF pages of each edition.\n\n`;
    md += `${diff.filter((x) => x.olds.length && x.news.length && st(x) !== 'same').length} changed, ${diff.filter((x) => st(x) === 'same').length} unchanged, ${diff.filter((x) => !x.news.length).length} not in the ${book.edition}, ${diff.filter((x) => !x.olds.length).length} new in the ${book.edition}.\n\n`;
    md += `| Record | ${ob.edition} | ${book.edition} | Change | Tier 1–4 year |\n|---|---|---|---|---|\n`;
    for (const x of diff) md += `| ${esc(x.title)}${x.slot ? ` (${x.slot})` : ''} \`${x.id}\` | ${cell(x.olds)} | ${cell(x.news)} | ${st(x)} | ${x.tier ? `${yl(x.tier.y)} (${x.tier.tier})` : '—'} |\n`;
    md += '\n';
  }
}
writeFileSync(join(DATA, 'generations-dates-extract.md'), md);
console.log(Object.entries(extractRows).map(([k, r]) => `${k}: ${r.length} dates, ${r.filter((x) => x.isNew).length} on records created by this import, ${r.filter((x) => /^CONFLICT/.test(x.agree)).length} conflicts`).join('\n'));
