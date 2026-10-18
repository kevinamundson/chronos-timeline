#!/usr/bin/env node
// Import Joe Morecraft III, A Christian Survey of World History, as the display-only secondary chronology "morecraft".
// Idempotent:  node scripts/morecraft/import.mjs
// 1. removes every previous morecraft entry, then re-adds the curated rows (scripts/morecraft/rows-*.mjs);
// 2. creates the records in records.mjs where none exists (marked "Added from the Morecraft import");
// 3. Morecraft never sets the sort of an existing record. A record it created sorts PROVISIONALLY by its first dated
//    Morecraft entry (events) or Morecraft birth year (people), and only while no tier 1–4 and no Generations date exists;
// 4. rewrites data/morecraft-dates-extract.md (agreement / conflict with each record's tier or provisional year).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SRC, SHORT, MARK, LISTING, citation } from './edition.mjs';
import { events as NEW_EVENTS, people as NEW_PEOPLE } from './records.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..'); const DATA = join(root, 'data');
const printed = JSON.parse(readFileSync(join(here, 'printed.json'), 'utf8'));
const CFAH_NULL = () => ({ source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown', citation: null, link: null, note: 'pending CFAH reference (no CFAH anchor point or Table 1 entry found for this)' });
const recs = {};
for (const dir of ['events', 'people']) for (const f of readdirSync(join(DATA, dir)).filter((f) => f.endsWith('.json'))) {
  const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8')); recs[doc.id] = { dir, doc, dirty: false };
}
const touch = (id) => { recs[id].dirty = true; };
const uniq = (a) => [...new Set(a)];
const groups = [];
const ONLY = process.env.MORECRAFT_PARTS ? new Set(process.env.MORECRAFT_PARTS.split(',')) : null; // staged commits: e.g. MORECRAFT_PARTS=1,2
for (const f of readdirSync(here).filter((f) => /^rows-.*\.mjs$/.test(f) && (!ONLY || ONLY.has(f.match(/^rows-(\d)/)[1]))).sort()) groups.push({ file: f, rows: (await import(pathToFileURL(join(here, f)).href)).rows });

// ---- 1. remove old morecraft entries
for (const [id, r] of Object.entries(recs)) {
  const d = r.doc; const lists = d.type === 'event' ? [d.chronologies] : Object.values(d.dates);
  for (const l of lists) for (let i = l.length - 1; i >= 0; i--) if (l[i].source === 'morecraft') { l.splice(i, 1); touch(id); }
  if (d.type === 'person' && d.dates.reign && !d.dates.reign.some((e) => e.source !== 'cfah' || e.date)) { delete d.dates.reign; touch(id); }
}
const WANT = new Set(groups.flatMap((g) => g.rows.flatMap((r) => r.targets.map((t) => t.split(':')[0]))));
// ---- 2. new records (kept if they exist; only their morecraft entries and sort are rebuilt)
const desc = (kind) => `${MARK} (${SHORT}). ${kind === 'event' ? 'No CFAH, Ussher–Jones, Ussher or Generations date exists, so the sort is PROVISIONAL from Morecraft (secondary display) until a tier 1–4 date is added.' : 'No tier 1–4 or Generations date exists; the sort is PROVISIONAL from Morecraft\'s birth year where he gives one.'}`;
for (const [id, e] of Object.entries(NEW_EVENTS)) {
  if (recs[id] || !WANT.has(id)) continue;
  recs[id] = { dir: 'events', dirty: true, doc: { $schema: '../../schema/event.schema.json', id, type: 'event', title: e.title, summary: e.summary, description: desc('event'),
    sorting_year: null, sorting_basis: { tier: 'provisional', tier_rank: null, chronology: 'morecraft', note: '' }, chronologies: [CFAH_NULL()],
    people: [], locations: [], maps: [], scripture_refs: [], sources: [SRC], related: [], free_source_links: [] } };
}
for (const [id, p] of Object.entries(NEW_PEOPLE)) {
  if (recs[id] || !WANT.has(id)) continue;
  recs[id] = { dir: 'people', dirty: true, doc: { $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title, ...(p.alt_names ? { alt_names: p.alt_names } : {}), summary: p.summary, description: desc('person'),
    sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: '' }, father: null, children: [],
    dates: { birth: [CFAH_NULL()], death: [CFAH_NULL()] }, events: [], scripture_refs: [], sources: [SRC], related: [], free_source_links: [] } };
}
// links to records created by a later part are added once that part is imported
for (const r of Object.values(recs)) if (r.doc.description?.startsWith(MARK)) { const src = NEW_EVENTS[r.doc.id] || NEW_PEOPLE[r.doc.id]; for (const k of ['people', 'related']) { const nx = uniq([...(r.doc[k] || []), ...(src?.[k] || []).filter((x) => recs[x])]); if (JSON.stringify(nx) !== JSON.stringify(r.doc[k])) { r.doc[k] = nx; r.dirty = true; } } }
for (const [pid, p] of Object.entries(NEW_PEOPLE)) if (recs[pid]) for (const eid of p.events || []) { const d = recs[eid].doc; if (!d.people.includes(pid)) { d.people.push(pid); touch(eid); } }

// ---- reference years (before adding morecraft entries): tier 1–4, else provisional Generations
const TIERS = [['cfah-anchor', 1, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'anchor_point'], ['cfah-table1', 2, 'cfah', (e) => e.source === 'cfah' && e.cfah_basis === 'table1_baseline'], ['ussher-jones', 3, 'ussher-jones', (e) => e.source === 'ussher-jones'], ['ussher', 4, 'ussher', (e) => e.source === 'ussher']];
const tierOf = (entries) => { for (const [tier, rank, chron, m] of TIERS) { const e = (entries || []).find((x) => m(x) && x.year_bc_ad != null); if (e) return { tier, rank, chron, e }; } return null; };
const genOf = (entries) => (entries || []).find((x) => x.source === 'generations' && x.year_bc_ad != null && !x.superseded_by);
const yl = (y) => (y == null ? '' : y < 0 ? `${-y} BC` : `AD ${y}`);
const rl = (a, b) => (b == null || b === a ? yl(a) : `${yl(a)}–${yl(b)}`);
function compare(list, y, yEnd) {
  const t = tierOf(list); const g = genOf(list);
  const ref = t ? { y: t.e.year_bc_ad, yEnd: t.e.year_bc_ad_end ?? null, by: t.tier === 'cfah-anchor' ? `CFAH${t.e.citation?.match(/AP-\d+/) ? ` ${t.e.citation.match(/AP-\d+/)[0]}` : ''}` : t.tier === 'cfah-table1' ? 'CFAH-1 Table 1' : t.tier === 'ussher-jones' ? 'Ussher–Jones' : 'Ussher' } : g ? { y: g.year_bc_ad, yEnd: g.year_bc_ad_end ?? null, by: 'Generations (provisional)' } : null;
  if (!ref || y == null) return { st: 'n/a', cmp: ref ? `${ref.by}: ${rl(ref.y, ref.yEnd)}` : 'no other dated chronology' };
  const lo = Math.min(y, yEnd ?? y), hi = Math.max(y, yEnd ?? y), rlo = Math.min(ref.y, ref.yEnd ?? ref.y), rhi = Math.max(ref.y, ref.yEnd ?? ref.y);
  const exact = ref.y === y && (yEnd == null || ref.yEnd == null || ref.yEnd === yEnd);
  const overlap = lo <= rhi && rlo <= hi;
  const diff = Math.min(Math.abs(lo - rlo), Math.abs(hi - rhi), Math.abs(lo - rhi), Math.abs(hi - rlo));
  return { st: exact ? 'agrees' : overlap ? 'consistent' : diff <= 1 ? 'close (1 yr)' : `CONFLICT (${diff} yrs)`, cmp: `${ref.by}: ${rl(ref.y, ref.yEnd)}` };
}

// ---- 3. rows -> entries
const extract = [];
for (const g of groups) for (const row of g.rows) {
  const pg = printed[row.pdf] ?? null;
  const mapped = [];
  for (const t of row.targets) {
    const [id, slot] = t.split(':'); const r = recs[id]; if (!r) throw new Error(`PDF ${row.pdf}: unknown target ${t}`);
    const d = r.doc;
    let y = row.y, yEnd = row.yEnd, prec = row.prec;
    if (slot === 'death' && yEnd != null) { y = yEnd; yEnd = null; prec = 'year'; } else if (slot === 'birth' && yEnd != null) { yEnd = null; prec = 'year'; }
    let list;
    if (d.type === 'event') { if (slot) throw new Error(`${t}: event with slot`); list = d.chronologies; }
    else { if (!slot) throw new Error(`${t}: person without slot`); list = (d.dates[slot] ||= [CFAH_NULL()]); }
    const c = compare(list, y, yEnd);
    const own = d.description?.startsWith(MARK);
    // before any Herodotus entries (the Herodotus and Generations importers keep those last), so all importers are mutually idempotent
    const hi = list.findIndex((e) => e.source === 'herodotus');
    list.splice(hi < 0 ? list.length : hi, 0, { source: 'morecraft', date: row.date, year_am: null, year_bc_ad: y, year_bc_ad_end: yEnd, precision: prec, citation: citation(row.pdf, pg), link: LISTING, source_text_id: SRC, note: row.note || null });
    touch(id);
    if (!d.sources.includes(SRC)) d.sources.push(SRC);
    mapped.push({ t, y, yEnd, isNew: own, ...c });
  }
  extract.push({ ...row, file: g.file, printed: pg, mapped });
}
// ---- 4. sort the records this import created; never touch any other record's sort
for (const [id, r] of Object.entries(recs)) {
  const d = r.doc; if (!d.description?.startsWith(MARK) || !WANT.has(id)) continue;
  const entries = d.type === 'event' ? d.chronologies : d.dates.birth;
  const t = tierOf(entries); const g = genOf(entries);
  const mc = entries.find((e) => e.source === 'morecraft' && e.year_bc_ad != null);
  let next;
  if (t) next = [t.e.year_bc_ad, { tier: t.tier, tier_rank: t.rank, chronology: t.chron, note: `Tier ${t.rank}: ${t.e.date}` }];
  else if (g) next = [g.year_bc_ad, { tier: 'provisional', tier_rank: null, chronology: 'generations', note: `PROVISIONAL: no CFAH, Ussher–Jones or Ussher date exists, so the sort uses Generations: ${g.date}. Pending owner decision (open question A8).` }];
  else if (mc) next = [mc.year_bc_ad, { tier: 'provisional', tier_rank: null, chronology: 'morecraft', note: `PROVISIONAL: no CFAH, Ussher–Jones, Ussher or Generations date exists, so the sort uses Morecraft (${mc.citation}): ${mc.date.replace(/\.$/, "")}. Pending owner decision (open question F1).` }];
  else if (d.type === 'person') next = [null, { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year, and Morecraft gives none.' }];
  else throw new Error(`${id}: new event without any year`);
  if (d.sorting_year !== next[0] || JSON.stringify(d.sorting_basis) !== JSON.stringify(next[1])) { d.sorting_year = next[0]; d.sorting_basis = next[1]; touch(id); }
  if (d.type === 'person') {
    const ev = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people.includes(id)).map((x) => x.doc.id);
    const nx = uniq([...(d.events || []), ...ev]).sort(); if (JSON.stringify(nx) !== JSON.stringify(d.events)) { d.events = nx; touch(id); }
  }
}
for (const [id, r] of Object.entries(recs)) if (r.dirty) writeFileSync(join(DATA, r.dir, `${id}.json`), JSON.stringify(r.doc, null, 2) + '\n');

// ---- 5. extract
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const PART = { 'rows-1-ancient.mjs': 'Creation to Rome (PDF pp. 13–59)', 'rows-2-church.mjs': 'The early and medieval church (PDF pp. 60–175)', 'rows-3-reformation.mjs': 'Bede to the Westminster Assembly (PDF pp. 176–416)' };
const all = extract.flatMap((r) => r.mapped);
const isConf = (s) => /CONFLICT|internal/.test(s);
const rowSt = (r) => [r.st, ...r.mapped.map((m) => m.st)].filter((s) => s && s !== 'n/a');
const newIds = uniq(all.filter((m) => m.isNew).map((m) => m.t.split(':')[0]));
let md = `# Morecraft, A Christian Survey of World History: dated statements\n\nGenerated by \`scripts/morecraft/import.mjs\` from \`scripts/morecraft/rows-*.mjs\`. Do not edit by hand.\n\n` +
  `- **Book:** Joe Morecraft III, *A Christian Survey of World History from Creation to the Reformation* (cover title; the title page reads "A Christian Survey of World History from Creation to Reformation, by Joe Morecraft III"). **No publisher, year, edition or copyright page is printed** in the copy read, and the PDF carries no creation date; none is assumed here. The book is listed (no text online) by [Heritage Presbyterian Church](${LISTING}). It is copyrighted; this repository keeps only the dates as printed, page citations and short notes in our own words. The scan (417 PDF pages, spiral-bound copy) is the site owner's private copy and is not in this repository or linked.\n` +
  `- **Pages:** citations give the printed page and the PDF page. Printed page numbers were read by OCR at the foot of each page: printed = PDF − 9 for PDF pp. 13–29 and PDF − 8 for PDF pp. 30–416.\n` +
  `- **Reading:** the scan was read by two independent OCR passes (tesseract; 300 dpi page segmentation and 400 dpi block mode). Every statement below was located in the first pass, and every printed year was confirmed in the second pass or, where the passes disagree or garble, read from the page image (marked "image").\n` +
  `- **Display only:** \`morecraft\` is a secondary display chronology. It never sets or changes the sort of a record that has a CFAH, Ussher–Jones, Ussher or Generations date. Records created by this import (${newIds.length}) sort PROVISIONALLY by their Morecraft year (open question F1).\n` +
  `- **Status:** agrees / consistent (ranges overlap) / close (1 yr) / CONFLICT (n yrs) against the record's tier 1–4 year, or its provisional Generations year where there is no tier year; internal = Morecraft against himself; n/a = no other dated chronology.\n\n`;
md += `## Summary\n\n| Part | Statements | Mapped | Not mapped | Entries | Conflicts |\n|---|---|---|---|---|---|\n`;
const tot = [0, 0, 0, 0, 0];
for (const [f, name] of Object.entries(PART).filter(([f]) => extract.some((r) => r.file === f))) { const rs = extract.filter((r) => r.file === f); const v = [rs.length, rs.filter((r) => r.mapped.length).length, rs.filter((r) => !r.mapped.length).length, rs.reduce((a, r) => a + r.mapped.length, 0), rs.filter((r) => rowSt(r).some(isConf)).length]; v.forEach((x, i) => (tot[i] += x)); md += `| ${name} | ${v.join(' | ')} |\n`; }
md += `| **Total** | ${tot.map((x) => `**${x}**`).join(' | ')} |\n\n`;
md += `New records (${newIds.length}): ${newIds.map((i) => `\`${i}\``).join(', ')}.\n\n`;
for (const [f, name] of Object.entries(PART).filter(([f]) => extract.some((r) => r.file === f))) {
  md += `## ${name}\n\n| Page | Date as printed | Year | Record(s) | Compared with | Status | Note |\n|---|---|---|---|---|---|---|\n`;
  for (const r of extract.filter((x) => x.file === f)) {
    const recCol = r.mapped.length ? r.mapped.map((m) => `\`${m.t}\`${m.isNew ? ' (new)' : ''}`).join('<br>') : '*not mapped*';
    const cmp = r.mapped.map((m) => m.cmp).filter(Boolean).join('<br>');
    const st = uniq(rowSt(r)).join('; ') || 'n/a';
    md += `| ${r.printed != null ? `p. ${r.printed} ` : ''}(PDF ${r.pdf})${r.imageChecked ? ' image' : ''} | ${esc(r.date)} | ${esc(rl(r.y, r.yEnd))} | ${recCol} | ${esc(cmp)} | ${st} | ${esc(r.note)} |\n`;
  }
  md += '\n';
}
writeFileSync(join(DATA, 'morecraft-dates-extract.md'), md);
console.log(`morecraft: ${extract.length} statements, ${extract.filter((r) => r.mapped.length).length} mapped, ${all.length} entries, ${newIds.length} new records, ${extract.filter((r) => rowSt(r).some(isConf)).length} with conflicts`);
