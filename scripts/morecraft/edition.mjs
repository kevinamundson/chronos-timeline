// Joe Morecraft III, A Christian Survey of World History from Creation to (the) Reformation. Scanned PDF, 417 pages; the
// site owner's private copy (not in this repository, not linked). Copyrighted: only dates as printed, page citations and
// short notes in our own words are kept here.
export const SRC = 'morecraft-christian-survey';
export const SHORT = 'Morecraft, A Christian Survey of World History';
export const MARK = 'Added from the Morecraft import';
// Printed page numbers were read from the foot of each page by OCR (406 of 417 pages). Where the OCR found none the
// citation gives the PDF page only. Pattern found: printed = PDF − 9 for PDF 13–29, PDF − 8 for PDF 30–416.
export const printedOf = (pdf, printed) => printed[pdf] ?? null;
export const citation = (pdf, printed, section) => `${SHORT}${section ? `, "${section}"` : ''}, ${printed != null ? `p. ${printed} ` : ''}(PDF p. ${pdf})`;
// Public listing of the book (no text online): Heritage Presbyterian Church bookstore. Used as the entry link; the
// source is the owner's private copy, so it is never listed in free_source_links.
export const LISTING = 'https://heritagepresbyterianchurch.com/product/a-christian-survey-of-world-history-from-creation-to-the-reformation/';
