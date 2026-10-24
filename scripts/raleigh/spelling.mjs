// Modern English spelling for Raleigh's 1617 chronological table.
// Person titles stay in agreement with scripts/raleigh/import.mjs.
// Figures are never rewritten. Original spelling is the transcription, suspensions included.

export const BOOK_HEADING = {
  original: 'YEERES OF THE JVLIAN PERIOD, WORLD, PATRIARCHS, &c.',
  modern: 'Years of the Julian Period, World, Patriarchs, &c.',
};

// The key is the printed name after norm(). Raleigh's own spelling stays on the original view.
export const MODERN = {
  aegysthus: 'Aegisthus',
  amphytryon: 'Amphitryon',
  acoris: 'Achoris',
  asarhaddon: 'Esarhaddon',
  athalia: 'Athaliah',
  'belochus priseus': 'Belochus Priscus',
  'belochus the second': 'Belochus II',
  bocchorus: 'Bocchoris',
  'cecrops the second': 'Cecrops II',
  cham: 'Ham (Egypt)',
  'cyras in persia': 'Cyrus in Persia',
  'darius hystaspis': 'Darius Hystaspes',
  demtrius: 'Demetrius',
  erictheus: 'Erechtheus',
  ericthonius: 'Erichthonius',
  euilmerodach: 'Evil-merodach',
  euristheus: 'Eurystheus',
  gedeon: 'Gideon',
  iehoabaz: 'Jehoahaz',
  iehoiakim: 'Jehoiakim',
  ioas: 'Joash',
  iosias: 'Josiah',
  iosua: 'Joshua',
  'iudas macchabaeus': 'Judas Maccabeus',
  manasses: 'Manasseh',
  neco: 'Necho',
  nectanebus: 'Nectanebo',
  'onias high priest': 'Onias the high priest',
  othoniel: 'Othniel',
  pandi: 'Pandion',
  pekahia: 'Pekahiah',
  priamus: 'Priam',
  'ptolemie epiphanes': 'Ptolemy Epiphanes',
  'ptolemie euergetes': 'Ptolemy Euergetes',
  'ptolemie lagi': 'Ptolemy Lagus',
  'sabacus the ethiopian': 'Sabaco the Ethiopian',
  sarai: 'Sarah',
  sethon: 'Sethos',
  'syl alba': 'Alba Silvius',
  'syl alladius': 'Silvius Alladius',
  'syl amulius': 'Amulius',
  'syl latinus': 'Latinus Silvius',
  'syl posthumus': 'Silvius Postumus',
  'syl procas': 'Procas Silvius',
  'syl tybermus': 'Tiberinus Silvius',
  'syluius aeneas': 'Aeneas Silvius',
  tesamenus: 'Tisamenus',
  thespeius: 'Thespius',
  zeusippus: 'Zeuxippus',
};

// Names and column titles. The stored spelling is the one shown.
const NAMES = {
  abram: 'Abraham',
  adam: 'Adam',
  aegypt: 'Egypt',
  aemylius: 'Aemilius',
  argines: 'Argives',
  argiues: 'Argives',
  cainan: 'Kenan',
  captiuitie: 'Captivity',
  chaldaea: 'Chaldea',
  chaldoea: 'Chaldea',
  dauid: 'David',
  egypt: 'Egypt',
  enos: 'Enosh',
  ezekia: 'Hezekiah',
  floud: 'Flood',
  gedeon: 'Gideon',
  greeke: 'Greek',
  greekes: 'Greeks',
  heber: 'Eber',
  henoch: 'Enoch',
  iacob: 'Jacob',
  iair: 'Jair',
  iared: 'Jared',
  iehoram: 'Jehoram',
  iehosaphat: 'Jehoshaphat',
  iehu: 'Jehu',
  ierusalem: 'Jerusalem',
  iewes: 'Jews',
  ioseph: 'Joseph',
  iosua: 'Joshua',
  iuda: 'Judah',
  iudas: 'Judas',
  iulian: 'Julian',
  iunius: 'Junius',
  julian: 'Julian',
  lared: 'Jared',
  latines: 'Latins',
  lephta: 'Jephthah',
  leroboam: 'Jeroboam',
  luctatius: 'Lutatius',
  macchabaeus: 'Maccabeus',
  'maha laleel': 'Mahalalel',
  mahalaleel: 'Mahalalel',
  mcthuselah: 'Methuselah',
  micenae: 'Mycenae',
  moyses: 'Moses',
  nabon: 'Nabonassar',
  nabuchodonosor: 'Nebuchadnezzar',
  nachor: 'Nahor',
  'nim rod': 'Nimrod',
  nimrod: 'Nimrod',
  noak: 'Noah',
  noe: 'Noah',
  nouemb: 'Nov.',
  olymp: 'Olympiad',
  passeouer: 'Passover',
  phaleg: 'Peleg',
  posthumius: 'Postumius',
  ptolemie: 'Ptolemy',
  sale: 'Salah',
  salmanassar: 'Shalmaneser',
  salomon: 'Solomon',
  sarug: 'Serug',
  sem: 'Shem',
  seruilius: 'Servilius',
  thare: 'Terah',
  thola: 'Tola',
  vvorld: 'World',
  iphit: 'Iphitus',
};

// Ordinary 1617 spellings. Case follows the printed word.
const SPELLING = {
  accompt: 'account',
  beganne: 'began',
  betweene: 'between',
  compleat: 'complete',
  compleate: 'complete',
  daye: 'day',
  dayes: 'days',
  deliuerance: 'deliverance',
  deliuered: 'delivered',
  dieth: 'dies',
  dynastie: 'dynasty',
  dyed: 'died',
  dyes: 'dies',
  fortie: 'forty',
  giuen: 'given',
  gouerning: 'governing',
  gouernment: 'government',
  gouernors: 'governors',
  gouernour: 'governor',
  kingdome: 'kingdom',
  kingdomes: 'kingdoms',
  ouer: 'over',
  recouered: 'recovered',
  sonne: 'son',
  threatned: 'threatened',
  victorie: 'victory',
  vnto: 'unto',
  yeare: 'year',
  yeares: 'years',
  yeere: 'year',
  yeeres: 'years',
};

const norm = (s) => String(s || '').replace(/[{}]/g, '').replace(/ˉ/g, 'm').replace(/[●◊〈〉]/g, '').replace(/\./g, ' ').replace(/[^A-Za-z\s-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

export function modernTitle(printed) {
  let s = String(printed || '').replace(/[{}]/g, '').replace(/ˉ/g, 'm').replace(/\s+/g, ' ').trim();
  // Look up the printed letters before expanding suspensions. "Pandiŏ" norms to "pandi";
  // expanding ŏ first would look up "pandion" and miss the map.
  const rawKey = norm(s);
  if (MODERN[rawKey]) return MODERN[rawKey];
  s = s.replace(/ŏ/g, 'on').replace(/▪/g, '.');
  const key = norm(s);
  if (MODERN[key]) return MODERN[key];
  s = s.replace(/^AE/, 'Ae');
  s = s.replace(/^Syl\.\s+/i, 'Silvius ');
  s = s.replace(/^Syluius\b/, 'Silvius');
  if (s[0] && s[0] === s[0].toLowerCase()) s = s[0].toUpperCase() + s.slice(1);
  return s;
}

function mappedName(name) {
  const key = norm(name);
  const joined = key.replace(/\s+/g, '');
  if (MODERN[key]) return MODERN[key];
  if (NAMES[key]) return NAMES[key];
  if (joined !== key && MODERN[joined]) return MODERN[joined];
  if (joined !== key && NAMES[joined]) return NAMES[joined];
  return '';
}

// A printed name that is not one map entry still gets ordinary spelling updates
// ("Salmanassar or Nabanassar"), then the same AE / Syl. fallbacks as a title.
function modernizeLooseName(name) {
  let s = modernizeTokens(applyPhrases(name));
  s = s.replace(/^AE/, 'Ae');
  s = s.replace(/^Syl\.\s+/i, 'Silvius ');
  s = s.replace(/^Syluius\b/, 'Silvius');
  if (s[0] && /[a-z]/.test(s[0])) s = s[0].toUpperCase() + s.slice(1);
  return s;
}

function modernName(printed) {
  const s = String(printed || '').replace(/[{}]/g, '').replace(/ˉ/g, 'm').replace(/ŏ/g, 'on').replace(/▪/g, '.').replace(/\s+/g, ' ').trim();
  return mappedName(s) || modernizeLooseName(s);
}

const PHRASES = [...Object.entries(MODERN), ...Object.entries(NAMES)]
  .filter(([k]) => k.includes(' '))
  .sort((a, b) => b[0].length - a[0].length);

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyPhrases(s) {
  let out = s;
  for (const [from, to] of PHRASES) {
    out = out.replace(new RegExp(`(?<![A-Za-z])${escapeReg(from)}(?![A-Za-z])`, 'gi'), to);
  }
  return out;
}

function matchCase(src, dest) {
  if (src === src.toUpperCase() && src.length > 1) return dest.toUpperCase();
  if (src[0] === src[0].toUpperCase()) return dest.charAt(0).toUpperCase() + dest.slice(1);
  return dest.charAt(0).toLowerCase() + dest.slice(1);
}

function replaceToken(word) {
  const key = word.toLowerCase();
  if (MODERN[key]) return MODERN[key];
  if (NAMES[key]) return NAMES[key];
  if (SPELLING[key]) return matchCase(word, SPELLING[key]);
  return word;
}

function modernizeTokens(s) {
  return s.replace(/[A-Za-z]+/g, (word) => replaceToken(word));
}

const NAME_CELL = /^((?:\d+\s+)*)(1\.?\s+)([^,\d][^,\d]{0,80}?)(\s*[,.]?\s*\d[\d\s.]*)?$/;

function tidy(s) {
  return String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function expand(s) {
  return s.replace(/[{}]/g, '').replace(/ˉ/g, 'm').replace(/ŏ/g, 'on').replace(/▪/g, '.');
}

// A "1. Name, length" cell keeps his figures and replaces only the name.
function modernizeNameCell(s) {
  const m = s.match(NAME_CELL);
  if (!m) return null;
  const name = m[3].replace(/[.\s]+$/, '').trim();
  if (!/[A-Za-z]/.test(name)) return null;
  const modern = modernName(name);
  const trailing = m[3].slice(name.length);
  return `${m[1]}${m[2]}${modern}${trailing}${m[4] || ''}`;
}

export function modernizeCell(raw) {
  const original = tidy(raw);
  if (!original) return { original: '', modern: '' };
  let modern = expand(original).replace(/\s+([.,;:])/g, '$1').replace(/\s+/g, ' ').trim();
  const named = modernizeNameCell(modern);
  modern = named || modernizeTokens(applyPhrases(modern));
  return { original, modern };
}
