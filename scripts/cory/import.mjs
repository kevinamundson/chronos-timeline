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
const PERSON_SLOTS = new Set(['reign', 'birth', 'death', 'translated']);
const SECTION = {
  tyrian: 'Tyrian Annals (Menander), printed pp. 28–32',
  berossus: 'Berossus, antediluvian kings (Apollodorus pp. 51–52, Abydenus pp. 53–54, Polyhistor p. 60)',
  chaldean: 'Polyhistor and Castor, Chaldean and Assyrian lists, printed pp. 85–92',
  manetho: 'Manetho, Egyptian dynasties (demigods and the three books), printed pp. 111–125',
  'manetho-josephus': 'Manetho, ap. Josephus, Against Apion, printed pp. 126–135',
  'old-chronicle': 'Old Egyptian Chronicle, printed pp. 136–137',
  eratosthenes: "Eratosthenes' canon of the Theban kings, printed pp. 138–141",
  'diodorus-egypt': 'Diodorus Siculus, canon of the kings of Egypt, printed pp. 199–203',
  africanus: "Africanus, in the editor's biographical notice, printed pp. 98–100",
  other: 'Other dated fragments (Sanchoniathon, Berossus, Thallus, Ktesias, Herodotus, Polemo, Ptolemy of Mendes, Artabanus, Hecataeus, Velleius, Pliny)',
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
      if (!PERSON_SLOTS.has(slot)) throw new Error(`p. ${row.page}: person target ${t} must name birth, death, translated or reign`);
      if (!d.dates[slot]) d.dates[slot] = [CFAH_NULL()];
      else if (!d.dates[slot].some((e) => e.source === 'cfah')) d.dates[slot].unshift(CFAH_NULL());
      list = d.dates[slot];
      personIds.push(id);
    } else throw new Error(`p. ${row.page}: target ${t} is a ${d.type}`);
    list.push(entry);
    addLink(d);
    touch(id);
    mapped.push({ id, slot: d.type === 'person' ? slot : null, isNew: !!d.description?.startsWith(MARK) });
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
md += `- **Copy opened:** Internet Archive item [\`corysancientfrag00coryuoft\`](${ITEM}) (University of Toronto, Robarts), full view. Pass 1 was read on 2026-10-23. Pass 2 was read on 2026-10-27. Printed page P is scan leaf P + 44 (\`page/n{P+44}\`). Each entry links to that leaf. Public domain in the United States: published 1876, which is 1930 or earlier.\n`;
md += `- **Pass 1:** the Tyrian Annals, printed pp. 28–32; Berossus via Apollodorus, pp. 51–52; Berossus via Abydenus, pp. 53–54; Polyhistor's 120 sari / 432,000, p. 60; Polyhistor and Castor, Chaldean and Assyrian lists, pp. 85–92.\n`;
md += `- **Pass 2:** the remaining king lists and dated statements in this volume. Manetho's one English dynasty list, pp. 111–125 (this edition does not print separate Africanus, Eusebius and Syncellus columns). Manetho as Josephus quotes him, pp. 126–135, kept as its own chain and not merged by position into the dynasty list. The Old Egyptian Chronicle, pp. 136–137, not renumbered onto Manetho's dynasties. Eratosthenes' Theban kings, pp. 138–141 (the year of the world stays in the quotation). Diodorus's canon, pp. 199–203. The editor's Africanus table and the intervals he prints, pp. 98–100, labelled as that summary. Other fragments: Sanchoniathon's thirty-second year (p. 15); Berossus via Josephus (pp. 64–67) and Polyhistor's fifteen myriads and Oannes (pp. 56–57); Thallus, Ktesias, Diodorus and Herodotus (pp. 83–84); the Syncellus sentence of 3,555 years quoted on p. 104; Polemo and Ptolemy of Mendes (p. 146); Artabanus (pp. 147–148); Hecataeus (p. 178); Velleius Paterculus (pp. 190–191); Pliny (p. 194). Where the page image and the OCR disagreed, the image was followed (Helios is 86 years; Ianias is fifty years and one month; the nineteenth dynasty gives the fall of Ilion to Alcandrus).\n`;
md += `- **Display only:** \`cory\` is a secondary display chronology. It never sets a sort year (the validator rejects it). Entries carry **no BC year and no stored Anno Mundi**: \`year_bc_ad\`, \`year_bc_ad_end\` and \`year_am\` are null. Durations and years of the world stay in the quotation. The printed parenthesis "(b.c. 878)" is inside the quotation and is not a sort year (H2). A figure worked by us is labelled "Our check (not a figure of the text)" and is not a BC year.\n`;
md += `- **Derived products:** a year-count we multiply from Abydenus's definitions (a sarus 3,600, a neros 600, a sossus 60, all printed on p. 53) appears only in the note, labelled DERIVED, with the arithmetic. The 432,000 on p. 60 is the edition's own figure, not our product.\n`;
md += `- **Status:** agrees / consistent / CONFLICT / internal / framework / n/a. Framework means the figure cannot sit inside a young-earth Masoretic chronology. Scripture governs. Nothing here changes the Flood's year.\n\n`;

md += `## Summary\n\n| Section | Statements | Mapped | Not mapped | Conflicts (incl. framework) |\n|---|---|---|---|---|\n`;
for (const key of Object.keys(SECTION)) {
  const rs = extract.filter((r) => r.section === key);
  md += `| ${SECTION[key]} | ${rs.length} | ${rs.filter((r) => r.mapped.length).length} | ${rs.filter((r) => !r.mapped.length).length} | ${rs.filter((r) => /CONFLICT|framework/.test(st(r))).length} |\n`;
}
md += `| **All** | **${extract.length}** | **${extract.filter((r) => r.mapped.length).length}** | **${extract.filter((r) => !r.mapped.length).length}** | **${extract.filter((r) => /CONFLICT|framework/.test(st(r))).length}** |\n\n`;

for (const key of Object.keys(SECTION)) {
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
md += `- **Sanchoniathon** (printed pp. 1–22): the thirty-second year of Ilus (p. 15) is entered. No other reign length was found. "Every year" on p. 7 is a feast. The later reign "by the consent of Kronus" gives no length.\n`;
md += `- **Hodges's introduction** (printed pp. 43–50), including the supposed Berossus and Syncellus lists on p. 46, stays out (H5). The biographical notices on pp. 95–97 and 101–108 stay out, except the Africanus table and intervals (pp. 98–100) and the one Syncellus sentence quoted on p. 104. The editor's century-split after that sentence was not entered. pp. 106–108 discuss Eratosthenes; the list itself was entered from pp. 138–141, and the editor's 1,076 years were not entered as if Eratosthenes had printed them.\n`;
md += `- **Not a reign, so not entered:** army, navy, acre and ship counts (including Hanno's sixty ships on p. 36, and the troop counts in the Josephus narrative); the ten days and the talents in the Nanarus story (p. 199); stadia and furlongs; the index (pp. 205–209). Cleanthes "about b.c. 264" and his nineteen years with Zeno (p. 191) are the editor's biographical notice. Asoka's dates on p. 168 are the editor's. Editorial footnotes that print a BC year (Bunsen on p. 132, the Carthage note on p. 189, "about a century before Christ" on p. 148) were not entered.\n`;
md += `- **Megasthenes (p. 72)** names Evilmaruchus, Neriglisares, Labassoarascus and Nabannidochus, and says Cyrus took Babylon in Nabannidochus's reign. No reign length is printed. The same kings are entered from Josephus on pp. 65 and 67. "Fifteen days" on p. 72 is the time in which the walls were built, not a reign.\n`;
md += `- **Named and given no length, so no record:** Abibalus; Achthoes; Alisphragmuthosis; Thummosis; Sesoosis the second; Uchoreus; Myris (or Moeris); Aktisanes; Mendes (Marrhus); Ketna; Rhemphis; Nileus (not attached to nilus); Mykerinus (no years; none were copied from another list); Tnephachthus; Sabacon in Diodorus (Manetho's 8 years were not copied onto him); the Ammeres whom a footnote says Eusebius inserts, with no length; Apis son of Phoroneus; Menon; Osarsiph (the fragment's own "Moyses" sentence is on Moses; the editorial footnote was not the link). Jotham is named in a parenthesis on p. 99 and was not created.\n`;
md += `- **Not filled in:** the eleven kings whose years are printed as dots (p. 85); the sixth demigod whose years are dots (p. 111); the 36th Theban king, whose name is dots (p. 141); the Old Chronicle's 28th dynasty ("No information") and the blank number of kings in its 29th. CFAH's 33 years for Babylon dynasty 3 were not copied into a blank (H9).\n`;
md += `- **Not identified:** Xisuthrus with Noah; Ninus with Nimrod; Salmanasar with Shalmaneser I; the two Hiromus figures; the two Ithobalus figures; Sammuges, his unnamed brother, and Sardanapallus (H1, H3, H7, H8, H10, H12). Also left unmerged, and listed for Kevin: Josephus's post-Shepherd kings and the eighteenth dynasty; Phruron and nilus; Sanchoniathon's Ilus and Raleigh's ilus; Hecataeus's high priest and king Hezekiah; Nectanebes, Nectanebos and nectanebus; Tarkos and taharqa; Sesonchis and shoshenq-i; Zeet and zet; Teos of the thirtieth dynasty and teos; Amyrteos and setnakht; the two Suphis figures and the Chembres of 50 years.\n`;

writeFileSync(join(DATA, 'cory-dates-extract.md'), md);
const mappedN = extract.filter((r) => r.mapped.length).length;
const entriesN = extract.reduce((n, r) => n + r.mapped.length, 0);
console.log(`cory: ${extract.length} statements (${mappedN} mapped, ${extract.length - mappedN} not mapped), ${entriesN} entries; ${extract.filter((r) => /CONFLICT|framework/.test(st(r))).length} conflicts; ${created.length} people created; ${updated.length} existing records updated; ${wrote} files written.`);
