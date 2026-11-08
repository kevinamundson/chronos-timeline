#!/usr/bin/env node
// Covered text of Raleigh's History (1617): Preface, contents, Book I, Part I.
// Rebuilds data/raleigh-accounts.json. With --write, also adds a person record
// for every named individual in that range who does not already have one.
// Undated people get a null CFAH date and no sort year.
//
//   node scripts/raleigh/covered.mjs
//   node scripts/raleigh/covered.mjs --through=12
//   node scripts/raleigh/covered.mjs --through=12 --write
//
// --through is the last Book I, Part I chapter. It cannot be less than 8, because
// passes 1–3 already covered Chapters I–VIII. Book II is not included.
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
if (!Number.isInteger(throughChapter) || throughChapter < 8 || throughChapter > 12) {
  throw new Error('--through must be an integer from 8 to 12 (Book I, Part I ends at Chapter XII)');
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
const passages = extractPassages(xml, { throughChapter });
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
appetite behold daughter diuini gallis genesis nauium occulta omnis potuisset scripsisse
but for that this with from they them their which when where what were was hath have been into upon over after before these those unto vnto shall will would could should other about there then than such only into upon
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
].sort((a, b) => b[0].length - a[0].length);

const SHORT = new Set(['og', 'uz', 'dan', 'lot', 'job', 'iob', 'gog', 'lud', 'put', 'hul', 'ham', 'shem', 'sem', 'noe', 'eva', 'eve', 'seth', 'adam', 'saul', 'cain', 'abel', 'ira']);

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
  }[id] || title;
  newIds.set(key, id);
  created.push(bucket);
  registerToken(title, id);
  for (const surface of bucket.surfaces.keys()) registerToken(surface, id);
}

// Second pass now that new aliases exist. Rebuild account sets from scratch.
const accounts = new Map();
const SPECIAL = new Set(['abimelech-of-gerar', 'lamech-cainite']);
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
  if (/\babimelech\b/.test(t)) {
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
}

// Events the covered text discusses.
function addEvent(id, pred) {
  for (const passage of passages) if (pred(passage)) addAccount(id, passage);
}
addEvent('creation-week', (p) => (p.kind === 'body' && p.chapter === '1') || (p.kind === 'contents' && p.book === '1' && /Chapter I,/.test(p.citation)));
addEvent('the-flood', (p) => /generall floud|vniuersall floud|universall floud|floud of noah|noahs floud|after the floud|before the floud|great inundation|\bthe floud\b/i.test(p.passage));
addEvent('founding-of-babel', (p) => /babel|babell|confusion of tongues|confusion of languages|towre of babel|tower of babel/i.test(p.passage));
addEvent('flood-of-ogyges', (p) => /\bogyges\b|\bogygis\b|\bogyge\b/i.test(p.passage));
addEvent('founding-of-rome', (p) => /3280/.test(p.passage) && /rome/i.test(p.passage));
addEvent('nimrod-builds-nineveh', (p) => {
  if (p.kind !== 'body' || Number(p.chapter) < 9 || Number(p.chapter) > 12) return false;
  if (!/nimrod/i.test(p.passage) || !/niniue/i.test(p.passage)) return false;
  // §. III is the argument that Nimrod, not Assur, built Nineveh.
  // The other hits are the sentences that say he built it or began it.
  if (/Chapter X, §\. III/.test(p.citation)) return true;
  return /begun by nimrod|built niniue|aedificauit niniuen|built foure more cities/i.test(p.passage);
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
  const newNote = 'Spelling only. Read in Book I, Part I, Chapters IX–XII.';
  const alreadyNew = (person?.forms || []).filter((f) => f.source_text_id === SRC_ID && f.note === newNote).length;
  const out = [];
  const held = (accounts.get(id) || []).map(passageById);
  for (const [form] of ranked) {
    if (alreadyNew + out.length >= 8) break;
    if (!form || stored.has(form.toLowerCase())) continue;
    const holder = held.find((p) => p && p.passage.includes(form));
    if (!holder) continue;
    // Pass 3 already stored the spellings of Chapters I–VIII. Add a form only
    // when the passage that prints it is in the chapters this pass reads.
    if (!(holder.kind === 'body' && Number(holder.chapter) >= 9)) continue;
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
