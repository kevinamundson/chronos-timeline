/* Home timeline, person timelines and maps. Data comes from inline JSON emitted by build.mjs. */
(function () {
  'use strict';
  function readJSON(id) { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; }

  // Historical year (negative = BC, no year 0) -> axis year A, a bijection chosen so round axis ticks
  // read as round BC years: BC y -> A = y (4500 BC -> -4500); AD y -> A = y - 1 (AD 1 -> 0).
  function toDate(y) { var a = y < 0 ? y : y - 1; var d = new Date(Date.UTC(2000, 6, 1)); d.setUTCFullYear(a); return d; }
  function astroToLabel(a) { return a < 0 ? (-a) + ' BC' : 'AD ' + (a + 1); }

  // ---------- Timeline ----------
  var tlEl = document.getElementById('timeline');
  var raw = readJSON('tl-data');
  if (tlEl && raw && window.vis) {
    var moment = vis.moment;
    var person = !Array.isArray(raw) && raw.mode === 'person';
    var items = person ? raw.items : raw;
    var data = new vis.DataSet(items.map(function (it) {
      var cls = 'tier-' + it.tier + (person ? (it.own ? ' own' : ' ctx') : '');
      var label = it.title + ' — ' + it.label + (person && !it.own ? ' (context)' : '');
      return { id: it.group + ':' + it.id, group: it.group, content: it.title, start: toDate(it.y), type: 'point',
        title: label, aria: label, className: cls, url: it.url, own: !!it.own, ord: it.y * 100 + (it.order || 0) };
    }));
    var groups = person
      ? new vis.DataSet([{ id: 'own', content: raw.person + '’s life', order: 1 }, { id: 'context', content: 'Context', order: 2, className: 'grp-ctx' }])
      : new vis.DataSet([{ id: 'events', content: 'Events' }, { id: 'people', content: 'People (birth)' }]);
    var ys = items.map(function (i) { return i.y; });
    var min = person ? raw.start : Math.min.apply(null, ys), max = person ? raw.stop : Math.max.apply(null, ys);
    var pad = person ? Math.max(3, Math.round((max - min) * 0.05)) : Math.max(50, Math.round((max - min) * 0.04));
    var padR = person ? pad * 4 : pad * 7;
    var YEAR = 365.25 * 864e5;
    var timeline = new vis.Timeline(tlEl, data, groups, {
      moment: function (d) { return moment(d).utc(); },
      start: toDate(min - pad), end: toDate(max + padR),
      min: toDate(min - (person ? 200 : 500)), max: toDate(Math.min(max + (person ? 400 : 2000), 2000)),
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
      maxHeight: window.matchMedia('(max-width: 640px)').matches ? '520px' : '640px', minHeight: '320px',
      margin: { item: { horizontal: 4, vertical: 6 } },
      format: {
        minorLabels: function (date, scale) { return scale === 'year' ? astroToLabel(date.year()) : date.format('MMM'); },
        majorLabels: function (date, scale) { return (scale === 'year' || scale === 'decade' || scale === 'century' || scale === 'millennium') ? '' : astroToLabel(date.year()); }
      },
      tooltip: { followMouse: true },
      order: function (a, b) { return a.ord - b.ord; }
    });
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
    tlEl.setAttribute('data-ready', String(items.length));
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
