#!/usr/bin/env node
// Headless verification: build must exist (npm run build). Serves dist/, loads key pages in Chromium,
// checks for console errors, timeline/map items, Pagefind results, and saves screenshots.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

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

async function open(path, { width = 1280, height = 900, shot, fullPage = true, scheme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: width < 500 ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = []; const external = [];
  page.on('console', (m) => { if (m.type() === 'error') (/(tile\.openstreetmap|tile\.loc\.gov|ERR_|Failed to load resource|aivbible\.kevinamundson\.me)/.test(m.text()) ? external : errors).push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => { if (!r.url().startsWith(BASE)) external.push(`${r.url()} ${r.failure()?.errorText}`); else errors.push(`local request failed: ${r.url()}`); });
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle' });
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
  await o.page.locator('[data-tier-toggle="t4"]').click();
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
  await o.page.locator('[data-tier-toggle="t4"]').click();
  const tierRestored = await o.page.waitForFunction((n) => document.querySelectorAll('.vis-timeline .vis-item').length === n, tl, { timeout: 5000 }).then(() => true).catch(() => false);
  check('home: Tier 4 toggle restores the chart', tierRestored);
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
  await o.page.goBack({ waitUntil: 'networkidle' });
  await o.shot();
  if (o.external.length) results.push(`INFO  home: external resource issues: ${o.external.length}`);
  await o.ctx.close();
}
// Home (mobile, light + dark)
for (const scheme of ['light', 'dark']) {
  const o = await open('/', { width: 390, height: 844, shot: `home-mobile${scheme === 'dark' ? '-dark' : ''}.png`, scheme });
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
      const listOwn = await o.page.locator('.person-list li.own').count(), listCtx = await o.page.locator('.person-list li.ctx').count();
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
        await o.page.goto(BASE + `/people/${id}/`, { waitUntil: 'networkidle' });
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
  check('alyattes: Herodotus spelling is footnoted and the Greek is not invented', /Alyattes/.test(text) && /History/.test(text) && /No original-language writing/.test(text) && /English translation/.test(text));
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
// BibleUp: one script tag, detection on a written reference, BSB text in the popover.
{
  const o = await open('/about/');
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
  check('about: popover shows the Berean Standard Bible', /For God so loved the world/.test(text) && /\bBSB\b/.test(text), text.slice(0, 220));
  check('about: popover asks for the Amundson Interpretive Version', text.includes('Amundson Interpretive Version'));
  await o.page.keyboard.press('Escape');
  check('about: Escape closes the popover', await pop.isHidden());
  check('about: no console errors', o.errors.length === 0, o.errors.join(' | '));
  if (o.external.length) results.push(`INFO  about: external resource issues: ${o.external.join(' | ')}`);
  await o.ctx.close();
}
await browser.close();
srv.close();
console.log(results.join('\n'));
console.log(failed ? '\nVERIFY FAILED' : '\nVERIFY PASSED');
process.exit(failed ? 1 : 0);
