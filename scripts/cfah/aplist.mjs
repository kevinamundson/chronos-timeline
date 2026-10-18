// Every CFAH anchor point number found in the sources (published ARJ CFAH-1 to 6; OSF preprints), with the
// event as the paper names it (short) and the date as printed. Used for data/cfah-coverage.md.
// `none` = the number does not occur; the reason is given.
export const PUBLISHED = [
  [1, 'CFAH-2', 'Babel founded', '2234/2233'], [2, 'CFAH-2', 'Dispersion', '2192/2191'], [3, 'CFAH-2', 'Egyptian cities founded', '2189/2188'], [4, 'CFAH-2', 'Chinese Xia dynasty', '2197'],
  [5, 'CFAH-3', 'Alexander conquers Egypt', '14 November, 332 BC'], [6, 'CFAH-3', 'VAT-4956: 37th year of Nebuchadnezzar', '568/567B.C.'], [7, 'CFAH-3', 'Era of Cyrus (Persian Empire)', '560/559 B.C.'],
  [8, 'CFAH-3', 'Battle of Pelusium', '525 B.C.'], [9, 'CFAH-3', 'Era of Nabonassar', '747 B.C.'], [10, 'CFAH-3', 'Era of the Olympiad', '776/775 B.C.'], [11, 'CFAH-3', 'Era of Rome', '753 B.C.'],
  [12, 'CFAH-3', 'Fall of Troy', '1184/1183 B.C.'], [13, 'CFAH-3', 'Xerxes\' invasion of Greece', '480 B.C.'], [14, 'CFAH-3', 'End of the Eighth Dynasty of Egypt', '1233 B.C.'], [15, 'CFAH-3', 'Semiramis II', '1232/1231 B.C.'],
  [16, 'CFAH-3', 'Nitocris reigned', '1497 to 1479 B.C.'], [17, 'CFAH-3', 'Joseph alive', '1690 B.C. (CFAH-6 Table 1: 1679)'], [18, 'CFAH-3', 'Egyptian Belus: astronomical college', '1576 B.C. (CFAH-6 Table 1: 1577/1576)'],
  [19, 'CFAH-3', 'Phoroneus', '1753 B.C.'], [20, 'CFAH-3', 'Great War in Egypt', '1825 B.C. (CFAH-6: 1825–1769)'], [21, 'CFAH-3', 'Reign of Semiramis I', '2036–1994 B.C.'], [22, 'CFAH-3', 'Hermes/Thoth brings writing into Egypt', '2164/2163 B.C.'],
  [23, 'CFAH-3', 'Kali Yuga', 'February 7, 3104 B.C.'], [24, 'CFAH-3', 'Satya Yuga', '4004 B.C.'], [25, 'CFAH-3', 'Era of the Saptarshi Cycle', '3176 B.C.'], [26, 'CFAH-3', 'Era of the Grand Cycle', '3177/3176 B.C.'],
  [27, 'CFAH-4', 'First territorial division', '2254/2253 B.C.'], [28, 'CFAH-4', 'Second/final territorial division', '2247 B.C.'], [29, 'CFAH-4', 'The Flood', '2348–2347 B.C.'], [30, 'CFAH-4', 'Creation', '4004 B.C.'],
  [31, 'CFAH-4', 'Death of Huang Di/Enosh', '2865/2864 B.C.'], [32, 'CFAH-5', 'Deioces the Mede', '710/709 B.C.'], [33, 'CFAH-5', 'Defeat of Sardanapalus I (Ashur-danin-pal); first Median revolt', '826–822 B.C.'],
  [34, 'CFAH-5', 'Sardanapalus II (Sargon II); second Median revolt', '705–700 B.C.'], [35, 'CFAH-5', 'Fall of Akkad to the Guti Arabs', '1477/1476 B.C.'], [36, 'CFAH-5', 'Assyrian Belus (Shalmaneser I)', '1261 B.C.'],
  [37, null, null, null],
  [38, 'CFAH-5', 'Berossus Dynasty 1 (Chaldean)', '2233—2191 B.C.'], [39, 'CFAH-5', 'Median Dynasty of Babylon', '2191–1968 B.C.'], [40, 'CFAH-5', 'Dynasty 3: division and rebellion', '1968–1935 B.C.'],
  [41, 'CFAH-5', 'Dynasty 4: Chaldean', '1935—1477 B.C.'], [42, 'CFAH-5', 'Dynasty 5: "Arab" dynasty', '1477–1232 B.C.'], [43, 'CFAH-5', 'Dynasty 6 (conclusions)', '1232–706 B.C.'], [44, 'CFAH-5', 'Dynasty 7: second Assyrian dynasty of Babylon', '705–626 B.C.'],
  [45, 'CFAH-5', 'Dynasty 8: Neo-Babylonian Empire', '626–539 B.C.'], [46, 'CFAH-5', 'Ishbi-Erra year 8 / death of Ibbi-Sin', 'c. 1240'], [47, 'CFAH-5', 'Reign of Ninyas Zames/Gilgamesh', '2006–1968 B.C.'], [48, 'CFAH-5', 'Death of Ninus/Nimrod', '2068 B.C.'],
  [49, 'CFAH-6', 'Djoser\'s famine', '2001—1994 BC'], [50, 'CFAH-6', 'Dynasty 3', '2029–1922 BC'], [51, 'CFAH-6', 'Deaths of Concharis and Merenre II', '1491 BC'], [52, 'CFAH-6', 'End of Dynasty 12', '1526/1525 BC'],
  [53, 'CFAH-6', 'Accession of Amenemhat I', '1738 BC'], [54, 'CFAH-6', 'Fall of Heracleopolis', '1781 BC'], [55, 'CFAH-6', 'Royal honours to the rulers of Heracleopolis and Thebes', '1881 BC'], [56, 'CFAH-6', 'Reign of Mentuhotep II begins', '1808 BC'],
  [57, 'CFAH-6', 'Founding of Itjtawy and Dynasty 13', '1729 BC'], [58, 'CFAH-6', 'Joseph\'s famine', '1708 to 1701 BC'], [59, 'CFAH-6', 'Opening of the Aswan Canal', '1606 BC'], [60, 'CFAH-6', 'Assassination attempt on Amenemhat I', '1718 BC'],
  [61, 'CFAH-6', 'Joseph\'s promotion', '1716/1715 BC'],
];
export const NONE_REASON = { 37: 'No AP-37 occurs in CFAH-1 to 6 (searched for "AP-37", "AP 37", "Anchor Point #37"), nor in any OSF file. The CFAH-5 Table 3 AP column is offset by one (see the inconsistencies list) and uses 39–47 for Berossus Period 2 and Dynasties 1–8, so 37 is not used there either.' };
export const OSF_APS = [
  [62, 'cfah-8-osf', 'Flight of Amenophis/Taharqa', '671 BC'], [63, 'cfah-8-osf', 'End of Dynasty 17, start of Dynasty 18', '1081 BC'], [64, 'cfah-8-osf', 'Death of Apophis III; anointing of David', '1074 BC'],
  [65, 'cfah-8-osf', 'Thutmose (III) year 30; Shishak sacks the temple; Rehoboam year 5', '971 BC'], [66, 'cfah-8-osf', 'Death of Amenhotep III', '889 BC'], [67, 'cfah-8-osf', 'Piankhi\'s invasion of the Delta', '758 BC'],
  [68, 'cfah-8-osf', 'Death of Horemheb; accession of Shoshenq I', '814 BC'], [69, 'cfah-9-osf', 'Death of Khamudi', '1064/1063 BC'], [70, 'cfah-9-osf', 'Seti I', '670 - 611 BC'], [71, 'cfah-9-osf', 'Osorkon III appointed king of Tanis', '663 BC'],
  [72, 'cfah-9-osf', 'Battle of Kadesh', '639 BC'], [73, 'cfah-9-osf', 'Treaty of Kadesh', '624/623 BC'], [74, 'cfah-9-osf', 'Marriage of Rameses II to a daughter of Cyaxares', '610 BC'],
  [75, 'cfah-10-osf', 'Accession of Shoshenq III', '702 BC'], [76, 'cfah-10-osf', 'Accession of Petubast I', '694 BC'], [77, 'cfah-10-osf', 'Conquest of Damascus by Ashur-Nirari III, Shoshenq I and Jeroboam II', '806 BC'],
  [78, 'cfah-13-osf', 'Solar eclipse omen in the 7th year of Mursilis', 'April 15th, 657 BC'], [79, 'cfah-13-osf', 'Letter of Dakhamunzu; death of Suppiluliuma I', '664 BC'], [80, 'cfah-13-osf', 'Death of Gyges', '661 BC'],
  [81, null, null, null],
  [82, 'cfah-13-osf', 'Sack of Babylon by Mursilis I', '851 BC'], [83, 'cfah-14-osf', 'Nabopolassar', '626 BC'], [84, 'cfah-14-osf', 'Fall of Nineveh', '612 BC'], [85, 'cfah-14-osf', 'Demise of Ashur-Uballit II', '609/608 BC'],
  [86, 'cfah-14-osf', 'Death of Sargon II', '705 BC'], [87, 'cfah-14-osf', 'TWICE: accession of Sargon II / fall of Samaria (722 BC) and Shamshi-Adad IV (1053 BC)', '722 BC; 1053 BC'],
  [88, 'cfah-14-osf', 'Shamshi Adad I', '1841 BC'], [89, 'cfah-14-osf', 'Erishum I', '2000 BC'], [90, 'cfah-14-osf', 'Ilušuma founds the temple of Ishtar in Assur', '2031 BC'], [91, 'cfah-14-osf', 'Ushpia founds the city of Assur', '~2139 BC'],
  [92, 'cfah-15-osf', 'Sargon of Akkad begins his reign over Akkad', '1619 BC'], [93, 'cfah-15-osf', 'Death of Hammurabi', '989 BC'], [94, 'cfah-17-osf', 'Revised accession of Yu', '2192/2191 BC'],
  [95, null, null, null], [96, null, null, null], [97, null, null, null], [98, null, null, null],
  [99, 'cfah-17-osf', 'Death of Krishna', '1450 BC'], [100, 'cfah-17-osf', 'Mahabharata War', '1487-1451 BC'], [101, 'cfah-17-osf', 'Famine of Śantanu', '1708-1701 BC'], [102, 'cfah-17-osf', 'Famine of Samvarana', '2001 to 1994 BC'],
  [103, 'cfah-18-osf', 'Partholón\'s discovery of Ireland', '2035 BC'], [104, 'cfah-18-osf', 'Nemed colonizes Ireland', '1725 BC'], [105, 'cfah-18-osf', 'Battle of Conaing Tower', '1304 BC'], [106, 'cfah-18-osf', 'Milesian conquest of Ireland', '1043 BC'],
  [107, 'cfah-19-osf', 'Flood of Ogyges', '1699 BC'], [108, 'cfah-19-osf', 'Reign of Cecrops', '1495 to 1445 BC'], [109, 'cfah-19-osf', 'Exodus (Fire of Phaethon, Flood of Deucalion II)', '1491 BC'],
  [110, 'cfah-19-osf', 'Joshua\'s conquest: the 1450 BC high-water event (CFAH-17: "Joshua\'s Long Day")', '1450 BC'],
];
export const OSF_NONE_REASON = 'Number not found in any of the 21 OSF components\' PDFs (text search for "AP-N", "AP N", "Anchor Point #N" across all 20 extracted PDFs). The numbering has gaps; perhaps reserved for papers not yet posted.';

// CFAH-1 (ARJ 15, 2022), section "Our Assumptions (Declared Biases)", Table 1 "Biblically derived dates from Ussher and Jones".
// [year as printed, event as printed]
export const TABLE1_ROWS = [
  ['4004', 'Creation of Mankind'], ['2348', 'Flood of Noah'], ['2247', 'Territorial Division of the Earth'], ['1998', 'Death of Noah'], ['1996', 'Birth of Abraham'],
  ['1921', 'Abraham Enters Canaan and Egypt'], ['1897', 'Covenant of Circumcision'], ['1891', 'Weaning of Isaac, rejection of Ishmael'], ['1715', 'Joseph Raised to Vizier'],
  ['1706', 'Jacob enters Egypt in second year of famine'], ['1491', 'Exodus'], ['1450', 'Crossing the Jordan (differs by 1 year from Jones)'], ['1444/1443', 'Division of the Land, first Sabbatical and Jubilee'],
  ['1251', 'Gideon defeats Oreb and Zeeb of Midian and Amalek'], ['1012', 'Solomon Dedicates the Temple'], ['976', 'Solomon’s Death'], ['721 or 720', 'Fall of Samaria, see Gertoux (2015, 1–34)'],
  ['606', 'First year of Captivity of Daniel'], ['597', 'Captivity of Jehoiachin and Ezekiel'], ['586', 'Destruction of Solomon’s Temple'], ['536', 'Cyrus Decree of Return'], ['516', 'Dedication of the Second Temple by Ezra'],
];
