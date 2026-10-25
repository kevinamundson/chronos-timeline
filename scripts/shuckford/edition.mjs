// Samuel Shuckford, The Sacred and Profane History of the World Connected,
// 5th edition, revised by James Creighton. London: William Baynes, 1819. Volume 1.
// Read in the Tolle Lege Press facsimile (ISBN 978-1-60702-153-7) on 2026-10-24.
// Links go to the same edition on the Internet Archive, item sacredprofanehis01shuc
// (Princeton Theological Seminary), full view. Printed page 13 is scan URL n100,
// printed page 44 is n131, and printed page 246 is n339. Those three were opened.
// leafNum in the Archive's page-number file is one higher than the /page/n index.
export const SRC = 'shuckford-sacred-profane-1819';
export const ITEM = 'https://archive.org/details/sacredprofanehis01shuc';
export const MARK = 'Added from the Shuckford import';
export const CHRON = 'shuckford';

// Printed page -> Internet Archive leafNum (1-based), from the item's page-number file.
const LEAF = {
  13: 101, 26: 114, 44: 132, 48: 136, 49: 137, 50: 138, 89: 181, 93: 185, 94: 186,
  161: 255, 162: 256, 164: 258, 169: 263, 170: 264, 171: 265, 172: 266, 173: 267,
  183: 277, 185: 279, 186: 280, 187: 281, 191: 285, 195: 289, 246: 340, 251: 345,
  252: 346, 290: 384, 306: 400, 314: 408, 318: 412, 319: 413,
};

export const pageLink = (page) => {
  const leaf = LEAF[page];
  if (!leaf) throw new Error(`no Archive leaf for printed p. ${page}`);
  return `${ITEM}/page/n${leaf - 1}/mode/1up`;
};

export const citation = (page, pdf, book) =>
  `Shuckford, The Sacred and Profane History of the World Connected, 5th ed., revised by James Creighton (London: William Baynes, 1819), vol. 1, Book ${book}, p. ${page} (facsimile PDF p. ${pdf})`;
