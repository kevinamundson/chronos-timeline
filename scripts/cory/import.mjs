#!/usr/bin/env node
// Import Cory, Ancient Fragments (1876 Hodges) as the display-only chronology "cory". Idempotent:
//   node scripts/cory/import.mjs
// Strips previous cory entries and writes them again from scripts/cory/rows.mjs.
// Never recomputes sorting_year or sorting_basis. A change to either throws before any write.
// New people are tier "none". year_bc_ad stays null. Xisuthrus is not added to the Flood.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SRC, ITEM, MARK, leafOf, pageLink, citation } from './edition.mjs';
import { people as NEW_PEOPLE } from './records.mjs';
import { rows } from './rows.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const CFAH_NULL = () => ({
  source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown',
  citation: null, link: null, note: 'pending CFAH reference (no CFAH anchor point or Table 1 entry found for this)',
});
const NO_PERSON_LINK = new Set(['the-flood']);
const SECTION = {
  tyrian: 'Tyrian Annals (Menander), printed pp. 28–32',
  berossus: 'Berossus, antediluvian kings (Apollodorus pp. 51–52, Abydenus pp. 53–54, Polyhistor p. 60)',
  chaldean: 'Polyhistor and Castor, Chaldean and Assyrian lists, printed pp. 85–92',
};

const recs = {};
for (const dir of ['events', 'people', 'locations']) {
  for (const f of readdirSync(join(DATA, dir)).filter((name) => name.endsWith('.json'))) {
    const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8'));
    recs[doc.id] = { dir, doc, dirty: false };
  }
}
const sortSnap = new Map();
for (const [id, r] of Object.entries(recs)) {
  sortSnap.set(id, JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null }));
}
const touch = (id) => { recs[id].dirty = true; };
const uniq = (a) => [...new Set(a)];

// ---- 1. remove old cory entries (re-runs)
for (const [id, r] of Object.entries(recs)) {
  const d = r.doc;
  const lists = d.type === 'event' ? [d.chronologies] : d.type === 'person' ? Object.values(d.dates || {}) : [];
  let hit = false;
  for (const list of lists) {
    for (let i = list.length - 1; i >= 0; i--) if (list[i].source === 'cory') { list.splice(i, 1); hit = true; }
  }
  if (d.sources?.includes(SRC)) { d.sources = d.sources.filter((s) => s !== SRC); hit = true; }
  if (d.free_source_links?.some((l) => l.source_id === SRC)) {
    d.free_source_links = d.free_source_links.filter((l) => l.source_id !== SRC);
    hit = true;
  }
  if (hit) touch(id);
}

// ---- 2. people that do not already exist
for (const [id, p] of Object.entries(NEW_PEOPLE)) {
  const old = recs[id]?.doc;
  // A record curated elsewhere (Raleigh's belus and ninus, for example) keeps its sort,
  // title, and description. This import only appends display entries.
  if (old && !old.description?.startsWith(MARK)) continue;
  recs[id] = {
    dir: 'people', dirty: true,
    doc: {
      $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title,
      ...(p.alt ? { alt_names: p.alt } : {}),
      summary: p.summary,
      description: `${MARK}. Display only. Cory gives reign lengths and synchronisms, not a BC year this record can sort on, and no tier 1–4 chronology dates this person, so there is no sort year.`,
      sorting_year: null,
      sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year (Cory is display-only and gives none).' },
      father: null, children: [],
      dates: { reign: [CFAH_NULL()] },
      events: [], scripture_refs: [], sources: [SRC], related: [], free_source_links: [],
    },
  };
}

// ---- 3. rows -> display entries
const addLink = (d) => {
  d.sources ||= [];
  if (!d.sources.includes(SRC)) d.sources.push(SRC);
  d.free_source_links ||= [];
  if (!d.free_source_links.some((l) => l.source_id === SRC)) {
    d.free_source_links.push({ source_id: SRC, url: ITEM, locator: '1876 Hodges edition, full view' });
  }
};
const extract = [];
for (const row of rows) {
  if (!SECTION[row.section]) throw new Error(`unknown section ${row.section}`);
  if (!row.chain) throw new Error(`p. ${row.page}: missing fragment chain`);
  if (!row.quote) throw new Error(`p. ${row.page}: missing quote`);
  const noteParts = [row.note, row.cmp].filter(Boolean);
  const entry = {
    source: 'cory',
    date: `“${row.quote}”`,
    year_am: null,
    year_bc_ad: null,
    year_bc_ad_end: null,
    precision: 'unknown',
    citation: citation(row.page, row.chain),
    link: pageLink(row.page),
    source_text_id: SRC,
    note: noteParts.length ? noteParts.join(' ') : null,
  };
  if (entry.year_bc_ad != null || entry.year_am != null || entry.year_bc_ad_end != null) throw new Error('cory entry carried a year');
  const mapped = [];
  const personIds = [];
  const eventIds = [];
  for (const t of row.targets) {
    const [id, slot] = t.split(':');
    const r = recs[id];
    if (!r) throw new Error(`p. ${row.page}: unknown target ${t}`);
    const d = r.doc;
    let list;
    if (d.type === 'event') {
      if (slot) throw new Error(`p. ${row.page}: event target ${t} must not name a slot`);
      if (!d.chronologies.some((e) => e.source === 'cfah')) throw new Error(`${id}: event has no cfah entry`);
      list = d.chronologies;
      eventIds.push(id);
    } else if (d.type === 'person') {
      if (slot !== 'reign') throw new Error(`p. ${row.page}: person target ${t} must use the reign slot`);
      if (!d.dates.reign) d.dates.reign = [CFAH_NULL()];
      else if (!d.dates.reign.some((e) => e.source === 'cfah')) throw new Error(`${id}: reign has no cfah entry`);
      list = d.dates.reign;
      personIds.push(id);
    } else throw new Error(`p. ${row.page}: target ${t} is a ${d.type}`);
    list.push(entry);
    addLink(d);
    touch(id);
    mapped.push({ id, slot: d.type === 'person' ? 'reign' : null, isNew: !!d.description?.startsWith(MARK) });
  }
  for (const eid of eventIds) {
    if (NO_PERSON_LINK.has(eid)) continue;
    const people = recs[eid].doc.people;
    for (const pid of personIds) if (!people.includes(pid)) { people.push(pid); touch(eid); }
  }
  extract.push({ ...row, mapped, link: entry.link });
}

if (recs['the-flood']?.doc.people?.includes('xisuthrus')) throw new Error('xisuthrus must not be added to the-flood');

// person -> event links for people this import owns
for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type !== 'person' || !r.doc.description?.startsWith(MARK)) continue;
  const ev = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people?.includes(id)).map((x) => x.doc.id).sort();
  if (JSON.stringify(ev) !== JSON.stringify(r.doc.events || [])) { r.doc.events = ev; touch(id); }
}
for (const id of Object.keys(NEW_PEOPLE)) {
  const reign = recs[id]?.doc.dates?.reign || [];
  if (!reign.some((e) => e.source === 'cory')) throw new Error(`${id}: new person received no cory entry`);
}

// ---- 4. refuse any sort change, then write dirty records
for (const [id, r] of Object.entries(recs)) {
  const now = JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null });
  const before = sortSnap.get(id);
  if (before == null) {
    if (r.doc.type !== 'person' || r.doc.sorting_year !== null || r.doc.sorting_basis?.tier !== 'none') {
      throw new Error(`${id}: a new Cory record must be an unsorted person`);
    }
    continue;
  }
  if (now !== before) throw new Error(`${id}: sort changed (${before} -> ${now})`);
}
let wrote = 0;
for (const [id, r] of Object.entries(recs)) {
  if (!r.dirty) continue;
  const path = join(DATA, r.dir, `${id}.json`);
  const text = `${JSON.stringify(r.doc, null, 2)}\n`;
  if (!existsSync(path) || readFileSync(path, 'utf8') !== text) { writeFileSync(path, text); wrote++; }
}

// ---- 5. extract
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const st = (r) => r.st || 'n/a';
const created = Object.values(recs).filter((r) => r.doc.description?.startsWith(MARK));
const updated = Object.values(recs).filter((r) => r.dirty && !r.doc.description?.startsWith(MARK));
let md = `# Cory, Ancient Fragments (1876, ed. E. Richmond Hodges): dated statements\n\n`;
md += `Generated by \`scripts/cory/import.mjs\` from \`scripts/cory/rows.mjs\`. Do not edit by hand.\n\n`;
md += `- **Edition read:** Isaac Preston Cory, *Ancient Fragments of the Phoenician, Chaldæan, Egyptian, Tyrian, Carthaginian, Indian, Persian, and Other Writers*, new and enlarged edition, edited by E. Richmond Hodges. London: Reeves & Turner, 196 Strand, 1876. One volume. The title page (scan leaf 5) prints "1876". The editor's preface prints "The first edition of this work appeared in 1826". An advertisement footnote prints "The 2nd edition was published in 1832". Those three sentences were read on the scan. The roadmap's "1828" was not found on the pages that were opened. See open question H4.\n`;
md += `- **Copy opened:** Internet Archive item [\`corysancientfrag00coryuoft\`](${ITEM}) (University of Toronto, Robarts), full view, on 2026-10-23. Printed page P is scan leaf P + 44 (\`page/n{P+44}\`). Each entry links to that leaf. Public domain in the United States: published 1876, which is 1930 or earlier.\n`;
md += `- **This pass (partial):** image-read and entered only from (a) the Tyrian Annals, printed pp. 28–32; (b) Berossus via Apollodorus, pp. 51–52; (c) Berossus via Abydenus, pp. 53–54; (d) Polyhistor's 120 sari / 432,000, p. 60; (e) Polyhistor and Castor, Chaldean and Assyrian lists, pp. 85–92. Every numeral below was read on the scan image of that leaf, not taken from OCR alone.\n`;
md += `- **Not read for entry:** Sanchoniathon (printed pp. 1–22; an OCR pass of leaves 45–68 found no "years", "sari", "months" or "B.C.", and those pages were not image-read, so nothing from them is entered); Hodges's introduction (pp. 43–50; see H5); Josephus's Berossus (pp. 64–67); Manetho; the Old Chronicle; the Laterculus; the Periplus of Hanno; and the rest of the volume.\n`;
md += `- **Display only:** \`cory\` is a secondary display chronology. It never sets a sort year (the validator rejects it). Entries carry **no BC year**: \`year_bc_ad\`, \`year_bc_ad_end\` and \`year_am\` are null. Durations stay in the quotation (years, months, days, sari, neri, sossi). The printed parenthesis "(b.c. 878)" is inside the quotation and is not a sort year (H2).\n`;
md += `- **Derived products:** a year-count we multiply from Abydenus's definitions (a sarus 3,600, a neros 600, a sossus 60, all printed on p. 53) appears only in the note, labelled DERIVED, with the arithmetic. The 432,000 on p. 60 is the edition's own figure, not our product.\n`;
md += `- **Status:** agrees / consistent / CONFLICT / internal / framework / n/a. Framework means the figure cannot sit inside a young-earth Masoretic chronology. Scripture governs. Nothing here changes the Flood's year.\n\n`;

md += `## Summary\n\n| Section | Statements | Mapped | Not mapped | Conflicts (incl. framework) |\n|---|---|---|---|---|\n`;
for (const key of ['tyrian', 'berossus', 'chaldean']) {
  const rs = extract.filter((r) => r.section === key);
  md += `| ${SECTION[key]} | ${rs.length} | ${rs.filter((r) => r.mapped.length).length} | ${rs.filter((r) => !r.mapped.length).length} | ${rs.filter((r) => /CONFLICT|framework/.test(st(r))).length} |\n`;
}
md += `| **All** | **${extract.length}** | **${extract.filter((r) => r.mapped.length).length}** | **${extract.filter((r) => !r.mapped.length).length}** | **${extract.filter((r) => /CONFLICT|framework/.test(st(r))).length}** |\n\n`;

for (const key of ['tyrian', 'berossus', 'chaldean']) {
  const rs = extract.filter((r) => r.section === key);
  md += `## ${SECTION[key]}\n\n| Statement (as printed) | Printed p. | Scan leaf | Record | Derived (labelled) | Status | Note |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rs) {
    const derived = (r.note || '').includes('DERIVED') ? r.note : '';
    const where = r.mapped.length ? r.mapped.map((m) => `\`${m.id}\`${m.slot ? ` (${m.slot})` : ''}${m.isNew ? ' NEW' : ''}`).join(', ') : '— not mapped';
    md += `| “${esc(r.quote)}” | [${r.page}](${r.link}) | ${leafOf(r.page)} | ${where} | ${esc(derived)} | ${esc(st(r))} | ${esc([r.cmp, r.note].filter(Boolean).join(' '))} |\n`;
  }
  md += '\n';
}

md += `## Records created\n\n${created.map((r) => `- \`${r.doc.id}\` (${r.doc.type}, tier ${r.doc.sorting_basis.tier}, no sort year)`).join('\n')}\n\n`;
md += `## Records that received a display entry (sort unchanged)\n\n${updated.map((r) => `- \`${r.doc.id}\` (${r.doc.type})`).sort().join('\n')}\n\n`;
md += `## Figures seen and not entered\n\n`;
md += `- **Abibalus** is named on p. 28 as the father of Hiromus. The edition prints no length for him. No record.\n`;
md += `- **The eldest of the four sons of Abdastartus's nurse** reigned twelve years (p. 29). He is not named. The statement is in the table above and is not mapped.\n`;
md += `- **Phulus (Pul)** is named on p. 86. The passage that was read prints no length. No record, and he is not linked to any existing Pul.\n`;
md += `- **Xerxes** is named on p. 89 after Darius and is given no length. No Xerxes row. The 36 years stay on Darius I.\n`;
md += `- **Ships and men** in the Elulæus blockade (p. 31) are not reign lengths and were not entered. The five years of the blockade were entered.\n`;
md += `- **Hodges's footnotes** (Jezebel and Ahab, Lulia and the Taylor cylinder, a Hebrew form, and *Records of the Past* citations) are the editor's notes. They are not fragment dates and were not entered.\n`;
md += `- **Hodges's introduction** (printed pp. 43–50) prints BC dates, including a Nabonassar era and an eclipse. Those pages are the editor's chronology, not a fragment. Nothing from them is entered (H5).\n`;
md += `- **Sanchoniathon** (printed pp. 1–22) was not image-read. OCR of those leaves showed no year, sarus, month or B.C. figure, so none was entered.\n`;
md += `- **Not read, so not entered:** Manetho, the Old Chronicle, the Laterculus, Josephus's Berossus on pp. 64–67, and the Periplus of Hanno.\n`;
md += `- **Not filled in:** the eleven kings whose years are printed as dots (p. 85). CFAH's 33 years for Babylon dynasty 3 were not copied into the blank (H9).\n`;
md += `- **Not identified:** Xisuthrus with Noah (he is not on the Flood's people list); Ninus with Nimrod; Salmanasar with Shalmaneser I; the two Hiromus figures with each other; the two Ithobalus figures with each other; Sammuges, his unnamed brother, and Sardanapallus with each other (H1, H3, H7, H8, H10).\n`;

writeFileSync(join(DATA, 'cory-dates-extract.md'), md);
const mappedN = extract.filter((r) => r.mapped.length).length;
const entriesN = extract.reduce((n, r) => n + r.mapped.length, 0);
console.log(`cory: ${extract.length} statements (${mappedN} mapped, ${extract.length - mappedN} not mapped), ${entriesN} entries; ${extract.filter((r) => /CONFLICT|framework/.test(st(r))).length} conflicts; ${created.length} people created; ${updated.length} existing records updated; ${wrote} files written.`);
