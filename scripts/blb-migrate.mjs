#!/usr/bin/env node
// One-off (idempotent) migration: rewrite every Scripture link in data/ to the Berean Literal Bible on BibleHub.
//   node scripts/blb-migrate.mjs [--dry]
// - chronology entries (bible / masoretic-genealogy / anything whose link is a non-BLB Scripture text): link ← first
//   reference in `citation` (fallback: the record's first scripture_ref)
// - free_source_links {source_id: kjv-gutenberg}: source_id ← blb-biblehub, url ← first reference in `locator`
// - record `sources` lists: kjv-gutenberg ← blb-biblehub
// Source provenance fields (source_text_id, chronology `references`) are left alone: the figures were read from the KJV.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blbFromText, blbFromOsis, isNonBlbScripture } from './blb.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
let changed = 0, files = 0; const unmapped = [], log = [];

for (const f of walk(join(root, 'data')).filter((f) => f.endsWith('.json') && !f.endsWith('sources.json'))) {
  const doc = JSON.parse(readFileSync(f, 'utf8'));
  const fallback = doc.scripture_refs?.length ? blbFromOsis(doc.scripture_refs[0]) : null;
  let n = 0;
  const visit = (o) => {
    if (Array.isArray(o)) return o.forEach(visit);
    if (!o || typeof o !== 'object') return;
    if (o.source_id === 'kjv-gutenberg' && 'url' in o) {
      const u = blbFromText(o.locator) || fallback;
      if (u) { log.push([f, o.locator, o.url, u]); o.source_id = 'blb-biblehub'; o.url = u; n++; } else unmapped.push([f, 'free_source_links', o.locator]);
    }
    if (Array.isArray(o.sources) && o.sources.includes('kjv-gutenberg')) {
      o.sources = [...new Set(o.sources.map((x) => (x === 'kjv-gutenberg' ? 'blb-biblehub' : x)))]; n++; log.push([f, 'sources[]', 'kjv-gutenberg', 'blb-biblehub']);
    }
    for (const k of ['link', 'url']) {
      if (typeof o[k] === 'string' && isNonBlbScripture(o[k])) {
        const u = blbFromText(o.citation) || blbFromText(o.locator) || fallback;
        if (u) { log.push([f, o.citation || o.locator, o[k], u]); o[k] = u; n++; } else unmapped.push([f, k, o.citation || o.locator || '(no citation)']);
      }
    }
    Object.values(o).forEach(visit);
  };
  visit(doc);
  if (n) { changed += n; files++; if (!dry) writeFileSync(f, JSON.stringify(doc, null, 2) + '\n'); }
}
writeFileSync(join(root, 'tmp-blb-migration.tsv'), log.map((r) => r.map((x) => String(x).replace(root + '/', '')).join('\t')).join('\n') + '\n');
console.log(`${dry ? '[dry] ' : ''}${changed} links rewritten in ${files} files; ${unmapped.length} unmapped`);
for (const u of unmapped) console.log('UNMAPPED', ...u);
