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
  // ---- CFAH-8 (z5rtd) Dynasties 15 and 18
  'osf-8-t6-d15': {
    'Iannas / Khyan': P('khyan', 'Khyan', ['Iannas']),
    'Assis / Aseth': P('assis', 'Assis', ['Aseth', 'Archles']),
    'Dynasty Total': G(GROUP), 'Unlisted Kings': G(GROUP),
    'Start of Dynasty 17-A Hyksos Kings in Avaris': G('A heading row of the table (start of Dynasty 17-A, Hyksos kings in Avaris), not a ruler.'),
    'Apophis III': { id: 'apophis-iii', dynasty: 'Dynasty 17-A (Hyksos kings in Avaris)' },
    Khamudi: { id: 'khamudi', dynasty: 'Dynasty 17-A (Hyksos kings in Avaris)' },
  },
  'osf-8-t14-d18': {
    'Hatshepsut / Neferure': P('hatshepsut', 'Hatshepsut', [], { note: 'The row is printed "Hatshepsut / Neferure" (Hatshepsut with her daughter Neferure).' }),
    'TIII + AHII': G('The co-regency of Thutmose III and Amenhotep II (954-948 BC as printed), not a separate ruler; both kings have their own rows.'),
    'Thutmose IV + AHIII': { id: 'thutmose-iv', title: 'Thutmose IV', note: 'The row is printed "Thutmose IV + AHIII" (with Amenhotep III as co-rex).' },
    'Nefertiti / Smenkare': P('nefertiti', 'Nefertiti', ['Smenkare']),
    'Shoshenq I (Achcherres II)': P('shoshenq-i', 'Shoshenq I', ['Achcherres II'], { dynasty: 'Egypt Dynasty 22' }),
    'Osorkon I (Cherres II)': P('osorkon-i', 'Osorkon I', ['Cherres II'], { dynasty: 'Egypt Dynasty 22' }),
    'Piankhi (Harmesses Miamun)': P('piye', 'Piye', ['Piankhi', 'Harmesses Miamun', 'Ammeris the Cushite'], { dynasty: 'Egypt Dynasty 25 (Cushite)' }),
    'Taharqa (Amenophis)': P('taharqa', 'Taharqa', ['Amenophis (Dynasty 18 of the chroniclers)'], { dynasty: 'Egypt Dynasty 25 (Cushite)' }),
  },
  // ---- CFAH-9 (hv3b2) Dynasties 19 and 26 (CFAH identifies each Dynasty 19 king with a Dynasty 26 king)
  'osf-9-t2-d19-26': {
    'Rameses I / Necho I': P('rameses-i', 'Rameses I', ['Necho I'], { dynasty: 'Egypt Dynasty 19 (CFAH-9: = Dynasty 26)' }),
    'Seti I / Psammetichus I': { id: 'psammetichus-i', note: 'CFAH-9 identifies Seti I of Dynasty 19 with Psammetichus I of Dynasty 26.' },
    'Rameses II': P('rameses-ii', 'Rameses II', ['Ramesses II'], { dynasty: 'Egypt Dynasty 19' }),
    'Rameses B / Necho II': { id: 'necho-ii', note: 'CFAH-9 identifies "Rameses B" of Dynasty 19 with Necho II.' },
    'Khaemwaset / Psamtik II': { id: 'psammis', note: 'CFAH-9 identifies Khaemwaset of Dynasty 19 with Psamtik II (Herodotus\' Psammis).' },
    'Merneptah / Hophra/Apries': { id: 'apries', note: 'CFAH-9 identifies Merneptah of Dynasty 19 with Hophra (Apries).' },
    'Amenmesse / Amasis': { id: 'amasis-ii', note: 'CFAH-9 identifies Amenmesse of Dynasty 19 with Amasis.' },
    'Psamtik III': 'psammenitus',
    'Persian Desolation / Persian Desolation': G('A period (the Persian desolation of Egypt, 525-484 BC as printed), not a ruler.'),
    'Tausret & Siptah (son)': P('tausret', 'Tausret', ['Thuoris', 'Tausert'], { dynasty: 'Egypt Dynasty 19', note: 'The row is printed "Tausret & Siptah (son)".' }),
    'Seti II / Inaros II': P('seti-ii', 'Seti II', ['Inaros II'], { dynasty: 'Egypt Dynasty 19' }),
  },
  // ---- CFAH-10 (fg4dv) Dynasties 22-25
  'osf-10-t3-d22': { 'Shoshenq I': 'shoshenq-i', 'Osorkon I': 'osorkon-i', Total: G(GROUP) },
  'osf-10-t5-d23': { 'Takelot III (under Pami)': P('takelot-iii', 'Takelot III', []), 'Zet / Psammetichus': P('zet', 'Zet', ['Psammetichus (Dynasty 23)']), Total: G(GROUP) },
  'osf-10-t7-d24': {
    'Ammeris / Piye': 'piye',
    'Tefnakht / Stephinates': P('tefnakht', 'Tefnakht', ['Stephinates', 'Stephates']),
    'Osorkon III': G('Not attached to a person: the row is printed "Osorkon III", but the CFAH-10 text gives these years (sole reign 719-713 BC) to Bocchoris/Bakenranef, so the name looks like a slip (inconsistency I18).'),
    Total: G(GROUP),
  },
  'osf-10-t9-d25': { 'Piye / Piankhi / Ammeris the Cushite': 'piye', Shabaka: 'sabacos', Taharqa: 'taharqa' },
  // ---- CFAH-11 (ksaz9) Dynasty 20 with its alter egos
  'osf-11-t1-d20': {
    'Seti II (D19) = Inaros II': 'seti-ii',
    'Tausret (D19) = Thuoris': 'tausret',
    'Rameses IX (D20)': P('rameses-ix', 'Rameses IX', []),
    'Rameses X (D20)': P('rameses-x', 'Rameses X', []),
    'Rameses XI (D20)': P('rameses-xi', 'Rameses XI', []),
    'Setnakht / Rameses (D20) = Amyrtaeus of Sais (D28)': P('setnakht', 'Setnakht', ['Amyrtaeus of Sais']),
    'Nepherites I (D29)': P('nepherites-i', 'Nepherites I', []),
    'Achoris/Hakor (D29)': P('achoris', 'Achoris', ['Hakor']),
    'Psammuthis (D29)': P('psammuthis', 'Psammuthis', []),
    'Nepherites II (D29)': P('nepherites-ii', 'Nepherites II', []),
    'Rameses III (D20) = Nectanebo I (D30)': P('rameses-iii', 'Rameses III', ['Nectanebo I']),
    'Rameses IV & V (D20) = Teos (D30)': P('teos', 'Teos', ['Rameses IV', 'Rameses V'], { note: 'The row is printed "Rameses IV & V (D20)" with alter ego Teos (D30).' }),
    'Rameses VI (D20) = Nectanebo II (D30)': P('rameses-vi', 'Rameses VI', ['Nectanebo II']),
    'Rameses VIII (D20) = Son of Ramses III': P('rameses-viii', 'Rameses VIII', []),
    'Rameses VII (D20) = Alexander the Great': { id: 'alexander-the-great', note: 'CFAH-11 proposes Alexander the Great as the alter ego of Rameses VII of Dynasty 20.' },
  },
  // ---- CFAH-13 (bcwg2): Median, Cimmerian and Hittite kings (lengths and identifications only)
  'osf-13-t2-medes-hittites': {
    'Deioces = Artycus = Daiukku': { link: 'deioces' },
    'Phraortes = Artaeus = Suppiluliuma I = Bartatua': { link: 'phraortes' },
    'Cyaxares = Artibaras = Hattusilis III, Khetasar = Umakistar': { link: 'cyaxares' },
    'Astyages = Aspadas = Tudkhaliya IV = Ishtuvegu': { link: 'astyages' },
  },
  'osf-13-t3-identifications': {
    'Deioces = Artycas = Daiaaku': { link: 'deioces' },
    'Phraortes, Prototythes = Artaeus = Suppiluliuma I = Partatua = Partatua, Mugallu?': { link: 'phraortes' },
    'Cyaxares = Artibaras = Khetasar, Hattusilis III = Umakistar': { link: 'cyaxares' },
    'Astyages = Astuigas = Tudkhaliya IV = Ishtuvegu = Ishtumegu': { link: 'astyages' },
  },
  // ---- CFAH-14 (9fuw2): Assyria, Eshnunna and the judges and kings of Israel
  'osf-14-t1-akl-first-17': {
    'Tudija-Adamu (AKL #1-2)': { link: 'adam' }, 'Janqi (AKL #3)': { link: 'seth' }, 'Sahlamu (AKL #4)': { link: 'enosh' },
    'Harharu (AKL #5)': { link: 'kenan' }, 'Mandaru (AKL #6)': { link: 'mahalalel' }, 'Imsu (AKL #7)': { link: 'jared' },
    'Harsu (AKL #8)': { link: 'enoch' }, 'Dedanu (AKL #9)': { link: 'methuselah' }, 'Hanu-Zuabu (AKL #10-11)': { link: 'lamech' },
    'Abazu (AKL #13)': { link: 'shem' }, 'Belu-Azarah (AKL #14-15)': { link: 'asshur' },
  },
  'osf-14-t3-eshnunna': {
    'Naram-Sin': P('naram-sin-of-eshnunna', 'Naram-Sin of Eshnunna', ['Naram-Sin']),
    Dadusha: P('dadusha', 'Dadusha', ['Daduša']),
  },
  'osf-14-t5-rel': {
    'Shalmaneser I': 'shalmaneser-i', 'Tukulti Ninurta I': 'tukulti-ninurta-i',
    'Ashur-Nadin-apli': P('ashur-nadin-apli', 'Ashur-nadin-apli', []),
    'Aššur-nirari III': P('ashur-nirari-iii', 'Aššur-nirari III', ['Ashur-nirari III']),
    'Aššur-dan I': P('ashur-dan-i', 'Aššur-dan I', ['Ashur-dan I']),
    'Aššur-reš-iši': P('ashur-resh-ishi-i', 'Aššur-reš-iši I', ['Ashur-resh-ishi I', 'Aššur-reš-iši']),
    'Ašarid-apil-Ekur': P('asharid-apil-ekur', 'Ašarid-apil-Ekur', ['Asharid-apil-Ekur']),
    'Aššur-bêl-kala': P('ashur-bel-kala', 'Aššur-bêl-kala', ['Ashur-bel-kala']),
    'Shamshi-Adad IV': P('shamshi-adad-iv', 'Shamshi-Adad IV', []),
    'Naram-Sin': 'naram-sin-of-eshnunna', 'Daduša': 'dadusha',
    'Ammon & Philistia': G('A period of oppression (Ammon and Philistia), not a ruler.'),
    Jepthah: P('jephthah', 'Jephthah', ['Jepthah'], { dynasty: 'Judges of Israel' }),
    Abimelech: P('abimelech-son-of-gideon', 'Abimelech (son of Gideon)', ['Abimelech'], { dynasty: 'Judges of Israel' }),
    Tola: P('tola', 'Tola', [], { dynasty: 'Judges of Israel' }), Jair: P('jair', 'Jair', [], { dynasty: 'Judges of Israel' }),
    Ibzan: P('ibzan', 'Ibzan', [], { dynasty: 'Judges of Israel' }), Elon: P('elon', 'Elon', [], { dynasty: 'Judges of Israel' }),
    Abdon: P('abdon', 'Abdon', [], { dynasty: 'Judges of Israel' }),
    Samson: 'samson', Samuel: 'samuel',
    Saul: P('saul', 'Saul', [], { dynasty: 'Kings of Israel', summary: 'First king of Israel.' }),
    'Ishi-Addu & David': G('A shared row (Ishi-Addu and David, 1055-1050 BC as printed); David has his own row.'),
    David: 'david', Solomon: 'solomon',
  },
};
