// Minimal zero-dependency Markdown renderer for the Library reader.
// Covers only the constructs the in-repo full texts use (Jordan books and
// the Biblical Chronology newsletter): headings, paragraphs, bold/italic,
// inline code, links, autolinks, blockquotes, flat and one-level nested
// lists, fenced code, horizontal rules, and pipe tables. Anything else is
// rendered as plain paragraph text, never dropped.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
// Titles pulled back out of rendered HTML carry the entities esc() put in.
const unesc = (s) => String(s ?? '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// Inline formatting. Code spans and autolinks are lifted out first so
// their contents are never re-processed or escaped twice.
export function mdInline(text) {
  const stash = [];
  const put = (html) => { stash.push(html); return `\u0000${stash.length - 1}\u0000`; };
  let s = String(text ?? '');
  s = s.replace(/`([^`\n]+)`/g, (_, code) => put(`<code>${esc(code)}</code>`));
  s = s.replace(/<(https?:\/\/[^<>\s]+)>/g, (_, url) => put(`<a href="${esc(url)}" rel="noopener" target="_blank">${esc(url)}</a>`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, href) => {
    const inner = mdInline(label);
    return /^https?:\/\//.test(href) || href.startsWith('#')
      ? put(`<a href="${esc(href)}"${href.startsWith('#') ? '' : ' rel="noopener" target="_blank"'}>${inner}</a>`)
      : put(`<a href="${esc(href)}">${inner}</a>`);
  });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^\w_])_([^_\n]+)_/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
}

const isTableSep = (line) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');
const splitRow = (line) => {
  let cells = line.trim().replace(/^\||\|$/g, '').split('|');
  return cells.map((c) => c.trim());
};

function renderTable(lines) {
  const head = splitRow(lines[0]).map((c) => `<th scope="col">${mdInline(c)}</th>`).join('');
  const rows = lines.slice(2).map((l) => `<tr>${splitRow(l).map((c) => `<td>${mdInline(c)}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table class="chron"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

// Parse a Markdown document into { title, blocks } where blocks are HTML
// strings. The first H1 is taken as the title and is not rendered.
// { demoteH1: true } renders later H1s as H2 (the newsletter issues repeat
// their masthead as an H1 inside the body).
export function mdParse(src, { demoteH1 = false } = {}) {
  const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
  let title = null;
  const blocks = [];
  let para = [];
  let quote = [];
  let fence = null;
  let list = null; // { ordered, items: [{ text, sub: [] }] }
  const flushPara = () => { if (para.length) { blocks.push(`<p>${mdInline(para.join(' '))}</p>`); para = []; } };
  const flushQuote = () => { if (quote.length) { blocks.push(`<blockquote>${quote.map((q) => `<p>${mdInline(q)}</p>`).join('')}</blockquote>`); quote = []; } };
  const flushList = () => {
    if (!list) return;
    const tag = list.ordered ? 'ol' : 'ul';
    const items = list.items.map((it) => `<li>${mdInline(it.text)}${it.sub.length ? `<ul>${it.sub.map((s) => `<li>${mdInline(s)}</li>`).join('')}</ul>` : ''}</li>`).join('');
    blocks.push(`<${tag}>${items}</${tag}>`);
    list = null;
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (fence !== null) {
      if (/^```/.test(line)) { blocks.push(`<pre><code>${esc(fence.join('\n'))}</code></pre>`); fence = null; }
      else fence.push(line);
      continue;
    }
    if (/^```/.test(line)) { flushPara(); flushQuote(); flushList(); fence = []; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara(); flushQuote(); flushList();
      if (h[1].length === 1 && title === null) { title = h[2].trim(); continue; }
      const level = h[1].length === 1 && demoteH1 ? 2 : h[1].length;
      blocks.push(`<h${level}>${mdInline(h[2].trim())}</h${level}>`);
      continue;
    }
    if (/^\s*---+\s*$/.test(line)) { flushPara(); flushQuote(); flushList(); blocks.push('<hr>'); continue; }
    if (/^>\s?/.test(line)) { flushPara(); flushList(); quote.push(line.replace(/^>\s?/, '')); continue; }
    if (quote.length && line.trim() === '') { flushQuote(); continue; }
    // A line of dashes is a diagram or rule in the plain-text extractions,
    // not a list item ("- - - - Post Fall").
    const li = !/^\s*[-*+]\s+[-*+]/.test(line) ? line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/) : null;
    if (li) {
      flushPara(); flushQuote();
      const indent = li[1].length;
      const ordered = /^\d/.test(li[2]);
      if (!list || list.ordered !== ordered || indent === 0) {
        if (indent === 0) { flushList(); list = { ordered, items: [] }; }
      }
      if (!list) list = { ordered, items: [] };
      if (indent > 0 && list.items.length) list.items[list.items.length - 1].sub.push(li[3]);
      else list.items.push({ text: li[3], sub: [] });
      continue;
    }
    if (line.trim() === '') { flushPara(); flushQuote(); flushList(); continue; }
    // Pipe table: a header row followed by a separator row.
    if (line.includes('|') && isTableSep(lines[i + 1] || '')) {
      flushPara(); flushQuote(); flushList();
      const rows = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].includes('|')) { rows.push(lines[j]); j += 1; }
      blocks.push(renderTable(rows));
      i = j - 1;
      continue;
    }
    para.push(line.trim());
  }
  flushPara(); flushQuote(); flushList();
  if (fence !== null) blocks.push(`<pre><code>${esc(fence.join('\n'))}</code></pre>`);
  return { title, blocks };
}

// Render a whole document to HTML. Options: { stripTitle: true } drops the
// first H1 (used as the page title instead).
export function mdToHtml(src, { stripTitle = true } = {}) {
  const { title, blocks } = mdParse(src);
  return { title, html: blocks.join('\n') };
}

// Split already-parsed blocks at their H2 headings. Returns [{ title, html }]
// in order; content before the first H2 goes into the first unit. A document
// with no H2 returns a single unit.
export function splitBlocksH2(blocks, title) {
  const units = [];
  let cur = null;
  for (const b of blocks) {
    const h2 = b.match(/^<h2>(.*)<\/h2>$/);
    if (h2) { cur = { title: unesc(h2[1].replace(/<[^>]+>/g, '')), html: '' }; units.push(cur); continue; }
    if (!cur) { cur = { title: title || '', html: '', front: true }; units.push(cur); }
    cur.html += (cur.html ? '\n' : '') + b;
  }
  const kept = units.filter((u) => u.html.trim() || units.length === 1);
  // Content before the first H2 is front matter (title page, publication
  // data, extraction note), not a chapter. A first unit that starts at an
  // H2 keeps its heading.
  if (kept.length > 1 && kept[0].front) kept[0].title = 'Front matter';
  return { title, units: kept };
}

// Split a document at its H2 headings (see splitBlocksH2).
export function mdSplitH2(src, opts) {
  const { title, blocks } = mdParse(src, opts);
  return { title, units: splitBlocksH2(blocks, title).units };
}
