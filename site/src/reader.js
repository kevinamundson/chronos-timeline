/* Library reader: table of contents, type size and font, in-book search.
   Static pages; no framework. Settings persist in localStorage. Search
   runs against the Pagefind index built for the whole site, filtered to
   this book, so no per-book search index is shipped. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'chronos-reader';
  var LAST_KEY = 'chronos-reader-last';
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }

  function apply() {
    if (store.size) root.style.setProperty('--reader-size', store.size);
    if (store.font) root.setAttribute('data-reader-font', store.font);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode */ }
  }
  apply();

  var toolbar = document.querySelector('.reader-toolbar');
  var cont = document.getElementById('continue-reading');
  var book = toolbar ? toolbar.getAttribute('data-book') || '' : (cont ? cont.getAttribute('data-book') || '' : '');
  var unit = toolbar ? toolbar.getAttribute('data-unit') || '' : '';

  // Remember where the reader left off, per book, for "Continue reading".
  if (book && unit) {
    try { localStorage.setItem(LAST_KEY + ':' + book, location.pathname); } catch (e) { /* private mode */ }
  }
  if (cont && book) {
    try {
      var last = localStorage.getItem(LAST_KEY + ':' + book);
      if (last && last !== location.pathname) {
        var link = cont.querySelector('a');
        if (link) link.setAttribute('href', last);
        cont.hidden = false;
      }
    } catch (e) { /* private mode */ }
  }
  if (!toolbar) return;

  var size = document.getElementById('reader-size');
  var sizeOut = document.getElementById('reader-size-value');
  var font = document.getElementById('reader-font');
  if (size) {
    if (store.size) size.value = String(Math.round(parseFloat(store.size) * 16));
    var showSize = function () { if (sizeOut) sizeOut.textContent = size.value + ' pt'; };
    showSize();
    size.addEventListener('input', function () {
      store.size = (Number(size.value) / 16).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + 'rem';
      apply(); save(); showSize();
    });
  }
  if (font) {
    if (store.font) font.value = store.font;
    font.addEventListener('change', function () {
      store.font = font.value;
      apply(); save();
    });
  }

  // Table of contents: the drawer is populated from the book's toc.json
  // (the book landing page carries the same list as static HTML). The same
  // file gives search results their unit titles.
  var tocBtn = document.getElementById('reader-toc-toggle');
  var tocPanel = document.getElementById('reader-toc');
  var tocList = document.getElementById('reader-toc-list');
  var tocPromise = null;
  function getToc() {
    if (!tocPromise) {
      tocPromise = fetch('../toc.json').then(function (r) { return r.json(); }).catch(function () { return null; });
    }
    return tocPromise;
  }
  function loadToc() {
    if (!tocList || tocList.dataset.loaded) return;
    tocList.dataset.loaded = '1';
    getToc().then(function (toc) {
      if (!toc) { tocList.innerHTML = '<li><a href="../">Contents on the book page</a></li>'; return; }
      var html = '';
      toc.groups.forEach(function (g) {
        html += '<li class="reader-toc-group"><span>' + g.title + '</span><ul>';
        g.units.forEach(function (u) {
          var current = u.url === location.pathname ? ' aria-current="true"' : '';
          html += '<li><a href="' + u.url + '"' + current + '>' + u.title + '</a></li>';
        });
        html += '</ul></li>';
      });
      tocList.innerHTML = html;
    });
  }
  if (tocBtn && tocPanel) {
    tocBtn.addEventListener('click', function () {
      var open = tocPanel.classList.toggle('is-open');
      tocBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) loadToc();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && tocPanel.classList.contains('is-open')) {
        tocPanel.classList.remove('is-open');
        tocBtn.setAttribute('aria-expanded', 'false');
        tocBtn.focus();
      }
    });
  }

  // In-book search, via Pagefind, filtered to this book.
  var input = document.getElementById('reader-search');
  var results = document.getElementById('reader-search-results');
  var pf = null;
  var timer = null;
  function renderResults(list, q) {
    if (!results) return;
    if (!q) { results.innerHTML = ''; results.hidden = true; return; }
    if (!list.length) {
      results.innerHTML = '<p class="small muted">No results in this book for &ldquo;' + q.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '&rdquo;.</p><p class="small"><a href="/search/?q=' + encodeURIComponent(q) + '">Search the whole site</a></p>';
    } else {
      results.innerHTML = '<ul class="links">' + list.map(function (r) {
        return '<li><a href="' + r.url + '">' + r.title + '</a><br><span class="small muted">' + r.excerpt + '</span></li>';
      }).join('') + '</ul>';
    }
    results.hidden = false;
  }
  if (input && results) {
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      if (q.length < 2) { renderResults([], ''); return; }
      timer = setTimeout(function () {
        var run = pf
          ? Promise.resolve(pf)
          : import('/pagefind/pagefind.js').then(function (m) { pf = m; return m.init ? m.init() : null; }).then(function () { return pf; });
        run.then(function (mod) {
          return mod.search(q, { filters: { book: [book] } });
        }).then(function (search) {
          return Promise.all((search.results || []).slice(0, 10).map(function (r) { return r.data(); }));
        }).then(function (items) {
          return getToc().then(function (toc) {
            var titles = {};
            if (toc) toc.groups.forEach(function (g) { g.units.forEach(function (u) { titles[u.url] = u.title; }); });
            renderResults(items.map(function (d) {
              return { url: d.url, title: titles[d.url] || (d.meta && d.meta.title) || d.url, excerpt: d.excerpt || '' };
            }), q);
          });
        }).catch(function () {
          results.innerHTML = '<p class="small muted">Search is unavailable here. <a href="/search/?q=' + encodeURIComponent(q) + '">Search the whole site</a></p>';
          results.hidden = false;
        });
      }, 250);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; renderResults([], ''); input.blur(); }
    });
  }
})();
