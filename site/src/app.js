/* Home timeline, person timelines and maps. Data comes from inline JSON emitted by build.mjs. */
(function () {
  'use strict';
  function readJSON(id) { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; }

  // Historical year (negative = BC, no year 0) -> axis year A, a bijection chosen so round axis ticks
  // read as round BC years: BC y -> A = y (4500 BC -> -4500); AD y -> A = y - 1 (AD 1 -> 0).
  function toDate(y) { var a = y < 0 ? y : y - 1; var d = new Date(Date.UTC(2000, 6, 1)); d.setUTCFullYear(a); return d; }
  function astroToLabel(a) { return a < 0 ? (-a) + ' BC' : 'AD ' + (a + 1); }

  // ---------- Timeline ----------
  // vis-timeline measures each point's dot (offsetWidth) on first draw. If its stylesheet has not been applied yet
  // (WebKit/Safari can run deferred scripts before a late stylesheet is ready), the dot is measured as a full-width
  // block and every item is drawn hundreds of pixels off. So build the timeline only once all stylesheets are in.
  function whenStyles(cb) {
    var links = [].slice.call(document.querySelectorAll('link[rel="stylesheet"]'));
    var pending = links.filter(function (l) { try { return !l.sheet || !l.sheet.cssRules; } catch (e) { return false; } });
    if (!pending.length) return cb();
    var left = pending.length, done = false;
    var fin = function () { if (!done && --left <= 0) { done = true; cb(); } };
    pending.forEach(function (l) { l.addEventListener('load', fin); l.addEventListener('error', fin); });
    window.addEventListener('load', function () { if (!done) { done = true; cb(); } });
  }
  var tlEl = document.getElementById('timeline');
  var raw = readJSON('tl-data');
  if (tlEl && raw && window.vis) whenStyles(function () {
    var moment = vis.moment;
    var person = !Array.isArray(raw) && raw.mode === 'person';
    var items = person ? raw.items : raw;
    function visItem(it) {
      var cls = 'tier-' + it.tier + (person ? (it.own ? ' own' : ' ctx') : '');
      var label = it.title + ' — ' + it.label + (person && !it.own ? ' (context)' : '');
      var range = it.group === 'people' && it.yEnd != null && it.yEnd !== it.y;
      var row = { id: it.group + ':' + it.id, group: it.group, content: it.title, start: toDate(it.y), type: range ? 'range' : 'point',
        title: label, aria: label, className: cls, url: it.url, own: !!it.own, ord: it.y * 100 + (it.order || 0), tier: it.tier };
      if (range) row.end = toDate(it.yEnd);
      return row;
    }
    var built = items.map(visItem);
    function tiersOn() {
      var buttons = document.querySelectorAll('[data-tier-toggle]');
      if (!buttons.length) return null;
      var on = {};
      [].forEach.call(buttons, function (b) { if (b.getAttribute('aria-pressed') === 'true') on[b.getAttribute('data-tier-toggle')] = true; });
      return on;
    }
    function shownItems() {
      var on = tiersOn();
      var list = on ? built.filter(function (it) { return on[it.tier]; }) : built;
      return list.map(function (it) { return Object.assign({}, it); });
    }
    var data = new vis.DataSet(shownItems());
    var groups = person
      ? new vis.DataSet([{ id: 'own', content: raw.person + '’s life', order: 1 }, { id: 'context', content: 'Context', order: 2, className: 'grp-ctx' }])
      : new vis.DataSet([{ id: 'events', content: 'Events', order: 1 }, { id: 'people', content: 'People', order: 2 }]);
    var ys = items.map(function (i) { return i.y; });
    var min = person ? raw.start : Math.min.apply(null, ys), max = person ? raw.stop : Math.max.apply(null, ys);
    // Home opens on the ancient span (to AD 100) as before; later (AD) items are reachable by panning/zooming.
    var viewMax = person ? max : Math.min(max, 100);
    var pad = person ? Math.max(3, Math.round((max - min) * 0.05)) : Math.max(50, Math.round((viewMax - min) * 0.04));
    var padR = person ? pad * 4 : pad * 7;
    var YEAR = 365.25 * 864e5;
    var timeline = new vis.Timeline(tlEl, data, groups, {
      moment: function (d) { return moment(d).utc(); },
      start: toDate(min - pad), end: toDate(viewMax + padR),
      min: toDate(min - (person ? 200 : 500)), max: toDate(Math.min(max + (person ? 400 : 2000), new Date().getUTCFullYear() + 25)),
      zoomMin: (person ? 2 : 10) * YEAR, zoomMax: 5000 * YEAR,
      groupOrder: 'order',
      // Each item is a real link: focusable, Enter opens it, screen readers get the full label.
      template: function (item) {
        var a = document.createElement('a');
        a.href = item.url; a.className = 'tl-link'; a.textContent = item.content;
        a.setAttribute('aria-label', item.aria);
        if (person && !item.own) { var s = document.createElement('span'); s.className = 'ctx-mark'; s.textContent = ' (context)'; a.appendChild(s); }
        return a;
      },
      orientation: { axis: 'both', item: 'top' }, verticalScroll: true, stack: true, showCurrentTime: false, selectable: true,
      // Person charts grow to fit every item (no hidden, scroll-only rows); the dense home chart is capped.
      maxHeight: person ? undefined : (window.matchMedia('(max-width: 640px)').matches ? '520px' : '640px'), minHeight: person ? '200px' : '320px',
      margin: { item: { horizontal: 4, vertical: 6 } },
      format: {
        minorLabels: function (date, scale) { return scale === 'year' ? astroToLabel(date.year()) : date.format('MMM'); },
        majorLabels: function (date, scale) { return (scale === 'year' || scale === 'decade' || scale === 'century' || scale === 'millennium') ? '' : astroToLabel(date.year()); }
      },
      tooltip: { followMouse: true },
      order: function (a, b) { return a.ord - b.ord; }
    });
    window.__timeline = timeline; // exposed for site/verify.mjs
    // vis-timeline only has year steps up to 1000. A wider window (a phone showing the whole chart)
    // misses every step and falls through to a day scale, so hundreds of labels pile on the first tick.
    // 1000 years is still narrower than the label budget there, so keep adding 1000 until the step fits.
    // Closer windows stay on whatever scale vis chose (a person chart zoomed in must not jump to millennia).
    var StepCtor = timeline.timeAxis && timeline.timeAxis.step && timeline.timeAxis.step.constructor;
    if (StepCtor && !StepCtor.prototype._yearScaleFloor) {
      var origMinStep = StepCtor.prototype.setMinimumStep;
      var stepYear = 1000 * 60 * 60 * 24 * 30 * 12;
      StepCtor.prototype.setMinimumStep = function (minimumStep) {
        origMinStep.call(this, minimumStep);
        if (minimumStep >= stepYear * 1000) {
          this.scale = 'year';
          var years = minimumStep / stepYear;
          var step = 1000;
          while (step <= years && step < 10000) step += 1000;
          this.step = step;
        }
      };
      StepCtor.prototype._yearScaleFloor = true;
      timeline.redraw();
    }
    timeline.on('select', function (p) { if (p.items.length) { var it = data.get(p.items[0]); if (it && it.url) location.href = it.url; } });
    // Keyboard: vis-timeline swallows Enter on its items, so follow the focused link ourselves.
    tlEl.addEventListener('keydown', function (e) {
      var a = e.target.closest && e.target.closest('a.tl-link');
      if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); location.href = a.getAttribute('href'); }
    }, true);
    document.querySelectorAll('[data-tl]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-tl');
        if (a === 'in') timeline.zoomIn(0.5); else if (a === 'out') timeline.zoomOut(0.5); else timeline.setWindow(toDate(min - pad), toDate(max + padR));
      });
    });
    document.querySelectorAll('[data-tier-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var pressed = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', pressed ? 'false' : 'true');
        var next = shownItems();
        data.clear();
        if (next.length) data.add(next);
        tlEl.setAttribute('data-ready', String(next.length));
      });
    });
    if (!person) mountHomeScrollbars(timeline, tlEl, toDate(min - 500), toDate(Math.min(max + 2000, new Date().getUTCFullYear() + 25)));
    // Safety net: if a dot was still measured before styles applied, rebuild the items once.
    requestAnimationFrame(function () {
      var bad = [].some.call(tlEl.querySelectorAll('.vis-item.vis-point .vis-dot'), function (d) { return d.offsetWidth > 40; });
      if (bad) { var all = data.get(); data.clear(); data.add(all); }
      tlEl.setAttribute('data-ready', String(data.get().length));
    });
  });

  function mountHomeScrollbars(timeline, tlEl, axisMin, axisMax) {
    var frame = tlEl.parentElement;
    if (!frame || !frame.classList.contains('tl-frame')) return;
    function bar(className, orientation, label) {
      var el = document.createElement('div');
      el.className = className;
      el.setAttribute('role', 'scrollbar');
      el.setAttribute('aria-orientation', orientation);
      el.setAttribute('aria-controls', 'timeline');
      el.setAttribute('aria-label', label);
      el.tabIndex = 0;
      var thumb = document.createElement('div');
      thumb.className = 'tl-scroll-thumb';
      el.appendChild(thumb);
      frame.appendChild(el);
      return { el: el, thumb: thumb };
    }
    var h = bar('tl-hscroll', 'horizontal', 'Timeline position');
    var v = bar('tl-vscroll', 'vertical', 'Timeline rows');
    function panel() { return tlEl.querySelector('.vis-panel.vis-left'); }
    function syncH() {
      var win = timeline.getWindow();
      var a0 = axisMin.getTime(), a1 = axisMax.getTime();
      var span = Math.max(1, a1 - a0);
      var start = win.start.getTime(), end = win.end.getTime();
      var width = Math.min(1, Math.max(0.04, (end - start) / span));
      var left = (start - a0) / span;
      if (left < 0) left = 0;
      if (left > 1 - width) left = 1 - width;
      h.thumb.style.left = (left * 100) + '%';
      h.thumb.style.width = (width * 100) + '%';
      h.el.setAttribute('aria-valuemin', '0');
      h.el.setAttribute('aria-valuemax', '100');
      h.el.setAttribute('aria-valuenow', String(Math.round(left * 100)));
    }
    function syncV() {
      var p = panel();
      if (!p) return;
      var maxScroll = Math.max(0, p.scrollHeight - p.clientHeight);
      var frac = maxScroll <= 0 ? 1 : Math.min(1, Math.max(0.08, p.clientHeight / p.scrollHeight));
      var top = maxScroll <= 0 ? 0 : (p.scrollTop / maxScroll) * (1 - frac);
      v.thumb.style.top = (top * 100) + '%';
      v.thumb.style.height = (frac * 100) + '%';
      v.el.setAttribute('aria-valuemin', '0');
      v.el.setAttribute('aria-valuemax', String(Math.round(maxScroll)));
      v.el.setAttribute('aria-valuenow', String(Math.round(p.scrollTop)));
    }
    function moveWindow(frac) {
      var win = timeline.getWindow();
      var span = win.end.getTime() - win.start.getTime();
      var travel = Math.max(0, axisMax.getTime() - axisMin.getTime() - span);
      var start = axisMin.getTime() + Math.max(0, Math.min(1, frac)) * travel;
      timeline.setWindow(new Date(start), new Date(start + span), { animation: false });
    }
    function moveRows(frac) {
      var p = panel();
      if (!p) return;
      var maxScroll = Math.max(0, p.scrollHeight - p.clientHeight);
      p.scrollTop = Math.max(0, Math.min(1, frac)) * maxScroll;
    }
    function drag(el, vertical, onMove) {
      el.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        el.setPointerCapture(e.pointerId);
        var rect = el.getBoundingClientRect();
        var thumb = el.querySelector('.tl-scroll-thumb').getBoundingClientRect();
        var along = vertical ? (e.clientY - rect.top - thumb.height / 2) : (e.clientX - rect.left - thumb.width / 2);
        var track = Math.max(1, (vertical ? rect.height - thumb.height : rect.width - thumb.width));
        onMove(along / track);
        function move(ev) {
          var r = el.getBoundingClientRect();
          var th = el.querySelector('.tl-scroll-thumb').getBoundingClientRect();
          var pos = vertical ? (ev.clientY - r.top - th.height / 2) : (ev.clientX - r.left - th.width / 2);
          var len = Math.max(1, (vertical ? r.height - th.height : r.width - th.width));
          onMove(pos / len);
        }
        function up() {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
        }
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        e.preventDefault();
      });
    }
    drag(h.el, false, moveWindow);
    drag(v.el, true, moveRows);
    h.el.addEventListener('keydown', function (e) {
      var win = timeline.getWindow();
      var step = (win.end.getTime() - win.start.getTime()) * (e.key === 'PageDown' || e.key === 'PageUp' ? 0.8 : 0.1);
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0;
      if (!dir) return;
      timeline.setWindow(new Date(win.start.getTime() + dir * step), new Date(win.end.getTime() + dir * step), { animation: false });
      e.preventDefault();
    });
    v.el.addEventListener('keydown', function (e) {
      var p = panel();
      if (!p) return;
      var page = Math.max(24, p.clientHeight * 0.8);
      var step = (e.key === 'PageDown' || e.key === 'PageUp') ? page : 40;
      var dir = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : (e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0;
      if (!dir) return;
      p.scrollTop += dir * step;
      e.preventDefault();
    });
    timeline.on('rangechanged', syncH);
    timeline.on('changed', function () { syncH(); syncV(); });
    var side = panel();
    if (side) side.addEventListener('scroll', syncV);
    syncH();
    syncV();
  }

  // ---------- Maps ----------
  var mapEl = document.getElementById('map') || document.getElementById('locmap');
  var locs = readJSON('map-data');
  if (mapEl && locs && window.L) {
    var map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Places: <a href="https://www.openbible.info/geo/">OpenBible.info</a> (CC BY 4.0)'
    }).addTo(map);
    var markers = [];
    locs.forEach(function (l) {
      var cert = l.certainty + (l.percent != null ? ' (' + l.percent + '%)' : '');
      var icon = L.divIcon({ className: 'pin c-' + l.certainty, html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
      var m = L.marker([l.lat, l.lng], { icon: icon, title: l.title + ' — certainty: ' + cert, keyboard: true, riseOnHover: true }).addTo(map);
      var div = document.createElement('div');
      var a = document.createElement('a'); a.href = l.url; a.textContent = l.title; a.className = 'popup-title';
      var p = document.createElement('p'); p.textContent = 'Certainty: ' + cert;
      div.appendChild(a); div.appendChild(p);
      m.bindPopup(div);
      m.on('add', function () { var el = m.getElement(); if (el) el.setAttribute('aria-label', l.title + ', certainty ' + cert); });
      var el = m.getElement(); if (el) el.setAttribute('aria-label', l.title + ', certainty ' + cert);
      markers.push(m);
    });
    if (markers.length === 1) map.setView(markers[0].getLatLng(), 6);
    else if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
    else map.setView([33, 40], 4);
    mapEl.setAttribute('data-ready', String(markers.length));
  }
})();
