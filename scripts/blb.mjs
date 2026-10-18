// Berean Literal Bible (BibleHub) Scripture links — single source of truth for every Scripture URL.
//
// URL pattern (verified live 2026-10-18):
//   chapter:  https://biblehub.com/blb/<slug>/<chapter>.htm          e.g. https://biblehub.com/blb/genesis/5.htm
//   verse:    https://biblehub.com/blb/<slug>/<chapter>.htm#<verse>  (the BLB chapter page carries <a name="N"> verse anchors)
// BibleHub has NO BLB-only verse page: /blb/genesis/5-3.htm is 404, and /genesis/5-3.htm is a parallel page of many
// versions, so verse references link to the BLB chapter with a verse anchor. Ranges link their first chapter/verse; the
// full reference text is kept for display. All 66 slugs were checked (HTTP 200, "<Book> 1 Berean Literal Bible").

// OSIS id → [display name, BibleHub slug, chapter count]
export const BOOKS = {
  Gen: ['Genesis', 'genesis', 50], Exod: ['Exodus', 'exodus', 40], Lev: ['Leviticus', 'leviticus', 27], Num: ['Numbers', 'numbers', 36],
  Deut: ['Deuteronomy', 'deuteronomy', 34], Josh: ['Joshua', 'joshua', 24], Judg: ['Judges', 'judges', 21], Ruth: ['Ruth', 'ruth', 4],
  '1Sam': ['1 Samuel', '1_samuel', 31], '2Sam': ['2 Samuel', '2_samuel', 24], '1Kgs': ['1 Kings', '1_kings', 22], '2Kgs': ['2 Kings', '2_kings', 25],
  '1Chr': ['1 Chronicles', '1_chronicles', 29], '2Chr': ['2 Chronicles', '2_chronicles', 36], Ezra: ['Ezra', 'ezra', 10],
  Neh: ['Nehemiah', 'nehemiah', 13], Esth: ['Esther', 'esther', 10], Job: ['Job', 'job', 42], Ps: ['Psalms', 'psalms', 150],
  Prov: ['Proverbs', 'proverbs', 31], Eccl: ['Ecclesiastes', 'ecclesiastes', 12], Song: ['Song of Solomon', 'songs', 8],
  Isa: ['Isaiah', 'isaiah', 66], Jer: ['Jeremiah', 'jeremiah', 52], Lam: ['Lamentations', 'lamentations', 5], Ezek: ['Ezekiel', 'ezekiel', 48],
  Dan: ['Daniel', 'daniel', 12], Hos: ['Hosea', 'hosea', 14], Joel: ['Joel', 'joel', 3], Amos: ['Amos', 'amos', 9], Obad: ['Obadiah', 'obadiah', 1],
  Jonah: ['Jonah', 'jonah', 4], Mic: ['Micah', 'micah', 7], Nah: ['Nahum', 'nahum', 3], Hab: ['Habakkuk', 'habakkuk', 3],
  Zeph: ['Zephaniah', 'zephaniah', 3], Hag: ['Haggai', 'haggai', 2], Zech: ['Zechariah', 'zechariah', 14], Mal: ['Malachi', 'malachi', 4],
  Matt: ['Matthew', 'matthew', 28], Mark: ['Mark', 'mark', 16], Luke: ['Luke', 'luke', 24], John: ['John', 'john', 21], Acts: ['Acts', 'acts', 28],
  Rom: ['Romans', 'romans', 16], '1Cor': ['1 Corinthians', '1_corinthians', 16], '2Cor': ['2 Corinthians', '2_corinthians', 13],
  Gal: ['Galatians', 'galatians', 6], Eph: ['Ephesians', 'ephesians', 6], Phil: ['Philippians', 'philippians', 4], Col: ['Colossians', 'colossians', 4],
  '1Thess': ['1 Thessalonians', '1_thessalonians', 5], '2Thess': ['2 Thessalonians', '2_thessalonians', 3], '1Tim': ['1 Timothy', '1_timothy', 6],
  '2Tim': ['2 Timothy', '2_timothy', 4], Titus: ['Titus', 'titus', 3], Phlm: ['Philemon', 'philemon', 1], Heb: ['Hebrews', 'hebrews', 13],
  Jas: ['James', 'james', 5], '1Pet': ['1 Peter', '1_peter', 5], '2Pet': ['2 Peter', '2_peter', 3], '1John': ['1 John', '1_john', 5],
  '2John': ['2 John', '2_john', 1], '3John': ['3 John', '3_john', 1], Jude: ['Jude', 'jude', 1], Revelation: null, Rev: ['Revelation', 'revelation', 22],
};
delete BOOKS.Revelation;

// Free-text book names / abbreviations → OSIS id (lower-case, spaces removed).
const ALIASES = {};
const add = (osis, ...names) => names.forEach((n) => { ALIASES[n.toLowerCase().replace(/[\s.]/g, '')] = osis; });
for (const [o, [name]] of Object.entries(BOOKS)) add(o, o, name);
add('Gen', 'Ge', 'Gn'); add('Exod', 'Ex', 'Exo'); add('Lev', 'Le', 'Lv'); add('Num', 'Nu', 'Nm'); add('Deut', 'Dt', 'De');
add('Josh', 'Jos'); add('Judg', 'Jdg', 'Jg'); add('Ruth', 'Ru'); add('Neh', 'Ne'); add('Esth', 'Est'); add('Ps', 'Psa', 'Psalm', 'Pss');
add('Prov', 'Pr', 'Prv'); add('Eccl', 'Ecc', 'Qoh'); add('Song', 'SoS', 'Song of Songs', 'Canticles'); add('Isa', 'Is'); add('Jer', 'Je');
add('Lam', 'La'); add('Ezek', 'Eze', 'Ezk'); add('Dan', 'Da', 'Dn'); add('Hos', 'Ho'); add('Obad', 'Ob'); add('Jonah', 'Jon');
add('Mic', 'Mi'); add('Nah', 'Na'); add('Hab', 'Hb'); add('Zeph', 'Zep'); add('Hag', 'Hg'); add('Zech', 'Zec'); add('Mal', 'Ml');
add('Matt', 'Mt', 'Mat'); add('Mark', 'Mk', 'Mrk'); add('Luke', 'Lk', 'Luk'); add('John', 'Jn', 'Jhn'); add('Acts', 'Ac'); add('Rom', 'Ro', 'Rm');
add('Gal', 'Ga'); add('Eph', 'Ephes'); add('Phil', 'Php'); add('Col', 'Co'); add('Phlm', 'Philem', 'Phm'); add('Heb', 'He'); add('Jas', 'Jm');
add('Jude', 'Jud'); add('Rev', 'Re', 'Apoc');
for (const n of ['1', '2']) {
  add(`${n}Sam`, `${n}Sa`, `${n}Sm`, `${n} Samuel`); add(`${n}Kgs`, `${n}Ki`, `${n}Kg`, `${n}Kin`, `${n} Kings`); add(`${n}Chr`, `${n}Ch`, `${n}Chron`);
  add(`${n}Cor`, `${n}Co`); add(`${n}Thess`, `${n}Th`, `${n}Thes`); add(`${n}Tim`, `${n}Ti`); add(`${n}Pet`, `${n}Pe`, `${n}Pt`);
}
for (const n of ['1', '2', '3']) add(`${n}John`, `${n}Jn`, `${n}Jo`, `${n}Jhn`);
export const bookId = (s) => ALIASES[String(s).toLowerCase().replace(/[\s.]/g, '')] || null;

export const BLB_RE = /^https:\/\/biblehub\.com\/blb\/([a-z0-9_]+)\/(\d+)\.htm(?:#(\d+))?$/;
const SLUGS = new Map(Object.entries(BOOKS).map(([o, [, slug, n]]) => [slug, n]));
export const isBlbUrl = (u) => { const m = BLB_RE.exec(u || ''); return !!m && SLUGS.has(m[1]) && +m[2] >= 1 && +m[2] <= SLUGS.get(m[1]); };

export function blbUrl(book, chapter, verse) {
  const id = BOOKS[book] ? book : bookId(book);
  if (!id) return null;
  const [, slug, n] = BOOKS[id];
  const c = +chapter;
  if (!Number.isInteger(c) || c < 1 || c > n) return null;
  const v = verse != null && +verse > 1 ? `#${+verse}` : '';
  return `https://biblehub.com/blb/${slug}/${c}.htm${v}`;
}

// OSIS reference ("Gen.5.3-Gen.5.29", "Gen.5", "1Kgs.6.1-1Kgs.8.66") → BLB link to its first chapter/verse.
export const blbFromOsis = (ref) => { const [b, c, v] = String(ref).split('-')[0].split('.'); return blbUrl(b, c ?? 1, v); };

// Free text ("Gen 7:6, 7:11; Gen 8:13–14", "1 Kgs 6:1", "Genesis 6–8", "Judg.12.13-Judg.12.15 ; Judg.13.1") → first reference found.
const BOOK_ALT = Object.keys(ALIASES).sort((a, b) => b.length - a.length).map((k) => k.replace(/^([123])/, '$1\\s?')).join('|');
const REF_RE = new RegExp(`(?<![A-Za-z])(${BOOK_ALT})\\.?\\s?(\\d{1,3})(?:[:.](\\d{1,3}))?(?![A-Za-z])`, 'i');
export function firstRef(text) {
  const m = REF_RE.exec(String(text || ''));
  if (!m) return null;
  const id = bookId(m[1]);
  const url = id && blbUrl(id, m[2], m[3]);
  return url ? { book: id, chapter: +m[2], verse: m[3] ? +m[3] : null, url, match: m[0] } : null;
}
export const blbFromText = (text) => firstRef(text)?.url ?? null;

// Hosts/paths that are Scripture texts other than the BLB on BibleHub (rejected by the validator).
export const NON_BLB_SCRIPTURE = [
  /gutenberg\.org\/(ebooks\/10(\b|\/)|cache\/epub\/10\/|files\/10\/)/i, /biblegateway\.com/i, /blueletterbible\.org/i, /bible\.com\//i,
  /esv\.org/i, /kingjamesbibleonline\.org/i, /biblestudytools\.com/i, /bible\.oremus\.org/i, /biblia\.com/i, /netbible\.org/i,
  /^https?:\/\/(www\.)?biblehub\.com\/(?!blb\/)/i,
];
export const isNonBlbScripture = (u) => NON_BLB_SCRIPTURE.some((re) => re.test(u || ''));
