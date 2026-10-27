// Pass 1. Hales's own summary, as printed.
// Vol. II, Synopsis of the Chronology, Periods I–VII (Creation through Nehemiah's
// reform, the end of his Old Testament canon). Vol. I, Table XI, from Creation
// through the Era of Nabonassar.
// The B.C. column is stored as year_bc_ad. The Y column stays in the quotation.
// A parenthesis is the Hebrew age he prints beside the age he adopts.
// Period VIII and the rest of Table XI are not in this pass.
import { people } from './records.mjs';

const P = 'The parenthesis is the Hebrew age. The other age is the one he adopts. The last figure is his B.C. column.';
const R = (section, page, leaf, quote, year, targets = [], note = '') => ({
  section, vol: 2, page, leaf, where: 'Synopsis of the Chronology', quote, year, targets, note,
});
const T = (quote, year, targets = [], note = '', prec) => ({
  section: 'table-xi', vol: 1, page: '101', leaf: 134, where: 'Table XI, Remarkable Eras', quote, year, targets, note, prec,
});

const rows = [
  // ——— Vol. II, p. xxxii (Archive leaf n35; the next leaf is headed xxxiii) ———
  R('period-1', 'xxxii', 35, '1. Adam (130) 230 5411', -5411, ['adam:birth', 'creation-week'], P),
  R('period-1', 'xxxii', 35, '2. Seth (105) 205 5181', -5181, ['seth:birth'], P),
  R('period-1', 'xxxii', 35, '3. Enos (90) 190 4976', -4976, ['enosh:birth'], P + ' He prints Enos.'),
  R('period-1', 'xxxii', 35, '4. Cainan (70) 170 4786', -4786, ['kenan:birth'], P + ' He prints Cainan for the son of Enos. This is not a second Cainan.'),
  R('period-1', 'xxxii', 35, '5. Malaleel (65) 165 4616', -4616, ['mahalalel:birth'], P + ' He prints Malaleel.'),
  R('period-1', 'xxxii', 35, '6. Jared 162 4451', -4451, ['jared:birth'], 'No Hebrew age is printed in parenthesis on this line.'),
  R('period-1', 'xxxii', 35, '7. Enoch (65) 165 4289', -4289, ['enoch:birth'], P),
  R('period-1', 'xxxii', 35, '8. Methuselah 187 4124', -4124, ['methuselah:birth']),
  R('period-1', 'xxxii', 35, '9. Lamech 182 3937', -3937, ['lamech:birth']),
  R('period-1', 'xxxii', 35, '10. Noah 600 3755', -3755, ['noah:birth']),
  R('period-1', 'xxxii', 35, 'Deluge 2256 3155', -3155, ['the-flood'], 'Our check: the adopted ages from Adam through Noah sum to the printed 2256, and 5411 minus 2256 is 3155. That product is not stored.'),

  R('period-2', 'xxxii', 35, '1. Deluge, Shem 2 3155', -3155, ['the-flood'], 'The 2 is in the Y column on the Shem line. Arphaxad is B.C. 3153, two years later. Shem’s birth is not stored from this line.'),
  R('period-2', 'xxxii', 35, '2. Arphaxad (35) 135 3153', -3153, ['arphaxad:birth'], P),
  R('period-2', 'xxxii', 35, '3. Salah (30) 130 3018', -3018, ['salah:birth'], P),
  R('period-2', 'xxxii', 35, '4. Heber (34) 134 2888', -2888, ['eber:birth'], P + ' He prints Heber.'),
  R('period-2', 'xxxii', 35, '5. Peleg or Phaleg (30) 130 2754', -2754, ['peleg:birth'], P),

  // ——— p. xxxiii, leaf n36 ———
  R('period-2', 'xxxiii', 36, '6. Reu or Ragau (32) 132 2624', -2624, ['reu:birth'], P),
  R('period-2', 'xxxiii', 36, 'Division of the Earth 2614', -2614, ['first-territorial-division']),
  R('period-2', 'xxxiii', 36, 'Nimrod’s kingdom and Confusion of Tongues 2554', -2554, ['nimrod:reign', 'dispersion'], 'A different year from “Division of the Earth” 2614 and from Table XI “Dispersion of mankind” 2614.'),
  R('period-2', 'xxxiii', 36, '7. Serug (30) 130 2492', -2492, ['serug:birth'], P),
  R('period-2', 'xxxiii', 36, '8. Nahor (29) 79 2362', -2362, ['nahor:birth'], P + ' This is Nahor son of Serug.'),
  R('period-2', 'xxxiii', 36, 'Job’s trial 2337', -2337, [], 'No Job record, and a trial is not a birth, death, or reign.'),
  R('period-2', 'xxxiii', 36, '9. Terah (70) 130 2283', -2283, ['terah:birth'], P),
  R('period-2', 'xxxiii', 36, '10. Abraham 1002 2153', -2153, ['abraham:birth', 'abraham-birth'], 'Our check: 3155 minus 2153 is the printed 1002. That product is not stored.'),

  R('period-3', 'xxxiii', 36, '1. Abraham 60 2153', -2153, ['abraham:birth'], 'Period 3 repeats his birth. A brace prints 75 beside the 60 and the 15 of the next line. 75 is not stored.'),
  R('period-3', 'xxxiii', 36, 'goes to Charran 15 2093', -2093, [], 'Not placed on abraham-enters-canaan, which also names Canaan and Egypt at other years.'),
  R('period-3', 'xxxiii', 36, 'to Canaan 25 2078', -2078, ['abraham-enters-canaan']),
  R('period-3', 'xxxiii', 36, 'to Egypt 2077', -2077, []),
  R('period-3', 'xxxiii', 36, 'rescues Lot 2070', -2070, []),
  R('period-3', 'xxxiii', 36, 'Ishmael 2067', -2067, ['ishmael:birth']),
  R('period-3', 'xxxiii', 36, 'Destruction of Sodom 2054', -2054, ['destruction-of-sodom']),
  R('period-3', 'xxxiii', 36, 'goes to Gerar 2054', -2054, [], 'A brace prints 215 in this part of the column. 215 is not stored.'),
  R('period-3', 'xxxiii', 36, '2. Isaac 60 2053', -2053, ['isaac:birth']),
  R('period-3', 'xxxiii', 36, 'His intended Sacrifice 2028', -2028, []),
  R('period-3', 'xxxiii', 36, '3. Jacob 82 1993', -1993, ['jacob:birth']),
  R('period-3', 'xxxiii', 36, 'goes to Charran 1916', -1916, ['jacob-to-haran']),
  R('period-3', 'xxxiii', 36, '4. Levi 48 1911', -1911, ['levi:birth']),
  R('period-3', 'xxxiii', 36, 'Joseph, Governor of Egypt 1872', -1872, ['joseph:reign', 'joseph-made-vizier']),
  R('period-3', 'xxxiii', 36, '5. Kohath 60 1863', -1863, ['kohath:birth']),
  R('period-3', 'xxxiii', 36, 'Jacob’s family go to Egypt 1863', -1863, ['jacob-enters-egypt']),
  R('period-3', 'xxxiii', 36, '6. Amram 75 1803', -1803, ['amram:birth'], 'A brace prints 215 beside this part of the column. 215 is not stored.'),
  R('period-3', 'xxxiii', 36, 'Joseph’s death 1792', -1792, ['joseph:death']),
  R('period-3', 'xxxiii', 36, '7. Moses 80 1728', -1728, ['moses:birth']),
  R('period-3', 'xxxiii', 36, 'Exode of the Israelites 40 40 1648', -1648, ['exodus'], 'The line prints 40 twice.'),
  R('period-3', 'xxxiii', 36, 'Their return to Canaan 545 1608', -1608, ['crossing-the-jordan'], 'Our check: 2153 minus 1608 is the printed 545. That product is not stored.'),

  // ——— p. xxxiv, leaf n37 ———
  R('period-4', 'xxxiv', 37, '1. Joshua and the Elders 26 1608', -1608, ['iosua:reign'], 'The elders on this line have no separate record.'),
  R('period-4', 'xxxiv', 37, 'First division of Lands 1602', -1602, ['division-of-the-land']),
  R('period-4', 'xxxiv', 37, 'Second division of Lands 1596', -1596, ['division-of-the-land']),
  R('period-4', 'xxxiv', 37, 'Anarchy or Interregnum 10 1582', -1582, []),
  R('period-4', 'xxxiv', 37, 'I. Servitude Mesopotam. 8 1572', -1572, []),
  R('period-4', 'xxxiv', 37, '2. Othniel 40 1564', -1564, ['othoniel:reign', 'othniel-judges-israel']),
  R('period-4', 'xxxiv', 37, 'II. Servit. Moab 18 1524', -1524, []),
  R('period-4', 'xxxiv', 37, '3. Ehud and Shamgar 80 1506', -1506, ['ehud:reign', 'shamgar-judges-israel']),
  R('period-4', 'xxxiv', 37, 'III. Servit. Canaan 20 1426', -1426, [], 'Not placed on oppression-of-jabin. The line prints Canaan.'),
  R('period-4', 'xxxiv', 37, '4. Deborah and Barak 40 1406', -1406, ['deborah-and-barak']),
  R('period-4', 'xxxiv', 37, 'IV. Servit. Midian 7 1366', -1366, []),
  R('period-4', 'xxxiv', 37, '5. Gideon 40 1359', -1359, ['gedeon:reign']),
  R('period-4', 'xxxiv', 37, '6. Abimelech 3 1319', -1319, ['abimelech-son-of-gideon:reign', 'reign-of-abimelech']),
  R('period-4', 'xxxiv', 37, '7. Tola 23 1316', -1316, ['tola:reign']),
  R('period-4', 'xxxiv', 37, '8. Jair 22 1293', -1293, ['jair:reign']),
  R('period-4', 'xxxiv', 37, 'V. Servit. Ammon 18 1271', -1271, []),
  R('period-4', 'xxxiv', 37, '9. Jephthah 6 1253', -1253, ['jephthah:reign']),
  R('period-4', 'xxxiv', 37, '10. Ibzan 7 1247', -1247, ['ibzan:reign']),
  R('period-4', 'xxxiv', 37, '11. Elon 10 1240', -1240, ['elon:reign']),
  R('period-4', 'xxxiv', 37, '12. Abdon 8 1230', -1230, ['abdon:reign']),
  R('period-4', 'xxxiv', 37, 'VI. Servit. Philist. 40 20 1222', -1222, [], 'A brace joins 40 on this line to 20 here and 20 on Samson’s line.'),
  R('period-4', 'xxxiv', 37, '13. Samson 20 1202', -1202, ['samson:reign']),
  R('period-4', 'xxxiv', 37, '14. Eli 40 30 1182', -1182, ['eli:reign'], 'A brace joins 40 on this line to 30 here and 10 on the next line.'),
  R('period-4', 'xxxiv', 37, 'Samuel called as a prophet 10 1152', -1152, ['samuel:reign'], 'The call, not a birth.'),
  R('period-4', 'xxxiv', 37, 'VII. Servit. Philist. 20 1142', -1142, []),
  R('period-4', 'xxxiv', 37, '15. Samuel 12 1122', -1122, ['samuel:reign', 'samuel-judges-israel']),
  R('period-4', 'xxxiv', 37, 'Saul elected king 498 1110', -1110, ['saul:reign', 'saul-made-king'], 'Our check: 1608 minus 1110 is the printed 498. That product is not stored.'),

  R('period-5', 'xxxiv', 37, '1. Saul 40 1110', -1110, ['saul:reign', 'saul-made-king']),
  R('period-5', 'xxxiv', 37, 'Samuel Judge jointly, 38 years', null, ['samuel:reign'], 'No B.C. year on this line.'),
  R('period-5', 'xxxiv', 37, 'Saul defeats the Ammonites 1110', -1110, []),
  R('period-5', 'xxxiv', 37, 'his first offence 1108', -1108, []),
  R('period-5', 'xxxiv', 37, 'Jonathan defeats the Philistines 1106', -1106, [], 'No record of Saul’s son Jonathan. jonathan-goforth was not used.'),

  // ——— p. xxxv, leaf n38 ———
  R('period-5', 'xxxv', 38, 'Saul’s second offence 1100', -1100, []),
  R('period-5', 'xxxv', 38, 'David born 1100', -1100, ['david:birth']),
  R('period-5', 'xxxv', 38, 'kills Goliah 1080', -1080, []),
  R('period-5', 'xxxv', 38, 'marries Michal 1075', -1075, []),
  R('period-5', 'xxxv', 38, 'first flight to Gath 1074', -1074, []),
  R('period-5', 'xxxv', 38, 'second flight to Gath 1071', -1071, []),
  R('period-5', 'xxxv', 38, 'Saul’s third offence 1070', -1070, []),
  R('period-5', 'xxxv', 38, '2. David 40 1070', -1070, ['david:reign', 'reign-of-david']),
  R('period-5', 'xxxv', 38, 'takes Jebus 1063', -1063, []),
  R('period-5', 'xxxv', 38, 'Philistine war 1061', -1061, []),
  R('period-5', 'xxxv', 38, 'Ark brought home 1060', -1060, []),
  R('period-5', 'xxxv', 38, 'Nathan’s prophecy of THE MESSIAH, the Son of David 1055', -1055, [], 'Not placed on davidic-covenant.'),
  R('period-5', 'xxxv', 38, 'David’s first offence 1052', -1052, []),
  R('period-5', 'xxxv', 38, 'Solomon born 1050', -1050, ['solomon:birth']),
  R('period-5', 'xxxv', 38, 'Absalom’s and Sheba’s rebellions 1036', -1036, []),
  R('period-5', 'xxxv', 38, 'David’s second offence 1032', -1032, []),
  R('period-5', 'xxxv', 38, 'Adonijah’s rebellion 1030', -1030, []),
  R('period-5', 'xxxv', 38, '3. Solomon 40 1030', -1030, ['solomon:reign', 'reign-of-solomon']),
  R('period-5', 'xxxv', 38, 'Temple begun 1027', -1027, [], 'No foundation event. temple-dedication is the dedication.'),
  R('period-5', 'xxxv', 38, 'finished 1020', -1020, ['temple-dedication'], 'He prints “finished”. The record is the dedication.'),
  R('period-5', 'xxxv', 38, 'Tadmor built 1006', -1006, []),
  R('period-5', 'xxxv', 38, 'Temples on the Mount of Corruption 996', -996, []),
  R('period-5', 'xxxv', 38, 'The Revolt 120 990', -990, [], 'Our check: 1110 minus 990 is the printed 120. That product is not stored.'),

  R('period-6', 'xxxv', 38, '1. Rehoboam 17 990', -990, ['rehoboam:reign']),
  R('period-6', 'xxxv', 38, '2. Abijah 3 973', -973, ['abijah-of-judah:reign']),
  R('period-6', 'xxxv', 38, '3. Asa 41 970', -970, ['asa:reign']),
  R('period-6', 'xxxv', 38, '4. Jehosaphat 25 929', -929, ['jehoshaphat:reign'], 'He prints Jehosaphat.'),
  R('period-6', 'xxxv', 38, '5. Jehoram or Joram 8 904', -904, ['jehoram-of-judah:reign'], 'Kings of Judah. Not a king of Israel.'),
  R('period-6', 'xxxv', 38, '6. Ahaziah 1 896', -896, ['ahaziah-of-judah:reign'], 'Not Ahaziah king of Israel.'),
  R('period-6', 'xxxv', 38, '7. Q. Athaliah 6 895', -895, ['athalia:reign']),
  R('period-6', 'xxxv', 38, '8. Joash or Jehoash 40 889', -889, ['joash-of-judah:reign'], 'Kings of Judah. Not Raleigh’s Joash in the Israel column.'),
  R('period-6', 'xxxv', 38, '9. Amaziah 29 849', -849, ['amaziah:reign']),
  R('period-6', 'xxxv', 38, 'Interregnum 11 820', -820, []),

  // ——— p. xxxvi, leaf n39 ———
  R('period-6', 'xxxvi', 39, '10. Uzziah, or Azariah 52 809', -809, ['uzziah:reign']),
  R('period-6', 'xxxvi', 39, '11. Jotham 16 757', -757, ['jotham:reign']),
  R('period-6', 'xxxvi', 39, '12. Ahaz 16 741', -741, ['ahaz:reign']),
  R('period-6', 'xxxvi', 39, '13. Hezekiah 29 725', -725, ['hezekiah:reign']),
  R('period-6', 'xxxvi', 39, '14. Manasseh 55 696', -696, ['manasses:reign'], 'Raleigh’s Manasseh in the Judah column. Not Manasseh the son of Joseph.'),
  R('period-6', 'xxxvi', 39, '15. Amon 2 641', -641, ['amon:reign']),
  R('period-6', 'xxxvi', 39, '16. Josiah 31 639', -639, ['iosias:reign']),
  R('period-6', 'xxxvi', 39, '17. Jehoahaz, 3 m.', null, ['jehoahaz-of-judah:reign'], 'No B.C. year on this line. Not Jehoahaz of Israel.'),
  R('period-6', 'xxxvi', 39, '18. Jehoiakim 11 608', -608, ['iehoiakim:reign']),
  R('period-6', 'xxxvi', 39, '19. Jehoiachin, Jechoniah, or Coniah, 3 m.', null, ['jehoiachin:reign'], 'No B.C. year on this line.'),
  R('period-6', 'xxxvi', 39, '20. Zedekiah 11 597', -597, ['zedekiah:reign']),
  R('period-6', 'xxxvi', 39, 'Jerusalem destroyed 404 586', -586, ['fall-of-jerusalem-586-bc'], 'Our check: 990 minus 586 is the printed 404. That product is not stored.'),

  R('period-7', 'xxxvi', 39, '1. Nebuchadnezzar destroys Jerusalem 25 last 586', -586, ['nebuchadnezzar-ii:reign', 'fall-of-jerusalem-586-bc'], '“25 last” is not an accession year.'),
  R('period-7', 'xxxvi', 39, 'appoints Gedaliah governor 586', -586, ['gedaliah:reign']),
  R('period-7', 'xxxvi', 39, 'subdues the Ammonites, &c. 585', -585, []),
  R('period-7', 'xxxvi', 39, 'besieges Tyre 584', -584, [], 'Not Alexander’s siege of Tyre.'),
  R('period-7', 'xxxvi', 39, 'desolates Judea 582', -582, []),
  R('period-7', 'xxxvi', 39, 'subdues Egypt 570', -570, []),
  R('period-7', 'xxxvi', 39, 'his first dream 569', -569, []),
  R('period-7', 'xxxvi', 39, 'sets up the golden image 569', -569, []),
  R('period-7', 'xxxvi', 39, 'his second dream 568', -568, []),
  R('period-7', 'xxxvi', 39, '2. Evil Merodach 3 561', -561, ['evil-merodach:reign']),
  R('period-7', 'xxxvi', 39, 'releases Jehoiachin 561', -561, ['jehoiachin:reign'], 'The release, not the three-month reign.'),
  R('period-7', 'xxxvi', 39, '3. Belshazzar 5 558', -558, ['belshazzar:reign'], 'Not Nabonidus, and not belshazzar-co-regent.'),
  R('period-7', 'xxxvi', 39, 'his feast and death 553', -553, ['belshazzar:death']),
  R('period-7', 'xxxvi', 39, '1. Darius the Mede, or Cyaxares 2 553', -553, ['darius-the-mede:reign'], 'The existing Cyaxares record was not used. The “or” is Hales’s identification.'),
  R('period-7', 'xxxvi', 39, '2. Cyrus the Persian 15 551', -551, ['cyrus-the-great:reign']),
  R('period-7', 'xxxvi', 39, 'takes Babylon, first of his sovereignty 536', -536, ['cyrus-the-great:reign', 'fall-of-babylon-539-bc']),
  R('period-7', 'xxxvi', 39, 'Jews return under Zerubbabel 536', -536, ['zerubbabel:reign', 'cyrus-decree-of-return']),
  R('period-7', 'xxxvi', 39, '1. High priest, Jeshua, 53 years 536', -536, ['jeshua-high-priest:reign'], 'Not Joshua the son of Nun.'),
  R('period-7', 'xxxvi', 39, 'Second Temple begun 535', -535, ['temple-rebuilding-begins']),
  R('period-7', 'xxxvi', 39, '3. Cambyses 8 529', -529, ['cambyses-ii:reign']),

  // ——— p. xxxvii, leaf n40. Stop before the Eighth Period on this page. ———
  R('period-7', 'xxxvii', 40, '4. Darius Hystaspes 36 521', -521, ['darius-i:reign'], 'darius-hystaspis was left unlinked so the two records are not merged.'),
  R('period-7', 'xxxvii', 40, 'Temple finished 516', -516, ['second-temple-completed']),
  R('period-7', 'xxxvii', 40, '5. Xerxes 21 485', -485, ['xerxes-i:reign']),
  R('period-7', 'xxxvii', 40, '2. High priest, Jehoiakim, 30 years 483', -483, ['jehoiakim-high-priest:reign'], 'Not Jehoiakim the king.'),
  R('period-7', 'xxxvii', 40, '6. Artaxerxes Longimanus 41 464', -464, ['artaxerxes-longimanus:reign']),
  R('period-7', 'xxxvii', 40, 'stops the rebuilding of Jerusalem 463', -463, []),
  R('period-7', 'xxxvii', 40, 'marries Esther 460', -460, [], 'No Esther record. Not stored as her birth.'),
  R('period-7', 'xxxvii', 40, 'sends Ezra to Judea 457', -457, ['ezra-returns-to-jerusalem']),
  R('period-7', 'xxxvii', 40, '3. High priest, Eliashib, 40 years 453', -453, ['eliashib:reign']),
  R('period-7', 'xxxvii', 40, 'Nehemiah, governor of Judea, 12 years 444', -444, ['nehemiah-rebuilds-the-wall']),
  R('period-7', 'xxxvii', 40, 'rebuilds the walls and the city 444', -444, ['nehemiah-rebuilds-the-wall']),
  R('period-7', 'xxxvii', 40, 'returns to Persia 432', -432, []),
  R('period-7', 'xxxvii', 40, 'comes again to Jerusalem 424', -424, []),
  R('period-7', 'xxxvii', 40, 'Darius Nothus 3 first 423', -423, ['darius-nothus:reign'], '“3 first” is what he prints, not a full reign worked out past the page.'),
  R('period-7', 'xxxvii', 40, 'Nehemiah’s reform. End of the O. T. Canon 166 420', -420, ['nehemiah-reforms'], 'Our check: 586 minus 420 is the printed 166. That product is not stored. The Eighth Period begins lower on this page and is not entered.'),

  // ——— Vol. I, Table XI, p. 101, leaf n134. Through Nabonassar. ———
  T('Creation of the World 5411', -5411, ['creation-week', 'adam:birth']),
  T('Julian Period (January 1.) 4714', -4714, [], 'A technical era in the same table, not a biblical epoch.', 'day'),
  T('Deluge 3155', -3155, ['the-flood']),
  T('Cali yuga, Indian era of the Deluge 3102', -3102, [], 'The Indian era he sets beside his own Deluge of 3155. Not stored as his Deluge.'),
  T('Dispersion of mankind 2614', -2614, ['first-territorial-division'], 'Same year as the synopsis line “Division of the Earth”. Not the confusion-of-tongues line at 2554.'),
  T('Nimrod reigns in Assyria 2554', -2554, ['nimrod:reign']),
  T('Menes reigns in Egypt 2412', -2412, ['menes:reign'], 'Not Menes Abdul Noor.'),
  T('Tcheou, or division of the Chinese empire into twelve provinces 2277', -2277, []),
  T('Abraham born 2153', -2153, ['abraham:birth', 'abraham-birth']),
  T('Settlement of the Israelites in Egypt 1863', -1863, ['jacob-enters-egypt']),
  T('Exode of the Israelites from Egypt 1648', -1648, ['exodus']),
  T('Cecrops reigns at Athens 1558', -1558, ['reign-of-cecrops'], 'Not Cecrops II.'),
  T('Sesostris reigns in Egypt 1308', -1308, [], 'Not placed on reign-of-senusret-iii.'),
  T('Destruction of Troy 1183', -1183, ['fall-of-troy']),
  T('Foundation of Solomon’s Temple 1027', -1027, [], 'Same year as the synopsis line “Temple begun”. No foundation event.'),
  T('Era of Iphitus (July 1.) 884', -884, [], '', 'day'),
  T('Era of the Olympiads (July 19.) 776', -776, ['first-olympic-games'], '', 'day'),
  T('Foundation of Rome (April 21.) 753', -753, ['founding-of-rome'], '', 'day'),
  T('Era of Nabonassar (February 26.) 747', -747, ['era-of-nabonassar'], 'Last row of Table XI in this pass. The Seleucid era and the rest of the table remain.', 'day'),
];

const ids = new Set(Object.keys(people));
for (const row of rows) {
  for (const t of row.targets) {
    const id = t.split(':')[0];
    ids.delete(id);
  }
}
if (ids.size) throw new Error(`Hales records with no row: ${[...ids].join(', ')}`);

export { rows };
