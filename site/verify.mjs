#!/usr/bin/env node
// Headless verification: build must exist (npm run build). Serves dist/, loads key pages in Chromium,
// checks for console errors, timeline/map items, Pagefind results, and saves screenshots.
import { chromium, webkit } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { loadStandbyCounts, standbySummaryLine } from '../scripts/standby/compute.mjs';
import { SENNACHERIB_REDIRECT, redirectsFileHasSennacherib } from '../scripts/redirects.mjs';
import { checkRowMerge } from './row-merge-check.mjs';
import { checkFootnotes } from './footnote-check.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const PORT = +process.env.VERIFY_PORT || 8799; // override when two clones verify on the same machine
const BASE = `http://localhost:${PORT}`;
const srv = await serve(PORT);
const browser = await chromium.launch();
const results = [];
let failed = false;
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); if (!ok) failed = true; };
{
  let rowErrors = [];
  try { rowErrors = checkRowMerge(join(here, 'dist')).errors; }
  catch (e) { rowErrors = [String(e)]; }
  check('row merge: one spelling row, one author row, footnotes closed', rowErrors.length === 0, rowErrors.slice(0, 6).join(' | '));
}
{
  let foot = null;
  try { foot = checkFootnotes(join(here, 'dist')); }
  catch (e) { foot = { errors: [String(e)], footnoteLists: 0, tipnrPages: 0, byClass: {} }; }
  const classes = Object.entries(foot.byClass || {}).map(([k, n]) => `${k}: ${n}`).join(', ');
  const footErrors = foot.footnoteErrors || foot.errors || [];
  const idErrors = foot.idErrors || [];
  check('footnotes: one visible number, no ol marker beside the back-link', footErrors.length === 0 && foot.footnoteLists > 0, footErrors.length ? footErrors.slice(0, 6).join(' | ') : `${foot.footnoteLists} lists (${classes})`);
  check('footnotes: every TIPNR id is protected from email obfuscation', idErrors.length === 0 && foot.tipnrPages > 0, idErrors.length ? idErrors.slice(0, 6).join(' | ') : `${foot.tipnrPages} pages`);
}

async function open(path, { width = 1280, height = 900, shot, fullPage = true, scheme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: width < 500 ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = []; const external = [];
  page.on('console', (m) => { if (m.type() === 'error') (/(tile\.openstreetmap|tile\.loc\.gov|ERR_|Failed to load resource|aivbible\.kevinamundson\.me)/.test(m.text()) ? external : errors).push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => { if (!r.url().startsWith(BASE)) external.push(`${r.url()} ${r.failure()?.errorText}`); else errors.push(`local request failed: ${r.url()}`); });
  // 'load' does not wait on loading="lazy" images. A hung third-party thumbnail (tile.loc.gov)
  // must not abort the suite; content checks still run. networkidle is best-effort after that.
  const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  return { ctx, page, errors, external, status: resp.status(), shot: async () => shot && page.screenshot({ path: join(SHOTS, shot), fullPage }) };
}

async function scrollBars(page) {
  return page.evaluate(() => {
    function box(sel) {
      const el = document.querySelector(sel);
      const thumb = el?.querySelector('.tl-scroll-thumb');
      if (!el || !thumb) return null;
      const er = el.getBoundingClientRect();
      const tr = thumb.getBoundingClientRect();
      const cs = getComputedStyle(thumb);
      return { w: er.width, h: er.height, tw: tr.width, th: tr.height, opacity: cs.opacity, visibility: cs.visibility };
    }
    return { h: box('.tl-hscroll'), events: box('.tl-vscroll-events'), people: box('.tl-vscroll-people') };
  });
}
function barOk(bar, vertical) {
  if (!bar || bar.opacity !== '1' || bar.visibility === 'hidden') return false;
  if (vertical) return bar.h > 40 && bar.w >= 12 && bar.tw >= 8 && bar.th >= 20;
  return bar.w > 40 && bar.h >= 12 && bar.tw >= 20 && bar.th >= 8;
}
function barsVisible(b) {
  return barOk(b?.h, false) && barOk(b?.events, true) && barOk(b?.people, true);
}

// Home (desktop)
{
  const o = await open('/', { shot: 'home-desktop.png' });
  await o.page.waitForSelector('.vis-timeline .vis-item', { timeout: 8000 });
  await o.page.waitForSelector('.tl-hscroll .tl-scroll-thumb', { timeout: 8000 });
  const tl = await o.page.locator('.vis-timeline .vis-item').count();
  const markers = await o.page.locator('#map .leaflet-marker-icon').count();
  const tiles = await o.page.locator('#map img.leaflet-tile-loaded').count();
  const axis = await o.page.locator('.vis-time-axis .vis-text.vis-minor:not(.vis-measure)').allTextContents();
  const lede = await o.page.locator('.lede').innerText();
  check('home: HTTP 200', o.status === 200);
  check('home: one BibleUp script', await o.page.locator('script[src*="/assets/bibleup.js"]').count() === 1);
  check('home: one nav script', await o.page.locator('script[src*="/assets/nav.js"]').count() === 1);
  const desktopNav = await o.page.evaluate(() => {
    const btn = document.querySelector('.nav-toggle');
    const links = [...document.querySelectorAll('#primary-nav a')];
    const tops = links.map((a) => a.getBoundingClientRect().top);
    return {
      n: links.length,
      btnHidden: !!btn && getComputedStyle(btn).display === 'none',
      shown: links.every((a) => a.getBoundingClientRect().height >= 44),
      row: tops.length ? Math.max(...tops) - Math.min(...tops) : 99,
    };
  });
  check('home: desktop primary nav stays in one row', desktopNav.n === 5 && desktopNav.btnHidden && desktopNav.shown && desktopNav.row <= 2, JSON.stringify(desktopNav));
  check('home: no console errors', o.errors.length === 0, o.errors.join(' | '));
  check('home: lede states the mighty works of God among the nations', lede.includes('mighty works of God among the nations') && !/temple/i.test(lede), lede.slice(0, 160));
  check('home: timeline items rendered', tl > 0, `${tl} items`);
  check('home: axis labels are BC', axis.some((t) => / BC$/.test(t)) && !axis.some((t) => /^-/.test(t)), axis.slice(0, 6).join(', '));
  const toggles = await o.page.locator('[data-tier-toggle]').evaluateAll((els) => els.map((e) => ({ tier: e.getAttribute('data-tier-toggle'), pressed: e.getAttribute('aria-pressed') })));
  check('home: Tier 1 on and other dating tiers off', toggles.length >= 6 && toggles.every((t) => t.pressed === (t.tier === 't1' ? 'true' : 'false')), JSON.stringify(toggles));
  const groups = (await o.page.locator('.vis-labelset .vis-label').allInnerTexts()).map((t) => t.trim());
  check('home: people group is labeled People', groups.includes('People') && groups.includes('Events') && !groups.some((t) => /People \(birth\)/.test(t)), groups.join(' | '));
  const panes = await o.page.evaluate(() => {
    function pane(id) {
      const el = document.getElementById(id);
      const label = el?.querySelector('.vis-label');
      if (!el || !label) return null;
      const pr = el.getBoundingClientRect();
      const lr = label.getBoundingClientRect();
      const center = el.querySelector('.vis-panel.vis-center')?.getBoundingClientRect();
      return { h: pr.height, label: label.textContent.trim(), labelInPane: lr.top >= pr.top - 4 && lr.top < pr.bottom, centerLeft: center ? Math.round(center.left) : null, centerW: center ? Math.round(center.width) : null };
    }
    return { events: pane('timeline-events'), people: pane('timeline-people') };
  });
  const linedUp = panes.events && panes.people && panes.events.h > 80 && panes.people.h > 80
    && panes.events.label === 'Events' && panes.people.label === 'People'
    && panes.events.labelInPane && panes.people.labelInPane
    && Math.abs(panes.events.centerLeft - panes.people.centerLeft) < 2
    && Math.abs(panes.events.centerW - panes.people.centerW) < 2;
  check('home: Events and People stay on screen and line up', linedUp, JSON.stringify(panes));
  await o.page.locator('.tl-vscroll-people').focus();
  for (let i = 0; i < 40; i++) {
    const seen = await o.page.evaluate(() => [...document.querySelectorAll('#timeline-people .vis-item.vis-range a.tl-link')].some((a) => a.textContent === 'Adam'));
    if (seen) break;
    await o.page.keyboard.press('PageDown');
  }
  const adam = await o.page.evaluate(() => {
    const el = [...document.querySelectorAll('.vis-item.vis-range')].find((n) => n.querySelector('a.tl-link')?.textContent === 'Adam');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { w: r.width, label: el.querySelector('a.tl-link')?.getAttribute('aria-label') || '' };
  });
  check('home: Adam renders as a lifespan bar', !!adam && adam.w > 30 && /4004 BC/.test(adam.label) && /3074 BC/.test(adam.label), JSON.stringify(adam));
  // Tier 1 has two people, so the People pane does not overflow until another tier is on.
  // Jones (tier 3) now holds the patriarchs. Ussher (tier 4) has only a few people, so it does not overflow the pane.
  await o.page.locator('[data-tier-toggle="t3"]').click();
  await o.page.waitForFunction(() => {
    const pe = document.querySelector('#timeline-people .vis-panel.vis-left');
    return pe && pe.scrollHeight - pe.clientHeight > 40;
  }, null, { timeout: 5000 }).catch(() => {});
  const beforeScroll = await o.page.evaluate(() => {
    const ev = document.querySelector('#timeline-events .vis-panel.vis-left');
    const pe = document.querySelector('#timeline-people .vis-panel.vis-left');
    return { ev: ev?.scrollTop ?? null, pe: pe?.scrollTop ?? null, evRoom: ev ? ev.scrollHeight - ev.clientHeight : 0, peRoom: pe ? pe.scrollHeight - pe.clientHeight : 0 };
  });
  await o.page.locator('.tl-vscroll-events').focus();
  await o.page.keyboard.press('PageDown');
  const afterEvents = await o.page.evaluate(() => ({
    ev: document.querySelector('#timeline-events .vis-panel.vis-left')?.scrollTop ?? null,
    pe: document.querySelector('#timeline-people .vis-panel.vis-left')?.scrollTop ?? null,
  }));
  check('home: Events scroll bar moves only Events', beforeScroll.evRoom > 20 && afterEvents.ev > beforeScroll.ev + 10 && afterEvents.pe === beforeScroll.pe, JSON.stringify({ beforeScroll, afterEvents }));
  await o.page.locator('.tl-vscroll-people').focus();
  await o.page.keyboard.press('PageDown');
  const afterPeople = await o.page.evaluate(() => ({
    ev: document.querySelector('#timeline-events .vis-panel.vis-left')?.scrollTop ?? null,
    pe: document.querySelector('#timeline-people .vis-panel.vis-left')?.scrollTop ?? null,
  }));
  check('home: People scroll bar moves only People', beforeScroll.peRoom > 20 && afterPeople.pe > afterEvents.pe + 10 && afterPeople.ev === afterEvents.ev, JSON.stringify({ afterEvents, afterPeople }));
  await o.page.locator('[data-tier-toggle="t3"]').click();
  const tierRestored = await o.page.waitForFunction((n) => document.querySelectorAll('.vis-timeline .vis-item').length === n, tl, { timeout: 5000 }).then(() => true).catch(() => false);
  check('home: Tier 3 toggle restores the chart', tierRestored);
  await o.page.evaluate(() => {
    for (const sel of ['#timeline-events .vis-panel.vis-left', '#timeline-people .vis-panel.vis-left']) {
      const el = document.querySelector(sel);
      if (el) el.scrollTop = 0;
    }
  });
  await o.page.waitForFunction(() => {
    const h = document.querySelector('.tl-hscroll')?.getBoundingClientRect();
    const ev = document.querySelector('.tl-vscroll-events')?.getBoundingClientRect();
    const pe = document.querySelector('.tl-vscroll-people')?.getBoundingClientRect();
    return h && ev && pe && h.width > 40 && h.height >= 12 && ev.height > 40 && ev.width >= 12 && pe.height > 40 && pe.width >= 12;
  }, null, { timeout: 8000 }).catch(() => {});
  const bars0 = await scrollBars(o.page);
  await o.page.waitForTimeout(1000);
  const bars1 = await scrollBars(o.page);
  check('home: scroll bars stay visible', barsVisible(bars0) && barsVisible(bars1), JSON.stringify(bars1));
  const before = tl;
  await o.page.locator('[data-tier-toggle="t2"]').click();
  await o.page.waitForFunction((n) => document.querySelectorAll('.vis-timeline .vis-item').length > n, before, { timeout: 5000 }).catch(() => {});
  const mid = await o.page.locator('.vis-timeline .vis-item').count();
  check('home: turning Tier 2 on adds items', mid > before, `${before} -> ${mid}`);
  await o.page.locator('[data-tier-toggle="t2"]').click();
  await o.page.waitForFunction((n) => document.querySelectorAll('.vis-timeline .vis-item').length === n, before, { timeout: 5000 }).catch(() => {});
  const diskStandby = loadStandbyCounts(join(here, '..'));
  const standbyTotal = diskStandby['source-printed'] + diskStandby['linked-record'];
  const embeddedStandby = await o.page.evaluate(() => JSON.parse(document.getElementById('standby-summary').textContent));
  check('home: standby summary matches the validator line', embeddedStandby['source-printed'] === diskStandby['source-printed'] && embeddedStandby['linked-record'] === diskStandby['linked-record'] && embeddedStandby.undated === diskStandby.undated && embeddedStandby.line === standbySummaryLine(diskStandby), embeddedStandby.line);
  // vis-timeline copies the item class onto the inner .vis-dot, so count the point (or range), not the dot.
  const standbyPoint = '.vis-item.vis-point.standby, .vis-item.vis-range.standby';
  const standbyBefore = await o.page.locator(standbyPoint).count();
  const standbyPressed = await o.page.locator('[data-tier-toggle="standby"]').getAttribute('aria-pressed');
  check('home: standby items are hidden by default', standbyBefore === 0 && standbyPressed === 'false', `${standbyBefore} visible, pressed ${standbyPressed}`);
  await o.page.locator('[data-tier-toggle="standby"]').click();
  await o.page.waitForFunction((n) => document.querySelectorAll('.vis-item.vis-point.standby, .vis-item.vis-range.standby').length === n, standbyTotal, { timeout: 20000 }).catch(() => {});
  const standbyDom = await o.page.evaluate(() => {
    const els = [...document.querySelectorAll('.vis-item.standby')];
    const points = els.filter((e) => e.classList.contains('vis-point') || e.classList.contains('vis-range'));
    const bad = els.filter((e) => !e.classList.contains('standby') || [...e.classList].some((c) => c.startsWith('tier-')));
    const labels = points.map((e) => e.querySelector('a.tl-link')?.getAttribute('aria-label') || '');
    const unlabeled = labels.filter((t) => !/standby placement/.test(t) || !(/printed by /.test(t) || /placed with /.test(t)));
    return { n: points.length, bad: bad.length, unlabeled: unlabeled.length };
  });
  check('home: standby toggle shows standby items with no tier class', standbyDom.n === standbyTotal && standbyDom.bad === 0 && standbyDom.unlabeled === 0, JSON.stringify(standbyDom));
  const listOrder = await o.page.evaluate(() => {
    const rows = [...document.querySelectorAll('#tl-alt .chrono-list li')];
    let bad = false;
    let prev = null;
    for (const li of rows) {
      const y = li.getAttribute('data-year');
      const placement = li.getAttribute('data-placement');
      if (prev && prev.y === y && prev.placement === 'standby' && placement === 'tier') bad = true;
      prev = { y, placement };
    }
    return {
      bad,
      standby: rows.filter((li) => li.getAttribute('data-placement') === 'standby').length,
      undated: document.querySelectorAll('.undated-list a').length,
    };
  });
  check('home: chrono-list and Undated counts match the validator summary', !listOrder.bad && listOrder.standby === standbyTotal && listOrder.undated === diskStandby.undated, JSON.stringify(listOrder));
  await o.page.locator('#timeline').screenshot({ path: join(SHOTS, 'home-standby.png') });
  await o.page.locator('[data-tier-toggle="standby"]').click();
  await o.page.waitForFunction((n) => document.querySelectorAll('.vis-timeline .vis-item').length === n, before, { timeout: 20000 }).catch(() => {});
  check('home: standby toggle hides the items again', await o.page.locator('.vis-item.standby').count() === 0);
  // AD side: Provisional holds Council of Nicaea, so turn that tier on, then zoom to AD 300-500.
  const adItems = await o.page.evaluate(() => JSON.parse(document.getElementById('tl-data').textContent).filter((i) => i.y > 0).length);
  if (adItems) {
    await o.page.locator('[data-tl="in"]').first().count();
    const win0 = await o.page.evaluate(() => { const w = window.__timeline?.getWindow(); return w ? [w.start.getTime(), w.end.getTime()] : null; });
    await o.page.locator('[data-tier-toggle="tp"]').click();
    const adAxis = await o.page.evaluate(() => { const tl = window.__timeline; if (!tl) return null; const d = (y) => { const x = new Date(Date.UTC(2000, 6, 1)); x.setUTCFullYear(y - 1); return x; }; tl.setWindow(d(300), d(500), { animation: false }); return true; });
    await o.page.waitForTimeout(400);
    const synced = await o.page.evaluate(() => {
      const a = window.__timeline?.getWindow();
      const b = window.__timelinePeople?.getWindow();
      if (!a || !b) return null;
      return { ds: Math.abs(a.start - b.start), de: Math.abs(a.end - b.end) };
    });
    check('home: Events and People share one time window', !!synced && synced.ds < 1000 && synced.de < 1000, JSON.stringify(synced));
    const ax2 = await o.page.locator('.vis-time-axis .vis-text.vis-minor:not(.vis-measure)').allTextContents();
    check('home: AD axis labels read "AD n" with no year 0', adAxis === null || (ax2.some((t) => /^AD \d+$/.test(t)) && !ax2.some((t) => /^AD 0$|^-/.test(t))), ax2.slice(0, 6).join(', '));
    const nic = await o.page.locator('.vis-item', { hasText: 'Council of Nicaea' }).count();
    check('home: AD item (Council of Nicaea) rendered', adAxis === null || nic > 0, `${adItems} AD items in data`);
    await o.page.locator('[data-tier-toggle="tp"]').click();
    if (win0) { await o.page.evaluate((w) => window.__timeline.setWindow(new Date(w[0]), new Date(w[1]), { animation: false }), win0); await o.page.waitForTimeout(400); }
  }
  check('home: map markers rendered', markers > 0, `${markers} markers, ${tiles} OSM tiles loaded`);
  // click a timeline item navigates
  await o.page.locator('.vis-item', { hasText: 'The Flood' }).first().click();
  await o.page.waitForURL(/\/events\/the-flood\/$/, { timeout: 5000 }).catch(() => {});
  check('home: selecting a timeline item opens its page', o.page.url().endsWith('/events/the-flood/'), o.page.url());
  await o.page.goBack({ waitUntil: 'load', timeout: 30000 });
  await o.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await o.shot();
  if (o.external.length) results.push(`INFO  home: external resource issues: ${o.external.length}`);
  await o.ctx.close();
}
// Home (mobile, light + dark)
for (const scheme of ['light', 'dark']) {
  const o = await open('/', { width: 390, height: 844, shot: `home-mobile${scheme === 'dark' ? '-dark' : ''}.png`, scheme });
  if (scheme === 'dark') await o.page.locator('.site-header').screenshot({ path: join(SHOTS, 'nav-mobile-dark.png') });
  await o.page.waitForSelector('.tl-hscroll .tl-scroll-thumb', { timeout: 8000 }).catch(() => {});
  await o.shot();
  check(`home mobile (${scheme}): no console errors`, o.errors.length === 0, o.errors.join(' | '));
  const overflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(`home mobile (${scheme}): no horizontal page overflow`, !overflow);
  check(`home mobile (${scheme}): scroll bars stay visible`, barsVisible(await scrollBars(o.page)));
  const axis = await o.page.evaluate(() => {
    function panel(sel) {
      const placed = [...document.querySelectorAll(sel)].map((n) => ({ t: n.textContent, x: Math.round(n.getBoundingClientRect().x), overflow: n.scrollWidth - n.clientWidth }));
      let pile = 0;
      for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) if (Math.abs(placed[i].x - placed[j].x) < 4) pile++;
      return { n: placed.length, pile, overflow: placed.reduce((m, p) => Math.max(m, p.overflow), 0), years: placed.filter((p) => / BC$|^AD /.test(p.t)).length, sample: placed.slice(0, 6).map((p) => p.t) };
    }
    return {
      bottom: panel('.vis-panel.vis-bottom .vis-text.vis-minor:not(.vis-measure)'),
      top: panel('.vis-panel.vis-top .vis-text.vis-minor:not(.vis-measure)')
    };
  });
  const axisOk = [axis.bottom, axis.top].every((a) => a.pile === 0 && a.overflow <= 1 && a.n > 0 && a.n < 40 && a.years === a.n);
  check(`home mobile (${scheme}): year scale is not stacked`, axisOk, JSON.stringify(axis));
  if (scheme === 'dark') {
    await o.page.locator('.tl-vscroll-people').focus();
    for (let i = 0; i < 40; i++) {
      const seen = await o.page.evaluate(() => !!document.querySelector('#timeline-people .vis-item.vis-range .tl-link'));
      if (seen) break;
      await o.page.keyboard.press('PageDown');
    }
    const ink = await o.page.evaluate(() => {
      const a = document.querySelector('#timeline-people .vis-item.vis-range .tl-link');
      if (!a) return null;
      const m = getComputedStyle(a).color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? { color: getComputedStyle(a).color, lum: (+m[1] + +m[2] + +m[3]) / 3, text: a.textContent } : { color: getComputedStyle(a).color, text: a.textContent };
    });
    check('home mobile (dark): lifespan text is light', !!ink && ink.lum > 180, JSON.stringify(ink));
  }
  await o.ctx.close();
}
// Phone header: the primary nav is collapsed until the menu button is tapped.
{
  const o = await open('/', { width: 390, height: 844 });
  const menu = o.page.getByRole('button', { name: 'Menu' });
  const closed = await o.page.evaluate(() => {
    const btn = document.querySelector('.nav-toggle');
    const brand = document.querySelector('.brand').getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const search = document.querySelector('.header-search input').getBoundingClientRect();
    const nav = document.getElementById('primary-nav');
    return {
      collapsedClass: document.querySelector('.site-header').classList.contains('nav-collapsible'),
      expanded: btn.getAttribute('aria-expanded'),
      controls: btn.getAttribute('aria-controls'),
      name: (btn.textContent || '').replace(/\s+/g, ' ').trim(),
      btnW: br.width,
      btnH: br.height,
      beside: br.left >= brand.right - 1 && Math.abs((br.top + br.bottom) / 2 - (brand.top + brand.bottom) / 2) < 24,
      navDisplay: getComputedStyle(nav).display,
      open: nav.classList.contains('is-open'),
      searchW: search.width,
      searchH: search.height,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  check('mobile nav (390×844): collapsed by default', closed.collapsedClass && closed.expanded === 'false' && closed.controls === 'primary-nav' && closed.name === 'Menu' && closed.navDisplay === 'none' && !closed.open && closed.btnW >= 44 && closed.btnH >= 44 && closed.beside && closed.searchW > 100 && closed.searchH >= 44 && !closed.overflow, JSON.stringify(closed));
  await o.page.locator('.site-header').screenshot({ path: join(SHOTS, 'nav-mobile-after.png') });
  await menu.click();
  const opened = await o.page.evaluate(() => {
    const links = [...document.querySelectorAll('#primary-nav a')];
    const rects = links.map((a) => a.getBoundingClientRect());
    const search = document.querySelector('.header-search input').getBoundingClientRect();
    return {
      expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'),
      open: document.getElementById('primary-nav').classList.contains('is-open'),
      labels: links.map((a) => a.textContent.trim()),
      vertical: rects.every((r, i) => i === 0 || r.top >= rects[i - 1].bottom - 1),
      tall: rects.every((r) => r.height >= 44 && r.width > 40),
      searchW: search.width,
      searchH: search.height,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  check('mobile nav (390×844): opens on tap', opened.expanded === 'true' && opened.open && opened.labels.join(',') === 'Timeline,Browse,Chronologies,Charts,About' && opened.vertical && opened.tall && opened.searchW > 100 && opened.searchH >= 44 && !opened.overflow, JSON.stringify(opened));
  await o.page.locator('.site-header').screenshot({ path: join(SHOTS, 'nav-mobile-open.png') });
  await o.page.keyboard.press('Tab');
  await o.page.keyboard.press('Escape');
  const escaped = await o.page.evaluate(() => ({
    expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'),
    display: getComputedStyle(document.getElementById('primary-nav')).display,
    focused: document.activeElement.classList.contains('nav-toggle'),
  }));
  check('mobile nav (390×844): Escape closes the menu', escaped.expanded === 'false' && escaped.display === 'none' && escaped.focused, JSON.stringify(escaped));
  await menu.click();
  await o.page.evaluate(() => {
    document.getElementById('primary-nav').addEventListener('click', (e) => {
      if (e.target.closest('a')) e.preventDefault();
    }, true);
  });
  await o.page.locator('#primary-nav a', { hasText: 'Browse' }).click();
  const linked = await o.page.evaluate(() => ({
    path: location.pathname,
    expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'),
    display: getComputedStyle(document.getElementById('primary-nav')).display,
  }));
  check('mobile nav (390×844): tapping a link closes the menu', linked.path === '/' && linked.expanded === 'false' && linked.display === 'none', JSON.stringify(linked));
  check('mobile nav (390×844): no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const resp = await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
  const headerClass = (await page.locator('.site-header').getAttribute('class')) || '';
  const hiddenAttr = await page.locator('.nav-toggle').getAttribute('hidden');
  const btnVisible = await page.locator('.nav-toggle').isVisible();
  const links = page.locator('#primary-nav a');
  const n = await links.count();
  let visible = n === 5;
  const boxes = [];
  for (let i = 0; i < n; i++) {
    const box = await links.nth(i).boundingBox();
    boxes.push(box);
    if (!box || box.height < 44 || box.width < 20) visible = false;
  }
  const search = await page.locator('.header-search input').boundingBox();
  const plain = { status: resp.status(), headerClass, hiddenAttr, btnVisible, n, visible, boxes, searchW: search?.width || 0 };
  check('mobile nav (390×844): links stay visible with JavaScript off', plain.status === 200 && !plain.headerClass.includes('nav-collapsible') && plain.hiddenAttr !== null && !plain.btnVisible && plain.visible && plain.searchW > 100, JSON.stringify(plain));
  await ctx.close();
}
// Record pages
for (const [path, shot, sel] of [
  ['/events/the-flood/', 'event-the-flood.png', 'table.chron tbody tr'],
  ['/events/temple-dedication/', null, '.flag-oq'],
  ['/people/noah/', null, 'table.chron tbody tr'],
  ['/locations/mountains-of-ararat/', 'location-ararat.png', '#locmap .leaflet-marker-icon'],
  ['/maps/loc-1764-bellin-armenia/', null, '.mapfig img'],
  ['/chronologies/', null, '.tiers li'],
  ['/gallery/', null, '.chart-card'],
]) {
  const o = await open(path, { shot });
  await o.shot();
  const n = await o.page.locator(sel).count();
  check(`${path}: HTTP 200, no console errors`, o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
  check(`${path}: has ${sel}`, n > 0, `${n}`);
  if (path === '/events/the-flood/') {
    const first = await o.page.locator('table.chron tbody tr th').first().innerText();
    check('event: CFAH row is first in chronologies table', /^CFAH/.test(first), first.replace(/\s+/g, ' '));
    check('event: sort tier label shown', (await o.page.locator('.sortbox .tier').innerText()).includes('Tier 1'));
    check('event: disagreement flag present', (await o.page.locator('.flag-diff').count()) > 0);
    const rows = (await o.page.locator('table.chron tbody tr th').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    const iU = rows.findIndex((t) => /^Ussher$/.test(t)); const iJ = rows.findIndex((t) => /^Jordan/.test(t)); const iB = rows.findIndex((t) => /^Biblical/.test(t));
    check('event: Jordan row after Ussher and before Bible text', iU >= 0 && iJ > iU && iB > iJ, `Ussher@${iU} Jordan@${iJ} Bible@${iB}`);
    check('event: Jordan row never sets sort year', !(await o.page.locator('tr.is-sort th', { hasText: 'Jordan' }).count()));
  }
  if (path === '/events/the-flood/') check('event: links matching CFAH charts', (await o.page.locator('.chart-card').count()) > 0);
  if (path === '/gallery/') {
    const want = JSON.parse(readFileSync(new URL('../data/cfah-charts.json', import.meta.url), 'utf8')).charts;
    check('gallery: one card per chart in data/cfah-charts.json', n === want.length, `${n} cards / ${want.length} charts`);
    const imgs = await o.page.locator('.chart-card img').evaluateAll((els) => els.map((e) => ({ src: e.getAttribute('src'), alt: e.getAttribute('alt'), lazy: e.getAttribute('loading') })));
    check('gallery: thumbnails hotlinked from ARJ only (none copied)', imgs.length === want.filter((c) => c.thumbnail).length && imgs.every((i) => i.src.startsWith('https://assets.answersresearchjournal.org/')), `${imgs.length} thumbnails`);
    check('gallery: every thumbnail lazy-loaded with caption alt text', imgs.every((i) => i.lazy === 'lazy' && i.alt && i.alt.length > 3));
    check('gallery: nav link marked current', (await o.page.locator('nav[aria-label="Primary"] a[aria-current="page"]').innerText()) === 'Charts');
  }
  if (o.external.length) results.push(`INFO  ${path}: external resource issues: ${o.external.join(' | ')}`);
  await o.ctx.close();
}
// Person timelines (own life solid, context faded) — Joseph, Abraham, Noah
{
  const { readFileSync } = await import('node:fs');
  const expect = JSON.parse(readFileSync(join(here, 'dist/data/person-timelines.json'), 'utf8'));
  for (const [id, shots] of [['joseph', ['person-joseph-desktop.png', 'person-joseph-mobile.png']], ['abraham', []], ['noah', []]]) {
    for (const [w, h, shot] of [[1280, 900, shots[0]], [390, 844, shots[1]]]) {
      const o = await open(`/people/${id}/`, { width: w, height: h, shot });
      const tag = `/people/${id}/ (${w}px)`;
      check(`${tag}: no console errors`, o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
      const shown = await o.page.waitForFunction(() => {
        const root = document.querySelector('#timeline .vis-timeline');
        const axis = document.querySelector('#timeline .vis-time-axis .vis-text.vis-minor:not(.vis-measure)');
        const item = document.querySelector('#timeline .vis-item');
        return !!root && getComputedStyle(root).visibility === 'visible' && !!axis && getComputedStyle(axis).visibility === 'visible' && !!item && item.getBoundingClientRect().height > 0;
      }, null, { timeout: 5000 }).then(() => true).catch(() => false);
      check(`${tag}: timeline is visible`, shown);
      const own = await o.page.locator('#timeline .vis-item.vis-point.own').count();
      const ownBar = await o.page.locator('#timeline .vis-item.vis-range.own').count();
      const ctx = await o.page.locator('#timeline .vis-item.vis-point.ctx').count();
      const ex = expect[id];
      check(`${tag}: timeline own/context counts match build`, own + ownBar === ex.own && ctx === ex.context, `own ${own}+${ownBar}/${ex.own}, context ${ctx}/${ex.context}`);
      const lifeBar = await o.page.evaluate(() => {
        const el = document.querySelector('#timeline .vis-item.vis-range.own');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const a = el.querySelector('a.tl-link');
        return { w: r.width, label: a?.getAttribute('aria-label') || '', vis: getComputedStyle(el).visibility };
      });
      if (ex.life) check(`${tag}: lifespan is a bar from birth to death`, ownBar === 1 && lifeBar && lifeBar.w > 30 && lifeBar.vis === 'visible' && lifeBar.label.includes(ex.life.label), JSON.stringify(lifeBar));
      else check(`${tag}: no lifespan bar without a later death or translation`, ownBar === 0, JSON.stringify(lifeBar));
      // Standby rows stay in the ordered list and are marked standby. own/context counts are the tier rows.
      const listOwn = await o.page.locator('.person-list li.own:not(.standby)').count(), listCtx = await o.page.locator('.person-list li.ctx:not(.standby)').count();
      check(`${tag}: fallback list matches`, listOwn === ex.own && listCtx === ex.context, `${listOwn} own, ${listCtx} context`);
      // opacity + markers differ
      if (ctx) {
        const op = await o.page.locator('#timeline .vis-item.ctx .vis-item-content').first().evaluate((el) => getComputedStyle(el).opacity);
        const opOwn = await o.page.locator('#timeline .vis-item.own .vis-item-content').first().evaluate((el) => getComputedStyle(el).opacity);
        const mark = await o.page.locator('#timeline .vis-item.ctx .ctx-mark').count();
        check(`${tag}: context items faded and marked "(context)"`, +op < 1 && +opOwn === 1 && mark === ctx, `opacity ${op} vs ${opOwn}, ${mark} marks`);
      }
      // every timeline link resolves locally (event pages or #birth/#death anchors)
      const hrefs = await o.page.locator('#timeline a.tl-link').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      let bad = [];
      for (const hr of hrefs) {
        if (hr.startsWith('#')) { if (!(await o.page.locator(hr).count())) bad.push(hr); continue; }
        const r = await o.page.request.get(BASE + hr); if (r.status() !== 200) bad.push(hr);
      }
      check(`${tag}: all ${hrefs.length} timeline links resolve`, hrefs.length > 0 && bad.length === 0, bad.join(', '));
      if (id === 'abraham' && w > 500) {
        const heb = await o.page.locator('#name .name-form[lang="he"]').allInnerTexts();
        check('abraham: name section has Hebrew Abram and Abraham', heb.some((t) => t.includes('אַבְרָם')) && heb.some((t) => t.includes('אַבְרָהָם')), heb.join(' | '));
        check('abraham: name footnotes and the inscription gap', (await o.page.locator('#name .name-notes li').count()) >= 2 && /No inscription/.test(await o.page.locator('#name').innerText()));
      }
      if (id === 'noah' && w > 500) {
        const heb = await o.page.locator('#name .name-form[lang="he"]').allInnerTexts();
        check('noah: name section has the Hebrew form', heb.some((t) => t.includes('נֹחַ')), heb.join(' | '));
        const chips = await o.page.locator('a[href*="biblehub.com/blb/"]').evaluateAll((els) => els.map((a) => ({ href: a.getAttribute('href'), bibleup: a.hasAttribute('bu-data') })));
        check('noah: scripture chips stay on BibleHub and are not BibleUp links', chips.length > 0 && chips.every((a) => !a.bibleup && /biblehub\.com\/blb\//.test(a.href)), `${chips.length} chips`);
      }
      if (w > 500) {
        // keyboard: Tab reaches a timeline link; Enter opens it
        const first = o.page.locator('#timeline a.tl-link[href^="/events/"]').first();
        await first.focus();
        const focused = await o.page.evaluate(() => document.activeElement?.classList.contains('tl-link'));
        check(`${tag}: timeline items are keyboard-focusable links`, focused);
        const target = await first.getAttribute('href');
        await o.page.keyboard.press('Enter');
        await o.page.waitForURL((u) => u.pathname === target, { timeout: 5000 }).catch(() => {});
        check(`${tag}: Enter on a focused timeline item opens ${target}`, new URL(o.page.url()).pathname === target, o.page.url());
        await o.page.goto(BASE + `/people/${id}/`, { waitUntil: 'load', timeout: 30000 });
        await o.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        if (id === 'joseph') {
          const ownIds = await o.page.locator('.person-list li.own a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
          check('joseph: own-life list includes joseph-made-vizier and jacob-enters-egypt', ownIds.includes('/events/joseph-made-vizier/') && ownIds.includes('/events/jacob-enters-egypt/'), ownIds.join(' '));
        }
      } else {
        const overflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        check(`${tag}: no horizontal page overflow`, !overflow);
      }
      if (shot) await o.page.screenshot({ path: join(SHOTS, shot), fullPage: true });
      await o.ctx.close();
    }
  }
}
// Family names are visible while the chart disclosure is closed. Opening it draws parents and children; the switch pops out three generations.
{
  async function familyLinks(page, root, depth) {
    await page.waitForFunction((arg) => {
      const el = document.querySelector(arg.root);
      return !!el && el.getAttribute('data-depth') === String(arg.depth) && Number(el.getAttribute('data-ready')) > 0;
    }, { root, depth }, { timeout: 8000 });
    return page.locator(`${root} a.fc-link`).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  }
  async function linksOk(page, hrefs) {
    const bad = [];
    for (const hr of [...new Set(hrefs)]) {
      const r = await page.request.get(BASE + hr);
      if (r.status() !== 200) bad.push(`${hr} ${r.status()}`);
    }
    return bad;
  }
  const o = await open('/people/abraham/', { width: 1280, height: 900 });
  check('abraham family: HTTP 200, no console errors', o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
  const closed = await o.page.locator('#family-chart-details').evaluate((d) => !d.open && d.querySelector('#family-chart') && !d.querySelector('#family-chart svg'));
  check('abraham family: chart stays closed until the block is opened', closed);
  const brief = await o.page.locator('#family-brief').innerText();
  check('abraham family: closed block names the father, an unrecorded mother and the child', /Father/.test(brief) && /Terah/.test(brief) && /Mother/.test(brief) && /Not recorded/.test(brief) && /Isaac/.test(brief), brief);
  await o.page.locator('#family-chart-details > summary').click();
  check('abraham family: names stay visible when the chart is open', await o.page.locator('#family-brief').isVisible());
  const near = await familyLinks(o.page, '#family-chart', 1);
  check('abraham family: chart links father Terah, self and son Isaac', near.includes('/people/terah/') && near.includes('/people/abraham/') && near.includes('/people/isaac/'), near.join(' '));
  check('abraham family: default chart stops at parents and children', !near.includes('/people/serug/') && !near.includes('/people/jacob/'), near.join(' '));
  const missingLinks = await o.page.locator('#family-chart .card-to-add a').count();
  const missingText = await o.page.locator('#family-chart .card-to-add').allInnerTexts();
  check('abraham family: unrecorded parent is not a link', missingLinks === 0 && missingText.some((t) => /Not recorded/.test(t)), missingText.join(' | '));
  const chartHeight = await o.page.locator('#family-chart').evaluate((el) => el.getBoundingClientRect().height);
  check('abraham family: opened chart has a height', chartHeight > 100, String(chartHeight));
  const switchLabel = await o.page.locator('label.family-switch').innerText();
  check('abraham family: switch reads Expand Family Chart', switchLabel.trim() === 'Expand Family Chart', switchLabel);
  const legendBelow = await o.page.evaluate(() => {
    const chart = document.getElementById('family-chart').getBoundingClientRect();
    const legend = document.querySelector('#family-chart-details .legend');
    const box = legend.getBoundingClientRect();
    const text = legend.innerText;
    return box.top >= chart.bottom - 1
      && /Recorded as a father, solid bar/.test(text)
      && /Other parent, not recorded, dashed/.test(text)
      && /Named person, role not recorded/.test(text);
  });
  check('abraham family: legend sits below the chart', legendBelow);
  const nearBad = await linksOk(o.page, near);
  check('abraham family: chart links resolve', nearBad.length === 0, nearBad.join(', '));
  await o.page.locator('#family-wide').check();
  await o.page.waitForFunction(() => document.getElementById('family-dialog')?.open === true, null, { timeout: 3000 }).catch(() => {});
  const wide = await familyLinks(o.page, '#family-dialog #family-chart', 3);
  const wideLegend = await o.page.evaluate(() => {
    const chart = document.querySelector('#family-dialog #family-chart')?.getBoundingClientRect();
    const legend = document.querySelector('#family-dialog .legend')?.getBoundingClientRect();
    return !!chart && !!legend && legend.top >= chart.bottom - 1;
  });
  check('abraham family: expanded chart keeps the legend below it', wideLegend);
  check('abraham family: open chart includes great-grandfather Serug and great-grandson Joseph', wide.includes('/people/serug/') && wide.includes('/people/joseph/'), wide.join(' '));
  const wideBad = await linksOk(o.page, wide);
  check('abraham family: wider chart links resolve', wideBad.length === 0, wideBad.join(', '));
  await o.page.locator('#family-dialog [data-family-close]').click();
  await o.page.waitForFunction(() => document.getElementById('family-dialog')?.open !== true && document.getElementById('family-chart-slot')?.querySelector('#family-chart'), null, { timeout: 3000 }).catch(() => {});
  const back = await familyLinks(o.page, '#family-chart-slot #family-chart', 1);
  check('abraham family: closing the chart returns to parents and children', back.includes('/people/terah/') && !back.includes('/people/serug/'), back.join(' '));
  const legendBack = await o.page.evaluate(() => {
    const slot = document.getElementById('family-chart-slot');
    const legend = document.querySelector('#family .legend');
    return !!legend && slot?.nextElementSibling === legend && !document.getElementById('family-dialog').contains(legend);
  });
  check('abraham family: legend returns below the page chart', legendBack);
  const focused = await o.page.locator('#family-chart a.fc-link[href="/people/isaac/"]').focus().then(() => o.page.evaluate(() => document.activeElement?.getAttribute('href')));
  check('abraham family: a chart name can take keyboard focus', focused === '/people/isaac/');
  await o.ctx.close();

  const lydian = await open('/people/alyattes/', { width: 390, height: 844 });
  check('alyattes family: HTTP 200, no console errors', lydian.status === 200 && lydian.errors.length === 0, lydian.errors.join(' | '));
  const closedOverflow = await lydian.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check('alyattes family (390px): closed block does not widen the page', !closedOverflow);
  await lydian.page.locator('#family-chart-details > summary').click();
  const lydianLinks = await familyLinks(lydian.page, '#family-chart', 1);
  check('alyattes family: chart links Sadyattes, Alyattes and Croesus', lydianLinks.includes('/people/sadyattes/') && lydianLinks.includes('/people/alyattes/') && lydianLinks.includes('/people/croesus/'), lydianLinks.join(' '));
  const lydianOverflow = await lydian.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check('alyattes family (390px): chart does not widen the page', !lydianOverflow);
  await lydian.ctx.close();

  const lone = await open('/people/christopher-columbus/', { width: 390, height: 844 });
  check('columbus family: HTTP 200, no console errors', lone.status === 200 && lone.errors.length === 0, lone.errors.join(' | '));
  const loneList = await lone.page.locator('#family-brief').innerText();
  check('columbus family: father, mother and children are not recorded', /Father/.test(loneList) && /Mother/.test(loneList) && /Children/.test(loneList) && (loneList.match(/Not recorded/g) || []).length >= 2, loneList);
  await lone.page.locator('#family-chart-details > summary').click();
  const one = await familyLinks(lone.page, '#family-chart', 1);
  check('columbus family: chart is the person alone', one.length === 1 && one[0] === '/people/christopher-columbus/', one.join(' '));
  await lone.ctx.close();

  const my = await open('/people/mycerinus/', { width: 1280, height: 900 });
  await my.page.locator('#family-chart-details > summary').focus();
  await my.page.keyboard.press('Enter');
  const myNear = await familyLinks(my.page, '#family-chart', 1);
  check('mycerinus family: father link is kept when the father record omits him from children', myNear.includes('/people/cheops/'), myNear.join(' '));
  await my.ctx.close();
}
// A ruler with no original-language form still has the Name section, and the unsourced spelling is not given a fake footnote.
{
  const o = await open('/people/rameses-ii/', { width: 1280, height: 900 });
  check('rameses-ii: HTTP 200, no console errors', o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
  const text = await o.page.locator('#name').innerText();
  check('rameses-ii: name section states that no original-language form is entered', /No original-language writing/.test(text), text.slice(0, 240));
  check('rameses-ii: Ramesses II is an alternate with no written source attached', /Ramesses II/.test(text) && /Written source not yet attached/.test(text));
  await o.ctx.close();
}
{
  const o = await open('/people/alyattes/', { width: 390, height: 844 });
  check('alyattes: HTTP 200, no console errors', o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
  const text = await o.page.locator('#name').innerText();
  const note = await o.page.locator('#name .name-notes').evaluate((el) => el.textContent || '');
  check('alyattes: Herodotus spelling is footnoted and the Greek is not invented', /Alyattes/.test(text) && /History/.test(text) && /No original-language writing/.test(text) && /English translation/.test(note) && !/English translation/.test(text));
  const overflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check('alyattes (390px): name section does not widen the page', !overflow);
  await o.ctx.close();
}
// Peleg's chart used to draw and then stay hidden.
{
  const o = await open('/people/peleg/', { width: 390, height: 844, scheme: 'dark' });
  const shown = await o.page.waitForFunction(() => {
    const root = document.querySelector('#timeline .vis-timeline');
    const axis = [...document.querySelectorAll('#timeline .vis-time-axis .vis-text.vis-minor:not(.vis-measure)')].map((n) => n.textContent.trim()).filter(Boolean);
    const item = document.querySelector('#timeline .vis-item.own .tl-link');
    return !!root && getComputedStyle(root).visibility === 'visible' && axis.length > 0 && axis.every((t) => / BC$|^AD /.test(t)) && !!item && getComputedStyle(item).visibility === 'visible' && item.getBoundingClientRect().height > 0;
  }, null, { timeout: 5000 }).then(() => true).catch(() => false);
  const detail = await o.page.evaluate(() => {
    const root = document.querySelector('#timeline .vis-timeline');
    return {
      visibility: root ? getComputedStyle(root).visibility : null,
      h: root ? Math.round(root.getBoundingClientRect().height) : 0,
      labels: [...document.querySelectorAll('#timeline .vis-time-axis .vis-text.vis-minor:not(.vis-measure)')].slice(0, 8).map((n) => n.textContent.trim()),
      own: document.querySelector('#timeline .vis-item.own .tl-link')?.textContent || '',
      groups: [...document.querySelectorAll('#timeline .vis-label')].map((n) => n.textContent.trim()),
      bars: document.querySelectorAll('.tl-vscroll').length,
    };
  });
  check('peleg mobile dark: timeline is visible', shown && detail.h > 100 && detail.groups.some((g) => /Peleg/.test(g)) && detail.own.length > 0 && detail.bars === 0, JSON.stringify(detail));
  const pelegLife = await o.page.evaluate(() => {
    const el = document.querySelector('#timeline .vis-item.vis-range.own');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const a = el.querySelector('a.tl-link');
    return { w: r.width, text: a?.textContent || '', label: a?.getAttribute('aria-label') || '', vis: getComputedStyle(a || el).visibility };
  });
  check('peleg mobile dark: lifespan is a bar, 2247 BC – 2008 BC', !!pelegLife && pelegLife.w > 30 && pelegLife.vis === 'visible' && pelegLife.text === 'Peleg' && pelegLife.label.includes('2247 BC') && pelegLife.label.includes('2008 BC'), JSON.stringify(pelegLife));
  check('peleg mobile dark: no console errors', o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
// Search
{
  const o = await open('/search/?q=Flood', { shot: 'search-flood.png' });
  await o.page.waitForSelector('.pagefind-ui__result', { timeout: 10000 }).catch(() => {});
  const n = await o.page.locator('.pagefind-ui__result').count();
  const titles = await o.page.locator('.pagefind-ui__result-title').allTextContents();
  await o.shot();
  check('search: Pagefind returns results for "Flood"', n > 0, `${n} results: ${titles.slice(0, 5).map((t) => t.trim()).join('; ')}`);
  check('search: no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
// Keyboard: first Tab focuses skip link
{
  const o = await open('/events/the-flood/');
  await o.page.keyboard.press('Tab');
  const t = await o.page.evaluate(() => document.activeElement?.textContent);
  check('a11y: first Tab reaches "Skip to content"', t === 'Skip to content', t);
  const imgsNoAlt = await o.page.locator('img:not([alt])').count();
  check('a11y: all images have alt', imgsNoAlt === 0, `${imgsNoAlt} without alt`);
  await o.ctx.close();
}
// Raleigh, A Chronological Table
{
  const o = await open('/chronologies/');
  const href = await o.page.locator('#raleigh-history-of-the-world a[href="/chronologies/raleigh-chronological-table/"]').innerText().catch(() => '');
  check('chronologies: Raleigh card links to A Chronological Table', href === 'A Chronological Table', href);
  await o.ctx.close();
}
// CFAH list: Answers Research Journal and OSF Preprint, each with Responses. Copies carry a tag.
{
  const GENERIC = new Set(['pdf', 'download', 'preprint', 'link', 'here', 'file', 'paper', 'osf', 'source', 'open', 'read', 'article', 'copy', 'duplicate', 'alternate', 'archived']);
  const readLists = () => {
    const linkText = (a) => (a ? [...a.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('') : '').replace(/\s+/g, ' ').trim();
    const linkOf = (a) => ({
      text: linkText(a),
      href: a?.getAttribute('href') || '',
      target: a?.getAttribute('target') || '',
      rel: a?.getAttribute('rel') || '',
      hidden: a?.querySelector('.visually-hidden')?.textContent || '',
    });
    const itemOf = (li) => {
      const a = li.querySelector(':scope > a');
      const copies = [...li.querySelectorAll(':scope > ul.cfah-copies > li')].map(itemOf);
      return {
        ...linkOf(a),
        tag: li.querySelector(':scope > .tag-copy')?.textContent?.trim() || '',
        access: li.querySelector(':scope > .tag:not(.tag-copy)')?.textContent?.trim() || '',
        copies,
      };
    };
    const forkOf = (li) => {
      const node = li.querySelector(':scope > .cfah-fork-node');
      const a = node?.querySelector(':scope > a');
      const copies = [...li.querySelectorAll(':scope > ul.cfah-copies > li')].map(itemOf);
      const replies = [...li.querySelectorAll(':scope > ol.cfah-thread > li.cfah-fork')].map(forkOf);
      return {
        ...linkOf(a),
        id: li.getAttribute('data-id') || '',
        kind: node?.querySelector(':scope > .tag-kind')?.textContent?.trim() || '',
        author: node?.querySelector(':scope > .cfah-author')?.textContent?.trim() || '',
        on: node?.querySelector(':scope > .cfah-on')?.textContent?.trim() || '',
        also: (() => {
          const el = node?.querySelector(':scope > .cfah-also');
          if (!el) return '';
          return [...el.childNodes].map((n) => (n.nodeType === Node.TEXT_NODE ? n.textContent : (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'A' ? linkText(n) : ''))).join('').replace(/\s+/g, ' ').trim();
        })(),
        alsoHrefs: [...(node?.querySelectorAll(':scope > .cfah-also a') || [])].map((el) => el.getAttribute('href') || ''),
        tag: '',
        copies,
        replies,
      };
    };
    return [...document.querySelectorAll('#cfah-platforms, #cfah-platforms-sources')].map((ul) => [...ul.querySelectorAll(':scope > li.cfah-platform')].map((sec) => {
      const head = sec.querySelector(':scope > a');
      const responses = sec.querySelector(':scope > ul.links > li.cfah-responses');
      return {
        head: linkText(head),
        href: head?.getAttribute('href') || '',
        target: head?.getAttribute('target') || '',
        rel: head?.getAttribute('rel') || '',
        hidden: head?.querySelector('.visually-hidden')?.textContent || '',
        headTag: sec.querySelector(':scope > .tag')?.textContent?.trim() || '',
        papers: [...sec.querySelectorAll(':scope > ul.links > li:not(.cfah-responses)')].map(itemOf),
        responseLabel: responses?.querySelector(':scope > .cfah-responses-label')?.textContent?.trim() || '',
        responses: responses ? [...responses.querySelectorAll(':scope > ol.cfah-thread > li.cfah-fork')].map(forkOf) : [],
      };
    }));
  };
  const walk = (items, out = []) => {
    for (const item of items) {
      out.push(item);
      if (item.copies?.length) walk(item.copies, out);
      if (item.replies?.length) walk(item.replies, out);
    }
    return out;
  };
  const outlineOf = (items, depth = 0) => items.map((item) => {
    const line = `${'  '.repeat(depth)}${item.kind || item.tag || 'item'} ${item.text}${item.author ? ` — ${item.author}` : ''}${item.on ? ` ${item.on}` : ''}${item.also ? ` ${item.also}` : ''}`;
    return [line, ...outlineOf(item.replies || [], depth + 1), ...(item.copies || []).map((copy) => `${'  '.repeat(depth + 1)}${copy.tag} ${copy.text}`)];
  }).flat();
  const o = await open('/chronologies/', { width: 390, height: 844 });
  const lists = await o.page.evaluate(readLists);
  const underCard = lists[0] || [];
  const underSources = lists[1] || [];
  const same = JSON.stringify(underCard) === JSON.stringify(underSources);
  check('chronologies: CFAH list appears under the chronology and in All free sources', underCard.length === 2 && underSources.length === 2 && same, `card ${underCard.length}, sources ${underSources.length}`);
  const heads = underCard.map((s) => [s.head, s.href]);
  check('chronologies: CFAH sections are Answers Research Journal and OSF Preprint', JSON.stringify(heads) === JSON.stringify([
    ['Answers Research Journal', 'https://answersresearchjournal.org/chronology/'],
    ['OSF Preprint', 'https://osf.io/prhfz'],
  ]), JSON.stringify(heads));
  const responseLabels = underCard.map((s) => s.responseLabel);
  check('chronologies: both CFAH sections have a Responses subsection', responseLabels.length === 2 && responseLabels.every((label) => label === 'Responses') && underCard.every((s) => s.responses.length > 0), responseLabels.join(' | '));
  const links = [
    ...underCard.map((s) => ({ text: s.head, href: s.href, target: s.target, rel: s.rel, hidden: s.hidden, tag: '' })),
    ...walk(underCard.flatMap((s) => [...s.papers, ...s.responses])),
  ];
  const generic = links.filter((row) => row.text.length < 8 || GENERIC.has(row.text.toLowerCase()));
  check('chronologies: every CFAH link text is the article or section name', generic.length === 0, generic.map((row) => row.text).join(' | '));
  const allCopies = walk(underCard.flatMap((s) => [...s.papers, ...s.responses])).filter((row) => row.tag);
  check('chronologies: every CFAH copy has a tag', allCopies.length > 0 && allCopies.every((row) => row.tag && row.tag !== row.text), `${allCopies.length} tags`);
  const hostOk = (href) => {
    try {
      const host = new URL(href).host;
      return host === 'answersresearchjournal.org' || host === 'osf.io';
    } catch { return false; }
  };
  const badHost = links.filter((row) => !hostOk(row.href));
  check('chronologies: every CFAH URL is answersresearchjournal.org or osf.io', badHost.length === 0, badHost.map((row) => row.href).join(' '));
  const a11y = links.every((row) => row.target === '_blank' && row.rel.includes('noopener') && row.hidden === ' (opens in a new tab)');
  check('chronologies: CFAH links say they open in a new tab', a11y);
  const arj = underCard[0];
  const osf = underCard[1];
  const findFork = (items, hrefPart) => {
    for (const item of items || []) {
      if (item.href?.includes(hrefPart)) return item;
      const nested = findFork(item.replies, hrefPart);
      if (nested) return nested;
    }
    return null;
  };
  const osgood = findFork(arj?.responses, 'comments-1');
  check('chronologies: ARJ comment names its author', !!osgood && osgood.author === 'A. John M. Osgood' && !osgood.text.includes('Osgood'), osgood ? `${osgood.text} / ${osgood.author}` : '');
  check('chronologies: section headers carry free-to-read once', underCard.every((s) => s.headTag === 'free-to-read') && underCard.every((s) => s.papers.every((p) => p.access === 'free-to-read')), underCard.map((s) => s.headTag).join(' | '));
  const gmx = osf?.papers.find((row) => row.href === 'https://osf.io/gmx5j/');
  const older = gmx?.copies.find((row) => row.href === 'https://osf.io/t3vu5/');
  check('chronologies: gmx5j uses the current OSF title and nests the older CFAH-7A copy', gmx?.text === 'CFAH-7: A Chronological Baseline for the Old and Middle Kingdoms of Egypt' && older?.tag === 'older version' && older.text.startsWith('CFAH-7A:'), `${gmx?.text || ''} / ${older?.tag || ''} ${older?.text || ''}`);
  const tweedyInPapers = osf?.papers.some((row) => row.href === 'https://osf.io/dfkbm/');
  const tweedy = osf?.responses.find((row) => row.href === 'https://osf.io/dfkbm/');
  const tweedyPdf = tweedy?.copies.find((row) => row.tag === 'PDF');
  check('chronologies: Tweedy ice-age response is under OSF Responses', !tweedyInPapers && tweedy?.text === "CFAH Response to Tweedy's Ice Age Paper" && !tweedy.on && tweedyPdf?.href.startsWith('https://osf.io/download/'), tweedy?.text || '');
  const pdfs = allCopies.filter((row) => row.tag === 'PDF');
  check('chronologies: OSF paper files are tagged PDF', pdfs.length >= 20 && pdfs.every((row) => row.href.startsWith('https://osf.io/')), String(pdfs.length));
  const reply = findFork(arj?.responses, 'ancient-history-reply');
  const comments2 = arj?.responses.find((row) => row.href.includes('comments-2'));
  const habermehl = findFork(arj?.responses, '1-5-comments/');
  const habermehlResponse = findFork(habermehl?.replies, '1-5-response');
  const tweedyComments = findFork(arj?.responses, 'cfah-1-5-comments-tweedy');
  const partsReply = findFork(tweedyComments?.replies, 'cfah-1-5-reply');
  const further = findFork(partsReply?.replies, 'further-comments-griffith-white');
  const threadOk = osgood?.on === 'on Papers 1 and 3'
    && osgood?.kind === 'Comment'
    && reply && osgood.replies?.some((row) => row.href === reply.href)
    && reply.kind === 'Reply'
    && reply.also === 'also answers: Comments 2'
    && reply.alsoHrefs?.[0]?.includes('comments-2')
    && comments2?.on === 'on Paper 3'
    && !comments2.replies?.length
    && habermehl?.on === 'on Papers 1–5'
    && habermehlResponse?.kind === 'Response'
    && tweedyComments?.on === 'on Papers 1–5'
    && partsReply?.kind === 'Reply'
    && further?.kind === 'Comment'
    && further?.author === 'Eric J. Tweedy';
  check('chronologies: ARJ responses fork under the comment they answer', threadOk, outlineOf(arj?.responses || []).join(' / '));
  const parentIds = new Map();
  const indexParents = (items, ancestors = []) => {
    for (const item of items || []) {
      parentIds.set(item.id, ancestors);
      indexParents(item.replies, [...ancestors, item.id]);
    }
  };
  indexParents(arj?.responses);
  indexParents(osf?.responses);
  const sourceDoc = JSON.parse(readFileSync(join(here, '..', 'data', 'sources.json'), 'utf8'));
  const bySource = new Map(sourceDoc.sources.map((s) => [s.id, s]));
  const missingParents = [];
  for (const s of sourceDoc.sources) {
    if (s.role !== 'response') continue;
    const responseTargets = (s.responds_to || []).filter((id) => bySource.get(id)?.role === 'response');
    if (!responseTargets.length) continue;
    const ancestors = parentIds.get(s.id) || [];
    if (!ancestors.includes(responseTargets[0]) || !bySource.get(responseTargets[0])) missingParents.push(`${s.id} -> ${responseTargets[0]}`);
    for (const extra of responseTargets.slice(1)) if (!bySource.get(extra)) missingParents.push(`${s.id} also ${extra}`);
  }
  check('chronologies: every reply parent exists in the fork', missingParents.length === 0, missingParents.join(' | '));
  check('chronologies: Beckman reply is not in the CFAH list', !links.some((row) => row.href.includes('5b64m')));
  const fit = await o.page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return [...document.querySelectorAll('#cfah-platforms, #cfah-platforms-sources')].map((list) => {
      const r = list.getBoundingClientRect();
      const wide = [...list.querySelectorAll('li, a')].filter((item) => item.getBoundingClientRect().right > vw + 1).length;
      return { left: Math.round(r.left), right: Math.round(r.right), vw, wide };
    });
  });
  check('chronologies: CFAH list fits at 390px', fit.length === 2 && fit.every((row) => row.left >= 0 && row.right <= row.vw + 1 && row.wide === 0), JSON.stringify(fit));
  const threadPaint = await o.page.evaluate(() => {
    const block = document.querySelector('#cfah-platforms .cfah-responses');
    const lists = [...document.querySelectorAll('#cfah-platforms .cfah-responses, #cfah-platforms .cfah-responses ol, #cfah-platforms .cfah-responses ul, #cfah-platforms .cfah-responses li')];
    const bullets = lists.filter((el) => getComputedStyle(el).listStyleType !== 'none').map((el) => `${el.tagName}.${el.className} ${getComputedStyle(el).listStyleType}`);
    const forks = [...document.querySelectorAll('#cfah-platforms .cfah-fork')];
    const connectors = forks.map((el) => {
      const elbow = getComputedStyle(el, '::before');
      const trunk = getComputedStyle(el.parentElement);
      return {
        elbow: parseFloat(elbow.width) > 0 && parseFloat(elbow.borderTopWidth) >= 1,
        trunk: parseFloat(trunk.borderLeftWidth) >= 1,
      };
    });
    const accessInResponses = [...document.querySelectorAll('#cfah-platforms .cfah-responses .tag')].filter((el) => !el.classList.contains('tag-kind') && !el.classList.contains('tag-copy')).map((el) => el.textContent.trim());
    return {
      bullets,
      forks: forks.length,
      connectorsOk: connectors.length > 0 && connectors.every((row) => row.elbow && row.trunk),
      accessInResponses,
      marker: block ? getComputedStyle(block, '::marker').content : '',
    };
  });
  check('chronologies: Responses have no bullets', threadPaint.bullets.length === 0 && threadPaint.marker !== 'disc', threadPaint.bullets.join(' | ') || threadPaint.marker);
  check('chronologies: response connectors render', threadPaint.connectorsOk && threadPaint.forks >= 8, JSON.stringify({ forks: threadPaint.forks, connectorsOk: threadPaint.connectorsOk }));
  check('chronologies: responses do not repeat free-to-read', threadPaint.accessInResponses.length === 0, threadPaint.accessInResponses.join(' | '));
  await o.page.addStyleTag({ content: '.site-header{position:static !important}' });
  await o.page.locator('#cfah .cfah-platforms').screenshot({ path: join(SHOTS, 'chronologies-cfah-list-390.png') });
  await o.page.locator('#cfah-platforms .cfah-responses').nth(0).screenshot({ path: join(SHOTS, 'chronologies-responses-arj-390.png') });
  await o.page.locator('#cfah-platforms .cfah-responses').nth(1).screenshot({ path: join(SHOTS, 'chronologies-responses-osf-390.png') });
  check('chronologies: no console errors on the CFAH list', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
  const wide = await open('/chronologies/', { width: 1280, height: 900 });
  await wide.page.addStyleTag({ content: '.site-header{position:static !important}' });
  await wide.page.locator('#cfah-platforms .cfah-responses').nth(0).screenshot({ path: join(SHOTS, 'chronologies-responses-arj-1280.png') });
  await wide.page.locator('#cfah-platforms .cfah-responses').nth(1).screenshot({ path: join(SHOTS, 'chronologies-responses-osf-1280.png') });
  const wideFit = await wide.page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const block = document.querySelector('#cfah-platforms .cfah-responses');
    const wideNodes = [...block.querySelectorAll('li, a')].filter((item) => item.getBoundingClientRect().right > vw + 1).length;
    return { vw, wideNodes };
  });
  check('chronologies: ARJ responses fit at 1280px', wideFit.vw === 1280 && wideFit.wideNodes === 0, JSON.stringify(wideFit));
  await wide.ctx.close();
  const dark = await open('/chronologies/', { width: 390, height: 844, scheme: 'dark' });
  const contrast = await dark.page.evaluate(() => {
    const a = document.querySelector('#cfah-platforms a');
    const tag = document.querySelector('#cfah-platforms .tag-copy');
    if (!a || !tag) return { missing: true };
    const color = getComputedStyle(a).color;
    const tagColor = getComputedStyle(tag).color;
    const bg = getComputedStyle(document.body).backgroundColor;
    return { color, tagColor, bg, same: color === bg || tagColor === bg };
  });
  check('chronologies: CFAH links and copy tags stay visible in dark mode', contrast.color && contrast.bg && !contrast.same, JSON.stringify(contrast));
  const darkLine = await dark.page.evaluate(() => {
    const fork = document.querySelector('#cfah-platforms .cfah-fork');
    const trunk = fork?.parentElement;
    if (!fork || !trunk) return { missing: true };
    const elbow = getComputedStyle(fork, '::before').borderTopColor;
    const line = getComputedStyle(trunk).borderLeftColor;
    const bg = getComputedStyle(document.body).backgroundColor;
    return { elbow, line, bg, same: elbow === bg || line === bg };
  });
  check('chronologies: response connectors stay visible in dark mode', darkLine.elbow && darkLine.line && !darkLine.same, JSON.stringify(darkLine));
  await dark.page.addStyleTag({ content: '.site-header{position:static !important}' });
  await dark.page.locator('#cfah-platforms .cfah-responses').nth(0).screenshot({ path: join(SHOTS, 'chronologies-responses-arj-390-dark.png') });
  await dark.ctx.close();
  const darkWide = await open('/chronologies/', { width: 1280, height: 900, scheme: 'dark' });
  await darkWide.page.addStyleTag({ content: '.site-header{position:static !important}' });
  await darkWide.page.locator('#cfah-platforms .cfah-responses').nth(0).screenshot({ path: join(SHOTS, 'chronologies-responses-arj-1280-dark.png') });
  await darkWide.ctx.close();
}
{
  const o = await open('/chronologies/raleigh-chronological-table/');
  check('raleigh table: HTTP 200', o.status === 200);
  check('raleigh table: no console errors', o.errors.length === 0, o.errors.join(' | '));
  const h1 = await o.page.locator('h1').innerText();
  check('raleigh table: heading', h1 === 'A Chronological Table', h1);
  const modern = await o.page.evaluate(() => {
    const cell = [...document.querySelectorAll('#raleigh-table td, #raleigh-table th')].find((el) => el.querySelector('.spell-original')?.textContent.includes('Adaˉ'));
    if (!cell) return { missing: true };
    const shown = cell.innerText;
    const original = cell.querySelector('.spell-original');
    return { shown, originalHidden: getComputedStyle(original).display === 'none' };
  });
  check('raleigh table: modern view shows Adam', modern.originalHidden && /Adam/.test(modern.shown) && !/Adaˉ/.test(modern.shown), JSON.stringify(modern));
  const adamHtml = await o.page.evaluate(() => {
    const cell = [...document.querySelectorAll('#raleigh-table td, #raleigh-table th')].find((el) => el.querySelector('.spell-original')?.textContent.includes('Adaˉ'));
    return cell ? cell.innerHTML : '';
  });
  check('raleigh table: Adam yeere shows 4032 BC', /AM 1/.test(modern.shown || '') && /4032 BC/.test(modern.shown || '') && !/\(derived:/.test(modern.shown || '') && adamHtml.includes('<em>4032 BC</em>'), JSON.stringify(modern.shown || '').slice(0, 240));
  const NOTE = "Derived by the portal from Raleigh's Creation in 4032 BC; Raleigh prints only the yeere of the World.";
  const ITALICS = 'Dates in italics are derived.';
  const intro = await o.page.locator('#raleigh-table .card').first().innerText();
  check('raleigh table: intro states the derived note', intro.includes(NOTE) && intro.includes('AM 1656') && intro.includes('2377 BC'), intro.slice(0, 280));
  const bad = await o.page.evaluate(() => {
    const cell = [...document.querySelectorAll('#raleigh-table td')].find((el) => el.innerText.includes('3840') && el.innerText.includes('2158'));
    return cell ? cell.innerText : '';
  });
  check('raleigh table: unconfirmed 3840/2158 pair is not derived', bad.includes('Not derived') && !bad.includes('(derived:') && !/\(\d+ BC\)/.test(bad), bad.slice(0, 220));
  await o.page.screenshot({ path: join(SHOTS, 'raleigh-derived-table-intro.png'), fullPage: false });
  const floodCells = o.page.locator('#raleigh-table td', { hasText: 'AM 1656' }).filter({ hasText: '2377 BC' });
  const floodHtml = (await floodCells.count()) ? await floodCells.first().innerHTML() : '';
  check('raleigh table: Flood cell shows 2377 BC', (await floodCells.count()) >= 1 && floodHtml.includes('<em>2377 BC</em>') && floodHtml.includes('AM 1656'), floodHtml.slice(0, 220));
  await floodCells.first().scrollIntoViewIfNeeded();
  await o.page.screenshot({ path: join(SHOTS, 'raleigh-derived-table-flood.png'), fullPage: false });
  await o.page.getByRole('button', { name: 'Original spelling' }).click();
  const original = await o.page.evaluate(() => {
    const cell = [...document.querySelectorAll('#raleigh-table td, #raleigh-table th')].find((el) => el.querySelector('.spell-original')?.textContent.includes('Adaˉ'));
    const shown = cell ? cell.innerText : '';
    const modernSpan = cell?.querySelector('.spell-modern');
    const originalSpan = cell?.querySelector('.spell-original');
    return {
      shown,
      modernHidden: modernSpan ? getComputedStyle(modernSpan).display === 'none' : false,
      originalShown: originalSpan ? getComputedStyle(originalSpan).display !== 'none' : false,
      pressed: document.querySelector('[data-set-spelling="original"]')?.getAttribute('aria-pressed'),
    };
  });
  check('raleigh table: original spelling shows Adaˉ', original.originalShown && original.modernHidden && /Adaˉ/.test(original.shown) && original.pressed === 'true', JSON.stringify(original));
  const downloads = [
    ['/chronologies/raleigh-chronological-table/a-chronological-table.csv', 'Signature', 'Adam'],
    ['/chronologies/raleigh-chronological-table/a-chronological-table.md', '# A Chronological Table', 'Adam'],
    ['/chronologies/raleigh-chronological-table/a-chronological-table.xls', '<Workbook', 'Adam'],
    ['/chronologies/raleigh-chronological-table/a-chronological-table-original-spelling.csv', 'Signature', 'Adaˉ'],
    ['/chronologies/raleigh-chronological-table/a-chronological-table-original-spelling.md', 'YEERES OF THE JVLIAN', 'Adaˉ'],
    ['/chronologies/raleigh-chronological-table/a-chronological-table-original-spelling.xls', '<Workbook', 'Adaˉ'],
  ];
  for (const [path, a, b] of downloads) {
    const r = await o.page.request.get(BASE + path);
    const body = await r.text();
    check(`raleigh table: ${path.split('/').pop()}`, r.status() === 200 && body.includes(a) && body.includes(b), `HTTP ${r.status()} ${body.slice(0, 60).replace(/\s+/g, ' ')}`);
  }
  const csv = await (await o.page.request.get(BASE + '/chronologies/raleigh-chronological-table/a-chronological-table.csv')).text();
  check('raleigh table: csv derives Adam and the Flood', csv.includes('AM 1 (4032 BC)') && csv.includes('AM 1656 (2377 BC)') && !csv.includes('(derived:'));
  const tableNote = await o.page.locator('#raleigh-table .raleigh-derived-note').innerText();
  check('raleigh table: italics note', tableNote.startsWith(ITALICS) && tableNote.includes(NOTE), tableNote);
  await o.ctx.close();
}
{
  const o = await open('/chronologies/raleigh-chronological-table/', { width: 390, height: 844 });
  const overflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const scrolls = await o.page.evaluate(() => {
    const w = document.querySelector('.raleigh-wrap');
    return !!w && w.scrollWidth > w.clientWidth + 1;
  });
  check('raleigh table mobile: no horizontal page overflow', !overflow);
  check('raleigh table mobile: table scrolls inside its frame', scrolls);
  check('raleigh table mobile: no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
{
  const NOTE = "Derived by the portal from Raleigh's Creation in 4032 BC; Raleigh prints only the yeere of the World.";
  const ITALICS = 'Dates in italics are derived.';
  const o = await open('/events/the-flood/');
  const html = await o.page.locator('table.chron').innerHTML();
  const text = await o.page.locator('table.chron').innerText();
  check('flood: Raleigh AM 1656 shows 2377 BC', text.includes('AM 1656') && html.includes('<em>2377 BC</em>') && !text.includes('(derived:'), text.slice(0, 240));
  const note = await o.page.locator('.raleigh-derived-note').innerText();
  check('flood: italics note', note.startsWith(ITALICS) && note.includes(NOTE), note);
  check('flood: no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
{
  const NOTE = "Derived by the portal from Raleigh's Creation in 4032 BC; Raleigh prints only the yeere of the World.";
  const ITALICS = 'Dates in italics are derived.';
  const o = await open('/people/adam/');
  const birth = o.page.locator('#birth');
  const text = await birth.innerText();
  const html = await birth.innerHTML();
  check('adam: Raleigh AM 1 shows 4032 BC', text.includes('AM 1') && text.includes('4032 BC') && html.includes('<em>4032 BC</em>') && !text.includes('(derived:'), text.slice(0, 240));
  const life = await o.page.locator('.person-list').innerText();
  check('adam: lifespan list shows the italic year as text', life.includes('AM 1') && life.includes('4032 BC'), life.slice(0, 240));
  const note = await o.page.locator('.raleigh-derived-note').innerText();
  check('adam: italics note', note.startsWith(ITALICS) && note.includes(NOTE), note);
  await birth.scrollIntoViewIfNeeded();
  await o.page.screenshot({ path: join(SHOTS, 'raleigh-derived-adam.png'), fullPage: false });
  check('adam: no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
// BibleUp: one script tag, detection on a written reference, BSB text in the popover.
{
  const o = await open('/about/');
  check('about: no italics note without a derived date', (await o.page.locator('.raleigh-derived-note').count()) === 0);
  const tags = await o.page.locator('script[src*="/assets/bibleup.js"]').count();
  check('about: one BibleUp script', tags === 1, String(tags));
  check('about: chronology sentence is not tagged', (await o.page.locator('p.bu-ignore cite').count()) === 0);
  const link = o.page.locator('cite.bu-link a', { hasText: 'John 3:16' });
  check('about: John 3:16 detected', (await link.count()) === 1);
  await link.hover();
  const pop = o.page.locator('.bible-popover');
  await pop.waitFor({ state: 'visible', timeout: 8000 });
  await o.page.waitForFunction(() => {
    const el = document.querySelector('.bible-popover');
    return !!el && /For God so loved the world/.test(el.innerText);
  }, null, { timeout: 8000 }).catch(() => {});
  const text = await pop.innerText();
  check('about: popover shows the Berean Standard Bible', /For God so loved the world/.test(text) && /\bBSB\b/.test(text) && !/did not send His Son/.test(text), text.slice(0, 220));
  check('about: popover asks for the Amundson Interpretive Version', text.includes('Amundson Interpretive Version'));
  await o.page.keyboard.press('Escape');
  check('about: Escape closes the popover', await pop.isHidden());
  check('about: no console errors', o.errors.length === 0, o.errors.join(' | '));
  if (o.external.length) results.push(`INFO  about: external resource issues: ${o.external.join(' | ')}`);
  await o.ctx.close();
}
// Chapter spans: "(1 Sam 8–11)" is chapters 8 through 11, not verse 1 of chapter 8.
{
  const o = await open('/events/saul-made-king/');
  const link = o.page.locator('.lede a[bu-data]').filter({ hasText: '1 Sam 8' });
  const shown = (await link.count()) === 1 ? (await link.innerText()) : '';
  check('saul: 1 Sam 8–11 is one link', shown.replace(/\s/g, '') === '1Sam8–11', JSON.stringify(shown));
  const acts = await o.page.locator('.lede a[bu-data]').filter({ hasText: 'Acts 13:21' }).innerText();
  check('saul: Acts 13:21 stays one verse', acts.trim() === 'Acts 13:21', JSON.stringify(acts));
  await link.hover();
  const pop = o.page.locator('.bible-popover');
  await pop.waitFor({ state: 'visible', timeout: 8000 });
  const ready = await o.page.waitForFunction(() => {
    const t = document.querySelector('.bible-popover')?.innerText || '';
    return /When Samuel grew old/.test(t) && /Nahash the Ammonite/.test(t) && /confirmed Saul as king/.test(t);
  }, null, { timeout: 15000 }).then(() => true).catch(() => false);
  const text = await pop.innerText();
  check('saul: popover shows 1 Samuel 8 through 11', ready && /Chapter 8/.test(text) && /Chapter 11/.test(text), text.slice(0, 180) + ' … ' + text.slice(-120));
  check('saul: no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
{
  const o = await open('/events/arrival-at-sinai/');
  const link = o.page.locator('.lede a[bu-data]').filter({ hasText: 'Exod 19' });
  const shown = (await link.count()) === 1 ? (await link.innerText()) : '';
  check('sinai: Exod 19-20 is one link', shown.replace(/\s/g, '') === 'Exod19-20', JSON.stringify(shown));
  await link.hover();
  await o.page.locator('.bible-popover').waitFor({ state: 'visible', timeout: 8000 });
  const ready = await o.page.waitForFunction(() => {
    const t = document.querySelector('.bible-popover')?.innerText || '';
    return /third month/.test(t) && /God spoke all these words/.test(t);
  }, null, { timeout: 15000 }).then(() => true).catch(() => false);
  check('sinai: popover shows Exodus 19 and 20', ready);
  check('sinai: no console errors', o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
// Reign-start sort is named on the person page. The old Sennacherib URL 301s.
{
  const redirectFile = readFileSync(join(here, 'dist/_redirects'), 'utf8');
  check('redirect file: Sennacherib 301 is in dist/_redirects', redirectsFileHasSennacherib(redirectFile), redirectFile.trim());
  const ctx = await browser.newContext();
  const resp = await ctx.request.get(`${BASE}/events/sennacherib-first-invasion/`, { maxRedirects: 0 });
  const location = resp.headers()['location'] || '';
  check('redirect: /events/sennacherib-first-invasion/ is 301', resp.status() === 301, `status ${resp.status()} location ${location}`);
  check('redirect: target is /events/sennacherib-besieges-jerusalem/', location === '/events/sennacherib-besieges-jerusalem/', location);
  check('redirect: line matches the build', SENNACHERIB_REDIRECT.startsWith('/events/sennacherib-first-invasion/'));
  await ctx.close();
  const o = await open('/people/ahab/');
  const sortText = await o.page.locator('.sortbox').innerText();
  check('ahab: page says Sorted by reign start (Ussher–Jones)', /Sorted by reign start \(Ussher–Jones\)/.test(sortText), sortText.slice(0, 240));
  check('ahab: the reign row sets the sort year', (await o.page.locator('#reign tr.is-sort .flag-sort').count()) === 1);
  check('ahab: HTTP 200, no console errors', o.status === 200 && o.errors.length === 0, o.errors.join(' | '));
  await o.ctx.close();
}
// Name spellings share one row. Footnotes stay in a closed disclosure. A marker opens it.
// Date tables keep one top-level row per author. Same year, nested quotes. Different year, a sub-row.
{
  // Element shots otherwise paint the sticky header across a tall card. Position is restored so the click check still measures the sticky header.
  async function shot(page, selector, path) {
    await page.evaluate(() => {
      const header = document.querySelector('.site-header');
      if (!header) return;
      header.dataset.shotPosition = header.style.position || '';
      header.style.position = 'relative';
    });
    await page.locator(selector).screenshot({ path });
    await page.evaluate(() => {
      const header = document.querySelector('.site-header');
      if (!header || !('shotPosition' in header.dataset)) return;
      header.style.position = header.dataset.shotPosition;
      delete header.dataset.shotPosition;
    });
  }
  async function rowMergeUi(engine, launcher) {
    const own = launcher === browser ? null : await launcher.launch();
    const b = own || browser;
    for (const [width, height, scheme] of [[390, 844, 'light'], [390, 844, 'dark'], [1280, 900, 'light'], [1280, 900, 'dark']]) {
      const ctx = await b.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: width < 500 ? 2 : 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const resp = await page.goto(BASE + '/people/abraham/', { waitUntil: 'load', timeout: 30000 });
      const tag = `abraham names (${engine} ${width}px ${scheme})`;
      const closed = await page.locator('#abraham-name-notes').evaluate((d) => !d.open && !d.hasAttribute('open'));
      const hidden = await page.locator('#abraham-name-notes .name-notes').isHidden();
      const summary = await page.locator('#abraham-name-notes > summary').evaluate((el) => {
        const cs = getComputedStyle(el);
        const before = getComputedStyle(el, '::before');
        const bg = getComputedStyle(document.body).backgroundColor;
        const lum = (c) => { const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? (+m[1] + +m[2] + +m[3]) / 3 : null; };
        const box = el.getBoundingClientRect();
        return { h: box.height, summary: lum(cs.color), bg: lum(bg), chevron: before.borderRightWidth, open: el.parentElement.open };
      });
      const spellings = await page.locator('#name table.names tbody tr').evaluateAll((trs) => trs.map((tr) => ({
        key: tr.getAttribute('data-spelling'),
        cells: [...tr.children].map((c) => c.innerText.replace(/\s+/g, ' ').trim()),
      })));
      const keys = spellings.map((r) => r.key);
      const heb = spellings.map((r) => r.cells[0] || '');
      const abraham = spellings.find((r) => r.cells[0] === 'Abraham');
      const abram = spellings.find((r) => r.cells[0] === 'Abram');
      check(`${tag}: HTTP 200, disclosure closed`, resp.status() === 200 && closed && hidden && summary.open === false && errors.length === 0, errors.join(' | '));
      check(`${tag}: one row per spelling`, spellings.length === 4 && new Set(keys).size === keys.length && heb.some((t) => t.includes('אַבְרָהָם')) && heb.some((t) => t.includes('אַבְרָם')), keys.join(' ; '));
      check(`${tag}: Abraham and Abram list Bible and History`, /Bible/.test(abraham?.cells[3] || '') && /History/.test(abraham?.cells[3] || '') && /Bible/.test(abram?.cells[3] || '') && /History/.test(abram?.cells[3] || '') && (abraham?.cells[3].match(/Abraham|Bible|History/g) || []).length >= 2, `${abraham?.cells[3]} || ${abram?.cells[3]}`);
      const contrast = summary.summary != null && summary.bg != null && Math.abs(summary.summary - summary.bg) > 120 && summary.h >= 44 && summary.chevron !== '0px';
      check(`${tag}: footnote summary is tappable and readable`, contrast, JSON.stringify(summary));
      if (width < 500) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        check(`${tag}: no horizontal page overflow`, !overflow);
      }
      if (engine === 'chromium' && width === 390 && scheme === 'light') {
        await shot(page, '#name', join(SHOTS, 'abraham-name-390-closed.png'));
      }
      const familyClosed = await page.locator('#family-chart-details').evaluate((d) => !d.open);
      await page.locator('#name a.fn[href="#abraham-fn-4"]').click();
      await page.waitForFunction(() => document.getElementById('abraham-name-notes')?.open === true, null, { timeout: 3000 }).catch(() => {});
      const opened = await page.evaluate(() => {
        const details = document.getElementById('abraham-name-notes');
        const note = document.getElementById('abraham-fn-4');
        const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
        const r = note?.getBoundingClientRect();
        return {
          open: !!details?.open,
          cited: /Abraham/.test(note?.innerText || ''),
          top: r ? Math.round(r.top) : null,
          header: Math.round(header),
          inView: !!r && r.height > 0 && r.top >= header - 2 && r.top < window.innerHeight - 8,
          family: document.getElementById('family-chart-details')?.open === true,
        };
      });
      check(`${tag}: marker opens the note and leaves the family chart closed`, opened.open && opened.inView && opened.cited && !opened.family && familyClosed, JSON.stringify(opened));
      const once = await page.locator('#abraham-name-notes ol.name-notes').evaluate((ol) => {
        const rows = [...ol.querySelectorAll(':scope > li')].map((li) => {
          const a = li.querySelector(':scope > a.fn');
          const clone = a ? a.cloneNode(true) : null;
          clone?.querySelectorAll('.visually-hidden').forEach((n) => n.remove());
          const num = clone ? clone.textContent.replace(/\s+/g, ' ').trim() : '';
          const text = li.innerText.replace(/\s+/g, ' ').trim();
          const box = a ? a.getBoundingClientRect() : null;
          return {
            num,
            text,
            marker: getComputedStyle(li, '::marker').content,
            liType: getComputedStyle(li).listStyleType,
            visible: !!box && box.width > 4 && box.height > 4,
            hidden: a?.querySelector('.visually-hidden')?.textContent || '',
            href: a?.getAttribute('href') || '',
            id: li.id,
          };
        });
        return { type: getComputedStyle(ol).listStyleType, rows };
      });
      // list-style: none keeps ::marker content at "normal" and paints no glyph. A decimal marker would set listStyleType to "decimal".
      const onceOk = once.type === 'none' && once.rows.length >= 2 && once.rows.every((r) => /^\d+$/.test(r.num) && r.liType === 'none' && r.marker !== 'counter(list-item)' && r.visible && r.hidden.includes('Back to footnote') && r.href.endsWith(`-fnref-${r.num}`) && r.id.endsWith(`-fn-${r.num}`) && !new RegExp(`(?:^|\\s)${r.num}\\s+${r.num}\\b`).test(r.text));
      check(`${tag}: footnote number prints once`, onceOk, JSON.stringify(once).slice(0, 500));
      if (engine === 'chromium' && width === 390 && scheme === 'light') {
        await shot(page, '#name', join(SHOTS, 'abraham-name-390-open.png'));
        await shot(page, '#abraham-name-notes', join(SHOTS, 'abraham-footnotes-390.png'));
      }
      await ctx.close();
    }
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/people/abraham/', { waitUntil: 'load', timeout: 30000 });
    const birth = await page.locator('#birth table.chron').evaluate((table) => {
      const authors = [...table.querySelectorAll('tr[data-author]')].map((tr) => tr.getAttribute('data-author'));
      const row = (author) => table.querySelector(`tr[data-author="${author}"]`);
      const count = (author) => [...table.querySelectorAll('tr')].filter((tr) => tr.getAttribute('data-author') === author || tr.getAttribute('data-author-sub') === author).length;
      const raleigh = row('raleigh-history-of-the-world');
      const hales = row('hales');
      return {
        unique: new Set(authors).size === authors.length,
        raleighRows: count('raleigh-history-of-the-world'),
        raleighQuotes: raleigh ? raleigh.querySelectorAll('.date-quote').length : 0,
        raleighHtml: raleigh ? raleigh.innerHTML : '',
        halesRows: count('hales'),
        halesQuotes: hales ? hales.querySelectorAll('.date-quotes li').length : 0,
        halesText: hales ? hales.innerText : '',
        shuckfordRows: count('shuckford'),
        generationsRows: count('generations'),
        generationsText: (row('generations')?.innerText || '') + (table.querySelector('tr[data-author-sub="generations"]')?.innerText || ''),
      };
    });
    check(`${engine}: Abraham birth has one Raleigh row and both quotations`, birth.unique && birth.raleighRows === 1 && birth.raleighQuotes === 2 && birth.raleighHtml.includes('<em>2024 BC</em>') && birth.raleighHtml.includes('yeere of the World, 2009') && birth.raleighHtml.includes('1. Abram. 175'), birth.raleighHtml.slice(0, 240));
    check(`${engine}: Abraham birth nests Hales’s three 2153 BC quotations`, birth.halesRows === 1 && birth.halesQuotes === 3 && /2153/.test(birth.halesText) && /Abraham born 2153/.test(birth.halesText), birth.halesText.slice(0, 200));
    check(`${engine}: Shuckford’s two years and Generations’ two editions stay under one author`, birth.shuckfordRows === 2 && birth.generationsRows === 2 && /2166 BC/.test(birth.generationsText) && /1996/.test(birth.generationsText), JSON.stringify({ shuckford: birth.shuckfordRows, generations: birth.generationsRows }));
    const note = await page.locator('.raleigh-derived-note').innerText();
    check(`${engine}: derived italics note still follows the date tables`, note.startsWith('Dates in italics are derived.'), note.slice(0, 160));
    if (engine === 'chromium') await shot(page, '#birth', join(SHOTS, 'abraham-birth-merged.png'));
    await ctx.close();
    if (own) await own.close();
  }
  await rowMergeUi('chromium', browser);
  await rowMergeUi('webkit', webkit);
}
{
  async function shot(page, selector, path) {
    await page.evaluate(() => {
      const header = document.querySelector('.site-header');
      if (!header) return;
      header.dataset.shotPosition = header.style.position || '';
      header.style.position = 'relative';
    });
    await page.locator(selector).screenshot({ path });
    await page.evaluate(() => {
      const header = document.querySelector('.site-header');
      if (!header || !('shotPosition' in header.dataset)) return;
      header.style.position = header.dataset.shotPosition;
      delete header.dataset.shotPosition;
    });
  }
  const pages = [
    ['/events/martyrdom-of-stephen/', 'stephen', { top: ['4035', 'AD 32'], sub: ['21st ed. (2019)', '4033 AM, AD 30', 'AM 4033'] }],
    ['/events/esther-made-queen/', 'esther', { top: ['515 BC'], sub: ['21st ed. (2019)', '3490 AM, 514 BC', '514 BC'] }],
  ];
  for (const [path, name, expect] of pages) {
    for (const width of [390, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, colorScheme: 'light', deviceScaleFactor: width < 500 ? 2 : 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
      const info = await page.locator('table.chron').first().evaluate((table) => {
        const text = (el) => (el?.innerText || '').replace(/\s+/g, ' ').trim();
        const top = table.querySelector('tr[data-author="ussher-jones"]');
        const subs = [...table.querySelectorAll('tr[data-author-sub="ussher-jones"]')];
        return {
          separate: !!table.querySelector('tr[data-author="jones-2019"]'),
          authorCount: [...table.querySelectorAll('tr[data-author="ussher-jones"]')].length,
          top: text(top),
          subs: subs.map((tr) => ({ text: text(tr), sub: tr.classList.contains('chron-sub'), edition: !!tr.querySelector('.edition') })),
        };
      });
      const sub = info.subs.find((s) => s.text.includes('21st ed. (2019)'));
      const overflow = width < 500 ? await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1) : false;
      const ok = resp.status() === 200 && errors.length === 0 && !info.separate && info.authorCount === 1 && sub?.sub && sub.edition && expect.sub.every((bit) => sub.text.includes(bit)) && expect.top.every((bit) => info.top.includes(bit)) && !overflow;
      check(`jones-2019 ${name} ${width}px: sub-row under Ussher–Jones`, ok, ok ? '' : JSON.stringify({ status: resp.status(), errors, separate: info.separate, authorCount: info.authorCount, top: info.top.slice(0, 180), sub: sub?.text?.slice(0, 220) }));
      await shot(page, 'table.chron', join(SHOTS, `jones-2019-${name}-${width}.png`));
      await ctx.close();
    }
  }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/events/persecution-under-nero/', { waitUntil: 'load', timeout: 30000 });
  const nero = await page.locator('table.chron').first().evaluate((table) => {
    const text = (el) => (el?.innerText || '').replace(/\s+/g, ' ').trim();
    const sub = [...table.querySelectorAll('tr[data-author-sub="ussher-jones"]')].map((tr) => text(tr)).find((t) => t.includes('21st ed. (2019)')) || '';
    const top = text(table.querySelector('tr[data-author="ussher-jones"]'));
    return { top, sub, separate: !!table.querySelector('tr[data-author="jones-2019"]') };
  });
  check('jones-2019 nero: sub-row shows the AM difference', !nero.separate && /AM 4068/.test(nero.top) && /AD 64/.test(nero.top) && /21st ed\. \(2019\)/.test(nero.sub) && /AM 4067/.test(nero.sub) && /AD 64/.test(nero.sub), JSON.stringify(nero).slice(0, 400));
  await ctx.close();
}
// Doré illustrations (1866): one figure, or a scroll-snap gallery with prev/next, dots and arrow keys.
// Images load from the Internet Archive IIIF service; this checks markup and controls, not image bytes.
{
  const cases = [['/people/noah/', 2], ['/events/the-flood/', 3], ['/people/adam/', 2], ['/people/ham/', 1], ['/events/the-fall/', 1]];
  for (const [path, n] of cases) {
    for (const width of [390, 1280]) {
      const { ctx, page, errors, status } = await open(path, { width, height: 900 });
      const info = await page.evaluate(() => {
        const sec = document.querySelector('section.dore');
        const imgs = [...(sec?.querySelectorAll('img.dore-img') || [])];
        return {
          imgs: imgs.length,
          iiif: imgs.every((i) => i.src.startsWith('https://iiif.archive.org/image/iiif/3/gustavedore%2F') && i.loading === 'lazy' && i.width > 0),
          gallery: !!sec?.querySelector('[data-dore-gallery].dore-js'),
          controls: sec?.querySelector('.dore-controls') ? getComputedStyle(sec.querySelector('.dore-controls')).display : 'none',
          dots: sec?.querySelectorAll('.dore-dot').length || 0,
          status: sec?.querySelector('.dore-status')?.textContent || '',
          caption: sec?.querySelector('figcaption')?.innerText || '',
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      let moved = true;
      if (n > 1) {
        await page.locator('section.dore [data-dore="next"]').click();
        await page.waitForFunction(() => document.querySelector('.dore-status')?.textContent.startsWith('2 of'), null, { timeout: 5000 }).catch(() => {});
        const s2 = await page.locator('.dore-status').textContent();
        await page.locator('.dore-track').focus();
        await page.keyboard.press('ArrowLeft');
        await page.waitForFunction(() => document.querySelector('.dore-status')?.textContent.startsWith('1 of'), null, { timeout: 5000 }).catch(() => {});
        const s1 = await page.locator('.dore-status').textContent();
        moved = s2.startsWith('2 of') && s1.startsWith('1 of');
      }
      const ok = status === 200 && errors.length === 0 && info.imgs === n && info.iiif && !info.overflow && /Gustave Doré, 1866/.test(info.caption)
        && (n > 1 ? info.gallery && info.controls === 'flex' && info.dots === n && info.status === `1 of ${n}` && moved : !info.gallery && info.dots === 0);
      check(`doré ${path} ${width}px: ${n > 1 ? `gallery of ${n}` : 'one figure'}`, ok, ok ? '' : JSON.stringify({ status, errors: errors.slice(0, 3), ...info, moved }));
      await ctx.close();
    }
  }
}
await browser.close();
srv.close();
console.log(results.join('\n'));
console.log(failed ? '\nVERIFY FAILED' : '\nVERIFY PASSED');
process.exit(failed ? 1 : 0);
