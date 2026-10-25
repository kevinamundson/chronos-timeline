// Dated statements image-read in Shuckford, vol. 1 (5th ed., 1819).
// year_am and year_bc are the numbers printed on that page. Nothing here is converted.
// A row with targets [] is registered in the extract only: there is no record to receive it,
// or Shuckford does not adopt the figure.
// st, when set, is kept. Otherwise the importer compares an Anno Mundi figure with the
// Masoretic figure on the same slot, and a BC figure with the record's sort year.

const hebrew = [
  // id, printed name, birth AM, age at son, years after the son, lifespan, death AM
  ['adam', 'Adam', 1, 130, 800, 930, 930],
  ['seth', 'Seth', 130, 105, 807, 912, 1042],
  ['enosh', 'Enos', 235, 90, 815, 905, 1140],
  ['kenan', 'Cainan', 325, 70, 840, 910, 1235],
  ['mahalalel', 'Mahalaleel', 395, 65, 830, 895, 1290],
  ['jared', 'Jared', 460, 162, 800, 962, 1422],
  ['enoch', 'Enoch', 622, 65, 300, 365, 987],
  ['methuselah', 'Methuselah', 687, 187, 782, 969, 1656],
  ['lamech', 'Lamech', 874, 182, 595, 777, 1651],
  ['noah', 'Noah', 1056, 500, null, null, null],
];

const tableNote = (r) => {
  const bits = [`had his son in the ${r[3]}th year of his life`];
  // 1, 2, 3 need no ordinal fix for these values; 500 is "500" not "500th" in the note if I say "year". Use the printed number.
  bits[0] = `had his son in year ${r[3]} of his life`;
  if (r[4] != null) bits.push(`lived ${r[4]} years after that birth`);
  if (r[5] != null) bits.push(`lived in all ${r[5]} years`);
  return `Hebrew table on p. 44, the row headed “${r[1]}”. The same row prints: ${bits.join('; ')}. Shuckford introduces the table as the computations of Moses according to our Hebrew Bibles.`;
};

const hebrewRows = hebrew.flatMap((r) => {
  const [id, name, birth, , , , death] = r;
  const out = [{
    page: 44, pdf: 134, book: 'I',
    date: `Hebrew table, “${name}”: began his life in the year of the world ${birth}`,
    year_am: birth, prec: 'year',
    targets: [`${id}:birth`],
    note: tableNote(r),
  }];
  if (death != null) {
    const slot = id === 'enoch' ? 'translated' : 'death';
    out.push({
      page: 44, pdf: 134, book: 'I',
      date: `Hebrew table, “${name}”: died in the year of the world ${death}`,
      year_am: death, prec: 'year',
      targets: [`${id}:${slot}`],
      note: id === 'enoch'
        ? `${tableNote(r)} The column is headed “Died in the year of the world”. This record keeps Enoch’s end on the translated slot. See open question K6.`
        : tableNote(r),
    });
  }
  return out;
});

const rest = [
  {
    page: 44, pdf: 134, book: 'I',
    date: 'the Flood which began in the six hundredth year of Noah, who was born anno mundi 1056, happened anno mundi 1656; it continued about a year, and so ended 1657',
    year_am: 1656, year_am_end: 1657, prec: 'year-range',
    targets: ['the-flood'],
    note: 'Page 13 states the same beginning: into the ark in the six hundredth year of Noah’s life, about the beginning of our November, according to the Hebrew computation, Anno Mundi 1656. The “about” is the month and the length of the Flood, not the two year-numbers.',
  },
  {
    page: 50, pdf: 140, book: 'I',
    date: 'so fix it A. M. 2263, instead of 1657',
    year_am: 2263, prec: 'year',
    targets: ['the-flood'],
    note: 'This is the Septuagint result as he works it, not the Hebrew date he follows. The Septuagint table printed under this sentence was seen. Its other cells are not entered: Seth’s death-year and Methuselah’s lifespan did not read cleanly. See open question K11.',
    st: 'framework',
  },
  {
    page: 26, pdf: 116, book: 'I',
    date: 'Fohi lived about 2952 years before Christ',
    year_bc: -2952, prec: 'approximate',
    targets: ['fohi:reign'],
    note: 'Shuckford is reporting what the Chinese writers in general agree. He concludes on the next page that Moses’ Noah and the Chinese Fohi are the same person. The records are kept apart. See open question K8.',
  },
  {
    page: 26, pdf: 116, book: 'I',
    date: 'computes him to reign but 2847 years before our Saviour',
    year_bc: -2847, prec: 'year',
    targets: ['fohi:reign'],
    note: 'The author of Mirandorum in Sinâ et Europâ, as Shuckford reports the figure. The spelling of the title is the one read on the page.',
  },
  {
    page: 26, pdf: 116, book: 'I',
    date: 'Alvarez Sevedo places his reign not so early, imagining it to be but 2060 years',
    prec: 'year',
    targets: ['fohi:reign'],
    note: 'The letters on the page are Sevedo. The clause does not repeat “before Christ”. The two sentences before it are years before Christ and years before our Saviour, and “not so early” compares this figure with those. No BC year is stored. See open question K14.',
    st: 'internal',
  },
  {
    page: 26, pdf: 116, book: 'I',
    date: 'Noah was born, according to Archbishop Usher, 2948 years, and died 2016 years before Christ',
    year_bc: -2948, prec: 'year',
    targets: ['noah:birth'],
    note: 'One sentence. This entry stores the birth figure, 2948 years before Christ. Shuckford is reporting Ussher. The spelling on the page is Usher.',
    st: 'internal',
  },
  {
    page: 26, pdf: 116, book: 'I',
    date: 'Noah was born, according to Archbishop Usher, 2948 years, and died 2016 years before Christ',
    year_bc: -2016, prec: 'year',
    targets: ['noah:death'],
    note: 'The same sentence. This entry stores the death figure, 2016 years before Christ. The Hebrew table on p. 44 leaves Noah’s death cell blank, and that blank is not filled from this quotation.',
    st: 'internal',
  },
  {
    page: 93, pdf: 187, book: 'II',
    date: 'about eighty years after the Flood, according to the Hebrew computation, A. M. 1736',
    year_am: 1736, prec: 'approximate',
    targets: ['founding-of-babel'],
    note: 'This is their coming to Shinar. A footnote says a fragment in Eusebius also has A. M. 1736 for the start of the tower, and that a Greek letter in that fragment is an evident mistake. The division of the earth is placed later, at A. M. 1757.',
  },
  {
    page: 94, pdf: 188, book: 'II',
    date: 'the division of the earth must be placed A. M. 1757, about one hundred and one years after the Flood, when Peleg the son of Eber was born',
    year_am: 1757, prec: 'year',
    targets: ['dispersion', 'peleg:birth'],
    note: 'He says “if we suppose them to spend nineteen or twenty years in settling and building” before the confusion. Those nineteen or twenty years are not turned into a second Anno Mundi.',
  },
  {
    page: 161, pdf: 257, book: 'IV',
    date: 'He began his reign A. M. 1757, and it is thought he reigned about one hundred and forty-eight years',
    year_am: 1757, prec: 'approximate',
    targets: ['nimrod:reign'],
    note: 'Page 169 offers it as a supposition: “if he began to reign at the age of sixty-one, and lived one hundred and forty-eight years after”. DERIVED, not printed, and only on that supposition: 1757 minus 61 is 1696. That difference is not stored as a birth year. The same page, under the running head A. M. 1757, says the beginning of his reign “in this year” agrees with later Babylonian observations, and it fixes his death at A. M. 1905. “This year” is not entered as a second start.',
  },
  {
    page: 161, pdf: 257, book: 'IV',
    date: 'and so died A. M. 1905',
    year_am: 1905, prec: 'year',
    targets: ['nimrod:death', 'death-of-nimrod'],
    note: 'Page 169 repeats the end of the reign at A. M. 1905. The “about one hundred and forty-eight years” is on the same page as this death year.',
  },
  {
    page: 172, pdf: 268, book: 'IV',
    date: 'he must begin his reign A. M. 1905',
    year_am: 1905, prec: 'year',
    targets: ['belus:reign'],
    note: 'Shuckford’s conclusion against identifying Belus with Nimrod. The same page repeats the dispersion at A. M. 1757.',
  },
  {
    page: 162, pdf: 258, book: 'IV',
    date: 'He reigned sixty years, and died A. M. 1965',
    year_am: 1965, prec: 'year',
    targets: ['belus:death'],
    note: 'The sixty years are printed. A start year is not printed in this sentence. Page 172 places the beginning at A. M. 1905.',
  },
  {
    page: 164, pdf: 260, book: 'IV',
    date: 'after a reign of two and fifty years, died A. M. 2017',
    year_am: 2017, prec: 'year',
    targets: ['ninus:death'],
    note: 'The reign length, fifty-two years, is printed. A start year is not printed in this sentence. Page 171 places the beginning at A. M. 1957. The two statements are both entered and not reconciled. See open question K4.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 171, pdf: 267, book: 'IV',
    date: 'A. M. 1957, the year in which I have placed the beginning of Ninus’s reign',
    year_am: 1957, prec: 'year',
    targets: ['ninus:reign'],
    note: 'Reached by counting one thousand three hundred years back from the death of Sardanapalus at A. M. 3257. Not reconciled with the death at A. M. 2017 after fifty-two years. See open question K4.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 171, pdf: 267, book: 'IV',
    date: 'The death of Sardanapalus happened A. M. 3257',
    year_am: 3257, prec: 'year',
    targets: ['sardanapalus:death'],
    note: 'The Assyrian king at the end of the empire in Shuckford’s title. Attached to the person Raleigh’s table already has, not to Cory’s sardanapallus. See open question K9.',
  },
  {
    page: 169, pdf: 265, book: 'IV',
    date: 'by the Hebrew chronology, that Abraham was born A. M. 2008',
    year_am: 2008, prec: 'year',
    targets: ['abraham:birth', 'abraham-birth'],
    note: 'He says this will appear hereafter very clearly. Page 251 prints A. M. 2001 for the same birth. Both are entered. See open question K3.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 251, pdf: 347, book: 'V',
    date: 'Abram was born in the one hundred and thirtieth year of Terah, three hundred and fifty-two years after the Flood, A. M. 2001',
    year_am: 2001, prec: 'year',
    targets: ['abraham:birth', 'abraham-birth'],
    note: 'Page 252 says he has fixed this birth by the Hebrew chronology. The same paragraph also says three hundred and fifty-two years after the Flood. Page 169 prints A. M. 2008. Not reconciled. The Tolle Lege facsimile prints a clear 1 in A. M. 2001. On Internet Archive leaf n344 the same sentence is present, and the last digit is blotted, so that leaf alone does not confirm 1 or 8. The year stored is the clear facsimile digit. See open question K3.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 252, pdf: 348, book: 'V',
    date: 'A. M. 2078',
    year_am: 2078, prec: 'year',
    targets: [],
    note: 'The sentence begins on p. 251: he went from Ur to Haran when he was seventy. The year-number is the first line of p. 252. There is no event for Abraham’s move to Haran, and a person has no slot for it. Not mapped. See open question K10.',
    st: 'n/a',
  },
  {
    page: 252, pdf: 348, book: 'V',
    date: 'he removed into Canaan five years after, i. e. four hundred and twenty-seven years after the Flood, A. M. 2083',
    year_am: 2083, prec: 'year',
    targets: ['abraham-enters-canaan'],
    note: 'Page 251 says he went into Canaan when he was seventy-five, five years after he came to Haran.',
  },
  {
    page: 183, pdf: 279, book: 'IV',
    date: 'arrived there, it is thought, about the fifteenth year of Nimrod, A. M. 1772',
    year_am: 1772, prec: 'approximate',
    targets: ['mizraim:reign'],
    note: 'Mizraim’s arrival in Egypt. Page 186 repeats A. M. 1772 as the Hebrew beginning of Menes’ reign. Page 187 also prints A. M. 1805 and does not choose. See open question K5.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 186, pdf: 282, book: 'IV',
    date: 'Menes beginning his reign, as we said before, A. M. 1772',
    year_am: 1772, prec: 'year',
    targets: ['mizraim:reign'],
    note: 'He calls this the Hebrew chronology, and he identifies Menes with Mizraim. The same sentence dates Sesac’s siege at A. M. 3033.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 187, pdf: 283, book: 'IV',
    date: 'consequently began A. M. 1805',
    year_am: 1805, prec: 'year',
    targets: ['mizraim:reign'],
    note: 'A second computation of Menes’ first year, nine hundred and eighty-seven years before Nilus. He writes that he cannot say which of A. M. 1772 and A. M. 1805, or whether either, is the exact truth. See open question K5.',
    st: 'CONFLICT (internal)',
  },
  {
    page: 187, pdf: 283, book: 'IV',
    date: 'one hundred and twenty-four years after the dispersion of mankind, i. e. A. M. 1881',
    year_am: 1881, prec: 'year',
    targets: ['mizraim:reign'],
    note: 'Apollodorus, as Shuckford reports him, for Menes’ removal into Thebais. Not a second start of the reign.',
  },
  {
    page: 187, pdf: 283, book: 'IV',
    date: 'Menes is supposed to have lived sixty-two years after his planting Thebais, and so to have died A. M. 1943',
    year_am: 1943, prec: 'approximate',
    targets: ['mizraim:death'],
    note: 'The words are “is supposed” and “so to have died”.',
  },
  {
    page: 185, pdf: 281, book: 'IV',
    date: 'we shall place Mizraim A. M. 1633, i. e. twenty-three years before the Flood',
    year_am: 1633, prec: 'year',
    targets: [],
    note: 'He raises this by counting 1,400 years back from Sesac, then rejects it. He says the number 1,400 years is a mistake, and that it places Menes above a century earlier than the true age. Not entered on Mizraim. See open question K10.',
    st: 'internal',
  },
  {
    page: 186, pdf: 282, book: 'IV',
    date: 'Sesostris, or Sesac, besieging Jerusalem in the fifth year of Rehoboam, A. M. 3033',
    year_am: 3033, prec: 'year',
    targets: ['shishak-sacks-the-temple', 'rehoboam:reign'],
    note: 'He equates Sesostris and Sesac with this siege. The event record is the sacking of the Temple in that same fifth year. The year is not Rehoboam’s accession.',
  },
  {
    page: 186, pdf: 282, book: 'IV',
    date: 'according to archbishop Usher, the first Olympiad began A. M. 3228',
    year_am: 3228, prec: 'year',
    targets: ['first-olympic-games'],
    note: 'Ussher’s figure, as Shuckford prints it, used to place Nilus.',
    st: 'internal',
  },
  {
    page: 186, pdf: 282, book: 'IV',
    date: 'the reign of Nilus therefore began A. M. 2792',
    year_am: 2792, prec: 'year',
    targets: ['nilus:reign'],
    note: 'From Dicaearchus’s 436 years before the first Olympiad, and from Ussher’s A. M. 3228 for that Olympiad. Both numbers are printed. He also says Eratosthenes makes Nilus the thirty-sixth king from Menes.',
  },
  {
    page: 170, pdf: 266, book: 'IV',
    date: 'The year in which Alexander came to Babylon was A. M. 3674',
    year_am: 3674, prec: 'year',
    targets: ['alexander-the-great:reign'],
    note: 'Footnote 8 on this sentence cites Archbishop Usher’s Annals. The sentence is the year he came to Babylon, not an accession year. Counting 1,903 years back, Shuckford reaches A. M. 1771 for the start of the Chaldean observations. That 1771 has no event to receive it.',
    st: 'internal',
  },
  {
    page: 170, pdf: 266, book: 'IV',
    date: 'we shall be brought back to A. M. 1771. So that in this year began the astronomy of the Chaldeans',
    year_am: 1771, prec: 'year',
    targets: [],
    note: 'Page 173 repeats “the observations, as we said, began A. M. 1771”. No event record exists for the start of those observations, and a new event cannot take its sort year from Shuckford. Not mapped. See open question K10.',
    st: 'n/a',
  },
  {
    page: 191, pdf: 287, book: 'IV',
    date: 'according to Syncellus, he reigned sixty-three years, and so died A. M. 2006',
    year_am: 2006, prec: 'year',
    targets: ['anamim:death'],
    note: 'Ananim, also called Curudes, king of Lower Egypt. Shuckford is reporting Syncellus. The person record is the Gen 10 name Anamim. See open question K7 only for Athothes; this attachment is the Gen 10 name he is discussing.',
    st: 'internal',
  },
  {
    page: 195, pdf: 291, book: 'IV',
    date: 'about the fifteenth year of Belus, i. e. one hundred and sixty-five years after the first year of Nimrod’s kingdom, and one hundred and fifty years after Mizraim’s settlement in Egypt, A. M. 1922, Egialeus began a kingdom at Sicyon, in Greece',
    year_am: 1922, prec: 'approximate',
    targets: ['egialeus:reign'],
    note: 'He writes “it is generally thought”. Footnote to Eusebius, Chron. p. 19.',
  },
  {
    page: 246, pdf: 342, book: 'V',
    date: 'A. M. 2034, when Athothes, the second king of Thebes, died',
    year_am: 2034, prec: 'year',
    targets: ['athothis:reign'],
    note: 'The spelling on the page is Athothes. The existing person is Athothis, whom CFAH equates with Narmer. Shuckford does not say Narmer. See open question K7.',
  },
  {
    page: 246, pdf: 342, book: 'V',
    date: 'Diabies succeeded him, who reigned nineteen years, and died A. M. 2053',
    year_am: 2034, year_am_end: 2053, prec: 'year-range',
    targets: ['diabies:reign'],
    note: 'A. M. 2034 is printed as the death of Athothes, at which Diabies succeeded. A. M. 2053 is printed as Diabies’ death. The nineteen years are printed.',
  },
  {
    page: 290, pdf: 386, book: 'V',
    date: 'This Syphis began his reign about A. M. 2164',
    year_am: 2164, prec: 'approximate',
    targets: ['syphis:reign'],
    note: 'He reigned sixty-three years, and died above forty years after Abraham. The sixty-three years are printed. “Above forty years after Abraham” does not say after his birth, his coming, or his death, so no death year is stored. The same sentence says the reign began about eighty years after Abraham’s coming into Egypt. Page 246 mentions a Soiphis at Memphis without a year. That spelling is not equated with this Syphis.',
  },
  {
    page: 306, pdf: 402, book: 'V',
    date: 'it was A. M. 2494, as I have placed it, which is about twenty years before the Israelites went out of Egypt',
    year_am: 2494, prec: 'approximate',
    targets: ['danaus:reign'],
    note: 'The footnote says Archbishop Usher supposes that the Parian Chronicon was composed A. M. 3741, and that the Marble puts Danaus 1,247 years earlier. The 1,247 is the Marble’s interval as he reports it. A. M. 3741 is entered separately and is not Danaus’s year.',
  },
  {
    page: 306, pdf: 402, book: 'V',
    date: 'about twenty years before the Israelites went out of Egypt',
    prec: 'approximate',
    targets: ['exodus'],
    note: 'The twenty years are counted from Danaus at A. M. 2494, “as I have placed it”. He does not print an Anno Mundi for the Exodus on this page. None is derived.',
    st: 'n/a',
  },
  {
    page: 306, pdf: 402, book: 'V',
    date: 'Archbishop Usher supposes that the Parian Chronicon was composed A. M. 3741',
    year_am: 3741, prec: 'year',
    targets: [],
    note: 'A footnote on the Danaus passage. Ussher’s figure, as Shuckford prints it. No record exists for the composition of the Parian Chronicon. Not mapped. See open question K10.',
    st: 'internal',
  },
  {
    page: 314, pdf: 410, book: 'V',
    date: 'the erecting these pillars was a very ancient practice, even as ancient as A. M. 2246',
    year_am: 2246, prec: 'year',
    targets: [],
    note: 'He has just cited Jacob’s pillar (Gen. 28 and 35). The year is not Jacob’s birth, death, or reign, and no event record exists for the pillar. Not mapped. See open question K10.',
    st: 'n/a',
  },
  {
    page: 318, pdf: 414, book: 'V',
    date: 'Rome being built about A. M. 3256',
    year_am: 3256, prec: 'approximate',
    targets: ['founding-of-rome'],
    note: 'Footnote 6 cites Archbishop Usher’s Annals. “According to this account.”',
    st: 'internal',
  },
  {
    page: 319, pdf: 415, book: 'V',
    date: 'A. M. 3426, when Nebuchadnezzar was king of Babylon, and about one hundred and sixty-nine years after the time where I am to end this work',
    year_am: 3426, prec: 'year',
    targets: ['nebuchadnezzar-ii:reign'],
    note: 'A year in which Nebuchadnezzar was king. He does not say it is the accession. The 169 years measure how far this date falls after the end of the present volume.',
  },
  {
    page: 89, pdf: 183, book: 'II',
    date: 'not above a hundred years before Darius’s repelling the Scythians, who had invaded his provinces, i. e. about A. M. 3400',
    year_am: 3400, prec: 'approximate',
    targets: [],
    note: 'Shuckford’s “i. e.” on a report of what Herodotus imagined about the later Scythians. No event record exists for that settlement. Not mapped. See open question K10.',
    st: 'n/a',
  },
  {
    page: 49, pdf: 139, book: 'I',
    date: 'we shall make Jared and Methuselah die A. M. 1317, i. e. ten years before the Flood',
    year_am: 1317, prec: 'year',
    targets: [],
    note: 'What follows if Eusebius is altered by Scaliger’s table. Shuckford rejects the alteration: all versions agree that Methuselah died in the year of the Flood. Not entered as either man’s death.',
    st: 'internal',
  },
  {
    page: 48, pdf: 138, book: 'I',
    date: 'it would appear that Cainan died A. M. 1235, and that would be the five hundred and twenty-eighth year of Noah, not the five hundred and twenty-first: and so likewise Mahalaleel’s death would be A. M. 1290',
    year_am: null, prec: 'year',
    targets: [],
    note: 'What a table made from Eusebius’s computations would show, in Shuckford’s correction of Eusebius’s Greek numerals. Both years are the Hebrew table’s death years (Cainan 1235, Mahalaleel 1290) and are not entered a second time.',
    st: 'internal',
  },
];

export const rows = [...hebrewRows, ...rest];
