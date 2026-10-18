// Phase 3: rulers dated by CFAH (person records with reign/death entries) and the king lists they belong to.
// Dates are copied exactly as printed. Non-AP CFAH dates use cfah_basis "paper_text" (display only, never a sort tier).
// Herodotus-managed people (e.g. mycerinus) only get death entries, which that importer keeps (first CFAH entry per slot);
// run this importer after the Herodotus one.
const s6 = (h) => `section "${h}"`;
const P = (id, create, dates) => ({ id, create, dates });
const R = (key, src, where, date, y, yEnd, precision, note) => ({ key, src, where, date, y, yEnd: yEnd ?? undefined, precision, note, locator: where.replace(/^section /, ''), basis: 'paper_text' });
const person = (title, summary, dynasty, events, extra = {}) => ({ title, summary, description: `${summary} Person record added by the CFAH pass for CFAH's reign dates; dates are as printed in the CFAH paper cited.`, dynasty, events, ...extra });

export const RULERS = [
  // ---- Egypt: CFAH-6 (Old and Middle Kingdoms) ----
  P('nebka', person('Nebka (Necherophes)', 'King of Egypt\'s Dynasty 3 at Memphis, called Necherophes by Manetho and Nebka in the Turin Canon.', 'Egypt Dynasty 3 (Memphis)', ['egypt-dynasty-3-memphis', 'djosers-famine'], { alt_names: ['Necherophes'] }), {
    reign: [R('c6-nebka-reign', 'cfah-6', s6('A. Djoser’s Famine culminated with the death of Uenephes: 2001–1994 BC'), '2029 BC', -2029, null, 'year', 'Start of the reign ("the start of his reign in 2029 BC"), which CFAH takes as the start of Dynasty 3.')],
    death: [R('c6-nebka-death', 'cfah-6', s6('A. Djoser’s Famine culminated with the death of Uenephes: 2001–1994 BC'), 'shortly before 2001 BC', -2001, null, 'terminus-ante-quem', '"the death of Nebka/Necherophes shortly before 2001 BC".')] }),
  P('mycerinus', null, {
    death: [R('c6-menkaure-death', 'cfah-6', s6('B. The Great War links Dynasties 2, 4, 5, 9, 10, and 11: 1825–1769 BC'), 'about 1790 BC', -1790, null, 'approximate', 'Menkaure (Herodotus\'s Mycerinus) "lived 35 years into the Great War, thus dying about 1790 BC".')] }),
  P('merenre-ii', person('Merenre II', 'Penultimate king of Egypt\'s Dynasty 6 according to Manetho; husband of Nitocris.', 'Egypt Dynasty 6', ['death-of-concharis', 'reign-of-nitocris']), {
    death: [R('c6-merenre2-death', 'cfah-6', s6('D. The Death of Merenre II is Synchronized with the Death of Concharis of D13'), '1491 BC', -1491, null, 'year', 'Counted 12 years (Nitocris\'s reign in Africanus) before her death at Anchor Point #16: "Merenre II died 12 years earlier in 1491 BC". Synchronised with the death of Concharis (AP-51).')] }),
  P('nitocris', person('Nitocris (Netjerkare Siptah)', 'Queen of Egypt at the end of Dynasty 6.', 'Egypt Dynasty 6', ['reign-of-nitocris'], { alt_names: ['Netjerkare Siptah'] }), {
    reign: [R('c6-nitocris-reign', 'cfah-6', 'section "Argument 2. The Durations Form an Interlocking Matrix", Table 1 (AP-16 row)', '1497–1479', -1497, -1479, 'year-range', 'Table 1: "Approximate reign of Nitocris aka Netjerkare Siptah" (AP-16, from CFAH-3). The anchor point itself is on the event reign-of-nitocris.')] }),
  P('sobekneferu', person('Sobekneferu', 'Last ruler of Egypt\'s Dynasty 12; CFAH identifies her with the barren royal daughter who raised Moses.', 'Egypt Dynasty 12', ['end-of-egypt-dynasty-12']), {
    death: [R('c6-sobekneferu-death', 'cfah-6', s6('12. Barren Queen with Moses'), 'no later than 1525 BC', -1525, null, 'terminus-ante-quem', '"Sobekneferu died no later than 1525 BC, and probably about a year earlier." CFAH adds that if she was at least 25 when Moses was born her birth was no later than 1596 BC (conjecture; not recorded as a birth date).')] }),
  P('senusret-iii', person('Senusret III', 'King of Egypt\'s Dynasty 12, identified by CFAH with the "Egyptian Belus" of the chroniclers.', 'Egypt Dynasty 12', ['reign-of-senusret-iii', 'senusret-iii-astronomical-college', 'aswan-canal'], { alt_names: ['Sesostris III', 'Egyptian Belus'] }), {
    reign: [R('c6-senusret3-reign', 'cfah-6', s6('Neferhotep I and Senusret III Synchronism'), '1613 to 1573 BC', -1613, -1573, 'year-range', '"Having pinpointed the reign of Senusret III from 1613 to 1573 BC using Anchor Point #59".')] }),
  P('merenre-i', person('Merenre I', 'King of Egypt\'s Dynasty 6 whose men cut the Aswan canal in his first year.', 'Egypt Dynasty 6', ['aswan-canal']), {
    reign: [R('c6-merenre1-y1', 'cfah-6', s6('C. The Aswan Canal'), '1606 BC ±2 years error for Year 1 of Merenre I', -1606, null, 'approximate', 'Year 1 of Merenre I, the year the Aswan canal was cut (AP-59 is on the event aswan-canal).')],
    death: [R('c6-merenre1-death', 'cfah-6', s6('The Aswan Canal of Senusret III and Merenre I'), '1586 BC', -1586, null, 'year', '"In this chronology, 1586 BC was also the year that Merenre I died".')] }),
  P('pepi-i', person('Pepi I', 'King of Egypt\'s Dynasty 6.', 'Egypt Dynasty 6', []), {
    reign: [
      R('c6-pepi1-sole', 'cfah-6', s6('Userkare goes from D6 to D12/13 and back to D6'), '1637 BC ±2 years', -1637, null, 'approximate', 'Start of Pepi I\'s sole reign, at the end of Userkare\'s coregency. CFAH-5 gives "about 1646 to 1593 B.C." (see open question I7).'),
      R('c5-pepi1-reign', 'cfah-5', s6('8. Sargon of Akkad and Pepi I'), 'about 1646 to 1593 B.C.', -1646, -1593, 'approximate', 'Counted from the death of Nitocris in 1479 B.C. with Manetho\'s 53 years. Superseded in practice by CFAH-6 (open question I7).')] }),
  P('userkare', person('Userkare (Khendjer)', 'Coregent of Pepi I in Dynasty 6 whom CFAH-6 identifies with Userkare Khendjer of Dynasty 13.', 'Egypt Dynasty 6 / 13', [], { alt_names: ['Khendjer'] }), {
    reign: [R('c6-userkare-end', 'cfah-6', s6('Userkare goes from D6 to D12/13 and back to D6'), '1637 BC ±2 years', -1637, null, 'approximate', 'End of Userkare\'s coregency with Pepi I ("end of Userkare coregency"). CFAH then moves him to the Dynasty 13 position until about 1606.')] }),
  P('amenemhat-iii', person('Amenemhat III', 'King of Egypt\'s Dynasty 12, coregent with Senusret III.', 'Egypt Dynasty 12', []), {
    reign: [R('c6-amenemhat3-coreign', 'cfah-6', s6('The Aswan Canal of Senusret III and Merenre I'), '1586 BC ±1.5 years', -1586, null, 'approximate', 'Start of Amenemhat III\'s coreign with Senusret III.')] }),
  P('neferhotep-i', person('Neferhotep I', 'King of Egypt\'s Dynasty 13, who CFAH says served in the administration of Senusret III.', 'Egypt Dynasty 13', []), {
    reign: [R('c6-neferhotep1-start', 'cfah-6', s6('Neferhotep I and Senusret III Synchronism'), '1576 BC ±2.5 years', -1576, null, 'approximate', 'Start of Neferhotep\'s reign.')] }),
  P('unas', person('Unas', 'Last king of Egypt\'s Dynasty 5.', 'Egypt Dynasty 5', ['josephs-famine']), {
    reign: [R('c6-unas-reign', 'cfah-6', s6('Unas Famine matches Senusret I Famine'), '1715 to 1682 BC', -1715, -1682, 'year-range', 'His 33-year reign counted from Dynasty 6\'s 203 years before the death of Nitocris in 1479 BC; it overlaps Joseph\'s famine.')] }),
  P('intef-iii', person('Inteff III', 'King of Thebes in Egypt\'s Dynasty 11, in whose reign a famine is recorded.', 'Egypt Dynasty 11', [], { alt_names: ['Intef III'] }), {
    reign: [R('c6-intef3-reign', 'cfah-6', s6('5. Isaac’s Famine: ~1816 BC'), '1816 to 1808 BC', -1816, -1808, 'year-range', 'From CFAH\'s placement of Dynasty 11 and the Turin Canon.')] }),
  P('mentuhotep-iv', person('Mentuhotep IV', 'Last king of Egypt\'s Dynasty 11, whose vizier Amenemhat became Amenemhat I.', 'Egypt Dynasty 11', ['accession-of-amenemhat-i']), {
    reign: [R('c6-mentuhotep4-start', 'cfah-6', s6('Dynasty 13: 1729–1577–1479 BC'), '1745 BC', -1745, null, 'year', 'Start of the reign: seven years (Turin Canon) before the 1738 BC start of Dynasty 12.')] }),
  // ---- Mesopotamia: CFAH-5 (Berossus) ----
  P('ashur-danin-pal', person('Ashur-danin-pal', 'Son of Shalmaneser III of Assyria, coregent with his father; CFAH takes him as the first Sardanapalus of the chroniclers.', 'Assyria', ['first-median-revolt']), {
    reign: [
      R('c5-adp-reign', 'cfah-5', s6('Sardanapalus'), '843 to 823 B.C.', -843, -823, 'year-range', 'Coregent with Shalmaneser III. The AP-43 section gives the end as his death in 824 B.C. (open question I6).'),
      R('c5-adp-reign-ap43', 'cfah-5', s6('AP-43: Conclusions for Dynasty 6: 1232–706 B.C.'), '843 until his death in 824 B.C.', -843, -824, 'year-range', 'Second statement in the same paper (open question I6).')] }),
  P('tukulti-ninurta-i', person('Tukulti-Ninurta I', 'King of Assyria who took Babylon; CFAH matches him with the chroniclers\' Semiramis II.', 'Assyria', ['semiramis-ii', 'babylon-dynasty-6-assyrian'], { alt_names: ['Tukulti Ninurta I'] }), {
    reign: [R('c5-tn1-sole', 'cfah-5', s6('AP-35: Fall of Akkad to the Guti Arabs: 1477/1476 B.C.'), 'around 1232 B.C.', -1232, null, 'approximate', 'Start of the sole reign: "Semiramis II began her sole reign around 1232 B.C., as did Tukulti Ninurta I." The Gideon section puts the first year of the coreign in 1251 B.C.')] }),
  P('shalmaneser-i', person('Shalmaneser I', 'King of Assyria, identified by CFAH with the "Assyrian Belus".', 'Assyria', ['assyrian-belus-shalmaneser-i']), {
    reign: [R('c5-shalm1-start', 'cfah-5', s6('AP-35: Fall of Akkad to the Guti Arabs: 1477/1476 B.C.'), '1261', -1261, null, 'year', '"The Assyrian Belus began to reign in 1261, as did Shalmaneser I" (AP-36 is on the event assyrian-belus-shalmaneser-i).')] }),
  P('sargon-ii', person('Sargon II', 'King of Assyria, the second "Sardanapalus" of the chroniclers in CFAH\'s reading.', 'Assyria', ['second-median-revolt', 'fall-of-samaria']), {
    reign: [R('c5-sargon2-start', 'cfah-5', s6('AP-34: Sardanapalus II—Sargon II: Second Median Revolt: 705–700 B.C.'), '720 or 721', -721, -720, 'year-range', 'Start of the reign ("whose reign began in 720 or 721").')],
    death: [R('c5-sargon2-death', 'cfah-5', s6('AP-34: Sardanapalus II—Sargon II: Second Median Revolt: 705–700 B.C.'), '705', -705, null, 'year', '"except that he died in 705". Berossus counted the death as 706 (open question I5).')] }),
  P('nabopolassar', person('Nabopolassar', 'Founder of the Neo-Babylonian (Chaldean) dynasty, father of Nebuchadnezzar II.', 'Babylon Dynasty 8 (Neo-Babylonian)', ['neo-babylonian-empire', 'fall-of-nineveh'], { related: ['nebuchadnezzar-ii'] }), {
    reign: [R('c5-nabopolassar-start', 'cfah-5', s6('AP-45: Dynasty 8: Neo-Babylonian Empire: 626–539 B.C.'), '626/625 B.C.', -626, -625, 'year-range', 'When Nabopolassar "took the kingship of Babylon away from Assyria".')] }),
  P('sargon-i-of-akkad', person('Sargon of Akkad', 'Founder of the Akkadian empire.', 'Akkad', ['sargon-of-akkad'], { alt_names: ['Sargon I'] }), {
    reign: [R('c5-sargon-akkad', 'cfah-5', s6('8. Sargon of Akkad and Pepi I'), 'earliest … 1642 B.C. … latest date for his death in 1553 B.C.', -1642, -1553, 'year-range', 'From the Sumerian King List durations: "the earliest date for the start of Sargon’s reign in the year 1642 B.C., and the latest date for his death in 1553 B.C." The OSF preprint CFAH-15 dates the start of his reign to 1619 BC (AP-92; open question I8).')] }),
  P('ninyas', person('Ninyas Zames (Gilgamesh)', 'Son of Semiramis I and Ninus (Nimrod) in the chroniclers; CFAH identifies him with Gilgamesh.', 'Uruk / Assyria (chroniclers)', ['reign-of-ninyas-gilgamesh'], { alt_names: ['Gilgamesh', 'Zames'] }), {
    reign: [R('c5-ninyas-reign', 'cfah-5', s6('AP-47: The Reign of Ninyas Zames/Gilgamesh: 2006–1968 B.C.'), '2006–1968 B.C.', -2006, -1968, 'year-range', 'Sole reign from 1994 B.C. (AP-47 is on the event reign-of-ninyas-gilgamesh).')] }),
  P('semiramis-i', person('Semiramis I', 'Queen of the chroniclers, wife of Ninus (Nimrod).', 'Uruk / Assyria (chroniclers)', ['reign-of-semiramis-i'], { related: ['nimrod'] }), {
    reign: [R('c5-semiramis1-reign', 'cfah-5', s6('AP-47: The Reign of Ninyas Zames/Gilgamesh: 2006–1968 B.C.'), '2036–1994 B.C.', -2036, -1994, 'year-range', 'Her 42-year reign, "triangulated" in CFAH-3 (AP-21, on the event reign-of-semiramis-i).')] }),
  P('cush', null, {
    reign: [R('c5-cush-babel', 'cfah-5', s6('The First Dynasties of Uruk and Kish'), 'from the founding of Babel in 2233 B.C.', -2233, null, 'year', 'Cush\'s reign at Babel "could be counted as 42.5 years from the founding of Babel in 2233 B.C." (other counts: 55 years from 2247 B.C. or 62 years from the first division). Berossus Dynasty 1 (AP-38) runs 2233—2191 B.C.')] }),
  P('ghandash', person('Ghandash (Gandash)', 'First Kassite king of Babylon in the Babylonian King List.', 'Kassite dynasty', [], { alt_names: ['Gandash'] }), {
    reign: [R('c5-ghandash', 'cfah-5', s6('Kassite Synchronisms'), '1282 B.C.', -1282, null, 'year', 'The Babylonian King List "appears to cover the period from Ghandash in 1282 B.C. to Kandalanu in 627 B.C."')] }),
  P('kandalanu', person('Kandalanu', 'Last king before Nabopolassar in the Babylonian King List.', 'Babylon Dynasty 7 (Assyrian)', ['babylon-dynasty-7-assyrian']), {
    reign: [R('c5-kandalanu', 'cfah-5', s6('Kassite Synchronisms'), '627 B.C.', -627, null, 'year', 'End of the Babylonian King List ("to Kandalanu in 627 B.C."). CFAH-5 lists him with 22 years in Dynasty 7 (Royal Canon).')] }),
  P('kashtiliash-i', person('Kashtiliash', 'Kassite king of Babylon defeated by Tukulti-Ninurta I.', 'Kassite dynasty', ['babylon-dynasty-6-assyrian'], { alt_names: ['Kashtiliash IV (conventional)'] }), {
    death: [R('c5-kashtiliash', 'cfah-5', s6('5. Kassites 576 y minus 50 to death of Kashtiliash'), '1232 B.C.', -1232, null, 'year', 'CFAH pegs "the defeat of Kashtiliash I in 1232 B.C." to Tukulti-Ninurta I\'s conquest of Babylon (first as a thought experiment, then noted as fitting "to the year").')] }),
];

// National epochs from CFAH-2 that are not numbered anchor points: display-only paper_text entries on existing events.
export const EPOCHS = [
  { key: 'c2-sicyon', src: 'cfah-2', where: 'section "Duration 14: The Founding of Sicyon: 2089 or 2076 BC"', date: '2089 or 2076 BC', y: -2089, yEnd: -2076, precision: 'year-range', target: 'founding-of-sicyon', locator: 'Duration 14',
    note: 'Two counts: Eusebius (via Ussher) gives 1,313 years before the first Olympiad, which is 2089 BC. Not an anchor point, so display only; the sort stays with the tiers.' },
  { key: 'c2-trier', src: 'cfah-2', where: 'section "Duration 15: The Founding of Trier, Germany: 2053 BC"', date: '2053 BC', y: -2053, precision: 'year', target: 'founding-of-trier', locator: 'Duration 15',
    note: 'Trier\'s tradition (Gesta Treverorum) of its founding by Trebeta, son of Ninus. Not an anchor point, so display only.' },
];
