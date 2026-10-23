#!/usr/bin/env node
// Raleigh, The History of the World (1617, EEBO-TCP A10357), display only.
//   node scripts/raleigh/import.mjs                 # report only
//   node scripts/raleigh/import.mjs --write         # write data/ and the extract
//   node scripts/raleigh/import.mjs --write --until-world 2009
//
// The chronological table at the back is Raleigh's own index. His note "To the Reader"
// (sig. 780b) says it reforms press errors and his own mis-reckonings, and that the
// Julian Period exceeds the yeere of the World by 682. A year cell is accepted only
// when the two printed numbers differ by 682. Nothing is converted to BC.
//
// Reigns and lifespans use his notation: "1." is the first year, and the number at
// the end of the name is the length. Kingdom columns are reigns. A lifespan on a
// patriarch is a birth. Death and translation are taken only from a row label that
// says so. Illegible cells (〈◊〉, ●) are skipped and listed.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const write = process.argv.includes('--write');
const untilIdx = process.argv.indexOf('--until-world');
const UNTIL = untilIdx > 0 ? +process.argv[untilIdx + 1] : Infinity;
const SRC = 'raleigh-history-of-the-world';
const SRC_ID = 'raleigh-history-of-the-world-1617';
const LINK = 'https://texts.earlyprint.org/works/A10357.xml';
const MARK = 'Added from the Raleigh import';
const CITE = (sig) => `Raleigh, The History of the World (1617, EEBO-TCP A10357), Chronological Table, sig. ${sig}`;
const CFAH_NULL = () => ({ source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown', citation: null, link: null, note: 'pending CFAH reference' });

// Biblical persons already in the portal. cham/ham is intentionally absent: the table's
// "Cham" sits under the kings of Egypt, and the portal's Ham is Noah's son.
const ALIAS = {
  adam: 'adam', seth: 'seth', enos: 'enosh', enosh: 'enosh', kenan: 'kenan', cainan: 'kenan',
  mahalaleel: 'mahalalel', mahalalel: 'mahalalel', jared: 'jared', iared: 'jared', iarad: 'jared',
  enoch: 'enoch', henoch: 'enoch', methuselah: 'methuselah', methusaleh: 'methuselah', mathusalem: 'methuselah',
  lamech: 'lamech', noah: 'noah', noe: 'noah', shem: 'shem', sem: 'shem',
  japheth: 'japheth', iaphet: 'japheth', iapheth: 'japheth', arphaxad: 'arphaxad', arphaxat: 'arphaxad',
  salah: 'salah', sale: 'salah', shelah: 'salah', eber: 'eber', heber: 'eber', peleg: 'peleg', phaleg: 'peleg',
  reu: 'reu', rehu: 'reu', serug: 'serug', sarug: 'serug', nahor: 'nahor', nachor: 'nahor', terah: 'terah', thare: 'terah',
  abraham: 'abraham', abram: 'abraham', isaac: 'isaac', isahac: 'isaac', jacob: 'jacob', iacob: 'jacob',
  joseph: 'joseph', ioseph: 'joseph', moses: 'moses', moyses: 'moses', aaron: 'aaron',
  david: 'david', dauid: 'david', solomon: 'solomon', salomon: 'solomon', saul: 'saul',
  samuel: 'samuel', nimrod: 'nimrod',
  nabuchodonosor: 'nebuchadnezzar-ii', 'nabuchodonosor the great': 'nebuchadnezzar-ii',
  hezekiah: 'hezekiah', ezechias: 'hezekiah', ezekias: 'hezekiah', ezekia: 'hezekiah',
  jehu: 'jehu', iehu: 'jehu', leroboam: 'jeroboam-i',
};
// "1. Name LENGTH" is a birth only for these. Kings and Nimrod are not in this set.
const NOT_PATRIARCH = new Set(['nabuchodonosor', 'nabuchodonosor the great', 'hezekiah', 'ezechias', 'ezekias', 'ezekia', 'jehu', 'iehu', 'leroboam', 'david', 'dauid', 'solomon', 'salomon', 'saul', 'samuel', 'nimrod']);
const PATRIARCH = new Set(Object.keys(ALIAS).filter((k) => !NOT_PATRIARCH.has(k)));
// Printed spellings that must not be forced onto a different portal id.
const REFUSE = new Set(['iudai']);
const BIRTH_EVENT = { abraham: 'abraham-birth', isaac: 'isaac-birth', moses: 'moses-birth' };
const KINGDOM = /assyria|egypt|aegypt|sicyon|argiu|argive|athens|latine|israel|iuda|juda|babylon|persia|mede|macedon|syria|rome|sparta|corinth|tyre|phoenic|sidon|lacedaem|olymp|nabonassar|dynast|kings of|latium/i;

const xml = readFileSync(join(root, 'sources/raleigh/A10357.earlyprint-unadorned.xml'), 'utf8');
const tableStart = xml.indexOf('<div type="chronological_table">');
const tableEnd = xml.indexOf('<div type="index">');
if (tableStart < 0 || tableEnd < tableStart) throw new Error('chronological table not found');
const tableXml = xml.slice(tableStart, tableEnd);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const plain = (raw) => decode(raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
// Braces in this XML mark expanded suspensions (Bel{us} = Belus). They are not part of the name.
const norm = (s) => s.replace(/[{}]/g, '').replace(/ˉ/g, 'm').replace(/[●◊〈〉]/g, '').replace(/\./g, ' ').replace(/[^A-Za-z\s-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const tight = (s) => norm(s).replace(/\s+/g, '');
const slug = (s) => norm(s).replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const illegible = (s) => /[●◊〈]/.test(s);
const cleanName = (s) => s.replace(/[.{]+$/g, '').replace(/\s+/g, ' ').trim();
// "4 1. Name, 17." / "1. Name 17" / "1 Name. 17" / "1. Nim rod. 114"
const NAMED = /^(?:(\d+)\s+)?1\.?\s+([^,\d][^,]{0,80}?)(?:,\s*|\s*)?\.?\s+(\d{1,4})\.?\s*$/;
const NAMED_NOLEN = /^(?:(\d+)\s+)?1\.?\s+([A-Za-zˉ][A-Za-zˉ .'{}\-]{1,40}?)\.?\s*$/;
const DOTNAME = /^\.\s+([A-Za-zˉ][A-Za-zˉ'-]{1,24})\.?\s+(\d{2,4})\.?\s*$/;

function findYear(cells) {
  for (let i = 0; i < cells.length; i++) {
    const t = cells[i];
    let m = t.match(/^(\d{3,4})\s+(\d{1,4})\.\s+(.+?)\s+(\d{1,4})\.?\s*$/);
    if (m && +m[1] - +m[2] === 682 && /[A-Za-zˉ]/.test(m[3])) {
      return { i, julian: +m[1], world: +m[2], extra: null, raw: t, inline: { name: m[3].replace(/\.$/, '').trim(), span: +m[4] } };
    }
    m = t.match(/^(\d{3,4})\s+(\d{1,4})(?:\s+(\S+))?\s*$/);
    if (m && +m[1] - +m[2] === 682 && +m[2] > 0 && +m[2] < 7000) {
      const third = m[3] || '';
      const extra = /^\d{1,4}$/.test(third) ? +third : null;
      return { i, julian: +m[1], world: +m[2], extra, trailing: third && extra == null ? third : '', raw: t };
    }
  }
  return null;
}
function badYear(cells) {
  for (const t of cells) {
    const m = t.match(/^(\d{3,4})\s+(\d{1,4})\b/);
    if (m && +m[1] > 600 && +m[1] - +m[2] !== 682 && +m[2] > 0 && +m[2] < 8000) return t;
  }
  return null;
}
function isKingdom(column) {
  return KINGDOM.test(column || '') && !/patriarch|adam|seth|noah|abraham|isaac|iacob|ioseph|moses/i.test(column || '');
}
function classify(name, span, column, world) {
  const n = norm(name);
  const key = tight(name);
  if (isKingdom(column)) return 'reign';
  if (key === 'cham' || key === 'ham') return null;
  if ((PATRIARCH.has(n) || PATRIARCH.has(key)) && !(key === 'cainan' && world > 1656)) return 'birth';
  if (span != null && span >= 200) return 'birth';
  if (span != null && span < 100) return 'reign';
  return null;
}
function headingCell(text) {
  if (!text || /\d/.test(text) || /^1[. ]/.test(text)) return false;
  if (/^kings of /i.test(text)) return true;
  return text.length < 48 && KINGDOM.test(text);
}

const rows = [];
let sig = '781b';
let cur = null;
const re = /<pb n="([^"]+)"|<row>|<\/row>|<cell\b[^>]*>([\s\S]*?)<\/cell>/g;
let m;
while ((m = re.exec(tableXml))) {
  if (m[1]) { sig = m[1]; continue; }
  if (m[0] === '<row>') { cur = []; continue; }
  if (m[0] === '</row>') { if (cur) rows.push({ sig, cells: cur }); cur = null; continue; }
  if (cur) cur.push(plain(m[2]));
}

let headers = [];
let colTitles = [];
const statements = [];
const skipped = [];
const fullNameCols = new Map();
let logging = true;
const skip = (reason, detail) => { if (logging) skipped.push({ reason, detail }); };

for (const row of rows) {
  const cells = row.cells.map((c) => c.replace(/\u00a0/g, ' ').trim()).map((c) => c === '' ? '' : c);
  if (cells.every((c) => !c)) continue;
  const year = findYear(cells);
  const headerish = cells.some((c) => /Iulian|Julian/i.test(c));
  if (headerish && !year) {
    headers = cells;
    colTitles = [];
    for (const text of cells) {
      if (text && (NAMED.test(text) || DOTNAME.test(text) || NAMED_NOLEN.test(text))) {
        skip('named cell on a heading row with no yeere of the World', `${row.sig}: ${text}`);
      }
    }
    continue;
  }
  if (!year) {
    const bad = badYear(cells);
    if (bad) skipped.push({ reason: 'year cell does not follow Julian = World + 682', detail: `${row.sig}: ${bad} | ${cells.filter(Boolean).slice(0, 3).join(' / ')}` });
    continue;
  }
  logging = year.world <= UNTIL;
  const eraHead = (headers[year.i] || '').split('.').map((s) => s.trim()).filter(Boolean);
  const eraNote = year.extra != null && eraHead[2] ? `The third printed figure ${year.extra} is the column "${eraHead[2]}", not a length.` : '';
  const trailNote = year.trailing ? `The year cell continues "${year.trailing}", which is not a clean figure and is not used.` : '';
  const baseNote = `Year cell "${year.raw}". ${eraNote} ${trailNote} To the Reader (sig. 780b): the Julian Period exceeds the yeere of the World by 682.`.replace(/\s+/g, ' ').trim();
  const columnAt = (i) => (headers[i] || colTitles[i] || '').replace(/\s+/g, ' ').trim();

  const pushStmt = (st) => {
    if (st.name) {
      const set = fullNameCols.get(tight(st.name)) || new Set();
      set.add(norm(st.column || ''));
      fullNameCols.set(tight(st.name), set);
    }
    if (logging) statements.push({ ...st, sig: row.sig, world: year.world, julian: year.julian, yearRaw: year.raw, baseNote });
  };

  if (year.inline && !illegible(year.inline.name)) {
    const kind = classify(year.inline.name, year.inline.span, '', year.world) || 'birth';
    pushStmt({ kind, name: year.inline.name, span: year.inline.span, quote: year.raw, column: 'year cell', form: 'lifespan' });
  }

  cells.forEach((text, i) => {
    if (!text || i === year.i) return;
    const column = columnAt(i) || '(no column title)';
    if (illegible(text)) {
      if (/[A-Za-z]/.test(text) && /(?:^|\s)1[. ]/.test(text) && text.length < 80) {
        skip('illegible name or length', `${row.sig} World ${year.world}: ${text}`);
        return;
      }
      if ((i === 0 || text.length > 12) && /[A-Za-z]{3,}/.test(text)) {
        pushStmt({ kind: 'label', quote: text.length > 500 ? text.slice(0, 500) : text, column: 'row label' });
      }
      return;
    }
    if (headingCell(text)) { colTitles[i] = text; return; }
    const named = text.match(NAMED);
    if (named) {
      const name = cleanName(named[2]);
      const span = +named[3];
      if (!/[A-Za-z]/.test(name) || tight(name).length < 3) { skip('name too short', `${row.sig} World ${year.world}: ${text}`); return; }
      if (/\b(and|or)\b/i.test(name)) { skip('two names share one printed length', `${row.sig} World ${year.world}: ${text}`); return; }
      const kind = classify(name, span, column, year.world);
      if (!kind) { skip('birth or reign unclear', `${row.sig} World ${year.world} col "${column}": ${text}`); return; }
      pushStmt({ kind, name, span, quote: text, column, form: kind === 'reign' ? 'reign' : 'lifespan' });
      return;
    }
    const dotted = text.match(DOTNAME);
    if (dotted) {
      const name = cleanName(dotted[1]);
      const span = +dotted[2];
      const kind = classify(name, span, column, year.world);
      if (!kind) { skip('birth or reign unclear', `${row.sig} World ${year.world} col "${column}": ${text}`); return; }
      pushStmt({ kind, name, span, quote: text, column, form: 'no-one' });
      return;
    }
    const nolen = text.match(NAMED_NOLEN);
    if (nolen) {
      const name = cleanName(nolen[2]);
      const kind = classify(name, null, column, year.world);
      if (kind !== 'birth') { skip('name without a printed length', `${row.sig} World ${year.world} col "${column}": ${text}`); return; }
      pushStmt({ kind: 'birth', name, span: null, quote: text, column, form: 'nolength' });
      return;
    }
    if (/^(?:\d+\s+)?1[. ]/.test(text)) { skip('named cell is not a single printed length', `${row.sig} World ${year.world} col "${column}": ${text.slice(0, 180)}`); return; }
    if (i === 0 || (/[A-Za-z]{3,}/.test(text) && text.length > 12 && !/^\d/.test(text))) {
      pushStmt({ kind: 'label', quote: text.length > 500 ? text.slice(0, 500) : text, column: column === '(no column title)' ? 'row label' : column });
    }
  });
}

// ---- load records
const recs = {};
for (const dir of ['events', 'people', 'locations']) {
  for (const f of readdirSync(join(DATA, dir)).filter((f) => f.endsWith('.json'))) {
    const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8'));
    recs[doc.id] = { dir, doc };
  }
}
const byNorm = new Map();
const addKey = (key, id) => { if (!key) return; const a = byNorm.get(key) || []; if (!a.includes(id)) a.push(id); byNorm.set(key, a); };
for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type !== 'person') continue;
  addKey(norm(r.doc.title), id);
  addKey(norm(id.replace(/-/g, ' ')), id);
  for (const a of r.doc.alt_names || []) addKey(norm(a), id);
}

function resolvePerson(name, world) {
  const n = norm(name);
  const key = tight(name);
  if (!n || key.length < 3) return { skip: `short name "${name}"` };
  if (REFUSE.has(key)) return { skip: `printed "${name}" is not attached to a different portal id` };
  const alias = (key === 'cainan' && world > 1656) ? null : (ALIAS[n] || ALIAS[key]);
  if (alias && recs[alias]) return { id: alias };
  const hits = (byNorm.get(n) || byNorm.get(key) || []).filter((id) => recs[id]?.doc.type === 'person' && !recs[id].doc.description?.startsWith(MARK));
  if (hits.length === 1) return { id: hits[0] };
  if (hits.length > 1) return { skip: `ambiguous name "${name}" (${hits.join(', ')})` };
  const id = slug(name);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return { skip: `unusable name "${name}"` };
  if (recs[id] && recs[id].doc.type !== 'person') return { skip: `"${name}" collides with ${recs[id].doc.type} ${id}` };
  if (recs[id] && !recs[id].doc.description?.startsWith(MARK) && norm(recs[id].doc.title) !== n) return { skip: `"${name}" collides with existing person ${id} (${recs[id].doc.title})` };
  const title = name.replace(/[{}]/g, '').replace(/ˉ/g, 'm').replace(/\s+/g, ' ').trim();
  return { create: id, title };
}

function deathWho(raw, world) {
  const stripped = raw.replace(/\s+(his|her|the)\b[\s\S]*$/i, '').replace(/\.\s*$/, '').trim();
  let who = resolvePerson(stripped, world);
  if (who.id) return who;
  const first = stripped.split(/\s+/)[0];
  if (first && tight(first) !== tight(stripped)) {
    who = resolvePerson(first, world);
    if (who.id) return who;
  }
  if (tight(first || stripped) === 'sarai') return { create: 'sarai', title: 'Sarai' };
  return { skip: who.skip || `death of ${stripped} has no existing person` };
}

function eventForLabel(quote) {
  const q = quote.trim();
  if (/^(the )?(generall )?floud\.?$/i.test(q) && recs['the-flood']) return 'the-flood';
  if (/^(henoch|enoch)\s+translated\.?$/i.test(q) && recs['enoch-translated']) return 'enoch-translated';
  if (/^(the )?passeouer\.?$/i.test(q) && recs.exodus) return 'exodus';
  if (/\bisaac\b/i.test(q) && /\bborne\b/i.test(q) && recs['isaac-birth']) return 'isaac-birth';
  if (/\b(abraham|abram)\b/i.test(q) && /\b(borne|birth|natus)\b/i.test(q) && recs['abraham-birth']) return 'abraham-birth';
  if (/\bmoses\b/i.test(q) && /\bborne\b/i.test(q) && recs['moses-birth']) return 'moses-birth';
  if (/\bmidian\b/i.test(q) && /\b(moses|flyes|fled|flight)\b/i.test(q) && recs['moses-flees-to-midian']) return 'moses-flees-to-midian';
  return null;
}

function clauses(quote) {
  return quote.split(/(?<=\.)\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
}
function deathName(c) {
  let m = c.match(/^([A-Za-zˉ][A-Za-zˉ .'-]{0,50}?)\s+(dyed|died|dieth|dyes)\b/i);
  if (m) return m[1].replace(/\.\s*$/, '').trim();
  m = c.match(/\blast yeere of\s+([A-Za-zˉ][A-Za-zˉ'-]+)/i);
  if (m) return m[1];
  m = c.match(/\bthe last of\s+([A-Za-zˉ][A-Za-zˉ'-]+)/i);
  if (m) return m[1];
  m = c.match(/\bthe death of\s+([A-Z][A-Za-zˉ'-]+)/i);
  if (m) return m[1];
  return null;
}

logging = true;
const planned = [];
for (const st of statements) {
  if (st.kind === 'birth' || st.kind === 'reign') {
    const who = resolvePerson(st.name, st.world);
    if (who.skip) { skip(who.skip, `${st.sig} World ${st.world}: ${st.quote}`); continue; }
    const slot = st.kind === 'reign' ? 'reign' : 'birth';
    planned.push({ ...st, slot, who, eventId: slot === 'birth' && who.id && BIRTH_EVENT[who.id] ? BIRTH_EVENT[who.id] : null });
    continue;
  }
  let used = false;
  for (const c of clauses(st.quote)) {
    if (illegible(c)) { skip('illegible row label', `${st.sig} World ${st.world}: ${c.slice(0, 160)}`); continue; }
    const dn = deathName(c);
    if (dn) {
      const who = deathWho(dn, st.world);
      const soft = /\bthe last of\b/i.test(c) && !/\b(last yeere of|dyed|died|dieth|dyes)\b/i.test(c);
      if (who.id || who.create === 'sarai') {
        planned.push({ ...st, slot: 'death', who, quote: c, eventId: null, form: 'death' });
        used = true;
        continue;
      }
      if (!soft) { skip(who.skip || `death of ${dn} has no existing person`, `${st.sig} World ${st.world}: ${c.slice(0, 180)}`); used = true; continue; }
    }
    const began = c.match(/^([A-Za-zˉ][A-Za-zˉ'-]{2,30})\s+began\b/);
    if (began) {
      const who = resolvePerson(began[1], st.world);
      if (who.id) {
        planned.push({ ...st, slot: 'reign', who, quote: c, span: null, eventId: null, form: 'began' });
        used = true;
        continue;
      }
    }
    const tm = c.match(/^([A-Za-zˉ][A-Za-zˉ .'-]{0,40}?)\s+translated\b/i);
    if (tm) {
      const who = resolvePerson(tm[1], st.world);
      if (who.skip || who.create) { skip(who.skip || `translation of ${tm[1]} has no existing person`, `${st.sig} World ${st.world}: ${c}`); }
      else planned.push({ ...st, slot: 'translated', who, quote: c, eventId: eventForLabel(c), form: 'translated' });
      used = true;
      continue;
    }
    const ev = eventForLabel(c);
    if (ev) { planned.push({ ...st, slot: null, who: null, quote: c, eventId: ev, form: 'event' }); used = true; }
  }
  if (!used && !illegible(st.quote)) skip('row label not a death, translation, or a portal event', `${st.sig} World ${st.world}: ${st.quote.slice(0, 180)}`);
}

// The same printed name in two kingdom columns is two people (Apis of Sicyon, Apis of Argos).
// Columns are counted across the whole table, so an id does not change when a later slice is added.
for (const p of planned) {
  if (!p.who?.create) continue;
  const cols = fullNameCols.get(tight(p.who.title)) || fullNameCols.get(tight(p.name || '')) || new Set();
  if (cols.size < 2) continue;
  const suf = slug(p.column || 'column').slice(0, 28) || 'column';
  p.who = { create: `${slug(p.who.title)}-of-${suf}`, title: p.who.title, column: p.column };
}

// de-duplicate identical targets
const seen = new Set();
const unique = [];
for (const p of planned) {
  const key = `${p.who?.id || p.who?.create || p.eventId}|${p.slot}|${p.world}|${p.quote}`;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(p);
}

const createdNames = new Map();
for (const p of unique) if (p.who?.create) createdNames.set(p.who.create, p.who.title);

const byReason = {};
for (const s of skipped) (byReason[s.reason] ||= []).push(s.detail);

const summary = {
  until: UNTIL,
  tableRows: rows.length,
  statements: statements.length,
  planned: unique.length,
  newPeople: createdNames.size,
  skipped: skipped.length,
  skipReasons: Object.fromEntries(Object.entries(byReason).map(([k, v]) => [k, v.length])),
};
console.log(JSON.stringify(summary, null, 2));
writeFileSync('/tmp/raleigh-skipped.txt', Object.entries(byReason).map(([k, v]) => `\n## ${k} (${v.length})\n` + v.slice(0, 40).join('\n')).join('\n'));
writeFileSync('/tmp/raleigh-planned.json', JSON.stringify(unique.map((p) => ({
  world: p.world, slot: p.slot, person: p.who?.id || (p.who?.create ? `NEW:${p.who.create}` : null), event: p.eventId, quote: p.quote, sig: p.sig, column: p.column, span: p.span,
})), null, 2));

if (!write) {
  console.log('Dry run. Samples of new people:', [...createdNames.entries()].slice(0, 25).map(([id, t]) => `${id} (${t})`).join('; '));
  process.exit(0);
}

// ---- write
const sortBefore = new Map();
for (const [id, r] of Object.entries(recs)) {
  if (r.doc.description?.startsWith(MARK)) continue;
  if (r.doc.sorting_year !== undefined) sortBefore.set(id, JSON.stringify({ y: r.doc.sorting_year, b: r.doc.sorting_basis }));
}
const original = new Map();
for (const [id, r] of Object.entries(recs)) original.set(id, JSON.stringify(r.doc));
const stale = [];
for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type === 'person' && r.doc.description?.startsWith(MARK)) {
    const dated = Object.values(r.doc.dates || {}).flat().some((e) => e.cfah_key && e.date);
    if (!dated) { stale.push(join(DATA, 'people', `${id}.json`)); delete recs[id]; }
  }
}
for (const r of Object.values(recs)) {
  const d = r.doc;
  const lists = d.type === 'event' ? [d.chronologies] : d.type === 'person' ? Object.values(d.dates || {}) : [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].source !== SRC) continue;
      const y = list[i].year_am;
      if (y == null || y <= UNTIL) list.splice(i, 1);
    }
  }
}

function ensurePerson(who) {
  if (who.id && recs[who.id]) return who.id;
  const id = who.create || who.id;
  if (!id) throw new Error(`Raleigh person has no id for ${who.title || '(no title)'}`);
  if (recs[id]) return id;
  const title = who.title;
  recs[id] = { dir: 'people', doc: {
    $schema: '../../schema/person.schema.json', id, type: 'person', title,
    summary: `${title} is dated in Raleigh's chronological table (1617)${who.column && who.column !== 'row label' && who.column !== 'year cell' ? `, column ${who.column.replace(/\.$/, '')}` : ''}, by a yeere of the World. No tier 1–4 chronology dates this person.`,
    description: `${MARK} (The History of the World, 1617). Raleigh is display-only. He gives a yeere of the World, not a BC year, and no tier 1–4 chronology dates this person, so there is no sort year.`,
    sorting_year: null,
    sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year. Raleigh is display-only and is not converted to BC.' },
    father: null, children: [],
    dates: { birth: [CFAH_NULL()], death: [CFAH_NULL()] },
    events: [], scripture_refs: [], sources: [], related: [], free_source_links: [],
  } };
  return id;
}

function addSrc(doc, sig) {
  doc.sources ||= [];
  if (!doc.sources.includes(SRC_ID)) doc.sources.push(SRC_ID);
  doc.free_source_links ||= [];
  const locator = `Chronological Table, sig. ${sig}`;
  if (!doc.free_source_links.some((l) => l.source_id === SRC_ID && l.locator === locator)) {
    doc.free_source_links.push({ source_id: SRC_ID, url: LINK, locator });
  }
}
function addTo(doc, slot, entry) {
  if (doc.type === 'event') { doc.chronologies.push(entry); return; }
  const list = doc.dates[slot] || (doc.dates[slot] = [CFAH_NULL()]);
  if (!list.some((e) => e.source === 'cfah')) list.unshift(CFAH_NULL());
  if (list.some((e) => e.source === SRC && e.date === entry.date && e.year_am === entry.year_am)) return;
  list.push(entry);
}

// Narrative sentences checked against the unadorned XML. A sentence is added only when
// it is his own figure and it names the same yeere as the table. A differing sentence
// is quoted in the note and is not given a second year_am.
const PROSE = [
  { quote: 'The generall Floud was in the yeere of the World 1656.', year: 1656, cite: 'Book I, ch. VII, §III, sig. 96a', id: 'the-flood', slot: null },
  { quote: 'Iacob was borne in the yeere of the World 2169', year: 2169, cite: 'Book I, ch. VII, §III, sig. 96a', id: 'jacob', slot: 'birth' },
  { quote: 'which happened in the yeere of the World, 2009.', year: 2009, cite: 'Book II, ch. I, §VIII, sig. 164a', id: 'abraham', slot: 'birth', also: 'abraham-birth' },
  { quote: 'Moses was borne in the yeere of the World 2434.', year: 2434, cite: 'Book II, ch. IIII, §I, sig. 184a', id: 'moses', slot: 'birth', also: 'moses-birth' },
];
const PROSE_NOTES = [
  { year: 2009, id: 'abraham', slot: 'birth', must: 'An. mundi 2008 dil. 352. natus Abraham', text: 'The same section (Book II, ch. I, §VIII, sig. 164a) also prints "An. mundi 2008 dil. 352. natus Abraham, Eus. Aug. de Ciuit. Dei", introduced with "I conclude" and naming Eusebius and Augustine. The narrative sentence and the chronological table both print 2009. The 2008 is not given a second year.' },
  { year: 1758, id: 'peleg', slot: 'birth', must: 'yeere of the World 1757. or 1758.', text: 'Book I, sig. 113a says the division "was( if the diuision were made at Phalegs birth) in the yeere of the World 1757. or 1758." The table cell entered is the row at World 1758. 1757 is not entered as a second year.' },
  { year: 2473, id: 'moses-flees-to-midian', slot: null, must: 'in the yeere of the World 2474.', text: 'The narrative (Book II, ch. IIII, §I, sig. 184a) says "in the yeere of the World 2474." The chronological table prints this flight at World 2473. The table figure is the one entered.' },
  { year: 2514, id: 'exodus', slot: null, must: 'or after our account, 2513.', text: 'Book II, ch. III, §I, sig. 174a prints "2514. to Codoman, or after our account, 2513." Book II, ch. IIII, §I, sig. 184a prints the Passover "in the yeere of the World 2514." The table row entered is "The Passeouer." at World 2514. 2513 is not given a second year.' },
  { year: 2553, id: 'moses', slot: 'death', must: 'yeere of the World 25 54', text: 'Book II, sig. 206b prints "which happened in the yeere of the World 25 54", with a space in the figures. That spaced figure is not entered as a year. The table row entered is "The Last yeere of Moses." at World 2553.' },
];
function proseCite(cite) {
  return `Raleigh, The History of the World (1617, EEBO-TCP A10357), ${cite}`;
}
function applyProse() {
  for (const p of PROSE) {
    if (p.year > UNTIL) continue;
    if (!xml.includes(p.quote)) throw new Error(`prose quote not in the 1617 XML: ${p.quote}`);
    const entry = {
      source: SRC, date: p.quote, year_am: p.year, year_bc_ad: null, precision: 'year',
      citation: proseCite(p.cite), link: LINK, source_text_id: SRC_ID,
      note: 'Narrative sentence. The chronological table prints the same yeere of the World. To the Reader (sig. 780b): the Julian Period exceeds the yeere of the World by 682. No BC conversion.',
    };
    for (const id of [p.id, p.also].filter(Boolean)) {
      const rec = recs[id];
      if (!rec) throw new Error(`prose target missing: ${id}`);
      addTo(rec.doc, p.slot, entry);
      addSrc(rec.doc, p.cite.match(/sig\. (\S+)/)?.[1] || '96a');
    }
  }
  for (const n of PROSE_NOTES) {
    if (n.year > UNTIL) continue;
    if (!xml.includes(n.must)) throw new Error(`prose note anchor not in the 1617 XML: ${n.must}`);
    const rec = recs[n.id];
    if (!rec) continue;
    const list = n.slot ? rec.doc.dates?.[n.slot] : rec.doc.chronologies;
    const e = (list || []).find((x) => x.source === SRC && x.year_am === n.year);
    if (e && !e.note.includes(n.text)) e.note = `${e.note} ${n.text}`;
  }
}

const extractRows = [];
for (const p of unique) {
  const precision = /about/i.test(p.quote) ? 'approximate' : 'year';
  const lengthNote = p.form === 'reign' && p.span != null
    ? `The ${p.span} at the end of the name is the reign length he prints. The end year is not printed on this row.`
    : p.form === 'lifespan' && p.span != null
      ? `The ${p.span} at the end of the name is the lifespan he prints.`
      : p.form === 'no-one' && p.span != null
        ? `The ${p.span} at the end of the name is the lifespan he prints. The cell does not print the "1." he uses elsewhere to mark a first year.`
        : p.form === 'nolength'
          ? 'The cell prints "1." and the name, and no length.'
          : p.form === 'began'
            ? 'The cell says the reign began and prints no length.'
            : '';
  const note = [p.baseNote, lengthNote, isKingdom(p.column) ? `Column: ${p.column}.` : null].filter(Boolean).join(' ');
  const date = p.quote;
  const entry = { source: SRC, date, year_am: p.world, year_bc_ad: null, precision, citation: CITE(p.sig), link: LINK, source_text_id: SRC_ID, note };
  const targets = [];
  if (p.who) {
    if (!p.who.column) p.who.column = p.column;
    const id = ensurePerson(p.who);
    addTo(recs[id].doc, p.slot, entry);
    addSrc(recs[id].doc, p.sig);
    targets.push(id + (p.slot ? `:${p.slot}` : ''));
    if (p.eventId && recs[p.eventId]) {
      addTo(recs[p.eventId].doc, null, entry);
      addSrc(recs[p.eventId].doc, p.sig);
      targets.push(p.eventId);
      const person = recs[id].doc;
      const ev = recs[p.eventId].doc;
      if (person.events && !person.events.includes(p.eventId)) person.events.push(p.eventId);
      if (ev.people && !ev.people.includes(id)) ev.people.push(id);
    }
  } else if (p.eventId && recs[p.eventId]) {
    addTo(recs[p.eventId].doc, null, entry);
    addSrc(recs[p.eventId].doc, p.sig);
    targets.push(p.eventId);
  }
  extractRows.push({ world: p.world, sig: p.sig, quote: p.quote, targets, slot: p.slot });
}
applyProse();

// lifespan printed at birth vs a later death year in the same table
for (const [id, r] of Object.entries(recs)) {
  if (r.doc.type !== 'person') continue;
  const b = (r.doc.dates.birth || []).find((e) => e.source === SRC && e.year_am != null);
  const span = b?.note?.match(/The (\d+) at the end of the name is the lifespan/)?.[1];
  if (!b || !span) continue;
  for (const [which, list] of [['death', r.doc.dates.death], ['translation', r.doc.dates.translated]]) {
    const d = (list || []).find((e) => e.source === SRC && e.year_am != null);
    if (d && b.year_am + +span !== d.year_am) {
      const extra = `His table also prints the ${which} at World ${d.year_am}. ${b.year_am} + ${span} is not ${d.year_am}. Both figures are left as printed.`;
      if (!b.note.includes(extra)) b.note = `${b.note} ${extra}`;
    }
  }
}

for (const [id, snap] of sortBefore) {
  const d = recs[id]?.doc;
  if (!d) throw new Error(`existing record ${id} disappeared`);
  const now = JSON.stringify({ y: d.sorting_year, b: d.sorting_basis });
  if (now !== snap) throw new Error(`sort changed on ${id}`);
}

function pruneSources(doc) {
  const all = [...(doc.chronologies || []), ...Object.values(doc.dates || {}).flat()];
  for (const sid of ['raleigh-history-of-the-world-1736', SRC_ID]) {
    if (all.some((e) => e.source_text_id === sid)) continue;
    if (Array.isArray(doc.sources)) doc.sources = doc.sources.filter((s) => s !== sid);
    if (Array.isArray(doc.free_source_links)) doc.free_source_links = doc.free_source_links.filter((l) => l.source_id !== sid);
  }
}
for (const r of Object.values(recs)) pruneSources(r.doc);
for (const [id, r] of Object.entries(recs)) {
  if (JSON.stringify(r.doc) === original.get(id)) continue;
  const text = JSON.stringify(r.doc, null, 2) + '\n';
  const path = join(DATA, r.dir, `${id}.json`);
  if (!existsSync(path) || readFileSync(path, 'utf8') !== text) writeFileSync(path, text);
}
for (const path of stale) {
  const id = path.split('/').pop().replace(/\.json$/, '');
  if (!recs[id] && existsSync(path)) unlinkSync(path);
}

extractRows.sort((a, b) => a.world - b.world || a.quote.localeCompare(b.quote));
const lines = [];
lines.push('# Raleigh, *The History of the World* (1617) — dates');
lines.push('');
lines.push('Edition read: London, printed by William Stansby for Walter Burre, 1617. EEBO-TCP A10357, EarlyPrint unadorned XML (`sources/raleigh/A10357.earlyprint-unadorned.xml`). Display only. No BC conversion.');
lines.push('');
lines.push('The chronological table (back matter, from sig. 781b) is Raleigh\'s index. "To the Reader" (sig. 780b) says it reforms press errors and his own mis-reckonings, and that the Julian Period exceeds the yeere of the World by 682. A year is recorded only when the printed pair differs by 682.');
lines.push('');
lines.push(`Statements written: ${extractRows.length}. New people: ${createdNames.size}. Skipped figures: ${skipped.length}. Cut-off (yeere of the World): ${Number.isFinite(UNTIL) ? UNTIL : 'none'}.`);
lines.push('');
lines.push('| World | Sig. | Quote | Record |');
lines.push('|---|---|---|---|');
for (const e of extractRows) {
  const q = e.quote.replace(/\|/g, '/').replace(/\n/g, ' ');
  lines.push(`| ${e.world} | ${e.sig} | ${q} | ${e.targets.join(', ') || '—'} |`);
}
lines.push('');
lines.push('## Skipped');
lines.push('');
for (const [reason, details] of Object.entries(byReason)) {
  lines.push(`### ${reason} (${details.length})`);
  lines.push('');
  for (const d of details) lines.push(`- ${d.replace(/\|/g, '/')}`);
  lines.push('');
}
writeFileSync(join(DATA, 'raleigh-dates-extract.md'), lines.join('\n'));

const log = [];
log.push('# Raleigh pass log');
log.push('');
log.push(`Imported from the 1617 chronological table${Number.isFinite(UNTIL) ? `, through the yeere of the World ${UNTIL}` : ''}. Raleigh is display-only. No sorting year was changed.`);
log.push('');
log.push(`- Records updated or created with a Raleigh entry: ${new Set(extractRows.flatMap((e) => e.targets.map((t) => t.split(':')[0]))).size}`);
log.push(`- Dated statements written: ${extractRows.length}`);
log.push(`- People created: ${createdNames.size}`);
log.push(`- Figures skipped: ${skipped.length}`);
log.push('');
log.push('## People created');
log.push('');
if (!createdNames.size) log.push('None.');
else for (const [id, title] of [...createdNames.entries()].sort((a, b) => a[0].localeCompare(b[0]))) log.push(`- \`${id}\` — ${title}`);
log.push('');
log.push('## Skipped, by reason');
log.push('');
for (const [reason, n] of Object.entries(summary.skipReasons)) log.push(`- ${reason}: ${n}`);
log.push('');
log.push('Every skipped figure is quoted in `data/raleigh-dates-extract.md`.');
log.push('');
writeFileSync(join(root, 'docs/raleigh-pass-log.md'), log.join('\n'));
console.log('Wrote', extractRows.length, 'statements;', createdNames.size, 'new people');
