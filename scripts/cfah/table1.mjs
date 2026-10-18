// Phase 2: CFAH-1 Table 1 rows that had no Table 1 entry yet (the other 16 rows were added by hand earlier).
// Date strings follow the existing convention: "<year as printed> BC (<event as printed>)".
const where = 'section "Our Assumptions (Declared Biases)", Table 1 "Biblically derived dates from Ussher and Jones"';
const NOTE = 'CFAH-1 Table 1 (Ussher-Jones biblical baseline adopted by CFAH); not a triangulated anchor point.';
const row = (key, date, y, target, extra = {}) => ({ key, src: 'cfah-1', where, date, y, precision: 'year', target, note: NOTE, locator: 'Table 1 "Biblically derived dates from Ussher and Jones"', ...extra });
export const TABLE1 = [
  row('t1-721', '721 or 720 BC (Fall of Samaria, see Gertoux (2015, 1–34))', -721, 'fall-of-samaria', { yEnd: -720, precision: 'approximate', note: `${NOTE} Printed as alternatives, "721 or 720"; the sort uses the first.` }),
  row('t1-606', '606 BC (First year of Captivity of Daniel)', -606, 'daniel-taken-to-babylon'),
  row('t1-597', '597 BC (Captivity of Jehoiachin and Ezekiel)', -597, 'second-siege-of-jerusalem'),
  row('t1-586', '586 BC (Destruction of Solomon’s Temple)', -586, 'fall-of-jerusalem-586-bc'),
  row('t1-536', '536 BC (Cyrus Decree of Return)', -536, 'cyrus-decree-of-return', {
    create: { title: 'Cyrus decrees the return of the Jews', summary: 'Cyrus, king of Persia, proclaims that the Jews may return to Jerusalem and rebuild the house of the LORD.', description: 'CFAH-1 Table 1 row "Cyrus Decree of Return" (536 BC, the Ussher-Jones baseline adopted by CFAH). CFAH-1 treats the Ussher-Jones chronology as the most consistent reading of the biblical data before this decree. Added by the CFAH pass.', people: ['cyrus-the-great'], locations: ['jerusalem'], scripture_refs: ['Ezra.1.1-Ezra.1.4', '2Chr.36.22-2Chr.36.23'], related: ['temple-rebuilding-begins', 'fall-of-babylon-539-bc'] } }),
  row('t1-516', '516 BC (Dedication of the Second Temple by Ezra)', -516, 'second-temple-completed'),
];
