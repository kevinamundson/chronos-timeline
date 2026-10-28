// The 1617 chronological table, as a grid of sections.
// Column headings change through the book, so each run of rows under one
// "Iulian…" heading is its own table. Years stay the Julian Period and the
// yeere of the World. A parenthetical beside a confirmed World year is display
// text only (scripts/raleigh/derived-year.mjs). It is not a year he printed.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOK_HEADING, modernizeCell } from './spelling.mjs';
import { annotateWorldYear, formatAnnotatedCell } from './derived-year.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const plain = (raw) => decode(raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();

function parseRows(tableXml) {
  const rawRows = [];
  let sig = '781b';
  let cur = null;
  const re = /<pb n="([^"]+)"|<row>|<\/row>|<cell\b([^>]*)>([\s\S]*?)<\/cell>/g;
  let m;
  while ((m = re.exec(tableXml))) {
    if (m[1]) { sig = m[1]; continue; }
    if (m[0] === '<row>') { cur = []; continue; }
    if (m[0] === '</row>') { if (cur) rawRows.push({ sig, cells: cur }); cur = null; continue; }
    if (cur) {
      const attr = m[2] || '';
      cur.push({
        text: plain(m[3]),
        cols: +(attr.match(/\bcols="(\d+)"/)?.[1] || 1),
        rowSpan: +(attr.match(/\brows="(\d+)"/)?.[1] || 1),
      });
    }
  }
  const rows = [];
  let carry = [];
  for (const row of rawRows) {
    const visual = [];
    const next = [];
    let vi = 0;
    const skipCarry = () => {
      while ((carry[vi] || 0) > 0) {
        visual[vi] = { covered: true };
        next[vi] = carry[vi] - 1;
        vi += 1;
      }
    };
    for (const cell of row.cells) {
      skipCarry();
      const colSpan = Math.max(1, cell.cols);
      const rowSpan = Math.max(1, cell.rowSpan);
      const spelled = modernizeCell(cell.text);
      visual[vi] = { ...spelled, colSpan, rowSpan, covered: false };
      next[vi] = rowSpan - 1;
      for (let c = 1; c < colSpan; c++) {
        visual[vi + c] = { covered: true };
        next[vi + c] = rowSpan - 1;
      }
      vi += colSpan;
    }
    while (vi < carry.length) {
      if ((carry[vi] || 0) > 0) {
        visual[vi] = { covered: true };
        next[vi] = carry[vi] - 1;
      }
      vi += 1;
    }
    carry = next;
    const blank = visual.every((c) => !c || c.covered || !c.original);
    if (!blank) rows.push({ sig: row.sig, cells: visual });
  }
  return rows;
}

function isHeading(row) {
  return row.cells.some((c) => c && !c.covered && /^(Iulian|Julian)\b/.test(c.original || ''));
}

function sectionWidth(rows) {
  let max = 0;
  for (const row of rows) {
    row.cells.forEach((c, i) => {
      if (c && !c.covered && c.original) max = Math.max(max, i + 1);
    });
  }
  return max;
}

function headingOf(row) {
  const cell = row.cells.find((c) => c && !c.covered && /^(Iulian|Julian)\b/.test(c.original || ''));
  return cell || { original: 'Columns', modern: 'Columns' };
}

export function loadChronologicalTable() {
  const xml = readFileSync(join(root, 'sources/raleigh/A10357.earlyprint-unadorned.xml'), 'utf8');
  const start = xml.indexOf('<div type="chronological_table">');
  const end = xml.indexOf('<div type="index">');
  if (start < 0 || end < start) throw new Error('chronological table not found');
  const rows = parseRows(xml.slice(start, end));
  const sections = [];
  for (const row of rows) {
    if (isHeading(row) || !sections.length) {
      const head = headingOf(row);
      sections.push({
        sig: row.sig,
        heading: { original: head.original, modern: head.modern },
        rows: [],
      });
    }
    const section = sections[sections.length - 1];
    section.rows.push({ ...row, header: section.rows.length === 0 });
  }
  for (const section of sections) section.width = sectionWidth(section.rows);
  const dataRows = sections.reduce((n, s) => n + s.rows.filter((r) => !r.header).length, 0);
  return { heading: BOOK_HEADING, sections, dataRows, signatures: [rows[0]?.sig, rows[rows.length - 1]?.sig] };
}

function textAt(cell, mode) {
  if (!cell || cell.covered) return '';
  return cell[mode] || '';
}

/** Visual index of the heading cell that names the Julian Period and the yeere of the World. */
export function yearColumnIndex(section) {
  const head = section.rows.find((r) => r.header) || section.rows[0];
  if (!head) return -1;
  return head.cells.findIndex((c) => c && !c.covered && /^(Iulian|Julian)\b/.test(c.original || ''));
}

function displayCell(row, i, mode, yearIdx) {
  const raw = textAt(row.cells[i], mode);
  if (row.header || i !== yearIdx) return raw;
  return formatAnnotatedCell(annotateWorldYear(raw));
}

export function sectionGrid(section, mode) {
  const yearIdx = yearColumnIndex(section);
  return section.rows.map((row) => {
    const line = Array.from({ length: section.width }, (_, i) => displayCell(row, i, mode, yearIdx));
    return { sig: row.sig, header: row.header, line };
  });
}

/** Counts for the year column only. Name cells and reign lengths are left alone. */
export function yearColumnReport(table) {
  const flags = [];
  let derived = 0;
  let derivedNoted = 0;
  let flagged = 0;
  let plain = 0;
  let missing = 0;
  for (const section of table.sections) {
    const idx = yearColumnIndex(section);
    if (idx < 0) { missing += 1; continue; }
    for (const row of section.rows) {
      if (row.header) continue;
      const cell = row.cells[idx];
      if (!cell || cell.covered || !(cell.original || cell.modern)) { plain += 1; continue; }
      const original = annotateWorldYear(cell.original || '');
      const modern = annotateWorldYear(cell.modern || '');
      if (original.status === 'derived') {
        derived += 1;
        if (original.badge || original.flag) {
          derivedNoted += 1;
          flags.push({ sig: row.sig, text: cell.original, badge: original.badge || 'Noted', flag: original.flag });
        }
      } else if (original.status === 'flagged') {
        flagged += 1;
        flags.push({ sig: row.sig, text: cell.original, badge: original.badge, flag: original.flag });
      } else plain += 1;
      if (JSON.stringify(original.worlds) !== JSON.stringify(modern.worlds) || original.status !== modern.status) {
        flags.push({ sig: row.sig, text: cell.original, badge: 'mismatch', flag: 'Modern spelling changed the year figures.' });
      }
    }
  }
  return { derived, derivedNoted, flagged, plain, missing, flags };
}

function csvEscape(s) {
  const v = String(s ?? '');
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const FILE_NOTE = 'Raleigh, The History of the World (1617, EEBO-TCP A10357), A Chronological Table. Years are the Julian Period and the yeere of the World as printed. A parenthetical "(derived: …)" is display text only, from Raleigh\'s Creation in 4032 BC. It is not a year he printed, and year_bc_ad stays null. The Signature column is the 1617 sheet and is not a column of his table.';

export function toCsv(table, mode) {
  const lines = [csvEscape(FILE_NOTE), csvEscape(mode === 'original' ? 'Original spelling' : 'Modern spelling'), csvEscape(table.heading[mode])];
  for (const section of table.sections) {
    lines.push(csvEscape(section.heading[mode]));
    for (const row of sectionGrid(section, mode)) {
      lines.push([row.header ? 'Signature' : row.sig, ...row.line].map(csvEscape).join(','));
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function mdCell(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function toMarkdown(table, mode) {
  const parts = [
    '# A Chronological Table',
    '',
    FILE_NOTE,
    '',
    mode === 'original' ? 'Original spelling.' : 'Modern spelling.',
    '',
    table.heading[mode],
    '',
  ];
  for (const section of table.sections) {
    parts.push(`## ${section.heading[mode]}`, '');
    const grid = sectionGrid(section, mode);
    const header = grid[0];
    const cols = ['Signature', ...(header ? header.line : [])];
    parts.push(`| ${cols.map(mdCell).join(' | ')} |`);
    parts.push(`| ${cols.map(() => '---').join(' | ')} |`);
    for (const row of grid.slice(1)) parts.push(`| ${[row.sig, ...row.line].map(mdCell).join(' | ')} |`);
    parts.push('');
  }
  return `${parts.join('\n')}\n`;
}

function xmlEscape(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function toXls(table, mode) {
  const rows = [];
  const emit = (cells) => {
    const tds = cells.map((c) => `<Cell${c.index ? ` ss:Index="${c.index}"` : ''}${c.across ? ` ss:MergeAcross="${c.across}"` : ''}${c.down ? ` ss:MergeDown="${c.down}"` : ''}><Data ss:Type="String">${xmlEscape(c.text)}</Data></Cell>`).join('');
    rows.push(`<Row>${tds}</Row>`);
  };
  emit([{ text: FILE_NOTE }]);
  emit([{ text: mode === 'original' ? 'Original spelling' : 'Modern spelling' }]);
  emit([{ text: table.heading[mode] }]);
  emit([{ text: '' }]);
  for (const section of table.sections) {
    const width = Math.max(1, section.width + 1);
    emit([{ text: section.heading[mode], across: width - 1 }]);
    const yearIdx = yearColumnIndex(section);
    for (const row of section.rows) {
      const cells = [{ text: row.header ? 'Signature' : row.sig, index: 1 }];
      let col = 2;
      for (let i = 0; i < section.width; i++) {
        const cell = row.cells[i];
        if (!cell || cell.covered) { col += 1; continue; }
        const span = Math.min(cell.colSpan || 1, section.width - i);
        const down = Math.max(0, (cell.rowSpan || 1) - 1);
        cells.push({ text: displayCell(row, i, mode, yearIdx), index: col, across: span > 1 ? span - 1 : 0, down });
        col += span;
        i += span - 1;
      }
      emit(cells);
    }
    emit([{ text: '' }]);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Chronological Table"><Table>
${rows.join('\n')}
</Table></Worksheet></Workbook>
`;
}
