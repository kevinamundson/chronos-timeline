// Phase 5: per-king rows of the OSF king-list and supplementary tables (CFAH-7A/7B, 8–11, 13–17, 19).
// Table rows live in osf-tables/<id>.json (cells copied verbatim from the OSF PDFs). Person matching lives in
// osf-kings-map.mjs. Rules: a row with a BC year printed in the table becomes a person reign entry
// (cfah_basis paper_text, cfah_preprint); a row with regnal lengths only, or a group/gap row, is listed in
// data/king-lists.json without a person record. No BC year is ever computed from a length here.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OSF } from './papers.mjs';
import { MAP, SAME } from './osf-kings-map.mjs';

const BLANK = new Set(['-', '–', '- *', '']);
export const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[ʿ'’‘]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const yearsIn = (s) => [...String(s).matchAll(/(?<![\d.])(\d{3,4})(?![\d.])/g)].map((m) => +m[1]);

export function loadTables(dir) {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
}

// Split "A / B / C" or "EKL #12 Chnubus = Intef III" into a primary name and alternates.
function names(row, t) {
  const m = row.name.match(/^EKL #(\S+) (.+?) = (.+)$/);
  if (m) return { primary: m[3].replace(/ \?$/, ''), alt: [m[2], `EKL #${m[1]}`] };
  const parts = row.name.split(/ \/ | = |, aka /).map((x) => x.trim()).filter(Boolean);
  return { primary: parts[0], alt: parts.slice(1) };
}

export function buildPhase5(tables, existingIds) {
  const items = []; const lists = []; const problems = []; const people = {};
  for (const t of tables) {
    const m = MAP[t.id] || {};
    const meta = OSF[t.src]; if (!meta) problems.push(`${t.id}: unknown OSF source ${t.src}`);
    const pages = t.pages.length > 1 ? `pp. ${t.pages[0]}–${t.pages[t.pages.length - 1]}` : `p. ${t.pages[0]}`;
    const where = `${t.table} "${t.title}", ${pages}`;
    const list = { id: t.id, title: `CFAH-${meta?.n}: ${t.title} (${t.table})`, region: t.region || '', source: t.src, citation_short: `CFAH-${meta?.n}, OSF preprint ${meta?.ver}, ${t.table}, ${pages}`, preprint: true, entries: [], unrecorded_reason: null };
    const reasons = new Set();
    for (const row of t.rows) {
      const spec = m[row.name];
      const cellText = Object.entries(row.cells).filter(([, v]) => !BLANK.has(v)).map(([k, v]) => `${k}: ${v}`).join('; ');
      const ys = t.kind === 'dated' ? Object.values(row.cells).flatMap(yearsIn) : [];
      const entry = { name: row.name, dates: t.kind === 'dated' && cellText ? cellText : null };
      if (t.kind !== 'dated' && cellText) entry.lengths = cellText;
      if (typeof spec === 'object' && spec?.list) { entry.note = spec.list; reasons.add(spec.list); list.entries.push(entry); continue; }
      if (t.kind !== 'dated' || !ys.length) {
        const r = t.kind !== 'dated' ? 'Regnal lengths only in this table, so no person record (no BC year is computed from lengths).' : 'No BC year printed for this row, so no person record.';
        entry.note = r; reasons.add(r); list.entries.push(entry); continue;
      }
      const nm = names(row, t);
      let id = typeof spec === 'string' ? spec : spec?.id || slug(nm.primary);
      id = SAME[id] || id;
      if (!spec && existingIds.has(id) && !people[id]) problems.push(`${t.id}: "${row.name}" -> ${id} collides with an existing record; map it explicitly in osf-kings-map.mjs`);
      const y = -ys[0]; let yEnd = ys.length > 1 ? -ys[ys.length - 1] : null; let note = spec?.note || null;
      if (yEnd != null && yEnd < y) { note = [note, `The table's last year (${-yEnd}) is earlier than its first (${-y}), so only the first is used for the timeline.`].filter(Boolean).join(' '); yEnd = null; }
      const approx = /~|c\.|\?|unknown|unkown|±|\[|>|</.test(cellText);
      const create = { title: spec?.title || nm.primary, alt_names: (spec?.alt || nm.alt).length ? (spec?.alt || nm.alt) : undefined, dynasty: spec?.dynasty || t.dynasty,
        summary: spec?.summary || `${t.dynasty.startsWith('Egypt') ? 'King' : 'Ruler'} listed in CFAH-${meta?.n} ${t.table} (${t.dynasty}).`,
        description: `${spec?.summary || `Ruler of ${t.dynasty}.`} Person record added by the CFAH pass from the per-king rows of the OSF preprint CFAH-${meta?.n} (${t.table}, "${t.title}"); its dates are display only.`, events: spec?.events || [] };
      if (!create.alt_names) delete create.alt_names;
      people[id] ||= [];
      people[id].push(t.id);
      items.push({ key: `osf:${t.id}:${slug(row.name).slice(0, 60)}`, src: t.src, where, date: cellText, y, yEnd, precision: approx ? 'approximate' : yEnd != null ? 'year-range' : 'year', target: id, kind: 'person', slot: 'reign', create,
        locator: `${t.table}, ${pages}`, note: [`Row "${row.name}" of ${t.table} (${t.dynasty}).`, note].filter(Boolean).join(' ') });
      entry.person = id; list.entries.push(entry);
    }
    lists.push(list);
  }
  return { items, lists, problems, people };
}
