// Book III, Part I (pass 19).
// Attached by hand, passage by passage. Chapter I is stored first.
// Later chapters of this pass are added in order.
// Most capitals are places. The automatic engine is not run on these chapters.
//
// Each entry is `id` or `id=Surface`. A surface that is already the title or
// a stored form of another record is not added as a spelling. The passage is
// still attached. A tribe is on its patriarch. Groups are not split.
// A gap (〈◊ 〉) is not filled. God, Lord, Deus, Deo, Dei, and the Angell are
// not people. Hercules is not attached. Mars is not attached (N85).
// The kingdoms, the cities, the rivers, and a heading that names only a place
// are not people. Israel the nation is not jacob. Ammon and Moab the nations
// are not attached. Tyre, Tyrus, and Sidon the cities are not people.
// Nilus is the river. Lybia here is the land.
//
// Cyrus in this book, until a later chapter names the younger, is cyrus-the-great.
// Euilmerodach is the Raleigh table king euilmerodach, not the Cory evil-merodach.
// Amasis who followed Apries is amasis-ii. Cambyses who conquered Egypt is the
// table king cambyses, not cambyses-ii. Belochus after Sardanapalus is phul-belochus.
// Darius of the Medes is darius-the-mede. The Darius who warred on Greece after
// him with Xerxes is darius-hystaspis. The Darius whom Alexander conquered is darius-iii.
// Nabonidus stays apart from Balthasar. Belsazer is a spelling on balthasar.
// Niglisar and Labosardach stay apart from Annius his Reg-Assar and Lab-Assar Dach.
// Nitocris of Babylon is not the Egyptian nitocris.

/** Chapters of Book III whose passages are attached only from this table. */
export const B3_CHAPTERS = new Set(['1', '2']);

export const B3 = {
  // Chapter I. The time between the destruction (gap) and the fall of the Assyrian Empire.
  // p03359–p03424. The gap in the chapter heading stays empty.
  p03359: [],
  p03360: [],
  p03361: ["nabu-nasir=Nabonassar", "nebuchadnezzar-ii=Nebuchadnezzar"],
  p03362: ["ninus=Ninus", "sardanapalus=Sardanapalus", "phul-belochus=Belochus", "nebuchadnezzar-ii=Nebuchadnezzar", "iehoiakim=Iehoiakim", "zedekiah=Zedekia", "judah=Iuda", "cyrus-the-great=Cyrus", "iphitus=Iphitus", "augustine=Augustine"],
  p03363: ["cyrus-the-great=Cyrus", "alexander-the-great=Alexander", "nebuchadnezzar-ii=Nebuchadnezzar"],
  p03364: ["porphyrius=PORPHYRIE", "matthew=MATTHEW", "daniel=DANIEL"],
  p03365: ["jehoiachin=Iechonias", "zedekiah=Zedekias", "ezekiel=Ezekiel", "nabuzaradan=Nabuzaradan", "beroaldus=Beroaldus", "nebuchadnezzar-ii=Nabuchodonosor", "iehoiakim=Ioakim", "matthew=Matthew", "daniel=Daniel", "iosias=Iosias", "epiphanius=Epiphanius", "porphyrius=Porphyrie", "antiochus-iv-epiphanes=Antiochus Epiphanes", "apollonius-against-porphyrie=Apollonius", "alexander-the-great=Alexander", "jaddua=Iaddus", "darius-iii=Darius", "fall-of-jerusalem-586-bc"],
  p03366: ["daniel=Daniel", "moses=Moses", "esdras=Esdras", "esdras=Esra", "iouinian-the-emperour=Iouinian", "meliton=Meliton", "eusebius=Eusebius", "origen=Origen", "hilarius=Hilarius", "epiphanius=Epiphanius", "jerome=Hierome", "gregory-nazianzen=Gregorie Nazianzene", "job=Iob", "ruth=Ruth", "hester=Hester", "nehemiah=Nehemiah", "christ=Christ", "mark-the-evangelist=Marke", "john-the-apostle=Iohn", "paul=Paul"],
  p03367: ["jehoiachin=IECHONIA"],
  p03368: ["eusebius=Eusebius", "beroaldus=Beroaldus"],
  p03369: ["manasses=Manasses", "iehoiakim=Iehoiakim", "daniel=Daniel", "jehoiachin=Iechonias", "ezekiel=Ezekiel", "zedekiah=Zedekias", "jeremiah=Ieremie", "judah=Iuda", "daniel-taken-to-babylon", "fall-of-jerusalem-586-bc"],
  p03370: ["jeremiah=Ieremie", "jeremiah=IEREMIA", "jeremiah=IEREMIAH", "iehoiakim=Iehoiakim", "nebuchadnezzar-ii=Nebuchadnezzar", "jehoiachin=Iechonia", "judah=Iuda", "daniel=Daniel", "daniel=DANIEL", "darius-the-mede=Darius the Mede", "josephus=Iosephus", "cyrus-the-great=CYRVS", "fall-of-jerusalem-586-bc", "cyrus-decree-of-return"],
  p03371: [],
  p03372: ["xenophon=Xenophon", "alexander-the-great=Alexander"],
  p03373: ["nebuchadnezzar-ii=Nebuchadnezzar", "judah=Iuda"],
  p03374: [],
  p03375: ["nebuchadnezzar-ii=Nebuchadnezzar", "euilmerodach=Euilmerodach", "balthasar=Balthasar", "daniel=Daniel", "jeremiah=Ieremie"],
  p03376: ["josephus=Iosephus", "nebuchadnezzar-ii=Nabuchodonosor", "euilmerodach=Euilmerodach", "niglisar=Niglisar", "labosardach=Labosardach", "balthasar=Balthasar", "jerome=Hierome", "berosus=Berosus", "nabonidus=Nabonidus", "cyrus-the-great=Cyrus", "xenophon=Xenophon", "eusebius=Eusebius", "seuerus-with-eusebius=Seuerus", "theodoretus=Theodoret", "daniel=Daniel"],
  p03377: ["annius=Annius", "metasthenes=Metasthenes", "nebuchadnezzar-ii=Nabuchodonosor", "euilmerodach=Euilmerodach", "reg-assar=Reg-Assar", "lab-assar-dach=Lab-Assar Dach"],
  p03378: ["annius=Annius", "metasthenes=Metasthenes", "cyrus-the-great=Cyrus", "fall-of-babylon-539-bc"],
  p03379: ["balthasar=Balthasar", "annius=Annius", "metasthenes=Metasthenes", "daniel=Daniel"],
  p03380: ["josephus=Iosephus", "berosus=Berosus", "cyrus-the-great=Cyrus", "nebuchadnezzar-ii=Nebuchadnezzar", "euilmerodach=Euilmerodach", "balthasar=Balthasar"],
  p03381: ["gerardus-mercator=Mercator", "euilmerodach=Euilmerodach", "josephus=Iosephus", "berosus=Berosus", "nebuchadnezzar-ii=Nabuchodonosor", "niglisar=Niglisar", "labosardach=Labassardach", "nabonidus=Labonidus", "balthasar=Balthasar", "cyrus-the-great=Cyrus", "jeremiah=Ieremie"],
  p03382: [],
  p03383: ["gerardus-mercator=Mercator", "joseph-scaliger=Ioseph Scaliger", "joseph-scaliger=Scaliger", "nebuchadnezzar-ii=Nebuchadnezzar", "nebuchadnezzar-ii=Nabuchadnezzar", "euilmerodach=Euilmerodach", "balthasar=Belsazer", "nabonidus=Nabonidus", "cyrus-the-great=Cyrus", "jehoiachin=Iechonia"],
  p03384: ["berosus=Berosus", "jeremiah=Ieremie", "euilmerodach=Euilmerodach", "jehoiachin=Iechonia", "nebuchadnezzar-ii=Nabuchadnezzar", "salathiel=Salathiel", "zerubbabel=Zorobabel"],
  p03385: ["joseph-scaliger=Scaliger", "balthasar=Belsazer", "labosardach=Laborosoardoch", "nebuchadnezzar-ii=Nabuchadnezzar", "berosus=Berosus", "niglisar=Niriglissoroor", "niglisar=Niglisar", "jeremiah=Ieremie"],
  p03386: ["nabonidus=Nabonidas", "nabonidus=Nabonidus", "berosus=Berosus", "balthasar=Balthasar", "darius-the-mede=Darius", "joseph-scaliger=Scaliger", "daniel=Daniel", "megasthenes=Megasthenes", "eusebius=Eusebius", "cyrus-the-great=Cyrus", "nebuchadnezzar-ii=Nabuchodonosor", "belus=Bel", "fall-of-babylon-539-bc"],
  p03387: ["joseph-scaliger=Scaliger", "joseph-scaliger=Ioseph Scaliger", "eusebius=Eusebius", "megasthenes=Megasthenes", "nebuchadnezzar-ii=Nabuchodonosor", "nebuchadnezzar-ii=Nebuchadnezzar", "cyrus-the-great=Cyrus", "apollo=Apollo"],
  p03388: ["joseph-scaliger=Scaliger", "joseph-scaliger=Ioseph Scaliger", "daniel=Daniel", "balthasar=Balthasar", "darius-the-mede=Darius", "nabonidus=Nabonidus", "darius-hystaspis=Darius", "xerxes=Xerxes", "alexander-the-great=Alexander", "cyrus-the-great=Cyrus", "josephus=Iosephus", "berosus=Berosus", "eusebius=Eusebius"],
  p03389: ["nebuchadnezzar-ii=NABVCHODONOSOR"],
  p03390: ["pererius=Pererius", "lyranus=Lyra", "labosardach=Labosardach", "euilmerodach=Euilmerodach", "balthasar=Balthasar", "nebuchadnezzar-ii=Nebuchadnezzar", "fall-of-jerusalem-586-bc"],
  p03391: ["berosus=Berosus"],
  p03392: ["nebuchadnezzar-ii=Nebuchadnezzar", "zedekiah=Zedekia", "jehoiachin=Iechonia", "euilmerodach=Euilmerodach", "judah=Iuda"],
  p03393: ["cyrus-the-great=Cyrus"],
  p03394: ["darius-the-mede=Darius the Mede", "balthasar=Balthasar", "josephus=Iosephus", "berosus=Berosus", "nabonidus=Nabonidus", "daniel=Daniel", "cyrus-the-great=Cyrus", "euilmerodach=Euilmerodach", "nebuchadnezzar-ii=Nebuchadnezzar", "aristotle=Aristotle", "jeremiah=Ieremie"],
  p03395: ["nebuchadnezzar-ii=NABVCHODONOSOR"],
  p03396: ["nebuchadnezzar-ii=Nabuchodonosor", "sidon-son-of-canaan=Sidonians", "fall-of-jerusalem-586-bc"],
  p03397: ["ezekiel=Ezechiel", "nebuchadnezzar-ii=Nabuchodonosor", "fall-of-jerusalem-586-bc"],
  p03398: ["jeremiah=Ieremie", "isaiah=Esay", "nebuchadnezzar-ii=Nabuchodonosor", "nebuchadnezzar-ii=NABVCHODONOSOR", "fall-of-jerusalem-586-bc"],
  p03399: ["nebuchadnezzar-ii=Nabuchodonosor", "esau=Edom", "kedar=Kedar", "esau=Edomites", "baalis=Baalis", "ismael-who-slew-gedaliah=Ismael", "gedaliah=Gedalia", "judah=Iuda", "fall-of-jerusalem-586-bc"],
  p03400: ["nebuchadnezzar-ii=Nebuchadnezzar", "nebuchadnezzar-ii=Nabuchodonosor", "isaiah=Esay", "ezekiel=Ezekiel", "judah=Iuda"],
  p03401: ["nebuchadnezzar-ii=NABVCHODONOSOR", "herodotus=HERODOTVS", "diodorus-siculus=DIODORVS"],
  p03402: ["nebuchadnezzar-ii=Nabuchodonosor", "isaiah=Esay", "jeremiah=Ieremie", "ezekiel=Ezechiel", "herodotus=Herodotus", "diodorus-siculus=Diodorus", "diodorus-siculus=Diodorus Siculus", "apries=Apries", "apries=Hophra", "amasis-ii=Amasis", "asshur=Asshur"],
  p03403: ["ezekiel=Ezekiel", "jeremiah=Ieremie", "nebuchadnezzar-ii=Nebuchadnezzar", "nebuchadnezzar-ii=Nabuchodonosor", "pharaoh=Pharaoh", "pharaoh=PHARAOH", "amasis-ii=Amasis", "apries=Apries", "apries=Hophra", "zedekiah=Zedekia", "herodotus=Herodotus", "junius=Iunius", "josephus=Iosephus", "diodorus-siculus=Diodore"],
  p03404: ["nebuchadnezzar-ii=NABVCHADNEZZAR"],
  p03405: ["nebuchadnezzar-ii=Nabuchodonosor", "nebuchadnezzar-ii=Nebuchadnezzar", "nebuchadnezzar-ii=NEBVCHADNEZZAR", "phut=Phut", "lud=Lud", "pharaoh=Pharaoh", "josephus=Iosephus", "apries=Apries", "amasis-ii=Amasis", "neco=Necho", "pharaoh=Pharao", "ezekiel=Ezekiel", "minor-deportation-nebuchadnezzars-23rd"],
  p03406: ["nebuchadnezzar-ii=NEBVCHADNEZZAR", "fall-of-nineveh"],
  p03407: ["nebuchadnezzar-ii=Nebuchadnezzar", "daniel=Daniel", "iehoiakim=Iehoiakim", "ezekiel=Ezekiel", "daniel-taken-to-babylon", "daniel-interprets-nebuchadnezzars-dream"],
  p03408: ["nebuchadnezzar-ii=Nebuchadnezzar", "nebuchadnezzar-ii=Nabuchodonosor", "nahum=Naum", "nahum=Nahum", "merodach=Merodach", "iehoiakim=Iehoiakim", "zedekiah=Zedekias", "judah=Iuda", "tiberius=Tyberius", "hecuba=Hecuba", "huzzab=Huzzab", "fall-of-nineveh"],
  p03409: ["nebuchadnezzar-ii=NEBVCHADNEZZAR"],
  p03410: ["daniel=Daniel", "josephus=Iosephus", "berosus=Berosus", "megasthenes=Megasthenes"],
  p03411: ["daniel=Daniel", "daniel=DANIEL", "jerome=Hierome", "nebuchadnezzar-ii=Nabuchadnezzar", "daniel-interprets-nebuchadnezzars-dream"],
  p03412: ["solomon=Salomon", "nebuchadnezzar-ii=Nabuchadnezzar"],
  p03413: ["david=Dauid"],
  p03414: ["nebuchadnezzar-ii=Nebuchadnezzar", "nebuchadnezzar-ii=Nabuchodonosor", "jerome=Hierome", "hilarius=Hilarius", "iphigenia=Iphigenia", "agamemnon=Agamemnon", "dorotheus=Dorotheus", "epiphanius=Epiphanius", "jerome=Ierome", "augustine=Augustine", "theodoretus=Theodoret", "lyranus=Lyra", "carthusianus=Carthusianus", "mediana=Mediana", "isaiah=Esay", "isaiah=Isay", "balthasar=Balthasar"],
  p03415: ["euilmerodach=EVILMERODACH"],
  p03416: ["nebuchadnezzar-ii=Nebuchadnezzar", "euilmerodach=Euilmerodach"],
  p03417: ["herodotus=Herodotus", "amasis-ii=Amasis", "diodorus-siculus=Diodorus", "cambyses=Cambyses", "euilmerodach=Euilmerodach", "psammenitus=Psamennitus"],
  p03418: ["euilmerodach=Euilmerodach", "xenophon=Xenophon", "cyrus-the-great=Cyrus", "astyages=Astyages", "nebuchadnezzar-ii=Nabuchodonosor"],
  p03419: ["astyages=Astyages", "euilmerodach=Euilmerodach", "amasis-ii=Amasis"],
  p03420: ["euilmerodach=Euilmerodach", "isaiah=Esay"],
  p03421: ["nebuchadnezzar-ii=Nabuchodonosor"],
  p03422: ["berosus=BEROSVS", "euilmerodach=EVILMERODACH", "balthasar=BALTHASAR"],
  p03423: ["balthasar=Balthasar", "euilmerodach=Euilmerodach", "berosus=Berosus", "niglisar=Niriglissoroor", "niglisar=Niglissar", "labosardach=Labassardach", "herodotus=Herodotus", "nebuchadnezzar-ii=Nebuchadnezzar", "daniel=Daniel", "nitocris-of-babylon=Nitocris", "semiramis=Semiramis", "josephus=Iosephus", "jehoiachin=Iechonia"],
  p03424: ["euilmerodach=Euilmerodach", "balthasar=Balthasar", "balthasar=Balthazar", "cyrus-the-great=Cyrus", "fall-of-babylon-539-bc"],

  // Chapter II. The originall and first greatnesse of the Persians.
  // p03425–p03462. Cyaxares in the king-list before Aslyages is cyaxares.
  // Cyaxares where the passage equates him with Darius Medus is darius-the-mede.
  // The Cyrus and Cambyses of Xerxes his line, and Cyrus the first, and Cambyses
  // the father of Cyrus, stay off cyrus-the-great and off the table king cambyses.
  // Diocles in the Median list is not the Diocles of the siege of Tyre.
  // Atossa who married Pharnaces is not Queene Atossa.
  // The comma in “Theophilus, Antiochenus” was not made a second man.
  p03425: [],
  p03426: ["fall-of-babylon-539-bc"],
  p03427: ["phul-belochus=Belochus", "balthasar=Balthasar", "darius-the-mede=Cyaxares", "darius-the-mede=Darius Medus", "cyrus-the-great=Cyrus", "fall-of-babylon-539-bc"],
  p03428: ["phul-belochus=Phul Belochus", "arbaces=Arbaces", "metasthenes=Metasthenes", "ninus=Ninus", "sardanapalus=Sardanapalus", "darius-the-mede=Cyaxares", "darius-the-mede=Darius Medus", "balthasar=Balthasar", "cyrus-the-great=Cyrus", "achaemenes=Achaemenes"],
  p03429: ["achaemenes=Achaemenes"],
  p03430: ["madai=Madai", "japheth=Iaphet", "lactantius=Lactantius", "diodorus-siculus=Diodorus", "diodorus-siculus=Diodor", "hydaspes=Hydaspes", "pharnus=Pharnus"],
  p03431: ["arbaces=Arbaces", "eusebius=Eusebius", "darius-the-mede=Darius Medus"],
  p03432: ["arbaces=Arbaces", "sosarmus-of-media=Sosarmus", "medidus=Medidus", "cardiceas=Cardiceas", "diocles-of-the-medes=Diocles", "phraortes=Phraortes", "cyaxares=Cyaxares", "astyages=Aslyages", "darius-the-mede=Darius Medus"],
  p03433: ["cyrus-the-great=Cyrus", "darius-the-mede=Darius", "balthasar=Balthazar", "daniel=Daniel", "isaiah=Isay", "jeremiah=IEREMIE", "julius-africanus=Iulius Affricanus", "diodorus-siculus=Diodor", "castor=Castor", "thallus=Thallus", "strabo=Strabo", "justin=Iustine", "herodotus=Herodotus", "fall-of-babylon-539-bc"],
  p03434: [],
  p03435: ["cyrus-the-great=Cyrus", "astyages=Astyages", "mandane=Mandane", "ctesias=Ctesias", "astyages=Astigas", "astyages=Apinia", "amytis=Amytis"],
  p03436: ["viginier=Viginier", "astyages=Astyages", "darius-the-mede=Cyaxares", "darius-the-mede=Darius Medus", "diodorus-siculus=Diodore", "justin=Iustine", "strabo=Strabo", "plato=Plato", "aristotle=Aristotle", "isocrates=Isocrates", "castor=Castor", "thallus=Thallus", "phlegon=Phlegon", "tatian=Tatianus", "theophilus-antiochenus=Theophilus", "julius-africanus=Iulius Affricanus", "clemens-alexandrinus=Clemens Alexandrinus", "justin-martyr=Iustine Martyr", "lactantius=Lactantius", "eusebius=Eusebius", "jerome=Hierome", "augustine=Augustine"],
  p03437: ["astyages=Astyages", "darius-the-mede=Darius of the Medes", "josephus=Iosephus", "xenophon=Xenophon", "daniel=Daniel", "darius-the-mede=Darius", "cyrus-the-great=Cyrus"],
  p03438: ["cyrus-the-great=Cyrus", "fall-of-babylon-539-bc"],
  p03439: ["cyrus-the-great=Cyrus", "darius-the-mede=Cyaxares", "darius-the-mede=Darius"],
  p03440: ["daniel=Daniel", "darius-the-mede=Darius", "cyrus-the-great=Cyrus"],
  p03441: ["xenophon=XENOPHON"],
  p03442: ["xenophon=Xenophon"],
  p03443: [],
  p03444: ["croesus=Croesus", "alyattes=Alyattes", "darius-the-mede=Cyaxares", "cyrus-the-great=Cyrus"],
  p03445: ["darius-the-mede=Darius", "xenophon=Xenophon", "darius-the-mede=Cyaxares", "cyrus-the-great=Cyrus", "balthasar=Balthasar", "fall-of-babylon-539-bc"],
  p03446: ["cyrus-the-great=Cyrus", "xenophon=Xenophon"],
  p03447: ["xenophon=Xenophon"],
  p03448: [],
  p03449: ["achaemenes=Achaemenes", "perses=Perses", "arbaces=Arbaces", "sardanapalus=Sardanapalus", "deioces=Deioces", "salmanassar=Salmanasser", "phul-belochus=Belochus"],
  p03450: ["deioces=Deioces", "astyages=Astyages", "nebuchadnezzar-ii=Nabuchodonosor", "daniel=Daniel", "astyages=Astiages", "alyattes=Halyattes", "croesus=Croesus"],
  p03451: ["achaemenes=Achaemenes", "xenophon=Xenophon", "cambyses-father-of-cyrus=Cambyses", "cyrus-the-great=Cyrus", "astyages=Astiages", "mandane=Mandane"],
  p03452: ["astyages=Astiages"],
  p03453: ["herodotus=Herodotus", "cyrus-the-great=Cyrus", "achaemenes=Achaemenidae", "xerxes=Xerxes"],
  p03454: ["xerxes=Xerxes", "herodotus=Herodotus"],
  p03455: ["achaemenes=Achaemenes", "cambyses-of-xerxes-line=Cambyses", "cyrus-of-xerxes-line=Cyrus", "teispeus=Teispeus", "ariaramnes=Ariaramnes", "arsamnes=Arsamnes", "hystaspes=Hystaspes", "darius-hystaspis=Darius", "xerxes=Xerxes"],
  p03456: ["achaemenes=Achaemenidae", "cyrus-the-great=Cyrus the great", "cambyses=Cambyses", "smerdis=Smerdis", "reineccius=Reineccius"],
  p03457: ["achaemenes=Achaemenes", "darius-of-the-first-race=Darius", "cyrus-the-first=Cyrus", "cambyses-father-of-cyrus=Cambyses", "atossa-wife-of-pharnaces=Atossa", "pharnaces=Pharnaces", "artystona=Artystona", "cyrus-the-great=Cyrus the Great", "cambyses=Cambyses", "smerdis=Smerdis"],
  p03458: ["darius-hystaspis=Darius", "hystaspes=Hystaspes"],
  p03459: ["elam=Elam", "shem=Sem", "elam=Elamitae", "elianus=Elianus", "elam=Elymae", "josephus=Iosephus", "elam=Elymi"],
  p03460: ["suidas=Suidas", "asshur=Assur", "magog=Magog", "eusebius=Eusebius", "moses=Moses", "isaiah=Esay", "jeremiah=Ieremie", "ezekiel=Ezechiel", "daniel=Daniel", "esdras=Esdras", "jerome=Hierome", "elam=Elam", "elam=Elamitae"],
  p03461: ["antiochus-iv-epiphanes=Antiochus", "alexander-the-great=Alexander", "thais=Thais"],
  p03462: ["chedorlaomer=Chedorlaomer", "amraphel=Amraphel", "ninias=Ninias", "abraham=Abraham"],
};

export const B3_NEW = {
  niglisar: ["Niglisar", "Niglisar, also printed Niriglissoroor and Niglissar, whom Berosus makes the sisters husband of Euilmerodach, and who held the kingdome after him. Scaliger shifts this man in as Protector. He was not equated with Reg-Assar.", "him"],
  labosardach: ["Labosardach", "Labosardach, also printed Labassardach and Laborosoardoch, the sonne of Niglisar, slaine at the end of nine moneths. He was not equated with Lab-Assar Dach, and Scaliger his calling Belsazer by this name was not a merge.", "him"],
  "reg-assar": ["Reg-Assar", "Reg-Assar, the eldest sonne in Annius his Metasthenes, who is giuen three yeeres. That list was not equated with Berosus.", "him"],
  "lab-assar-dach": ["Lab-Assar Dach", "Lab-Assar Dach, the second sonne in Annius his Metasthenes, who is giuen sixe yeeres. The third sonne is a gap and was not filled. He was not equated with Labosardach.", "him"],
  "iouinian-the-emperour": ["Iouinian the Emperour", "Iouinian the Emperour, after whose death the Councell of the gap is placed, about the yeere of our Lord 368. The Councell's name is a gap and was not filled. The printed spelling is kept.", "him"],
  meliton: ["Meliton", "Meliton, the most ancient Bishop of Sardis, who numbers the booke of Daniel. Eusebius is the witnesse.", "him"],
  hilarius: ["Hilarius", "Hilarius, who wrote a Preface on the booke the gap leaues unnamed, and the Hilarius in whose life S. Hierome tells of a woman that appeared a Cow. The two passages do not say they are two men. The gap was not filled.", "him"],
  "apollonius-against-porphyrie": ["Apollonius against Porphyrie", "Apollonius, named after a gap, as one who answered Porphyrie his booke against Daniel. He is not the Apollonius of the liues of the Fathers, not Apollonius Rhodius, and not the Apollonius beaten by Iudas Macchabaeus. The gap was not filled. The one-word title would fold onto those records, so the title is three words.", "him"],
  "seuerus-with-eusebius": ["Seuerus with Eusebius", "Seuerus, named with Eusebius and Theodoret, who supposed that the gap and Balthasar were brethren and sonnes of Nabuchodonosor. A name between Eusebius and Seuerus is a gap and was not filled. He is not Seuerus the Roman Emperour. The one-word title would fold onto severus-emperor, so the title is three words.", "him"],
  salathiel: ["Salathiel", "Salathiel, whom Iechonia seemes to haue begotten after he was set at libertie. The printed spelling is kept.", "him"],
  nehemiah: ["Nehemiah", "Nehemiah, named in the list of the Hagiographa with Esra and the Chronicles.", "him"],
  huzzab: ["Huzzab", "Huzzab, Queene of Niniuie, whose captiuitie Naum fore-told. Raleigh askes what woman she was, and does not answer it.", "her"],
  "nitocris-of-babylon": ["Nitocris of Babylon", "Nitocris, a famous Queene of Babylon in Herodotus, whom Raleigh takes for the sister of Euilmerodach if Nitocris were his sister, more cunning than Semiramis. She is not the Egyptian queen of the sixth dynastie. The one-word title would fold onto nitocris, so the title is three words.", "her"],
  carthusianus: ["Carthusianus", "Carthusianus, named with S. Augustine, Theodoret, and Lyra among those who did not doubt of Nebuchadnezzar his saluation.", "him"],
  mediana: ["Mediana", "Mediana, according to whom Nebuchadnezzar was changed in figure so that he appeared a beast. Raleigh does not follow that.", "him"],
  achaemenes: ["Achaemenes", "Achaemenes, the sonne of Perses, of whose house Cyrus was, and from whom the Achaemenidae are named. Reineccius calls him the first King of Persia. The father named in that list is a gap and was not filled from Perses.", "him"],
  perses: ["Perses", "Perses, the father of Achaemenes, who was Gouernour of Persia. The printed spelling is kept.", "him"],
  hydaspes: ["Hydaspes", "Hydaspes, an ancient King of the Medes, whom Lactantius remembreth. He is not the riuer.", "him"],
  "diocles-of-the-medes": ["Diocles of the Medes", "Diocles, who raigned 53 yeeres in Eusebius his list of the Kings of Media after Arbaces. He is not Diocles, cited by Iosephus on Nabuchodonosors siege of Tyre. The one-word title would fold onto diocles, so the title is four words.", "him"],
  thallus: ["Thallus", "Thallus, named with Diodor and Castor among those from whom Iulius Affricanus takes the taking of Babylon, and again with Castor and Phlegon among those who find no Successour of Astyages but Cyrus.", "him"],
  phlegon: ["Phlegon", "Phlegon, named with Castor and Thallus among the Writers who doe not finde any Successour of Astyages other than Cyrus.", "him"],
  viginier: ["Viginier", "Viginier, a diligent and learned Historian of this age, who produceth reasons that Astyages had no such sonne as Cyaxares or Darius Medus.", "him"],
  mandane: ["Mandane", "Mandane, the daughter of Astyages, by whom some say Cyrus was his Grand-child. She is not Mandanes the Median King. The printed spelling is kept.", "her"],
  amytis: ["Amytis", "Amytis, the Daughter of Astyages, whom Ctesias sayeth Cyrus married after he had vanquished Astyages. The printed spelling is kept.", "her"],
  "cambyses-father-of-cyrus": ["Cambyses father of Cyrus", "Cambyses, the father of Cyrus, whom Xenophon affirmeth was King of Persia, and who in Reineccius had Cyrus the Great. He is not the Cambyses who succeeded Cyrus, and not the Cambyses in the line by which Xerxes deriueth himselfe. The one-word title would fold onto cambyses, so the title is four words.", "him"],
  "cambyses-of-xerxes-line": ["Cambyses of Xerxes line", "Cambyses, named between Achaemenes and Cyrus in the line by which Xerxes, in the seuenth of Herodotus, deriueth himselfe. He is not Cambyses the father of Cyrus the Great, and not the Cambyses who succeeded him. The one-word title would fold onto cambyses, so the title is four words.", "him"],
  "cyrus-of-xerxes-line": ["Cyrus of Xerxes line", "Cyrus, named between Cambyses and Teispeus in the line by which Xerxes deriueth himselfe. He is not Cyrus the Great, and not Cyrus the first of that name in Reineccius his first race. The one-word title would fold onto the Cyrus already titled in one word, so the title is four words.", "him"],
  "cyrus-the-first": ["Cyrus the first", "Cyrus, the first of that name, in Reineccius his first race of the Achaemenidae, who had Cambyses and Atossa. He is not Cyrus the Great, and not the Cyrus in the line by which Xerxes deriueth himselfe. The one-word title would fold onto the Cyrus already titled in one word, so the title is three words.", "him"],
  teispeus: ["Teispeus", "Teispeus, named in the line by which Xerxes deriueth himselfe, between Cyrus and Ariaramnes. The printed spelling is kept.", "him"],
  ariaramnes: ["Ariaramnes", "Ariaramnes, named in the line by which Xerxes deriueth himselfe, between Teispeus and Arsamnes. The printed spelling is kept.", "him"],
  arsamnes: ["Arsamnes", "Arsamnes, named in the line by which Xerxes deriueth himselfe, between Ariaramnes and Hystaspes. The printed spelling is kept.", "him"],
  hystaspes: ["Hystaspes", "Hystaspes, the father of that Darius who was chosen King after the Magi, and named in the line by which Xerxes deriueth himselfe. He is not Darius Hystaspes. The printed spelling is kept.", "him"],
  "darius-of-the-first-race": ["Darius of the first race", "Darius, named in Reineccius his first race of the Achaemenidae, between Achaemenes and Cyrus the first of that name. He is not Darius the Mede, not Darius the sonne of Hystaspes, and not the Darius whom Alexander conquered. The one-word title would fold onto those records, so the title is five words.", "him"],
  smerdis: ["Smerdis", "Smerdis, a sonne of Cyrus the Great, in whom with his brother Cambyses the issue male of that race fayled. A word after his name, of how his brother Cambyses dealt with him, is a gap and was not filled.", "him"],
  "atossa-wife-of-pharnaces": ["Atossa wife of Pharnaces", "Atossa, daughter of Cyrus the first of that name, married to Pharnaces King of Cappadocia, and mother of Artystona. She is not Queene Atossa, whose desire moued Darius to warre against the Greekes. The one-word title would fold onto atossa, so the title is four words.", "her"],
  pharnaces: ["Pharnaces", "Pharnaces, King of Cappadocia, who married Atossa the daughter of Cyrus the first of that name. The printed spelling is kept.", "him"],
  artystona: ["Artystona", "Artystona, a daughter of Atossa and Pharnaces. The other daughters are unnamed and were not inuented. The printed spelling is kept.", "her"],
  elianus: ["Elianus", "Elianus, who calls the people of Elam Elymae. The printed spelling is kept.", "him"],
  thais: ["Thais", "Thais the Harlot, at whose request Alexander burnt the old Persepolis. The printed spelling is kept.", "her"],
};

export const B3_EVENTS = new Set([
  "fall-of-jerusalem-586-bc",
  "daniel-taken-to-babylon",
  "cyrus-decree-of-return",
  "fall-of-babylon-539-bc",
  "fall-of-nineveh",
  "daniel-interprets-nebuchadnezzars-dream",
  "minor-deportation-nebuchadnezzars-23rd",
]);
