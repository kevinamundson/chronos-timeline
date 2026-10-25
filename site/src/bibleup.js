/* BibleUp finds written references. Its own version list has no Berean Standard Bible and no
   Amundson Interpretive Version, so this file keeps the detection and loads the text itself.
   BSB comes from the Free Use Bible API. AIV is requested from aivbible.kevinamundson.me.
   BibleUp is prepended to this file at build time, so the page needs one script tag. */
(function () {
  'use strict';
  var root = document.getElementById('main');
  if (!root || !window.BibleUp) return;

  var HELLO = 'https://bible.helloao.org/api/BSB/';
  var AIV = 'https://aivbible.kevinamundson.me';
  // Folder names in the public AIV chapter files. Song of Solomon is song-of-songs there.
  var AIV_SLUG = {
    GEN: 'genesis', EXO: 'exodus', LEV: 'leviticus', NUM: 'numbers', DEU: 'deuteronomy',
    JOS: 'joshua', JDG: 'judges', RUT: 'ruth', '1SA': '1-samuel', '2SA': '2-samuel',
    '1KI': '1-kings', '2KI': '2-kings', '1CH': '1-chronicles', '2CH': '2-chronicles',
    EZR: 'ezra', NEH: 'nehemiah', EST: 'esther', JOB: 'job', PSA: 'psalms', PRO: 'proverbs',
    ECC: 'ecclesiastes', SNG: 'song-of-songs', ISA: 'isaiah', JER: 'jeremiah', LAM: 'lamentations',
    EZK: 'ezekiel', DAN: 'daniel', HOS: 'hosea', JOL: 'joel', AMO: 'amos', OBA: 'obadiah',
    JON: 'jonah', MIC: 'micah', NAM: 'nahum', HAB: 'habakkuk', ZEP: 'zephaniah', HAG: 'haggai',
    ZEC: 'zechariah', MAL: 'malachi', MAT: 'matthew', MRK: 'mark', LUK: 'luke', JHN: 'john',
    ACT: 'acts', ROM: 'romans', '1CO': '1-corinthians', '2CO': '2-corinthians', GAL: 'galatians',
    EPH: 'ephesians', PHP: 'philippians', COL: 'colossians', '1TH': '1-thessalonians',
    '2TH': '2-thessalonians', '1TI': '1-timothy', '2TI': '2-timothy', TIT: 'titus', PHM: 'philemon',
    HEB: 'hebrews', JAS: 'james', '1PE': '1-peter', '2PE': '2-peter', '1JN': '1-john',
    '2JN': '2-john', '3JN': '3-john', JUD: 'jude', REV: 'revelation'
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
  pop.innerHTML = '<div class="bible-popover-head"><p class="bible-popover-ref"></p><p class="bible-popover-version">BSB</p><button type="button" class="bible-popover-close" aria-label="Close">×</button></div><div class="bible-popover-body"><p class="bible-popover-status"></p><ol class="bible-popover-verses"></ol><section class="bible-popover-aiv" hidden><h2>Amundson Interpretive Version</h2><ol></ol><p class="bible-popover-aiv-note"></p></section></div><p class="bible-popover-foot">Berean Standard Bible via <a href="https://bible.helloao.org/" rel="noopener">bible.helloao.org</a>. Amundson Interpretive Version: <a href="https://aivbible.kevinamundson.me" rel="noopener">aivbible.kevinamundson.me</a>.</p>';
  document.body.appendChild(pop);
  var refEl = pop.querySelector('.bible-popover-ref');
  var statusEl = pop.querySelector('.bible-popover-status');
  var bsbList = pop.querySelector('.bible-popover-verses');
  var aivBox = pop.querySelector('.bible-popover-aiv');
  var aivList = aivBox.querySelector('ol');
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

  // BibleUp stores apiBook as GEN.1.1 or GEN.1.1-GEN.1.3, always one chapter.
  function parseApiBook(apiBook) {
    var parts = String(apiBook || '').split('-');
    var start = parts[0].split('.');
    var end = (parts[1] || parts[0]).split('.');
    var verse = parseInt(start[2], 10);
    var verseEnd = parseInt(end[2], 10);
    var chapter = parseInt(start[1], 10);
    if (!start[0] || !chapter || !verse) return null;
    if (!verseEnd || verseEnd < verse) verseEnd = verse;
    return { bookId: start[0], chapter: chapter, verse: verse, verseEnd: verseEnd };
  }

  function bsbVerses(ref) {
    return getJSON(HELLO + ref.bookId + '/' + ref.chapter + '.simple.json').then(function (data) {
      var content = (data && data.chapter && data.chapter.content) || [];
      return content.filter(function (row) {
        return row.type === 'verse' && row.number >= ref.verse && row.number <= ref.verseEnd;
      }).map(function (row) { return { n: row.number, text: plain(row.text) }; });
    });
  }

  function aivVerses(ref) {
    var slug = AIV_SLUG[ref.bookId];
    if (!slug) return Promise.resolve(null);
    var urls = [
      AIV + '/translations/aiv/json/' + slug + '/chapter-' + ref.chapter + '.json',
      AIV + '/json/' + slug + '/chapter-' + ref.chapter + '.json'
    ];
    function attempt(i) {
      if (i >= urls.length) return null;
      return getJSON(urls[i]).then(function (data) {
        var rows = ((data && data.verses) || []).filter(function (row) {
          return row.verse >= ref.verse && row.verse <= ref.verseEnd;
        }).map(function (row) { return { n: row.verse, text: plain(row.text) }; });
        return rows.length ? rows : attempt(i + 1);
      }).catch(function () { return attempt(i + 1); });
    }
    return attempt(0);
  }

  function fill(list, rows) {
    list.replaceChildren();
    rows.forEach(function (row) {
      var li = document.createElement('li');
      li.value = row.n;
      li.textContent = row.text;
      list.appendChild(li);
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
    var ref = parseApiBook(data.apiBook);
    if (!ref) return;
    var mine = ++token;
    anchor = link;
    link.setAttribute('aria-expanded', 'true');
    var label = data.ref || link.textContent;
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
    Promise.all([bsbVerses(ref).catch(function () { return null; }), aivVerses(ref)]).then(function (both) {
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
