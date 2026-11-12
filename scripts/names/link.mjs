// Whole-token person links for the Other people list, and the audit of names that do not resolve.
// Longest name first, so Tubalcain does not match Tubal.
// A token that matches more than one person stays unlinked unless a context rule or
// data/name-link-overrides.json selects one record. The linker does not guess.
//
// Tubal (Kevin, 2026-11-08, N25): in a passage or note about Cain's line, the token
// resolves to tubal-cain. Otherwise it resolves to Japheth's son, tubal.
// Cain's line means the unit is linked to, or uniquely mentions, Lamech the Cainite,
// Zillah, Adah, Naamah, Jubal, Jabal, or Cain. A unit linked to tubal-cain, or that
// uniquely names him Tubalcain or Tubal-cain, is the same line. An ambiguous Lamech
// does not count: two records share that name, and this file will not guess which.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const CAIN_LINE = new Set([
  'lamech-cainite', 'zillah', 'adah', 'naamah', 'jubal', 'jabal', 'cain', 'tubal-cain',
]);

const STOP_WORDS = `
the and that this with from they them their there these those which when where what were was
have hath been being shall will would could should may might must not nor yet all any but for
his her she who whom into upon after before under over such also then than you your our are
had has did its him can now out how why let none both each unto thereof therein hereby
thereby wherein whereof wherefore whoso whose whilst though although while because therefore
however about above below between among through without within against per via else even ever
never still thus here hence thence once again away down off
haue doe doth beene vnto vpon vnder ouer vp vs owne selfe whiche heere neuerthelesse neuer euer
euen downe vntill untill amongst betweene aboue howbeit whilest hir shee hee thee thou thy thine
shalt wast hast art ye doeth whereby whereinto whereunto neither either cannot till until since
betwixt whiles vntill self same very more most some many much only other another
`.split(/\s+/).filter(Boolean);

export function foldPersonToken(s) {
  return String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/v/g, 'u').replace(/j/g, 'i');
}

const STOP = new Set(STOP_WORDS.map(foldPersonToken));

export function personTokens(raw) {
  const tokens = [];
  const re = /\p{L}+/gu;
  const text = String(raw || '');
  let m;
  while ((m = re.exec(text))) {
    const fold = foldPersonToken(m[0]);
    if (fold) tokens.push({ fold, raw: m[0], start: m.index, end: m.index + m[0].length });
  }
  return tokens;
}

function phraseKey(tokens) {
  return tokens.map((t) => t.fold).join(' ');
}

export function foldPhraseKey(raw) {
  return phraseKey(personTokens(raw));
}

function isHistoryName(tok) {
  if (!tok?.raw || tok.fold.length < 3) return false;
  if (STOP.has(tok.fold)) return false;
  if (/^[IVXLCDM]+$/i.test(tok.raw)) return false;
  const first = [...tok.raw][0];
  if (!first || first.toUpperCase() === first.toLowerCase()) return false;
  return first === first.toUpperCase();
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function excerptAround(text, raw) {
  const flat = String(text || '').replace(/\s+/g, ' ').trim();
  const needle = String(raw || '').trim();
  let idx = -1;
  let hitLength = needle.length;
  if (needle) {
    // A hyphen continues the name, so Tubal does not match inside Tubal-cain.
    const re = new RegExp(`(?<![\\p{L}])${escapeRegExp(needle)}(?![\\p{L}-])`, 'iu');
    const found = re.exec(flat);
    if (found) { idx = found.index; hitLength = found[0].length; }
  }
  if (idx < 0) idx = 0;
  const start = Math.max(0, idx - 48);
  const end = Math.min(flat.length, (idx < 0 ? 0 : idx) + Math.max(hitLength, 1) + 48);
  let slice = flat.slice(start, end);
  if (start > 0) slice = `…${slice}`;
  if (end < flat.length) slice = `${slice}…`;
  return slice.replace(/\|/g, '/').replace(/</g, '');
}

export function createNameLinker({ people, nameForms, overrides }) {
  const byId = new Map(people.map((p) => [p.id, p]));
  const byFirst = new Map();
  const add = (id, raw) => {
    const tokens = personTokens(raw);
    if (!tokens.length || (tokens.length === 1 && tokens[0].fold.length < 3)) return;
    const key = tokens[0].fold;
    let list = byFirst.get(key);
    if (!list) { list = []; byFirst.set(key, list); }
    const folds = tokens.map((t) => t.fold);
    if (!list.some((p) => p.id === id && p.n === folds.length && p.tokens.every((t, i) => t === folds[i]))) {
      list.push({ id, tokens: folds, n: folds.length });
    }
  };
  for (const person of people) {
    add(person.id, person.title);
    for (const alt of person.alt_names || []) add(person.id, alt);
    for (const form of nameForms[person.id] || []) {
      if (form.script === 'latin' && form.form) add(person.id, form.form);
    }
    // The record title is one word, Tubalcain. Prose writes Tubal-cain. That is his name, not Japheth's son plus Cain.
    if (person.id === 'tubal-cain') add(person.id, 'Tubal-cain');
  }

  const pins = new Map();
  const pinErrors = [];
  const seenPin = new Set();
  for (const row of overrides?.overrides || []) {
    const key = foldPhraseKey(row.token);
    const id = `${row.unit_id}\n${key}`;
    if (!key) pinErrors.push(`${row.unit_id}: token “${row.token}” has no letters`);
    if (seenPin.has(id)) pinErrors.push(`${row.unit_id}: duplicate pin for “${row.token}”`);
    seenPin.add(id);
    let bucket = pins.get(row.unit_id);
    if (!bucket) { bucket = new Map(); pins.set(row.unit_id, bucket); }
    bucket.set(key, row);
  }

  function matchAt(tokens, i) {
    const list = byFirst.get(tokens[i].fold);
    if (!list) return { n: 0, ids: [] };
    let best = 0;
    const hits = [];
    for (const phrase of list) {
      if (phrase.n < best || i + phrase.n > tokens.length) continue;
      let ok = true;
      for (let k = 0; k < phrase.n; k += 1) if (tokens[i + k].fold !== phrase.tokens[k]) { ok = false; break; }
      if (!ok) continue;
      if (phrase.n > best) { best = phrase.n; hits.length = 0; }
      hits.push(phrase.id);
    }
    return { n: best, ids: [...new Set(hits)] };
  }

  function cainSignals(unit, tokens) {
    const hits = [];
    for (const id of unit.linkedIds || []) {
      if (CAIN_LINE.has(id)) hits.push(`linked to ${id}`);
    }
    for (let i = 0; i < tokens.length; i += 1) {
      const match = matchAt(tokens, i);
      if (!match.n) continue;
      const bareTubal = match.n === 1 && tokens[i].fold === 'tubal';
      if (!bareTubal && match.ids.length === 1 && CAIN_LINE.has(match.ids[0])) {
        const printed = tokens.slice(i, i + match.n).map((t) => t.raw).join(' ');
        hits.push(`mentions ${printed} (${match.ids[0]})`);
      }
      i += match.n - 1;
    }
    const reason = [...new Set(hits)];
    return { yes: reason.length > 0, reason };
  }

  function resolve(unit) {
    const tokens = personTokens(unit.text);
    const cain = cainSignals(unit, tokens);
    const counts = new Map();
    const resolved = [];
    const unlinked = [];
    const unmatched = [];
    const unitPins = pins.get(unit.id);
    for (let i = 0; i < tokens.length; i += 1) {
      const match = matchAt(tokens, i);
      if (!match.n) {
        if (isHistoryName(tokens[i])) unmatched.push({ raw: tokens[i].raw, fold: tokens[i].fold });
        continue;
      }
      const span = tokens.slice(i, i + match.n);
      const raw = span.map((t) => t.raw).join(' ');
      const key = span.map((t) => t.fold).join(' ');
      const pin = unitPins?.get(key) || null;
      let personId = null;
      let reason = null;
      const bareTubal = match.n === 1 && tokens[i].fold === 'tubal';
      if (bareTubal) {
        const extras = match.ids.filter((id) => id !== 'tubal' && id !== 'tubal-cain');
        if (pin) {
          personId = pin.person_id;
          reason = `Tubal: override pins this unit to ${pin.person_id}. ${pin.reason || ''}`.trim();
        } else if (extras.length) {
          unlinked.push({
            raw, fold: key, candidates: [...new Set([...match.ids, 'tubal', 'tubal-cain'])].sort(),
            reason: 'The token Tubal matches another person besides Japheth’s son and Tubal-cain. No override selects one.',
          });
        } else if (cain.yes) {
          personId = 'tubal-cain';
          reason = `Tubal: Cain’s line (${cain.reason.join('; ')}).`;
        } else {
          personId = 'tubal';
          reason = 'Tubal: not Cain’s line, so this is Japheth’s son.';
        }
      } else if (pin) {
        personId = pin.person_id;
        reason = `Override pins this unit to ${pin.person_id}. ${pin.reason || ''}`.trim();
      } else if (match.ids.length === 1) {
        personId = match.ids[0];
        reason = 'One record matches this name.';
      } else {
        unlinked.push({
          raw, fold: key, candidates: [...match.ids].sort(),
          reason: 'This token matches more than one person. No context rule or override selects one.',
        });
      }
      if (personId && byId.has(personId)) {
        counts.set(personId, (counts.get(personId) || 0) + 1);
        resolved.push({ raw, fold: key, personId, reason });
      } else if (personId) {
        unlinked.push({
          raw, fold: key, candidates: [...match.ids].sort(),
          reason: `Override names ${personId}, which is not a person record.`,
        });
      }
      i += match.n - 1;
    }
    return { counts, resolved, unlinked, unmatched, cain };
  }

  return { resolve, matchAt, byId, pinErrors, pins };
}

const ENTRY_FIELDS = ['note', 'citation', 'edition_note'];

export function unitsForRecord(rec, { passages, passageHosts, nameForms }) {
  const units = [];
  const self = [rec.id];
  const push = (id, text, linkedIds, kind) => {
    if (text == null || !String(text).trim()) return;
    units.push({ id, text: String(text), linkedIds: [...linkedIds], kind, recordId: rec.id });
  };
  push(`note:${rec.type}:${rec.id}:summary`, rec.summary, self, 'prose');
  push(`note:${rec.type}:${rec.id}:description`, rec.description, self, 'prose');
  const entries = [];
  for (const [slot, list] of Object.entries(rec.dates || {})) {
    (list || []).forEach((entry, i) => entries.push({ slot: `dates:${slot}:${i}`, entry }));
  }
  (rec.chronologies || []).forEach((entry, i) => entries.push({ slot: `chronologies:${i}`, entry }));
  for (const { slot, entry } of entries) {
    for (const field of ENTRY_FIELDS) {
      push(`note:${rec.type}:${rec.id}:${slot}:${field}`, entry[field], self, 'entry');
    }
  }
  for (const passage of passages || []) {
    const hosts = passageHosts?.get(passage.id);
    push(passage.id, passage.passage, hosts?.length ? hosts : self, 'raleigh');
  }
  (nameForms || []).forEach((form, i) => {
    push(`note:${rec.type}:${rec.id}:name-form:${i}:citation`, form.citation, self, 'name-form');
    push(`note:${rec.type}:${rec.id}:name-form:${i}:note`, form.note, self, 'name-form');
  });
  return units;
}

export function loadNameLinkData(root) {
  const read = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'));
  const loadDir = (dir) => readdirSync(join(root, 'data', dir)).filter((f) => f.endsWith('.json')).sort()
    .map((f) => read(`data/${dir}/${f}`));
  const people = loadDir('people');
  const events = loadDir('events');
  const nameDoc = read('data/name-forms.json');
  const nameForms = Object.fromEntries((nameDoc.people || []).map((p) => [p.id, p.forms]));
  const overrides = read('data/name-link-overrides.json');
  const accounts = read('data/raleigh-accounts.json');
  const passageHosts = new Map();
  for (const [recordId, ids] of Object.entries(accounts.accounts || {})) {
    for (const id of ids || []) {
      let list = passageHosts.get(id);
      if (!list) { list = []; passageHosts.set(id, list); }
      list.push(recordId);
    }
  }
  const passages = accounts.passages || [];
  const passageById = new Map(passages.map((p) => [p.id, p]));
  return { people, events, nameForms, overrides, accounts, passageHosts, passageById };
}

export function collectUnits(data) {
  const { people, events, nameForms, passageHosts, passageById } = data;
  const seen = new Set();
  const units = [];
  const take = (rec) => {
    const passages = (data.accounts.accounts?.[rec.id] || [])
      .map((id) => passageById.get(id))
      .filter(Boolean);
    for (const unit of unitsForRecord(rec, { passages, passageHosts, nameForms: nameForms[rec.id] || [] })) {
      if (seen.has(unit.id)) continue;
      seen.add(unit.id);
      units.push(unit);
    }
  };
  for (const rec of people) take(rec);
  for (const rec of events) take(rec);
  for (const passage of data.accounts.passages || []) {
    if (seen.has(passage.id)) continue;
    seen.add(passage.id);
    units.push({
      id: passage.id,
      text: passage.passage,
      linkedIds: passageHosts.get(passage.id) || [],
      kind: 'raleigh',
      recordId: null,
    });
  }
  return units;
}

function titleOf(byId, id) {
  return byId.get(id)?.title || id;
}

export function auditNameLinks(data) {
  const linker = createNameLinker(data);
  const units = collectUnits(data);
  const byUnit = new Map(units.map((u) => [u.id, u]));
  const problems = [...linker.pinErrors];
  const ambiguous = [];
  const tubal = [];
  const unmatched = [];
  for (const unit of units) {
    const result = linker.resolve(unit);
    for (const row of result.unlinked) {
      ambiguous.push({ ...row, unitId: unit.id, kind: unit.kind, recordId: unit.recordId, excerpt: excerptAround(unit.text, row.raw) });
    }
    for (const row of result.resolved) {
      if (row.fold === 'tubal') tubal.push({ ...row, unitId: unit.id, kind: unit.kind, recordId: unit.recordId, excerpt: excerptAround(unit.text, row.raw) });
    }
    for (const row of result.unmatched) {
      unmatched.push({ ...row, unitId: unit.id, kind: unit.kind });
    }
  }
  for (const [unitId, bucket] of linker.pins) {
    const unit = byUnit.get(unitId);
    if (!unit) {
      problems.push(`${unitId}: no passage or note has this id`);
      continue;
    }
    const result = linker.resolve(unit);
    const folds = new Set([
      ...result.resolved.map((r) => r.fold),
      ...result.unlinked.map((r) => r.fold),
    ]);
    const tokens = personTokens(unit.text).map((t) => t.fold);
    for (const [key, row] of bucket) {
      const person = data.people.find((p) => p.id === row.person_id);
      if (!person) problems.push(`${unitId}: ${row.person_id} is not a person`);
      const present = folds.has(key) || tokens.includes(key);
      if (!present) problems.push(`${unitId}: “${row.token}” does not occur in this unit`);
      if (key === 'tubal' && row.person_id !== 'tubal' && row.person_id !== 'tubal-cain') {
        problems.push(`${unitId}: a Tubal pin must name tubal or tubal-cain`);
      }
      if (key !== 'tubal' && present) {
        const hit = result.resolved.find((r) => r.fold === key) || result.unlinked.find((r) => r.fold === key);
        const candidates = hit?.candidates || (hit?.personId ? [hit.personId] : []);
        if (candidates.length && !candidates.includes(row.person_id) && hit?.personId !== row.person_id) {
          problems.push(`${unitId}: “${row.token}” does not match ${row.person_id}`);
        }
      }
    }
  }
  return { linker, units, problems, ambiguous, tubal, unmatched };
}

export function selfCheckNameLinks({ people, nameForms }) {
  const errors = [];
  const check = (name, ok, detail) => { if (!ok) errors.push(`${name}${detail ? `: ${detail}` : ''}`); };
  const base = { people, nameForms, overrides: { overrides: [] } };
  const linker = createNameLinker(base);
  const cain = linker.resolve({
    id: 'self-check:cain',
    text: 'Iubal, Tubal and Tubalcain were inventors',
    linkedIds: [],
  });
  check('Cain-line Tubal', (cain.counts.get('tubal-cain') || 0) >= 1 && !cain.counts.has('tubal'), JSON.stringify([...cain.counts]));
  const japheth = linker.resolve({
    id: 'self-check:japheth',
    text: 'Tubal the son of Japheth',
    linkedIds: ['japheth'],
  });
  check('Japheth Tubal', japheth.counts.get('tubal') === 1 && !japheth.counts.has('tubal-cain'), JSON.stringify([...japheth.counts]));
  const compound = linker.resolve({
    id: 'self-check:compound',
    text: 'sister of Tubal-cain',
    linkedIds: ['naamah'],
  });
  check('Hyphenated Tubal-cain', compound.counts.get('tubal-cain') === 1 && !compound.counts.has('tubal') && !compound.counts.has('cain'), JSON.stringify([...compound.counts]));
  const lamech = linker.resolve({
    id: 'self-check:lamech',
    text: 'Lamech walked with Tubal far from Adah',
    linkedIds: [],
  });
  check('Lamech stays unlinked', lamech.unlinked.some((row) => row.fold === 'lamech' && row.candidates.includes('lamech') && row.candidates.includes('lamech-cainite')));
  check('Adah still makes the other Tubal Cainite', lamech.counts.get('tubal-cain') === 1, JSON.stringify([...lamech.counts]));
  const pinned = createNameLinker({
    people,
    nameForms,
    overrides: { overrides: [{ unit_id: 'self-check:pin', token: 'Tubal', person_id: 'tubal', reason: 'Pinned to Japheth’s son.' }] },
  });
  const pin = pinned.resolve({
    id: 'self-check:pin',
    text: 'Tubal stood with Jubal',
    linkedIds: ['jubal'],
  });
  check('Override beats Cain’s line', pin.counts.get('tubal') === 1 && !pin.counts.has('tubal-cain'), JSON.stringify([...pin.counts]));
  const hero = linker.resolve({
    id: 'self-check:herakles',
    text: 'he calls Nimrod Herakles, and Raleigh prints Hercules',
    linkedIds: ['naamah'],
  });
  check('Herakles links to heracles', hero.counts.get('heracles') === 1, JSON.stringify([...hero.counts]));
  const herculesRow = hero.unlinked.find((row) => row.fold === 'hercules');
  check('Hercules stays unlinked', !!herculesRow && herculesRow.candidates.includes('heracles') && herculesRow.candidates.includes('hercules'), JSON.stringify(herculesRow || null));
  return errors;
}
