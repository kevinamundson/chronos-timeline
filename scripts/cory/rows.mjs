// Dated statements read on the 1876 Hodges scan (archive.org corysancientfrag00coryuoft), 2026-10-23.
// page = printed page. quote = the words as printed (short). targets = record ids; "id:reign" for a person.
// A null target is listed in the extract and not attached (unnamed person, or a figure with no record).
// st: agrees | consistent | CONFLICT | internal | framework | n/a
// Nothing here is a BC year of ours. year_bc_ad stays null in the importer.
export const R = (section, page, quote, targets, o = {}) => ({
  section, page, quote, targets: targets == null ? [] : [].concat(targets), ...o,
});

const AP = 'Berossus, ap. Apollodorus, ap. Syncellus and Eusebius';
const AB = 'Berossus, ap. Abydenus, ap. Syncellus and Eusebius';
const PO = 'Berossus, ap. Alexander Polyhistor, ap. Eusebius';
const MEN = 'Menander of Ephesus, ap. Josephus';
const CAS = 'Castor, ap. Eusebius';

export const rows = [
  // ---- Tyrian Annals, printed pp. 28–32 (Menander) ----
  R('tyrian', 28, 'reigned thirty-four years, having lived fifty-three', 'hiram-of-tyre:reign', {
    chain: MEN, note: 'Hiromus [Hiram], son of Abibalus. Abibalus is named and given no length, so he has no record.', st: 'n/a',
  }),
  R('tyrian', 29, 'Solomon, king of Jerusalem', ['hiram-of-tyre:reign', 'solomon:reign'], {
    chain: MEN, note: 'Synchronism only. Menander names Solomon in Hiram\'s reign and gives Solomon no year.', st: 'n/a',
  }),
  R('tyrian', 29, 'he lived forty-three years, and reigned seven', 'baleazarus:reign', {
    chain: MEN, note: 'Baleazarus, son of Hiromus.', st: 'n/a',
  }),
  R('tyrian', 29, 'reigned nine years, having lived twenty-nine', 'abdastartus:reign', {
    chain: MEN, note: 'Abdastartus [Abd-Astarte], son of Baleazarus.', st: 'n/a',
  }),
  R('tyrian', 29, 'the eldest reigned twelve years', null, {
    chain: MEN, note: 'The eldest of the four sons of Abdastartus\'s nurse. He is not named. No record created.', st: 'n/a',
  }),
  R('tyrian', 29, 'reigned twelve years, having lived fifty-four', 'astartus:reign', {
    chain: MEN, note: 'Astartus, the son of Delæastartus. The fifty-four years are his life, in the clause "having lived fifty-four".', st: 'n/a',
  }),
  R('tyrian', 29, 'reigned nine years, having lived fifty-four', 'aserymus:reign', {
    chain: MEN, note: 'Aserymus, brother of Astartus.', st: 'n/a',
  }),
  R('tyrian', 30, 'governed the kingdom eight months, having lived fifty years', 'pheles:reign', {
    chain: MEN, note: 'Pheles, brother of Aserymus. His name is at the foot of p. 29; the eight months and the fifty years are on p. 30.', st: 'n/a',
  }),
  R('tyrian', 30, 'reigned thirty-two years, having lived sixty-eight', 'ithobalus:reign', {
    chain: MEN, note: 'Ithobalus [Ethbaal], priest of Astarte. The edition\'s footnote on p. 32 treats this king as distinct from the Ithobalus of Nebuchadnezzar\'s siege.', st: 'n/a',
  }),
  R('tyrian', 30, 'reigned six years, having lived forty-five', 'badezorus:reign', {
    chain: MEN, note: 'Badezorus, son of Ithobalus.', st: 'n/a',
  }),
  R('tyrian', 30, 'reigned nine years, having lived thirty-two', 'matgenus:reign', {
    chain: MEN, note: 'Matgenus, son of Badezorus.', st: 'n/a',
  }),
  R('tyrian', 30, 'reigned forty-seven years, having lived fifty-six', 'phygmalion:reign', {
    chain: MEN, note: 'The edition spells the name Phygmalion.', st: 'n/a',
  }),
  R('tyrian', 30, 'In the seventh year of his reign, his sister (Dido), fled from him, and founded the city of Carthage in Libya (b.c. 878)', ['phygmalion:reign', 'founding-of-carthage'], {
    chain: MEN,
    note: 'The parenthesis "(b.c. 878)" is printed in the sentence, immediately before the Josephus citation. It is not stored as year_bc_ad. Whether it is Menander\'s figure or the editor\'s gloss is open (G2).',
    cmp: 'Generations, on founding-of-carthage, prints "Sometime between 800 and 900 BC" (provisional). 878, if it is a year, falls inside that range. It does not set the sort.',
    st: 'consistent',
  }),
  R('tyrian', 30, 'Elulæus reigned thirty-six years', 'elulaeus:reign', {
    chain: 'Menander, ap. Josephus, Antiquities', note: 'Heading: "Of the Invasion of Salmanasar (or Shalmaneser)." Not linked to the existing person shalmaneser-i.', st: 'n/a',
  }),
  R('tyrian', 31, 'and this continued five years', 'elulaeus:reign', {
    chain: 'Menander, ap. Josephus, Antiquities', note: 'The king of Assyria guarded the river and the aqueducts so that the Tyrians drank from wells. Five years is the length of that blockade.', st: 'n/a',
  }),
  R('tyrian', 32, 'Nabuchodonosorus [Nebuchadnezzar] beseiged Tyre for thirteen years', ['ithobalus-ii:reign', 'nebuchadnezzar-ii:reign'], {
    chain: MEN, note: 'In the reign of Ithobalus [or, Ethbaal]. The edition prints "beseiged". A footnote says Menander does not say the city was taken. No reign length is given for this Ithobalus.', st: 'n/a',
  }),
  R('tyrian', 32, 'After him reigned Baal ten years', 'baal-of-tyre:reign', {
    chain: MEN, note: 'Baal after the Ithobalus of the siege.', st: 'n/a',
  }),
  R('tyrian', 32, 'Ecnibalus, the son of Balsachus, two months', 'ecnibalus:reign', {
    chain: MEN, note: 'A judge (suffete), not called a king in this sentence.', st: 'n/a',
  }),
  R('tyrian', 32, 'Chelbes, the son of Abdæus, ten months', 'chelbes:reign', { chain: MEN, st: 'n/a' }),
  R('tyrian', 32, 'Abbarus, the high-priest, three months', 'abbarus:reign', { chain: MEN, st: 'n/a' }),
  R('tyrian', 32, 'Mytgonus and Gerastratus the son of Abdelemus, six years', ['mytgonus:reign', 'gerastratus:reign'], {
    chain: MEN, note: 'One shared term of six years.', st: 'n/a',
  }),
  R('tyrian', 32, 'Balatorus reigned one year', 'balatorus:reign', { chain: MEN, st: 'n/a' }),
  R('tyrian', 32, 'he reigned four years', 'merbalus:reign', {
    chain: MEN, note: 'Merbalus, fetched from Babylon.', st: 'n/a',
  }),
  R('tyrian', 32, 'who reigned twenty years', 'hiram-of-tyre-ii:reign', {
    chain: MEN, note: 'Hiromus [Hiram], brother of Merbalus. Not the Hiram of p. 28.', st: 'n/a',
  }),
  R('tyrian', 32, 'In his time Cyrus was king of Persia', ['hiram-of-tyre-ii:reign', 'cyrus-the-great:reign'], {
    chain: MEN, note: 'Synchronism only. No year is printed for Cyrus here.', st: 'n/a',
  }),

  // ---- Berossus, antediluvian kings ----
  R('berossus', 51, 'he reigned ten sari', 'alorus:reign', {
    chain: AP, note: 'Alorus of Babylon, the first king, in Apollodorus.', st: 'n/a',
  }),
  R('berossus', 53, 'he reigned ten sari', 'alorus:reign', {
    chain: AB, note: 'The same length in Abydenus.', st: 'agrees',
  }),
  R('berossus', 53, 'a sarus is esteemed to be three thousand six hundred years; a neros, six hundred: and a sossus, sixty', 'alorus:reign', {
    chain: AB, note: 'Abydenus\'s definitions, printed in the same paragraph as Alorus. They are not BC years.', st: 'n/a',
  }),
  R('berossus', 51, 'he appeared in the first year', 'ammenon:reign', {
    chain: `${AP}; the parenthesis compares Polyhistor`,
    note: 'Apollodorus places the Musarus Oannes in Ammenon\'s time, and then reports three timings: Polyhistor, the first year; Apollodorus, after forty sari; Abydenus, the second Annedotus after twenty-six sari.',
    st: 'internal',
  }),
  R('berossus', 51, 'Apollodorus says that it was after forty sari', 'ammenon:reign', {
    chain: AP, note: 'One of the three timings of Oannes in the same parenthesis.', st: 'internal',
  }),
  R('berossus', 51, 'Abydenus, however, makes the second Annedotus appear after twenty-six sari', 'ammenon:reign', {
    chain: AP, note: 'Reported inside Apollodorus\'s extract. Abydenus\'s own extract (p. 53) puts a second Annedotus in Amillarus\'s time and does not repeat "twenty-six sari" there.', st: 'internal',
  }),
  R('berossus', 51, 'he reigned eighteen sari', 'megalarus:reign', {
    chain: AP, note: 'Megalarus from Pantibiblon, in Apollodorus.', st: 'n/a',
  }),
  R('berossus', 53, 'eighteen sari', 'megalarus:reign', {
    chain: AB, note: 'Megalarus, of the same place, in Abydenus.', st: 'agrees',
  }),
  R('berossus', 51, 'reigned ten sari', 'daonus:reign', {
    chain: AP, note: 'Daonus the shepherd, from Pantibiblon.', st: 'n/a',
  }),
  R('berossus', 53, 'governed for the space of ten sari', 'daonus:reign', {
    chain: AB, note: 'Daos the shepherd, of Pantibiblon. Same length, other spelling.', st: 'agrees',
  }),
  R('berossus', 52, 'for the period of eighteen sari', 'euedoreschus:reign', {
    chain: AP, note: 'Euedoreschus, from Pantibiblon. Abydenus names Euedoreschus (p. 54) and gives him no length.', st: 'n/a',
  }),
  R('berossus', 52, 'ruled for ten sari', 'amempsinus:reign', {
    chain: AP, note: 'Amempsinus, "being the eighth in order".', st: 'n/a',
  }),
  R('berossus', 52, 'he ruled for eight sari', 'otiartes:reign', {
    chain: AP, note: 'Otiartes, a Chaldæan from Laranchae. Polyhistor (p. 60) calls the ninth king Ardates and gives him no length.', st: 'internal',
  }),
  R('berossus', 52, 'reigned eighteen sari', 'xisuthrus:reign', {
    chain: AP, note: 'Xisuthrus, son of Otiartes. "In his time the great Flood happened."', st: 'n/a',
  }),
  R('berossus', 60, 'reigned eighteen sari', 'xisuthrus:reign', {
    chain: PO, note: 'Xisuthrus, son of Ardates, "who is called by them the tenth". Same length as Apollodorus.', st: 'agrees',
  }),
  R('berossus', 53, 'Alaparus reigned three sari', 'alaparus:reign', {
    chain: AB, note: 'Apollodorus names Alaparus and gives him no length.', st: 'n/a',
  }),
  R('berossus', 53, 'who reigned thirteen sari', 'amillarus:reign', {
    chain: AB, note: 'Amillarus, from Pantibiblon. Apollodorus names Amelon in this place in the list and gives him no length.', st: 'n/a',
  }),
  R('berossus', 53, 'reigned twelve sari', 'ammenon:reign', {
    chain: AB, note: 'Ammenon of Pantibiblon. Apollodorus names him and gives him no length.', st: 'n/a',
  }),
  R('berossus', 52, 'the sum total of all the kings is ten ; and the period which they collectively reigned amounts to one hundred and twenty sari', ['xisuthrus:reign', 'the-flood'], {
    chain: AP,
    note: 'Apollodorus\'s total. The flood entry records the parallel. The text does not name Noah, and Xisuthrus is not added to the Flood\'s people.',
    cmp: 'CFAH dates the Flood 2348–2347 B.C. (AP-29). One hundred and twenty sari, at Abydenus\'s 3,600 years to a sarus, is the figure Polyhistor prints as 432,000 years (p. 60). That duration cannot sit before 2348 B.C.',
    st: 'framework',
  }),
  R('berossus', 54, 'ten kings, and the term of their reigns to one hundred and twenty sari', 'xisuthrus:reign', {
    chain: AB, note: 'Abydenus\'s total. He does not print the 432,000 product.', st: 'agrees',
  }),
  R('berossus', 60, 'one hundred and twenty sari, or 432,000 years, reaching to the time of the Flood', ['xisuthrus:reign', 'the-flood'], {
    chain: PO,
    note: 'The 432,000 is printed in this edition, in Polyhistor\'s extract. It is not our product. The same parenthesis says the ten kings reach to the time of the Flood.',
    cmp: 'Against CFAH AP-29 (2348–2347 B.C.) this is a different scale of time. Scripture (MT) governs. The figure is display only.',
    st: 'framework',
  }),
  R('berossus', 54, 'on the fifteenth day of the month Desius there would be a Deluge', 'xisuthrus:reign', {
    chain: AB, note: 'The day of the month, as Abydenus gives it. Not a year.', st: 'n/a',
  }),
  R('berossus', 60, 'upon the fifteenth day of the month Dæsia there would be a flood', 'xisuthrus:reign', {
    chain: PO, note: 'Polyhistor\'s month-name for the same notice. A footnote says Dæsia is the 5th Macedonian month.', st: 'internal',
  }),

  // ---- Polyhistor: post-flood Chaldean and Assyrian kings, pp. 85–92 ----
  R('chaldean', 85, 'during a period of four neri', 'evexius:reign', {
    chain: PO,
    note: 'After the deluge. DERIVED (not a year in the text): Abydenus defines a neros as six hundred years (p. 53), so four neri are 4 × 600 = 2,400 years. The text does not print that product, and it is not a BC year.',
    st: 'framework',
  }),
  R('chaldean', 85, 'four neri and five sossi', 'comosbelus:reign', {
    chain: PO,
    note: 'Comosbelus, son of Evexius. DERIVED: 4 × 600 + 5 × 60 = 2,700 years, using Abydenus\'s definitions on p. 53. The text does not print that product.',
    st: 'framework',
  }),
  R('chaldean', 85, 'there were altogether 86 kings', ['the-flood', 'median-dynasty-of-babylon'], {
    chain: PO, note: 'From Xisuthrus and the Flood to the Medes\' possession of Babylon. A count of kings, not a year.', st: 'n/a',
  }),
  R('chaldean', 85, 'a period of 33,091 years', ['the-flood', 'median-dynasty-of-babylon'], {
    chain: PO,
    note: 'The duration of those 86 reigns, as printed. Not a BC year.',
    cmp: 'A run of 33,091 years from the Flood to the Median dynasty cannot sit in the CFAH span from AP-29 (2348–2347 B.C.) to the Median dynasty (the record prints 2191–1968 B.C.). Display only.',
    st: 'framework',
  }),
  R('chaldean', 85, 'eight in number, who reigned during the period of 224 years', 'median-dynasty-of-babylon', {
    chain: PO,
    note: 'Median kings set on the throne of Babylon.',
    cmp: 'The record\'s summary states that this dynasty "ruled 224 years". The fragment prints the same length and no BC year.',
    st: 'agrees',
  }),
  R('chaldean', 85, 'eleven kings during . . . . years', 'babylon-dynasty-3', {
    chain: PO,
    note: 'The dots are printed. Footnote: "No number is given in the original text." CFAH\'s 33 years for Dynasty 3 are not copied into this blank.',
    st: 'n/a',
  }),
  R('chaldean', 85, '49 kings of the Chaldeans, 458 years', 'babylon-dynasty-4-chaldean', {
    chain: PO,
    cmp: 'The event title prints "458 years". The fragment prints the same length and no BC year.',
    st: 'agrees',
  }),
  R('chaldean', 85, 'nine kings of the Arabians, 245 years', 'babylon-dynasty-5-arab', {
    chain: PO,
    cmp: 'CFAH on this event prints "1477–1232 B.C." and does not print a length in years. The fragment prints 245 years and no BC year. Nothing is converted either way.',
    st: 'n/a',
  }),
  R('chaldean', 85, '45 kings, assigning to them a term of 526 years', 'babylon-dynasty-6-assyrian', {
    chain: PO,
    note: 'After the sentence "Semiramis reigned over the Assyrians", for which this extract gives no length. The 42 years are Castor\'s, on p. 91.',
    cmp: 'The event summary states "526 years of Assyrian rule". The fragment prints the same length and no BC year.',
    st: 'agrees',
  }),
  R('chaldean', 86, 'governed for the space of 30 days', 'akises:reign', {
    chain: PO, note: 'Akises, after the brother of Senecherib. Days, not a year.', st: 'n/a',
  }),
  R('chaldean', 86, 'held the empire by force during six months', 'merodach-baladan:reign', {
    chain: PO, note: 'Marodach Baladanus, who slew Akises.', st: 'n/a',
  }),
  R('chaldean', 86, 'in the 3rd year of his reign', 'elibus:reign', {
    chain: PO, note: 'Elibus. In that year Senecherib levied an army, conquered him, and appointed his son Assordanius king of the Babylonians. A point in the reign, not a length.', st: 'n/a',
  }),
  R('chaldean', 87, 'he reigned 18 years, and was cut off by a conspiracy', 'sennacherib:reign', {
    chain: PO, note: 'Sinnecherim (Sennacherib), cut off by his son Ardu-Musanus. This is the first of two "18 years" in the edition.', st: 'n/a',
  }),
  R('chaldean', 87, 'Sinecherim (Sennacherib) reigned 18 years', 'sennacherib:reign', {
    chain: PO, note: 'The second "18 years", in the successors list. The two statements agree with each other.', st: 'agrees',
  }),
  R('chaldean', 87, 'his son (Esarhaddon) reigned eight years', 'esarhaddon:reign', {
    chain: PO, note: 'The name Esarhaddon is in parentheses in the 1876 text.', st: 'n/a',
  }),
  R('chaldean', 87, 'Then Sammuges (Saulmugina ?) reigned 21 years', 'sammugina:reign', {
    chain: PO, note: 'The numeral 21 is at the foot of p. 87. The word "years" is the first word of p. 88.', st: 'n/a',
  }),
  R('chaldean', 88, 'and likewise his brother 21 years', null, {
    chain: PO, note: 'The brother is not named. Not identified with Sardanapallus, who is given 21 years in the next sentences. See G1.', st: 'internal',
  }),
  R('chaldean', 88, 'Nabupalsar, (Nabopollassar), reigned 20 years', 'nabopolassar:reign', {
    chain: PO, note: 'A footnote says "Nabopollasar, see p. 84." The p. 84 mention was not given a separate length in this pass.', st: 'n/a',
  }),
  R('chaldean', 88, 'Nabucodrossorus, (Nebuchadnezzar), reigned 43 years', 'nebuchadnezzar-ii:reign', {
    chain: PO, note: 'First of two "43 years" on this page.', st: 'n/a',
  }),
  R('chaldean', 88, 'a period altogether of 88 years', ['sennacherib:reign', 'nebuchadnezzar-ii:reign'], {
    chain: PO,
    note: 'From Sinecherim to Nabucodrossorus. Our check, not a figure of the text beyond the 88: 18 + 8 + 21 + 21 + 20 = 88, using the reigns printed from Sennacherib through Nabopolassar and not Nebuchadnezzar\'s 43. The 88 matches that sum.',
    st: 'consistent',
  }),
  R('chaldean', 88, 'Sardanapallus the Chaldean, reigned 21 years', 'sardanapallus:reign', {
    chain: PO, note: 'Printed "After Samuges". See G1 for the unnamed brother who is also given 21 years.', st: 'internal',
  }),
  R('chaldean', 88, 'Then Nabucodrossorus reigned 43 years', 'nebuchadnezzar-ii:reign', {
    chain: PO, note: 'Second "43 years" on this page, in the captivity narrative. Same length as the list above.', st: 'agrees',
  }),
  R('chaldean', 88, 'reigned 12 years', 'evil-merodach:reign', {
    chain: PO, note: 'Amilmarudochus (Evil-Merodach), son of Nabucodrossorus.', st: 'n/a',
  }),
  R('chaldean', 88, 'reigned over the Chaldaeans 4 years', 'neriglissar:reign', {
    chain: PO, note: 'Neglisarus (Neriglissor).', st: 'n/a',
  }),
  R('chaldean', 88, 'reigned 17 years', 'nabonidus:reign', {
    chain: PO, note: 'Nabodenus (Nabonidus). "In his reign, Cyrus, the son of Cambyses, invaded" Babylonia. No BC year is printed.', st: 'n/a',
  }),
  R('chaldean', 88, 'Cyrus reigned at Babylon 9 years', 'cyrus-the-great:reign', {
    chain: PO, note: 'After Nabonidus fled. The next sentence says Cyrus was killed in the plain of Daas. No BC year is printed.', st: 'n/a',
  }),
  R('chaldean', 89, 'reigned 8 years', 'cambyses-ii:reign', {
    chain: PO, note: 'The name is the last words of p. 88 ("After him Cambyses") and "reigned 8 years" is at the top of p. 89, followed by Darius.', st: 'n/a',
  }),
  R('chaldean', 89, 'then Darius 36 years', 'darius-i:reign', {
    chain: PO, note: 'The sentence continues "and after him, Xerxes, and the other kings of the Persian line." Xerxes is given no length, so no Xerxes row is entered. Mapped to Darius I because Xerxes follows him in the same sentence.', st: 'n/a',
  }),
  R('chaldean', 91, 'we have no certain tradition respecting the length of his reign', 'belus:reign', {
    chain: CAS, note: 'Castor commences the Assyrian canon with Belus and sets down the name only.', st: 'n/a',
  }),
  R('chaldean', 91, 'Ninus reigned over the Assyrians 52 years', 'ninus:reign', {
    chain: CAS, note: 'Not linked to Nimrod. See G3.', st: 'n/a',
  }),
  R('chaldean', 91, 'reigned over the Assyrians 42 years', ['semiramis-i:reign', 'reign-of-semiramis-i'], {
    chain: CAS,
    note: 'Semiramis, after the death of Ninus. The fragment does not say "Semiramis I".',
    cmp: 'The person record\'s CFAH note states "Her 42-year reign". The fragment prints the same length and no BC year.',
    st: 'agrees',
  }),
  R('chaldean', 91, 'Zames, (who is the same as Ninyas,) reigned', 'ninyas:reign', {
    chain: CAS, note: 'No length is printed for Zames. The parenthesis is in the 1876 text.', st: 'n/a',
  }),
  R('chaldean', 92, 'the complete sum of the years amounts to 1280', 'ninus:reign', {
    chain: CAS,
    note: 'The sentence begins at the foot of p. 91: Castor\'s series runs from Ninus to a later Ninus after Sardanapallus. The numeral 1280 is on p. 92. The individual reigns of that canon are not printed in this edition (the text turns to Damascius). The 1280 is not Ninus\'s own reign.',
    st: 'n/a',
  }),
];
