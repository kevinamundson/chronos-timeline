/* Home timeline + maps. Data comes from inline JSON emitted by build.mjs. */
(function () {
  'use strict';
  function readJSON(id) { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; }

  // Historical year (negative = BC, no year 0) -> axis year A, a bijection chosen so round axis ticks
  // read as round BC years: BC y -> A = y (4500 BC -> -4500); AD y -> A = y - 1 (AD 1 -> 0).
  function toDate(y) { var a = y < 0 ? y : y - 1; var d = new Date(Date.UTC(2000, 6, 1)); d.setUTCFullYear(a); return d; }
  function astroToLabel(a) { return a < 0 ? (-a) + ' BC' : 'AD ' + (a + 1); }

  // ---------- Timeline ----------
  var tlEl = document.getElementById('timeline');
  var items = readJSON('tl-data');
  if (tlEl && items && window.vis) {
    var moment = vis.moment;
    var data = new vis.DataSet(items.map(function (it) {
      return { id: it.group + ':' + it.id, group: it.group, content: it.title, start: toDate(it.y), type: 'point',
        title: it.title + ' — ' + it.label, className: 'tier-' + it.tier, url: it.url, ord: it.y * 100 + (it.order || 0) };
    }));
    var groups = new vis.DataSet([{ id: 'events', content: 'Events' }, { id: 'people', content: 'People (birth)' }]);
    var ys = items.map(function (i) { return i.y; });
    var min = Math.min.apply(null, ys), max = Math.max.apply(null, ys);
    var pad = Math.max(50, Math.round((max - min) * 0.04));
    var YEAR = 365.25 * 864e5;
    var timeline = new vis.Timeline(tlEl, data, groups, {
      moment: function (d) { return moment(d).utc(); },
      start: toDate(min - pad), end: toDate(max + pad * 7),
      min: toDate(min - 500), max: toDate(Math.min(max + 2000, 2000)),
      zoomMin: 10 * YEAR, zoomMax: 5000 * YEAR,
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
    document.querySelectorAll('[data-tl]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-tl');
        if (a === 'in') timeline.zoomIn(0.5); else if (a === 'out') timeline.zoomOut(0.5); else timeline.setWindow(toDate(min - pad), toDate(max + pad * 7));
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
