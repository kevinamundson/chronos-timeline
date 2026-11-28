// Stored modern edition of Raleigh's History of the World (1617).
// Generates the pre-generated, stored modern files the site serves when the
// Modern switch is selected. The site does not transform at serve time.
//
// Reads:
//   sources/raleigh/A10357.earlyprint-unadorned.xml (the working text)
//   scripts/raleigh/translations.json (foreign phrase -> English, with the
//     original kept as a quotation)
// Writes:
//   data/raleigh-modern/*.md        one file per section (book/part/chapter/
//     section), plus preface.md and contents-book-<n>.md
//   data/raleigh-modern/index.json  passage id -> modern HTML/plain + file
//     + section + citation (the site's lookup; derived from the same model
//     as the Markdown files, so the two cannot drift)
//   data/raleigh-modern/README.md   format, scope, and rules
//
// Rules (Kevin, Nov 27, 2026):
//   - Every word is Modern English; the output passes spellcheck
//     (see scripts/raleigh/spellcheck-modern.mjs and
//     scripts/raleigh/modern-allowlist.txt).
//   - Proper names and place names use their modern form. A name changed
//     from the original carries a reference to the original name, in
//     italics, on its first occurrence in each section.
//   - Every foreign-language phrase carries an English translation
//     alongside it; the original stays as a quotation. Translations are
//     part of the stored files (and the downloads).
//   - Editorial corrections (Kevin, Nov 27, 2026, N108): "bath" is a
//     misprint for "hath" (has) in five passages (p00008, p00012, p00027,
//     p00979, p02718) and is corrected to "has" in the modern edition
//     only; the original text is untouched. See PASSAGE_CORRECTIONS.
//   - Dates, figures, and citations are never rewritten (repo cardinal
//     rule). The original text is untouched.
//   - A passage is addressable by the same passage id the intake uses
//     (data/raleigh-accounts.json p00001...), so a future pass can link
//     a passage to its modern form directly.
//
// Scope: the Preface, the contents, and Books I-V, Part I, whole. The
// Chronological Table is a separate artifact (scripts/raleigh/table.mjs)
// and is not part of these files. The title page, sonnet, epistle "to the
// reader", list of kings, index, and colophon are not passages in the
// intake and are not included here.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFullPassages, loadXml } from './xml-text.mjs';
import { modernizeProse, modernizeWord, MODERN, NAMES } from './spelling.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const OUT_DIR = join(root, 'data', 'raleigh-modern');
const TRANSLATIONS_REL = join(here, 'translations.json');

// Multi-word name phrases, longest first (same construction as spelling.mjs).
const PHRASES = [...Object.entries(MODERN), ...Object.entries(NAMES)]
  .filter(([k]) => k.includes(' '))
  .sort((a, b) => b[0].length - a[0].length);

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normWord(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// A word list for the name test: the modernizer's dictionary (1934 list).
let WORDS = null;
function loadWords() {
  if (WORDS) return WORDS;
  WORDS = new Set();
  for (const line of readFileSync(join(here, 'modern-words.txt'), 'utf8').split('\n')) {
    if (/^[a-z]+$/.test(line)) WORDS.add(line);
  }
  return WORDS;
}

// Name sets: the modernizer's maps plus the project's name forms and titles.
let NAME_KEYS = null;
function loadNameKeys() {
  if (NAME_KEYS) return NAME_KEYS;
  const keys = new Set();
  for (const k of Object.keys(MODERN)) for (const w of k.split(/[^a-z]+/)) if (w) keys.add(w);
  for (const k of Object.keys(NAMES)) for (const w of k.split(/[^a-z]+/)) if (w) keys.add(w);
  try {
    const nameDoc = JSON.parse(readFileSync(join(root, 'data', 'name-forms.json'), 'utf8'));
    for (const person of nameDoc.people || []) {
      for (const form of person.forms || []) {
        if (form.script !== 'latin' || !form.form) continue;
        for (const part of String(form.form).split(/[^A-Za-z]+/)) {
          if (part.length > 1) keys.add(part.toLowerCase());
        }
      }
    }
  } catch { /* name protection is weaker without the file */ }
  NAME_KEYS = keys;
  return keys;
}

function loadTranslations() {
  let doc = { italic: [], plain: [], names: [] };
  try {
    doc = JSON.parse(readFileSync(TRANSLATIONS_REL, 'utf8'));
  } catch { /* no translations yet: the generator still runs */ }
  return doc;
}

// Normalize a phrase for matching: lowercase, letters and digits only.
function normPhrase(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

// Tokenize into words with character offsets.
function tokenize(text) {
  const out = [];
  for (const m of text.matchAll(/\p{L}[\p{L}'\u2019-]*/gu)) {
    out.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  }
  return out;
}

// Banded LCS alignment of two token lists (by normalized word). Returns a list
// of blocks: {o: [start, end) into orig, m: [start, end) into modern}.
function alignTokens(orig, modern) {
  const n = orig.length;
  const m = modern.length;
  if (n === 0 || m === 0) return [{ o: [0, n], m: [0, m] }];
  const BAND = 24;
  // dp[i][j] over a band around the diagonal; j - i in [-BAND, BAND].
  const W = 2 * BAND + 1;
  const idx = (i, j) => (j - i + BAND);
  const NEG = -1e9;
  let prev = new Array(W).fill(NEG);
  let cur = new Array(W).fill(NEG);
  prev[idx(0, 0)] = 0;
  const back = [];
  for (let i = 0; i <= n; i += 1) {
    cur = new Array(W).fill(NEG);
    for (let j = Math.max(0, i - BAND); j <= Math.min(m, i + BAND); j += 1) {
      const k = idx(i, j);
      if (i === 0 && j === 0) { cur[k] = 0; continue; }
      let best = NEG;
      let from = '';
      if (i > 0 && j > 0) {
        const pk = idx(i - 1, j - 1);
        if (prev[pk] > NEG) {
          const v = prev[pk] + (normWord(orig[i - 1].word) === normWord(modern[j - 1].word) ? 1 : 0);
          if (v > best) { best = v; from = 'd'; }
        }
      }
      if (i > 0) {
        const pk = idx(i - 1, j);
        if (prev[pk] > best) { best = prev[pk]; from = 'u'; }
      }
      if (j > 0) {
        const pk = idx(i, j - 1);
        if (cur[pk] > best) { best = cur[pk]; from = 'l'; }
      }
      cur[k] = best;
      if (!back[i]) back[i] = {};
      back[i][j] = from;
    }
    prev = cur;
  }
  // Walk back from (n, m).
  const pairs = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const from = (back[i] && back[i][j]) || '';
    if (from === 'd') { pairs.push([i - 1, j - 1]); i -= 1; j -= 1; }
    else if (from === 'u') { i -= 1; }
    else if (from === 'l') { j -= 1; }
    else if (i > 0 && j > 0) { pairs.push([i - 1, j - 1]); i -= 1; j -= 1; }
    else if (i > 0) { i -= 1; }
    else { j -= 1; }
  }
  pairs.reverse();
  // Group into blocks: aligned pairs are matches; gaps are changes.
  const blocks = [];
  let oi = 0;
  let mi = 0;
  for (const [o, mm] of pairs) {
    if (o > oi || mm > mi) blocks.push({ o: [oi, o], m: [mi, mm] });
    blocks.push({ o: [o, o + 1], m: [mm, mm + 1] });
    oi = o + 1;
    mi = mm + 1;
  }
  if (oi < n || mi < m) blocks.push({ o: [oi, n], m: [mi, m] });
  return blocks;
}

// Editorial corrections, applied to the passage text before modernization
// (Kevin, 2026-11-27, open questions N106 and N108). N108: "bath" is a
// misprint for "hath" (has) in these five passages; both XML copies read
// "bath", so it is in the print, not a transcription error. The sixth
// "bath" (p02343, "a very wholesome bath") is the genuine noun and is left
// alone. N106: the archaic words Kevin ruled on, each with its modern form;
// a parenthetical gloss stays in the text (e.g. "dureless (transitory)").
// Each passage has exactly one match; if that ever stops being true the
// correction is skipped and the passage stays as printed. Italic spans
// after the replacement shift by the length delta, like the name
// replacements below. The standalone "oner" in p05155 ("consigne them
// oner to the Romans") is also "over" (Kevin, Nov 27, 2026).
const PASSAGE_CORRECTIONS = {
  // N108.
  p00008: [['bath', 'has']],
  p00012: [['bath', 'has']],
  p00027: [['bath', 'has']],
  p00979: [['bath', 'has']],
  p02718: [['bath', 'has']],
  // N106.
  p00051: [['durelesse', 'dureless (transitory)']],
  p00882: [['durelesse', 'dureless (transitory)']],
  p04090: [['oner-flow', 'overflow']],
  p05155: [['oner', 'over']],
  p00029: [['minaes', 'minds']], // printed "minaes"; the modernizer renders it "minas"
  p01299: [['incopsed', 'incopsed (enclosed)']],
  p02393: [['it heroes * radiantes', "it's radiant heros"]],
  p03410: [['slaterly', 'stately']],
  p04928: [['slemme', 'scheme']],
  p04929: [['tournie', 'tournie (march)']],
  p05144: [['scrued', 'supplied']],
  p04676: [['Priuer nates', 'Privernates']],
};

function applyPassageCorrections(id, passage, italics) {
  const corrections = PASSAGE_CORRECTIONS[id];
  if (!corrections) return { passage, italics };
  let text = passage;
  let spans = italics || [];
  for (const [from, to] of corrections) {
    const re = new RegExp(`\\b${escapeReg(from)}\\b`, 'g');
    const hits = [...text.matchAll(re)];
    if (hits.length !== 1) continue;
    const at = hits[0].index;
    text = text.slice(0, at) + to + text.slice(at + from.length);
    const delta = to.length - from.length;
    spans = spans.map(([a, b]) => {
      if (b <= at) return [a, b];
      if (a >= at + from.length) return [a + delta, b + delta];
      return [Math.min(a, at), Math.max(b, at + from.length) + delta];
    }).filter(([a, b]) => a < b);
  }
  return { passage: text, italics: spans };
}

// Footnotes (N106, Kevin, 2026-11-27): words left as printed because no
// certain modern equivalent exists. The word carries a superscript marker
// in the modern text; the note is listed at the end of the section file
// and in the passage's `notes` field in index.json. Numbering is per
// section (startN is the next free number in the section); each affected
// section here has exactly one footnote, so every marker is ¹.
const FOOTNOTES = {
  p02228: [{ word: 'cuened', note: 'Unknown word.' }],
  p04168: [{ word: 'wcs', note: 'Unknown word.' }],
  p03601: [{ word: 'ns', note: 'Unknown word.' }],
};
const FOOTNOTE_MARKS = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

function applyFootnotes(id, text, spans, startN) {
  const list = FOOTNOTES[id];
  if (!list) return { text, spans, notes: [] };
  let out = text;
  let cur = spans || [];
  const notes = [];
  for (const [i, fn] of list.entries()) {
    const re = new RegExp(`\\b${escapeReg(fn.word)}\\b`, 'g');
    const hits = [...out.matchAll(re)];
    if (hits.length !== 1) throw new Error(`footnote word ${fn.word} does not occur exactly once in ${id}`);
    const n = startN + i;
    const mark = FOOTNOTE_MARKS[n - 1];
    if (!mark) throw new Error(`too many footnotes in one section (passage ${id})`);
    const at = hits[0].index + hits[0][0].length;
    out = out.slice(0, at) + mark + out.slice(at);
    cur = cur.map(([a, b]) => {
      if (b <= at) return [a, b];
      if (a >= at) return [a + 1, b + 1];
      return [a, b + 1];
    }).filter(([a, b]) => a < b);
    notes.push({ n, word: fn.word, text: fn.note });
  }
  return { text: out, spans: cur, notes };
}

// Modernize one passage, keeping the italic spans. Returns the modern text
// and the recomputed italic spans into it.
function modernizePassage(passage, italics) {
  const spans = italics || [];
  const segs = [];
  let i = 0;
  for (const [a, b] of spans) {
    if (a > i) segs.push({ text: passage.slice(i, a), italic: false });
    segs.push({ text: passage.slice(a, b), italic: true });
    i = b;
  }
  if (i < passage.length) segs.push({ text: passage.slice(i), italic: false });
  let modern = '';
  const outSpans = [];
  for (const s of segs) {
    const m = modernizeProse(s.text);
    if (s.italic && m.length) outSpans.push([modern.length, modern.length + m.length]);
    modern += m;
  }
  return { modern, spans: outSpans };
}

// A changed word is a changed NAME when it is in a name map or name set, or
// when it is capitalized in the original and its modern form is not a common
// English word. Sentence-initial common words fail the last test because
// their modern form is in the dictionary.
function isChangedName(origWord, modernWord) {
  if (normWord(origWord) === normWord(modernWord)) return false;
  const key = normWord(origWord);
  const keys = loadNameKeys();
  if (keys.has(key)) return true;
  if (!/^[A-Z]/.test(origWord)) return false;
  const words = loadWords();
  if (words.has(normWord(modernWord))) return false;
  return true;
}

// Find multi-word name phrases in the original text. Returns
// [{start, end, original, modern}] with offsets into the original text.
function findNamePhrases(text) {
  const found = [];
  for (const [from, to] of PHRASES) {
    const re = new RegExp(`(?<![A-Za-z])${escapeReg(from)}(?![A-Za-z])`, 'gi');
    let m;
    while ((m = re.exec(text))) {
      found.push({ start: m.index, end: m.index + m[0].length, original: m[0], modern: to });
    }
  }
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  // Drop overlaps (a longer phrase wins).
  const kept = [];
  let lastEnd = -1;
  for (const f of found) {
    if (f.start < lastEnd) continue;
    kept.push(f);
    lastEnd = f.end;
  }
  return kept;
}

// Context-sensitive homographs (Nov 27, 2026). These words are both an
// English word and a Latin word, so the modernizer cannot change them
// (it would corrupt the Latin). The generator changes them only outside
// a foreign phrase (which the translation table identifies).
//   mens: English men's (possessive) / Latin mens (mind).
//   ment: English meant / Latin fragment (in ment...).
//   asse: English ass (donkey) / Latin fragment (plant asse, from plantasse).
const CONTEXT_WORDS = [
  ['mens', "men's"],
  ['ment', 'meant'],
  ['asse', 'ass'],
];

function replaceCaseAware(t, from, to) {
  return t.replace(new RegExp(`\\b${escapeReg(from)}\\b`, 'gi'), (m) => {
    if (m.length > 1 && m === m.toUpperCase()) return to.toUpperCase();
    if (/^[A-Z]/.test(m)) return to.charAt(0).toUpperCase() + to.slice(1);
    return to;
  });
}

// Find every translation phrase in the text. Returns
// [{start, end, translation}] with offsets into the text. A longer phrase
// wins over a shorter one that overlaps it.
function findTranslationMatches(text, transByNorm) {
  const toks = tokenize(text);
  const norms = toks.map((t) => normWord(t.word));
  const found = [];
  for (const [norm, row] of transByNorm) {
    const phraseWords = norm.split(' ');
    if (phraseWords.length === 1) {
      for (let k = 0; k < toks.length; k += 1) {
        if (norms[k] === phraseWords[0]) found.push({ start: toks[k].start, end: toks[k].end, translation: row.translation });
      }
      continue;
    }
    for (let k = 0; k + phraseWords.length <= norms.length; k += 1) {
      let hit = true;
      for (let w = 0; w < phraseWords.length; w += 1) {
        if (norms[k + w] !== phraseWords[w]) { hit = false; break; }
      }
      if (!hit) continue;
      found.push({ start: toks[k].start, end: toks[k + phraseWords.length - 1].end, translation: row.translation });
    }
  }
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept = [];
  let lastEnd = -1;
  for (const f of found) {
    if (f.start < lastEnd) continue;
    kept.push(f);
    lastEnd = f.end;
  }
  return kept;
}

// Apply the context-sensitive replacements to the text, skipping the
// protected spans (foreign phrases). Returns {text, spans} with the
// italic spans recomputed.
function applyProtectedReplacements(text, spans, protectedSpans) {
  const points = new Set([0, text.length]);
  for (const [a, b] of spans) { points.add(a); points.add(b); }
  for (const [a, b] of protectedSpans) { points.add(a); points.add(b); }
  const sorted = [...points].sort((a, b) => a - b);
  const pieces = [];
  for (let i = 0; i + 1 < sorted.length; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (a >= b) continue;
    const italic = spans.some(([s, e]) => s <= a && b <= e);
    const prot = protectedSpans.some(([s, e]) => s <= a && b <= e);
    pieces.push({ text: text.slice(a, b), italic, protected: prot });
  }
  let out = '';
  const outSpans = [];
  for (const pc of pieces) {
    let t = pc.text;
    if (!pc.protected) {
      for (const [from, to] of CONTEXT_WORDS) t = replaceCaseAware(t, from, to);
    }
    if (pc.italic && t.length) outSpans.push([out.length, out.length + t.length]);
    out += t;
  }
  const merged = [];
  for (const [a, b] of outSpans) {
    const last = merged[merged.length - 1];
    if (last && last[1] === a) last[1] = b;
    else merged.push([a, b]);
  }
  return { text: out, spans: merged };
}

export function buildModernEdition() {
  const translations = loadTranslations();
  // Translation lookup: normalized phrase -> {translation, decision}.
  const transByNorm = new Map();
  const nameReplacements = [];
  for (const list of [translations.italic || [], translations.plain || []]) {
    for (const row of list) {
      if (!row || !row.phrase) continue;
      if (row.decision === 'name') {
        nameReplacements.push({ phrase: row.phrase, modern: row.translation });
      } else if (row.decision === 'translate' || row.decision === 'title') {
        transByNorm.set(normPhrase(row.phrase), { translation: row.translation, decision: row.decision });
      }
      // "already-glossed" needs no added translation. "uncertain" is not
      // rendered (Kevin's ruling: best translation, move on; an uncertain
      // phrase is left as printed and reported, not guessed).
    }
  }
  // Name replacements, longest first, as a word-sequence index.
  const nameByNorm = new Map();
  for (const r of nameReplacements) nameByNorm.set(normPhrase(r.phrase), r.modern);

  const full = extractFullPassages(loadXml(root));
  // Group passages into sections: document-order runs of
  // (kind, book, part, chapter, section). Preface and contents are their own files.
  const groups = [];
  let cur = null;
  const groupKey = (p) => {
    if (p.kind === 'preface') return 'preface';
    if (p.kind === 'contents') return `contents-book-${p.book || '?'}`;
    return `body/${p.book}/${p.part}/${p.chapter}/${p.section ?? 'intro'}`;
  };
  for (const p of full) {
    const key = groupKey(p);
    if (!cur || cur.key !== key) {
      if (cur) groups.push(cur);
      cur = { key, kind: p.kind, book: p.book, part: p.part, chapter: p.chapter, section: p.section, passages: [] };
    }
    cur.passages.push(p);
  }
  if (cur) groups.push(cur);

  // File names. A repeated section n inside one chapter gets a letter suffix
  // (the second §. VIII in a chapter is section-8b).
  const seenSection = new Map();
  for (const g of groups) {
    if (g.kind === 'preface') { g.file = 'preface.md'; g.title = 'Preface'; continue; }
    if (g.kind === 'contents') { g.file = `contents-book-${g.book}.md`; g.title = `Contents, Book ${['', 'I', 'II', 'III', 'IV', 'V'][Number(g.book)] || g.book}`; continue; }
    const roman = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII'][Number(g.chapter)] || g.chapter;
    if (g.section == null) {
      g.file = `book-${g.book}-part-${g.part}-chapter-${g.chapter}-intro.md`;
      g.title = `Book ${['','I','II','III','IV','V'][Number(g.book)]}, Part ${['','I'][Number(g.part)] || g.part}, Chapter ${roman}`;
      continue;
    }
    const ck = `${g.book}/${g.part}/${g.chapter}/${g.section}`;
    const n = (seenSection.get(ck) || 0) + 1;
    seenSection.set(ck, n);
    const suffix = n === 1 ? '' : String.fromCharCode(96 + n);
    g.file = `book-${g.book}-part-${g.part}-chapter-${g.chapter}-section-${g.section}${suffix}.md`;
    g.title = `Book ${['','I','II','III','IV','V'][Number(g.book)]}, Part ${['','I'][Number(g.part)] || g.part}, Chapter ${roman}, §. ${g.section}`;
    g.occurrence = n;
  }

  const index = {};
  const stats = { passages: 0, words: 0, nameRefs: 0, translations: 0, nameReplacements: 0, files: 0 };
  const unmatchedLatin = new Map();
  // Every word that occurs in any translation phrase (translate, title,
  // already-glossed, or name): a Latin word inside one of those phrases is
  // covered, even when the phrase itself is long. Both the space-split
  // words and the hyphenated form are covered: the tokenizer keeps hyphens
  // ("ex-omnibus" is one token), so a hyphenated Latin word needs its own
  // entry, not just its parts.
  const coveredLatinWords = new Set();
  for (const list of [translations.italic || [], translations.plain || []]) {
    for (const row of list) {
      if (!row || !row.phrase) continue;
      for (const w of normPhrase(row.phrase).split(' ')) coveredLatinWords.add(w);
      for (const m of row.phrase.matchAll(/[\p{L}][\p{L}'\u2019-]*/gu)) {
        coveredLatinWords.add(normWord(m[0]));
      }
    }
  }

  for (const g of groups) {
    // First-occurrence name references are per section (per file).
    const referenced = new Set();
    // Footnotes are numbered per section (per file).
    const sectionNotes = [];
    const lines = [];
    lines.push(`# ${g.title}`);
    lines.push('');
    lines.push('> Sir Walter Raleigh, *The History of the World* (1617). Modern edition. Original spelling: EarlyPrint A10357 (EEBO-TCP), London 1617, Stansby for Walter Burre. The original text is untouched; this file is the stored modern copy.');
    lines.push('');
    for (const p of g.passages) {
      const corrected = applyPassageCorrections(p.id, p.passage, p.italics);
      const { modern, spans } = modernizePassage(corrected.passage, corrected.italics);
      // 1. Latin name replacements (a name in Latin form becomes its modern
      //    form, with the original as a name reference on first occurrence).
      let text = modern;
      let curSpans = spans;
      for (const [norm, modernName] of nameByNorm) {
        // Re-tokenize for each name: a replacement (and its reference
        // insertion) changes the text length, so tokens from before it
        // would point at the wrong span. (Nov 27, 2026: stale offsets
        // corrupted "comming downe. Now( saith P. de Aliaco" into
        // "comingPeter of Aillysays" in p01128.)
        const tokens = tokenize(text);
        const normTokens = tokens.map((t) => normWord(t.word));
        const phraseWords = norm.split(' ');
        for (let k = 0; k + phraseWords.length <= normTokens.length; k += 1) {
          let hit = true;
          for (let w = 0; w < phraseWords.length; w += 1) {
            if (normTokens[k + w] !== phraseWords[w]) { hit = false; break; }
          }
          if (!hit) continue;
          const startTok = tokens[k];
          const endTok = tokens[k + phraseWords.length - 1];
          const original = text.slice(startTok.start, endTok.end);
          if (normWord(original) === normWord(modernName)) continue;
          const before = text.slice(0, startTok.start);
          const after = text.slice(endTok.end);
          const delta = modernName.length - (endTok.end - startTok.start);
          text = before + modernName + after;
          curSpans = curSpans.map(([a, b]) => {
            if (b <= startTok.start) return [a, b];
            if (a >= endTok.end) return [a + delta, b + delta];
            return [Math.min(a, startTok.start), Math.max(b, endTok.end) + delta];
          }).filter(([a, b]) => a < b);
          stats.nameReplacements += 1;
          // Record the replacement as a changed name for the reference step.
          // The diff below sees the modern name against the original Latin
          // name, so the reference is added there; mark it here instead to
          // keep the original spelling exact.
          const refKey = normWord(modernName);
          if (!referenced.has(refKey)) {
            referenced.add(refKey);
            // Insert the reference right after the modern name.
            const pos = startTok.start + modernName.length;
            text = text.slice(0, pos) + ` *${original}*` + text.slice(pos);
            const ins = ` *${original}*`.length;
            curSpans = curSpans.map(([a, b]) => (a >= pos ? [a + ins, b + ins] : [a, b]));
            stats.nameRefs += 1;
          }
          break;
        }
      }
      // 1b. Context-sensitive homographs (mens, ment, asse), protected by
      // the foreign phrases: the Latin phrases are found first, and the
      // replacements run only outside them.
      const protMatches = findTranslationMatches(text, transByNorm);
      const prot = applyProtectedReplacements(text, curSpans, protMatches.map((m) => [m.start, m.end]));
      text = prot.text;
      curSpans = prot.spans;
      // 1c. Footnotes (N106): words left as printed, marked with a
      // superscript number; the note is listed at the end of the section.
      // Applied here, after the text is final and before the name diff, so
      // the marker (one non-letter character) shifts spans and insert
      // positions consistently and never creates a token.
      const fn = applyFootnotes(p.id, text, curSpans, sectionNotes.length + 1);
      text = fn.text;
      curSpans = fn.spans;
      const notes = fn.notes;
      sectionNotes.push(...notes);
      // 2. Changed names (word level, via the token diff against the original).
      const origTokens = tokenize(p.passage);
      const modTokens = tokenize(text);
      const blocks = alignTokens(origTokens, modTokens);
      const nameInserts = [];
      for (const b of blocks) {
        const oLen = b.o[1] - b.o[0];
        const mLen = b.m[1] - b.m[0];
        if (oLen === 1 && mLen === 1) {
          const o = origTokens[b.o[0]];
          const mm = modTokens[b.m[0]];
          if (isChangedName(o.word, mm.word)) {
            const refKey = normWord(mm.word);
            if (!referenced.has(refKey)) {
              referenced.add(refKey);
              nameInserts.push({ pos: mm.end, original: o.word, modern: mm.word });
            }
          }
        } else if (oLen > 1 && mLen >= 1) {
          // A multi-word change: a name phrase if the original words match
          // a PHRASES key.
          const origPhrase = origTokens.slice(b.o[0], b.o[1]).map((t) => normWord(t.word)).join(' ');
          const modernPhrase = modTokens.slice(b.m[0], b.m[1]).map((t) => t.word).join(' ');
          const hit = PHRASES.find(([from]) => normPhrase(from) === origPhrase);
          if (hit && normWord(hit[1]) !== normWord(modernPhrase)) {
            const refKey = normWord(modernPhrase);
            if (!referenced.has(refKey)) {
              referenced.add(refKey);
              const endTok = modTokens[b.m[1] - 1];
              const origText = p.passage.slice(origTokens[b.o[0]].start, origTokens[b.o[1] - 1].end);
              nameInserts.push({ pos: endTok.end, original: origText, modern: modernPhrase });
            }
          }
        }
      }
      // 3. Foreign-phrase translations (re-matched on the text after the
      //    context-sensitive replacements; the phrases themselves are intact).
      const transMatches = findTranslationMatches(text, transByNorm);
      const transInserts = transMatches.map((m) => ({ pos: m.end, translation: m.translation }));
      stats.translations += transInserts.length;
      // 4. Render the passage to Markdown and to HTML, applying the
      //    insertions. An insertion inside an italic span splits the span.
      const allInserts = [
        ...nameInserts.map((x) => ({ pos: x.pos, md: ` *${x.original}*`, html: ` <em>${escapeHtml(x.original)}</em>` })),
        ...transInserts.map((x) => ({ pos: x.pos, md: ` ("${x.translation}")`, html: ` ("${escapeHtml(x.translation)}")` })),
      ].sort((a, b) => a.pos - b.pos);
      stats.nameRefs += nameInserts.length;
      const { md, html } = renderWithInsertions(text, curSpans, allInserts);
      const plain = text;
      lines.push(`## ${p.id} · ${p.signature ? `sig. ${p.signature}` : 'no signature'}`);
      lines.push('');
      lines.push(md);
      lines.push('');
      index[p.id] = {
        file: g.file,
        section: g.title,
        citation: p.citation,
        modern: html,
        modernText: plain,
        ...(notes.length ? { notes } : {}),
      };
      stats.passages += 1;
      stats.words += plain.split(/\s+/).filter(Boolean).length;
      // Unmatched Latin: a Latin-looking word in the modern text that is in
      // no translation phrase and no name set. Reported, not guessed.
      for (const t of tokenize(plain)) {
        const w = normWord(t.word);
        if (w.length < 3 || /[A-Z]/.test(t.word[0])) continue;
        if (loadWords().has(w)) continue;
        if (coveredLatinWords.has(w)) continue;
        if (/(ae|ibus|orum|arum|ium|us|um)$/.test(w) && !transByNorm.has(w)) {
          const e = unmatchedLatin.get(w) || { count: 0, sample: p.id };
          e.count += 1;
          unmatchedLatin.set(w, e);
        }
      }
    }
    if (sectionNotes.length) {
      lines.push('## Notes');
      lines.push('');
      for (const n of sectionNotes) lines.push(`${n.n}. *${n.word}* — ${n.text}`);
      lines.push('');
    }
    writeFileSync(join(OUT_DIR, g.file), `${lines.join('\n').trim()}\n`);
    stats.files += 1;
  }

  const readme = `# Raleigh's History of the World (1617) — stored modern edition

Sir Walter Raleigh, *The History of the World* (1617), London: Stansby for
Walter Burre. Source text: EarlyPrint A10357 (EEBO-TCP), the unadorned
transcription in \`sources/raleigh/A10357.earlyprint-unadorned.xml\`.

## What these files are

Pre-generated, stored modern files. The site serves these files when the
Modern switch is selected; it does not run a script against the originals
at serve time. Each passage is addressable by the same passage id the
intake uses (\`data/raleigh-accounts.json\`, p00001...), so a future intake
pass can link a passage to its modern form directly.

- One file per section (book / part / chapter / §), plus \`preface.md\` and
  one \`contents-book-<n>.md\` per book. A chapter opening before the first
  § is \`-intro.md\`. A section number that repeats inside one chapter
  takes a letter suffix (the second §. VIII is \`section-8b\`).
- Each passage is a \`## pNNNNN · sig. ...\` heading followed by its modern
  text. Italics are the 1617 \`<hi>\` spans, carried as \`*\`...\\*\`.
- \`index.json\` is the site's lookup: passage id -> modern HTML and plain
  text, file, section, citation. It is generated from the same model as
  these Markdown files, so the two cannot drift. Do not edit it by hand;
  regenerate with \`node scripts/raleigh/modern-edition.mjs\`.

## Rules

- Every word is Modern English; the output passes spellcheck
  (\`node scripts/raleigh/spellcheck-modern.mjs\`, nspell with the en-US
  and en-GB dictionaries, plus \`scripts/raleigh/modern-allowlist.txt\`).
- A word with no certain modern equivalent stays as printed and carries a
  footnote, numbered per section: \`cuened¹\`, with the note at the end of
  the section file and in the passage's \`notes\` field in \`index.json\`.
  (N106, Kevin's rulings, Nov 27, 2026.)
- Proper names and place names use their modern form. A name changed from
  the original carries a reference to the original name, in italics, on
  its first occurrence in each section: \`Gideon *Gedeon*\`.
- Every foreign-language phrase carries an English translation alongside
  it; the original stays as a quotation: \`*Sic vos non vobis* ("Thus you
  labour not for yourselves")\`. Translations are in
  \`scripts/raleigh/translations.json\`.
- Dates, figures, and citations are never rewritten. The original text is
  untouched.

## Scope

The Preface, the contents, and Books I-V, Part I, whole. The Chronological
Table is a separate artifact (\`scripts/raleigh/table.mjs\`) and is not part
of these files. The title page, sonnet, epistle to the reader, list of
kings, index, and colophon are not passages in the intake and are not
included here.

## Regenerate

\`node scripts/raleigh/modern-edition.mjs\`
`;
  writeFileSync(join(OUT_DIR, 'README.md'), readme);
  writeFileSync(join(OUT_DIR, 'index.json'), `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), generator: 'scripts/raleigh/modern-edition.mjs', passages: index }, null, 1)}\n`);

  const unmatched = [...unmatchedLatin.entries()].map(([w, v]) => ({ word: w, count: v.count, sample: v.sample })).sort((a, b) => b.count - a.count);
  return { ...stats, unmatchedLatin: unmatched };
}

// Render text with italic spans and insertions to Markdown and HTML.
// An insertion inside an italic span splits the span so the inserted text
// (a translation or a name reference) is not italic.
function renderWithInsertions(text, spans, inserts) {
  const events = [];
  for (const [a, b] of spans) {
    events.push({ pos: a, kind: 'open' });
    events.push({ pos: b, kind: 'close' });
  }
  for (const ins of inserts) events.push({ pos: ins.pos, kind: 'insert', ins });
  events.sort((a, b) => a.pos - b.pos || (a.kind === 'close' ? -1 : a.kind === 'open' ? 1 : 0));
  let md = '';
  let html = '';
  let italic = false;
  let i = 0;
  for (const ev of events) {
    if (ev.pos > i) {
      const chunk = text.slice(i, ev.pos);
      md += chunk;
      html += escapeHtml(chunk);
      i = ev.pos;
    }
    if (ev.kind === 'open' && !italic) { md += '*'; html += '<em>'; italic = true; }
    else if (ev.kind === 'close' && italic) { md += '*'; html += '</em>'; italic = false; }
    else if (ev.kind === 'insert') {
      if (italic) { md += '*'; html += '</em>'; italic = false; }
      md += ev.ins.md;
      html += ev.ins.html;
      // Reopen the italics if the span continues past the insertion.
      const continuing = spans.some(([a, b]) => a < ev.pos && b > ev.pos);
      if (continuing) { md += '*'; html += '<em>'; italic = true; }
    }
  }
  if (i < text.length) {
    const chunk = text.slice(i);
    md += chunk;
    html += escapeHtml(chunk);
  }
  if (italic) { md += '*'; html += '</em>'; }
  return { md, html };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(OUT_DIR, { recursive: true });
  const stats = buildModernEdition();
  console.log(JSON.stringify({ ...stats, unmatchedLatin: stats.unmatchedLatin.slice(0, 40) }, null, 1));
}
