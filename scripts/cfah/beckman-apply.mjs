#!/usr/bin/env node
// Apply Griffith & White's Reply to Beckman (scripts/cfah/beckman-reply.mjs) as tier 2 CFAH entries
// (cfah_basis "beckman_reply"). Idempotent: entries are keyed by cfah_key "cfah:beckman:<k>".
//   node scripts/cfah/beckman-apply.mjs && node scripts/standby/compute.mjs
// A CFAH anchor point or CFAH-1 Table 1 row already on a record stays first, so it keeps governing the sort.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITEMS, NEW_PEOPLE, PARTS, citationOf } from './beckman-reply.mjs';
import { tierPick, personTierSort } from '../sort-rule.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = join(ROOT, 'data');
const TODAY = '2026-11-13';
const sources = JSON.parse(readFileSync(join(DATA, 'sources.json'), 'utf8')).sources;
const srcUrl = (id) => sources.find((s) => s.id === id)?.url;

const recs = {};
for (const dir of ['events', 'people']) {
  for (const f of readdirSync(join(DATA, dir)).filter((x) => x.endsWith('.json'))) {
    const doc = JSON.parse(readFileSync(join(DATA, dir, f), 'utf8'));
    recs[`${doc.type}:${doc.id}`] = { dir, doc, dirty: false };
  }
}
const created = new Set();
const touch = (key) => { recs[key].dirty = true; };

function newPerson(p) {
  return {
    $schema: '../../schema/person.schema.json', id: p.id, type: 'person', title: p.title, summary: p.summary,
    description: `${p.description} Person record added from Griffith & White’s Reply to Beckman (OSF project 5b64m) on ${TODAY}.`,
    sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a birth year.' },
    father: null, children: [], dates: {}, events: [], scripture_refs: [], sources: [], related: [], free_source_links: [], dynasty: p.dynasty,
  };
}
function newEvent(id, it) {
  const c = it.create;
  return {
    $schema: '../../schema/event.schema.json', id, type: 'event', title: c.title, summary: c.summary,
    description: `${c.summary} Event record added from Griffith & White’s Reply to Beckman, Part ${it.part} (${it.loc}).`,
    sorting_year: null, sorting_basis: { tier: 'none', tier_rank: null, chronology: 'cfah', note: 'No tier gives a year.' },
    chronologies: [], people: c.people || [], locations: [], maps: [], scripture_refs: c.scripture_refs || [], sources: [], related: [], free_source_links: [],
  };
}

for (const p of NEW_PEOPLE) {
  const key = `person:${p.id}`;
  if (!recs[key]) { recs[key] = { dir: 'people', doc: newPerson(p), dirty: true }; created.add(key); }
}

const isLead = (e) => e.source === 'cfah' && e.date != null && ['anchor_point', 'table1_baseline', 'beckman_reply'].includes(e.cfah_basis);
const counts = { entries: 0, newEvents: 0, newPeople: created.size };
for (const it of ITEMS) {
  const [kind, rest] = it.t.split(':');
  const [id, slot] = rest.split('#');
  const key = `${kind}:${id}`;
  if (!recs[key]) {
    if (kind !== 'event' || !it.create) throw new Error(`${it.k}: ${key} does not exist and has no create block`);
    recs[key] = { dir: 'events', doc: newEvent(id, it), dirty: true }; created.add(key); counts.newEvents++;
  }
  const doc = recs[key].doc;
  const p = PARTS[it.part];
  const entry = {
    source: 'cfah', date: it.date, year_am: null, year_bc_ad: it.y,
    ...(it.end != null ? { year_bc_ad_end: it.end } : {}),
    precision: it.prec, citation: citationOf(it.part, it.loc), link: p.osf, source_text_id: p.src, note: it.note,
    cfah_basis: 'beckman_reply', cfah_key: `cfah:beckman:${it.k}`,
  };
  let list = kind === 'event' ? doc.chronologies : ((doc.dates ||= {})[slot] ||= []);
  list = list.filter((e) => e.cfah_key !== entry.cfah_key && !(e.source === 'cfah' && e.date == null));
  let at = 0;
  list.forEach((e, i) => { if (isLead(e)) at = i + 1; });
  list.splice(at, 0, entry);
  if (kind === 'event') doc.chronologies = list; else doc.dates[slot] = list;
  doc.sources ||= [];
  if (!doc.sources.includes(p.src)) doc.sources.push(p.src);
  doc.free_source_links ||= [];
  if (!doc.free_source_links.some((l) => l.source_id === p.src)) doc.free_source_links.push({ source_id: p.src, url: srcUrl(p.src), locator: it.loc });
  if (kind === 'event') {
    for (const pid of it.create?.people || []) {
      const pr = recs[`person:${pid}`];
      if (!pr) throw new Error(`${it.k}: unknown person ${pid}`);
      pr.doc.events ||= [];
      if (!pr.doc.events.includes(id)) { pr.doc.events.push(id); touch(`person:${pid}`); }
    }
  }
  touch(key); counts.entries++;
}

// Re-sort every touched record with the shared rule.
const yl = (y) => (y == null ? 'none' : y < 0 ? `${-y} BC` : `AD ${y}`);
const changes = [];
for (const [key, r] of Object.entries(recs)) {
  if (!r.dirty) continue;
  const d = r.doc;
  const pick = d.type === 'person' ? personTierSort(d) : tierPick(d.chronologies);
  if (!pick) continue;
  const b = d.sorting_basis || {};
  const same = b.tier === pick.tier && b.tier_rank === pick.rank && b.chronology === pick.chronology && d.sorting_year === pick.year && (pick.slot !== 'reign_start' || b.slot === 'reign_start');
  if (same) continue;
  const e = pick.entry;
  const label = e.cfah_basis === 'beckman_reply' ? `CFAH Reply to Beckman (Griffith & White, ${PARTS[{ 'griffith-beckman-reply-1': 1, 'griffith-beckman-reply-2': 2, 'griffith-beckman-reply-3': 3 }[e.source_text_id]].title.split(':')[0]}): ${e.date}` : `${pick.tier}: ${e.date}`;
  const was = created.has(key) ? null : `${b.tier || 'none'} ${yl(d.sorting_year)}`;
  const nb = { tier: pick.tier, tier_rank: pick.rank, chronology: pick.chronology };
  if (pick.slot === 'reign_start') {
    nb.slot = 'reign_start';
    nb.note = `Sorted by reign start (Tier ${pick.rank}, ${label}). No tier 1–4 birth year.`;
  } else nb.note = `Tier ${pick.rank}: ${label}.`;
  if (was) nb.note += ` Sort changed by the Reply to Beckman pass (${TODAY}): was ${was}.`;
  changes.push({ id: d.id, type: d.type, from: was, to: `${pick.tier} ${yl(pick.year)}` });
  d.sorting_basis = nb;
  d.sorting_year = pick.year;
}

for (const r of Object.values(recs)) {
  if (!r.dirty) continue;
  writeFileSync(join(DATA, r.dir, `${r.doc.id}.json`), JSON.stringify(r.doc, null, 2) + '\n');
}
console.log(`Reply to Beckman: ${counts.entries} entries, ${counts.newEvents} new events, ${counts.newPeople} new people.`);
for (const c of changes) console.log(`  ${c.type} ${c.id}: ${c.from ?? '(new)'} -> ${c.to}`);
