#!/usr/bin/env node
// Build data/name-forms.json from two readings:
//   1. STEPBible TIPNR (CC BY 4.0), a local download that is not committed.
//      Default path: /tmp/tipnr.txt, or $TIPNR.
//      The file asked not to be reposted. This script keeps only the name
//      forms attached to a person, with the individual id and the first verse.
//   2. Spellings already printed inside a history passage stored on the person
//      (Raleigh, Josephus, Herodotus, Ussher, Clonmacnoise, Cory).
// A form is written only when the letters were read in that source.
// Uncertain TIPNR rows (the id contains "(?)") are not attached.
//
// Usage: node scripts/names/build-forms.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS, bookId, blbFromOsis } from '../blb.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const tipnrPath = process.env.TIPNR || '/tmp/tipnr.txt';
if (!existsSync(tipnrPath)) {
  console.error(`TIPNR file not found at ${tipnrPath}. Download is not committed. Set TIPNR or place the file at /tmp/tipnr.txt.`);
  process.exit(1);
}

const people = readdirSync(join(root, 'data/people')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(root, 'data/people', f), 'utf8')));
const byId = Object.fromEntries(people.map((p) => [p.id, p]));
const sources = JSON.parse(readFileSync(join(root, 'data/sources.json'), 'utf8')).sources;
const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));

const HISTORY_CHRON = new Set([
  'raleigh-history-of-the-world', 'josephus', 'herodotus', 'ussher', 'annals-of-clonmacnoise', 'cory',
]);
const STOP = new Set(['egypt', 'ethiopian', 'persia', 'king', 'priest', 'high', 'the', 'and', 'son', 'second', 'first', 'great', 'mede']);

function foldPhrase(s) {
  return String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function phrases(s) {
  const paren = [...String(s).matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
  const stripped = String(s).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const noRank = stripped.replace(/\b(?:the great|[ivx]{1,4}|\d+)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const noThe = noRank.replace(/^the\s+/i, '').trim();
  return [...new Set([String(s).trim(), stripped, noRank, noThe, ...paren].filter(Boolean))];
}
function nameClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && (a + 's' === b || b + 's' === a || a + 'es' === b || b + 'es' === a)) return true;
  return false;
}
function personPhrases(p) {
  return [...new Set([p.title, ...(p.alt_names || [])].flatMap(phrases))];
}

function osisFromTipnr(raw) {
  let s = String(raw).trim().replace(/^LXX\s+/i, '');
  const m = s.match(/^([1-3]?[A-Za-z]+)\.(\d+)(?:\.(\d+))?[a-z]?$/);
  if (!m) return null;
  const id = bookId(m[1]);
  if (!id) return null;
  if (m[3] === '0') return null;
  const osis = m[3] != null ? `${id}.${m[2]}.${m[3]}` : `${id}.${m[2]}`;
  return blbFromOsis(osis) ? osis : null;
}
function expandRef(r) {
  const out = [];
  const m = String(r).match(/^([1-4]?[A-Za-z]+)\.(\d+)\.(\d+)-([1-4]?[A-Za-z]+)\.(\d+)\.(\d+)$/);
  if (!m || m[1] !== m[4]) {
    out.push(String(r).split('-')[0]);
    return out;
  }
  const startC = +m[2], endC = +m[5], startV = +m[3], endV = +m[6];
  if (endC < startC || endC - startC > 4) {
    out.push(`${m[1]}.${startC}.${startV}`);
    return out;
  }
  for (let c = startC; c <= endC; c++) {
    const vFrom = c === startC ? startV : 1;
    const vTo = c === endC ? endV : 40;
    for (let v = vFrom; v <= Math.max(vFrom, vTo); v++) out.push(`${m[1]}.${c}.${v}`);
  }
  return out;
}
function ourRefSet(refs) {
  const out = new Set();
  for (const r of refs || []) for (const one of expandRef(r)) out.add(one);
  return out;
}
function verseLabel(osis) {
  const [b, c, v] = String(osis).split('.');
  const name = BOOKS[b]?.[0] || b;
  return v ? `${name} ${c}:${v}` : `${name} ${c}`;
}
function englishVariants(cell) {
  const out = [];
  for (const part of String(cell || '').split(';')) {
    let s = part.trim();
    const eq = s.indexOf('=');
    if (eq >= 0) s = s.slice(0, eq).trim();
    for (const name of s.split(',')) {
      const n = name.replace(/\s+/g, ' ').trim();
      if (!n || n.includes('[') || n.includes(']')) continue;
      if (!/[A-Za-z]/.test(n)) continue;
      if (/^(esv|kjv|niv)$/i.test(n)) continue;
      out.push(n);
    }
  }
  return out;
}
function originalLetters(cell) {
  const m = String(cell || '').match(/^([HG][0-9]+[A-Z]?)(?:«[^;=]+)?=(.+)$/);
  if (!m) return null;
  const form = m[2].trim();
  if (!form) return null;
  return { strong: m[1], form };
}
function scriptOf(form, significance) {
  const sig = significance.toLowerCase();
  if (/[\u0590-\u05FF]/.test(form)) return sig.includes('aramaic') ? 'aramaic' : 'hebrew';
  if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(form)) return 'greek';
  return null;
}
function keepSig(sig) {
  const s = sig.trim();
  if (/^total$/i.test(s)) return false;
  if (/mentioned/i.test(s)) return false;
  if (/combined/i.test(s)) return false;
  if (/^form \(/i.test(s)) return false;
  return true;
}

// ---------- parse TIPNR persons ----------
const text = readFileSync(tipnrPath, 'utf8');
const individuals = [];
let section = 'skip';
let current = null;
function pushCurrent() {
  if (!current) return;
  if (!current.tipnrId.includes('(?)') && current.forms.length) individuals.push(current);
  current = null;
}
for (const line of text.split(/\r?\n/)) {
  const marker = line.match(/^\$=+\s+(\S+)/);
  if (marker) {
    pushCurrent();
    section = marker[1].toUpperCase().startsWith('PERSON') ? 'person' : 'skip';
    continue;
  }
  if (section !== 'person') continue;
  if (!line.trim() || line.startsWith('@') || line.startsWith('‖')) continue;
  if (line.startsWith('–') || line.startsWith('-')) {
    if (!current) continue;
    const cols = line.replace(/^[–-]\s*/, '').split('\t');
    const sig = (cols[0] || '').trim();
    if (!keepSig(sig)) continue;
    const letters = originalLetters(cols[2] || '');
    if (!letters) continue;
    const refs = cols.slice(4).join(' ').split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    const refOsis = [...new Set(refs.map(osisFromTipnr).filter(Boolean))];
    if (!refOsis.length) continue;
    const english = englishVariants(cols[3] || '');
    const unique = cols[1] || '';
    const alt = unique.includes('|') ? unique.split('|')[0] : '';
    for (const piece of letters.form.split(',').map((s) => s.trim()).filter(Boolean)) {
      const script = scriptOf(piece, sig);
      if (!script) continue;
      if (/[+=«»]/.test(piece)) continue;
      if (script !== 'greek' && /[A-Za-z]/.test(piece)) continue;
      current.forms.push({
        form: piece,
        script,
        strong: letters.strong,
        sig,
        refs: refOsis,
        english,
        lxx: /lxx/i.test(sig),
        variant: /variant/i.test(sig),
      });
    }
    for (const name of [...english, alt]) {
      const f = foldPhrase(name);
      if (f.length >= 2 && !STOP.has(f)) current.names.add(f);
    }
    for (const r of refOsis) current.refs.add(r);
    continue;
  }
  if (!line.includes('\t') || !line.includes('@')) continue;
  pushCurrent();
  const head = line.split('\t')[0];
  const tipnrId = head.split('=')[0].trim();
  if (!tipnrId.includes('@')) { current = null; continue; }
  const primary = tipnrId.split('@')[0].replace(/\|.*$/, '').trim();
  current = { tipnrId, primary, names: new Set(), refs: new Set(), forms: [] };
  const f = foldPhrase(primary);
  if (f.length >= 2 && !STOP.has(f)) current.names.add(f);
}
pushCurrent();

const byRef = new Map();
individuals.forEach((ind, i) => {
  for (const r of ind.refs) {
    if (!byRef.has(r)) byRef.set(r, []);
    byRef.get(r).push(i);
  }
});

const ambiguous = [];
const matched = new Map();
const usedTipnr = new Set();
for (const p of people) {
  const refs = ourRefSet(p.scripture_refs);
  if (!refs.size) continue;
  const want = new Set(personPhrases(p).map(foldPhrase).filter((f) => f.length >= 2 && !STOP.has(f)));
  if (!want.size) continue;
  const cand = new Set();
  for (const r of refs) for (const i of byRef.get(r) || []) cand.add(i);
  const hits = [];
  for (const i of cand) {
    const ind = individuals[i];
    let nameHit = false;
    for (const n of ind.names) for (const w of want) if (nameClose(n, w)) nameHit = true;
    if (!nameHit) continue;
    let overlap = 0;
    for (const r of refs) if (ind.refs.has(r)) overlap++;
    if (overlap > 0) hits.push({ ind, overlap });
  }
  if (!hits.length) continue;
  hits.sort((a, b) => b.overlap - a.overlap || a.ind.tipnrId.localeCompare(b.ind.tipnrId));
  if (hits.length > 1 && hits[0].overlap === hits[1].overlap) {
    ambiguous.push({ id: p.id, title: p.title, options: hits.filter((h) => h.overlap === hits[0].overlap).map((h) => `${h.ind.tipnrId} (${h.overlap})`) });
    continue;
  }
  matched.set(p.id, hits[0].ind);
  usedTipnr.add(hits[0].ind.tipnrId);
}

function bibleCitation(ind, row, english) {
  const kind = row.script === 'greek' ? 'Greek' : row.script === 'aramaic' ? 'Aramaic' : 'Hebrew';
  const verse = verseLabel(row.hit);
  if (english) {
    return `STEPBible TIPNR (CC BY 4.0), individual ${ind.tipnrId}, prints the English “${english}” beside ${kind} ${row.form} (${row.strong}). A verse it lists for this form, which this person record also cites, is ${verse}. The English column is the ESV, with a KJV or NIV difference only where TIPNR prints one.`;
  }
  return `STEPBible TIPNR (CC BY 4.0), individual ${ind.tipnrId}, prints the ${kind} ${row.form} (${row.strong}). A verse it lists for this form, which this person record also cites, is ${verse}.`;
}

const outPeople = [];
const roleRank = { original: 0, rendering: 1, alternate: 2 };
const scriptRank = { hebrew: 0, aramaic: 1, greek: 2, latin: 3 };

for (const p of people) {
  const forms = [];
  const ind = matched.get(p.id);
  if (ind) {
    const hasSemitic = ind.forms.some((f) => f.script === 'hebrew' || f.script === 'aramaic');
    const pageNames = new Set(personPhrases(p).map(foldPhrase));
    const alignNote = pageNames.has(foldPhrase(ind.primary)) ? null : `TIPNR heads this individual “${ind.primary}” (${ind.tipnrId}). The name on this page matches another English form it lists for that same individual.`;
    const cited = ourRefSet(p.scripture_refs);
    const seenLetters = new Set();
    const seenEnglish = new Set();
    for (const row of ind.forms) {
      const hit = row.refs.find((r) => cited.has(r));
      if (!hit) continue;
      if (row.english.length && row.english.every((en) => foldPhrase(en) === 'pharaoh')) continue;
      const key = `${row.script}|${row.form}`;
      if (seenLetters.has(key)) continue;
      seenLetters.add(key);
      row.hit = hit;
      const role = row.script === 'greek' && hasSemitic ? 'rendering' : 'original';
      const notes = [];
      if (alignNote) notes.push(alignNote);
      if (row.lxx) notes.push('TIPNR marks this as an LXX addition, not as the Hebrew of the same verse.');
      if (row.variant) notes.push('TIPNR marks this writing as a manuscript variant.');
      if (role === 'rendering') notes.push('This is the Greek writing of a name TIPNR also records in Hebrew or Aramaic.');
      forms.push({
        form: row.form,
        script: row.script,
        role,
        witness: 'bible',
        citation: bibleCitation(ind, row, null),
        link: blbFromOsis(row.hit),
        source_text_id: 'stepbible-tipnr',
        scripture_ref: row.hit,
        note: notes.length ? notes.join(' ') : null,
      });
      for (const en of row.english) {
        const f = foldPhrase(en);
        if (f.length < 2 || STOP.has(f) || f === 'pharaoh' || seenEnglish.has(f)) continue;
        seenEnglish.add(f);
        forms.push({
          form: en,
          script: 'latin',
          role: 'alternate',
          witness: 'bible',
          citation: bibleCitation(ind, row, en),
          link: blbFromOsis(row.hit),
          source_text_id: 'stepbible-tipnr',
          scripture_ref: row.hit,
          note: null,
        });
      }
    }
  }

  const seenHist = new Set();
  const slots = ['birth', 'death', 'translated', 'reign'];
  const entries = slots.flatMap((k) => (p.dates?.[k] || []).map((e) => ({ ...e, slot: k })));
  for (const e of entries) {
    if (!HISTORY_CHRON.has(e.source) || !e.date || !e.citation || !e.link) continue;
    let sourceId = e.source_text_id;
    if (e.source === 'herodotus') {
      if (!String(e.link).includes('wikisource.org')) continue;
      sourceId = 'herodotus-rawlinson-wikisource';
    }
    const src = sourceById[sourceId];
    if (!src || src.access === 'private-copy') continue;
    const tried = personPhrases(p);
    for (const spelling of tried) {
      const printed = printedForm(e.date, spelling);
      if (!printed) continue;
      const key = `${foldPhrase(printed)}|${sourceId}`;
      if (seenHist.has(key)) continue;
      seenHist.add(key);
      const notes = [];
      if (e.source === 'herodotus' || e.source === 'josephus' || e.source === 'cory') {
        notes.push('The passage is an English translation. The Greek letters of the ancient text are not entered.');
      }
      const base = e.citation.trim();
      const sep = /[.!?]$/.test(base) ? ' ' : '. ';
      forms.push({
        form: printed,
        script: 'latin',
        role: 'alternate',
        witness: 'history',
        citation: `${base}${sep}The passage prints “${printed}”.`,
        link: e.link,
        source_text_id: sourceId,
        note: notes.length ? notes.join(' ') : null,
      });
    }
  }

  const dedup = [];
  const seen = new Set();
  for (const f of forms) {
    const key = [f.form, f.script, f.role, f.witness, f.citation, f.scripture_ref || ''].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(f);
  }
  dedup.sort((a, b) => (roleRank[a.role] - roleRank[b.role]) || (scriptRank[a.script] - scriptRank[b.script]) || a.form.localeCompare(b.form, 'en'));
  if (dedup.length) outPeople.push({ id: p.id, forms: dedup });
}
outPeople.sort((a, b) => a.id.localeCompare(b.id));

function printedForm(quote, spelling) {
  const qWords = normWords(quote);
  const sWords = normWords(spelling).map(foldWord).filter(Boolean);
  if (sWords.length < 1) return null;
  if (STOP.has(sWords.join('')) && sWords.length === 1) return null;
  const folded = qWords.map(foldWord);
  for (let i = 0; i + sWords.length <= folded.length; i++) {
    if (sWords.every((w, k) => folded[i + k] === w && folded[i + k].length > 0)) {
      return qWords.slice(i, i + sWords.length).join(' ');
    }
  }
  return null;
}
function normWords(s) {
  return String(s)
    .replace(/[“”„«»]/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/ˉ/g, 'm')
    .replace(/[^A-Za-z0-9'-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
function foldWord(w) {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const doc = {
  $schema: '../schema/name-forms.schema.json',
  note: 'Each form was read in the cited source. Biblical Hebrew, Aramaic and Greek letters are the forms printed by STEPBible TIPNR (CC BY 4.0), file “Proper Nouns/TIPNR - Translators Individualised Proper Names with all References - STEPBible.org CC BY.txt” in github.com/STEPBible/STEPBible-Data, read 2026-10-24. That file is not copied into this repository. History spellings are letters already printed in a passage stored on the person. No inscription has been entered. TIPNR rows whose individual id contains “(??)” were not used; the file marks those identifications as uncertain.',
  people: outPeople,
};
// The note above must not claim a double question mark. TIPNR uses (?).
doc.note = 'Each form was read in the cited source. Biblical Hebrew, Aramaic and Greek letters are the forms printed by STEPBible TIPNR (CC BY 4.0), file “Proper Nouns/TIPNR - Translators Individualised Proper Names with all References - STEPBible.org CC BY.txt” in github.com/STEPBible/STEPBible-Data, read 2026-10-24. That file is not copied into this repository. History spellings are letters already printed in a passage stored on the person. No inscription has been entered. TIPNR rows whose individual id contains “(?)” were not used; the file marks those identifications as uncertain.';

writeFileSync(join(root, 'data/name-forms.json'), JSON.stringify(doc, null, 2) + '\n');

const withOriginal = outPeople.filter((p) => p.forms.some((f) => f.role === 'original')).length;
const scripturePeople = people.filter((p) => p.scripture_refs?.length);
const unmatched = scripturePeople.filter((p) => !matched.has(p.id)).map((p) => `${p.id}\t${p.title}\t${(p.scripture_refs || []).join(', ')}`);
console.log(JSON.stringify({
  tipnrIndividuals: individuals.length,
  people: people.length,
  withForms: outPeople.length,
  withOriginal,
  scripturePeople: scripturePeople.length,
  scriptureMatched: matched.size,
  ambiguous: ambiguous.length,
  unmatchedScripture: unmatched.length,
}, null, 2));
console.log('\nAMBIGUOUS');
for (const a of ambiguous) console.log(`${a.id}\t${a.title}\t${a.options.join(' || ')}`);
console.log('\nUNMATCHED SCRIPTURE');
for (const line of unmatched) console.log(line);
const suspicious = [];
for (const [id, ind] of matched) {
  const p = byId[id];
  const primary = foldPhrase(ind.primary);
  const ours = personPhrases(p).map(foldPhrase);
  if (!ours.includes(primary)) suspicious.push(`${id}\t${p.title}\t${ind.tipnrId}`);
}
console.log('\nMATCHED ON AN ALTERNATE, NOT THE TIPNR PRIMARY NAME');
for (const line of suspicious) console.log(line);
