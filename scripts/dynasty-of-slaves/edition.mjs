// Dynasty of Slaves (BLK SHP Scott, BLK SHP Publishing, 2026).
// The edition has no printed page numbers. Citations name the chapter and the
// nearest section heading. The text is the owner's private copy and is not linked.
// The public URL is a bibliographic listing with no preview, not the book.

export const SRC = 'dynasty-of-slaves-2026';
export const CHRON = 'dynasty-of-slaves';
export const MARK = 'Added from the Dynasty of Slaves import';
export const LISTING = 'https://books.google.com/books/about/Dynasty_of_Slaves.html?id=vqoO0gEACAAJ';

const CHAPTERS = new Set(['Introduction', 'Epilogue', 'Appendix', ...Array.from({ length: 8 }, (_, i) => `Chapter ${i + 1}`)]);

export function citation(ch, sec) {
  if (!CHAPTERS.has(ch)) throw new Error(`bad chapter ${ch}`);
  if (!sec || /^\s|\s$/.test(sec)) throw new Error(`bad section for ${ch}`);
  return `BLK SHP Scott, Dynasty of Slaves, ${ch}, ${sec}`;
}
