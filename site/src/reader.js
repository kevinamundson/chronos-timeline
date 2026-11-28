/* Library reader: table of contents, type size and font, in-book search,
   full-screen reading in two views — continuous scroll, and swipeable pages
   (the text flows into columns one viewport wide; swipe, arrow keys, or the
   page bar turns them, across units at the ends). Static pages; no
   framework. Settings persist in localStorage. Search runs against the
   Pagefind index built for the whole site, filtered to this book, so no
   per-book search index is shipped. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'chronos-reader';
  var LAST_KEY = 'chronos-reader-last';
  var PAGE_KEY = 'chronos-reader-page';
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

  var article = document.querySelector('.reader-body');
  var pagebar = document.querySelector('.reader-pagebar');
  var pageLabel = document.getElementById('reader-page-label');
  var pagePrevBtn = document.getElementById('reader-page-prev');
  var pageNextBtn = document.getElementById('reader-page-next');
  var viewScrollBtn = document.getElementById('reader-view-scroll');
  var viewPagedBtn = document.getElementById('reader-view-paged');
  var prevUnit = document.querySelector('[data-unit-prev]');
  var nextUnit = document.querySelector('[data-unit-next]');
  var page = 0;
  // A restore that lands past the end pins to the end: later reflows
  // (webfont arrival, resize) re-pin to the new last page instead of
  // leaving the reader stranded mid-book on a stale page count.
  var pinnedToEnd = false;
  function restorePage() { return pinnedToEnd ? 1e9 : page; }

  function isPaged() { return (store.view || 'paged') === 'paged'; }
  function pageStoreKey() { return PAGE_KEY + ':' + book + ':' + unit; }

  // Pages view: the article is one viewport tall with columns one page
  // wide. The page width is the article's own width, so the measure stays
  // book-like on a wide screen and full-bleed on a phone.
  function layoutPages() {
    if (!article) return 1;
    var gap = parseFloat(getComputedStyle(article).columnGap) || 32;
    var w = article.clientWidth;
    if (!w) return 1;
    article.style.columnWidth = w + 'px';
    return Math.max(1, Math.ceil(article.scrollWidth / (w + gap)));
  }
  // allowOverflow: turning past an end moves to the next unit (buttons,
  // keys, swipe). Restores never do: a stale saved page, or a font change
  // that shrinks the page count, clamps to the last page instead.
  function goToPage(i, allowOverflow) {
    if (!article) return;
    if (allowOverflow === undefined) allowOverflow = true;
    if (allowOverflow) pinnedToEnd = false;
    var total = layoutPages();
    if (i < 0) {
      if (allowOverflow && prevUnit) { location.href = prevUnit.getAttribute('href') + '?page=last'; return; }
      i = 0; pinnedToEnd = false;
    }
    if (i >= total) {
      if (allowOverflow && nextUnit) { location.href = nextUnit.getAttribute('href'); return; }
      i = total - 1; pinnedToEnd = !allowOverflow;
    }
    page = i;
    var gap = parseFloat(getComputedStyle(article).columnGap) || 32;
    article.scrollLeft = i * (article.clientWidth + gap);
    if (pageLabel) pageLabel.textContent = 'Page ' + (i + 1) + ' of ' + total;
    if (pagePrevBtn) pagePrevBtn.disabled = i === 0 && !prevUnit;
    if (pageNextBtn) pageNextBtn.disabled = i === total - 1 && !nextUnit;
    try { localStorage.setItem(pageStoreKey(), String(i)); } catch (e) { /* private mode */ }
  }
  function setView(v) {
    store.view = v;
    save();
    var paged = v === 'paged';
    root.classList.toggle('reader-paged', paged);
    if (viewScrollBtn) viewScrollBtn.setAttribute('aria-pressed', paged ? 'false' : 'true');
    if (viewPagedBtn) viewPagedBtn.setAttribute('aria-pressed', paged ? 'true' : 'false');
    if (pagebar) pagebar.hidden = !paged;
    if (paged) {
      var start = 0;
      try { start = parseInt(localStorage.getItem(pageStoreKey()) || '0', 10) || 0; } catch (e) { start = 0; }
      goToPage(start, false);
    } else if (article) {
      article.style.columnWidth = '';
      article.scrollLeft = 0;
    }
  }
  if (viewScrollBtn) viewScrollBtn.addEventListener('click', function () { setView('scroll'); });
  if (viewPagedBtn) viewPagedBtn.addEventListener('click', function () { setView('paged'); });
  if (pagePrevBtn) pagePrevBtn.addEventListener('click', function () { goToPage(page - 1); });
  if (pageNextBtn) pageNextBtn.addEventListener('click', function () { goToPage(page + 1); });
  if (isPaged()) {
    // ?page=last arrives from the previous unit's last page.
    var query = null;
    try { query = new URLSearchParams(location.search).get('page'); } catch (e) { query = null; }
    if (query === 'last') {
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* ignore */ }
      goToPage(layoutPages() - 1);
    } else {
      var start = 0;
      try { start = parseInt(localStorage.getItem(pageStoreKey()) || '0', 10) || 0; } catch (e) { start = 0; }
      goToPage(start, false);
    }
    if (pagebar) pagebar.hidden = false;
    if (viewScrollBtn) viewScrollBtn.setAttribute('aria-pressed', 'false');
    if (viewPagedBtn) viewPagedBtn.setAttribute('aria-pressed', 'true');
  }

  // Swipe between pages; a tap (not a swipe) still follows links and
  // selects text, and vertical movement is left to the browser.
  var touchX = null; var touchY = null;
  if (article) {
    article.addEventListener('touchstart', function (e) {
      if (!isPaged() || !e.touches.length) return;
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    }, { passive: true });
    article.addEventListener('touchend', function (e) {
      if (!isPaged() || touchX === null || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      touchX = null; touchY = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) goToPage(page + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
  document.addEventListener('keydown', function (e) {
    if (!isPaged()) return;
    var t = e.target;
    if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
    var tocPanel = document.getElementById('reader-toc');
    if (tocPanel && tocPanel.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goToPage(page + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goToPage(page - 1); }
  });
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (!isPaged()) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { goToPage(restorePage(), false); }, 150);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (isPaged()) goToPage(restorePage(), false); }).catch(function () { /* ignore */ });
  }

  // Full screen: the browser's own fullscreen on the whole page.
  var fsBtn = document.getElementById('reader-fullscreen');
  if (fsBtn) {
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) { document.exitFullscreen().catch(function () { /* ignore */ }); }
      else if (root.requestFullscreen) { root.requestFullscreen().catch(function () { /* ignore */ }); }
    });
    document.addEventListener('fullscreenchange', function () {
      var on = !!document.fullscreenElement;
      fsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      fsBtn.textContent = on ? 'Exit full screen' : 'Full screen';
    });
  }

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
      if (isPaged()) goToPage(restorePage(), false);
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
