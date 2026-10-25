/* BibleUp finds written references. Its own version list has no Berean Standard Bible and no
   Amundson Interpretive Version, so this file keeps the detection and loads the text itself.
   BSB comes from the Free Use Bible API. AIV is a USX file per book under
   aivbible.kevinamundson.me/usx/. BibleUp is prepended to this file at build time,
   so the page needs one script tag. */
(function () {
  'use strict';
  var root = document.getElementById('main');
  if (!root || !window.BibleUp) return;

  var HELLO = 'https://bible.helloao.org/api/BSB/';
  var AIV = 'https://aivbible.kevinamundson.me';
  // File names in the AIV USX set. Each book is a folder under /usx/.
  var AIV_FILE = {
    GEN: '01-GEN', EXO: '02-EXO', LEV: '03-LEV', NUM: '04-NUM', DEU: '05-DEU',
    JOS: '06-JOS', JDG: '07-JDG', '1SA': '08-1SA', '2SA': '09-2SA', '1KI': '10-1KI',
    '2KI': '11-2KI', ISA: '12-ISA', JER: '13-JER', EZK: '14-EZK', HOS: '15-HOS',
    JOL: '16-JOL', AMO: '17-AMO', OBA: '18-OBA', JON: '19-JON', MIC: '20-MIC',
    NAM: '21-NAM', HAB: '22-HAB', ZEP: '23-ZEP', HAG: '24-HAG', ZEC: '25-ZEC',
    MAL: '26-MAL', PSA: '27-PSA', PRO: '28-PRO', JOB: '29-JOB', SNG: '30-SNG',
    RUT: '31-RUT', LAM: '32-LAM', ECC: '33-ECC', EST: '34-EST', DAN: '35-DAN',
    EZR: '36-EZR', NEH: '37-NEH', '1CH': '38-1CH', '2CH': '39-2CH', MAT: '40-MAT',
    MRK: '41-MRK', LUK: '42-LUK', JHN: '43-JHN', ACT: '44-ACT', ROM: '45-ROM',
    '1CO': '46-1CO', '2CO': '47-2CO', GAL: '48-GAL', EPH: '49-EPH', PHP: '50-PHP',
    COL: '51-COL', '1TH': '52-1TH', '2TH': '53-2TH', '1TI': '54-1TI', '2TI': '55-2TI',
    TIT: '56-TIT', PHM: '57-PHM', HEB: '58-HEB', JAS: '59-JAS', '1PE': '60-1PE',
    '2PE': '61-2PE', '1JN': '62-1JN', '2JN': '63-2JN', '3JN': '64-3JN', JUD: '65-JUD',
    REV: '66-REV'
  };

  // KJV is only the key BibleUp accepts. The popover never asks api.bible for it.
  var savedKey = window.onkeydown;
  var finder = new BibleUp(root, { version: 'KJV', popup: 'classic', darkTheme: false });
  finder.create();
  window.onkeydown = savedKey;
  document.querySelectorAll('[id^="bu-popup-"]').forEach(function (el) { el.remove(); });

  var pop = document.createElement('div');
  pop.className = 'bible-popover bu-ignore';
  pop.hidden = true;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Bible reference');
  pop.innerHTML = '<div class="bible-popover-head"><p class="bible-popover-ref"></p><p class="bible-popover-version">BSB</p><button type="button" class="bible-popover-close" aria-label="Close">×</button></div><div class="bible-popover-body"><p class="bible-popover-status"></p><div class="bible-popover-verses"></div><section class="bible-popover-aiv" hidden><h2>Amundson Interpretive Version</h2><div class="bible-popover-aiv-verses"></div><p class="bible-popover-aiv-note"></p></section></div><p class="bible-popover-foot">Berean Standard Bible via <a href="https://bible.helloao.org/" rel="noopener">bible.helloao.org</a>. Amundson Interpretive Version: <a href="https://aivbible.kevinamundson.me" rel="noopener">aivbible.kevinamundson.me</a>.</p>';
  document.body.appendChild(pop);
  var refEl = pop.querySelector('.bible-popover-ref');
  var statusEl = pop.querySelector('.bible-popover-status');
  var bsbList = pop.querySelector('.bible-popover-verses');
  var aivBox = pop.querySelector('.bible-popover-aiv');
  var aivList = pop.querySelector('.bible-popover-aiv-verses');
  var aivNote = pop.querySelector('.bible-popover-aiv-note');
  var cache = new Map();
  var token = 0;
  var closeTimer = 0;
  var anchor = null;

  function plain(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function getJSON(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      }).catch(function (err) {
        cache.delete(url);
        throw err;
      }));
    }
    return cache.get(url);
  }

  // BibleUp stores apiBook as GEN.1.1 or GEN.1.1-GEN.1.3. A chapter span is carried beside that.
  function parseApiBook(apiBook) {
    var parts = String(apiBook || '').split('-');
    var start = parts[0].split('.');
    var end = (parts[1] || parts[0]).split('.');
    var verse = parseInt(start[2], 10);
    var verseEnd = parseInt(end[2], 10);
    var chapter = parseInt(start[1], 10);
    var chapterEnd = parseInt(end[1], 10);
    if (!start[0] || !chapter || !verse) return null;
    if (!chapterEnd || chapterEnd < chapter) chapterEnd = chapter;
    if (!verseEnd) verseEnd = null;
    if (chapterEnd === chapter && verseEnd != null && verseEnd < verse) verseEnd = verse;
    return { bookId: start[0], chapter: chapter, chapterEnd: chapterEnd, verse: verse, verseEnd: verseEnd };
  }

  // "8–11" or "8-11" left outside the link. Also "16–18" and "8:1–11:15".
  // This has to exist before extendSpans() runs. A var above a call is still undefined
  // when the call is higher in the file, and match(undefined) matches an empty string.
  var SPAN = /^(\s*[\u2012\u2013\u2014\u2212-]\s*)(\d{1,3})(?!\d)(?::(\d{1,3})(?!\d))?/;
  // BibleUp stops at the first chapter and only treats a hyphen after a colon as a verse span.
  // "(1 Sam 8–11)" was therefore only "1 Sam 8". Pull the rest of the span into the link.
  extendSpans();
  markWholeChapters();

  function followingText(cite) {
    var node = cite.nextSibling;
    while (node && node.nodeType === 3 && node.nodeValue === '') node = node.nextSibling;
    return node && node.nodeType === 3 ? node : null;
  }

  function extendSpans() {
    document.querySelectorAll('cite.bu-link').forEach(function (cite) {
      var link = cite.querySelector('a[bu-data]');
      var rest = followingText(cite);
      if (!link || !rest) return;
      var match = rest.nodeValue.match(SPAN);
      if (!match || !match[2]) return;
      var data;
      try { data = JSON.parse(link.getAttribute('bu-data') || ''); } catch (e) { return; }
      var hasVerse = /:/.test(link.textContent);
      var endNum = parseInt(match[2], 10);
      if (!(endNum >= 1)) return;
      var endVerse = match[3] ? parseInt(match[3], 10) : null;
      if (!hasVerse && endVerse == null) {
        if (endNum < data.chapter || endNum > data.chapter + 50) return;
        data.wholeChapters = true;
        data.chapterEnd = endNum;
      } else if (hasVerse && endVerse == null) {
        if (endNum > 200) return;
        data.wholeChapters = false;
        data.verseEnd = endNum;
        var bookId = String(data.apiBook || '').split('.')[0];
        data.apiBook = bookId + '.' + data.chapter + '.' + data.verse + '-' + bookId + '.' + data.chapter + '.' + endNum;
      } else {
        if (endNum < data.chapter || endNum > data.chapter + 50 || endVerse > 200) return;
        data.wholeChapters = false;
        data.chapterEnd = endNum;
        data.verseEnd = endVerse;
      }
      link.appendChild(document.createTextNode(match[0]));
      rest.nodeValue = rest.nodeValue.slice(match[0].length);
      data.ref = link.textContent.trim();
      link.setAttribute('bu-data', JSON.stringify(data));
    });
  }

  // "1 Kgs 8" names a chapter. BibleUp asks for verse 1 only.
  function markWholeChapters() {
    document.querySelectorAll('a[bu-data]').forEach(function (link) {
      if (/:/.test(link.textContent)) return;
      var data;
      try { data = JSON.parse(link.getAttribute('bu-data') || ''); } catch (e) { return; }
      if (data.chapterEnd) return;
      data.wholeChapters = true;
      data.chapterEnd = data.chapter;
      data.ref = link.textContent.trim();
      link.setAttribute('bu-data', JSON.stringify(data));
    });
  }

  function passage(data) {
    var ref = parseApiBook(data.apiBook);
    if (!ref) return null;
    if (data.wholeChapters) {
      ref.verse = 1;
      ref.verseEnd = null;
      ref.chapterEnd = data.chapterEnd || ref.chapter;
    } else if (data.chapterEnd) {
      ref.chapterEnd = data.chapterEnd;
      if (data.verseEnd) ref.verseEnd = data.verseEnd;
    } else if (data.verseEnd) {
      ref.verseEnd = data.verseEnd;
    }
    if (ref.chapterEnd < ref.chapter) ref.chapterEnd = ref.chapter;
    return ref;
  }

  function inSpan(ref, chapter, number) {
    if (chapter === ref.chapter && number < ref.verse) return false;
    if (chapter === ref.chapterEnd && ref.verseEnd != null && number > ref.verseEnd) return false;
    return true;
  }

  function bsbChapter(bookId, chapter) {
    return getJSON(HELLO + bookId + '/' + chapter + '.simple.json').then(function (data) {
      return ((data && data.chapter && data.chapter.content) || []).filter(function (row) {
        return row.type === 'verse';
      }).map(function (row) { return { n: row.number, text: plain(row.text) }; });
    }).catch(function () { return []; });
  }

  function getText(url) {
    if (!cache.has(url)) {
      cache.set(url, fetch(url).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      }).catch(function (err) {
        cache.delete(url);
        throw err;
      }));
    }
    return cache.get(url);
  }

  // USX 2 keeps chapter and verse as empty milestones. The words sit in the
  // following text nodes. Notes stay out of the reading text.
  function parseUsx(xml) {
    var doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (!doc || doc.getElementsByTagName('parsererror').length) return null;
    var books = {};
    var chapter = 0;
    var verse = null;
    function addText(value) {
      if (verse && value) verse.parts.push(value);
    }
    function walk(node) {
      if (node.nodeType === 3) { addText(node.nodeValue); return; }
      if (node.nodeType !== 1) return;
      var tag = node.localName;
      if (tag === 'note') return;
      if (tag === 'chapter') {
        chapter = parseInt(node.getAttribute('number'), 10) || 0;
        verse = null;
        if (!books[chapter]) books[chapter] = [];
      } else if (tag === 'verse') {
        var n = parseInt(node.getAttribute('number'), 10);
        verse = chapter && n ? { n: n, parts: [] } : null;
        if (verse) {
          if (!books[chapter]) books[chapter] = [];
          books[chapter].push(verse);
        }
      }
      for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
    }
    walk(doc.documentElement || doc);
    Object.keys(books).forEach(function (key) {
      books[key] = books[key].map(function (row) {
        return { n: row.n, text: plain(row.parts.join(' ')) };
      }).filter(function (row) { return row.n && row.text; });
    });
    return books;
  }

  var usxBooks = new Map();
  function aivBook(bookId) {
    if (!usxBooks.has(bookId)) {
      var file = AIV_FILE[bookId];
      var urls = [];
      if (file) {
        urls.push(AIV + '/usx/' + bookId + '/' + file + '.usx');
        urls.push(AIV + '/usx/' + file + '/' + file + '.usx');
        urls.push(AIV + '/usx/' + file + '.usx');
      }
      urls.push(AIV + '/usx/' + bookId + '/' + bookId + '.usx');
      function attempt(i) {
        if (i >= urls.length) return null;
        return getText(urls[i]).then(function (xml) {
          if (!xml || xml.indexOf('<usx') === -1) return attempt(i + 1);
          return parseUsx(xml) || attempt(i + 1);
        }).catch(function () { return attempt(i + 1); });
      }
      usxBooks.set(bookId, attempt(0));
    }
    return usxBooks.get(bookId);
  }

  function aivChapter(bookId, chapter) {
    if (!AIV_FILE[bookId]) return Promise.resolve(null);
    return aivBook(bookId).then(function (book) {
      if (!book) return null;
      return book[chapter] || [];
    });
  }

  function collect(ref, load) {
    var jobs = [];
    var chapter;
    for (chapter = ref.chapter; chapter <= ref.chapterEnd; chapter++) jobs.push(load(ref.bookId, chapter));
    return Promise.all(jobs).then(function (lists) {
      var out = [];
      var missed = 0;
      lists.forEach(function (rows, i) {
        if (!rows || !rows.length) { missed += 1; return; }
        var ch = ref.chapter + i;
        rows.forEach(function (row) {
          if (inSpan(ref, ch, row.n)) out.push({ chapter: ch, n: row.n, text: row.text });
        });
      });
      if (!out.length && missed === lists.length) return null;
      return out;
    });
  }

  function fill(container, rows) {
    container.replaceChildren();
    var groups = [];
    rows.forEach(function (row) {
      var last = groups[groups.length - 1];
      if (!last || last.chapter !== row.chapter) {
        last = { chapter: row.chapter, rows: [] };
        groups.push(last);
      }
      last.rows.push(row);
    });
    var multi = groups.length > 1;
    groups.forEach(function (group) {
      if (multi) {
        var heading = document.createElement('h3');
        heading.textContent = 'Chapter ' + group.chapter;
        container.appendChild(heading);
      }
      var list = document.createElement('ol');
      group.rows.forEach(function (row) {
        var li = document.createElement('li');
        li.value = row.n;
        li.textContent = row.text;
        list.appendChild(li);
      });
      container.appendChild(list);
    });
  }

  function hide() {
    pop.hidden = true;
    if (anchor) anchor.setAttribute('aria-expanded', 'false');
    anchor = null;
  }

  function place(link) {
    var rect = link.getBoundingClientRect();
    var width = pop.offsetWidth;
    var height = pop.offsetHeight;
    var left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    var top = rect.bottom + 8;
    if (top + height > window.innerHeight - 8 && rect.top - height - 8 > 8) top = rect.top - height - 8;
    pop.style.left = left + 'px';
    pop.style.top = Math.max(8, top) + 'px';
  }

  function open(link) {
    var data = {};
    try { data = JSON.parse(link.getAttribute('bu-data') || ''); } catch (e) { return; }
    var ref = passage(data);
    if (!ref) return;
    var mine = ++token;
    anchor = link;
    link.setAttribute('aria-expanded', 'true');
    var label = (link.textContent || '').trim() || data.ref;
    refEl.textContent = label;
    pop.setAttribute('aria-label', label);
    statusEl.hidden = false;
    statusEl.textContent = 'Loading the Berean Standard Bible…';
    bsbList.replaceChildren();
    aivBox.hidden = true;
    aivList.replaceChildren();
    aivNote.textContent = '';
    pop.hidden = false;
    place(link);
    Promise.all([collect(ref, bsbChapter), collect(ref, aivChapter)]).then(function (both) {
      if (mine !== token) return;
      var bsb = both[0];
      var aiv = both[1];
      if (!bsb || !bsb.length) {
        statusEl.hidden = false;
        statusEl.textContent = 'The Berean Standard Bible text could not be loaded.';
      } else {
        statusEl.hidden = true;
        statusEl.textContent = '';
        fill(bsbList, bsb);
      }
      aivBox.hidden = false;
      if (aiv && aiv.length) fill(aivList, aiv);
      else aivNote.textContent = 'The Amundson Interpretive Version could not be loaded.';
      place(link);
    });
  }

  function arm(link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('mouseenter', function () { clearTimeout(closeTimer); open(link); });
    link.addEventListener('focus', function () { clearTimeout(closeTimer); open(link); });
    link.addEventListener('click', function (e) { e.preventDefault(); clearTimeout(closeTimer); open(link); });
    link.addEventListener('mouseleave', function () { closeTimer = setTimeout(hide, 180); });
  }

  document.querySelectorAll('a[bu-data]').forEach(function (link) {
    var fresh = link.cloneNode(true);
    fresh.setAttribute('href', '#');
    link.replaceWith(fresh);
    arm(fresh);
  });

  pop.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
  pop.addEventListener('mouseleave', function () { closeTimer = setTimeout(hide, 180); });
  pop.querySelector('.bible-popover-close').addEventListener('click', hide);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pop.hidden) hide();
  });
  document.addEventListener('click', function (e) {
    if (pop.hidden) return;
    if (pop.contains(e.target) || (e.target.closest && e.target.closest('a[bu-data]'))) return;
    hide();
  });
})();
