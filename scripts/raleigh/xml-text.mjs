// Text of the 1617 History (EarlyPrint unadorned XML), for the body intake.
// Margin notes are left out. Tags are left out. Whitespace collapses to one space.
// A passage is one paragraph, one heading, one contents item, or one body list.
// The covered range is the Preface, the contents, and Book I, Part I.
// `throughChapter` is the last chapter of that book to include. Pass 3 stopped at VIII.
// Pass 4 continues from IX. Book II is a later part and is not included.
// `<hi>` is the 1617 italic (EarlyPrint leaves the rend off the unadorned file).
// Each passage carries `italics` as [start, end] pairs into `passage`, derived here.
// The plain `passage` string does not contain the tags.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const XML_REL = 'sources/raleigh/A10357.earlyprint-unadorned.xml';

/** Last Book I, Part I chapter stored in data/raleigh-accounts.json. */
export const THROUGH_CHAPTER = 12;

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL'];

export function roman(n) {
  const i = Number(n);
  return ROMAN[i] || String(n);
}

export function normalizeWs(s) {
  return String(s ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decode(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? decode(m[1]) : null;
}

function sigRange(a, b) {
  if (!a) return 'sig. (none)';
  if (!b || a === b) return `sig. ${a}`;
  return `sig. ${a}–${b}`;
}

function citationOf(loc, signature, signatureEnd) {
  const sig = sigRange(signature, signatureEnd);
  if (loc.kind === 'preface') return `Preface, ${sig}`;
  if (loc.kind === 'contents') {
    const bits = ['Contents'];
    if (loc.book) bits.push(`Book ${roman(loc.book)}`);
    if (loc.partLabel) bits.push(loc.partLabel);
    if (loc.chapterLabel) bits.push(loc.chapterLabel);
    return `${bits.join(', ')}, ${sig}`;
  }
  const bits = [];
  if (loc.book) bits.push(`Book ${roman(loc.book)}`);
  if (loc.part) bits.push(`Part ${roman(loc.part)}`);
  if (loc.chapter) bits.push(`Chapter ${roman(loc.chapter)}`);
  if (loc.section) bits.push(`§. ${roman(loc.section)}`);
  if (loc.subsection) bits.push(`subsection ${roman(loc.subsection)}`);
  return `${bits.join(', ')}, ${sig}`;
}

/**
 * Collapse whitespace the same way as normalizeWs, and remember which output
 * characters were inside `<hi>`. A whitespace run becomes italic only when
 * every character in the run was inside `<hi>`, so a boundary space stays roman.
 */
export function composePassage(parts) {
  const chars = [];
  for (const part of parts) {
    const decoded = decode(part.text).replace(/\u00a0/g, ' ');
    for (const ch of decoded) chars.push({ ch, italic: part.italic });
  }
  const out = [];
  let i = 0;
  while (i < chars.length) {
    if (/\s/u.test(chars[i].ch)) {
      let j = i;
      let allItalic = true;
      while (j < chars.length && /\s/u.test(chars[j].ch)) {
        if (!chars[j].italic) allItalic = false;
        j += 1;
      }
      out.push({ ch: ' ', italic: allItalic });
      i = j;
    } else {
      out.push(chars[i]);
      i += 1;
    }
  }
  while (out.length && out[0].ch === ' ') out.shift();
  while (out.length && out[out.length - 1].ch === ' ') out.pop();
  const passage = out.map((c) => c.ch).join('');
  const italics = [];
  let start = null;
  for (let k = 0; k < out.length; k += 1) {
    if (out[k].italic && start == null) start = k;
    if (!out[k].italic && start != null) {
      italics.push([start, k]);
      start = null;
    }
  }
  if (start != null) italics.push([start, out.length]);
  return { passage, italics };
}

/** True when every character of [start, end) lies inside an italic span. */
export function rangeIsItalic(italics, start, end) {
  for (let i = start; i < end; i += 1) {
    if (!italics.some(([a, b]) => i >= a && i < b)) return false;
  }
  return start < end;
}

/**
 * Errors when a derived italic span does not match the `<hi>` text of this passage.
 * `hiTexts` are the note-stripped, whitespace-normalised insides of each `<hi>`.
 */
export function italicCoverageErrors(passage, italics, hiTexts) {
  const errors = [];
  let prev = 0;
  for (const span of italics || []) {
    if (!Array.isArray(span) || span.length !== 2) {
      errors.push('italic span is not a pair');
      continue;
    }
    const [a, b] = span;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < prev || a >= b || b > passage.length) {
      errors.push(`italic span ${a}–${b} is out of order or out of range`);
      continue;
    }
    prev = b;
    if (!/\S/.test(passage.slice(a, b))) errors.push(`italic span ${a}–${b} is blank`);
  }
  for (const h of hiTexts || []) {
    if (!h) continue;
    let from = 0;
    let covered = false;
    while (from <= passage.length) {
      const at = passage.indexOf(h, from);
      if (at < 0) break;
      if (rangeIsItalic(italics, at, at + h.length)) {
        covered = true;
        break;
      }
      from = at + 1;
    }
    if (!covered) errors.push(`<hi> text is not an italic span: ${h.slice(0, 80)}`);
  }
  return errors;
}

function location(stack, inBody, maxChapter) {
  let preface = false;
  let contents = false;
  let part = null;
  let book = null;
  let chapter = null;
  let section = null;
  let subsection = null;
  for (const d of stack) {
    if (d.type === 'preface') preface = true;
    if (d.type === 'table_of_contents') contents = true;
    if (d.type === 'part' && d.n) part = d.n;
    if (d.type === 'book' && d.n) book = d.n;
    if (d.type === 'chapter' && d.n) chapter = d.n;
    if (d.type === 'section' && d.n) section = d.n;
    if (d.type === 'subsection' && d.n) subsection = d.n;
  }
  if (!inBody && preface) return { kind: 'preface', book: null, part: null, chapter: null, section: null, subsection: null };
  if (!inBody && contents) return { kind: 'contents', book, part: null, chapter: null, section: null, subsection: null };
  if (inBody && part === '1' && book === '1' && chapter && Number(chapter) >= 1 && Number(chapter) <= maxChapter) {
    return { kind: 'body', book, part, chapter, section, subsection };
  }
  return null;
}

/**
 * Walk the unadorned XML. `throughChapter` is the last Book I, Part I chapter to include
 * (the Preface and the contents are always included). Returns passages in book order.
 * Each passage carries `hi` (the italic strings) and `italics` ([start, end] into `passage`).
 * The account file stores the plain passage only. Build and validate derive the spans.
 */
export function extractPassages(xml, { throughChapter = 12 } = {}) {
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>|[^<]+/g;
  const stack = [];
  let inBody = false;
  let noteDepth = 0;
  let sig = null;
  let cap = null;
  let listDepth = 0;
  const passages = [];
  let contentsPartLabel = null;
  let contentsChapterLabel = null;
  const maxChapter = throughChapter;

  const inScope = () => location(stack, inBody, maxChapter);

  const finish = () => {
    if (!cap) return;
    const composed = composePassage(cap.parts);
    const shadow = normalizeWs(decode(cap.parts.map((p) => p.text).join('')));
    const passage = composed.passage;
    const hi = cap.hiRaw.map((h) => normalizeWs(decode(h))).filter((h) => h.length > 0);
    const italics = composed.italics;
    cap = null;
    hiStack = [];
    if (passage !== shadow) {
      throw new Error(`italic composer changed the passage text near sig. ${capSig}`);
    }
    if (!/[A-Za-z0-9]/.test(passage)) return;
    const loc = capLoc;
    passages.push({
      kind: loc.kind,
      element: capElement,
      book: loc.book,
      part: loc.part,
      chapter: loc.chapter,
      section: loc.section,
      subsection: loc.subsection,
      signature: capSig,
      signatureEnd: capSigEnd,
      citation: citationOf(
        { ...loc, partLabel: capPartLabel, chapterLabel: capChapterLabel },
        capSig,
        capSigEnd,
      ),
      passage,
      hi,
      italics,
    });
  };

  let capLoc = null;
  let capElement = null;
  let capSig = null;
  let capSigEnd = null;
  let capPartLabel = null;
  let capChapterLabel = null;
  let hiStack = [];

  const startCap = (element, loc) => {
    cap = { parts: [], hiRaw: [] };
    capElement = element;
    capLoc = loc;
    capSig = sig;
    capSigEnd = sig;
    capPartLabel = loc.kind === 'contents' ? contentsPartLabel : null;
    capChapterLabel = loc.kind === 'contents' ? contentsChapterLabel : null;
    hiStack = [];
  };

  let m;
  while ((m = re.exec(xml))) {
    const tok = m[0];
    if (tok.startsWith('<!--') || tok.startsWith('<![CDATA[')) continue;
    if (tok.startsWith('<')) {
      const isEnd = tok.startsWith('</');
      const name = (tok.match(/^<\/?([A-Za-z][\w:-]*)/) || [])[1];
      if (!name) continue;
      const local = name.includes(':') ? name.slice(name.indexOf(':') + 1) : name;
      if (local === 'note') {
        if (isEnd) noteDepth = Math.max(0, noteDepth - 1);
        else if (!tok.endsWith('/>')) noteDepth += 1;
        continue;
      }
      if (noteDepth) continue;
      if (local === 'body' && !isEnd) { inBody = true; continue; }
      if (local === 'div') {
        if (isEnd) {
          const top = stack[stack.length - 1];
          if (top?.type === 'chapter' && inBody && top.n === String(maxChapter)) {
            stack.pop();
            // Chapters after this one stay out of scope because the chapter test fails.
          } else stack.pop();
        } else if (!tok.endsWith('/>')) {
          stack.push({ type: attr(tok, 'type'), n: attr(tok, 'n') });
        }
        continue;
      }
      if (local === 'pb' && !isEnd) {
        const n = attr(tok, 'n');
        if (n) {
          sig = n;
          if (cap) capSigEnd = n;
        }
        continue;
      }
      if (local === 'hi') {
        if (!isEnd && !tok.endsWith('/>')) {
          if (cap) hiStack.push({ raw: [] });
        } else if (isEnd && cap && hiStack.length) {
          cap.hiRaw.push(hiStack.pop().raw.join(''));
        }
        continue;
      }
      if (local === 'list') {
        if (!isEnd && !tok.endsWith('/>')) {
          listDepth += 1;
          const loc = inScope();
          if (loc?.kind === 'body' && !cap) startCap('list', loc);
        } else if (isEnd) {
          listDepth = Math.max(0, listDepth - 1);
          if (cap && capElement === 'list' && listDepth === 0) finish();
        }
        continue;
      }
      if (!isEnd && !tok.endsWith('/>')) {
        const loc = inScope();
        if (!cap && loc) {
          if (local === 'p') startCap('p', loc);
          else if (local === 'head') startCap('head', loc);
          else if (local === 'item' && loc.kind === 'contents') startCap('item', loc);
        }
      } else if (isEnd && cap && local === capElement && !(capElement === 'list')) {
        finish();
      }
      continue;
    }
    if (noteDepth || !cap) continue;
    const italic = hiStack.length > 0;
    cap.parts.push({ text: tok, italic });
    if (italic) {
      for (const h of hiStack) h.raw.push(tok);
    }
  }
  if (cap) finish();

  // Contents chapter labels are known only after the head is stored. Fill them
  // onto the following items by a second pass over contents heads.
  let partLabel = null;
  let chapterLabel = null;
  for (const p of passages) {
    if (p.kind !== 'contents') continue;
    if (p.element === 'head') {
      const t = p.passage;
      if (/part of the historie/i.test(t) && /booke/i.test(t)) {
        const part = t.match(/\b(first|second|third|fourth|fifth)\s+part\b/i);
        const partRoman = { first: 'I', second: 'II', third: 'III', fourth: 'IV', fifth: 'V' };
        partLabel = part ? `Part ${partRoman[part[1].toLowerCase()]}` : null;
        chapterLabel = null;
      }
      const chap = t.match(/\b(?:CHAPTER|CHAP\.)\s+([IVXLC]+)\b/);
      if (chap) chapterLabel = `Chapter ${chap[1]}`;
      p.partLabel = partLabel;
      p.chapterLabel = chapterLabel;
    } else {
      p.partLabel = partLabel;
      p.chapterLabel = chapterLabel;
    }
    p.citation = citationOf(
      { kind: 'contents', book: p.book, partLabel: p.partLabel, chapterLabel: p.chapterLabel },
      p.signature,
      p.signatureEnd,
    );
  }

  passages.forEach((p, i) => {
    p.order = i + 1;
    p.id = `p${String(i + 1).padStart(5, '0')}`;
    delete p.partLabel;
    delete p.chapterLabel;
  });
  return passages;
}

/** Note-stripped, tag-stripped, whitespace-normalised text of the whole file. */
export function normalizedDocumentText(xml) {
  let noteDepth = 0;
  let out = '';
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>|[^<]+/g;
  let m;
  while ((m = re.exec(xml))) {
    const tok = m[0];
    if (tok.startsWith('<!--') || tok.startsWith('<![CDATA[')) continue;
    if (tok.startsWith('<')) {
      const isEnd = tok.startsWith('</');
      const name = (tok.match(/^<\/?([A-Za-z][\w:-]*)/) || [])[1];
      const local = name && name.includes(':') ? name.slice(name.indexOf(':') + 1) : name;
      if (local === 'note') {
        if (isEnd) noteDepth = Math.max(0, noteDepth - 1);
        else if (!tok.endsWith('/>')) noteDepth += 1;
      }
      continue;
    }
    if (!noteDepth) out += tok;
  }
  return normalizeWs(decode(out));
}

export function loadXml(root) {
  return readFileSync(join(root, XML_REL), 'utf8');
}

/**
 * The stored passage text must match the extract in order, and every `<hi>`
 * string must sit inside a derived italic span. The account file does not store the spans.
 */
export function alignStoredPassages(stored, extracted) {
  const errors = [];
  if (!Array.isArray(stored) || stored.length !== extracted.length) {
    errors.push(`1617 extract has ${extracted.length} passages; the account file has ${stored?.length ?? 0}`);
    return errors;
  }
  for (let i = 0; i < stored.length; i += 1) {
    const s = stored[i];
    const e = extracted[i];
    const id = s?.id || `#${i + 1}`;
    if (e.passage !== s.passage) errors.push(`${id}: extracted text does not match the stored passage`);
    if (e.citation !== s.citation) errors.push(`${id}: citation ${JSON.stringify(e.citation)} does not match the stored citation`);
    if (e.signature !== s.signature) errors.push(`${id}: signature ${e.signature} does not match ${s.signature}`);
    for (const msg of italicCoverageErrors(e.passage, e.italics, e.hi)) errors.push(`${id}: ${msg}`);
  }
  return errors;
}
