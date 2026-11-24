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
};

export const PASS20_EVENTS = new Set([
  "artaxerxes-decree",
  "esther-made-queen",
  "peloponnesian-war",
]);
