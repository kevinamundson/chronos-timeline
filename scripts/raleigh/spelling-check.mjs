// Unit checks for the Raleigh modernizer. Original spellings are the input.
// The dictionary does not list the rule samples (riuer, haue, and the rest);
// those have to come out of the letter rules.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modernizeProse, modernizeWord } from './spelling.mjs';

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
  ['hath', 'hath'],
  ['doth', 'doth'],
  ['then', 'then'],
  ['than', 'than'],
  ['of', 'of'],
  ['off', 'off'],
  ['IV', 'IV'],
  ['XIV', 'XIV'],
  ['mix', 'mix'],
  ['the', 'the'],
  ['GOD', 'GOD'],
  ['HOw', 'HOw'],
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
  const ruleOnly = ['riuer', 'vnholesome', 'haue', 'euery', 'vpon', 'iudgement', 'onely', 'beene'];
  const spellingSrc = readFileSync(join(here, 'spelling.mjs'), 'utf8');
  for (const word of ruleOnly) {
    const listed = new RegExp(`^\\s+${word}:`, 'm').test(spellingSrc);
    if (listed) errors.push(`${word} is a dictionary key, so it does not test the rules`);
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
