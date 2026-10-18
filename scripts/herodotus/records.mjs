// Records the Herodotus import creates or extends. Applied idempotently by scripts/herodotus/import.mjs.
// - cfahAnchors: CFAH anchor points (CFAH-3 AP-7, AP-12, AP-13; CFAH-5 AP-32; CFAH-3 AP-8) that Herodotus's figures are
//   checked against. Text quoted from the ARJ papers; nothing converted by us.
// - events: new events. Every one is sorted by a CFAH anchor (tier 1) or "derived" from one; none is sorted by Herodotus.
// - people: new people (sort tier "none": no tier gives a birth year). Herodotus's reign lengths go in dates.reign.
// - locations: OpenBible.info identifications (pages fetched 2026-10-18; CC BY 4.0).
const C3 = { cite: 'Griffith & White, "Chronological Framework of Ancient History. 3: Anchor Points of Ancient History," ARJ 16 (2023): 131–154', link: 'https://answersresearchjournal.org/ancient-egypt/chronological-framework-ancient-history-3/', id: 'cfah-3' };
const C5 = { cite: 'Griffith & White, "Chronological Framework of Ancient History. 5: The Babylonian Dynasties of Berossus," ARJ 16 (2023): 635–670', link: 'https://answersresearchjournal.org/archaeology/chronological-framework-ancient-history-5/', id: 'cfah-5' };
const cf = (P, section, date, y, yEnd, note) => ({ source: 'cfah', date, year_am: null, year_bc_ad: y, ...(yEnd != null ? { year_bc_ad_end: yEnd } : {}), precision: yEnd != null ? 'year-range' : 'year', citation: `${P.cite}, section "${section}"`, link: P.link, note, source_text_id: P.id, cfah_basis: 'anchor_point' });

// record id -> CFAH anchor entry (replaces the "pending CFAH reference" placeholder)
export const cfahAnchors = {
  'era-of-cyrus': cf(C3, 'AP-7: Era of Cyrus (Persian Empire): 560/559 B.C.', '560/559 BC', -560, -559, 'CFAH-3: "The Persian Empire ended in 330 B.C., thus 230 years yields 560/559 B.C. for the beginning of the Persian power." CFAH-5 (AP-32) adds that Herodotus appears to have counted his Median reigns to "the accession of Cyrus as coregent with his father in 560 B.C."'),
  'cambyses-conquers-egypt': cf(C3, 'AP-8: Battle of Pelusium: 525 B.C.—Persian Conquest of Egypt', '525 BC', -525, null, 'CFAH-3: "The conquest of Egypt at the Battle of Pelusium in May of 525 B.C. occurred in the fifth year of Cambyses’ reign. Subtracting five and thirty years from the Era of Cyrus in 560 B.C. yields 525 B.C." (CFAH counts Cyrus 30 years; Herodotus 1.214 gives 29.)'),
  'first-olympic-games': cf(C3, 'AP-10: Era of the Olympiad: 776/775 B.C.', '776/775 BC', -776, -775, 'CFAH-3: "These two durations confirm 776/775 B.C. for the first Olympiad, 525 B.C. for the Battle of Pelusium, and 560/559 B.C. for Cyrus, synchronizing the chronologies of Egypt, Greece, and Persia." Censorinus\'s eras: "1st Olympiad: 1,014 years [yields 776 B.C.]". AP-12 and AP-13 count from this era.'),
  'fall-of-troy': cf(C3, 'AP-12: The Fall of Troy: 1184/1183 B.C.', '1184/1183 BC', -1184, -1183, 'CFAH-3: "Four hundred and eight years added to 776/775 B.C. yields 1184/1183 B.C. for the fall of Troy." Eratosthenes is taken as the most reliable witness.'),
  'xerxes-invades-greece': cf(C3, 'AP-13: Xerxes’ Invasion of Greece: 480 B.C.', '480 BC', -480, null, 'CFAH-3: 296 years after the First Olympiad (776 B.C.) gives "480 B.C. Xerxes invades Greece"; 704 years after the Fall of Troy (1183 B.C.) gives 479 B.C. "The Second Persian Invasion of Greece ended in June 479 B.C., about 15 months after it began."'),
  'median-kingdom-under-deioces': cf(C5, 'AP-32: Deioces the Mede: 710/709 B.C.', '710/709 BC', -710, -709, 'CFAH-5 derives the date from Herodotus: 1232 B.C. (Semiramis II) minus Herodotus\'s 520 years (I.95) gives "712 B.C. ±5 years for the accession of Deioces"; counting Herodotus\'s Median reigns (I.102–130) back from 560 B.C. gives "710 B.C. ±2 years". "The best fit for all this information is Deioces starting to reign between 711 and 708 B.C."'),
};

const ev = (title, summary, extra = {}) => ({ title, summary, ...extra });
export const events = {
  'era-of-cyrus': ev('Era of Cyrus: Persian power begins', 'CFAH AP-7: the beginning of the Persian power under Cyrus II (560/559 BC); in Herodotus, Astyages loses the Median crown to Cyrus after 35 years (1.130).', { people: ['cyrus-the-great', 'astyages'], related: ['cyrus-founds-medo-persian-empire', 'median-kingdom-under-deioces'] }),
  'fall-of-troy': ev('Fall of Troy', 'CFAH AP-12: the destruction of Troy (1184/1183 BC), the end of the Trojan War.', { related: ['trojan-war', 'homer-iliad-odyssey'] }),
  'xerxes-invades-greece': ev('Xerxes invades Greece', 'CFAH AP-13: the second Persian invasion of Greece under Xerxes (480 BC), told in Herodotus Books 7–9.', { people: ['xerxes-i'], related: ['battle-of-thermopylae', 'battle-of-salamis', 'battle-of-plataea', 'reign-of-xerxes-i'] }),
  'battle-of-salamis': ev('Battle of Salamis', 'The Greek fleet defeats Xerxes\' navy at Salamis in the same campaign season as Thermopylae (Herodotus 8.40–96).', { people: ['xerxes-i'], related: ['xerxes-invades-greece', 'battle-of-thermopylae'], derived_from: 'xerxes-invades-greece', derived_note: 'Sort year copied from Xerxes invades Greece (CFAH AP-13, 480 BC). Herodotus puts the Persian entry into Attica four months after the crossing of the Hellespont, "in the archonship of Calliades" (8.51), and Salamis follows within days (8.56–96), so the battle falls in the invasion\'s first campaign season. Herodotus gives no year number.' }),
};

const p = (title, summary, extra = {}) => ({ title, summary, ...extra });
export const people = {
  gyges: p('Gyges', 'King of Lydia, first of the Mermnadae; in Herodotus he kills Candaules and takes the throne (1.8–14).', { related: ['ardys'], children: ['ardys'] }),
  ardys: p('Ardys', 'King of Lydia, son of Gyges; the Cimmerians took Sardis in his reign (Herodotus 1.15).', { father: 'gyges', children: ['sadyattes'] }),
  sadyattes: p('Sadyattes', 'King of Lydia, son of Ardys (Herodotus 1.15–18).', { father: 'ardys', children: ['alyattes'] }),
  alyattes: p('Alyattes', 'King of Lydia, son of Sadyattes, father of Croesus; fought Cyaxares the Mede (Herodotus 1.16–25, 1.74).', { father: 'sadyattes', children: ['croesus'], related: ['cyaxares'] }),
  croesus: p('Croesus', 'Last king of Lydia; Sardis fell to Cyrus after his 14-year reign (Herodotus 1.6–91).', { father: 'alyattes', related: ['cyrus-the-great', 'astyages'] }),
  deioces: p('Deioces', 'First king of the Medes in Herodotus (1.96–102); CFAH-5 AP-32 dates him 710/709 BC.', { children: ['phraortes'], events: ['median-kingdom-under-deioces'] }),
  phraortes: p('Phraortes', 'King of the Medes, son of Deioces (Herodotus 1.102).', { father: 'deioces', children: ['cyaxares'] }),
  cyaxares: p('Cyaxares', 'King of the Medes, son of Phraortes; fought the Lydians, took Nineveh (Herodotus 1.73–74, 1.103–106).', { father: 'phraortes', children: ['astyages'], related: ['alyattes'] }),
  astyages: p('Astyages', 'Last king of the Medes, son of Cyaxares, deposed by Cyrus (Herodotus 1.107–130).', { father: 'cyaxares', related: ['cyrus-the-great'] }),
  'cambyses-ii': p('Cambyses II', 'King of Persia, son of Cyrus; conquered Egypt (Herodotus 3.1–66).', { related: ['cyrus-the-great'] }),
  'darius-i': p('Darius I', 'King of Persia, son of Hystaspes (Herodotus 3.88 – 7.4).', { children: ['xerxes-i'] }),
  'xerxes-i': p('Xerxes I', 'King of Persia, son of Darius; invaded Greece (Herodotus 7.2 – 9.121).', { father: 'darius-i' }),
  'psammetichus-i': p('Psammetichus I', 'King of Egypt (Saite line); Herodotus says Greek knowledge of Egyptian history is accurate from his reign onward (2.151–157).', { children: ['necho-ii'] }),
  'necho-ii': p('Necho II', 'King of Egypt, son of Psammetichus (Herodotus "Necos", 2.158–159, 4.42); the Pharaoh-nechoh of 2 Kings 23 and Jeremiah 46.', { father: 'psammetichus-i', children: ['psammis'], refs: ['2Kgs.23.29', 'Jer.46.2'], events: ['battle-of-carchemish'] }),
  psammis: p('Psammis', 'King of Egypt, son of Necho (Herodotus 2.159–161).', { father: 'necho-ii', children: ['apries'] }),
  apries: p('Apries', 'King of Egypt, son of Psammis, overthrown by Amasis (Herodotus 2.161–169); the Pharaoh-hophra of Jeremiah 44:30.', { father: 'psammis', refs: ['Jer.44.30'] }),
  'amasis-ii': p('Amasis II', 'King of Egypt after Apries; died before Cambyses invaded (Herodotus 2.172–182, 3.1–10).', { children: ['psammenitus'] }),
  psammenitus: p('Psammenitus', 'King of Egypt for six months, son of Amasis, defeated by Cambyses (Herodotus 3.10–15).', { father: 'amasis-ii', events: ['cambyses-conquers-egypt'] }),
  sabacos: p('Sabacos', 'Ethiopian king who in Herodotus ruled Egypt for fifty years (2.137–139); Shabaka of the Kushite line.', { events: ['kushite-conquest-of-egypt'] }),
  cheops: p('Cheops', 'Egyptian king who in Herodotus closed the temples and built the Great Pyramid (2.124–127); Khufu.', { alt: ['Khufu'], related: ['chephren', 'mycerinus'], events: ['great-pyramid-of-giza'] }),
  chephren: p('Chephren', 'Egyptian king, brother and successor of Cheops in Herodotus (2.127); Khafre.', { alt: ['Khafre'], related: ['cheops'] }),
  mycerinus: p('Mycerinus', 'Egyptian king, son of Cheops in Herodotus, who reopened the temples (2.129–134); Menkaure.', { alt: ['Menkaure'], father: 'cheops' }),
};
// events that gain people links from this import (existing records)
export const eventPeople = {
  'median-kingdom-under-deioces': ['deioces'], 'reign-of-cyaxares': ['cyaxares'], 'fall-of-nineveh': ['cyaxares'],
  'cyrus-founds-medo-persian-empire': ['astyages'],   'reign-of-darius-i': ['darius-i'], 'battle-of-marathon': ['darius-i'], 'reign-of-xerxes-i': ['xerxes-i'], 'battle-of-thermopylae': ['xerxes-i'],
  'battle-of-carchemish': ['necho-ii'], 'thales-predicts-eclipse': ['alyattes', 'cyaxares'], 'cambyses-conquers-egypt': ['cambyses-ii', 'psammenitus', 'amasis-ii'], 'kushite-conquest-of-egypt': ['sabacos'], 'great-pyramid-of-giza': ['cheops'],
};
export const eventLocations = {
  'median-kingdom-under-deioces': ['ecbatana'], 'cambyses-conquers-egypt': ['pelusium', 'memphis'], 'era-of-cyrus': [], 'battle-of-salamis': [],
};

const loc = (title, summary, ob, lat, lng, basis, refs, wikidata, related) => ({ title, summary, ob, lat, lng, basis, refs, wikidata, related });
export const locations = {
  sardis: loc('Sardis', 'Capital of Lydia, taken by Cyrus from Croesus (Herodotus 1.84–86); one of the seven churches of Revelation.', ['aab4a5f', 'sardis'], 38.488333, 28.040278, 'Sardis (modern): very high confidence', ['Rev.1.11', 'Rev.3.1', 'Rev.3.4'], 'Q232615', ['croesus', 'gyges', 'alyattes']),
  ecbatana: loc('Ecbatana (Achmetha)', 'Median capital built under Deioces (Herodotus "Agbatana", 1.98); Achmetha of Ezra 6:2.', ['a212ef7', 'ecbatana'], 34.8065, 48.516247, 'Tell Hagmatana (modern): very high confidence', ['Ezra.6.2'], 'Q696193', ['deioces', 'astyages']),
  memphis: loc('Memphis (Noph)', 'Egyptian royal city founded by Min in Herodotus (2.99); taken by Cambyses (3.13).', ['a8ec269', 'memphis'], 29.8488, 31.253, 'Memphis (modern): very high confidence', ['Isa.19.13', 'Jer.2.16', 'Jer.44.1', 'Jer.46.14', 'Jer.46.19', 'Ezek.30.13', 'Ezek.30.16', 'Hos.9.6'], 'Q5715', ['egypt']),
  pelusium: loc('Pelusium (Sin)', 'Fortress at Egypt\'s eastern entrance where Sethos faced Sanacharib (Herodotus 2.141) and Cambyses defeated Psammenitus (3.10–12); Sin of Ezekiel 30:15.', ['aa32a17', 'pelusium'], 31.042512, 32.546139, 'Tell el Farama (modern): very high confidence', ['Ezek.30.15', 'Ezek.30.16'], 'Q1145715', ['egypt']),
  ashdod: loc('Ashdod (Azotus)', 'Philistine city that Psammetichus besieged for 29 years (Herodotus 2.157).', ['a30c937', 'ashdod'], 31.7572, 34.6578, 'Tel Ashdod (modern): very high confidence', ['Josh.11.22', 'Isa.20.1', 'Acts.8.40'], 'Q171639', ['psammetichus-i']),
};
