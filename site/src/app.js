/* Home timeline, person timelines and maps. Data comes from inline JSON emitted by build.mjs. */
(function () {
  'use strict';
  function readJSON(id) { var el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; }

  // Historical year (negative = BC, no year 0) -> axis year A, a bijection chosen so round axis ticks
  // read as round BC years: BC y -> A = y (4500 BC -> -4500); AD y -> A = y - 1 (AD 1 -> 0).
  function toDate(y) { var a = y < 0 ? y : y - 1; var d = new Date(Date.UTC(2000, 6, 1)); d.setUTCFullYear(a); return d; }
  function astroToLabel(a) { return a < 0 ? (-a) + ' BC' : 'AD ' + (a + 1); }
  // Assigned before the timeline boots. whenStyles can run that boot in the same turn.
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  var tlRoot = document.getElementById('timeline');
  var eventsEl = document.getElementById('timeline-events');
  var peopleEl = document.getElementById('timeline-people');
  var raw = readJSON('tl-data');
  if (tlRoot && raw && window.vis) whenStyles(function () {
    var moment = vis.moment;
    var person = !Array.isArray(raw) && raw.mode === 'person';
    var items = person ? raw.items : raw;
    var RALEIGH_NOTE = "Derived by the portal from Raleigh's Creation in 4032 BC; Raleigh prints only the yeere of the World.";
    function visItem(it) {
      // Standby is not a tier. Its class is "standby", never "tier-*".
      var cls = (it.standby ? 'standby' : ('tier-' + it.tier)) + (person ? (it.own ? ' own' : ' ctx') : '');
      var label = it.title + ' — ' + it.label + (person && !it.own ? ' (context)' : '');
      if (it.raleigh) label += '. ' + it.raleigh + '. ' + RALEIGH_NOTE;
      // Home events keep a point even when a chronology gives them an end year.
      // A person page draws one bar for the lifespan (span), the same years as the home chart.
      var range = it.yEnd != null && it.yEnd !== it.y && (it.group === 'people' || it.span) && !it.standby;
      var row = { id: it.group + ':' + it.id, group: it.group, content: it.title, start: toDate(it.y), type: range ? 'range' : 'point',
        title: label, aria: label, className: cls, url: it.url, own: !!it.own, standby: !!it.standby, ord: it.y * 100 + (it.order || 0) + (it.standby ? 0.5 : 0), tier: it.standby ? 'standby' : it.tier };
      if (range) row.end = toDate(it.yEnd);
      return row;
    }
    var built = items.map(visItem);
    function shownItems() {
      var buttons = document.querySelectorAll('[data-tier-toggle]');
      if (!buttons.length) return built.map(function (it) { return Object.assign({}, it); });
      // A tier with no button stays visible. Home lists every tier. Person pages list only Standby,
      // so tier items stay on and standby stays off until that control is pressed.
      var controlled = {};
      [].forEach.call(buttons, function (b) { controlled[b.getAttribute('data-tier-toggle')] = b.getAttribute('aria-pressed') === 'true'; });
      return built.filter(function (it) {
        if (Object.prototype.hasOwnProperty.call(controlled, it.tier)) return controlled[it.tier];
        return true;
      }).map(function (it) { return Object.assign({}, it); });
    }
    var ys = items.map(function (i) { return i.y; });
    var min = person ? raw.start : Math.min.apply(null, ys), max = person ? raw.stop : Math.max.apply(null, ys);
    // Home opens on the ancient span (to AD 100) as before; later (AD) items are reachable by panning/zooming.
    var viewMax = person ? max : Math.min(max, 100);
    var pad = person ? Math.max(3, Math.round((max - min) * 0.05)) : Math.max(50, Math.round((viewMax - min) * 0.04));
    var padR = person ? pad * 4 : pad * 7;
    var YEAR = 365.25 * 864e5;
    var narrow = window.matchMedia('(max-width: 640px)').matches;
    var windowOpts = {
      start: toDate(min - pad), end: toDate(viewMax + padR),
      min: toDate(min - (person ? 200 : 500)), max: toDate(Math.min(max + (person ? 400 : 2000), new Date().getUTCFullYear() + 25))
    };
    function chartOptions(extra) {
      return Object.assign({
        moment: function (d) { return moment(d).utc(); },
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
        verticalScroll: true, stack: true, showCurrentTime: false, selectable: true,
        margin: { item: { horizontal: 4, vertical: 6 } },
        format: {
          minorLabels: function (date, scale) { return scale === 'year' ? astroToLabel(date.year()) : date.format('MMM'); },
          majorLabels: function (date, scale) { return (scale === 'year' || scale === 'decade' || scale === 'century' || scale === 'millennium') ? '' : astroToLabel(date.year()); }
        },
        tooltip: { followMouse: true },
        order: function (a, b) { return a.ord - b.ord; }
      }, windowOpts, extra);
    }
    // vis-timeline keeps the chart visibility:hidden until a "changed" event that follows its
    // deferred rangechanged (200ms). Person pages never redraw again, so the chart stays blank.
    // Show it once a draw has run. initialDrawDone is set after vis's own handler, which removes
    // the loading screen itself when it is the one that reveals the chart.
    function armReveal(timeline) {
      function reveal() {
        if (!timeline.dom || !timeline.dom.root) return;
        timeline.dom.root.style.visibility = 'visible';
        var screen = timeline.dom.loadingScreen;
        if (screen && screen.parentNode) screen.parentNode.removeChild(screen);
        timeline.initialDrawDone = true;
        if (timeline.itemSet) timeline.itemSet.initialDrawDone = true;
      }
      timeline.on('changed', reveal);
      timeline.on('rangechanged', reveal);
      requestAnimationFrame(reveal);
      setTimeout(reveal, 400);
    }
    // vis-timeline only has year steps up to 1000. A wider window (a phone showing the whole chart)
    // misses every step and falls through to a day scale, so hundreds of labels pile on the first tick.
    // 1000 years is still narrower than the label budget there, so keep adding 1000 until the step fits.
    // Closer windows stay on whatever scale vis chose (a person chart zoomed in must not jump to millennia).
    function installYearFloor(timeline) {
      var StepCtor = timeline.timeAxis && timeline.timeAxis.step && timeline.timeAxis.step.constructor;
      if (!StepCtor || StepCtor.prototype._yearScaleFloor) return;
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
      // The constructor already queued its first draw. The patch is in place before that frame.
      timeline.redraw();
    }
    function wireChart(el, timeline, dataset) {
      armReveal(timeline);
      installYearFloor(timeline);
      timeline.on('select', function (p) { if (p.items.length) { var it = dataset.get(p.items[0]); if (it && it.url) location.href = it.url; } });
      // Keyboard: vis-timeline swallows Enter on its items, so follow the focused link ourselves.
      el.addEventListener('keydown', function (e) {
        var a = e.target.closest && e.target.closest('a.tl-link');
        if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); location.href = a.getAttribute('href'); }
      }, true);
      // Safety net: if a dot was still measured before styles applied, rebuild the items once.
      requestAnimationFrame(function () {
        var bad = [].some.call(el.querySelectorAll('.vis-item.vis-point .vis-dot'), function (d) { return d.offsetWidth > 40; });
        if (bad) { var all = dataset.get(); dataset.clear(); if (all.length) dataset.add(all); }
      });
    }
    function syncWindows(a, b) {
      var lock = false;
      function follow(src, dst) {
        src.on('rangechange', function () {
          if (lock) return;
          lock = true;
          var w = src.getWindow();
          dst.setWindow(w.start, w.end, { animation: false });
          lock = false;
        });
      }
      follow(a, b);
      follow(b, a);
    }
    var home = !person && eventsEl && peopleEl;
    var timeline;
    if (home) {
      var evItems = shownItems().filter(function (it) { return it.group === 'events'; });
      var peItems = shownItems().filter(function (it) { return it.group === 'people'; });
      var evData = new vis.DataSet(evItems);
      var peData = new vis.DataSet(peItems);
      // Headings above the panes name the charts. The group label is empty so vis draws no gutter.
      var evTl = new vis.Timeline(eventsEl, evData, new vis.DataSet([{ id: 'events', content: '', order: 1 }]), chartOptions({
        orientation: { axis: 'top', item: 'top' },
        maxHeight: narrow ? '280px' : '380px', minHeight: '160px'
      }));
      var peTl = new vis.Timeline(peopleEl, peData, new vis.DataSet([{ id: 'people', content: '', order: 1 }]), chartOptions({
        orientation: { axis: 'bottom', item: 'top' },
        maxHeight: narrow ? '220px' : '260px', minHeight: '140px'
      }));
      wireChart(eventsEl, evTl, evData);
      wireChart(peopleEl, peTl, peData);
      syncWindows(evTl, peTl);
      collapseHomeGutter(evTl);
      collapseHomeGutter(peTl);
      mountYearRange(evTl, windowOpts.min, windowOpts.max);
      timeline = evTl;
      window.__timeline = evTl; // exposed for site/verify.mjs; people follow this window
      window.__timelinePeople = peTl;
      tlRoot.setAttribute('data-ready', String(evItems.length + peItems.length));
      document.querySelectorAll('[data-tier-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
          var pressed = b.getAttribute('aria-pressed') === 'true';
          b.setAttribute('aria-pressed', pressed ? 'false' : 'true');
          var next = shownItems();
          var ev = next.filter(function (it) { return it.group === 'events'; });
          var pe = next.filter(function (it) { return it.group === 'people'; });
          evData.clear(); if (ev.length) evData.add(ev);
          peData.clear(); if (pe.length) peData.add(pe);
          tlRoot.setAttribute('data-ready', String(next.length));
        });
      });
      mountHomeScrollbars(evTl, peTl, eventsEl, peopleEl, toDate(min - 500), toDate(Math.min(max + 2000, new Date().getUTCFullYear() + 25)));
    } else {
      var data = new vis.DataSet(shownItems());
      var groups = new vis.DataSet([{ id: 'own', content: raw.person + '’s life', order: 1 }, { id: 'context', content: 'Context', order: 2, className: 'grp-ctx' }]);
      timeline = new vis.Timeline(tlRoot, data, groups, chartOptions({
        orientation: { axis: 'both', item: 'top' }, minHeight: '200px'
      }));
      wireChart(tlRoot, timeline, data);
      window.__timeline = timeline;
      tlRoot.setAttribute('data-ready', String(data.get().length));
      document.querySelectorAll('[data-tier-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
          var pressed = b.getAttribute('aria-pressed') === 'true';
          b.setAttribute('aria-pressed', pressed ? 'false' : 'true');
          var next = shownItems();
          data.clear();
          if (next.length) data.add(next);
          tlRoot.setAttribute('data-ready', String(next.length));
        });
      });
    }
    document.querySelectorAll('[data-tl]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-tl');
        if (a === 'in') timeline.zoomIn(0.5);
        else if (a === 'out') timeline.zoomOut(0.5);
        else timeline.setWindow(toDate(min - pad), toDate(max + padR), { animation: false });
      });
    });
  });

  // vis reserves a scrollbar gutter on the left panel. Home headings replace that column,
  // so the reserved width is cleared once the first real draw has measured it.
  function collapseHomeGutter(timeline) {
    var pending = false;
    function hideLabels() {
      var root = timeline.dom && timeline.dom.container;
      if (!root) return;
      var sets = root.querySelectorAll('.vis-labelset');
      for (var i = 0; i < sets.length; i++) sets[i].setAttribute('aria-hidden', 'true');
    }
    function force() {
      hideLabels();
      if (!timeline.props || !timeline.initialDrawDone) return;
      if (timeline.props.scrollbarWidth === 0) return;
      timeline.props.scrollbarWidth = 0;
      if (pending) return;
      pending = true;
      if (timeline._origRedraw) timeline._origRedraw();
      else timeline.redraw();
      pending = false;
    }
    timeline.on('changed', force);
    setTimeout(force, 0);
    setTimeout(force, 80);
  }

  // Historical years skip 0: …, 2 BC, 1 BC, AD 1, AD 2, …
  function nextHist(y) { return y === -1 ? 1 : y + 1; }
  function yearCount(first, last) {
    if (first < 0 && last > 0) return last - first;
    return last - first + 1;
  }
  function indexToYear(first, i) {
    var y = first + i;
    if (first < 0 && y >= 0) y += 1;
    return y;
  }
  function yearToIndex(first, y) {
    if (y >= 1 && first < 0) return y - 1 - first;
    return y - first;
  }
  function histLabel(y) { return y < 0 ? (-y) + ' BC' : 'AD ' + y; }
  function dateToHistYear(d) {
    var a = d.getUTCFullYear();
    return a < 0 ? a : a + 1;
  }
  function histParts(d) {
    return {
      year: dateToHistYear(d),
      month: d.getUTCMonth(),
      day: d.getUTCDate(),
      exact: d.getUTCDate() === 1 && d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0
    };
  }
  // The window end is the exclusive right edge. A boundary on the first instant of a
  // month belongs to the previous month. Year mode still shows that month's year.
  function readEdge(d, end) {
    if (end && histParts(d).exact) return histParts(new Date(d.getTime() - 1));
    return histParts(d);
  }
  function histToDate(year, month, day) {
    var axis = year < 0 ? year : year - 1;
    var d = new Date(Date.UTC(2000, month, day, 0, 0, 0, 0));
    d.setUTCFullYear(axis);
    return d;
  }

  // A fixed pool of rows. Scroll height stands for every year; the DOM does not.
  function mountWheel(host, opts) {
    var row = parseFloat(getComputedStyle(host).getPropertyValue('--tl-row'));
    if (!row || row < 30) row = 44;
    var count = opts.count;
    var index = -1;
    var lock = 0;
    var drag = null;
    var dragMoved = false;
    host.innerHTML = '';
    var spin = document.createElement('div');
    spin.className = 'tl-wheel-spin';
    spin.tabIndex = 0;
    spin.setAttribute('role', 'spinbutton');
    spin.setAttribute('aria-label', opts.label);
    var view = document.createElement('div');
    view.className = 'tl-wheel-view';
    var band = document.createElement('div');
    band.className = 'tl-wheel-band';
    band.setAttribute('aria-hidden', 'true');
    var scroller = document.createElement('div');
    scroller.className = 'tl-wheel-scroll';
    scroller.dataset.row = String(row);
    scroller.tabIndex = -1;
    var spacer = document.createElement('div');
    spacer.className = 'tl-wheel-spacer';
    spacer.style.height = ((count + 4) * row) + 'px';
    var pool = [];
    for (var n = 0; n < 11; n++) {
      var item = document.createElement('div');
      item.className = 'tl-wheel-item';
      item.setAttribute('aria-hidden', 'true');
      spacer.appendChild(item);
      pool.push(item);
    }
    scroller.appendChild(spacer);
    view.appendChild(band);
    view.appendChild(scroller);
    spin.appendChild(view);
    host.appendChild(spin);
    // A numeric keypad cannot type BC or AD, so the era is a separate control.
    // There is no year 0. Out-of-range and year 0 stay on the dialog's inline error.
    var editing = false;
    var suppress = false;
    var originIndex = 0;
    var edit = null;
    var input = null;
    var era = null;
    var bcBtn = null;
    var adBtn = null;
    if (opts.canType) {
      host.classList.add('tl-wheel-typeable');
      edit = document.createElement('div');
      edit.className = 'tl-wheel-edit';
      edit.hidden = true;
      edit.setAttribute('aria-hidden', 'true');
      input = document.createElement('input');
      input.type = 'text';
      if (host.id) input.id = host.id + '-input';
      input.className = 'tl-wheel-year-input';
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]*');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'none');
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('enterkeyhint', 'done');
      input.setAttribute('aria-label', opts.label + ' number');
      input.setAttribute('aria-errormessage', 'tl-range-error');
      input.maxLength = 6;
      edit.appendChild(input);
      host.appendChild(edit);
      era = document.createElement('div');
      era.className = 'segmented tl-wheel-era';
      if (host.id) era.id = host.id + '-era';
      era.hidden = true;
      era.setAttribute('role', 'group');
      era.setAttribute('aria-label', opts.label + ' era');
      era.setAttribute('aria-hidden', 'true');
      bcBtn = document.createElement('button');
      bcBtn.type = 'button';
      bcBtn.textContent = 'BC';
      bcBtn.setAttribute('aria-pressed', 'true');
      adBtn = document.createElement('button');
      adBtn.type = 'button';
      adBtn.textContent = 'AD';
      adBtn.setAttribute('aria-pressed', 'false');
      era.appendChild(bcBtn);
      era.appendChild(adBtn);
      var eraParent = host.parentElement && host.parentElement.parentElement;
      (eraParent || host).appendChild(era);
      if (host.id) {
        var hint = document.createElement('span');
        hint.className = 'visually-hidden';
        hint.id = host.id + '-typehint';
        hint.textContent = 'Tap the highlighted year to type a number. Choose BC or AD separately. There is no year 0.';
        host.appendChild(hint);
        spin.setAttribute('aria-describedby', hint.id);
      }
    }
    function clamp(i) { return Math.max(0, Math.min(count - 1, i)); }
    function render() {
      if (index < 0) return;
      var first = index - 5;
      for (var p = 0; p < pool.length; p++) {
        var i = first + p;
        var el = pool[p];
        if (i < 0 || i >= count) { el.hidden = true; el.classList.remove('is-selected'); continue; }
        el.hidden = false;
        el.style.top = ((2 + i) * row) + 'px';
        el.textContent = opts.textAt(i);
        el.dataset.index = String(i);
        el.classList.toggle('is-selected', i === index);
        var dist = Math.abs(i - index);
        el.style.opacity = dist === 0 ? '1' : dist === 1 ? '0.72' : '0.4';
      }
    }
    function paintAria() {
      spin.setAttribute('aria-valuemin', String(opts.minValue));
      spin.setAttribute('aria-valuemax', String(opts.maxValue));
      spin.setAttribute('aria-valuenow', String(opts.valueAt(index)));
      spin.setAttribute('aria-valuetext', (opts.valueText || opts.textAt)(index));
      spin.dataset.value = String(opts.valueAt(index));
    }
    function sync() {
      if (index < 0 || scroller.clientHeight < 10) return;
      lock++;
      scroller.scrollTop = index * row;
      render();
      lock--;
    }
    function setIndex(i, fromScroll, notify) {
      i = clamp(i);
      var changed = i !== index;
      index = i;
      paintAria();
      if (!fromScroll) sync();
      render();
      if (notify && changed && opts.onChange) opts.onChange();
    }
    var snapTimer = 0;
    scroller.addEventListener('scroll', function () {
      if (lock || scroller.clientHeight < 10) return;
      if (editing) {
        if (Math.abs(scroller.scrollTop - index * row) > 1) {
          lock++;
          scroller.scrollTop = index * row;
          lock--;
        }
        return;
      }
      var i = clamp(Math.round(scroller.scrollTop / row));
      if (i !== index) setIndex(i, true, true);
      else render();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () {
        if (Math.abs(scroller.scrollTop - index * row) > 1) {
          lock++;
          scroller.scrollTop = index * row;
          lock--;
        }
      }, 80);
    });
    function eraIsAD() { return !!(adBtn && adBtn.getAttribute('aria-pressed') === 'true'); }
    function paintEra(ad) {
      if (!bcBtn) return;
      bcBtn.setAttribute('aria-pressed', ad ? 'false' : 'true');
      adBtn.setAttribute('aria-pressed', ad ? 'true' : 'false');
    }
    function closeEditor() {
      if (!edit) return;
      edit.hidden = true;
      if (era) era.hidden = true;
      edit.setAttribute('aria-hidden', 'true');
      if (era) era.setAttribute('aria-hidden', 'true');
      host.classList.remove('is-editing');
      scroller.style.pointerEvents = '';
    }
    function readTyped() {
      var digits = input.value.replace(/\D/g, '').slice(0, 6);
      if (digits !== input.value) {
        var atEnd = input.selectionStart === input.value.length;
        input.value = digits;
        var pos = atEnd ? digits.length : Math.min(input.selectionStart || digits.length, digits.length);
        try { input.setSelectionRange(pos, pos); } catch (err) { /* hidden while the dialog closes */ }
      }
      if (digits === '') return { incomplete: true };
      var n = parseInt(digits, 10);
      if (!isFinite(n)) return { incomplete: true };
      if (n === 0) return { message: 'There is no year 0.' };
      var y = eraIsAD() ? n : -n;
      if (y < opts.yearMin || y > opts.yearMax) {
        return { message: 'Enter a year from ' + opts.yearLabel(opts.yearMin) + ' to ' + opts.yearLabel(opts.yearMax) + '.' };
      }
      return { ok: true, index: opts.indexForYear(y) };
    }
    function rangePrompt() {
      return 'Enter a year from ' + opts.yearLabel(opts.yearMin) + ' to ' + opts.yearLabel(opts.yearMax) + '.';
    }
    function applyTyped(commit) {
      var parsed = readTyped();
      if (parsed.ok) {
        input.setAttribute('aria-invalid', 'false');
        if (opts.onTyped) opts.onTyped('');
        setIndex(parsed.index, false, true);
        return true;
      }
      setIndex(originIndex, false, false);
      if (!commit && parsed.incomplete) {
        input.setAttribute('aria-invalid', 'false');
        if (opts.onTyped) opts.onTyped('');
        return false;
      }
      input.setAttribute('aria-invalid', 'true');
      if (opts.onTyped) opts.onTyped(parsed.message || rangePrompt());
      return false;
    }
    function finishEdit(refocus) {
      editing = false;
      closeEditor();
      if (refocus) spin.focus();
    }
    function commitEdit(keepOpenIfInvalid, refocus) {
      if (suppress || !editing) return false;
      var ok = applyTyped(true);
      if (!ok && keepOpenIfInvalid) return false;
      finishEdit(!!refocus && ok);
      return ok;
    }
    function abortEdit(hide) {
      if (!opts.canType || !input) return;
      suppress = true;
      if (editing) {
        editing = false;
        setIndex(originIndex, false, false);
      }
      // Hiding the field during Escape moves focus and can cancel the dialog's own close.
      if (hide !== false) closeEditor();
    }
    function beginEdit(seed) {
      if (!opts.canType || !input || editing) return;
      suppress = false;
      editing = true;
      originIndex = index;
      host.classList.add('is-editing');
      edit.hidden = false;
      era.hidden = false;
      edit.removeAttribute('aria-hidden');
      era.removeAttribute('aria-hidden');
      scroller.style.pointerEvents = 'none';
      var y = opts.valueAt(index);
      paintEra(y > 0);
      input.value = seed != null ? String(seed) : String(Math.abs(y));
      applyTyped(false);
      setTimeout(function () {
        if (!editing) return;
        input.focus();
        if (seed == null) input.select();
        else {
          var len = input.value.length;
          try { input.setSelectionRange(len, len); } catch (err2) {}
        }
      }, 0);
    }
    function selectEra(ad) {
      paintEra(ad);
      if (editing) applyTyped(false);
      if (input && editing) input.focus();
    }
    function bindEra(btn, ad) {
      // Keep the keypad field focused. preventDefault on pointerdown can swallow click, so the era changes here too.
      btn.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        e.preventDefault();
        selectEra(ad);
      });
      btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
      btn.addEventListener('click', function () { selectEra(ad); });
    }
    if (opts.canType && input) {
      bindEra(bcBtn, false);
      bindEra(adBtn, true);
      input.addEventListener('input', function () { if (editing) applyTyped(false); });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        e.stopPropagation();
        if (opts.holdApply) opts.holdApply();
        commitEdit(true, true);
      });
      input.addEventListener('blur', function (e) {
        if (!editing || suppress) return;
        var next = e.relatedTarget;
        if (next && era && era.contains(next)) return;
        commitEdit(false, false);
      });
      era.addEventListener('focusout', function (e) {
        if (!editing || suppress) return;
        var next = e.relatedTarget;
        if (next && (next === input || era.contains(next))) return;
        commitEdit(false, false);
      });
    }
    spin.addEventListener('keydown', function (e) {
      if (opts.canType && !editing && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        beginEdit();
        return;
      }
      if (opts.canType && !editing && e.key.length === 1 && e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        e.stopPropagation();
        beginEdit(e.key);
        return;
      }
      var next = null;
      if (e.key === 'ArrowDown') next = index + 1;
      else if (e.key === 'ArrowUp') next = index - 1;
      else if (e.key === 'PageDown') next = index + 10;
      else if (e.key === 'PageUp') next = index - 10;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = count - 1;
      else return;
      e.preventDefault();
      e.stopPropagation();
      setIndex(next, false, true);
    });
    scroller.addEventListener('click', function (e) {
      if (dragMoved) { dragMoved = false; return; }
      var el = document.elementFromPoint(e.clientX, e.clientY);
      el = el && el.closest && el.closest('.tl-wheel-item');
      if (!el || el.hidden || !host.contains(el)) return;
      var picked = +el.dataset.index;
      if (opts.canType && picked === index) {
        beginEdit();
        return;
      }
      setIndex(picked, false, true);
      spin.focus();
    });
    scroller.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || (e.button != null && e.button !== 0)) return;
      drag = { y: e.clientY, top: scroller.scrollTop, id: e.pointerId };
      dragMoved = false;
      scroller.setPointerCapture(e.pointerId);
    });
    scroller.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.y;
      if (Math.abs(dy) > 4) dragMoved = true;
      scroller.scrollTop = drag.top - dy;
    });
    function endDrag(e) { if (drag && (!e || e.pointerId === drag.id)) drag = null; }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    setIndex(0, false, false);
    return {
      assign: function (i) { setIndex(i, false, false); },
      sync: sync,
      focus: function () { spin.focus(); },
      getValue: function () { return opts.valueAt(index); },
      getIndex: function () { return index; },
      spin: spin,
      isEditing: function () { return editing; },
      abortEdit: abortEdit,
      commitEdit: function (keep, refocus) { return commitEdit(keep, refocus); }
    };
  }

  // One dialog sets the shared Events and People window. Months change the view only.
  function mountYearRange(timeline, axisMin, axisMax) {
    var dialog = document.getElementById('tl-range-dialog');
    var openBtn = document.getElementById('tl-range-open');
    if (!dialog || !openBtn || !timeline) return;
    var first = dateToHistYear(axisMin);
    var last = dateToHistYear(axisMax);
    if (first === 0) first = -1;
    if (last === 0) last = 1;
    if (!(first < last)) return;
    if (yearToIndex(first, first) !== 0 || indexToYear(first, yearCount(first, last) - 1) !== last) throw new Error('Timeline year range does not cover its ends.');
    if (first < 0 && last > 0 && yearToIndex(first, 1) !== yearToIndex(first, -1) + 1) throw new Error('Timeline year range includes a year 0.');
    (function sample(a, b) {
      var prev = null;
      for (var i = 0; i < yearCount(a, b); i++) {
        var y = indexToYear(a, i);
        if (y === 0 || yearToIndex(a, y) !== i || (prev != null && !(y > prev))) throw new Error('Timeline year map is not ordered.');
        prev = y;
      }
    })(-8, 8);
    dialog.dataset.yearFirst = String(first);
    dialog.dataset.yearLast = String(last);
    var count = yearCount(first, last);
    var monthMode = false;
    var yearBtn = document.getElementById('tl-range-mode-year');
    var monthBtn = document.getElementById('tl-range-mode-month');
    var applyBtn = document.getElementById('tl-range-apply');
    var cancelBtn = document.getElementById('tl-range-cancel');
    var errorEl = document.getElementById('tl-range-error');
    var form = document.getElementById('tl-range-form');
    var startMonthHost = document.getElementById('tl-range-start-month');
    var endMonthHost = document.getElementById('tl-range-end-month');
    var typedError = '';
    var blockApply = false;
    function userWheelChange() {
      typedError = '';
      updateValidity();
    }
    function monthWheel(host, label) {
      return mountWheel(host, {
        label: label,
        count: 12,
        minValue: 1,
        maxValue: 12,
        textAt: function (i) { return MONTHS_SHORT[i]; },
        valueText: function (i) { return MONTHS[i]; },
        valueAt: function (i) { return i + 1; },
        onChange: userWheelChange
      });
    }
    function yearWheel(host, label) {
      return mountWheel(host, {
        label: label,
        count: count,
        minValue: first,
        maxValue: last,
        textAt: function (i) { return histLabel(indexToYear(first, i)); },
        valueAt: function (i) { return indexToYear(first, i); },
        onChange: userWheelChange,
        canType: true,
        yearMin: first,
        yearMax: last,
        yearLabel: histLabel,
        indexForYear: function (y) { return yearToIndex(first, y); },
        onTyped: function (msg) { typedError = msg || ''; updateValidity(); },
        holdApply: function () {
          blockApply = true;
          setTimeout(function () { blockApply = false; }, 0);
        }
      });
    }
    var startMonth = monthWheel(startMonthHost, 'Start month');
    var startYear = yearWheel(document.getElementById('tl-range-start-year'), 'Start year');
    var endMonth = monthWheel(endMonthHost, 'End month');
    var endYear = yearWheel(document.getElementById('tl-range-end-year'), 'End year');
    function paintMode() {
      yearBtn.setAttribute('aria-pressed', monthMode ? 'false' : 'true');
      monthBtn.setAttribute('aria-pressed', monthMode ? 'true' : 'false');
      startMonthHost.hidden = !monthMode;
      endMonthHost.hidden = !monthMode;
    }
    function rangeValid() {
      var sy = startYear.getValue();
      var ey = endYear.getValue();
      if (sy < ey) return true;
      if (sy > ey) return false;
      if (!monthMode) return true;
      return startMonth.getIndex() <= endMonth.getIndex();
    }
    function updateValidity() {
      var inverted = !rangeValid();
      var msg = typedError || (inverted ? 'The start is after the end.' : '');
      var show = msg !== '';
      applyBtn.disabled = show;
      applyBtn.setAttribute('aria-invalid', show ? 'true' : 'false');
      if (errorEl.textContent !== msg) errorEl.textContent = msg;
      errorEl.hidden = !show;
    }
    function align() {
      if (!dialog.open) return;
      startYear.sync();
      endYear.sync();
      if (monthMode) { startMonth.sync(); endMonth.sync(); }
    }
    function yearIndex(y) {
      if (y < first) y = first;
      if (y > last) y = last;
      if (y === 0) y = y < 0 ? -1 : 1;
      return yearToIndex(first, y);
    }
    function fillFromWindow() {
      typedError = '';
      startYear.abortEdit();
      endYear.abortEdit();
      var w = timeline.getWindow();
      var s = readEdge(w.start, false);
      var e = readEdge(w.end, true);
      monthMode = false;
      paintMode();
      startYear.assign(yearIndex(s.year));
      endYear.assign(yearIndex(e.year));
      startMonth.assign(s.month);
      endMonth.assign(e.month);
      updateValidity();
    }
    function nextMonth(y, m) {
      if (m < 11) return { year: y, month: m + 1 };
      return { year: nextHist(y), month: 0 };
    }
    function applyRange() {
      var sy = startYear.getValue();
      var ey = endYear.getValue();
      var startDate;
      var endDate;
      if (monthMode) {
        startDate = histToDate(sy, startMonth.getIndex(), 1);
        var n = nextMonth(ey, endMonth.getIndex());
        endDate = histToDate(n.year, n.month, 1);
      } else {
        startDate = histToDate(sy, 0, 1);
        endDate = histToDate(nextHist(ey), 0, 1);
      }
      timeline.setWindow(startDate, endDate, { animation: false });
    }
    function tabbables() {
      return [].filter.call(dialog.querySelectorAll('button, [role="spinbutton"], input.tl-wheel-year-input'), function (el) {
        if (el.disabled) return false;
        var box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      });
    }
    yearBtn.addEventListener('click', function () {
      monthMode = false;
      paintMode();
      updateValidity();
    });
    monthBtn.addEventListener('click', function () {
      monthMode = true;
      paintMode();
      updateValidity();
      requestAnimationFrame(align);
      setTimeout(align, 60);
    });
    openBtn.addEventListener('click', function () {
      if (dialog.open) return;
      fillFromWindow();
      openBtn.setAttribute('aria-expanded', 'true');
      dialog.showModal();
      align();
      requestAnimationFrame(align);
      requestAnimationFrame(function () { requestAnimationFrame(align); });
      setTimeout(align, 60);
      setTimeout(align, 180);
      startYear.focus();
    });
    cancelBtn.addEventListener('click', function () { dialog.close('cancel'); });
    form.addEventListener('submit', function (e) {
      var typing = startYear.isEditing() || endYear.isEditing();
      if (startYear.isEditing()) startYear.commitEdit(false, false);
      if (endYear.isEditing()) endYear.commitEdit(false, false);
      // Enter in the year field commits that year. It does not apply the window.
      if (blockApply || typing || typedError || !rangeValid()) { e.preventDefault(); return; }
      applyRange();
    });
    dialog.addEventListener('close', function () {
      startYear.abortEdit();
      endYear.abortEdit();
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus({ preventScroll: true });
    });
    // WebKit does not keep Tab inside a dialog, so the cycle is handled here.
    // Escape still closes the dialog without applying. An open year field is discarded first.
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dialog.open) {
        typedError = '';
        startYear.abortEdit(false);
        endYear.abortEdit(false);
        return;
      }
      if (e.key !== 'Tab' || !dialog.open) return;
      var list = tabbables();
      if (!list.length) return;
      var i = list.indexOf(document.activeElement);
      e.preventDefault();
      if (i < 0) { list[e.shiftKey ? list.length - 1 : 0].focus(); return; }
      list[(i + (e.shiftKey ? list.length - 1 : 1)) % list.length].focus();
    }, true);
    document.addEventListener('focusin', function (e) {
      if (!dialog.open || dialog.contains(e.target)) return;
      var list = tabbables();
      if (list.length) list[0].focus();
    });
    paintMode();
    updateValidity();
  }

  // Events and People are separate charts that share one time window. Each has its own
  // vertical bar. One horizontal bar moves both.
  function mountHomeScrollbars(evTl, peTl, eventsEl, peopleEl, axisMin, axisMax) {
    var split = eventsEl.closest('.tl-split');
    var eventsBlock = eventsEl.parentElement;
    var peopleBlock = peopleEl.parentElement;
    if (!split || !eventsBlock || !peopleBlock) return;
    function bar(className, orientation, label, controls, parent) {
      var el = document.createElement('div');
      el.className = className;
      el.setAttribute('role', 'scrollbar');
      el.setAttribute('aria-orientation', orientation);
      el.setAttribute('aria-controls', controls);
      el.setAttribute('aria-label', label);
      el.tabIndex = 0;
      var thumb = document.createElement('div');
      thumb.className = 'tl-scroll-thumb';
      el.appendChild(thumb);
      parent.appendChild(el);
      return { el: el, thumb: thumb };
    }
    var h = bar('tl-hscroll', 'horizontal', 'Timeline position', 'timeline', split);
    var ve = bar('tl-vscroll tl-vscroll-events', 'vertical', 'Events rows', 'timeline-events', eventsBlock);
    var vp = bar('tl-vscroll tl-vscroll-people', 'vertical', 'People rows', 'timeline-people', peopleBlock);
    function panel(root) { return root.querySelector('.vis-panel.vis-left'); }
    function syncH() {
      var win = evTl.getWindow();
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
    function syncV(root, barObj) {
      var p = panel(root);
      if (!p) return;
      var maxScroll = Math.max(0, p.scrollHeight - p.clientHeight);
      var frac = maxScroll <= 0 ? 1 : Math.min(1, Math.max(0.08, p.clientHeight / p.scrollHeight));
      var top = maxScroll <= 0 ? 0 : (p.scrollTop / maxScroll) * (1 - frac);
      barObj.thumb.style.top = (top * 100) + '%';
      barObj.thumb.style.height = (frac * 100) + '%';
      barObj.el.setAttribute('aria-valuemin', '0');
      barObj.el.setAttribute('aria-valuemax', String(Math.round(maxScroll)));
      barObj.el.setAttribute('aria-valuenow', String(Math.round(p.scrollTop)));
    }
    function moveWindow(frac) {
      var win = evTl.getWindow();
      var span = win.end.getTime() - win.start.getTime();
      var travel = Math.max(0, axisMax.getTime() - axisMin.getTime() - span);
      var start = axisMin.getTime() + Math.max(0, Math.min(1, frac)) * travel;
      evTl.setWindow(new Date(start), new Date(start + span), { animation: false });
    }
    function moveRows(root, frac) {
      var p = panel(root);
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
    drag(ve.el, true, function (frac) { moveRows(eventsEl, frac); });
    drag(vp.el, true, function (frac) { moveRows(peopleEl, frac); });
    h.el.addEventListener('keydown', function (e) {
      var win = evTl.getWindow();
      var step = (win.end.getTime() - win.start.getTime()) * (e.key === 'PageDown' || e.key === 'PageUp' ? 0.8 : 0.1);
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0;
      if (!dir) return;
      evTl.setWindow(new Date(win.start.getTime() + dir * step), new Date(win.end.getTime() + dir * step), { animation: false });
      e.preventDefault();
    });
    function vKey(root) {
      return function (e) {
        var p = panel(root);
        if (!p) return;
        var page = Math.max(24, p.clientHeight * 0.8);
        var step = (e.key === 'PageDown' || e.key === 'PageUp') ? page : 40;
        var dir = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : (e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0;
        if (!dir) return;
        p.scrollTop += dir * step;
        e.preventDefault();
      };
    }
    ve.el.addEventListener('keydown', vKey(eventsEl));
    vp.el.addEventListener('keydown', vKey(peopleEl));
    function hookScroll(root, barObj) {
      var p = panel(root);
      if (!p || p._tlScrollHooked) return;
      p._tlScrollHooked = true;
      p.addEventListener('scroll', function () { syncV(root, barObj); });
    }
    function syncAll() {
      syncH();
      syncV(eventsEl, ve);
      syncV(peopleEl, vp);
      hookScroll(eventsEl, ve);
      hookScroll(peopleEl, vp);
    }
    evTl.on('rangechanged', syncH);
    evTl.on('changed', syncAll);
    peTl.on('rangechanged', syncH);
    peTl.on('changed', function () { syncV(peopleEl, vp); hookScroll(peopleEl, vp); });
    syncAll();
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

  // ---------- Family chart (person pages) ----------
  // The names of the father, mother and children are in the page. The chart is drawn only after
  // the disclosure is opened, so its box has a real height. Depth 1 is parents and children.
  // The switch pops the same chart out to depth 3.
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function familyCardHtml(d) {
    var datum = d.data || {};
    if (datum.to_add) {
      return '<div class="card-inner card-rect fc-card"><div class="fc-kicker">Other parent</div><div class="fc-name">Not recorded</div></div>';
    }
    var info = datum.data || {};
    var name = escHtml(info.label || datum.id);
    var years = info.years ? '<div class="fc-years">' + escHtml(info.years) + '</div>' : '';
    var kicker = datum.main ? '<div class="fc-kicker">This person</div>' : '';
    var body = kicker + '<div class="fc-name">' + name + '</div>' + years;
    if (info.url) body = '<a class="fc-link" href="' + escHtml(info.url) + '">' + body + '</a>';
    return '<div class="card-inner card-rect fc-card">' + body + '</div>';
  }
  function initFamily() {
    var payload = readJSON('family-data');
    var details = document.getElementById('family-chart-details');
    var el = document.getElementById('family-chart');
    var slot = document.getElementById('family-chart-slot');
    var dialog = document.getElementById('family-dialog');
    var sw = document.getElementById('family-wide');
    if (!payload || !details || !el || !slot || !window.f3) return;
    var chart = null;
    function clone(data) { return JSON.parse(JSON.stringify(data)); }
    function show(wide) {
      var host = wide ? dialog.querySelector('.family-dialog-chart') : slot;
      host.appendChild(el);
      var legend = details.querySelector('.legend');
      if (legend) host.insertAdjacentElement('afterend', legend);
      chart.updateData(clone(wide ? payload.wide : payload.near));
      chart.setAncestryDepth(wide ? 3 : 1).setProgenyDepth(wide ? 3 : 1).updateMainId(payload.id);
      chart.updateTree({ tree_position: 'fit', transition_time: 0 });
    }
    function openWide() {
      if (!dialog.open) dialog.showModal();
      show(true);
      var closeBtn = dialog.querySelector('[data-family-close]');
      if (closeBtn) closeBtn.focus();
    }
    function closeWide() {
      if (dialog.open) dialog.close();
      else if (el.parentElement !== slot) show(false);
      if (sw) sw.checked = false;
    }
    function draw() {
      if (chart) {
        if (el.parentElement === slot) chart.updateTree({ tree_position: 'fit', transition_time: 0 });
        return;
      }
      chart = window.f3.createChart(el, clone(payload.near));
      chart.setTransitionTime(0)
        .setAncestryDepth(1)
        .setProgenyDepth(1)
        .setShowSiblingsOfMain(false)
        .setSingleParentEmptyCard(true, { label: 'Not recorded' })
        .setCardXSpacing(220)
        .setCardYSpacing(170)
        .setSortChildrenFunction(function (a, b) {
          var ay = a.data && a.data.y != null ? a.data.y : 1e15;
          var by = b.data && b.data.y != null ? b.data.y : 1e15;
          if (ay !== by) return ay - by;
          return String((a.data && a.data.label) || '').localeCompare(String((b.data && b.data.label) || ''));
        })
        .updateMainId(payload.id);
      chart.setCardHtml().setStyle('rect').setMiniTree(false)
        .setCardDim({ w: 188, h: 92 })
        .setCardInnerHtmlCreator(familyCardHtml)
        .setOnCardClick(function (e, d) {
          var info = d.data && d.data.data;
          if (!info || d.data.to_add || !info.url) { e.preventDefault(); return; }
          if (e.target && e.target.closest && e.target.closest('a')) return;
          window.location.assign(info.url);
        });
      chart.setAfterUpdate(function () {
        el.setAttribute('data-ready', String(el.querySelectorAll('a.fc-link').length));
        el.setAttribute('data-depth', String(chart.store.state.ancestry_depth || 1));
      });
      chart.updateTree({ initial: true, tree_position: 'fit', transition_time: 0 });
      if (sw && dialog) {
        sw.addEventListener('change', function () { if (sw.checked) openWide(); else closeWide(); });
        dialog.addEventListener('close', function () {
          sw.checked = false;
          if (el.parentElement !== slot) show(false);
        });
        dialog.querySelector('[data-family-close]').addEventListener('click', function () {
          closeWide();
          sw.focus();
        });
        dialog.addEventListener('click', function (e) { if (e.target === dialog) closeWide(); });
      }
      document.querySelectorAll('[data-family]').forEach(function (b) {
        b.addEventListener('click', function () {
          var act = b.getAttribute('data-family');
          if (act === 'fit') { chart.updateTree({ tree_position: 'fit', transition_time: 0 }); return; }
          var canvas = el.querySelector('#f3Canvas');
          if (!canvas || !canvas.__zoomObj || !window.d3) return;
          window.d3.select(canvas).call(canvas.__zoomObj.scaleBy, act === 'in' ? 1.4 : 1 / 1.4);
        });
      });
    }
    details.addEventListener('toggle', function () {
      if (!details.open) {
        if (dialog && dialog.open) closeWide();
        return;
      }
      requestAnimationFrame(function () { draw(); });
    });
  }
  if (document.getElementById('family-data')) whenStyles(initFamily);

  // A footnote marker opens the closed notes and scrolls the note below the sticky header.
  function nameNoteTarget(href) {
    if (!href || href.charAt(0) !== '#') return null;
    var target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return null;
    var details = target.closest('details.name-notes-twirl');
    return details ? { target: target, details: details } : null;
  }
  function scrollNameNote(target) {
    var header = document.querySelector('.site-header');
    var gap = (header ? header.getBoundingClientRect().height : 0) + 16;
    var rect = target.getBoundingClientRect();
    if (rect.top < gap - 1 || rect.top > window.innerHeight - 24) {
      window.scrollTo(0, Math.max(0, rect.top + window.pageYOffset - gap));
    }
  }
  function revealNameNote() {
    var found = nameNoteTarget(location.hash);
    if (!found) return;
    found.details.open = true;
    scrollNameNote(found.target);
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a.fn') : null;
    if (!a) return;
    var found = nameNoteTarget(a.getAttribute('href'));
    if (!found) return;
    e.preventDefault();
    found.details.open = true;
    var href = a.getAttribute('href');
    if (location.hash !== href) history.pushState(null, '', href);
    scrollNameNote(found.target);
  });
  window.addEventListener('hashchange', revealNameNote);
  revealNameNote();
})();
