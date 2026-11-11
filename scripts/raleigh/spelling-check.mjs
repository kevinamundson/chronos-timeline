// Unit checks for the Raleigh modernizer. Original spellings are the input.
// The dictionary does not list the rule samples (riuer, haue, and the rest);
// those have to come out of the letter rules.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { displayNameForm, displaySpelling, modernizeProse, modernizeWord, renderProse } from './spelling.mjs';
import { extractPassages, loadXml, THROUGH_CHAPTER } from './xml-text.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const WORDS = [
  ['riuer', 'river'],
  ['vnholesome', 'unwholesome'],
  ['haue', 'have'],
  ['euery', 'every'],
  ['vpon', 'upon'],
  ['iudgement', 'judgement'],
  ['onely', 'only'],
  ['yeere', 'year'],
  ['yeeres', 'years'],
  ['sonne', 'son'],
  ['beene', 'been'],
  ['bee', 'be'],
  ['doe', 'do'],
  ['shee', 'she'],
  ['owne', 'own'],
  ['vs', 'us'],
  ['Vulcan', 'Vulcan'],
  ['vine', 'vine'],
  ['Isaac', 'Isaac'],
  ['Ion', 'Ion'],
  ['Iacob', 'Jacob'],
  ['Iewes', 'Jews'],
  ['Iohn', 'John'],
  ['Ioseph', 'Joseph'],
  ['Iosephus', 'Josephus'],
  ['IOSEPHVS', 'JOSEPHUS'],
  ['Iosephvs', 'Josephus'],
  ['Iudah', 'Judah'],
  ['Ierusalem', 'Jerusalem'],
  ['Iockshan', 'Jokshan'],
  ['Ianias', 'Ianias'],
  ['Ianus', 'Janus'],
  ['Iustine', 'Justin'],
  ['Iupiter', 'Jupiter'],
  ['IVPITER', 'JUPITER'],
  ['Iaphet', 'Japheth'],
  ['IANVM', 'JANUM'],
  ['Iehoabaz', 'Jehoahaz'],
  ['Iosias', 'Josiah'],
  ['Iwenal', 'Iwenal'],
  ['Haue', 'Have'],
  ['VPON', 'UPON'],
  ['ſhip', 'ship'],
  ['heauen', 'heaven'],
  ['loue', 'love'],
  ['giue', 'give'],
  ['ouer', 'over'],
  ['vnder', 'under'],
  ['vntill', 'until'],
  ['euen', 'even'],
  ['neuer', 'never'],
  ['selfe', 'self'],
  ['booke', 'book'],
  ['worke', 'work'],
  ['minde', 'mind'],
  ['finde', 'find'],
  ['kinde', 'kind'],
  ['againe', 'again'],
  ['alwayes', 'always'],
  ['dayes', 'days'],
  ['farre', 'far'],
  ['runne', 'run'],
  ['sunne', 'sun'],
  ['speciall', 'special'],
  ['euill', 'evil'],
  ['vniuersall', 'universal'],
  ['seruant', 'servant'],
  ['aduice', 'advice'],
  ['inuention', 'invention'],
  ['conuert', 'convert'],
  ['citie', 'city'],
  ['mercie', 'mercy'],
  ['glorie', 'glory'],
  ['publicke', 'public'],
  ['musick', 'music'],
  ['bloud', 'blood'],
  ['floud', 'flood'],
  ['sayd', 'said'],
  ['enioy', 'enjoy'],
  ['maiestie', 'majesty'],
  ['iust', 'just'],
  ['ioy', 'joy'],
  ['hath', 'has'],
  ['doth', 'does'],
  ['saith', 'says'],
  ['maketh', 'makes'],
  ['goeth', 'goes'],
  ['giueth', 'gives'],
  ['sayeth', 'says'],
  ['calleth', 'calls'],
  ['seth', 'seth'],
  ['Iapheth', 'Japheth'],
  ['teeth', 'teeth'],
  ['twentieth', 'twentieth'],
  ['elizabeth', 'elizabeth'],
  ['moneth', 'moneth'],
  ['Geth', 'Geth'],
  ['hundreth', 'hundreth'],
  ['exisieth', 'exisieth'],
  ['trueth', 'truth'],
  ['behoueth', 'behooves'],
  ['dieth', 'dies'],
  ['seuentieth', 'seventieth'],
  ['fortieth', 'fortieth'],
  ['eightieth', 'eightieth'],
  ['extendeth', 'extends'],
  ['finisheth', 'finishes'],
  ['preuenteth', 'prevents'],
  ['retaineth', 'retains'],
  ['suffereth', 'suffers'],
  ['Bahalbeth', 'Bahalbeth'],
  ['Pibeseth', 'Pibeseth'],
  ['Sebeth', 'Sebeth'],
  ['Tebeth', 'Tebeth'],
  ['Thobeth', 'Thobeth'],
  ['swereth', 'swereth'],
  ['then', 'then'],
  ['than', 'than'],
  ['of', 'of'],
  ['off', 'off'],
  ['IV', 'IV'],
  ['XIV', 'XIV'],
  ['mix', 'mix'],
  ['the', 'the'],
  ['GOD', 'GOD'],
  ['ABRAHAM', 'ABRAHAM'],
  ['IT', 'IT'],
  ['HOw', 'How'],
  ['THat', 'That'],
  ['ANd', 'And'],
  ['THe', 'The'],
  ['NOw', 'Now'],
  ['AFter', 'After'],
  ['BVt', 'But'],
  ['build', 'build'],
  ['fruit', 'fruit'],
  ['fruite', 'fruit'],
  ['queene', 'queen'],
  ['guide', 'guide'],
  ['language', 'language'],
  ['annual', 'annual'],
  ['continue', 'continue'],
  ['please', 'please'],
  ['done', 'done'],
  ['hope', 'hope'],
  ['have', 'have'],
  ['where', 'where'],
  ['there', 'there'],
  ['these', 'these'],
  ['house', 'house'],
  ['little', 'little'],
  ['people', 'people'],
  ['honestae', 'honestae'],
  ['vulgus', 'vulgus'],
  ['vobis', 'vobis'],
  ['authour', 'author'],
  ['fauour', 'favour'],
  ['behauiour', 'behaviour'],
  ['vertue', 'virtue'],
  ['shew', 'show'],
  ['downe', 'down'],
  ['knowne', 'known'],
  ['growne', 'grown'],
  ['himselfe', 'himself'],
  ['witnesse', 'witness'],
  ['darknesse', 'darkness'],
  ['businesse', 'business'],
  ['trueth', 'truth'],
  ['receiue', 'receive'],
  ['deceiue', 'deceive'],
  ['belieue', 'believe'],
  ['proue', 'prove'],
  ['moue', 'move'],
  ['couer', 'cover'],
  ['gouernment', 'government'],
  ['vse', 'use'],
  ['vsed', 'used'],
  ['vntil', 'until'],
  ['vnfit', 'unfit'],
  ['JVLIAN', 'JULIAN'],
  ['vvorld', 'world'],
  ['ualue', 'value'],
  ['exceèding', 'exceeding'],
  ['II', 'II'],
  ['IIII', 'IIII'],
  ['XIIII', 'XIIII'],
  ['darkenes', 'darkness'],
  ['weakenes', 'weakness'],
  ['neere', 'near'],
  ['heere', 'here'],
  ['Italie', 'Italy'],
  ['Turkie', 'Turkey'],
  ['selues', 'selves'],
  ['wisedome', 'wisdom'],
  ['subiect', 'subject'],
  ['Cham', 'Ham'],
  ['LVD', 'LUD'],
];

const SENTENCES = [
  ['Let vs pray vpon the riuer.', 'Let us pray upon the river.'],
  ['&c. and euery sonne.', '&c. and every son.'],
  ['vs. the Latin mark', 'vs. the Latin mark'],
  ['Sic vos non vobis', 'Sic vos non vobis'],
  ['THat HOw the riuer goeth.', 'That How the river goes.'],
  ['what father for saketh the childe', 'what father forsakes the child'],
  ['which an swereth in a manner', 'which answers in a manner'],
  ['God fore-seeth and fore-telleth.', 'God foresees and foretells.'],
  ['but Iosephus gives unto Lamech.', 'but Josephus gives unto Lamech.'],
  ['Ianias fifty years.', 'Ianias fifty years.'],
];

const DISPLAY = [
  ['Iosephus', 'Josephus'],
  ['IOSEPHVS', 'JOSEPHUS'],
  ['the yeere of Iosephus', 'the yeere of Josephus'],
  ['Ianias', 'Ianias'],
  ['Iockshan', 'Jokshan'],
  ['Iustine', 'Justin'],
  ['Ion', 'Ion'],
  ['Isaac', 'Isaac'],
  ['II', 'II'],
  ['IV', 'IV'],
  ['Iames the Fift', 'James the Fift'],
  ['1. Ioseph. 110', '1. Joseph. 110'],
  ['IACOBS birth', 'JACOBS birth'],
  ['Iaphets sonne', 'Japhets sonne'],
  ['Ionia', 'Ionia'],
  ['the yeere', 'the yeere'],
];

const NAME_CELLS = [
  ['IOSEPHVS', 'Josephus'],
  ['Iosephus', 'Josephus'],
  ['IANVS', 'Janus'],
  ['IANVM', 'Janum'],
  ['Noëma', 'Noëma'],
];

const ITALIC_HTML = [
  ['Blame no man before he maketh THat.', [[0, 12]], true, '<em>Blame no man</em> before he makes That.'],
  ['Blame no man before he maketh THat.', [[0, 12]], false, '<em>Blame no man</em> before he maketh THat.'],
  ['he maketh good', [[3, 9]], true, 'he <em>makes</em> good'],
  ['he maketh good', [[3, 9]], false, 'he <em>maketh</em> good'],
];

export function spellingSelfCheck() {
  const errors = [];
  for (const [from, to] of WORDS) {
    const got = modernizeWord(from);
    if (got !== to) errors.push(`${from} → ${got} (expected ${to})`);
  }
  if (modernizeWord('vs', '.') !== 'vs') errors.push('vs. was modernized');
  if (modernizeProse('&c.') !== '&c.') errors.push('&c. changed');
  for (const [from, to] of SENTENCES) {
    const got = modernizeProse(from);
    if (got !== to) errors.push(`sentence ${JSON.stringify(from)} → ${JSON.stringify(got)} (expected ${JSON.stringify(to)})`);
  }
  for (const [from, to] of DISPLAY) {
    const got = displaySpelling(from);
    if (got !== to) errors.push(`display ${JSON.stringify(from)} → ${JSON.stringify(got)} (expected ${JSON.stringify(to)})`);
  }
  for (const [from, to] of NAME_CELLS) {
    const got = displayNameForm(from);
    if (got !== to) errors.push(`name cell ${JSON.stringify(from)} → ${JSON.stringify(got)} (expected ${JSON.stringify(to)})`);
  }
  const ruleOnly = ['riuer', 'vnholesome', 'haue', 'euery', 'vpon', 'iudgement', 'onely', 'beene'];
  const spellingSrc = readFileSync(join(here, 'spelling.mjs'), 'utf8');
  for (const word of ruleOnly) {
    const listed = new RegExp(`^\\s+${word}:`, 'm').test(spellingSrc);
    if (listed) errors.push(`${word} is a dictionary key, so it does not test the rules`);
  }
  for (const [raw, spans, modern, expected] of ITALIC_HTML) {
    const got = renderProse(raw, spans, { modern });
    if (got !== expected) errors.push(`italic ${JSON.stringify(raw)} → ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})`);
  }
  const blame = extractPassages(loadXml(root), { throughChapter: THROUGH_CHAPTER })
    .find((p) => (p.hi || []).some((h) => h.includes('Blame no man')));
  if (!blame) errors.push('no 1617 passage contains the italic words Blame no man');
  else {
    const modern = renderProse(blame.passage, blame.italics, { modern: true });
    const original = renderProse(blame.passage, blame.italics, { modern: false });
    if (!modern.includes('<em>Blame no man</em>')) errors.push('modern view dropped the italic span on Blame no man');
    if (!original.includes('<em>Blame no man</em>')) errors.push('original view dropped the italic span on Blame no man');
  }
  return errors;
}

const SAMPLE_IDS = ['p00002', 'p00009', 'p00020', 'p00624', 'p00892', 'p00961', 'p00974'];

export function samplePassages() {
  const doc = JSON.parse(readFileSync(join(root, 'data/raleigh-accounts.json'), 'utf8'));
  const byId = Object.fromEntries(doc.passages.map((p) => [p.id, p]));
  const wanted = new Set(SAMPLE_IDS);
  const extra = [];
  for (const p of doc.passages) {
    if (extra.length >= 3) break;
    if (wanted.has(p.id)) continue;
    if (/vnholesome|iudgement|yeeres/.test(p.passage)) {
      extra.push(p.id);
      wanted.add(p.id);
    }
  }
  const ids = [...SAMPLE_IDS, ...extra].slice(0, 10);
  return ids.map((id) => {
    const p = byId[id];
    const original = p.passage;
    const modern = modernizeProse(original);
    return { id, citation: p.citation, original, modern };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = spellingSelfCheck();
  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`${errors.length} spelling checks failed`);
    process.exit(1);
  }
  console.log(`spelling checks passed (${WORDS.length} words, ${SENTENCES.length} sentences)`);
  if (process.argv.includes('--samples')) {
    for (const sample of samplePassages()) {
      console.log(`\n## ${sample.id} ${sample.citation}`);
      console.log('BEFORE:', sample.original.slice(0, 500));
      console.log('AFTER:', sample.modern.slice(0, 500));
    }
  }
}
