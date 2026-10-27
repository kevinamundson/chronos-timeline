// William Hales, A New Analysis of Chronology and Geography, History and Prophecy.
// Second edition, corrected and improved. London: C. J. G. & F. Rivington, 1830.
// Four volumes. Printers: Gilbert and Rivington, St. John's Square.
// Full-view Boston Public Library scans on the Internet Archive, opened 2026-10-27.
// Printed page to scan leaf was checked: vol. II synopsis opening is page/n35
// (the following leaf is headed xxxiii), and vol. I p. 101 is page/n134.
export const SRC = 'hales-new-analysis-1830';
export const MARK = 'Added from the Hales import';
export const CHRON = 'hales';

const ITEM = {
  1: 'https://archive.org/details/newanalysisofchr01hale',
  2: 'https://archive.org/details/newanalysisofchr02hale',
  3: 'https://archive.org/details/newanalysisofchr03hale',
  4: 'https://archive.org/details/newanalysisofchr04hale',
};

export const ITEM_VOL1 = ITEM[1];

export const pageLink = (vol, leaf) => {
  const item = ITEM[vol];
  if (!item || !Number.isInteger(leaf) || leaf < 0) throw new Error(`bad Hales link vol ${vol} leaf ${leaf}`);
  return `${item}/page/n${leaf}/mode/1up`;
};

export const citation = (vol, page, where) =>
  `Hales, A New Analysis of Chronology and Geography, History and Prophecy, 2nd ed., corrected and improved (London: C. J. G. & F. Rivington, 1830), vol. ${vol}, ${where}, p. ${page}`;
