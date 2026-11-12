#!/usr/bin/env node
// Covered text of Raleigh's History (1617): Preface, contents, Book I, Part I,
// and Book II, Part I.
// Rebuilds data/raleigh-accounts.json. With --write, also adds a person record
// for every named individual in that range who does not already have one.
// Undated people get a null CFAH date and no sort year.
//
//   node scripts/raleigh/covered.mjs
//   node scripts/raleigh/covered.mjs --through=12
//   node scripts/raleigh/covered.mjs --through=12 --book2=5 --write
//
// --through is the last Book I, Part I chapter. It cannot be less than 8, because
// passes 1–3 already covered Chapters I–VIII. --book2 is the last Book II, Part I
// chapter. 0 leaves Book II out. Pass 9 stops at Chapter V.
// A passage is attached by the name as printed. Groups, places, and unnamed
// people are not split into individuals. God, Jehovah, and the Holy Ghost are
// not person records. Ambiguous shared names are left unattached.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractPassages, loadXml, normalizeWs, normalizedDocumentText } from './xml-text.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const DATA = join(root, 'data');
const write = process.argv.includes('--write');
const throughArg = process.argv.find((a) => a.startsWith('--through='));
const throughChapter = throughArg ? Number(throughArg.slice('--through='.length)) : 12;
const book2Arg = process.argv.find((a) => a.startsWith('--book2='));
const book2Through = book2Arg ? Number(book2Arg.slice('--book2='.length)) : 0;
if (!Number.isInteger(throughChapter) || throughChapter < 8 || throughChapter > 12) {
  throw new Error('--through must be an integer from 8 to 12 (Book I, Part I ends at Chapter XII)');
}
if (!Number.isInteger(book2Through) || book2Through < 0 || book2Through > 5) {
  throw new Error('--book2 must be 0, 1, 2, 3, 4, or 5 (pass 9 stops at Book II, Part I, Chapter V)');
}
const LINK = 'https://texts.earlyprint.org/works/A10357.xml';
const SRC = 'raleigh-history-of-the-world';
const SRC_ID = 'raleigh-history-of-the-world-1617';
const OURS = "Named in Raleigh's History of the World (1617).";

const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));
const peopleDir = join(DATA, 'people');
const people = new Map();
for (const f of readdirSync(peopleDir).filter((f) => f.endsWith('.json'))) {
  const doc = readJSON(join(peopleDir, f));
  people.set(doc.id, doc);
}
const events = new Map();
for (const f of readdirSync(join(DATA, 'events')).filter((f) => f.endsWith('.json'))) {
  const doc = readJSON(join(DATA, 'events', f));
  events.set(doc.id, doc);
}
const nameDoc = readJSON(join(DATA, 'name-forms.json'));

const xml = loadXml(root);
const passages = extractPassages(xml, { throughChapter, book2Through });
const corpus = normalizedDocumentText(xml);
for (const p of passages) {
  if (!corpus.includes(p.passage)) throw new Error(`passage ${p.id} is not verbatim in the 1617 text (${p.citation})`);
}

const STOP = new Set(`iii iiii vii viii xii xiii xiiii xvi xvii xviii xix xxi xxii xxiii xxiiii xxv xxvi xxvii xxviii viiii iv vi ix xi xx xxx xl chap bvt gods gen and sections the chapters contents historie preface booke first concerning here vers paragraph es epigram cap kings chron deuteronomie deut ezech exod leu num psal
god gods lord iehovah jehovah ghost sauiour saviour creator trinity holy angel angels
world earth scripture church nature reason father sonne son king queen prince duke time yeere yeeres floud flood arke ark tower towre citie city land nation people men man
egypt aegypt asia africa europe india spain spaine italie italy france greece rome athens babel babylon jerusalem paradise heaven heauen shinaar shinar syria media arabia libya lybia scythia pontus cappadocia palestine iudaea judea morea cilicia granado biscay asturia armenia aethiopia ethiopia eden nod adiabene parthia europa britannia memphis pelusium alexandria thebes syene lebanon libanus
greeks hebrews israelites jews scythians egyptians aegyptians arcadians phoenicians tyrians chaldaeans chaldeans persians medes babylonians assyrians canaanites philistims philistines anakims moores moors spaniards latines romans brittaines gentiles sons children infants nations peoples angeles
non sed cum quod qui quae quam sunt esse est fuit erat autem enim item sic nec vel per pro sub super inter apud sine post ante hoc hac his eos eum eius etiam tamen igitur ergo unde inde ubi tum tunc nam neque atque sicut quia quamquam
chapter paragraphe paragraphes part section sancto samech timaeo poemandro vual volga sarmatia gosan gozan reseph sepher sephar mesha haran ogygia martyr
appetite behold daughter diuini gallis genesis nauium occulta omnis potuisset scripsisse wisedome psalme psalmes
but for that this with from they them their which when where what were was hath have been into upon over after before these those unto vnto shall will would could should other about there then than such only into upon now
st au of to in by or as at an be is it we he ye on so no nor not may can our his her its its`.split(/\s+/).filter(Boolean));

const BLOCK = new Set(['ham', 'cham', 'darius', 'philip', 'xerxes', 'sheba', 'havilah', 'hauilah', 'demetrius', 'demtrius', 'nilus', 'abimelech', 'siculus', 'macedon']);

// Printed spellings that belong on a record already in the portal, or on a
// person this script creates under that id. null blocks the token.
const FORCE = {
  iaphet: 'japheth', iapheth: 'japheth', japhet: 'japheth',
  sem: 'shem', shem: 'shem',
  moyses: 'moses', mosis: 'moses', mosen: 'moses',
  phaleg: 'peleg', phalegh: 'peleg', peleg: 'peleg',
  henoch: 'enoch', enoch: 'enoch',
  enos: 'enosh', enosh: 'enosh',
  mathusalem: 'methuselah', methusaleh: 'methuselah', methuselah: 'methuselah',
  cenan: 'kenan', kenan: 'kenan', cainan: 'kenan',
  mahaleel: 'mahalalel', mahalalel: 'mahalalel',
  lared: 'jared', iared: 'jared', iarad: 'jared', jared: 'jared',
  iosua: 'iosua', iosue: 'iosua', ioshua: 'iosua', joshua: 'iosua',
  dauid: 'david', david: 'david',
  salomon: 'solomon', solomon: 'solomon',
  iacob: 'jacob', jacob: 'jacob',
  ioseph: 'joseph', joseph: 'joseph',
  hyram: 'hiram-of-tyre', hiram: 'hiram-of-tyre', hirom: 'hiram-of-tyre',
  sampson: 'samson', samson: 'samson',
  senacherib: 'sennacherib', sennacherib: 'sennacherib',
  esav: 'esau', esat: 'esau', esau: 'esau',
  canaan: 'canaan-son-of-ham',
  chus: 'cush', chush: 'cush', cvsh: 'cush', cush: 'cush',
  mesec: 'meshech', mesech: 'meshech', mosoch: 'meshech', mesach: 'meshech', mesacvs: 'meshech', mesch: 'meshech',
  togorma: 'togarmah', togarma: 'togarmah', togarmah: 'togarmah',
  ascanez: 'ashkenaz', ascanes: 'ashkenaz', ashkenaz: 'ashkenaz',
  ascanivs: 'ascanius', ascanius: 'ascanius', ascanivm: 'ascanius',
  ioctan: 'joktan', joktan: 'joktan',
  iavan: 'javan', javan: 'javan',
  tharsis: 'tarshish', tarshish: 'tarshish',
  elisa: 'elishah', elishah: 'elishah',
  ninvs: 'ninus', ninus: 'ninus',
  alexander: 'alexander-the-great',
  augustus: 'augustus-caesar',
  savl: 'saul', saul: 'saul',
  iob: 'job', job: 'job',
  noe: 'noah', noah: 'noah',
  abram: 'abraham', abraham: 'abraham',
  isahac: 'isaac', isaac: 'isaac',
  ebar: 'eber', heber: 'eber', eber: 'eber',
  sale: 'salah', shelah: 'salah', shela: 'salah', salah: 'salah',
  arphaxat: 'arphaxad', arphaxad: 'arphaxad',
  rehu: 'reu', reu: 'reu',
  sarug: 'serug', serug: 'serug',
  nachor: 'nahor', nahor: 'nahor',
  thare: 'terah', terah: 'terah',
  ismael: 'ishmael', ishmael: 'ishmael',
  lvd: 'lud', lud: 'lud',
  assvr: 'asshur', asshur: 'asshur',
  phvt: 'phut', put: 'phut', phut: 'phut',
  sidon: 'sidon-son-of-canaan',
  ophir: 'ophir-son-of-joktan',
  sabteca: 'sabtechah', sabtechah: 'sabtechah',
  tvbal: 'tubal', tubal: 'tubal',
  gomer: 'gomer', magog: 'magog', madai: 'madai', tiras: 'tiras',
  adam: 'adam', seth: 'seth', cain: 'cain',
  aaron: 'aaron', miriam: 'miriam',
  reuben: 'reuben',
  iesus: 'christ', iesvs: 'christ', jesus: 'christ', christ: 'christ',
  goliah: 'goliath', goliath: 'goliath',
  eva: 'eve', eve: 'eve',
  abel: 'abel',
  og: 'og',
  deucalion: 'deucalion', devcalion: 'deucalion',
  ogyges: 'ogyges',
  iethro: 'jethro', jethro: 'jethro',
  pharao: 'pharaoh', pharaoh: 'pharaoh',
  tubalcain: 'tubal-cain',
  terrhaka: 'tirhakah', thirrhakeh: 'tirhakah', tirhakah: 'tirhakah',
  booz: 'boaz', boaz: 'boaz',
  ruth: 'ruth',
  paul: 'paul',
  peter: 'peter',
  balaam: 'balaam', balac: 'balak', balak: 'balak', beor: 'beor',
  bethvel: 'bethuel', bethuel: 'bethuel',
  dan: 'dan', lot: 'lot',
  gog: 'gog',
  uz: 'uz', hul: 'hul',
  nimrod: 'nimrod', mizraim: 'mizraim',
  plato: 'plato', aristotle: 'aristotle',
  semiramis: 'semiramis', belus: 'belus',
  cyrus: 'cyrus-the-great',
  nebuchadnezzar: 'nebuchadnezzar-ii', nabuchodonosor: 'nebuchadnezzar-ii',
  aeneas: 'aeneas',
  inachus: 'inachus', inachvs: 'inachus',
  danaus: 'danaus', danaeus: 'danaus',
  cecrops: 'cecrops',
  phoroneus: 'phoroneus', phoronevs: 'phoroneus',
  cranaus: 'cranaus', cranavs: 'cranaus', cranao: 'cranaus',
  hercules: 'hercules', hercvles: 'hercules',
  prometheus: 'prometheus', promethevs: 'prometheus',
  cadmus: 'cadmus', cadmvs: 'cadmus',
  zoroaster: 'zoroaster',
  homer: 'homer', hesiod: 'hesiod', hesiovs: 'hesiod',
  virgil: 'virgil',
  pliny: 'pliny', plinie: 'pliny',
  josephus: 'josephus', iosephus: 'josephus', iosephvs: 'josephus',
  eusebius: 'eusebius', evsebius: 'eusebius', evsebivs: 'eusebius', euscbius: 'eusebius',
  augustine: 'augustine', avgvstine: 'augustine',
  jerome: 'jerome', hierome: 'jerome', hieronyme: 'jerome', hieronymus: 'jerome', hieronymvs: 'jerome',
  basil: 'basil',
  ambrose: 'ambrose',
  chrysostome: 'chrysostom', chrysostom: 'chrysostom',
  origen: 'origen', tertullian: 'tertullian',
  berosus: 'berosus', berosvs: 'berosus',
  annius: 'annius', annivs: 'annius',
  pererius: 'pererius', pererivs: 'pererius',
  functius: 'functius', fvnctivs: 'functius',
  mercator: 'gerardus-mercator',
  glycas: 'glycas',
  montanus: 'arias-montanus',
  junius: 'junius', ivnivs: 'junius',
  codoman: 'codoman',
  epigenes: 'epigenes',
  manetho: 'manetho', manethon: 'manetho',
  diodorus: 'diodorus-siculus',
  herodotus: 'herodotus', herodotvs: 'herodotus',
  strabo: 'strabo',
  varro: 'varro',
  cato: 'cato',
  ovid: 'ovid', ovidius: 'ovid',
  plutarch: 'plutarch', plvtarch: 'plutarch',
  xenophon: 'xenophon',
  thales: 'thales',
  zeno: 'zeno',
  democritus: 'democritus', democritvs: 'democritus',
  pythagoras: 'pythagoras',
  socrates: 'socrates',
  cicero: 'cicero',
  seneca: 'seneca',
  horace: 'horace',
  juvenal: 'juvenal', iuvenal: 'juvenal', iwenal: 'juvenal',
  livy: 'livy', livie: 'livy',
  tacitus: 'tacitus',
  justin: 'justin', iustine: 'justin',
  trogus: 'trogus',
  mela: 'pomponius-mela',
  ctesias: 'ctesias',
  appion: 'apion', apion: 'apion',
  syncellus: 'syncellus',
  africanus: 'julius-africanus',
  philastrius: 'philastrius',
  epiphanius: 'epiphanius',
  irad: 'irad',
  mehujael: 'mehujael', mehviael: 'mehujael',
  methusael: 'methusael', methvsael: 'methusael',
  nestor: 'nestor',
  tiresias: 'tiresias',
  sybilla: 'sibyl', sibylla: 'sibyl', sibyl: 'sibyl',
  ephorus: 'ephorus',
  hellanicus: 'hellanicus',
  becanus: 'becanus', becanvs: 'becanus',
  solyman: 'solyman',
  fume: 'anthonie-fume',
  mathias: 'mathias',
  vespasian: 'vespasian',
  chedorlaomer: 'chedorlaomer',
  chedorlaomer: 'chedorlaomer',
  og: 'og',
  isabel: 'isabel', isabella: 'isabel',
  ferdinand: 'ferdinand',
  parma: 'duke-of-parma',
  desmond: 'countesse-of-desmond',
  buckingham: 'buckingham',
  suffolk: 'suffolk', suffolke: 'suffolk',
  machiavel: 'machiavel',
  petrarch: 'petrarch',
  melanchton: 'melanchthon', melanchthon: 'melanchthon',
  boethius: 'boethius', boeyivs: 'boethius', boetius: 'boethius',
  orpheus: 'orpheus', orphevs: 'orpheus',
  jupiter: 'jupiter', iupiter: 'jupiter', ivpiter: 'jupiter',
  juno: 'juno', ivno: 'juno',
  diana: 'diana',
  vulcan: 'vulcan', vvlcan: 'vulcan',
  bacchus: 'bacchus', bacchvs: 'bacchus',
  apollo: 'apollo',
  neptune: 'neptune',
  pluto: 'pluto',
  saturn: 'saturn', saturnus: 'saturn',
  picus: 'picus',
  faunus: 'faunus',
  latinus: 'latinus',
  pelasgus: 'pelasgus',
  demophoon: 'demophon', demophon: 'demophon',
  ianus: 'ianus', janus: 'ianus',
  aegyptus: 'aegyptus',
  ramesses: 'ramesses', rameses: 'ramesses',
  saltis: 'saltis',
  vexoris: 'vexoris',
  tanais: 'tanais',
  ariaeus: 'ariaeus',
  barzanis: 'barzanis',
  pharnus: 'pharnus',
  staurobates: 'staurobates',
  jason: 'jason',
  tibullus: 'tibullus',
  hiram: 'hiram-of-tyre',
  eliah: 'elijah', elias: 'elijah', elijah: 'elijah',
  elisha: 'elisha',
  esdras: 'esdras',
  daniel: 'daniel',
  matthew: 'matthew', matthevv: 'matthew',
  iohn: 'john', john: 'john',
  esay: 'isaiah', esai: 'isaiah', esaiah: 'isaiah', isaiah: 'isaiah', esaias: 'isaiah',
  ezechiel: 'ezekiel', ezekiel: 'ezekiel',
  hieremie: 'jeremiah', hieremy: 'jeremiah', jeremiah: 'jeremiah',
  samuel: 'samuel',
  goliath: 'goliath',
  anak: 'anak',
  lyranus: 'lyranus',
  lyra: 'lyranus',
  beroaldus: 'beroaldus',
  montanus: 'arias-montanus',
  pagninus: 'pagninus', pagnine: 'pagninus',
  tremellius: 'tremellius', tremelius: 'tremellius',
  stephanus: 'stephanus',
  aethicus: 'aethicus',
  comestor: 'comestor',
  damascene: 'john-damascene',
  bernard: 'bernard',
  nazianzene: 'gregory-nazianzen', nazianzen: 'gregory-nazianzen',
  tostatus: 'tostatus', tostatus: 'tostatus',
  mercer: 'mercer',
  philo: 'philo',
  rabanus: 'rabanus',
  reynerius: 'reynerius',
  cusanus: 'cusanus', cvsanvs: 'cusanus',
  palladius: 'palladius',
  mirandula: 'mirandola', mirandola: 'mirandola',
  philadelphus: 'ptolemy-philadelphus',
  ptolemy: 'ptolemy', ptolomie: 'ptolemy', ptolemee: 'ptolemy',
  eratosthenes: 'eratosthenes',
  callinicus: 'callinicus',
  athenaus: 'athenaeus', athenaeus: 'athenaeus',
  arnobius: 'arnobius', arnobivs: 'arnobius',
  tatianus: 'tatian', tatian: 'tatian',
  antiochus: 'antiochus-the-great',
  tigranes: 'tigranes',
  seleucus: 'seleucus-nicanor',
  nicanor: 'seleucus-nicanor',
  hadrian: 'hadrian',
  trajan: 'trajan', traian: 'trajan',
  nero: 'nero',
  tiberius: 'tiberius',
  caligula: 'caligula',
  domitian: 'domitian',
  vespasian: 'vespasian',
  titus: 'titus',
  augustus: 'augustus-caesar',
  pompey: 'pompey', pompeius: 'pompey',
  caesar: 'julius-caesar',
  julius: 'julius-caesar',
  brutus: 'brutus', brvte: 'brutus',
  hannibal: 'hannibal',
  scipio: 'scipio',
  pyrrhus: 'pyrrhus',
  mitridates: 'mithridates', mithridates: 'mithridates',
  croesus: 'croesus',
  semiramis: 'semiramis',
  ninias: 'ninias',
  trebeta: 'trebeta',
  ascanez: 'ashkenaz',
  samothes: 'samothes',
  shemer: 'shemer',
  tharbis: 'tharbis',
  zephora: 'zipporah', zipporah: 'zipporah', sephora: 'zipporah',
  zera: 'zerah',
  zearah: 'zerah',
  zerah: 'zerah',
  balaam: 'balaam',
  beor: 'beor',
  hamathi: 'hamathite',
  arvadi: 'arvadite',
  sineus: 'sinite', sini: 'sinite',
  zemari: 'zemarite',
  ienu: 'jebusite', iebuseus: 'jebusite', jebusite: 'jebusite',
  assvr: 'asshur',
  phvt: 'phut',
  ioctan: 'joktan',
  hyram: 'hiram-of-tyre',
  elisa: 'elishah',
  tharsis: 'tarshish',
  gomerus: 'gomer', gallus: null,
  ianvs: 'ianus',
  devcalion: 'deucalion',
  ogyge: 'ogyges',
  inachvm: 'inachus',
  noahs: 'noah', iaphets: 'japheth', nimrods: 'nimrod',
  adams: 'adam', adami: 'adam', cains: 'cain',
  iacobs: 'jacob',
  deucalions: 'deucalion', deucalionis: 'deucalion',
  semiramidis: 'semiramis',
  ogygis: 'ogyges', ogygvm: 'ogyges',
  phoronei: 'phoroneus',
  promethei: 'prometheus',
  iovem: 'jupiter', ioves: 'jupiter', iupiters: 'jupiter',
  mosis: 'moses',
  hercvlem: 'hercules', herculem: 'hercules',
  platonem: 'plato',
  ianvm: 'ianus', iani: 'ianus',
  ascanivm: 'ascanius',
  ioctans: 'joktan',
  ambrosivm: 'ambrose',
  basilivm: 'basil',
  augustinum: 'augustine',
  platonicus: null,
  macedon: null,
  siculus: null,
  gallus: null,
  augustines: 'augustine',
  hesiodus: 'hesiod',
  cecrope: 'cecrops',
  cecropis: 'cecrops',
  zenonem: 'zeno',
  strrbo: 'strabo',
  philadeiphus: 'ptolemy-philadelphus',
  isay: 'isaiah',
  nimrodi: 'nimrod',
  noacho: 'noah',
  machiauels: 'machiavel',
  thirrbakeh: 'tirhakah',
  diod: 'diodorus-siculus',
  arias: 'arias-montanus',
  maries: 'mary',
  telchius: 'telchius',
  bonauenture: 'bonaventure',
  bonaventure: 'bonaventure',
  orosius: 'orosius',
  rupertus: 'rupertus',
  isidore: 'isidore',
  gyges: 'gyges',
  cheops: 'cheops',
  chemmis: 'chemmis',
  cephrenes: 'cephrenes',
  cyrillus: 'cyril',
  cyril: 'cyril',
  theuet: 'andrew-theuet',
  hyacynthus: 'hyacynthus',
  archimachus: 'archimachus',
  flaminius: 'flaminius',
  conon: 'conon',
  lycaon: 'lycaon',
  xuthus: 'xuthus',
  epaphus: 'epaphus',
  ignatius: 'ignatius',
  grey: 'grey',
  armeus: 'armeus',
  butaeo: 'butaeus',
  mose: 'moses',
  tubai: 'tubal',
  gerardus: 'gerardus-mercator',
  nonius: 'nonius-marcellus',
  nonivs: 'nonius-marcellus',
  marcellus: 'nonius-marcellus',
  marcellvs: 'nonius-marcellus',
  // Chapters IX–XII. A genitive or a possessive stays on the person already named.
  // A Latin word, a plural class, and the Lord's “ISHI” are not people.
  abrahami: 'abraham', abrahams: 'abraham',
  beli: 'belus',
  // Cyril’s name for Belus in the sepulchre paragraph. Not a second man.
  arbelus: 'belus', arbelvs: 'belus',
  nini: 'ninus', ninyas: 'ninias', zameis: 'ninias',
  zoroastris: 'zoroaster',
  daniels: 'daniel',
  pauls: 'paul',
  peters: 'peter',
  nabuchodonosors: 'nebuchadnezzar-ii',
  theophili: 'theophilus', theophilus: 'theophilus',
  polychronij: 'polychronius', polychronius: 'polychronius',
  sosthenes: 'hostanes', hostanes: 'hostanes',
  hostianes: 'hostianes',
  vatablvs: 'vatablus', uatablus: 'vatablus', vatablus: 'vatablus',
  vives: 'viues', uiues: 'viues', viues: 'viues',
  sabatius: 'tanais',
  thuras: 'arius',
  barzanes: 'barzanis',
  sophocles: 'sophocles',
  methodius: 'methodius',
  locus: null, maiestie: null, maiesties: null, origine: null, ishi: null,
  saturnes: null, saturni: null,
  junoes: null, junones: null, ivnoes: null, ivnones: null,
  loyseau: 'loyseau', tholosanus: 'tholosanus', agesilaus: 'agesilaus', charron: 'charron',
  nauclerus: 'nauclerus', torniellus: 'torniellus', reineccius: 'reineccius',
  menon: 'menon', hermodorus: 'hermodorus', dinon: 'dinon', oromasdes: 'oromasdes',
  epimenides: 'epimenides', sedulius: 'sedulius', lycurgus: 'lycurgus',
  hospinian: 'hospinian', crinitus: 'crinitus', porphyrius: 'porphyrius', budas: 'budas',
  caluin: 'caluin', vincentius: 'vincentius', laertius: 'laertius', psellus: 'psellus',
  cardan: 'cardan', cardans: 'cardan', triton: 'triton', dagon: 'dagon',
  bellonius: 'bellonius', proclus: 'proclus', arianus: 'arianus', dercetaeus: 'dercetaeus',
  pletho: 'gemisthius', gemisthius: 'gemisthius', cedrenus: 'cedrenus', cassianus: 'cassianus',
  irari: 'irari', garsias: 'garsias', halycarnassaeus: 'halycarnassaeus',
  derceta: 'derceta', dercetis: 'derceta', patritius: 'patritius', parisiensis: 'parisiensis',
  // Arabia Foelix and Foelix Iulia are places. M. Foelix is the phrase below.
  thomas: 'thomas-aquinas', aquinas: 'thomas-aquinas',
  adimantus: 'adimantus',
  // Bare Dion in the Berosus list. Dion Neapolites is a different man (phrase below).
  dion: 'dion',
  // Book II, Part I, Chapter I. A Latin ending stays on the person. A city, a
  // land, and a gloss are not new people. Title case attaches only when named here.
  abrahamo: 'abraham', christo: 'christ', semo: 'shem',
  sara: 'sarai', sarah: 'sarai', saram: 'sarai', iscah: 'sarai',
  lots: 'lot',
  nabor: 'nahor',
  iosus: 'iosua',
  ezechias: 'hezekiah',
  beda: 'bede', bede: 'bede',
  regu: 'reu',
  sabta: 'sabtah',
  seba: 'seba', raama: 'raamah',
  moses: 'moses',
  stephen: 'stephen',
  arius: 'arius', aralius: 'aralius',
  baleus: 'baleus', balaneus: 'baleus', balanius: 'baleus',
  iustin: 'justin',
  curtius: 'quintus-curtius',
  chedorlaomer: 'chedorlaomer', chedorl: 'chedorlaomer', kedarlaomer: 'chedorlaomer',
  amraphel: 'amraphel', arioch: 'arioch', tidal: 'tidal',
  bera: 'bera', shinab: 'shinab', shemebar: 'shemebar',
  keturah: 'keturah', zimron: 'zimron', iockshan: 'iockshan',
  medan: 'medan', ishbak: 'ishbak', shuah: 'shuah',
  obed: 'obed', iesse: 'jesse',
  rebecca: 'rebecca', milcah: 'milcah', laban: 'laban', hagar: 'hagar', lea: 'lea',
  caietan: 'caietan', musculus: 'musculus', aquila: 'aquila', symmachus: 'symmachus',
  archilochus: 'archilochus', aretas: 'aretas', areta: 'aretas',
  beza: 'beza', broughton: 'broughton', gibbons: 'gibbons', bucholcerus: 'bucholcerus',
  // Printed Innius, the same writer as Iunius.
  innius: 'junius',
  tamberlain: 'tamberlain', thucydides: 'thucydides', sesac: 'sesac', leuita: 'leuita',
  // Ellas is a country. Bela is Zoar. Moore is also Blacke-Moore. Victor glosses the name Xerxes.
  ellas: null, bela: null, moore: null, victor: null,
  // Book II, Part I, Chapter II. Egyptian kings, their aliases, and the writers
  // who date them. A city, a land, and an office are not people. Two Sesostrises
  // and Orus the second are split because he names them apart from the first.
  osiris: 'osiris', osiri: 'osiris',
  mizraim: 'mizraim',
  typhon: 'typhon',
  orus: 'orus', orvs: 'orus',
  sesostris: 'sesostris',
  sesonchosis: 'sesostris',
  thermutis: 'thermutis', thermvtis: 'thermutis',
  acenchere: 'thermutis', acencris: 'thermutis', acencheres: 'thermutis',
  meris: 'thermutis', muthis: 'thermutis',
  phareis: 'thermutis',
  ramesses: 'ramesses', rameses: 'ramesses',
  armesesmiamum: 'ramesses', armesesmiamus: 'ramesses',
  aegyptus: 'aegyptus',
  danaus: 'danaus',
  armeus: 'armeus',
  armais: 'armais',
  armesis: 'armais',
  epaphus: 'epaphus',
  lehabim: 'lehabim',
  vexoris: 'vexoris',
  saltis: 'saltis',
  isis: 'isis',
  reineccius: 'reineccius',
  glicas: 'glycas',
  necho: 'neco',
  ieroboam: 'jeroboam-i', jeroboam: 'jeroboam-i',
  gideon: 'gedeon',
  ierubbaal: 'gedeon', jerubbaal: 'gedeon',
  hammon: 'cham',
  menas: 'osiris', menis: 'osiris', menaeus: 'osiris',
  apachnas: 'apachnan',
  acherres: 'acherrhes',
  pheron: 'sesostris-the-blinde', pherones: 'sesostris-the-blinde',
  busiris: 'busiris',
  rathoris: 'rathoris', athoris: 'rathoris',
  chencres: 'chencres',
  cherres: 'cherres',
  telegonus: 'telegonus',
  lynceus: 'lynceus',
  hypermnestra: 'hypermnestra',
  agenor: 'agenor',
  putiphar: 'putiphar', putiphars: 'putiphar',
  asenath: 'asenath',
  phicol: 'phicol',
  ioab: 'ioab', joab: 'ioab',
  abner: 'abner',
  hadad: 'hadad',
  amenoph: 'amenophis', amenophis: 'amenophis',
  themosis: 'themosis', amasis: 'themosis',
  vaphres: 'vaphres',
  baeon: 'baeon',
  apochis: 'apochis',
  dardanus: 'dardanus',
  krentzhemius: 'krentzhemius',
  bunting: 'bunting',
  aventinus: 'aventinus',
  ortelius: 'ortelius',
  io: 'io',
  chams: 'cham',
  noes: 'noah',
  hier: 'jerome',
  sesostres: 'sesostris',
  auentinus: 'aventinus',
  dtodorus: 'diodorus-siculus',
  cyrill: 'cyril',
  artabanus: 'artabanus',
  // Cairo is the city. The Caliphe and the Soldans are offices. Mulene is damaged.
  cairo: null, visier: null, visiers: null, caliphe: null, soldans: null, mulene: null,
  // Book II, Part I, Chapter III. A spelling stays on the person already named.
  // A month, a city, and a gloss are not people. Two men who share a word are
  // split by a phrase below, not by this token.
  pharaohs: 'pharaoh', pharaos: 'pharaoh',
  pagnin: 'pagninus',
  commestor: 'comestor',
  porphyrie: 'porphyrius',
  musaeus: 'musaeus', mvsaevs: 'musaeus',
  sanchoniato: 'sanchoniathon', sanchoniathon: 'sanchoniathon',
  polemon: 'polemon',
  numenius: 'numenius',
  artapanus: 'artapanus',
  chenephis: 'thermutis', thermothes: 'thermutis',
  eupolemus: 'eupolemon', eupolemon: 'eupolemon',
  amesis: 'amosis-mendesius', amosis: 'amosis-mendesius',
  thmosis: 'thmosis', sethosis: 'sethosis',
  bocchoris: 'bocchorus',
  saphrus: 'saphrus', spherus: 'saphrus',
  orthopolis: 'orthopolis',
  criasus: 'criasus',
  mamelus: 'mamelus',
  sparetus: 'sparetus',
  ascatades: 'ascatades',
  chenchres: 'chencres',
  pharetates: 'pharetates',
  hegesippus: 'hegesippus',
  brochard: 'brochard',
  zeigler: 'zeigler',
  tudalensis: 'tudalensis',
  herod: 'herod-the-great',
  abulensis: 'tostatus',
  osorius: 'osorius',
  phagius: 'phagius',
  philostratus: 'philostratus',
  artemidorus: 'artemidorus',
  iuba: 'iuba',
  salmanassar: 'salmanassar',
  erythras: 'erythrus', erythraeus: 'erythrus',
  // Erythros is the Greek word he says signifieth Red. Not King Erythrus.
  erythros: null,
  gama: 'steaen-gama',
  castro: 'castro',
  genebrard: 'genebrard',
  sigonius: 'sigonius', sigonivs: 'sigonius',
  harpalus: 'harpalus',
  meton: 'meton',
  calippus: 'calippus',
  hipparchus: 'hipparchus',
  aminadab: 'aminadab',
  onias: 'onias-high-priest',
  mahomet: 'mahomet', mahomets: 'mahomet',
  // Book II, Part I, Chapter IV. A spelling stays on the person already named.
  // A statute, a book, and a town are not people. Two men who share a word are
  // split by a phrase below.
  zipora: 'zipporah',
  kethura: 'keturah',
  noi: 'noah', noa: 'noah',
  caine: 'cain',
  iouis: 'jupiter',
  iothor: 'jethro', hobab: 'jethro', raguel: 'jethro', reuel: 'jethro', iethroes: 'jethro',
  triopus: 'triopas',
  ascades: 'ascatades',
  vlpian: 'ulpianus',
  lactantius: 'lactantius',
  marathus: 'marathus',
  iuda: 'judah',
  hezekia: 'hezekiah',
  dina: 'dinah',
  // Latin in the law chapter, picked up beside a small-caps name. Not people.
  conditor: null, legaliaiusta: null, nobilitie: null,
  // Book II, Part I, Chapter V. A spelling stays on the person already named.
  // A region, a book, and a drop-cap are not people. Two men who share a word
  // are split by a phrase below, not by this token.
  zabulon: 'zebulun',
  ruben: 'reuben',
  nephtali: 'naphtali',
  iudah: 'judah',
  judah: 'judah',
  issachar: 'issachar',
  simeon: 'simeon',
  gad: 'gad',
  ephraim: 'ephraim',
  asher: 'asher',
  rachel: 'rachel',
  caleb: 'caleb',
  anac: 'anak',
  leui: 'levi',
  beniamin: 'benjamin',
  iosuah: 'iosua',
  iosva: 'iosua',
  nabuchadnessar: 'nebuchadnezzar-ii',
  nebuchadnessar: 'nebuchadnezzar-ii',
  iehossaphat: 'jehoshaphat',
  belonius: 'bellonius',
  cambyses: 'cambyses',
  hieroms: 'jerome',
  hieromes: 'jerome',
  // Yong Adad of Idumaea, who fled from Ioab into Aegypt, is the Hadad already named.
  adad: 'hadad',
  siracides: 'siracides',
  // Schon and Sihon are the Amorite king he also prints Sehon.
  schon: 'sehon',
  sihon: 'sehon',
  sehon: 'sehon',
  naason: 'naason',
  naashon: 'naason',
  nethaneel: 'nethaneel',
  nathaniel: 'nethaneel',
  eliab: 'eliab',
  eliasaph: 'eliasaph',
  gamliel: 'gamliel',
  abidam: 'abidam',
  ahiezer: 'ahiezer',
  pagiel: 'pagiel',
  ahira: 'ahira',
  korah: 'korah',
  dathan: 'dathan',
  abiram: 'abiram',
  gershan: 'gershan',
  elizaphan: 'elizaphan',
  merari: 'merari',
  zuriel: 'zuriel',
  eleazar: 'eleazar',
  arad: 'arad',
  adrichomius: 'adrichomius',
  zippor: 'zippor',
  fonseca: 'fonseca',
  vaheb: 'vaheb',
  vahebvm: 'vaheb',
  thaddaeus: 'thaddaeus',
  theodoret: 'theodoretus',
  theodoretus: 'theodoretus',
  nathan: 'nathan',
  ieedo: 'ieedo',
  iddo: 'iddo',
  shemaiah: 'shemaiah',
  arbah: 'arbah',
  phineas: 'phineas',
  cosbi: 'cosbi',
  eui: 'eui',
  rekem: 'rekem',
  zur: 'zur',
  hur: 'hur',
  reba: 'reba',
  moloch: 'moloch',
  // Suph and SVPH are the region. Not a person.
  svph: null,
  suph: null,
};

const PHRASES = [
  ['duke of parma', 'duke-of-parma', 'Duke of Parma'],
  ['countesse of desmond', 'countesse-of-desmond', 'Countesse of Desmond'],
  ['countess of desmond', 'countesse-of-desmond', 'Countesse of Desmond'],
  ['henry the eight', 'henry-viii', null],
  ['henrie the eight', 'henry-viii', null],
  ['henry viii', 'henry-viii', null],
  ['henry the seuenth', 'henry-vii', 'Henry the Seuenth'],
  ['henry the seauenth', 'henry-vii', 'Henry the Seuenth'],
  ['henry the seventh', 'henry-vii', 'Henry the Seuenth'],
  ['henry the sixt', 'henry-vi', 'Henry the Sixt'],
  ['henry the sixth', 'henry-vi', 'Henry the Sixt'],
  ['edward the fourth', 'edward-iv', 'Edward the Fourth'],
  ['edward the fourths', 'edward-iv', 'Edward the Fourth'],
  ['alexander the great', 'alexander-the-great', null],
  ['alex. macedon', 'alexander-the-great', null],
  ['moses bar-cephas', 'moses-bar-cephas', 'Moses Bar-cephas'],
  ['moses barcephas', 'moses-bar-cephas', 'Moses Bar-cephas'],
  ['iohn baptist', 'john-the-baptist', 'Iohn Baptist'],
  ['john baptist', 'john-the-baptist', 'Iohn Baptist'],
  ['arias montanus', 'arias-montanus', 'Arias Montanus'],
  ['gerardus mercator', 'gerardus-mercator', 'Gerardus Mercator'],
  ['gregory nazianzene', 'gregory-nazianzen', 'Gregory Nazianzene'],
  ['gregory nazianzen', 'gregory-nazianzen', 'Gregory Nazianzene'],
  ['iustine martyr', 'justin-martyr', 'Iustine Martyr'],
  ['justin martyr', 'justin-martyr', 'Iustine Martyr'],
  ['nonius marcellus', 'nonius-marcellus', 'Nonius Marcellus'],
  ['nonius marcellvs', 'nonius-marcellus', 'Nonius Marcellus'],
  ['xenophanes colophonius', 'xenophanes', 'Xenophanes'],
  ['xenophanes colophonivs', 'xenophanes', 'Xenophanes'],
  ['fabius pictor', 'fabius-pictor', 'Fabius Pictor'],
  ['antiochus the great', 'antiochus-the-great', 'Antiochus the Great'],
  ['seleucus nicanor', 'seleucus-nicanor', 'Seleucus Nicanor'],
  ['christ iesus', 'christ', 'Christ'],
  ['christ iesvs', 'christ', 'Christ'],
  ['christ iesu', 'christ', 'Christ'],
  ['saint paul', 'paul', 'Paul'],
  ['s. paul', 'paul', 'Paul'],
  ['s. augustine', 'augustine', 'Augustine'],
  ['saint augustine', 'augustine', 'Augustine'],
  ['diodorus siculus', 'diodorus-siculus', 'Diodorus Siculus'],
  ['diod. siculus', 'diodorus-siculus', 'Diodorus Siculus'],
  ['pomponius mela', 'pomponius-mela', 'Pomponius Mela'],
  ['pomp. mela', 'pomponius-mela', 'Pomponius Mela'],
  ['trogus pompeius', 'trogus', 'Trogus Pompeius'],
  ['marcus portius cato', 'cato', 'Marcus Portius Cato'],
  ['marcus porcius cato', 'cato', 'Marcus Portius Cato'],
  ['anthonie fume', 'anthonie-fume', 'Anthonie Fume'],
  ['anthony fume', 'anthonie-fume', 'Anthonie Fume'],
  ['cecrops the second', 'cecrops-the-second', null],
  ['vespasian the father', 'vespasian', 'Vespasian'],
  ['holy ghost', null, null],
  ['two infants', null, null],
  ['henry the first', 'henry-i', 'Henry the First'],
  ['henry the fourth', 'henry-iv', 'Henry the Fourth'],
  ['henry of lancaster', 'henry-iv', 'Henry the Fourth'],
  ['richard the second', 'richard-ii', 'Richard the Second'],
  ['richard the third', 'richard-iii', 'Richard the Third'],
  ['francis the first', 'francis-i', 'Francis the First'],
  ['iames the fift', 'james-v', 'Iames the Fift'],
  ['james the fifth', 'james-v', 'Iames the Fift'],
  ['king iames', 'james-v', 'Iames the Fift'],
  ['saint iames', 'james', 'Iames'],
  ['s. iames', 'james', 'Iames'],
  ['marius niger', 'marius-niger', 'Marius Niger'],
  ['quintus curtius', 'quintus-curtius', 'Quintus Curtius'],
  ['sir francis bacon', 'francis-bacon', 'Sir Francis Bacon'],
  ['william cambden', 'william-camden', 'William Cambden'],
  ['george d. of clarence', 'george-of-clarence', 'George of Clarence'],
  ['pinetus acyla', 'pinetus-acyla', 'Pinetus Acyla'],
  ['andrew theuet', 'andrew-theuet', 'Andrew Theuet'],
  ['mahomet aben alhamar', 'mahomet-aben-alhamar', 'Mahomet Aben Alhamar'],
  ['alexander polyhistor', 'alexander-polyhistor', 'Alexander Polyhistor'],
  ['iulius africanus', 'julius-africanus', 'Iulius Africanus'],
  ['julius africanus', 'julius-africanus', 'Iulius Africanus'],
  ['sixtus senensis', 'sixtus-senensis', 'Sixtus Senensis'],
  ['sixtvs senensis', 'sixtus-senensis', 'Sixtus Senensis'],
  ['picus mirandula', 'mirandola', 'Picus Mirandula'],
  ['lodouicus viues', 'viues', 'Viues'],
  ['l. viues', 'viues', 'Viues'],
  ['l. vives', 'viues', 'Viues'],
  ['simon magus', 'simon-magus', 'Simon Magus'],
  ['epimenides cretensis', 'epimenides', 'Epimenides'],
  ['serenus abbas', 'serenus', 'Serenus Abbas'],
  ['rabbi auornathan', 'auornathan', 'Rabbi Auornathan'],
  ['archangelus de burgo', 'archangelus-de-burgo', 'Archangelus de Burgo'],
  ['m. foelix', 'foelix', 'M. Foelix'],
  ['b. rhenanus', 'rhenanus', 'B. Rhenanus'],
  ['thomas aquinas', 'thomas-aquinas', 'Thomas Aquinas'],
  ['guilandinus melchior', 'guilandinus-melchior', 'Guilandinus Melchior'],
  ['dion neapolites', 'dion-neapolites', 'Dion Neapolites'],
  ['daniel angelocrator', 'daniel-angelocrator', 'Daniel Angelocrator'],
  ['sethus caluisius', 'sethus-caluisius', 'Sethus Caluisius'],
  ['nicholas damascenus', 'nicholas-damascenus', 'Nicolaus Damascenus'],
  ['nicolaus damascenus', 'nicholas-damascenus', 'Nicolaus Damascenus'],
  ['rab. solomon', 'rab-solomon', 'Rab. Solomon'],
  ['q. curtius', 'quintus-curtius', null],
  ['liberis noa', 'noah', null],
  ['chedor laomer', 'chedorlaomer', null],
  // Book II, Part I, Chapter II.
  ['sesostris the great', 'sesostris', 'Sesostris'],
  ['sesostris the blinde', 'sesostris-the-blinde', 'Sesostris the blinde'],
  ['sesostris the second', 'sesostris-the-blinde', 'Sesostris the blinde'],
  ['orus the second', 'busiris', 'Busiris'],
  ['orus the 2', 'busiris', 'Busiris'],
  ['oris the second', 'busiris', 'Busiris'],
  ['hercules lybius', 'lehabim', null],
  ['hercules aegyptus', 'hercules', 'Hercules Aegyptus'],
  ['hercvles aegyptvs', 'hercules', 'Hercules Aegyptus'],
  ['william, archbishop of tyre', 'william-of-tyre', 'William, Archbishop of Tyre'],
  ['william archbishop of tyre', 'william-of-tyre', 'William, Archbishop of Tyre'],
  ['pharaoh vaphres', 'vaphres', 'Vaphres'],
  ['iulian the apostata', 'julian', null],
  ['julian the apostata', 'julian', null],
  ['sesostris or sesonchosis', 'sesostris', null],
  ['busiris or oris the second', 'busiris', 'Busiris'],
  ['busiris or orus the second', 'busiris', 'Busiris'],
  ['acenchere or thermutis', 'thermutis', null],
  ['rathoris or athoris', 'rathoris', 'Rathoris'],
  ['danaus or armeus', 'danaus', null],
  ['aegyptus or ramesses', 'ramesses', null],
  ['ramesses or aegyptus', 'ramesses', null],
  ['mercurius ter-maximus', 'mercurius', 'Mercurius Ter-maximus'],
  ['lybia, who had', 'lybia-daughter-of-epaphus', 'Lybia'],
  ['hier ome', 'jerome', null],
  // Book II, Part I, Chapter III. The longer phrase wins, so a shared word
  // stays on the person already named and the other man is a separate record.
  ['ptolomie a priest of mendes', 'ptolemy-of-mendes', 'Ptolomie a Priest of Mendes'],
  ['ptolomie philopater', 'ptolemy-philopator', 'Ptolomie Philopater'],
  ['pope gregorie the 13', 'gregorie-xiii', 'Pope Gregorie the 13'],
  ['william tyrius', 'william-of-tyre', 'William Tyrius'],
  ['gul tyrius', 'william-of-tyre', 'Gul Tyrius'],
  ['tyrius in the holy warre', 'william-of-tyre', null],
  ['saith tyrius', 'william-of-tyre', null],
  ['baldwin the third', 'baldwin-the-third', 'Baldwin the third'],
  ['demetrius phalereus', 'demetrius-phalereus', 'Demetrius Phalereus'],
  ['six. senensis', 'sixtus-senensis', null],
  ['clemens alexandrinus', 'clemens-alexandrinus', 'Clemens Alexandrinus'],
  ['inachus ruled the argiues', 'inachus', null],
  ['apis the third', 'apis-of-argiues', null],
  ['sephora and thua', null, null],
  ['ioseph and the virgin mary', null, null],
  ['perseus and andromeda', null, null],
  ['lysimachus and cornelius tacitus', 'lysimachus-writer', 'Lysimachus'],
  ['antonius giues', 'antonius', 'Antonius'],
  ['apollonius in the liues of the fathers', 'apollonius', 'Apollonius'],
  ['quin. curtius', 'quintus-curtius', null],
  ['alex. polyhistor', 'alexander-polyhistor', null],
  ['steaen gama', 'steaen-gama', 'Steaen Gama'],
  ['richard hacluit', 'richard-hacluit', 'Richard Hacluit'],
  ['iohannes barros', 'iohannes-barros', 'Iohannes Barros'],
  ['tribe of iuda', 'judah', null],
  // “S. August.” is Augustine. The month August is not this phrase.
  ['s. august', 'augustine', null],
  // Book II, Part I, Chapter IV. The longer phrase wins. A statute name blocks
  // the span so it is not made a person. S. Iohn stays on john (N10).
  ['heber the kenite', 'heber-the-kenite', 'Heber the Kenite'],
  ['peter belonius', 'bellonius', null],
  ['monsieur de fumet', 'monsieur-de-fumet', 'Monsieur de Fumet'],
  ['ptolomie the second', 'ptolemy-philadelphus', null],
  ['baldwine the first', 'baldwin-the-first', 'Baldwine the first'],
  ['m r. hooker', 'hooker', 'Hooker'],
  ['master doctor willet', 'willet', 'Willet'],
  ['interpreted by iulian', 'iulian-jurist', 'Iulian the jurist'],
  ['adrian the emperour', 'adrian-the-emperor', 'Adrian the Emperour'],
  ['prince edward', 'prince-edward', 'Prince Edward'],
  ['seruius tullius', 'servius-tullius', 'Seruius Tullius'],
  ['ivlia de adulterijs', null, null],
  ['iulia de adulterijs', null, null],
  ['law of ivlian', null, null],
  ['law of iulian', null, null],
  ['cornelia de sicarijs', null, null],
  ['the cornelian', null, null],
  ['prophecied vnto iohn', 'john-the-baptist', null],
  ['baptisme of iohn', 'john-the-baptist', null],
  ['pharaoh and abimelech', 'abimelech-of-gerar', null],
  ['issues of madian', 'midian-son-of-abraham', null],
  ['a raham', 'abraham', null],
  ['pythagor as', 'pythagoras', null],
  ['our sauiour', 'christ', null],
  ['tarquin then', 'tarquin', 'Tarquin'],
  ['g. valentia', 'valentia', 'Valentia'],
  ['and valentia', 'valentia', null],
  ['reinerius', 'reinerius', 'Reinerius'],
  ['antoninus', 'antoninus', 'Antoninus'],
  ['iustinian', 'justinian', 'Iustinian'],
  ['modestinus', 'modestinus', 'Modestinus'],
  ['papyrius', 'papyrius', 'Papyrius'],
  ['fortescue', 'fortescue', 'Fortescue'],
  ['bracton', 'bracton', 'Bracton'],
  ['danaeus', 'danaeus', 'Danaeus'],
  ['solon', 'solon', 'Solon'],
  ['dartus', 'dartus', 'Dartus'],
  ['tamar', 'tamar', 'Tamar'],
  // Book II, Part I, Chapter V. The longer phrase wins. A shared word stays
  // on the man already named, or on the new record the phrase names.
  ['yet amos doth', 'amos', 'Amos'],
  ['miriam or mary', 'miriam', null],
  ['iair the sonne of manasse', 'iair-son-of-manasse', 'Iair'],
  ['iehu the sonne of hanani', 'jehu-son-of-hanani', 'Iehu'],
  ['zimri, a prince of the simconites', 'zimri-of-simeon', 'Zimri'],
  ['balac peor', 'balak', null],
  ['rabbi salomon', 'rab-solomon', 'Rabbi Salomon'],
  ['rabbi achiba', 'achiba', 'Rabbi Achiba'],
  ['ahia silonites', 'ahia-silonites', 'Ahia Silonites'],
  ['ciccus asculanus', 'ciccus-asculanus', 'Ciccus Asculanus'],
  ['ieedo the seer', 'ieedo', 'Ieedo'],
  ['concerning manasse', 'manasses', null],
  ['sonne of manasse', 'manasseh', null],
  ['halfe tribe of manasse', 'manasseh', null],
  ['regiments of manasse', 'manasseh', null],
  ['israel gaue to his children', 'jacob', null],
  ['s. augustine', 'augustine', null],
].sort((a, b) => b[0].length - a[0].length);

const SHORT = new Set(['og', 'uz', 'dan', 'lot', 'job', 'iob', 'gog', 'lud', 'put', 'hul', 'ham', 'shem', 'sem', 'noe', 'eva', 'eve', 'seth', 'adam', 'saul', 'cain', 'abel', 'ira', 'io']);

function uvSwap(w) {
  return w.replace(/[uv]/g, (ch) => (ch === 'u' ? 'v' : 'u'));
}
function ijSwap(w) {
  if (w.startsWith('j')) return `i${w.slice(1)}`;
  if (/^i[aeiou]/.test(w)) return `j${w.slice(1)}`;
  return w;
}
function aliasKeys(word) {
  const w = String(word || '').toLowerCase().replace(/[^a-z'-]/g, '');
  if (!w) return [];
  const keys = new Set();
  for (const a of [w, uvSwap(w)]) {
    keys.add(a);
    keys.add(ijSwap(a));
    keys.add(uvSwap(ijSwap(a)));
  }
  return [...keys].filter((k) => k.length >= 2);
}
function groupKey(word) {
  return word.toLowerCase().replace(/[^a-z]/g, '').replace(/v/g, 'u').replace(/^i(?=[aeiou])/, 'j');
}
function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const tokenAlias = new Map();
const collisions = new Set();
function registerToken(token, id) {
  if (!id || BLOCK.has(token)) return;
  for (const key of aliasKeys(token)) {
    if (BLOCK.has(key) || STOP.has(key)) continue;
    if (collisions.has(key)) continue;
    const prev = tokenAlias.get(key);
    if (prev && prev !== id) {
      collisions.add(key);
      tokenAlias.delete(key);
      continue;
    }
    tokenAlias.set(key, id);
  }
}

function addName(raw, id) {
  const name = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!name) return;
  const before = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const words = before.split(/\s+/);
  if (words.length === 1) registerToken(words[0], id);
  else if (words.length <= 6) {
    /* phrase aliases are the full title; single tokens of a multi-word title are not aliases */
  }
  if (/^the\s+/i.test(before) && before.split(/\s+/).length === 2) registerToken(before.split(/\s+/)[1], id);
  const paren = name.match(/\(([^)]+)\)/);
  if (paren && !/son of|daughter of|kjv|brother of/i.test(paren[1]) && !paren[1].includes(' ')) registerToken(paren[1], id);
}

for (const doc of people.values()) {
  addName(doc.title, doc.id);
  for (const alt of doc.alt_names || []) {
    for (const part of String(alt).split(/[,;]/)) addName(part.trim(), doc.id);
  }
}
for (const person of nameDoc.people || []) {
  if (!people.has(person.id)) continue;
  for (const form of person.forms || []) {
    if (form.script === 'latin' && form.form && form.form.length <= 40) registerToken(form.form, person.id);
  }
}
for (const [token, id] of Object.entries(FORCE)) {
  if (id == null) {
    for (const key of aliasKeys(token)) {
      BLOCK.add(key);
      tokenAlias.delete(key);
      collisions.add(key);
    }
    continue;
  }
  registerToken(token, id);
}

const phraseRes = PHRASES.map(([phrase, id, title]) => ({
  phrase, id, title,
  re: new RegExp(`(?:^|[^A-Za-z])(${escapeReg(phrase)})(?![A-Za-z])`, 'gi'),
}));

function findPhrases(text) {
  const spans = [];
  const hits = [];
  for (const item of phraseRes) {
    item.re.lastIndex = 0;
    let m;
    while ((m = item.re.exec(text))) {
      const start = m.index + m[0].length - m[1].length;
      const end = start + m[1].length;
      if (spans.some(([a, b]) => start < b && end > a)) continue;
      spans.push([start, end]);
      if (item.id) hits.push({ id: item.id, title: item.title, surface: m[1], start, end });
    }
  }
  return { spans, hits };
}

const HONORIFIC = new Set(['s', 'st', 'saint', 'sir', 'duke', 'earle', 'earl', 'lord', 'king', 'queene', 'queen', 'prince', 'countesse', 'countess', 'don', 'captaine', 'captain']);

function wordHits(text, spans) {
  const hits = [];
  const re = /[A-Za-z][A-Za-z'-]*/g;
  let m;
  let prev = '';
  while ((m = re.exec(text))) {
    const start = m.index;
    const end = start + m[0].length;
    const surface = m[0];
    const token = surface.toLowerCase().replace(/[^a-z'-]/g, '');
    const precededByHonorific = HONORIFIC.has(prev.toLowerCase().replace(/[^a-z]/g, ''));
    prev = surface;
    if (spans.some(([a, b]) => start < b && end > a)) continue;
    const key = groupKey(surface);
    if (!token || STOP.has(token) || STOP.has(key) || BLOCK.has(token) || BLOCK.has(key)) continue;
    const allCaps = surface === surface.toUpperCase() && /[A-Z]/.test(surface);
    const forced = Object.prototype.hasOwnProperty.call(FORCE, token) || Object.prototype.hasOwnProperty.call(FORCE, key);
    const titleCase = /^[A-Z][a-z'-]+$/.test(surface);
    // Small caps are names. A title-case word counts when it follows an honorific,
    // or when a spelling map already sends it to a person. Ordinary capitals do not.
    if (!allCaps && !forced && !(titleCase && precededByHonorific)) continue;
    if (!allCaps && surface.length < 4 && !SHORT.has(token) && !SHORT.has(key) && !forced) continue;
    if (allCaps && surface.length < 3 && !SHORT.has(token) && !SHORT.has(key)) continue;
    const id = tokenAlias.get(token) || tokenAlias.get(key) || tokenAlias.get(uvSwap(token)) || null;
    hits.push({ id, surface, token, key, start, end });
    // "AMPHITES and Telchius": a title-case name beside a small-caps name.
    if (allCaps) {
      const ahead = text.slice(end).match(/^\s*(?:,|and|&)\s+([A-Z][a-z'-]{4,})/);
      if (ahead) {
        const surface2 = ahead[1];
        const start2 = end + ahead[0].length - surface2.length;
        const end2 = start2 + surface2.length;
        if (!spans.some(([a, b]) => start2 < b && end2 > a)) {
          const token2 = surface2.toLowerCase().replace(/[^a-z'-]/g, '');
          const key2 = groupKey(surface2);
          if (token2 && !STOP.has(token2) && !STOP.has(key2) && !BLOCK.has(token2) && !BLOCK.has(key2)) {
            const id2 = tokenAlias.get(token2) || tokenAlias.get(key2) || tokenAlias.get(uvSwap(token2)) || null;
            hits.push({ id: id2, surface: surface2, token: token2, key: key2, start: start2, end: end2 });
          }
        }
      }
    }
  }
  return hits;
}

const buckets = new Map();
const surfacesOn = new Map();
function noteSurface(id, surface, passage) {
  if (!surfacesOn.has(id)) surfacesOn.set(id, new Map());
  const map = surfacesOn.get(id);
  map.set(surface, (map.get(surface) || 0) + 1);
  if (!buckets.has(id) && !people.has(id)) buckets.set(id, { id, surfaces: new Map(), passages: [] });
  const bucket = buckets.get(id);
  if (bucket) {
    bucket.surfaces.set(surface, (bucket.surfaces.get(surface) || 0) + 1);
    bucket.passages.push(passage);
  }
}

const resolved = new Map();
for (const passage of passages) {
  const { spans, hits } = findPhrases(passage.passage);
  const words = wordHits(passage.passage, spans);
  const ids = new Set();
  for (const hit of hits) {
    if (!hit.id) continue;
    if (people.has(hit.id)) ids.add(hit.id);
    else {
      ids.add(hit.id);
      noteSurface(hit.id, hit.surface, passage);
      if (!buckets.has(hit.id)) buckets.set(hit.id, { id: hit.id, surfaces: new Map(), passages: [], title: hit.title });
      const b = buckets.get(hit.id);
      b.title = b.title || hit.title;
      b.surfaces.set(hit.surface, (b.surfaces.get(hit.surface) || 0) + 1);
      b.passages.push(passage);
    }
    noteSurface(hit.id, hit.surface, passage);
  }
  for (const hit of words) {
    if (hit.id) {
      ids.add(hit.id);
      noteSurface(hit.id, hit.surface, passage);
    } else {
      const forced = FORCE[hit.token] || FORCE[hit.key];
      const id = forced || null;
      if (id) {
        ids.add(id);
        noteSurface(id, hit.surface, passage);
      } else if (people.has(hit.key)) {
        ids.add(hit.key);
        noteSurface(hit.key, hit.surface, passage);
      } else if (!STOP.has(hit.key) && (hit.surface.length >= 4 || SHORT.has(hit.token))) {
        const allCaps = hit.surface === hit.surface.toUpperCase();
        const titleCase = /^[A-Z][a-z'-]+$/.test(hit.surface);
        // A contents heading is ordinary sentence case. It is not a list of names.
        if (!(allCaps || titleCase)) continue;
        if (!buckets.has(hit.key)) buckets.set(hit.key, { id: null, surfaces: new Map(), passages: [], title: null });
        const b = buckets.get(hit.key);
        b.surfaces.set(hit.surface, (b.surfaces.get(hit.surface) || 0) + 1);
        b.passages.push(passage);
        ids.add(`new:${hit.key}`);
      }
    }
  }
  resolved.set(passage.id, ids);
}

function chooseTitle(bucket) {
  if (bucket.title) return bucket.title;
  const ranked = [...bucket.surfaces.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length);
  const mixed = ranked.find(([s]) => s !== s.toUpperCase() && /[A-Z]/.test(s));
  const surface = (mixed || ranked[0])[0];
  if (surface !== surface.toUpperCase()) return surface.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
  const key = groupKey(surface);
  return key.charAt(0).toUpperCase() + key.slice(1);
}

const created = [];
const newIds = new Map();
for (const [key, bucket] of buckets) {
  const title = chooseTitle(bucket);
  let id = bucket.id || slug(title);
  if (people.has(key)) continue;
  if (!id || id.length < 2) continue;
  if (people.has(id)) {
    newIds.set(key, id);
    registerToken(title, id);
    for (const surface of bucket.surfaces.keys()) registerToken(surface, id);
    continue;
  }
  if ([...people.keys()].includes(id)) continue;
  let n = 2;
  const base = id;
  while (people.has(id) || created.some((c) => c.id === id)) id = `${base}-${n++}`;
  bucket.id = id;
  bucket.title = {
    'nonius-marcellus': 'Nonius Marcellus',
    zerah: 'Zerah',
    vatablus: 'Vatablus',
    viues: 'Viues',
    'sixtus-senensis': 'Sixtus Senensis',
    'julius-africanus': 'Iulius Africanus',
    'alexander-polyhistor': 'Alexander Polyhistor',
    hostanes: 'Hostanes',
    polychronius: 'Polychronius',
    theophilus: 'Theophilus',
    gemisthius: 'Gemisthius',
    caluin: 'Caluin',
    foelix: 'M. Foelix',
    rhenanus: 'B. Rhenanus',
    serenus: 'Serenus Abbas',
    auornathan: 'Rabbi Auornathan',
    'archangelus-de-burgo': 'Archangelus de Burgo',
    'simon-magus': 'Simon Magus',
    derceta: 'Derceta',
    adimantus: 'Adimantus',
    dion: 'Dion',
    'dion-neapolites': 'Dion Neapolites',
    'guilandinus-melchior': 'Guilandinus Melchior',
    busiris: 'Busiris',
    'sesostris-the-blinde': 'Sesostris the blinde',
    rathoris: 'Rathoris',
    chencres: 'Chencres',
    cherres: 'Cherres',
    'william-of-tyre': 'William, Archbishop of Tyre',
    'lybia-daughter-of-epaphus': 'Lybia',
    themosis: 'Themosis',
    amenophis: 'Amenophis',
    vaphres: 'Vaphres',
    telegonus: 'Telegonus',
    krentzhemius: 'Krentzhemius',
    ortelius: 'Ortelius',
    aventinus: 'Auentinus',
    putiphar: 'Putiphar',
    asenath: 'Asenath',
    phicol: 'Phicol',
    ioab: 'Ioab',
    hadad: 'Hadad',
    abner: 'Abner',
    dardanus: 'Dardanus',
    pheron: 'Pheron',
    baeon: 'Baeon',
    apochis: 'Apochis',
    bunting: 'Bunting',
    lynceus: 'Lynceus',
    hypermnestra: 'Hypermnestra',
    agenor: 'Agenor',
    io: 'Io',
    sanchoniathon: 'Sanchoniathon',
    polemon: 'Polemon',
    numenius: 'Numenius',
    artapanus: 'Artapanus',
    saphrus: 'Saphrus',
    orthopolis: 'Orthopolis',
    criasus: 'Criasus',
    mamelus: 'Mamelus',
    pharetates: 'Pharetates',
    hegesippus: 'Hegesippus',
    brochard: 'Brochard',
    zeigler: 'Zeigler',
    tudalensis: 'Tudalensis',
    'ptolemy-of-mendes': 'Ptolomie a Priest of Mendes',
    'ptolemy-philopator': 'Ptolomie Philopater',
    'baldwin-the-third': 'Baldwin the third',
    osorius: 'Osorius',
    phagius: 'Phagius',
    philostratus: 'Philostratus',
    artemidorus: 'Artemidorus',
    iuba: 'Iuba',
    salmanassar: 'Salmanassar',
    'steaen-gama': 'Steaen Gama',
    castro: 'Castro',
    'richard-hacluit': 'Richard Hacluit',
    'iohannes-barros': 'Iohannes Barros',
    genebrard: 'Genebrard',
    sigonius: 'Sigonius',
    'demetrius-phalereus': 'Demetrius Phalereus',
    harpalus: 'Harpalus',
    meton: 'Meton',
    calippus: 'Calippus',
    hipparchus: 'Hipparchus',
    'gregorie-xiii': 'Pope Gregorie the 13',
    aminadab: 'Aminadab',
    'clemens-alexandrinus': 'Clemens Alexandrinus',
    apollonius: 'Apollonius',
    antonius: 'Antonius',
    mahomet: 'Mahomet',
    'lysimachus-writer': 'Lysimachus',
    'joseph-husband-of-mary': 'Ioseph',
    'virgin-mary': 'Virgin Mary',
    'sephora-midwife': 'Sephora',
    thua: 'Thua',
    perseus: 'Perseus',
    andromeda: 'Andromeda',
    'heber-the-kenite': 'Heber the Kenite',
    'monsieur-de-fumet': 'Monsieur de Fumet',
    dartus: 'Dartus',
    'baldwin-the-first': 'Baldwine the first',
    solon: 'Solon',
    hooker: 'Hooker',
    reinerius: 'Reinerius',
    antoninus: 'Antoninus',
    valentia: 'Valentia',
    tamar: 'Tamar',
    bracton: 'Bracton',
    'iulian-jurist': 'Iulian the jurist',
    'adrian-the-emperor': 'Adrian the Emperour',
    papyrius: 'Papyrius',
    tarquin: 'Tarquin',
    'servius-tullius': 'Seruius Tullius',
    modestinus: 'Modestinus',
    justinian: 'Iustinian',
    willet: 'Willet',
    fortescue: 'Fortescue',
    'prince-edward': 'Prince Edward',
    danaeus: 'Danaeus',
    naason: 'Naason',
    nethaneel: 'Nethaneel',
    eliab: 'Eliab',
    eliasaph: 'Eliasaph',
    gamliel: 'Gamliel',
    abidam: 'Abidam',
    ahiezer: 'Ahiezer',
    pagiel: 'Pagiel',
    ahira: 'Ahira',
    korah: 'Korah',
    dathan: 'Dathan',
    abiram: 'Abiram',
    gershan: 'Gershan',
    elizaphan: 'Elizaphan',
    merari: 'Merari',
    zuriel: 'Zuriel',
    eleazar: 'Eleazar',
    arad: 'Arad',
    amos: 'Amos',
    adrichomius: 'Adrichomius',
    sehon: 'Sehon',
    zippor: 'Zippor',
    fonseca: 'Fonseca',
    vaheb: 'Vaheb',
    thaddaeus: 'Thaddaeus',
    achiba: 'Rabbi Achiba',
    theodoretus: 'Theodoretus',
    'ahia-silonites': 'Ahia Silonites',
    nathan: 'Nathan',
    ieedo: 'Ieedo',
    iddo: 'Iddo',
    shemaiah: 'Shemaiah',
    'jehu-son-of-hanani': 'Iehu',
    hanani: 'Hanani',
    'ciccus-asculanus': 'Ciccus Asculanus',
    arbah: 'Arbah',
    'iair-son-of-manasse': 'Iair',
    phineas: 'Phineas',
    'zimri-of-simeon': 'Zimri',
    cosbi: 'Cosbi',
    eui: 'Eui',
    rekem: 'Rekem',
    zur: 'Zur',
    hur: 'Hur',
    reba: 'Reba',
    moloch: 'Moloch',
  }[id] || title;
  newIds.set(key, id);
  created.push(bucket);
  registerToken(title, id);
  for (const surface of bucket.surfaces.keys()) registerToken(surface, id);
}

// Second pass now that new aliases exist. Rebuild account sets from scratch.
const accounts = new Map();
const SPECIAL = new Set(['abimelech-of-gerar', 'lamech-cainite', 'haran-son-of-terah', 'midian-son-of-abraham', 'oleaster', 'lybia-daughter-of-epaphus', 'sephora-midwife', 'thua', 'joseph-husband-of-mary', 'virgin-mary', 'perseus', 'andromeda', 'hanani', 'amos']);
function addAccount(id, passage) {
  if (!id || String(id).startsWith('new:')) return;
  if (!people.has(id) && !created.some((c) => c.id === id) && !events.has(id) && !SPECIAL.has(id)) return;
  if (!accounts.has(id)) accounts.set(id, []);
  const list = accounts.get(id);
  if (!list.includes(passage.id)) list.push(passage.id);
}

for (const passage of passages) {
  const { spans, hits } = findPhrases(passage.passage);
  for (const hit of hits) if (hit.id) addAccount(hit.id, passage);
  for (const hit of wordHits(passage.passage, spans)) {
    const id = hit.id || tokenAlias.get(hit.token) || tokenAlias.get(hit.key) || newIds.get(hit.key) || (people.has(hit.key) ? hit.key : null);
    if (id) addAccount(id, passage);
  }
  const t = passage.passage.toLowerCase();
  const sons = /\b(noah|shem|sem|iaphet|japheth|japhet)\b/.test(t);
  if (/\b(ham|cham)\b/.test(t)) {
    if (sons) addAccount('ham', passage);
    else if (/\b(egypt|aegypt)\b/.test(t) && /\bcham\b/.test(t)) addAccount('cham', passage);
  }
  // Book II, Part I, Chapter II is the Egyptian Cham. Every Cham in that chapter
  // is the table king, including the heading that names him without the word Egypt.
  if (passage.book === '2' && passage.chapter === '2' && /\bcham\b/.test(t)) {
    addAccount('cham', passage);
  }
  if (/\babimelech\b/.test(t) || /\babimelec\b/.test(t)) {
    if (/gerar|philistim/.test(t)) addAccount('abimelech-of-gerar', passage);
    else if (/gideon/.test(t)) addAccount('abimelech-son-of-gideon', passage);
  }
  if (/\b(sheba)\b/.test(t)) {
    const jok = /\b(joktan|ioctan)\b/.test(t);
    const ra = /\b(raamah|raama)\b/.test(t);
    if (jok && !ra) addAccount('sheba-son-of-joktan', passage);
    else if (ra && !jok) addAccount('sheba-son-of-raamah', passage);
  }
  if (/\b(havilah|hauilah)\b/.test(t)) {
    const jok = /\b(joktan|ioctan)\b/.test(t);
    const cu = /\b(cush|chus|chush)\b/.test(t);
    if (jok && !cu) addAccount('havilah-son-of-joktan', passage);
    else if (cu && !jok) addAccount('havilah-son-of-cush', passage);
  }
  if (/\blamech\b/.test(t) && /\b(irad|mehujael|methusael|methvsael)\b/.test(t)) addAccount('lamech-cainite', passage);
  // Haran the son of Terah. The city of the same name stays unattached.
  if (/\bharan\b/.test(t) && (
    /\bbeg[oa]t\b.{0,80}\bharan\b/.test(t)
    || /haran was the (elder|eldest)/.test(t)
    || /parent of lot, sarah, and milcah/.test(t)
    || /brother of haran/.test(t)
    || /brother haran/.test(t)
    || /haran, who died/.test(t)
    || /harans daughters/.test(t)
    || /daughters of their brother/.test(t)
    || /haran fuit iunior/.test(t)
    || /haran must haue begotten/.test(t)
    || /must haran beget/.test(t)
    || /not of nahor and haran/.test(t)
    || (/(nahor|nachor) and haran/.test(t) && /bethuel|milcah|idolaters|rebecca|parents/.test(t))
  )) {
    addAccount('haran-son-of-terah', passage);
    noteSurface('haran-son-of-terah', 'Haran', passage);
  }
  // Midian the son of Keturah. The land Midian stays unattached.
  if (/zimron, iockshan, medan, midian, ishbak, and shuah/.test(t)) {
    addAccount('midian-son-of-abraham', passage);
    noteSurface('midian-son-of-abraham', 'Midian', passage);
  }
  // Oleaster the writer. The tree of that name stays unattached.
  if (/caietan, oleaster, musculus/.test(t)) {
    addAccount('oleaster', passage);
    noteSurface('oleaster', 'Oleaster', passage);
  }
  if (/iuda and ioseph of iacob/.test(t)) addAccount('judah', passage);
  if (/lybia, who had/.test(t)) {
    addAccount('lybia-daughter-of-epaphus', passage);
    noteSurface('lybia-daughter-of-epaphus', 'Lybia', passage);
  }
  // Sephora the midwife is not Zipporah. The phrase above keeps sephora on Zipporah everywhere else.
  if (/sephora and thua/.test(t)) {
    addAccount('sephora-midwife', passage);
    addAccount('thua', passage);
    noteSurface('sephora-midwife', 'Sephora', passage);
    noteSurface('thua', 'Thua', passage);
  }
  // Joseph the husband is not the patriarch. The phrase above keeps the other Ioseph on joseph.
  if (/ioseph and the virgin mary/.test(t)) {
    addAccount('joseph-husband-of-mary', passage);
    addAccount('virgin-mary', passage);
    noteSurface('joseph-husband-of-mary', 'Ioseph', passage);
    noteSurface('virgin-mary', 'Virgin Mary', passage);
  }
  // Erythraeus’s father. The Macedonian Perseus in the contents is a different man and is not attached.
  if (/perseus and andromeda/.test(t)) {
    addAccount('perseus', passage);
    addAccount('andromeda', passage);
    noteSurface('perseus', 'Perseus', passage);
    noteSurface('andromeda', 'Andromeda', passage);
  }
  // Hanani is inside the Iehu phrase, so the word pass does not see him.
  if (/iehu the sonne of hanani/.test(t)) {
    addAccount('hanani', passage);
    noteSurface('hanani', 'Hanani', passage);
  }
  // The prophet Amos. The Cory king amos-d18 keeps the passages he already has.
  // These sentences are added to the prophet. They are not removed from the king.
  if (/\b(prophet amos|amos remembreth|of amos|saith amos|yet amos doth)\b/.test(t)) {
    addAccount('amos', passage);
    noteSurface('amos', 'Amos', passage);
  }
  // Horites descended of Cham. The token Cham stays blocked. This sentence is Ham.
  if (passage.book === '2' && passage.chapter === '5' && /descended of cham/.test(t)) {
    addAccount('ham', passage);
  }
}

// Events the covered text discusses.
function addEvent(id, pred) {
  for (const passage of passages) if (pred(passage)) addAccount(id, passage);
}
addEvent('creation-week', (p) => (p.kind === 'body' && p.book === '1' && p.chapter === '1') || (p.kind === 'contents' && p.book === '1' && /Chapter I,/.test(p.citation)));
addEvent('the-flood', (p) => {
  // Chapter III, §. IX uses "the floud" for the Red Sea tide. That is not Noah's Flood.
  if (p.book === '2' && p.chapter === '3') return false;
  return /generall floud|vniuersall floud|universall floud|floud of noah|noahs floud|after the floud|before the floud|great inundation|\bthe floud\b/i.test(p.passage);
});
addEvent('founding-of-babel', (p) => /babel|babell|confusion of tongues|confusion of languages|towre of babel|tower of babel/i.test(p.passage));
addEvent('flood-of-ogyges', (p) => /\bogyges\b|\bogygis\b|\bogyge\b/i.test(p.passage));
addEvent('founding-of-rome', (p) => /3280/.test(p.passage) && /rome/i.test(p.passage));
addEvent('nimrod-builds-nineveh', (p) => {
  if (p.book !== '1' || p.kind !== 'body' || Number(p.chapter) < 9 || Number(p.chapter) > 12) return false;
  if (!/nimrod/i.test(p.passage) || !/niniue/i.test(p.passage)) return false;
  // §. III is the argument that Nimrod, not Assur, built Nineveh.
  // The other hits are the sentences that say he built it or began it.
  if (/Chapter X, §\. III/.test(p.citation)) return true;
  return /begun by nimrod|built niniue|aedificauit niniuen|built foure more cities/i.test(p.passage);
});
addEvent('exodus', (p) => {
  if (p.book !== '2' || p.chapter !== '2' || p.kind !== 'body') return false;
  return /deliuerie of the israelites|departure of israel out of aegypt|departed aegypt|out of aegypt|red sea|drowned in the red sea|israel deliuered/i.test(p.passage);
});
addEvent('jacob-enters-egypt', (p) => {
  if (p.book !== '2' || p.chapter !== '2' || p.kind !== 'body') return false;
  return /iacob came into aegypt|israels comming into aegypt|send for his father|iacob died/i.test(p.passage);
});
addEvent('joseph-made-vizier', (p) => {
  if (p.book !== '2' || p.chapter !== '2' || p.kind !== 'body') return false;
  return /aduancement of ioseph|aduanced ioseph|set thee ouer all the land of aegypt|iosephs aduancement/i.test(p.passage);
});
addEvent('joseph-sold-into-egypt', (p) => {
  if (p.book !== '2' || p.chapter !== '2' || p.kind !== 'body') return false;
  return /iosephs being sold|putiphar who bought him|buying ioseph/i.test(p.passage);
});
addEvent('moses-birth', (p) => {
  if (p.book !== '2' || p.chapter !== '2' || p.kind !== 'body') return false;
  return /birth of moses|moses was borne|tooke vp moses|tooke moses out of the water/i.test(p.passage);
});
addEvent('mizraim-settles-egypt', (p) => {
  if (p.book !== '2' || p.chapter !== '2' || p.kind !== 'body') return false;
  return /began his reigne in aegypt|tooke possession of the countrie|himselfe did first plant it|cham began his reigne/i.test(p.passage);
});
// Book II, Part I, Chapter III. The calendar digression is not the Exodus.
addEvent('exodus', (p) => {
  if (p.book !== '2' || p.chapter !== '3' || p.kind !== 'body') return false;
  return /deliuery of israel out of aegypt|pursuit of the israelites|passage ouer the red sea|passage through the red sea|passeouer|red sea|led israel out of aegypt|led the people of god out of aegypt|remooued, and on their way|passages leading out of aegypt|aegyptians whom yee haue seene|pharaoh followed him|forefathers had throwne/i.test(p.passage);
});
addEvent('moses-birth', (p) => {
  if (p.book !== '2' || p.chapter !== '3' || p.kind !== 'body') return false;
  return /time of moses birth|time of moses his birth|birth of moses|moses was borne|sephora and thua|arke of reedes|moses his preseruation|moses liued in the time|moses was farre more ancient|moses liued after the troian/i.test(p.passage);
});
addEvent('moses-flees-to-midian', (p) => {
  if (p.book !== '2' || p.chapter !== '3' || p.kind !== 'body') return false;
  return /flying out of aegypt|fled into arabia|40\. yeere of moses age|neere madian, hee consumed 40/i.test(p.passage);
});
addEvent('burning-bush', (p) => {
  if (p.book !== '2' || p.chapter !== '3' || p.kind !== 'body') return false;
  return /calling backe into aegypt by the angel of god/i.test(p.passage);
});
// Book II, Part I, Chapter IV. The law discourse is not a new event.
addEvent('exodus', (p) => {
  if (p.book !== '2' || p.chapter !== '4' || p.kind !== 'body') return false;
  return /passeouer|past the red sea|pharaoh and his armie|remoued from the generall assembly|led israel out of aegypt/i.test(p.passage);
});
addEvent('moses-birth', (p) => {
  if (p.book !== '2' || p.chapter !== '4' || p.kind !== 'body') return false;
  return /moses was borne in the yeere of the world 2434/i.test(p.passage);
});
addEvent('moses-flees-to-midian', (p) => {
  if (p.book !== '2' || p.chapter !== '4' || p.kind !== 'body') return false;
  return /fled into midian when he had liued/i.test(p.passage);
});
addEvent('arrival-at-sinai', (p) => {
  if (p.book !== '2' || p.chapter !== '4' || p.kind !== 'body') return false;
  return /spent in the desart of sinai|law by the angell of god was giuen|world had stood 2513|incamped thereabout almost a yeare/i.test(p.passage);
});
addEvent('wilderness-wanderings', (p) => /wandered 40 yeare/i.test(p.passage));
addEvent('fall-of-troy', (p) => /fall of troy|troy itselfe was cast downe/i.test(p.passage));
addEvent('twelve-tables', (p) => /decem-viri, 303|twelue tables|twelve tables/i.test(p.passage));
// Book II, Part I, Chapter V. The first spy visit to Kadesh-barnea is not the return.
addEvent('wilderness-wanderings', (p) => {
  if (p.book !== '2' || p.chapter !== '5') return false;
  if (p.kind !== 'body' && p.kind !== 'head') return false;
  return /consumed 38\. yeeres|fortieth yeere|nine and thirtieth yeere|marches through the wildernesse/i.test(p.passage);
});
addEvent('return-to-kadesh', (p) => {
  if (p.book !== '2' || p.chapter !== '5') return false;
  if (p.kind !== 'body' && p.kind !== 'head') return false;
  return /wildernesse of zin, which is kadesh|zin kades/i.test(p.passage);
});
addEvent('sihon-of-heshbon-conquered', (p) => {
  if (p.book !== '2' || p.chapter !== '5') return false;
  const t = p.passage.toLowerCase();
  if (!/\b(sehon|schon|sihon)\b/.test(t)) return false;
  return /warre|iahaz|amorite/.test(t);
});
addEvent('tabernacle-set-up', (p) => {
  if (p.book !== '2' || p.chapter !== '5') return false;
  return /finished the tabernacle/i.test(p.passage);
});
addEvent('moses-birth', (p) => {
  if (p.book !== '2' || p.chapter !== '5' || p.kind !== 'body') return false;
  return /male-children of the hebrewes to be slaine|preserue that child/i.test(p.passage);
});
addEvent('moses-flees-to-midian', (p) => {
  if (p.book !== '2' || p.chapter !== '5' || p.kind !== 'body') return false;
  return /mooued him to flie into midian|flie into midian/i.test(p.passage);
});
addEvent('burning-bush', (p) => {
  if (p.book !== '2' || p.chapter !== '5' || p.kind !== 'body') return false;
  return /appearing vnto him, he made him know his will/i.test(p.passage);
});
addEvent('exodus', (p) => {
  if (p.book !== '2' || p.chapter !== '5' || p.kind !== 'body') return false;
  return /ouerthrow of pharao|horse, and chariots/i.test(p.passage);
});
for (const event of events.values()) {
  for (const entry of event.chronologies || []) {
    if (entry.source !== SRC || !entry.date) continue;
    const quote = normalizeWs(entry.date);
    if (quote.length < 24) continue;
    for (const passage of passages) if (passage.passage.includes(quote)) addAccount(event.id, passage);
  }
}

// Drop new people who received no passage.
const createdKept = created.filter((b) => (accounts.get(b.id) || []).length > 0);
for (const bucket of created) {
  if (!createdKept.includes(bucket)) accounts.delete(bucket.id);
}

function passageById(id) {
  return passages.find((p) => p.id === id);
}
function earliestPassage(id) {
  const ids = accounts.get(id) || [];
  let best = null;
  for (const pid of ids) {
    const p = passageById(pid);
    if (!best || p.order < best.order) best = p;
  }
  return best;
}
function isBackfill(p) {
  if (!p) return false;
  if (p.kind === 'preface' || p.kind === 'contents') return true;
  if (p.book === '2') return false;
  return p.kind === 'body' && Number(p.chapter) < 8;
}

function cite(p) {
  return `Raleigh, The History of the World (1617, EEBO-TCP A10357), ${p.citation}`;
}
function cfahNull() {
  return { source: 'cfah', date: null, year_am: null, year_bc_ad: null, precision: 'unknown', citation: null, link: null, note: 'pending CFAH reference' };
}
function raleighEntry(date, yearAm, precision, citation, note) {
  return {
    source: SRC, date, year_am: yearAm, year_bc_ad: null, precision, citation, link: LINK, source_text_id: SRC_ID, note,
  };
}
function mustSlice(id, needle) {
  const ids = accounts.get(id) || [];
  for (const pid of ids) {
    const p = passageById(pid);
    if (p.passage.includes(needle)) return { passage: p, date: needle };
  }
  return null;
}

const EXTRA = {};
const decBirth = mustSlice('deucalion', 'Now Deucalion was borne in the yeere of the World 2356.');
const decSum = mustSlice('deucalion', '( which added to 2356. make 2438.)');
const decLen = mustSlice('deucalion', 'his Floud was after Noahs Floud ended 782. yeeres.');
const ogyBirth = mustSlice('ogyges', 'was borne 67. yeeres after him');
if (decBirth) {
  EXTRA.deucalion = [
    raleighEntry(decBirth.date, 2356, 'year', cite(decBirth.passage), 'Body intake. His yeere of the World for the birth. The age in the same sentence is illegible (〈◊ 〉), so it is not stored. No flood event was made. See N5.'),
  ];
  if (decSum) EXTRA.deucalion.push(raleighEntry(decSum.date, null, 'year', cite(decSum.passage), 'Body intake. The sum is printed. The age added to 2356 is illegible, so 2438 is not stored as a yeere of the World.'));
  if (decLen) EXTRA.deucalion.push(raleighEntry(decLen.date, null, 'year', cite(decLen.passage), 'Body intake. How many yeeres after Noahs Floud he says this flood ended. Not a yeere of the World, and not an event.'));
}
if (ogyBirth) {
  EXTRA.ogyges = [
    raleighEntry('was borne 67. yeeres after him', null, 'year', cite(ogyBirth.passage), 'Body intake. “him” is Jacob, named in the same sentence. Not a yeere of the World. Not placed on flood-of-ogyges. See N6.'),
  ];
}

// Abimelech of Gerar and the Cainite Lamech, if the special case found passages.
function ensureSpecial(id, title) {
  if (people.has(id) || createdKept.some((b) => b.id === id)) return;
  const ids = accounts.get(id) || [];
  if (!ids.length) return;
  createdKept.push({ id, title, surfaces: new Map([[title, 1]]), passages: ids.map(passageById) });
}
ensureSpecial('abimelech-of-gerar', 'Abimelech of Gerar');
ensureSpecial('lamech-cainite', 'Lamech');
ensureSpecial('christ', 'Christ');
ensureSpecial('haran-son-of-terah', 'Haran');
ensureSpecial('midian-son-of-abraham', 'Midian');
ensureSpecial('oleaster', 'Oleaster');
ensureSpecial('lybia-daughter-of-epaphus', 'Lybia');
ensureSpecial('sephora-midwife', 'Sephora');
ensureSpecial('thua', 'Thua');
ensureSpecial('joseph-husband-of-mary', 'Ioseph');
ensureSpecial('virgin-mary', 'Virgin Mary');
ensureSpecial('perseus', 'Perseus');
ensureSpecial('andromeda', 'Andromeda');
ensureSpecial('hanani', 'Hanani');
ensureSpecial('amos', 'Amos');

function personDoc(bucket) {
  const title = bucket.title;
  const id = bucket.id;
  const first = earliestPassage(id);
  const alts = [...(bucket.surfaces || new Map()).keys()].filter((s) => s.toLowerCase() !== title.toLowerCase()).slice(0, 8);
  const birth = [cfahNull(), ...(EXTRA[id] || [])];
  const summary = id === 'deucalion'
    ? 'Raleigh names Deucalion in the History of the World (1617) and prints a yeere of the World for his birth.'
    : id === 'ogyges'
      ? 'Raleigh names Ogyges in the History of the World (1617) and says he was born 67 yeeres after Jacob.'
      : id === 'christ'
        ? 'Raleigh names Christ in the History of the World (1617).'
        : `Raleigh names ${title} in the History of the World (1617).`;
  let description = `${OURS} Undated in this intake: no yeere of the World was taken from the covered text except where a chronology entry quotes one. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'deucalion') description = `${OURS} He prints the birth in the yeere of the World 2356. The age at the flood of Thessaly is illegible. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ogyges') description = `${OURS} He says Ogyges was born 67 yeeres after Jacob. That figure is not a yeere of the World. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'lamech-cainite') description = `${OURS} The Lamech named with Irad, Mehujael, and Methusael. He is not the Lamech in Seth’s line. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'abimelech-of-gerar') description = `${OURS} The Abimelech of Gerar, king of the Philistines, in Book I, Part I, Chapter VIII. Not Abimelech son of Gideon. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'cecrops') description = `${OURS} The Athenian king he names with Moses. Not Cecrops II, who already has a record from the chronological table. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ianus') description = `${OURS} The Ianus of Italy, kept apart from Noah. A yeere of the World 2717 is printed as some other men's reckoning and was not entered. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'amraphel') description = `${OURS} One of the four kings Abraham overthrew. Raleigh says he may be Ninias, and that the reasons against that are not easily answered. He is kept apart from Ninias. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'arioch') description = `${OURS} King of Ellassar, one of the four kings Abraham overthrew. A later Arioch, who commanded under Nebuchadnezzar, is named in the same chapter and was not made a second record. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'haran-son-of-terah') description = `${OURS} The son of Terah, and the father of Lot, Sarah, and Milcah. The city is the location haran. Passages that name the son were attached. Passages that name only the city were not. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'midian-son-of-abraham') description = `${OURS} A son of Abraham and Keturah, named with Zimron, Iockshan, Medan, Ishbak, and Shuah. The land is the location midian, and it was not attached. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'oleaster') description = `${OURS} The writer named with Caietan and Musculus. The tree Jerome calls Oleaster was not attached. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'leuita') description = `${OURS} Named as Leuita, in his Cabala. The printed name was not expanded. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'busiris') description = `${OURS} Busiris or Orus the second, the king he says first oppressed Israel. Kept apart from Orus the son of Osiris. The table prints An. Mundi 2438. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'sesostris-the-blinde') description = `${OURS} Sesostris the blinde, the son of Sesostris the great, also called Pheron. Kept apart from his father. The table prints An. Mundi 2424. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'rathoris') description = `${OURS} Rathoris or Athoris, brother of Queene Thermutis. The table prints An. Mundi 2488. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'chencres') description = `${OURS} Chencres, drowned in the red Sea. The table prints An. Mundi 2497. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'lybia-daughter-of-epaphus') description = `${OURS} Lybia, the daughter of Epaphus, mother of Agenor, Belus, and Busiris in the pedigree. The land Libya was not attached. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'william-of-tyre') description = `${OURS} William, Archbishop of Tyre, who flourished about the yeere of our Lord 1180. That is not a yeere of the World. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'amenophis') description = `${OURS} Amenophis, placed next before Busiris by some, and after Ramesses by others. Kept apart from the Cory eighteenth-dynasty kings of the same name. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'themosis') description = `${OURS} Themosis, whom Eusebius calls Amasis. Kept apart from Amasis II. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'sephora-midwife') description = `${OURS} The midwife Pharaoh sent for with Thua. Not Zipporah, whose printed name Sephora stays on zipporah. No yeere of the World was taken for her. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'thua') description = `${OURS} The midwife named with Sephora. No yeere of the World was taken for her. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'joseph-husband-of-mary') description = `${OURS} The husband of the Virgin Mary, named in the flight from Herod. Not the patriarch Joseph. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'virgin-mary') description = `${OURS} The Virgin Mary, named with Ioseph in the flight from Herod. Not Queen Mary. No yeere of the World was taken for her. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'perseus') description = `${OURS} The father of Erythraeus, named with Andromeda. Not Perseus king of Macedon, who is named in the contents and was not attached. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'andromeda') description = `${OURS} Named with Perseus as a parent of Erythraeus. No yeere of the World was taken for her. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'gregorie-xiii') description = `${OURS} Pope Gregorie the 13, who corrected the Iulian yeere in Anno Domini 1582. Not the Gregorie already on the record. That year is not a yeere of the World. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'artapanus') description = `${OURS} The historian Artapanus, whom he cites on Moses. Not Artabanus. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'demetrius-phalereus') description = `${OURS} Demetrius Phalereus, whose statues Plinie numbers. Not the Macedonian Demetrius. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ptolemy-philopator') description = `${OURS} Ptolomie Philopater, governing Egypt when Onias built the temple. Not the geographer Ptolemy, and not Ptolemy Philadelphus. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ptolemy-of-mendes') description = `${OURS} Ptolomie, a priest of Mendes, whom Appion cites on the birth of Moses. Not the geographer Ptolemy. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'salmanassar') description = `${OURS} The king who carried the Israelites captive to Ilalah. Not Shalmaneser I. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'lysimachus-writer') description = `${OURS} The Lysimachus named with Cornelius Tacitus, who gives the Pharaoh the name Bocchoris. Not the Macedonian Lysimachus of the chronological table. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'antonius') description = `${OURS} The Antonius who gives Zoan the name Thanis. Antonius the Eremite, named earlier, was not attached to this record. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'apollonius') description = `${OURS} The Apollonius of the liues of the Fathers. Other men named Apollonius earlier in the book were not attached. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'mahomet') description = `${OURS} Mahomet, whose town is Mecca. Not Mahomet Aben Alhamar. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'sanchoniathon') description = `${OURS} Sanchoniato, cited by L. Viues on S. Augustine. Not Ilus, who is Kronus in Sanchoniathon. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'polemon') description = `${OURS} Polemon, author of a Greeke Historie. Not Eupolemon. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'saphrus') description = `${OURS} Saphrus, also called Spherus, the Assyrian in whose reign he places the birth of Moses. The chronological-table row for this king was damaged and was not imported. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'steaen-gama') description = `${OURS} Steaen Gama, Viceroy of the East India. The printed spelling Steaen was not corrected. The yeere 1544 names no era and was not stored. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'iuba') description = `${OURS} King Iuba, who names the Red Sea Laeniticum. Not Jubal. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'clemens-alexandrinus') description = `${OURS} Clemens Alexandrinus. A bare Clemens named earlier, with Iustine Martyr and Lactantius, was not folded onto this record. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'heber-the-kenite') description = `${OURS} Heber the Kenite, of the children of Hobab, in Judges 4. Not Eber son of Salah. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'monsieur-de-fumet') description = `${OURS} Monsieur de Fumet of France, named with Peter Belonius on the road to Sinai. Not Anthonie Fume. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'dartus') description = `${OURS} Printed Dartus, who began the canal after Sesostris and before Ptolemie the second. Not folded onto a Darius record. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'baldwin-the-first') description = `${OURS} Baldwine the first, who passed by Helim. Not Baldwin the third. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'solon') description = `${OURS} Solon, from whom the Athenians received their laws. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'hooker') description = `${OURS} Printed M r. Hooker. The name was not expanded. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'reinerius') description = `${OURS} Reinerius, named with Antoninus and Valentia on the natural law. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'antoninus') description = `${OURS} Antoninus, named with Reinerius and Valentia. Not Antonius. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'valentia') description = `${OURS} G. Valentia, the writer named with Reinerius and Antoninus. Not a place. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'tamar') description = `${OURS} The woman against whom Judah gave judgement that she should be burnt. The event amnon-and-tamar was not attached. No yeere of the World was taken for her. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'bracton') description = `${OURS} Bracton, cited on the affection that names a work, and on the king and the law. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'iulian-jurist') description = `${OURS} Iulian the jurist, who interpreted the edicts presented to Adrian the Emperour. Not Julian the Apostate. The one-word title would fold onto julian, so the title is three words. The lex Iulia and the lex Cornelia were not made people. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'adrian-the-emperor') description = `${OURS} Adrian the Emperour, to whom the interpreted edict was presented. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'papyrius') description = `${OURS} Papyrius, who gathered the Regall lawes. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'tarquin') description = `${OURS} Tarquin, then raigning when Papyrius gathered the lawes. That clause was not stored as a reign length. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'servius-tullius') description = `${OURS} Seruius Tullius, whose lawes for commerce and contracts were continued in the twelve tables. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'modestinus') description = `${OURS} Modestinus, who comprehends the effects of the law in two. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'justinian') description = `${OURS} Iustinian, whose collections he sets beside the perpetual edict. Not Justin, and not Justin Martyr. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'willet') description = `${OURS} Master Doctor Willet. The printed name was not expanded. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'fortescue') description = `${OURS} Fortescue, called a bulwarke of our lawes. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'prince-edward') description = `${OURS} Prince Edward, named in Fortescue his discourse. Not Edward the Fourth, and not Edward the Sixth. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'danaeus') description = `${OURS} Danaeus, named among the collectors on the knowledge of God, and again on the agreement of the Testaments. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'iair-son-of-manasse') description = `${OURS} Iair the sonne of Manasse, who named Hauoth Iair. Not the judge Jair. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'jehu-son-of-hanani') description = `${OURS} Iehu the sonne of Hanani, who wrote the acts of Iehossaphat. Not Jehu king of Israel. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'hanani') description = `${OURS} The father named in the phrase Iehu the sonne of Hanani. Not a second man. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'zimri-of-simeon') description = `${OURS} Zimri, a prince of the Simconites, slain with Cosbi. Not Zimri king of Israel, and not Zimri-Lim. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'zippor') description = `${OURS} Zippor, the father of Balac. Not Zipporah. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'amos') description = `${OURS} The prophet Amos, who remembers the worship of Moloch. Not the eighteenth-dynasty king amos-d18. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'sehon') description = `${OURS} Sehon, king of the Amorites, also printed Schon and Sihon. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'vaheb') description = `${OURS} Vaheb, the Moabite king whom Sehon conquered, and the predecessor of Balac. VAHEBVM is the Latin accusative in the same sentence. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'eliasaph') description = `${OURS} Eliasaph, prince of Gad, and the commander named over the company on the west of the Tabernacle. The text does not say they are two men. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'nathan') description = `${OURS} Nathan the Prophet, named with Ahia Silonites and Ieedo the Seer. The contents line that Ioas did not descend from Nathan is the same name. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ieedo') description = `${OURS} Ieedo the Seer, in the second of Chronicles 9. Not identified with Iddo. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'iddo') description = `${OURS} Iddo, named with Shemaiah in the second of Chronicles 12. Not identified with Ieedo the Seer. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'phineas') description = `${OURS} Phineas, the sonne of Eleazar. The same paragraph also says the five Midianite princes were slaine by Eleazar. Both names were attached as printed. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'hur') description = `${OURS} Hur, one of the five Midianite dukes slain with Eui, Rekem, Zur, and Reba. No companion of that name was already on record. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'arbah') description = `${OURS} Arbah, called the Father of the gap, and the greatest man of the Anakims. The gap was not filled. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ahia-silonites') description = `${OURS} Ahia Silonites, who wrote the story of Salomon and foretold the kingdom to the man the gap leaves unnamed. The printed name was not expanded. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'korah') description = `${OURS} Korah, named with Dathan and Abiram in the mutiny. The sonnes of Korah who carried the Sanctuarie were left on this record, and were not moved to Kohath. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'eleazar') description = `${OURS} Eleazar, the sonne of Aaron, who received the priest-hood. The sentence that the five Midianite princes were slaine by Eleazar was left as printed, beside Phineas. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'arad') description = `${OURS} Arad, king of the Canaanites, who set upon Israel at the edge of the Desart. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'fonseca') description = `${OURS} Fonseca, the writer whose route from Mount Hor by the Red Sea he rejects. The printed name was not expanded. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'adrichomius') description = `${OURS} Adrichomius, the geographer he says is deceived about the springs at Gadgad. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'thaddaeus') description = `${OURS} Thaddaeus, whose epistle he says remembers the books of Henoch. The printed name was not changed. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'achiba') description = `${OURS} Rabbi Achiba, on whom others bestow the work of Formation. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'theodoretus') description = `${OURS} Theodoretus, also printed Theodoret. He says the book of Iasher was a commentary upon Iosua. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'shemaiah') description = `${OURS} Shemaiah, named with Iddo. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'ciccus-asculanus') description = `${OURS} Ciccus Asculanus, named with Origen, Iosephus, Hierome, Cedrenus, and Picus Mirandula on the lost books of Salomon. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'moloch') description = `${OURS} Moloch, the idol he says Israel worshipped. Not a man of the camp. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'gershan') description = `${OURS} Gershan, whose sonnes carried parts of the Tabernacle. The printed spelling was not changed. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'merari') description = `${OURS} Merari, whose familie lodged on the north of the Tabernacle under Zuriel. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'eui') description = `${OURS} Eui, one of the five Midianite dukes. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'rekem') description = `${OURS} Rekem, one of the five Midianite dukes. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'zur') description = `${OURS} Zur, one of the five Midianite dukes. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'reba') description = `${OURS} Reba, one of the five Midianite dukes. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'nethaneel') description = `${OURS} Nethaneel, also printed Nathaniel, leader of Issachar. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  if (id === 'naason') description = `${OURS} Naason, also printed Naashon, leader of Iudah. No yeere of the World was taken for him. Display only. No tier 1–4 chronology dates this person, so there is no sort year.`;
  const doc = {
    $schema: '../../schema/person.schema.json',
    id,
    type: 'person',
    title,
    summary,
    description,
    sorting_year: null,
    sorting_basis: {
      tier: 'none',
      tier_rank: null,
      chronology: 'cfah',
      note: 'No tier gives a birth year. Raleigh is display-only.',
    },
    father: null,
    children: [],
    dates: { birth },
    events: [],
    scripture_refs: [],
    sources: [SRC_ID],
    related: [],
    free_source_links: [{ source_id: SRC_ID, url: LINK, locator: first ? first.citation : 'Preface through Book I, Part I, Chapter XII' }],
  };
  if (alts.length) doc.alt_names = alts;
  return doc;
}

function formsFor(id, title) {
  const map = surfacesOn.get(id) || new Map();
  const ranked = [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const person = nameDoc.people.find((p) => p.id === id);
  const stored = new Set((person?.forms || []).map((f) => f.form.toLowerCase()));
  stored.add((title || '').toLowerCase());
  const newNote = book2Through === 5
    ? 'Spelling only. Read in Book II, Part I, Chapter V.'
    : book2Through === 4
    ? 'Spelling only. Read in Book II, Part I, Chapter IV.'
    : book2Through === 3
    ? 'Spelling only. Read in Book II, Part I, Chapter III.'
    : book2Through === 2
    ? 'Spelling only. Read in Book II, Part I, Chapter II.'
    : book2Through === 1
      ? 'Spelling only. Read in Book II, Part I, Chapter I.'
      : 'Spelling only. Read in Book I, Part I, Chapters IX–XII.';
  const alreadyNew = (person?.forms || []).filter((f) => f.source_text_id === SRC_ID && f.note === newNote).length;
  const out = [];
  const held = (accounts.get(id) || []).map(passageById);
  for (const [form] of ranked) {
    if (alreadyNew + out.length >= 8) break;
    if (!form || stored.has(form.toLowerCase())) continue;
    const holder = held.find((p) => p && p.passage.includes(form));
    if (!holder) continue;
    // Earlier passes stored the spellings they read. Add a form only from this pass.
    const inPass = book2Through === 5
      ? holder.kind === 'body' && holder.book === '2' && holder.chapter === '5'
      : book2Through === 4
      ? holder.kind === 'body' && holder.book === '2' && holder.chapter === '4'
      : book2Through === 3
      ? holder.kind === 'body' && holder.book === '2' && holder.chapter === '3'
      : book2Through === 2
      ? holder.kind === 'body' && holder.book === '2' && holder.chapter === '2'
      : book2Through === 1
        ? holder.kind === 'body' && holder.book === '2' && holder.chapter === '1'
        : holder.kind === 'body' && holder.book === '1' && Number(holder.chapter) >= 9;
    if (!inPass) continue;
    // Chapter V phrases include clauses. A spelling is a name, not a sentence.
    if (book2Through === 5 && (!/^[A-Z]/.test(form) || form.split(/\s+/).length > 4 || form.includes(',') || / or /i.test(form) || /^(regiments|halfe tribe|sonne|concerning) /i.test(form))) continue;
    stored.add(form.toLowerCase());
    out.push({ form, citation: `${cite(holder)}. The passage prints “${form}”.`, note: newNote });
  }
  return out;
}

const backfill = createdKept.filter((b) => isBackfill(earliestPassage(b.id)));
const chapterPeople = createdKept.filter((b) => !isBackfill(earliestPassage(b.id)));

const ch8 = passages.filter((p) => p.kind === 'body' && p.chapter === '8');
const ch9at = xml.indexOf('n="9" type="chapter"');
const ch9slice = xml.slice(ch9at, ch9at + 800);
const ch9head = normalizeWs((ch9slice.match(/<head[^>]*>([\s\S]*?)<\/head>/) || [])[1]?.replace(/<[^>]+>/g, ' ') || '');
const beforeCh9 = xml.slice(Math.max(0, ch9at - 30000), ch9at);
const sigs = [...beforeCh9.matchAll(/<pb[^>]*\bn="([^"]+)"/g)].map((m) => m[1]);
const ch9sig = sigs[sigs.length - 1] || '(none)';

const report = {
  passages: passages.length,
  first: passages[0]?.citation,
  last: passages[passages.length - 1]?.citation,
  ch8: ch8.length,
  ch8last: ch8[ch8.length - 1]?.citation,
  ch9sig,
  ch9head,
  created: createdKept.length,
  backfill: backfill.length,
  chapter: chapterPeople.length,
  deucalion: !!decBirth,
  deucalionSum: !!decSum,
  deucalionLen: !!decLen,
  ogyges: !!ogyBirth,
  accounts: accounts.size,
  peopleAccounts: [...accounts.keys()].filter((id) => people.has(id) || createdKept.some((b) => b.id === id)).length,
  eventAccounts: [...accounts.keys()].filter((id) => events.has(id)),
  nineveh: accounts.get('nimrod-builds-nineveh') || [],
  foelix: (accounts.get('foelix') || []).length,
  thomasAquinas: (accounts.get('thomas-aquinas') || []).length,
};
console.log(JSON.stringify(report, null, 2));
console.log('--- new people ---');
for (const b of createdKept.sort((a, c) => a.id.localeCompare(c.id))) {
  const p = earliestPassage(b.id);
  console.log(`${isBackfill(p) ? 'backfill' : `ch${p?.chapter || '?'}`}\t${b.id}\t${b.title}\t${(accounts.get(b.id) || []).length}\t${p?.citation || ''}`);
}

const prevAccounts = readJSON(join(DATA, 'raleigh-accounts.json'));
// Keep every previous account link. Later passes attached some people by
// hand; a rebuild must not drop those passages.
for (const [id, oldIds] of Object.entries(prevAccounts.accounts)) {
  const next = accounts.get(id) || [];
  const seen = new Set(next);
  const merged = [...next];
  for (const pid of oldIds) {
    if (!seen.has(pid)) {
      merged.push(pid);
      seen.add(pid);
    }
  }
  merged.sort((a, b) => (passageById(a)?.order || 0) - (passageById(b)?.order || 0));
  accounts.set(id, merged);
}
const prevById = new Map(prevAccounts.passages.map((p) => [p.id, p]));
let passageDrift = 0;
for (const p of passages) {
  const old = prevById.get(p.id);
  if (!old) continue;
  const signatureEnd = p.signatureEnd || p.signature;
  if (
    old.passage !== p.passage ||
    old.citation !== p.citation ||
    old.signature !== p.signature ||
    old.signature_end !== signatureEnd
  ) passageDrift++;
}
let dropped = 0;
const dropSamples = [];
for (const [id, oldIds] of Object.entries(prevAccounts.accounts)) {
  const next = new Set(accounts.get(id) || []);
  for (const pid of oldIds) {
    if (!next.has(pid)) {
      dropped++;
      if (dropSamples.length < 12) dropSamples.push(`${id} ${pid}`);
    }
  }
}
console.log(`passageDrift ${passageDrift} droppedLinks ${dropped}`);
for (const s of dropSamples) console.log('drop', s);

if (!write) {
  console.log('report only');
  process.exit(0);
}

for (const bucket of createdKept) {
  const path = join(peopleDir, `${bucket.id}.json`);
  if (existsSync(path)) {
    const prev = readJSON(path);
    if (!String(prev.description || '').startsWith(OURS)) throw new Error(`refuse to replace ${bucket.id}`);
    continue;
  }
  writeFileSync(path, `${JSON.stringify(personDoc(bucket), null, 2)}\n`);
}

const formAdds = [];
function pushForms(id, title) {
  for (const made of formsFor(id, title)) {
    formAdds.push({ id, form: {
      form: made.form,
      script: 'latin',
      role: 'alternate',
      witness: 'history',
      citation: made.citation,
      link: LINK,
      source_text_id: SRC_ID,
      note: made.note,
    } });
  }
}
for (const bucket of createdKept) pushForms(bucket.id, bucket.title);
for (const id of people.keys()) {
  if (createdKept.some((b) => b.id === id)) continue;
  pushForms(id, people.get(id).title);
}
for (const add of formAdds) {
  let person = nameDoc.people.find((p) => p.id === add.id);
  if (!person) {
    person = { id: add.id, forms: [] };
    const idx = nameDoc.people.findIndex((p) => p.id > add.id);
    if (idx < 0) nameDoc.people.push(person);
    else nameDoc.people.splice(idx, 0, person);
  }
  if (person.forms.some((f) => f.form.toLowerCase() === add.form.form.toLowerCase() && f.witness === 'history' && f.source_text_id === SRC_ID)) continue;
  person.forms.push(add.form);
}
writeFileSync(join(DATA, 'name-forms.json'), `${JSON.stringify(nameDoc, null, 2)}\n`);

const passageOut = passages.map((p) => ({
  id: p.id,
  order: p.order,
  citation: p.citation,
  signature: p.signature,
  signature_end: p.signatureEnd || p.signature,
  passage: p.passage,
}));
const accountOut = {};
for (const id of [...accounts.keys()].sort()) {
  const ids = accounts.get(id);
  if (!ids.length) continue;
  if (!people.has(id) && !createdKept.some((b) => b.id === id) && !events.has(id)) continue;
  accountOut[id] = ids;
}
writeFileSync(join(DATA, 'raleigh-accounts.json'), `${JSON.stringify({ passages: passageOut, accounts: accountOut }, null, 2)}\n`);
console.log(`wrote ${createdKept.length} people, ${formAdds.length} name forms, ${passageOut.length} passages, ${Object.keys(accountOut).length} accounts`);
