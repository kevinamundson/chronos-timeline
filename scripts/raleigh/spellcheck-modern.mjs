// Spellcheck for the stored modern edition of Raleigh's History of the World.
// Runs nspell (en-US + en-GB) over the stored modern files
// (data/raleigh-modern/index.json, the same model as the Markdown files)
// and reports every word that is neither in the dictionaries nor in the
// allowlist (scripts/raleigh/modern-allowlist.txt).
//
// Usage:
//   node scripts/raleigh/spellcheck-modern.mjs [--json]
// Exit code 0 when nothing is flagged; 1 when flagged words remain.
// The allowlist is only for: proper names in modern form, Latin/Greek/
// foreign quotations, and the original-name references.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import nspell from 'nspell';
import dictUS from 'dictionary-en';
import dictGB from 'dictionary-en-gb';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const us = nspell(dictUS);
const gb = nspell(dictGB);

function loadAllowlist() {
  const out = new Set();
  for (const line of readFileSync(join(here, 'modern-allowlist.txt'), 'utf8').split('\n')) {
    const w = line.trim().toLowerCase();
    if (!w || w.startsWith('#')) continue;
    out.add(w);
  }
  return out;
}

// A word passes when the dictionary has it (either spelling), the allowlist
// has it, or it is a possessive/plural whose stem passes.
function passes(word, allow) {
  const w = word.toLowerCase();
  if (allow.has(w)) return true;
  if (us.correct(w) || gb.correct(w)) return true;
  if (w.endsWith("'s") || w.endsWith('’s')) {
    const stem = w.slice(0, -2);
    if (allow.has(stem) || us.correct(stem) || gb.correct(stem)) return true;
  }
  if (w.endsWith("'") || w.endsWith('’')) {
    const stem = w.slice(0, -1);
    if (allow.has(stem) || us.correct(stem) || gb.correct(stem)) return true;
  }
  return false;
}

export function spellcheckModern() {
  const allow = loadAllowlist();
  const index = JSON.parse(readFileSync(join(root, 'data', 'raleigh-modern', 'index.json'), 'utf8'));
  let total = 0;
  const flagged = new Map();
  for (const [id, p] of Object.entries(index.passages)) {
    const text = p.modernText || '';
    for (const m of text.matchAll(/[\p{L}]+(?:['\u2019][\p{L}]+)?/gu)) {
      const w = m[0];
      total += 1;
      if (passes(w, allow)) continue;
      const lower = w.toLowerCase().replace(/\u2019/g, "'");
      const f = flagged.get(lower) || { count: 0, samples: [] };
      f.count += 1;
      if (f.samples.length < 2) {
        f.samples.push({ id, ctx: text.slice(Math.max(0, m.index - 60), m.index + 80) });
      }
      flagged.set(lower, f);
    }
  }
  const list = [...flagged.entries()]
    .map(([word, f]) => ({ word, count: f.count, samples: f.samples }))
    .sort((a, b) => b.count - a.count);
  return { total, flagged: list };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { total, flagged } = spellcheckModern();
  const occ = flagged.reduce((a, f) => a + f.count, 0);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ total, flaggedOccurrences: occ, distinct: flagged.length, flagged }, null, 1));
  } else {
    console.log(`words checked: ${total}`);
    console.log(`flagged occurrences: ${occ}`);
    console.log(`distinct flagged words: ${flagged.length}`);
    for (const f of flagged.slice(0, 60)) console.log(`  ${f.word} ${f.count}  ${f.samples[0] ? f.samples[0].id : ''}`);
    if (flagged.length > 60) console.log(`  ... and ${flagged.length - 60} more`);
  }
  process.exit(flagged.length ? 1 : 0);
}
