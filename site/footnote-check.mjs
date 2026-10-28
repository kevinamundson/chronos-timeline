// Built-page checks: a footnote list must not paint an <ol> marker beside a
// numeric back-link, and a TIPNR "@" id must sit where Cloudflare will not
// rewrite it.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isPublicEmail } from './email-protect.mjs';

const EMAIL_LIKE = /[A-Za-z0-9][A-Za-z0-9._%+\-]*@[A-Za-z0-9][A-Za-z0-9.\-]*\.[A-Za-z0-9][A-Za-z0-9.\-]*/g;
const TIPNR_ID = /[A-Za-z][A-Za-z0-9]*@[1-3]?[A-Za-z][A-Za-z0-9]*\.\d[0-9A-Za-z.\-]*/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'assets') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
  return match ? match[1] : '';
}

function markerSuppressed(className, css) {
  const classes = className.split(/\s+/).filter(Boolean);
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const block of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/list-style\s*:\s*none\b/.test(block[2])) continue;
    for (const raw of block[1].split(',')) {
      const sel = raw.trim();
      if (!sel || /[ >+~]/.test(sel)) continue;
      const tag = /^[a-z]+/.exec(sel)?.[0];
      if (tag && tag !== 'ol') continue;
      const want = [...sel.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
      if (!want.length) continue;
      if (want.every((c) => classes.includes(c))) return true;
    }
  }
  return false;
}

function visibleAnchorText(anchorHtml) {
  return anchorHtml
    .replace(/<span\b[^>]*class="[^"]*\bvisually-hidden\b[^"]*"[^>]*>[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkFootnoteLists(html, where, css, stats) {
  const errors = [];
  for (const ol of html.matchAll(/<ol\b([^>]*)>([\s\S]*?)<\/ol>/g)) {
    const className = attr(ol[1], 'class');
    const lis = [...ol[2].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)];
    const numbers = [];
    for (const li of lis) {
      const anchor = li[2].match(/<a\b([^>]*\bclass="[^"]*\bfn\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/);
      if (!anchor) continue;
      const num = visibleAnchorText(anchor[2]);
      if (!/^\d+$/.test(num)) continue;
      numbers.push(num);
      const hidden = anchor[2].match(/class="[^"]*\bvisually-hidden\b[^"]*"[^>]*>([\s\S]*?)<\/span>/);
      if (!hidden || !/Back to footnote/.test(hidden[1])) errors.push(`${where}: footnote ${num} is missing the hidden “Back to footnote” text`);
      const href = attr(anchor[1], 'href');
      if (!href.endsWith(`-fnref-${num}`)) errors.push(`${where}: footnote ${num} does not link back to its marker`);
      if (!attr(li[1], 'id').endsWith(`-fn-${num}`)) errors.push(`${where}: footnote ${num} has no note id`);
      const visible = li[2]
        .replace(/<span\b[^>]*class="[^"]*\bvisually-hidden\b[^"]*"[^>]*>[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (new RegExp(`^${num}\\s+${num}\\b`).test(visible)) errors.push(`${where}: footnote ${num} repeats its number in the note text`);
    }
    if (!numbers.length) continue;
    stats.footnoteLists += 1;
    stats.byClass[className || '(none)'] = (stats.byClass[className || '(none)'] || 0) + 1;
    const inline = /list-style\s*:\s*none\b/.test(attr(ol[1], 'style'));
    if (!inline && !markerSuppressed(className, css)) errors.push(`${where}: footnote list (${className || 'no class'}) still paints an <ol> marker beside ${numbers[0]}`);
  }
  return errors;
}

function cloudflareVisible(html) {
  return html
    .replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, '')
    .replace(/<head\b[\s\S]*?<\/head>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<textarea\b[\s\S]*?<\/textarea>/gi, '')
    .replace(/<xmp\b[\s\S]*?<\/xmp>/gi, '');
}

function matches(re, blob) {
  re.lastIndex = 0;
  return blob.match(re) || [];
}

function unprotectedIds(html) {
  const visible = cloudflareVisible(html);
  const hrefs = [...visible.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>/gi)].map((m) => m[1]);
  const text = visible.replace(/<[^>]+>/g, ' ');
  const found = new Set();
  for (const blob of [text, ...hrefs]) {
    for (const token of matches(EMAIL_LIKE, blob)) {
      if (!isPublicEmail(token)) found.add(token);
    }
    for (const token of matches(TIPNR_ID, blob)) found.add(token);
  }
  return [...found];
}

export function checkFootnotes(distDir) {
  const cssPath = join(distDir, 'assets', 'styles.css');
  const css = readFileSync(cssPath, 'utf8');
  const footnoteErrors = [];
  const idErrors = [];
  const files = walk(distDir);
  const stats = { files: files.length, footnoteLists: 0, byClass: {}, tipnrPages: 0, tipnrIds: 0 };
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const where = file.slice(distDir.length);
    footnoteErrors.push(...checkFootnoteLists(html, where, css, stats));
    const bare = unprotectedIds(html);
    if (bare.length) idErrors.push(`${where}: unprotected id ${bare.slice(0, 3).join(', ')}`);
    const protectedIds = matches(TIPNR_ID, html);
    if (protectedIds.length) {
      stats.tipnrPages += 1;
      stats.tipnrIds += protectedIds.length;
    }
  }
  if (!stats.footnoteLists) footnoteErrors.push('no footnote list was built');
  if (!stats.tipnrPages) idErrors.push('no built page contains a TIPNR id');
  if (!/ol\.name-notes[^{]*\{[^}]*list-style\s*:\s*none/.test(css)) footnoteErrors.push('styles.css does not set list-style: none on ol.name-notes');
  return { errors: [...footnoteErrors, ...idErrors], footnoteErrors, idErrors, ...stats };
}
