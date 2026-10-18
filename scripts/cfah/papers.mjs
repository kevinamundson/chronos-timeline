// CFAH paper metadata used by the CFAH importer (scripts/cfah/import.mjs).
// Published papers: Answers Research Journal (ARJ). OSF items are preprints (not peer-reviewed in ARJ).
export const ARJ = {
  1: { title: 'Problem, Data, and Methodology', vol: 'ARJ 15 (2022): 377–390', url: 'https://answersresearchjournal.org/ancient-egypt/chronological-framework-ancient-history-1/' },
  2: { title: 'Founding of the Nations', vol: 'ARJ 15 (2022): 405–426', url: 'https://answersresearchjournal.org/tower-of-babel/chronological-framework-ancient-history-2/' },
  3: { title: 'Anchor Points of Ancient History', vol: 'ARJ 16 (2023): 131–154', url: 'https://answersresearchjournal.org/ancient-egypt/chronological-framework-ancient-history-3/' },
  4: { title: 'Dating Creation and the Deluge', vol: 'ARJ 16 (2023): 475–489', url: 'https://answersresearchjournal.org/noahs-flood/chronological-framework-ancient-history-4/' },
  5: { title: 'The Babylonian Dynasties of Berossus', vol: 'ARJ 16 (2023): 635–670', url: 'https://answersresearchjournal.org/archaeology/chronological-framework-ancient-history-5/' },
  6: { title: 'The Old and Middle Kingdoms of Egypt', vol: 'ARJ 18 (2025): 13–60', url: 'https://answersresearchjournal.org/chronology/chronological-framework-ancient-history-6/' },
};
export const arjCitation = (n, where) => `Griffith & White, "Chronological Framework of Ancient History. ${n}: ${ARJ[n].title}," ${ARJ[n].vol}, ${where}`;

// OSF preprints (project https://osf.io/prhfz). version/date as listed by the OSF API (docs/cfah-osf-collation.md).
export const OSF = {
  'cfah-7a-osf': { fileId: '6849a3c092828d2af185b2a4', n: '7A', title: 'A Chronological Baseline for Dynasty 12', node: 'gmx5j', ver: 'of 11 Jun 2025 (no version number)', file: 'CFAH-7A Chronological Baseline for Dynasty 12.pdf' },
  'cfah-7b-osf': { fileId: '698b7472bd36e2a67ce24bf6', n: '7B', title: 'Kings of Dynasties 1-13', node: 'tuwnc', ver: 'v1.3 (10 Feb 2026)', file: 'CFAH 7-B Kings of Dynasties 1-13_v_1.3.pdf' },
  'cfah-8-osf': { fileId: '69f182006f8704d0892e55f0', n: '8', title: 'Placing Dynasties 15-18', node: 'z5rtd', ver: 'v1.2 (29 Apr 2026)', file: 'CFAH-8_v1.2.pdf' },
  'cfah-9-osf': { fileId: '68d5792ddd1e49e0cbe8cd4d', n: '9', title: 'The 19th and 26th Dynasties of Egypt', node: 'hv3b2', ver: 'v1.4 (25 Sep 2025)', file: 'CFAH-9_Dynasties_19_and_26_v1.4.pdf' },
  'cfah-10-osf': { fileId: '694ecff9e28081f64d2ce4e2', n: '10', title: 'The Libyan-Cushite Intermediate Period', node: 'fg4dv', ver: 'v1.4 (26 Dec 2025)', file: 'CFAH-10 The Libyan-Cushite Intermediate Period_v1.4.pdf' },
  'cfah-11-osf': { fileId: '691b7af0da99a0f32c76fc0a', n: '11', title: 'Dynasties 20 and 21', node: 'ksaz9', ver: 'v1.3 (17 Nov 2025)', file: 'CFAH-11_v1.3.pdf' },
  'cfah-13-osf': { fileId: '697303b9a84562ecbf573dac', n: '13', title: 'The Hittites, Cimmerians, and Medes', node: 'bcwg2', ver: 'v1.3 (2026)', file: 'CFAH-13_Hittites_Cimmerians_Medes_v1.3.pdf' },
  'cfah-14-osf': { fileId: '69a1ef3aa73fb910953528ef', n: '14', title: 'Ancient Assyria', node: '9fuw2', ver: 'v1.0 (27 Feb 2026)', file: 'CFAH-14_Assyria_v_1.0.pdf' },
  'cfah-15-osf': { fileId: '69cec06bd10b9edd3cc1dcc4', n: '15', title: 'Sumer, Akkad, and Babylon', node: 'vynju', ver: 'v1.4 (2026)', file: 'CFAH-15 Sumer, Akkad, and Babylon_v1.4.pdf' },
  'cfah-16-osf': { fileId: '69fa290abebad33f4fb652e1', n: '16', title: 'The Kings of Israel and Judah', node: 'yv29c', ver: 'v1.3 (5 May 2026)', file: 'CFAH-16_ The Kings of Israel and Judah_v1.3.pdf' },
  'cfah-17-osf': { fileId: '6a6e7bed0dd9e3bb2d4b9013', n: '17', title: 'The Ancient Chronologies of India and China', node: 'j4nxu', ver: 'v1.2 (1 Aug 2026)', file: 'CFAH-17_ India & China_v1.2.pdf' },
  'cfah-18-osf': { fileId: '6a8352abe42635051dedda69', n: '18', title: 'The Ancient Chronology of Ireland', node: '28p43', ver: 'v1.4 (17 Aug 2026)', file: 'cfah-18_v1.4.pdf' },
  'cfah-19-osf': { fileId: '6a4e6244abd79cc9ba3b3049', n: '19', title: 'The Historical Ice Age', node: 'a5g6x', ver: 'v1.0 (8 Jul 2026)', file: 'CFAH-19_Historical_Ice_Age_v1.0.pdf' },
};
export const osfUrl = (id) => `https://osf.io/${OSF[id].node}/`;
export const osfCitation = (id, where) => `Griffith & White, "CFAH-${OSF[id].n}: ${OSF[id].title}," OSF preprint ${OSF[id].ver}, doi:10.17605/OSF.IO/${OSF[id].node.toUpperCase()}, file ${OSF[id].file}, ${where}`;
