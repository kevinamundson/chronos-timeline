#!/usr/bin/env node
// Headless verification: build must exist (npm run build). Serves dist/, loads key pages in Chromium,
// checks for console errors, timeline/map items, Pagefind results, and saves screenshots.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const PORT = 8799;
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
  page.on('console', (m) => { if (m.type() === 'error') (/(tile\.openstreetmap|tile\.loc\.gov|ERR_|Failed to load resource)/.test(m.text()) ? external : errors).push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => { if (!r.url().startsWith(BASE)) external.push(`${r.url()} ${r.failure()?.errorText}`); else errors.push(`local request failed: ${r.url()}`); });
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  return { ctx, page, errors, external, status: resp.status(), shot: async () => shot && page.screenshot({ path: join(SHOTS, shot), fullPage }) };
}

// Home (desktop)
{
  const o = await open('/', { shot: 'home-desktop.png' });
  const tl = await o.page.locator('.vis-timeline .vis-item').count();
  const markers = await o.page.locator('#map .leaflet-marker-icon').count();
  const tiles = await o.page.locator('#map img.leaflet-tile-loaded').count();
  const axis = await o.page.locator('.vis-time-axis .vis-text.vis-minor').allTextContents();
  check('home: HTTP 200', o.status === 200);
  check('home: no console errors', o.errors.length === 0, o.errors.join(' | '));
  check('home: timeline items rendered', tl > 0, `${tl} items`);
  check('home: axis labels are BC', axis.some((t) => / BC$/.test(t)) && !axis.some((t) => /^-/.test(t)), axis.slice(0, 6).join(', '));
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
  await o.shot();
  check(`home mobile (${scheme}): no console errors`, o.errors.length === 0, o.errors.join(' | '));
  const overflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(`home mobile (${scheme}): no horizontal page overflow`, !overflow);
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
  if (o.external.length) results.push(`INFO  ${path}: external resource issues: ${o.external.join(' | ')}`);
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
await browser.close();
srv.close();
console.log(results.join('\n'));
console.log(failed ? '\nVERIFY FAILED' : '\nVERIFY PASSED');
process.exit(failed ? 1 : 0);
