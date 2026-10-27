#!/usr/bin/env node
// Import Hales, A New Analysis of Chronology (1830, 2nd ed.), pass 1,
// as the display-only chronology "hales". Idempotent:
//   node scripts/hales/import.mjs
// Strips previous hales entries and writes them again from scripts/hales/rows.mjs.
// Never recomputes sorting_year or sorting_basis. A change to either throws before any write.
// New people are tier "none". A B.C. year is stored only when his B.C. column prints it.
// The Y column and any braced subtotal stay in the quotation. Nothing is converted from Anno Mundi.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SRC, MARK, CHRON, ITEM_VOL1, pageLink, citation } from './edition.mjs';
import { people as NEW_PEOPLE } from './records.mjs';
import { rows } from './rows.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const CFAH_NULL = () => ({
  source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown',
  citation: null, link: null, note: 'pending CFAH reference (no CFAH anchor point or Table 1 entry found for this)',
});
const SLOTS = new Set(['birth', 'death', 'translated', 'reign']);
// Kevin’s ruling, 2026-10-27: a judge Hales prints stays in dates.reign.
const JUDGE_REIGN = new Set([
  'iosua', 'othoniel', 'ehud', 'gedeon', 'abimelech-son-of-gideon', 'tola', 'jair',
  'jephthah', 'ibzan', 'elon', 'abdon', 'samson', 'eli', 'samuel',
]);
const ALT_NAMES = { balthasar: ['Belshazzar'] };
const SECTIONS = [
  ['table-xi', 'Vol. I, Table XI, Remarkable Eras, through Nabonassar'],
  ['period-1', 'Vol. II, Synopsis, First Period (Creation to the Deluge)'],
  ['period-2', 'Vol. II, Synopsis, Second Period (Deluge to Abraham)'],
  ['period-3', 'Vol. II, Synopsis, Third Period (Abraham to the return to Canaan)'],
  ['period-4', 'Vol. II, Synopsis, Fourth Period (return to the kingdom)'],
  ['period-5', 'Vol. II, Synopsis, Fifth Period (kingdom to the revolt)'],
  ['period-6', 'Vol. II, Synopsis, Sixth Period (kings of Judah to 586)'],
  ['period-7', 'Vol. II, Synopsis, Seventh Period (586 to Nehemiah’s reform)'],
];

const recs = {};
for (const dir of ['events', 'people']) {
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

for (const [id, r] of Object.entries(recs)) {
  const d = r.doc;
  const lists = d.type === 'event' ? [d.chronologies] : Object.values(d.dates || {});
  let hit = false;
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].source === CHRON) { list.splice(i, 1); hit = true; }
  }
  if (d.sources?.includes(SRC)) { d.sources = d.sources.filter((s) => s !== SRC); hit = true; }
  if (d.free_source_links?.some((l) => l.source_id === SRC)) {
    d.free_source_links = d.free_source_links.filter((l) => l.source_id !== SRC);
    hit = true;
  }
  if (hit) touch(id);
}

for (const [id, p] of Object.entries(NEW_PEOPLE)) {
  if (recs[id]) continue;
  recs[id] = {
    dir: 'people', dirty: true,
    doc: {
      $schema: '../../schema/person.schema.json', id, type: 'person', title: p.title,
      summary: p.summary,
      description: `${MARK}. Display only. Hales prints his own B.C. years in the synopsis and in Table XI. This chronology never sets a sort, and no tier 1–4 chronology dates this person’s birth, so there is no sort year.`,
      sorting_year: null,
      sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year (Hales is display-only).' },
      father: null, children: [],
      dates: { birth: [CFAH_NULL()] },
      events: [], scripture_refs: [], sources: [SRC], related: [], free_source_links: [],
    },
  };
}

const addLink = (d) => {
  d.sources ||= [];
  if (!d.sources.includes(SRC)) d.sources.push(SRC);
  d.free_source_links ||= [];
  if (!d.free_source_links.some((l) => l.source_id === SRC)) {
    d.free_source_links.push({ source_id: SRC, url: ITEM_VOL1, locator: '1830 second edition, four volumes, full view' });
  }
};

const yl = (y) => (y < 0 ? `${-y} BC` : `AD ${y}`);
function compare(list, row) {
  if (!row.targets.length) return { st: 'n/a', cmp: 'not mapped' };
  if (row.year == null) return { st: 'n/a', cmp: 'no B.C. year on this line' };
  const other = (list || []).find((e) => e.source !== CHRON && e.year_bc_ad != null);
  if (!other) return { st: 'n/a', cmp: 'no other year on this slot' };
  const diff = Math.abs(other.year_bc_ad - row.year);
  return {
    st: other.year_bc_ad === row.year ? 'agrees' : `CONFLICT (${diff} yrs)`,
    cmp: `${other.source} ${yl(other.year_bc_ad)}`,
  };
}

const extract = [];
for (const row of rows) {
  if (!row.quote) throw new Error('row missing quote');
  if (![1, 2].includes(row.vol)) throw new Error(`bad volume on ${row.quote}`);
  if (row.year != null) {
    if (!Number.isInteger(row.year) || row.year >= 0) throw new Error(`B.C. year must be a negative integer: ${row.quote}`);
    if (!row.quote.includes(String(-row.year))) throw new Error(`B.C. digits not in the quotation: ${row.quote}`);
  }
  const prec = row.prec || (row.year == null ? 'unknown' : 'year');
  const entry = {
    source: CHRON,
    date: row.quote,
    year_am: null,
    year_bc_ad: row.year,
    precision: prec,
    citation: citation(row.vol === 1 ? 'I' : 'II', row.page, row.where),
    link: pageLink(row.vol, row.leaf),
    source_text_id: SRC,
    note: row.note || null,
  };
  const mapped = [];
  const personIds = [];
  const eventIds = [];
  for (const t of row.targets) {
    const [id, slot] = t.split(':');
    const r = recs[id];
    if (!r) throw new Error(`unknown target ${t} on: ${row.quote}`);
    const d = r.doc;
    let list;
    if (d.type === 'event') {
      if (slot) throw new Error(`event target ${t} must not name a slot`);
      if (!d.chronologies.some((e) => e.source === 'cfah')) throw new Error(`${id}: event has no cfah entry`);
      list = d.chronologies;
      eventIds.push(id);
    } else if (d.type === 'person') {
      if (!SLOTS.has(slot)) throw new Error(`person target ${t} needs birth, death, translated, or reign`);
      if (JUDGE_REIGN.has(id) && slot !== 'reign') throw new Error(`${row.quote}: ${id} is a judge and must use dates.reign`);
      if (!d.dates[slot]) d.dates[slot] = [CFAH_NULL()];
      else if (!d.dates[slot].some((e) => e.source === 'cfah')) d.dates[slot].unshift(CFAH_NULL());
      list = d.dates[slot];
      personIds.push(id);
    } else throw new Error(`target ${t} is a ${d.type}`);
    const cmp = compare(list, row);
    list.push(entry);
    addLink(d);
    touch(id);
    mapped.push({ id, slot: slot || null, isNew: !!d.description?.startsWith(MARK), ...cmp });
  }
  for (const eid of eventIds) {
    const peopleOnEvent = recs[eid].doc.people;
    for (const pid of personIds) {
      if (!recs[pid].doc.description?.startsWith(MARK)) continue;
      if (peopleOnEvent && !peopleOnEvent.includes(pid)) { peopleOnEvent.push(pid); touch(eid); }
    }
  }
  const st = mapped.length ? uniq(mapped.map((m) => m.st)).join('; ') : 'n/a';
  const cmp = uniq(mapped.map((m) => m.cmp).filter(Boolean)).join('; ');
  extract.push({ ...row, prec, mapped, link: entry.link, st, cmp });
}

for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type !== 'person' || !r.doc.description?.startsWith(MARK)) continue;
  const ev = Object.values(recs).filter((x) => x.doc.type === 'event' && x.doc.people?.includes(id)).map((x) => x.doc.id).sort();
  if (JSON.stringify(ev) !== JSON.stringify([...(r.doc.events || [])].sort())) { r.doc.events = ev; touch(id); }
}
for (const id of Object.keys(NEW_PEOPLE)) {
  const d = recs[id]?.doc;
  if (!d) throw new Error(`${id}: missing`);
  const lists = Object.values(d.dates || {});
  if (!lists.some((list) => list.some((e) => e.source === CHRON))) throw new Error(`${id}: new person received no hales entry`);
}
for (const [id, names] of Object.entries(ALT_NAMES)) {
  const d = recs[id]?.doc;
  if (!d || d.type !== 'person') throw new Error(`${id}: alternate-name target missing`);
  d.alt_names ||= [];
  for (const name of names) {
    if (name === d.title || d.alt_names.includes(name)) continue;
    d.alt_names.push(name);
    touch(id);
  }
}

for (const [id, r] of Object.entries(recs)) {
  const now = JSON.stringify({ y: r.doc.sorting_year ?? null, b: r.doc.sorting_basis ?? null });
  const before = sortSnap.get(id);
  if (before == null) {
    if (r.doc.type !== 'person' || r.doc.sorting_year !== null || r.doc.sorting_basis?.tier !== 'none') {
      throw new Error(`${id}: a new Hales record must be an unsorted person`);
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

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
let md = `# Hales, A New Analysis of Chronology (1830, 2nd ed.): dated statements, pass 1\n\n`;
md += `Generated by \`scripts/hales/import.mjs\` from \`scripts/hales/rows.mjs\`. Do not edit by hand.\n\n`;
md += `Edition read: William Hales, *A New Analysis of Chronology and Geography, History and Prophecy*, second edition, corrected and improved, four volumes (London: printed for C. J. G. & F. Rivington, St Paul’s Church-yard and Waterloo-Place, Pall-Mall, 1830; printers Gilbert and Rivington, St. John’s Square). Title pages of all four volumes were opened on 2026-10-27. The scans are Boston Public Library copies on the Internet Archive, full view, items \`newanalysisofchr01hale\` through \`newanalysisofchr04hale\`.\n\n`;
md += `Pass 1 is his own summary, not the narrative chapters.\n\n`;
md += `- Volume II, Synopsis of the Chronology, Periods I–VII: from the Creation (B.C. 5411) through Nehemiah’s reform and the end of his Old Testament canon (B.C. 420). That stretch includes the Babylonian captivity, the fall of Babylon, and the return. The kings of Judah and the Babylonian and Persian kings in that synopsis are in this pass.\n`;
md += `- Volume I, Table XI, Remarkable Eras, printed p. 101, from the Creation through the Era of Nabonassar (February 26, B.C. 747).\n\n`;
md += `The last figure of a row is his B.C. column and is stored as \`year_bc_ad\` (negative). A figure in parenthesis is the Hebrew age he prints beside the age he adopts. Reign lengths and braced subtotals stay in the quotation. They are not converted into another year. “Our check” notes confirm a total he already prints. They are not stored.\n\n`;
md += `He adopts the longer ages. Creation B.C. 5411 conflicts with the Masoretic creation year. Scripture governs. Nothing here changes a sort.\n\n`;
md += `Kevin’s ruling, 2026-10-27: the figures Hales prints for the judges stay in \`dates.reign\`, as this pass already does for Samuel. They are not stored as births. Where he names a judge who already has a person record, that line is on \`dates.reign\`: Joshua and the Elders (\`iosua\`), Othniel (\`othoniel\`), Ehud (\`ehud\`; the same line names Shamgar), Gideon (\`gedeon\`), Abimelech (\`abimelech-son-of-gideon\`), Tola, Jair, Jephthah, Ibzan, Elon, Abdon, Samson, Eli, and Samuel (called as a prophet, 1152; twelve years, 1122; and judge jointly, which prints no B.C. year). Deborah and Barak have no person record, so “4. Deborah and Barak 40 1406” stays on the event \`deborah-and-barak\`. Shamgar has no person record; his name stays on Ehud’s reign entry and on the event \`shamgar-judges-israel\`.\n\n`;
md += `Not entered, for a later pass:\n\n`;
md += `- The rest of Table XI, still on p. 101: Era of the Seleucidæ (October 1) 312, Era Cæsarea at Antioch (September 1) 49, Era Juliana (January 1) 46, Era Hispanica (January 1) 38, and Vict. Actiaca (August 29) 30. All of p. 102, headed A.D., from the Vulgar Christian Era through the Netherlands 1566, then the Arundel Marbles prose.\n`;
md += `- Synopsis Periods VIII–X, which begin on the same page as Nehemiah’s reform (high priests, the Maccabees, Herod, and the New Testament in vol. III).\n`;
md += `- The narrative of volumes I–III.\n`;
md += `- The general tables of patriarchal genealogies in vol. I (the Hebrew and Greek columns behind the synopsis).\n`;
md += `- Volume IV, Synopsis of the Chronology: the profane king lists (Sanchoniathon, Berossus, Assyria, Elam, Babylon, Media, Persia, Egypt, and the later dynasties).\n\n`;

const tally = (list) => {
  const n = list.length;
  const mapped = list.filter((r) => r.mapped.length).length;
  const conflicts = list.filter((r) => r.st.includes('CONFLICT')).length;
  return { n, mapped, unmapped: n - mapped, conflicts };
};
md += `## Summary\n\n| Section | Statements | Mapped | Not mapped | Conflicts |\n|---|---:|---:|---:|---:|\n`;
let tn = 0, tm = 0, tu = 0, tc = 0;
for (const [key, label] of SECTIONS) {
  const t = tally(extract.filter((r) => r.section === key));
  tn += t.n; tm += t.mapped; tu += t.unmapped; tc += t.conflicts;
  md += `| ${label} | ${t.n} | ${t.mapped} | ${t.unmapped} | ${t.conflicts} |\n`;
}
md += `| **All** | **${tn}** | **${tm}** | **${tu}** | **${tc}** |\n\n`;

md += `## Statements\n\n| Section | Page | Quotation | Record | Year stored | Compared with | Status |\n|---|---|---|---|---|---|---|\n`;
for (const r of extract) {
  const who = r.mapped.length ? r.mapped.map((m) => `${m.id}${m.slot ? ':' + m.slot : ''}${m.isNew ? ' (new)' : ''}`).join(', ') : '—';
  const year = r.year == null ? '—' : yl(r.year);
  md += `| ${esc(r.section)} | ${esc(r.vol === 1 ? 'I.' + r.page : 'II.' + r.page)} | ${esc(r.quote)} | ${esc(who)} | ${year} | ${esc(r.cmp)} | ${esc(r.st)} |\n`;
}
writeFileSync(join(DATA, 'hales-dates-extract.md'), md);

const created = Object.keys(NEW_PEOPLE).length;
const updated = Object.values(recs).filter((r) => r.dirty && !r.doc.description?.startsWith(MARK)).length;
console.log(`hales: ${tn} statements (${tm} mapped, ${tu} not mapped), ${tc} conflicts; ${created} people created; ${updated} existing records updated; ${wrote} files written.`);
