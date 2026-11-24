// Book III, Part I, Chapters VII–XII, and Book IV, Part I, Chapter I through
// Chapter II, §. X (pass 20). Attached by hand. The automatic engine is not
// run on these chapters. Most capitals are places.
//
// Each entry is `id` or `id=Surface`. A surface that is already the title or
// a stored form of another record is not added as a spelling. The passage is
// still attached. A tribe is on its patriarch. Groups are not split.
// A gap (〈◊ 〉) is not filled. God, Lord, Deus, Deo, Dei, and the Angell are
// not people. Hercules is not attached. Mars is not attached.
// Cyrus the younger is not cyrus-the-great. Artaxerxes in the war of Cyrus
// the younger is artaxerxes-mnemon. Artaxerxes Longimanus is only where the
// passage gives that name, or equates the husband of Hester with him.
// Book IV Chapter II stops at the close of section n="10", the printed §. X.
// Clearchus of the Ten Thousand is not the stored Peripatetick clearchus.
// Philip father of Alexander is philip-ii-of-macedon, not the table king philip.
// Pausanias the general is pausanias-of-sparta, not the writer pausanias.
// Leotychides is leutychides. Cimon is cymon.

/** Book IV chapters attached only from this table. */
export const B4_CHAPTERS = new Set(['1', '2']);

export const PASS20 = {
  // Chapter VII. Of things that passed in Greece from the end of the Persian
  // Warre, to the beginning of the Peloponnesian. p03674–p03706.
  p03674: [],
  p03675: [],
  p03676: ["leutychides=Leotychides", "ion=Iones", "xerxes=Xerxes"],
  p03677: ["themistocles=Themistocles", "aristides=Aristides", "xerxes=Xerxes"],
  p03678: [],
  p03679: [],
  p03680: [],
  p03681: ["pausanias-of-sparta=Pausanias", "xerxes=Xerxes", "docres=Docres", "aristides=Aristides"],
  p03682: ["cymon=Cimon", "miltiades=Miltiades"],
  p03683: ["cymon=Cimon"],
  p03684: ["alexander-the-great=Alexander"],
  p03685: ["xerxes=XERXES", "artabanus=ARTABANVS"],
  p03686: ["artabanus=Artabanus", "xerxes=Xerxes", "mithridates-the-eunuch=Mithridates", "darius-son-of-xerxes=Darius", "artaxerxes-longimanus=Artaxerxes"],
  p03687: ["themistocles=THEMISTOCLES", "artaxerxes-longimanus=ARTAXERXES"],
  p03688: ["artaxerxes-longimanus=ARTAXERXES"],
  p03689: ["themistocles"],
  p03690: ["pausanias-of-sparta=Pausanias", "xerxes=Xerxes", "themistocles=Themistocles", "artaxerxes-longimanus=Artaxerxes", "inarus=Inarus"],
  p03691: ["themistocles=Themistocles", "artaxerxes-longimanus=Artaxerxes"],
  p03692: [],
  p03693: ["artaxerxes-longimanus=Artaxerxes", "cymon=Cimon"],
  p03694: ["inarus=Inarus", "cambyses=Cambyses", "xerxes=Xerxes", "achemenes-son-of-darius=Achaemenes", "artaxerxes-longimanus=Artaxerxes", "megabazus=Megabazus", "zopyrus=Zopyrus", "megabazus-son-of-zopyrus=Megabazus", "amyrteus=Amyrteus"],
  p03695: [],
  p03696: [],
  p03697: ["myronides=Myronides", "orestes-of-thessaly=Orestes", "cymon=Cimon", "amyrteus=Amyrteus", "cymon=Cymon"],
  p03698: ["artaxerxes-longimanus=ARTAXERXES LONGIMANVS", "artaxerxes-longimanus=AHASHVEROSH", "hester=HESTER"],
  p03699: ["artaxerxes-longimanus=Artaxerxes", "esdras=Esdras", "nehemiah=Nehemias"],
  p03700: ["artaxerxes-longimanus", "artaxerxes-decree"],
  p03701: ["artaxerxes-longimanus=Ahashuerosh", "hester=Hester", "darius-hystaspis=Darius", "cyrus-the-great=Cyrus", "cambyses=Cambyses", "esther-made-queen"],
  p03702: ["darius-hystaspis=Darius", "atossa=Atossa", "cyrus-the-great=Cyrus", "xerxes=Xerxes", "hester=Hester", "philo=Philo", "mardochaeus=Mardochaeus", "jehoiakim-high-priest=Ioiachim", "jeshua-high-priest=Iesua", "jehoiakim-high-priest=Iotachim", "artaxerxes-longimanus=Artaxerxes", "esdras=Esdras", "nehemiah=Nehemias"],
  p03703: ["xerxes=Xerxes", "hester=Hester", "artaxerxes-longimanus=Ahasuerus", "artaxerxes-longimanus=Artasastha", "nehemiah=Nehemias", "artaxerxes-longimanus=Artaxerxes Longimanus", "artaxerxes-longimanus=Ahashuerosh", "mardochaeus=Mardochaeus", "jehoiachin=Iechonia", "nebuchadnezzar-ii=Nebuchadnezzar"],
  p03704: ["artaxerxes-longimanus=Artaxerxes", "jehoiakim-high-priest=Ioiakim", "hester=Hester", "krentzhemius=Krentzhemius", "josephus=Iosephus", "philo=Philo", "mardochaeus=Mardochaeus", "isaac=Isaac", "esther-made-queen"],
  p03705: [],
  p03706: ["pericles=Pericles", "plistoanax=Plistoanax", "pausanias-of-sparta=Pausanias", "xerxes=Xerxes", "peloponnesian-war"],

  // Chapter VIII. Of the Peloponnesian Warre. p03707–p03769.
  p03707: ["peloponnesian-war"],
  p03708: [],
  p03709: ["philip-ii-of-macedon=Philip of Macedon", "alexander-the-great=Alexander"],
  p03710: [],
  p03711: ["xerxes=Xerxes"],
  p03712: [],
  p03713: [],
  p03714: [],
  p03715: [],
  p03716: [],
  p03717: ["peloponnesian-war"],
  p03718: [],
  p03719: [],
  p03720: [],
  p03721: [],
  p03722: [],
  p03723: ["cleon=Cleon", "brasidas=Brasidas"],
  p03724: [],
  p03725: [],
  p03726: [],
  p03727: [],
  p03728: [],
  p03729: [],
  p03730: [],
  p03731: ["alcibiades=Alcibiades"],
  p03732: ["alcibiades=Alcibiades"],
  p03733: ["alcibiades=Alcibiades", "nicias=Nicias"],
  p03734: ["alcibiades=Alcibiades"],
  p03735: ["nicias=Nicias"],
  p03736: [],
  p03737: [],
  p03738: [],
  p03739: [],
  p03740: [],
  p03741: [],
  p03742: [],
  p03743: ["alcibiades=Alcibiades"],
  p03744: [],
  p03745: ["alcibiades=Alcibiades"],
  p03746: [],
  p03747: ["pallas=Pallas"],
  p03748: ["sophocles-the-generall=Sophocles", "pthiodorus=Pthiodorus", "nicias=Nicias"],
  p03749: ["nicias=Nicias", "cassius=C. Cassius", "julius-caesar=Iulius Caesar", "crassus=Crassus"],
  p03750: [],
  p03751: [],
  p03752: ["lysander=Lysander", "alcibiades=Alcibiades", "tissaphernes=Tissaphernes", "agis-king-of-sparta=Agis"],
  p03753: ["alcibiades=ALCIBIADES"],
  p03754: ["alcibiades=Alcibiades", "mindarus=Mindarus", "mindarus=MINDARVS"],
  p03755: ["alcibiades=Alcibiades"],
  p03756: ["alcibiades=Alcibiades"],
  p03757: ["alcibiades=Alcibiades", "lysander=Lysander"],
  p03758: [],
  p03759: ["callicraditas=Callicraditas", "socrates=Socrates"],
  p03760: ["peloponnesian-war"],
  p03761: ["lysander=Lysander"],
  p03762: ["alcibiades=Alcibiades"],
  p03763: ["lysander=Lysander"],
  p03764: ["lysander=Lysander"],
  p03765: [],
  p03766: ["lysander=Lysander", "agis-king-of-sparta=Agis", "pausanias-king-of-sparta=Pausanias"],
  p03767: [],
  p03768: ["alcibiades=Alcibiades"],
  p03769: ["peloponnesian-war", "epaminondas=Epaminondas", "philip-ii-of-macedon=Philip of Macedon", "alexander-the-great=Alexander the Great", "philip-ii-of-macedon=Philip", "alexander-the-great=Alexander"],
};

export const PASS20_NEW = {
  docres: ["Docres", "Docres, whom the Lacedaemonians imployed in Pausanias his stead after he was called backe from Bizantium. The printed spelling is kept.", "him"],
  "mithridates-the-eunuch": ["Mithridates the Eunuch", "Mithridates, an Eunuch, by whom Artabanus executed the treason against Xerxes. He is not Mithridates, who compiled an Ephemerides of his Concubines dreames, and not Mithridates in the Epistle of Esdras. The one-word title would fold onto mithridates, so the title is three words.", "him"],
  megabazus: ["Megabazus", "Megabazus, whom Artaxerxes sent to Sparta with much Treasure, to set the Lacedaemonians vpon Athens. He is not the Megabazus sonne of Zopyrus, whom the same paragraph calls another of his name.", "him"],
  zopyrus: ["Zopyrus", "Zopyrus, named as the father of the Megabazus who arriued in Aegypt and recouered the Countrey. The printed spelling is kept.", "him"],
  "megabazus-son-of-zopyrus": ["Megabazus son of Zopyrus", "Megabazus, another of the name, the sonne of Zopyrus, who arriued in Aegypt, chased the Athenians from Memphis, and recouered the Countrey. He is not the Megabazus sent to Sparta with Treasure. The one-word title would fold onto that Megabazus, so the title is four words.", "him"],
  amyrteus: ["Amyrteus", "Amyrteus, who held part of Aegypt from the Persian, and later the Marish and Wooddie parts, one of the race of their former Kings. He is not Psammenitus, on whom Amyrtoeus was stored, and not the Cory Amyrteos. The printed spelling is kept.", "him"],
  myronides: ["Myronides", "Myronides, vnder whose conduct the Athenians entred Boeotia about threescore daies after Tanagra. The printed spelling is kept.", "him"],
  "orestes-of-thessaly": ["Orestes of Thessaly", "Orestes, who perswaded the Athenians to attempt Thessalie, and whom King Pharsalus had chased out of his Dominions. He is not Orestes of Mycenae in the chronological table. The one-word title would fold onto that record, so the title is three words.", "him"],
  plistoanax: ["Plistoanax", "Plistoanax, the sonne of Pausanias, who led the Peloponnesians into Attica before Pericles recouered Euboea. The printed spelling is kept.", "him"],
  alcibiades: ["Alcibiades", "Alcibiades, a powerfull yong Gentleman in Athens, Author of the Sicilian voyage, who was banished, fled to Sparta and to Tissaphernes, was recalled, made Generall, deposed, and finally slaine after the fall of Athens. The printed spelling is kept.", "him"],
  nicias: ["Nicias", "Nicias, an honourable Citizen of Athens, a friend to the peace, who had the chiefe command in the vnhappie enterprise against Syracuse. The printed spelling is kept.", "him"],
  cleon: ["Cleon", "Cleon, Generall of the Athenian forces, slaine in the battaile at Amphipolis, who with Brasidas had most beene aduersaries to the peace. The printed spelling is kept.", "him"],
  brasidas: ["Brasidas", "Brasidas, Generall of the Lacedaemonian forces, slaine in the battaile at Amphipolis, who with Cleon had most beene aduersaries to the peace. The printed spelling is kept.", "him"],
  "sophocles-the-generall": ["Sophocles the Generall", "Sophocles, one of the Generalls formerly sent into Sicil, condemned into exile with Pthiodorus. He is not the Sophocles already on record. The one-word title would fold onto that record, so the title is three words.", "him"],
  pthiodorus: ["Pthiodorus", "Pthiodorus, one of the Generalls formerly sent into Sicil, condemned into exile with Sophocles. The printed spelling is kept.", "him"],
  tissaphernes: ["Tissaphernes", "Tissaphernes, Lieutenant of the Persian King, whom Alcibiades bewitched, and who made the supplies promised to the Peloponnesians vnprofitable. The printed spelling is kept.", "him"],
  "agis-king-of-sparta": ["Agis king of Sparta", "Agis, one of the Kings of Sparta in the Peloponnesian Warre, whose wife called her yong child by Alcibiades his name, and who with Pausanias summoned Athens after Aegos-Potamos. He is not Agis, the second of the Heraclidae. The one-word title would fold onto that record, so the title is four words.", "him"],
  mindarus: ["Mindarus", "Mindarus, who commanded the fleet of the Lacedaemonians, slaine when Alcibiades destroyed it. The printed spelling is kept.", "him"],
  callicraditas: ["Callicraditas", "Callicraditas, Admirall of the Lacedaemonians, who lost the honour of the day at Arginusae, and died valiantly in the fight. The printed spelling is kept.", "him"],
  "pausanias-king-of-sparta": ["Pausanias king of Sparta", "Pausanias, King of Sparta with Agis, who summoned Athens after Lysander his victorie at Aegos-Potamos. He is not Pausanias the writer, and not Pausanias of Sparta who fought at Plataea. The one-word title would fold onto those records, so the title is four words.", "him"],
};

export const PASS20_EVENTS = new Set([
  "artaxerxes-decree",
  "esther-made-queen",
  "peloponnesian-war",
]);
