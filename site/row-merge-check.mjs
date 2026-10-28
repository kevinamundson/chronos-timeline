// Self-test for the built pages. One name row per Form + Writing + Kind.
// One top-level date row per author. Footnote disclosures exist and are closed.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'pagefind' || name === 'assets') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
  return match ? match[1] : null;
}

export function checkRowMerge(distDir) {
  const errors = [];
  const files = walk(distDir);
  let nameTables = 0;
  let dateTables = 0;
  let footnoteBlocks = 0;
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const where = file.slice(distDir.length);
    const nameBits = html.match(/<table class="chron names">[\s\S]*?<\/table>/g) || [];
    for (const table of nameBits) {
      nameTables += 1;
      const body = table.match(/<tbody>([\s\S]*?)<\/tbody>/);
      const rows = body ? [...body[1].matchAll(/<tr\b([^>]*)>/g)] : [];
      if (!rows.length) errors.push(`${where}: name table has no rows`);
      const keys = [];
      for (const row of rows) {
        const key = attr(row[1], 'data-spelling');
        if (!key) errors.push(`${where}: name row has no Form + Writing + Kind key`);
        else keys.push(key);
      }
      const seen = new Set();
      for (const key of keys) {
        if (seen.has(key)) errors.push(`${where}: duplicate spelling ${key.replaceAll('\u001f', ' / ')}`);
        seen.add(key);
      }
      if (/class="fn"/.test(table)) {
        const notes = html.match(/<details\b[^>]*class="name-notes-twirl"[^>]*>/g) || [];
        if (notes.length !== 1) errors.push(`${where}: expected one footnote disclosure, found ${notes.length}`);
        else if (/(?:^|\s)open(?:\s|=|>|$)/.test(notes[0])) errors.push(`${where}: footnote disclosure is open by default`);
        footnoteBlocks += 1;
        const hrefs = [...table.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
        for (const id of hrefs) {
          if (!html.includes(`id="${id}"`)) errors.push(`${where}: footnote marker #${id} has no note`);
        }
      }
    }
    if (/<details\b[^>]*class="name-notes-twirl"[^>]*\sopen[\s>]/.test(html)) errors.push(`${where}: footnote disclosure is open by default`);
    const dateBits = html.match(/<table class="chron">[\s\S]*?<\/table>/g) || [];
    for (const table of dateBits) {
      if (!table.includes('>Chronology</th>')) continue;
      dateTables += 1;
      const body = table.match(/<tbody>([\s\S]*?)<\/tbody>/);
      if (!body) {
        errors.push(`${where}: chronology table has no body`);
        continue;
      }
      const authors = [];
      for (const row of body[1].matchAll(/<tr\b([^>]*)>/g)) {
        const top = attr(row[1], 'data-author');
        const sub = attr(row[1], 'data-author-sub');
        if (top && sub) errors.push(`${where}: a date row is both top-level and a sub-row (${top})`);
        else if (top) authors.push(top);
        else if (!sub) errors.push(`${where}: date row is not tied to an author`);
        else if (!authors.includes(sub)) errors.push(`${where}: sub-row ${sub} has no author row`);
      }
      const seen = new Set();
      for (const author of authors) {
        if (seen.has(author)) errors.push(`${where}: two top-level rows for ${author}`);
        seen.add(author);
      }
    }
  }
  return { errors, files: files.length, nameTables, dateTables, footnoteBlocks };
}
