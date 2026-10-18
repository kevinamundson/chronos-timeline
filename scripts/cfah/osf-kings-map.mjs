// Person matching for phase 5 (osf-kings.mjs). Keys are the row names exactly as in osf-tables/<id>.json.
// A string maps the row to an existing (or shared) person id; an object can set id/title/alt/summary/note;
// { list: reason } keeps the row in the king list without a person (groups, gaps, totals, footnotes).
// SAME merges ids that are the same person under different spellings.
const G = (r) => ({ list: r });
const GROUP = 'A group of rulers, a gap or a total, not an individual ruler.';
const FOOT = 'A footnote of the table, not a ruler.';
const P = (id, title, alt, extra = {}) => ({ id, title, alt, ...extra });
export const SAME = {};
export const MAP = {
  // ---- CFAH-7B (tuwnc) Dynasties 1-11, CFAH-7A (gmx5j) Dynasty 12
  'osf-7b-t6-d1': {
    'Menes / Iry-Hor / Hor-Aha': 'mizraim', // CFAH identifies Menes with Mizraim, son of Ham
  },
  'osf-7b-t14-d2': {
    'Hotepsekhemwy Boethos': P('hotepsekhemwy', 'Hotepsekhemwy', ['Boethos']),
    'Nebra Kakau Kaiechos': P('nebra', 'Nebra', ['Kakau', 'Kaiechos', 'Raneb']),
    'Nynetjer Binothris': P('nynetjer', 'Nynetjer', ['Binothris', 'Ninetjer']),
    'Weneg Wadjenes Tlas': P('weneg', 'Weneg', ['Wadjenes', 'Tlas']),
    'Senedj Sethenes': P('senedj', 'Senedj', ['Sethenes']),
    // CFAH-7B places Neferirkare Kakai (Dynasty 5) in Dynasty 2 as Manetho's Nephercheres, with the same dates.
    'Neferirkare Kakai Nephercheres': P('neferirkare-kakai', 'Neferirkare Kakai', ['Nephercheres', 'Neferkara']),
    'Neferkasokar Chaires': P('neferkasokar', 'Neferkasokar', ['Chaires']),
    'Hudjefa I Sesochris': P('hudjefa-i', 'Hudjefa I', ['Sesochris']),
    'Bebty Cheneres': P('bebty', 'Bebty', ['Cheneres']),
  },
  'osf-7b-t7-d3-4': {
    Nebka: 'nebka',
    'Hor-Khaba / Teti': P('hor-khaba', 'Hor-Khaba', ['Teti (Dynasty 3)']),
    'Khufu / Sufis': 'cheops',
    'Khafre / Suphis II': 'chephren',
    Menkaure: 'mycerinus',
    'Thampthis ****': P('thampthis', 'Thampthis', []),
  },
  'osf-7b-t12-d5': {
    'Neferirkare Kakai': 'neferirkare-kakai',
    'Shepseskara Nejeruser': P('shepseskara', 'Shepseskara', ['Nejeruser']),
    'Neferfre Isi': P('neferefre', 'Neferefre Isi', ['Neferfre Isi', 'Neferefra Isi']),
    'Niuserra Ini': P('niuserre-ini', 'Niuserra Ini', []),
    'Djedkara Isesi': P('djedkare-isesi', 'Djedkara Isesi', ['Djedkare Isesi']),
    Unas: 'unas',
  },
  'osf-7b-t16-d6': {
    Teti: P('teti', 'Teti', [], { summary: 'First king of Egypt Dynasty 6.' }),
    Userkare: 'userkare', 'Pepi I': 'pepi-i', 'Merenre I': 'merenre-i', 'Merenre II': 'merenre-ii', Nitocris: 'nitocris',
    '* Pepi II probably had up to 14 years of co-regency under Userkare': G(FOOT),
  },
  'osf-7b-t8-d9': { '15 governors before 1881 BC': G(GROUP) },
  'osf-7b-t9-d11': {
    '9 governors before 1881 BC': G(GROUP),
    'Inteff I': P('intef-i', 'Intef I', ['Inteff I']),
    'Inteff II': P('intef-ii', 'Intef II', ['Inteff II', 'Sa-Ra Intef II']),
    'Inteff III': 'intef-iii',
    'Mentohotep III': P('mentuhotep-iii', 'Mentuhotep III', ['Mentohotep III']),
    'Mentohotep IV': 'mentuhotep-iv',
  },
  'osf-7a-t3-d12': {
    // CFAH-7B: "Userkare found in Dynasties 6, 12, and 13"; Usimare is his Dynasty 12 entry (1637-1606 BC).
    Usimare: { id: 'userkare', note: 'CFAH-7A lists him in Dynasty 12 as Usimare; CFAH-7B identifies this king with Userkare.' },
    'Senusret III': 'senusret-iii', 'Amenemhat III': 'amenemhat-iii', Sobekneferu: 'sobekneferu',
  },
  'osf-7b-t15-ekl': {
    'EKL #7 Stoichos = Kawab ?': P('kawab', 'Kawab', ['Stoichos (EKL #7)'], { note: 'The table prints the identification with a question mark ("Kawab ?").' }),
    'EKL #8 Gosormies = Inteff the Elder': P('intef-the-elder', 'Intef the Elder', ['Inteff the Elder', 'Gosormies (EKL #8)']),
    'EKL #9 Mares = Mentuhotep I': 'mentuhotep-i',
    'EKL #10 Anouphis = Intef I': 'intef-i',
    'EKL #11 Sirius = Sa-Ra Intef II': 'intef-ii',
    'EKL #12 Chnubus = Intef III': 'intef-iii',
    'EKL #13 Rayosis = Mentuhotep II': 'mentuhotep-ii',
    'EKL #[gap] [gap] = [gap]': G(GROUP),
    'EKL #14 Biyres = Amenemhat I': 'amenemhat-i',
    'EKL #15 Saophis I = Senusret I': 'senusret-i',
    'EKL #16 Saophis II = Senusret II': 'senusret-ii',
    'EKL #17 Moscheres = Userkare': 'userkare',
    'EKL #18 Mosthes = Senusret III': 'senusret-iii',
    'EKL #19 Pammes = Amenemhat III': 'amenemhat-iii',
    'EKL #20 Apappus = Pepi II': 'pepi-ii',
  },
};
