// Inline person and event links for Raleigh's chronological table.
// Uses the existing name linker and overrides. A token that matches more than
// one record stays plain. An event phrase is used only when exactly one event
// stores that Chronological Table date. Name-and-age cells such as "1. Seth 912"
// keep the person link; they are not wrapped as a birth event.
import { foldPersonToken } from '../names/link.mjs';
import { modernizeCell } from './spelling.mjs';
import { RALEIGH_SOURCE } from './derived-year.mjs';

const SKIP_FOLDS = new Set(['julian', 'iulian', 'lulian', 'world', 'vvorld']);
const NAME_AGE = /^\d+\.?\s+\S/;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function hrefOf(id, type) {
  if (type === 'event') return `/events/${id}/`;
  return `/people/${id}/`;
}

function uniqueEventPhrases(events) {
  const byPhrase = new Map();
  for (const event of events) {
    for (const entry of event.chronologies || []) {
      if (entry.source !== RALEIGH_SOURCE) continue;
      if (!/Chronological Table/.test(entry.citation || '')) continue;
      const phrase = String(entry.date || '').replace(/\s+/g, ' ').trim();
      if (!phrase || NAME_AGE.test(phrase)) continue;
      let bucket = byPhrase.get(phrase);
      if (!bucket) {
        bucket = new Set();
        byPhrase.set(phrase, bucket);
      }
      bucket.add(event.id);
    }
  }
  return [...byPhrase.entries()]
    .filter(([, ids]) => ids.size === 1)
    .map(([phrase, ids]) => ({ phrase, id: [...ids][0], modern: modernizeCell(phrase).modern }))
    .sort((a, b) => b.phrase.length - a.phrase.length);
}

function findPhrase(text, phrase) {
  if (!phrase) return null;
  const hay = String(text || '');
  const at = hay.indexOf(phrase);
  if (at >= 0) return { start: at, end: at + phrase.length };
  const foldedHay = hay.toLowerCase();
  const folded = phrase.toLowerCase();
  const i = foldedHay.indexOf(folded);
  if (i >= 0) return { start: i, end: i + phrase.length };
  return null;
}

function overlaps(spans, start, end) {
  return spans.some((s) => start < s.end && end > s.start);
}

export function createTableLinker({ nameLinker, events }) {
  const eventPhrases = uniqueEventPhrases(events || []);
  const linked = [];
  const ambiguous = [];
  const unmatched = [];
  const seen = new Set();
  const note = (list, row) => {
    const key = `${row.kind}|${row.id || row.raw}|${row.unitId}|${row.reason || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(row);
  };

  function linkText(text, unitId) {
    const source = String(text || '');
    if (!source) return '';
    const spans = [];
    for (const phrase of eventPhrases) {
      const hit = findPhrase(source, phrase.phrase) || findPhrase(source, phrase.modern);
      if (!hit || overlaps(spans, hit.start, hit.end)) continue;
      spans.push({
        start: hit.start,
        end: hit.end,
        href: hrefOf(phrase.id, 'event'),
        id: phrase.id,
        type: 'event',
        raw: source.slice(hit.start, hit.end),
      });
      note(linked, { kind: 'event', id: phrase.id, raw: source.slice(hit.start, hit.end), unitId, reason: 'Unique Chronological Table date on this event.' });
    }
    const unit = { id: unitId, text: source, linkedIds: [], kind: 'table' };
    const result = nameLinker.resolve(unit);
    let from = 0;
    for (const row of result.resolved) {
      const fold = foldPersonToken(row.raw);
      if (SKIP_FOLDS.has(fold) || fold.split(/\s+/).every((w) => SKIP_FOLDS.has(w))) continue;
      const at = source.indexOf(row.raw, from);
      if (at < 0) continue;
      const end = at + row.raw.length;
      from = end;
      if (overlaps(spans, at, end)) continue;
      spans.push({
        start: at,
        end,
        href: hrefOf(row.personId, 'person'),
        id: row.personId,
        type: 'person',
        raw: row.raw,
      });
      note(linked, { kind: 'person', id: row.personId, raw: row.raw, unitId, reason: row.reason });
    }
    for (const row of result.unlinked) {
      note(ambiguous, {
        kind: 'person',
        raw: row.raw,
        candidates: row.candidates,
        unitId,
        excerpt: source.replace(/\s+/g, ' ').trim().slice(0, 160),
        reason: row.reason,
      });
    }
    for (const row of result.unmatched) {
      if (SKIP_FOLDS.has(row.fold) || row.fold.length < 3) continue;
      note(unmatched, {
        kind: 'person',
        raw: row.raw,
        unitId,
        excerpt: source.replace(/\s+/g, ' ').trim().slice(0, 160),
        reason: 'No person record matches this name.',
      });
    }
    spans.sort((a, b) => a.start - b.start || b.end - a.end);
    let html = '';
    let i = 0;
    for (const span of spans) {
      if (span.start < i) continue;
      html += esc(source.slice(i, span.start));
      html += `<a href="${esc(span.href)}">${esc(source.slice(span.start, span.end))}</a>`;
      i = span.end;
    }
    html += esc(source.slice(i));
    return html;
  }

  return {
    linkText,
    report: () => ({
      linked: linked.length,
      ambiguous: ambiguous.slice(),
      unmatched: unmatched.slice(),
      eventPhrases: eventPhrases.map((p) => p.phrase),
    }),
  };
}
