// Modern English spelling for Raleigh's 1617 text.
// The chronological table and Raleigh's account share this modernizer.
// Person titles in the curated maps stay in agreement with scripts/raleigh/import.mjs.
// Figures are never rewritten. Original spelling is the transcription, suspensions included.
// A dictionary hit overrides the rules. The word list only accepts a candidate; it is not a source text.
// Kevin, 2026-11-08: the modern view also turns third-person -eth into -s, and a word
// printed with two capitals then lowercase (THat) into one capital (That).
// Italics are not a spelling change. renderProse keeps an italic span on the modern word.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

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

// Irregular 1617 forms the letter rules do not reach, and forms that are also
// modern words (bee, doe) so the rule must not be left to guess.
const IRREGULAR = {
  alle: 'all',
  alwaies: 'always',
  authour: 'author',
  authours: 'authors',
  bee: 'be',
  bolde: 'bold',
  childe: 'child',
  colde: 'cold',
  doe: 'do',
  eyther: 'either',
  foorth: 'forth',
  hee: 'he',
  mee: 'me',
  milde: 'mild',
  mooue: 'move',
  mooued: 'moved',
  moouing: 'moving',
  neyther: 'neither',
  olde: 'old',
  shee: 'she',
  trueth: 'truth',
  truthe: 'truth',
  vertue: 'virtue',
  vertues: 'virtues',
  vertuous: 'virtuous',
  wee: 'we',
  wilde: 'wild',
  yee: 'ye',
  unprobable: 'improbable',
  // Irregular third person. The -eth rule does not see these endings. Kevin, 2026-11-08.
  hath: 'has',
  doth: 'does',
  saith: 'says',
  neere: 'near',
  neerely: 'nearly',
  turkie: 'turkey',
  wisedome: 'wisdom',
  christendome: 'christendom',
  freedome: 'freedom',
};

// Printed spellings that are also headwords in the 1934 list, but not modern
// spellings of those words. They must not stop the rules.
const ARCHAIC = new Set([
  ...Object.keys(IRREGULAR),
  'shew', 'shewed', 'shewing', 'shewes', 'shewne', 'shewn',
  'sunn', 'farr', 'runn', 'neer', 'heer',
  // Dictionary leftovers. The modern verb is the form without the extra e.
  'hange', 'confronte',
]);

// Real English words that end in a doubled consonant. An early-modern -ll
// (untill, generall) is not in this set, so it can lose the extra l.
const KEEP_LL = new Set('all ball bell bill bull call cell doll dull ell fall fill full gill hall hill ill kill mall mill null pill poll pull roll sell shall shell skill small spell stall still tall tell till wall well will yell'.split(' '));

const EXTRA_WORDS = [
  'has', 'does', 'doth', 'jews', 'judgement', 'judgements', 'acknowledgement', 'acknowledgements',
  'contend', 'endeavor', 'endeavors',
  'hang',
  'selves', 'italy', 'turkey',
  'favour', 'favours', 'favourable', 'favourite', 'favoured',
  'honour', 'honours', 'honourable', 'honoured',
  'colour', 'colours', 'coloured',
  'behaviour', 'behaviours',
  'saviour', 'saviours',
  'labour', 'labours', 'laboured',
  'neighbour', 'neighbours',
  'rumour', 'rumours',
  'armour', 'endeavour', 'endeavours', 'endeavouring',
  'harbour', 'harbours',
  'humour', 'vapour', 'vigour', 'valour', 'splendour', 'fervour', 'ardour', 'clamour', 'flavour',
  'worshipped', 'worshipping',
];

let WORDS = null;
let EXTRA = null;
let TITLES = null;
let FORMS = null;

function ensureLexicon() {
  if (WORDS) return;
  const text = readFileSync(join(here, 'modern-words.txt'), 'utf8');
  WORDS = new Set();
  for (const line of text.split('\n')) {
    if (/^[a-z]+$/.test(line)) WORDS.add(line);
  }
  EXTRA = new Set(EXTRA_WORDS);
  for (const w of WORDS) {
    if (w.endsWith('gment')) EXTRA.add(`${w.slice(0, -5)}gement`);
    if (w.endsWith('gments')) EXTRA.add(`${w.slice(0, -6)}gements`);
  }
  TITLES = new Set();
  FORMS = new Set();
  const peopleDir = join(repoRoot, 'data/people');
  for (const file of readdirSync(peopleDir)) {
    if (!file.endsWith('.json')) continue;
    let title = '';
    try {
      title = JSON.parse(readFileSync(join(peopleDir, file), 'utf8')).title || '';
    } catch {
      continue;
    }
    for (const part of String(title).split(/[^A-Za-z]+/)) {
      if (part.length > 1) TITLES.add(part.toLowerCase());
    }
  }
  try {
    const nameDoc = JSON.parse(readFileSync(join(repoRoot, 'data/name-forms.json'), 'utf8'));
    for (const person of nameDoc.people || []) {
      for (const form of person.forms || []) {
        if (form.script !== 'latin' || !form.form) continue;
        for (const part of String(form.form).split(/[^A-Za-z]+/)) {
          if (part.length > 1) FORMS.add(part.toLowerCase());
        }
      }
    }
  } catch {
    // The passage rules still run. Name protection is weaker without the file.
  }
}

function isWord(w) {
  if (!w || !WORDS) return false;
  if (WORDS.has(w) || EXTRA.has(w)) return true;
  if (w.length >= 4 && w.endsWith('s') && !w.endsWith('ss')) {
    const stem = w.slice(0, -1);
    if (stem.length >= 3 && (WORDS.has(stem) || EXTRA.has(stem))) return true;
    if (w.endsWith('ies')) {
      const y = `${w.slice(0, -3)}y`;
      if (WORDS.has(y) || EXTRA.has(y)) return true;
    }
    // "churches", "boxes". Not "alwayes" (alway + es): -es is only a plural after a sibilant.
    if (w.endsWith('es') && w.length > 4) {
      const bare = w.slice(0, -2);
      if (/(?:s|x|z|ch|sh)$/.test(bare) && (WORDS.has(bare) || EXTRA.has(bare))) return true;
    }
  }
  if (w.length > 4 && w.endsWith('ed')) {
    if (WORDS.has(w.slice(0, -2)) || EXTRA.has(w.slice(0, -2))) return true;
    if (WORDS.has(w.slice(0, -1)) || EXTRA.has(w.slice(0, -1))) return true;
    if (w.endsWith('ied') && (WORDS.has(`${w.slice(0, -3)}y`) || EXTRA.has(`${w.slice(0, -3)}y`))) return true;
    if (w.length > 5 && w.at(-3) === w.at(-4) && (WORDS.has(w.slice(0, -3)) || EXTRA.has(w.slice(0, -3)))) return true;
  }
  if (w.length > 5 && w.endsWith('ing')) {
    const stem = w.slice(0, -3);
    if (WORDS.has(stem) || EXTRA.has(stem) || WORDS.has(`${stem}e`) || EXTRA.has(`${stem}e`)) return true;
    if (stem.length > 2 && stem.at(-1) === stem.at(-2) && (WORDS.has(stem.slice(0, -1)) || EXTRA.has(stem.slice(0, -1)))) return true;
  }
  return false;
}

function isModern(w) {
  return isWord(w) && !ARCHAIC.has(w);
}

// A dictionary headword, not a guessed plural. "busines" is only "busine" + s.
function headword(w) {
  if (!w || !WORDS || ARCHAIC.has(w)) return false;
  return WORDS.has(w) || EXTRA.has(w);
}

// A Latin inflection is left alone by the ending rules. English u/v and i/j still apply.
function looksLatin(w) {
  if (w.length < 5) return false;
  if (/(?:ae|ibus|orum|arum|ium)$/.test(w)) return true;
  if (/(?:um|us)$/.test(w) && !/(.)\1/.test(w) && !/[aeiouy]u[aeiouy]/.test(w) && !/^v[^aeiouy]/.test(w)) return true;
  return false;
}

const ROMAN = /^(?=[IVXLCDMivxlcdm]+$)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function isRomanToken(word) {
  if (!word || word.length < 2) return false;
  if (word !== word.toUpperCase() && word !== word.toLowerCase()) return false;
  const upper = word.toUpperCase();
  // "mix" and "did" are English words that use only numeral letters.
  if (isWord(upper.toLowerCase())) return false;
  if (ROMAN.test(upper)) return true;
  // 1617 prints IIII and XIIII, which the strict form rejects.
  return /^(M{0,4})(CM|CD|D?C{0,4})(XC|XL|L?X{0,4})(IX|IV|V?I{0,4})$/.test(upper);
}

function explicit(lower) {
  const hit = SPELLING[lower] || IRREGULAR[lower] || MODERN[lower] || NAMES[lower] || '';
  // Name cells keep a table gloss such as "Ham (Egypt)" through modernName.
  // A word in a sentence does not grow a parenthesis.
  if (!hit) return '';
  return hit.replace(/\s*\([^)]*\)/g, '').trim();
}

// Safe 1617 letter rules. A dictionary hit, made earlier, overrides these.
function orthographic(lower) {
  let s = lower.replace(/ſ/g, 's').replace(/vv/g, 'w');
  s = s.replace(/^v(?=[bcdfghjklmnpqrstwxz])/, 'u');
  s = s.replace(/([bcdfghjklmnpqrstwxz])v(?=[bcdfghjklmnpqrstwxz])/g, '$1u');
  let prev;
  do {
    prev = s;
    s = s.replace(/([aeiouy])u([aeiouy])/g, '$1v$2');
  } while (s !== prev);
  return s;
}

function applyStems(s) {
  let out = s;
  if (out.includes('bloud')) out = out.replaceAll('bloud', 'blood');
  if (out.includes('floud')) out = out.replaceAll('floud', 'flood');
  if (!out.includes('wholesome')) {
    if (out.includes('holesome')) out = out.replaceAll('holesome', 'wholesome');
    else if (out.includes('holsom')) out = out.replaceAll('holsom', 'wholesome');
  }
  if (out.startsWith('shew')) out = `show${out.slice(4)}`;
  return out;
}

// u standing for v after a consonant. qu, gu, bu, and su stay vowels.
function consonantUtoV(s) {
  return s.replace(/([cdfhklmnprtvxz])u([aeiouy])/g, '$1v$2');
}

function oneEnding(s) {
  if (looksLatin(s)) return s;
  const stemmed = applyStems(s);
  if (stemmed !== s) return stemmed;
  // \2 is the consonant. \1 is the prefix.
  let m = s.match(/^(.*)([bcdfghjklmnpqrstvwxz])\2e([sd])?$/);
  if (m) {
    const dropE = m[1] + m[2] + m[2] + (m[3] || '');
    const dropBoth = m[1] + m[2] + (m[3] || '');
    // "business" and "all" keep a real doubled ending. "sunne" does not: "sunn"
    // is a dictionary oddity, and "busines" is only the plural of "busine".
    const stable = KEEP_LL.has(dropE) || /(?:ss|ff|zz)$/.test(dropE);
    if (stable && headword(dropE)) return dropE;
    if (headword(dropBoth)) return dropBoth;
    if (headword(dropE)) return dropE;
    if (isModern(dropE) && (stable || !isModern(dropBoth))) return dropE;
    if (isModern(dropBoth)) return dropBoth;
    if (isModern(dropE)) return dropE;
  }
  m = s.match(/^(.*?)([aeiou])\2([bcdfghjklmnpqrstvwxz])e$/);
  if (m) {
    const dropE = s.slice(0, -1);
    const oneVowel = `${m[1]}${m[2]}${m[3]}e`;
    // "heer" is a dictionary leftover. "here" keeps one e and the final e.
    if (ARCHAIC.has(dropE) && headword(oneVowel)) return oneVowel;
    if (isModern(dropE)) return dropE;
  }
  if (s.endsWith('enes')) {
    const ness = `${s.slice(0, -4)}ness`;
    if (headword(ness)) return ness;
  }
  if (s.endsWith('ie') && s.length > 3) {
    const t = `${s.slice(0, -2)}y`;
    if (isModern(t)) return t;
  }
  // "subiect" is subject. A final -ie is handled above, so this is i before e and a consonant.
  if (s.includes('ie')) {
    const t = s.replace(/ie(?=[bcdfghjklmnpqrstvwxz])/g, 'je');
    if (t !== s && (isModern(t) || headword(t))) return t;
  }
  if (s.includes('aie')) {
    const t = s.replaceAll('aie', 'ay');
    if (t !== s && isModern(t)) return t;
  }
  if (s.endsWith('ely') && s.length > 4) {
    const t = `${s.slice(0, -3)}ly`;
    if (isModern(t)) return t;
  }
  if (s.endsWith('ayd')) {
    const t = `${s.slice(0, -3)}aid`;
    if (isModern(t)) return t;
  }
  if (s.endsWith('cke') && s.length > 4 && isModern(s.slice(0, -2))) return s.slice(0, -2);
  if (s.endsWith('ck') && s.length > 3 && isModern(s.slice(0, -1))) return s.slice(0, -1);
  if (/([bcdfghjklmnpqrstvwxz])\1$/.test(s) && !KEEP_LL.has(s) && isModern(s.slice(0, -1))) return s.slice(0, -1);
  if (/[bcdfghjklmnpqrstvwxz]{2}e$/.test(s) && s.length > 4 && isModern(s.slice(0, -1))) return s.slice(0, -1);
  if (s.endsWith('es') && s.length > 4) {
    const t = `${s.slice(0, -2)}s`;
    if (isModern(t)) return t;
  }
  if (s.endsWith('e') && s.length > 3 && isModern(s.slice(0, -1))) return s.slice(0, -1);
  return s;
}

function applyEndings(w) {
  let s = w;
  for (let n = 0; n < 5; n += 1) {
    if (isModern(s)) return s;
    const hit = explicit(s);
    if (hit) return hit;
    const next = oneEnding(s);
    if (!next || next === s) break;
    s = next;
  }
  return s;
}

function applyJ(s) {
  // "maiestie" → "majestie" before a following consonant turns the same i into j.
  let out = s.replace(/([aeo])i([aeiouy])/g, '$1j$2');
  if (/^i[aeiou]/.test(out)) out = `j${out.slice(1)}`;
  else if (/^i[aeiou]/.test(s)) out = `j${s.slice(1)}`;
  // Before e, the i usually belongs to -ie → -y ("citie", "majestie"), so leave it.
  out = out.replace(/([bcdfghjklmnpqrstvwxyz])i([aouy])/g, '$1j$2');
  return out;
}

// A headword or a portal title can still be an early-modern spelling
// ("Iohn", "untill"). Prefer the modern form when the rule is unambiguous.
function knownForm(s) {
  if (/^i[aeiou]/.test(s) && !isModern(s)) {
    const j = `j${s.slice(1)}`;
    if (TITLES.has(j) || isModern(j)) return j;
    const je = applyEndings(j);
    if (je !== s && (TITLES.has(je) || isModern(je))) return je;
  }
  if (/ll$/.test(s) && !KEEP_LL.has(s)) {
    const t = s.slice(0, -1);
    if (isModern(t)) return t;
  }
  if (TITLES.has(s) || isModern(s)) return s;
  return '';
}

function preferName(base) {
  if (!/^i[aeiou]/.test(base)) return base;
  const j = `j${base.slice(1)}`;
  if (TITLES.has(j)) return j;
  const je = applyEndings(j);
  if (TITLES.has(je) || isModern(je)) return je;
  return base;
}

// Names, nouns, and ordinals that end in -eth. Not verbs, so the -eth rule leaves them.
// Ashtaroth does not end in -eth. It is not in this set.
const ETH_KEEP = new Set([
  'seth', 'japheth', 'japhet', 'iapheth', 'heth', 'sheth',
  'nazareth', 'elizabeth', 'elisabeth',
  'teeth', 'moneth', 'hundreth',
  'isboseth', 'ishbosheth', 'beth',
  'shibboleth', 'sibboleth', 'macbeth', 'kenneth',
  'geth', 'saketh', 'cheareth',
]);

// A printed -eth word whose modern verb is not the stem plus -s.
const ETH_EXPLICIT = {
  approcheth: 'approaches',
  endeuoureth: 'endeavours',
  endevoureth: 'endeavours',
  maruaileth: 'marvels',
  reprocheth: 'reproaches',
  suteth: 'suits',
  carieth: 'carries',
  prophecieth: 'prophesies',
  looseth: 'loses',
  siegeth: 'besieges',
  trauaileth: 'travels',
  faineth: 'feigns',
  fayneth: 'feigns',
};

// Kept, and listed as unsure. The letters do not identify one modern verb.
const ETH_UNSURE = {
  exisieth: 'kept: printed exisieth, not existeth',
  heioyneth: 'kept: printed as one word; it reads as He joineth, and no space was added',
  inholdeth: 'kept: no modern verb (the sun inholdeth the light)',
  iyeth: 'kept: the token is Iyeth; the sentence reads as lieth, and the token was not rewritten',
};

const ETH_REASON = {
  moneth: 'kept: noun month, not a verb',
  hundreth: 'kept: noun hundred, printed hundreth, not a verb',
  geth: 'kept: Philistine city, printed Geth',
  saketh: 'kept: split from forsake (for saketh); the phrase is modernized, the bare token is not',
  cheareth: 'kept: the brook Cherith, printed Riuer Cheareth',
  teeth: 'kept: noun teeth',
  seth: 'kept: name Seth',
  japheth: 'kept: name Japheth',
  japhet: 'kept: name Japheth',
  iapheth: 'kept: name Japheth',
  heth: 'kept: name Heth',
  nazareth: 'kept: name Nazareth',
  elizabeth: 'kept: name Elizabeth',
  elisabeth: 'kept: name Elizabeth',
  isboseth: 'kept: name Ishbosheth',
};

// Both the stem and the stem plus e are dictionary words. These stems are the verb.
// The others ("hateth", "writeth", "citeth") take the form with e.
const PREFER_BARE = new Set('appoint cast know pass spring visit cross teach do go say see run set cut put let tell fall call show'.split(' '));

// twentieth, thirtieth, fortieth, and the same pattern. hundredth does not end in -eth.
const ORDINAL_ETH = /^(?:twen|thir|for|fif|six|seven|eigh|nine|ten|eleven|twelf)tieth$/;

// Headwords that are not verbs. A stem lookup must not turn "moneth" into "mones",
// "liveth" into "livs", or "setteth" into "setts".
const NOT_INFLECT = new Set('a i am an as at be he is it me my no of on or she so to we ye mone tee liv sak sett se di ly us ad cal'.split(' '));

// Printed stems that are headwords but not the verb ("noteth" is note, not not).
const NON_VERB_STEM = new Set('not but all and for nor yet its his her our the out off per via than then also into upon prophecy siege'.split(' '));

function thirdPerson(inf) {
  if (/(?:s|x|z|ch|sh|o)$/.test(inf)) return `${inf}es`;
  if (/[^aeiou]y$/.test(inf)) return `${inf.slice(0, -1)}ies`;
  return `${inf}s`;
}

function asVerb(inf) {
  if (!inf || NOT_INFLECT.has(inf) || NON_VERB_STEM.has(inf) || !headword(inf)) return '';
  return inf;
}

function protectedEth(word) {
  const forms = [word, word.replace(/^i(?=[aeiou])/, 'j')];
  for (const form of forms) {
    if (ETH_KEEP.has(form)) return 'kept: exception list (name, noun, or ordinal)';
    if (ORDINAL_ETH.test(form)) return 'kept: ordinal';
  }
  for (const form of forms) {
    if (TITLES.has(form) || FORMS.has(form)) return 'kept: name on a person or a name form';
  }
  for (const form of forms) {
    if (headword(form)) return 'kept: modern dictionary word';
  }
  return '';
}

// One printed word that may be a third-person -eth verb. Hath, doth, and saith are included.
// `kept` means the modern view does not change the ending. `unsure` is for the review list.
export function ethDecision(lower) {
  ensureLexicon();
  const word = String(lower || '').toLowerCase();
  if (!word) return null;
  if (word === 'hath') return { word, modern: 'has', kept: false, unsure: false, reason: 'irregular third person of have' };
  if (word === 'doth') return { word, modern: 'does', kept: false, unsure: false, reason: 'irregular third person of do' };
  if (word === 'saith') return { word, modern: 'says', kept: false, unsure: false, reason: 'irregular third person of say' };
  if (ETH_EXPLICIT[word]) {
    return { word, modern: ETH_EXPLICIT[word], kept: false, unsure: false, reason: `verb form ${ETH_EXPLICIT[word]}` };
  }
  if (ETH_UNSURE[word]) return { word, modern: word, kept: true, unsure: true, reason: ETH_UNSURE[word] };
  if (!word.endsWith('eth')) return null;
  const prepared = applyStems(orthographic(word));
  // Only a leading consonantal i ("ioyneth"). Internal i→j would turn "mentioneth" into "mentjoneth".
  const jForm = /^i[aeiou]/.test(prepared) ? `j${prepared.slice(1)}` : prepared;
  const form = jForm.endsWith('eth') ? jForm : prepared;
  const shield = protectedEth(form) || (form !== word ? protectedEth(word) : '');
  if (shield) {
    const reason = ETH_REASON[form] || ETH_REASON[word] || shield;
    return { word, modern: form === word ? word : form, kept: true, unsure: false, reason };
  }
  if (!form.endsWith('eth') || form.length < 5) {
    return { word, modern: form, kept: true, unsure: true, reason: 'kept: no dictionary verb' };
  }
  const stem = form.slice(0, -3);
  // "setteth" and "runneth" double a consonant the infinitive does not.
  // "calleth" and "addeth" are already the verb, so the doubled stem wins.
  if (/(.)\1$/.test(stem)) {
    const full = asVerb(modernizeLower(stem, '', { skipEth: true }));
    const one = asVerb(modernizeLower(stem.slice(0, -1), '', { skipEth: true }));
    if (one && !full) {
      return { word, modern: thirdPerson(one), kept: false, unsure: false, reason: `verb ${one} → ${thirdPerson(one)}` };
    }
  }
  const directInf = modernizeLower(stem, '', { skipEth: true });
  const direct = (directInf.length >= 3 || directInf === 'go' || directInf === 'do') ? asVerb(directInf) : '';
  const withE = asVerb(modernizeLower(`${stem}e`, '', { skipEth: true }));
  if (direct && withE) {
    const inf = PREFER_BARE.has(direct) ? direct : withE;
    const tp = thirdPerson(inf);
    return { word, modern: tp, kept: false, unsure: false, reason: `verb ${inf} → ${tp}` };
  }
  if (direct) return { word, modern: thirdPerson(direct), kept: false, unsure: false, reason: `verb ${direct} → ${thirdPerson(direct)}` };
  if (stem.endsWith('y') && stem.length >= 2) {
    const lie = asVerb(modernizeLower(`${stem.slice(0, -1)}ie`, '', { skipEth: true }));
    if (lie) return { word, modern: thirdPerson(lie), kept: false, unsure: false, reason: `verb ${lie} → ${thirdPerson(lie)}` };
  }
  if (stem.endsWith('i') && stem.length > 2) {
    const y = asVerb(modernizeLower(`${stem.slice(0, -1)}y`, '', { skipEth: true }));
    if (y) return { word, modern: thirdPerson(y), kept: false, unsure: false, reason: `verb ${y} → ${thirdPerson(y)}` };
  }
  if (withE) return { word, modern: thirdPerson(withE), kept: false, unsure: false, reason: `verb ${withE} → ${thirdPerson(withE)}` };
  // Early-modern spellings the letter rules do not reach. The first headword wins.
  const respells = [];
  const push = (s) => { if (s && !respells.includes(s)) respells.push(s); };
  if (stem.endsWith('r') && !stem.endsWith('er')) push(`${stem.slice(0, -1)}er`);
  if (stem.includes('ee')) {
    push(stem.replaceAll('ee', 'i'));
    push(stem.replaceAll('ee', 'ea'));
    push(stem.replaceAll('ee', 'ie'));
  }
  if (stem.includes('ea')) push(stem.replaceAll('ea', 'ee'));
  if (stem.includes('y')) push(stem.replaceAll('y', 'i'));
  if (stem.includes('oo')) {
    push(stem.replace('oo', 'o'));
    push(`${stem.replace('oo', 'o')}e`);
  }
  if (/(.)\1/.test(stem)) {
    const collapsed = stem.replace(/(.)\1/, '$1');
    push(collapsed);
    push(`${collapsed}e`);
  }
  if (stem.includes('w')) push(`${stem.replaceAll('w', 'u')}e`);
  if (/[^aeiou]n$/.test(stem)) push(`${stem.slice(0, -1)}en`);
  if (stem.endsWith('our')) push(`${stem.slice(0, -3)}or`);
  if (stem.startsWith('im')) {
    push(`em${stem.slice(2)}`);
    push(`em${stem.slice(2)}e`);
  }
  if (stem.endsWith('ai')) push(`${stem.slice(0, -2)}ay`);
  if (stem.endsWith('ist')) push(`${stem}er`);
  if (stem.endsWith('roche')) push(`${stem.slice(0, -5)}roach`);
  for (const candidate of respells) {
    const inf = asVerb(modernizeLower(candidate, '', { skipEth: true }));
    if (!inf) continue;
    const tp = thirdPerson(inf);
    return { word, modern: tp, kept: false, unsure: false, reason: `verb ${inf} → ${tp}` };
  }
  const extra = new Set();
  if (stem.endsWith('yn')) extra.add(stem.slice(0, -2) + 'in');
  if (stem.includes('eev')) extra.add(`${stem.replace('eev', 'iev')}e`);
  if (stem.endsWith('eag')) extra.add(`${stem.slice(0, -3)}ege`);
  if (stem.endsWith('ee')) extra.add(`${stem.slice(0, -2)}ie`);
  const found = [];
  for (const variant of extra) {
    const inf = asVerb(modernizeLower(variant, '', { skipEth: true }));
    if (!inf) continue;
    const tp = thirdPerson(inf);
    if (!found.some((row) => row.tp === tp)) found.push({ inf, tp });
  }
  if (found.length === 1) {
    return { word, modern: found[0].tp, kept: false, unsure: false, reason: `verb ${found[0].inf} → ${found[0].tp}` };
  }
  if (found.length > 1) {
    return {
      word,
      modern: word,
      kept: true,
      unsure: true,
      reason: `unsure: ${found.map((row) => `${row.inf} → ${row.tp}`).join('; ')}`,
    };
  }
  return { word, modern: form === word ? word : form, kept: true, unsure: true, reason: 'kept: no dictionary verb' };
}

function modernizeLower(lower, nextChar, opts = {}) {
  ensureLexicon();
  // "vs." is the abbreviation of versus. Bare "vs" in this book is the pronoun "us".
  if ((lower === 'vs' || lower === 'v.s') && nextChar === '.') return lower === 'v.s' ? 'v.s' : 'vs';
  const direct = explicit(lower);
  if (direct) return direct;
  if (isRomanToken(lower)) return lower;
  const prepared = applyStems(orthographic(lower));
  const directPrepared = explicit(prepared);
  if (directPrepared) return directPrepared;
  // The printed word, not the u/v form. ethDecision applies the letter rules itself,
  // and the explicit -eth map is keyed on the printed spelling ("trauaileth").
  if (!opts.skipEth && lower.endsWith('eth')) {
    const decided = ethDecision(lower);
    if (decided && !decided.kept && decided.modern) return decided.modern;
  }
  const known = knownForm(prepared);
  if (known) return known;
  if (FORMS.has(lower) || FORMS.has(prepared)) return preferName(prepared);
  const ended = applyEndings(prepared);
  if (ended !== prepared && (isModern(ended) || explicit(ended))) return explicit(ended) || ended;
  const j = applyJ(prepared);
  if (j !== prepared) {
    if (explicit(j)) return explicit(j);
    if (TITLES.has(j) || isModern(j)) return j;
    const je = applyEndings(j);
    if (explicit(je)) return explicit(je);
    if (TITLES.has(je) || isModern(je)) return je;
  }
  if (/^u[aeiouy]/.test(prepared)) {
    const asV = `v${prepared.slice(1)}`;
    if (isModern(asV)) return asV;
    const asVEnded = applyEndings(asV);
    if (isModern(asVEnded)) return asVEnded;
  }
  const asVowel = consonantUtoV(prepared);
  if (asVowel !== prepared) {
    if (isModern(asVowel)) return asVowel;
    const ve = applyEndings(asVowel);
    if (isModern(ve)) return ve;
  }
  if (j !== prepared) {
    const jv = consonantUtoV(j);
    if (jv !== j) {
      if (isModern(jv)) return jv;
      const jve = applyEndings(jv);
      if (isModern(jve)) return jve;
    }
  }
  if (isModern(ended)) return ended;
  // An unrecognized word may still begin with consonantal i. A numeral does not.
  if (/^i[aeiou]/.test(prepared) && !FORMS.has(lower) && !/^[ivxlcdm]+$/.test(lower)) return `j${prepared.slice(1)}`;
  return prepared;
}

function recase(src, dest) {
  if (!dest) return src;
  if (src.toLowerCase() === dest.toLowerCase()) return src;
  if (/[^A-Za-z]/.test(dest)) {
    if (src.length > 1 && src === src.toUpperCase()) return dest.toUpperCase();
    return dest;
  }
  if (src.length > 1 && src === src.toUpperCase()) return dest.toUpperCase();
  if (src[0] && src[0] === src[0].toUpperCase() && src[0] !== src[0].toLowerCase()) {
    return dest.charAt(0).toUpperCase() + dest.slice(1);
  }
  return dest.charAt(0).toLowerCase() + dest.slice(1);
}

// Two capitals and then lowercase letters: "THat", "ANd". Not "IT", "GOD", or "XIV".
export function isDoubledInitial(word) {
  return /^[A-Z]{2}[a-z]+$/.test(word);
}

function applyDoubledInitial(printed, modern) {
  if (!isDoubledInitial(printed)) return modern;
  const lower = String(modern || '').toLowerCase();
  if (!lower) return modern;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// One printed word. nextChar keeps "vs." (versus) distinct from the pronoun "vs".
export function modernizeWord(word, nextChar = '') {
  const bare = String(word).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ſ/g, 's');
  if (!bare) return word;
  ensureLexicon();
  // Check the printed case. Lowercasing first makes "II" fail the numeral pattern.
  if (isRomanToken(bare)) return bare;
  const lower = bare.toLowerCase();
  if (!/[a-z]/.test(lower)) return word;
  return applyDoubledInitial(bare, recase(bare, modernizeLower(lower, nextChar)));
}

function replaceToken(word) {
  return modernizeWord(word);
}

function modernizeTokens(s) {
  return String(s).replace(/\p{L}+/gu, (word, offset, whole) => modernizeWord(word, whole[offset + word.length] || ''));
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

// Prose keeps the printed punctuation and spacing. Letter tokens are modernized.
// A "1. Name, length" cell is not the shape of a paragraph, so this does not use that rule.
export function modernizeProse(raw) {
  let text = expand(String(raw ?? ''));
  if (!text) return '';
  // "for saketh" is forsake, printed with a space. The bare token saketh is not a verb.
  text = text.replace(/for saketh/gi, 'forsakes');
  // The hyphen splits the token, so the -eth rule would leave "fore-sees".
  text = text.replace(/fore-seeth/gi, 'foresees');
  text = text.replace(/fore-telleth/gi, 'foretells');
  const phrased = applyPhrases(text);
  return phrased.replace(/&[cC]\.?|\p{L}+/gu, (token, offset, whole) => {
    if (token.startsWith('&')) return token;
    return modernizeWord(token, whole[offset + token.length] || '');
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function mergeSpans(text, spans) {
  const clean = [];
  for (const span of spans || []) {
    if (!Array.isArray(span) || span.length < 2) continue;
    const a = Math.max(0, span[0]);
    const b = Math.min(text.length, span[1]);
    if (a < b) clean.push([a, b]);
  }
  clean.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const merged = [];
  for (const [a, b] of clean) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}

// Original or modern prose as HTML. An italic span stays on that stretch after spelling changes.
// `spans` are [start, end] pairs into the stored passage, from the 1617 `<hi>` tags.
export function renderProse(raw, spans, { modern = false } = {}) {
  const text = String(raw ?? '');
  const ranges = mergeSpans(text, spans);
  let html = '';
  let i = 0;
  const piece = (s, italic) => {
    if (!s) return '';
    const body = modern ? modernizeProse(s) : s;
    const escaped = escapeHtml(body);
    return italic ? `<em>${escaped}</em>` : escaped;
  };
  for (const [a, b] of ranges) {
    if (a > i) html += piece(text.slice(i, a), false);
    html += piece(text.slice(a, b), true);
    i = b;
  }
  if (i < text.length) html += piece(text.slice(i), false);
  return html;
}
