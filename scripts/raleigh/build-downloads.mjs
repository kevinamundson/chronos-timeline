// Build the downloadable modern edition of Raleigh's History of the World.
// Reads the stored modern files (data/raleigh-modern/index.json, the same
// model as the Markdown files) and writes bulk + per-section downloads in
// Markdown, EPUB, PDF, Word (.docx), and TEI-style XML into
// site/dist/downloads/raleigh-modern/ (the site serves them at
// /downloads/raleigh-modern/). Build-time only: static files, no server.
//
// The XML download is a TEI-style document (the repo defines no schema of
// its own for this edition); the choice is recorded in the PR.
// The Markdown download is the stored modern file itself (per-section) and
// the concatenation of the stored files (bulk), so the download matches the
// stored edition exactly.
//
// Usage:
//   node scripts/raleigh/build-downloads.mjs [--out <dir>] [--skip-pdf]
//   --skip-pdf skips PDF generation (slowest format) for a quick check.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PDFDocument from 'pdfkit';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT = outIdx >= 0 ? argv[outIdx + 1] : join(root, 'site', 'dist', 'downloads', 'raleigh-modern');
const SKIP_PDF = argv.includes('--skip-pdf');

const TITLE = 'The History of the World';
const AUTHOR = 'Sir Walter Raleigh';
const EDITION = 'Modern edition (stored), 1617 text in modern spelling';
const SOURCE_NOTE = 'Modernized from the London 1617 edition (Stansby for Walter Burre; EEBO-TCP A10357, STC 20638). Names changed from the original carry the original form in italics; foreign-language quotations are kept as quotations with an English translation alongside.';

const MODERN_DIR = join(root, 'data', 'raleigh-modern');
const index = JSON.parse(readFileSync(join(MODERN_DIR, 'index.json'), 'utf8'));
const passages = index.passages;

// Parse the stored modern HTML (<em> only) into runs: {text, italic}[].
function htmlToRuns(html) {
  const runs = [];
  let buf = '';
  let italic = false;
  const flush = () => { if (buf) { runs.push({ text: buf, italic }); buf = ''; } };
  for (let i = 0; i < html.length;) {
    if (html.startsWith('<em>', i)) { flush(); italic = true; i += 4; continue; }
    if (html.startsWith('</em>', i)) { flush(); italic = false; i += 5; continue; }
    if (html[i] === '<') { const j = html.indexOf('>', i); i = j < 0 ? html.length : j + 1; continue; }
    buf += html[i]; i += 1;
  }
  flush();
  return runs;
}

const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escHtml = escXml;

// The signature ("sig. 3b") is the last comma-separated part of the citation.
function sigOf(p) {
  const parts = (p.citation || '').split(', ');
  return parts.length ? parts[parts.length - 1] : '';
}

// Group passages by file in document order. Each file has one section
// title, taken from the passages' own `section` field.
function sectionsInOrder() {
  const order = [];
  const byFile = new Map();
  for (const id of Object.keys(passages)) {
    const p = passages[id];
    if (!byFile.has(p.file)) { byFile.set(p.file, []); order.push(p.file); }
    byFile.get(p.file).push({ ...p, id });
  }
  return order.map((file) => {
    const ps = byFile.get(file);
    return { file, passages: ps, title: ps[0].section };
  });
}

// Footnotes attached to passages (p.notes, from the stored modern edition).
// Collected per section, in passage order.
function sectionNotes(sec) {
  const out = [];
  for (const p of sec.passages) for (const n of (p.notes || [])) out.push(n);
  return out;
}

// ---------- TEI-style XML ----------
function sectionXml(sec) {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<TEI xmlns="http://www.tei-c.org/ns/1.0">`,
    `  <teiHeader><fileDesc><titleStmt><title>${escXml(TITLE)} — ${escXml(sec.title)}</title><author>${escXml(AUTHOR)}</author></titleStmt><publicationStmt><p>${escXml(EDITION)}.</p></publicationStmt><sourceDesc><p>${escXml(SOURCE_NOTE)}</p></sourceDesc></fileDesc></teiHeader>`,
    `  <text><body><div type="section" n="${escXml(sec.file)}">`,
    `    <head>${escXml(sec.title)}</head>`,
  ];
  for (const p of sec.passages) {
    const runs = htmlToRuns(p.modern || p.modernText);
    const inner = runs.map((r) => (r.italic ? `<hi rend="italic">${escXml(r.text)}</hi>` : escXml(r.text))).join('');
    lines.push(`    <p xml:id="${p.id}" n="${escXml(sigOf(p))}">${inner}</p>`);
  }
  for (const n of sectionNotes(sec)) lines.push(`    <note n="${n.n}">${escXml(n.word)} — ${escXml(n.text)}</note>`);
  lines.push(`  </div></body></text>`, `</TEI>`, '');
  return lines.join('\n');
}

function bulkXml(sections) {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<TEI xmlns="http://www.tei-c.org/ns/1.0">`,
    `  <teiHeader><fileDesc><titleStmt><title>${escXml(TITLE)}</title><author>${escXml(AUTHOR)}</author></titleStmt><publicationStmt><p>${escXml(EDITION)}.</p></publicationStmt><sourceDesc><p>${escXml(SOURCE_NOTE)}</p></sourceDesc></fileDesc></teiHeader>`,
    `  <text><body>`,
  ];
  for (const sec of sections) {
    lines.push(`    <div type="section" n="${escXml(sec.file)}">`, `      <head>${escXml(sec.title)}</head>`);
    for (const p of sec.passages) {
      const runs = htmlToRuns(p.modern || p.modernText);
      const inner = runs.map((r) => (r.italic ? `<hi rend="italic">${escXml(r.text)}</hi>` : escXml(r.text))).join('');
      lines.push(`      <p xml:id="${p.id}" n="${escXml(sigOf(p))}">${inner}</p>`);
    }
    for (const n of sectionNotes(sec)) lines.push(`      <note n="${n.n}">${escXml(n.word)} — ${escXml(n.text)}</note>`);
    lines.push(`    </div>`);
  }
  lines.push(`  </body></text>`, `</TEI>`, '');
  return lines.join('\n');
}

// ---------- EPUB ----------
async function epubFor(title, sections, fileName) {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.folder('META-INF').file('container.xml', `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  const items = [];
  const tocItems = [];
  const xhtml = (t, body) => `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escHtml(t)}</title><style>body{font-family:serif;line-height:1.5}h1,h2{line-height:1.2}.sig{font-size:0.8em;color:#666}</style></head><body>${body}</body></html>`;
  let i = 0;
  for (const sec of sections) {
    i += 1;
    const fname = `s${i}.xhtml`;
    let body = `<h1>${escHtml(sec.title)}</h1>`;
    for (const p of sec.passages) {
      const html = p.modern || escHtml(p.modernText);
      body += `<h2 class="sig">${p.id} · ${escHtml(sigOf(p))}</h2><p>${html}</p>`;
    }
    const notes = sectionNotes(sec);
    if (notes.length) body += `<h2>Notes</h2><ol>${notes.map((n) => `<li><em>${escHtml(n.word)}</em> — ${escHtml(n.text)}</li>`).join('')}</ol>`;
    zip.folder('OEBPS').file(fname, xhtml(sec.title, body));
    items.push(`<item id="s${i}" href="${fname}" media-type="application/xhtml+xml"/>`);
    tocItems.push(`<li><a href="${fname}">${escHtml(sec.title)}</a></li>`);
  }
  const toc = xhtml('Contents', `<h1>Contents</h1><ol>${tocItems.join('')}</ol>`);
  zip.folder('OEBPS').file('toc.xhtml', toc);
  items.push(`<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>`);
  const opf = `<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="id" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:chronos:raleigh-modern:${escXml(fileName)}</dc:identifier><dc:title>${escXml(title)}</dc:title><dc:creator>${escXml(AUTHOR)}</dc:creator><dc:language>en</dc:language><dc:description>${escXml(SOURCE_NOTE)}</dc:description><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta></metadata><manifest>${items.join('')}</manifest><spine><itemref idref="toc"/>${Array.from({ length: i }, (_, k) => `<itemref idref="s${k + 1}"/>`).join('')}</spine></package>`;
  zip.folder('OEBPS').file('content.opf', opf);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// ---------- DOCX ----------
async function docxFor(title, sections) {
  const children = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: `${AUTHOR} — ${EDITION}.` }),
    new Paragraph({ text: SOURCE_NOTE }),
  ];
  for (const sec of sections) {
    children.push(new Paragraph({ text: sec.title, heading: HeadingLevel.HEADING_1 }));
    for (const p of sec.passages) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${p.id} · ${sigOf(p)}`, bold: true, size: 20 })],
        heading: HeadingLevel.HEADING_3,
      }));
      const runs = htmlToRuns(p.modern || p.modernText).map((r) => new TextRun({ text: r.text, italics: r.italic }));
      children.push(new Paragraph({ children: runs }));
    }
    const notes = sectionNotes(sec);
    if (notes.length) {
      children.push(new Paragraph({ text: 'Notes', heading: HeadingLevel.HEADING_2 }));
      for (const n of notes) children.push(new Paragraph({ children: [new TextRun({ text: `${n.n}. ` }), new TextRun({ text: n.word, italics: true }), new TextRun({ text: ` — ${n.text}` })] }));
    }
  }
  const doc = new Document({ title, creator: AUTHOR, description: SOURCE_NOTE, sections: [{ children }] });
  return Packer.toBuffer(doc);
}

// ---------- PDF ----------
async function pdfFor(title, sections) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.font('Times-Roman').fontSize(18).text(title, { align: 'center' });
    doc.fontSize(11).text(`${AUTHOR} — ${EDITION}.`, { align: 'center' });
    doc.moveDown().fontSize(10).text(SOURCE_NOTE, { align: 'justify' });
    for (const sec of sections) {
      doc.addPage().font('Times-Bold').fontSize(14).text(sec.title);
      doc.moveDown(0.5);
      for (const p of sec.passages) {
        doc.font('Times-Bold').fontSize(9).text(`${p.id} · ${sigOf(p)}`);
        const runs = htmlToRuns(p.modern || p.modernText);
        const para = doc.font('Times-Roman').fontSize(11);
        for (const r of runs) {
          para.font(r.italic ? 'Times-Italic' : 'Times-Roman');
          para.text(r.text, { continued: true, align: 'justify' });
        }
        para.text('', { continued: false });
        doc.moveDown(0.5);
      }
      const notes = sectionNotes(sec);
      if (notes.length) {
        doc.font('Times-Bold').fontSize(11).text('Notes');
        for (const n of notes) doc.font('Times-Roman').fontSize(11).text(`${n.n}. ${n.word} — ${n.text}`);
        doc.moveDown(0.5);
      }
    }
    doc.end();
  });
}

// ---------- main ----------
async function main() {
  mkdirSync(OUT, { recursive: true });
  const sections = sectionsInOrder();
  const bulkSlug = 'raleigh-history-of-the-world-modern';
  const counts = { md: 0, xml: 0, epub: 0, docx: 0, pdf: 0 };
  const t0 = Date.now();
  const bulkMdParts = [];
  for (const sec of sections) {
    const slug = sec.file.replace(/\.md$/, '');
    const one = [sec];
    // Markdown: the stored modern file itself.
    const stored = readFileSync(join(MODERN_DIR, sec.file), 'utf8');
    writeFileSync(join(OUT, `${slug}.md`), stored);
    counts.md += 1;
    bulkMdParts.push(stored);
    writeFileSync(join(OUT, `${slug}.xml`), sectionXml(sec));
    counts.xml += 1;
    writeFileSync(join(OUT, `${slug}.epub`), await epubFor(sec.title, one, slug));
    counts.epub += 1;
    writeFileSync(join(OUT, `${slug}.docx`), await docxFor(sec.title, one));
    counts.docx += 1;
    if (!SKIP_PDF) { writeFileSync(join(OUT, `${slug}.pdf`), await pdfFor(sec.title, one)); counts.pdf += 1; }
  }
  writeFileSync(join(OUT, `${bulkSlug}.md`), bulkMdParts.join('\n'));
  counts.md += 1;
  writeFileSync(join(OUT, `${bulkSlug}.xml`), bulkXml(sections));
  counts.xml += 1;
  writeFileSync(join(OUT, `${bulkSlug}.epub`), await epubFor(TITLE, sections, bulkSlug));
  counts.epub += 1;
  writeFileSync(join(OUT, `${bulkSlug}.docx`), await docxFor(TITLE, sections));
  counts.docx += 1;
  if (!SKIP_PDF) { writeFileSync(join(OUT, `${bulkSlug}.pdf`), await pdfFor(TITLE, sections)); counts.pdf += 1; }
  console.log(`downloads written to ${OUT}`);
  console.log(`sections: ${sections.length}; formats: ${JSON.stringify(counts)}; ${(Date.now() - t0) / 1000}s`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
