#!/usr/bin/env node
// Headless verification: build must exist (npm run build). Serves dist/, loads key pages in Chromium,
// checks for console errors, timeline/map items, Pagefind results, and saves screenshots.
import { chromium, webkit } from 'playwright';
import { stubIiif } from './iiif-stub.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { loadStandbyCounts, standbySummaryLine } from '../scripts/standby/compute.mjs';
import { SENNACHERIB_REDIRECT, redirectsFileHasSennacherib } from '../scripts/redirects.mjs';
import { checkRowMerge } from './row-merge-check.mjs';
import { checkFootnotes } from './footnote-check.mjs';
import { spellingSelfCheck } from '../scripts/raleigh/spelling-check.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const PORT = +process.env.VERIFY_PORT || 8799; // override when two clones verify on the same machine
const BASE = `http://localhost:${PORT}`;
const srv = await serve(PORT);
const browser = stubIiif(await chromium.launch());
const results = [];
let failed = false;
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); if (!ok) failed = true; };
{
  const spellingErrors = spellingSelfCheck();
  check('raleigh spelling: letter rules and dictionary', spellingErrors.length === 0, spellingErrors.slice(0, 6).join(' | '));
}
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

async function homeLayout(page) {
  return page.evaluate(() => {
    function pane(id) {
      const el = document.getElementById(id);
      const block = el?.closest('.tl-block');
      const title = block?.querySelector('.tl-pane-title');
      if (!el || !title) return null;
      const pr = el.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const center = el.querySelector('.vis-panel.vis-center')?.getBoundingClientRect();
      const left = el.querySelector('.vis-panel.vis-left')?.getBoundingClientRect();
      return {
        h: Math.round(pr.height),
        title: title.textContent.trim(),
        titleAbove: tr.bottom <= pr.top + 2,
        titleAlign: Math.abs(tr.left - pr.left) < 8,
        leftW: left ? Math.round(left.width) : null,
        centerLeft: center ? Math.round(center.left) : null,
        centerW: center ? Math.round(center.width) : null,
        paneW: Math.round(pr.width),
        paneLeft: Math.round(pr.left),
      };
    }
    const button = document.getElementById('tl-range-open');
    const heading = document.getElementById('tl-h');
    const br = button?.getBoundingClientRect();
    const hr = heading?.getBoundingClientRect();
    return {
      events: pane('timeline-events'),
      people: pane('timeline-people'),
      button: br && hr ? {
        w: Math.round(br.width), h: Math.round(br.height),
        gap: Math.round(br.left - hr.right),
        dy: Math.round(Math.abs((br.top + br.bottom) / 2 - (hr.top + hr.bottom) / 2)),
      } : null,
    };
  });
}
function layoutOk(panes) {
  if (!panes?.events || !panes.people) return false;
  const edge = (p) => (p.paneLeft + p.paneW) - (p.centerLeft + p.centerW);
  return panes.events.h > 80 && panes.people.h > 80
    && panes.events.title === 'Events' && panes.people.title === 'People'
    && panes.events.titleAbove && panes.people.titleAbove
    && panes.events.titleAlign && panes.people.titleAlign
    && panes.events.leftW <= 2 && panes.people.leftW <= 2
    && Math.abs(panes.events.centerLeft - panes.people.centerLeft) < 3
    && Math.abs(panes.events.centerW - panes.people.centerW) < 3
    && Math.abs(panes.events.centerLeft - panes.events.paneLeft) <= 4
    && Math.abs(panes.people.centerLeft - panes.people.paneLeft) <= 4
    && Math.abs(edge(panes.events)) <= 4 && Math.abs(edge(panes.people)) <= 4;
}
function buttonBeside(panes) {
  const b = panes?.button;
  return !!b && b.w >= 44 && b.h >= 44 && b.gap >= -2 && b.gap <= 16 && b.dy <= 8;
}
function parseYearLabel(text) {
  const bc = String(text || '').match(/^(\d+) BC$/);
  if (bc) return -Number(bc[1]);
  const ad = String(text || '').match(/^AD (\d+)$/);
  if (ad) return Number(ad[1]);
  return null;
}
async function yearWindowStamp(page) {
  return page.evaluate(() => {
    const a = window.__timeline.getWindow();
    const b = window.__timelinePeople.getWindow();
    return { as: a.start.getTime(), ae: a.end.getTime(), bs: b.start.getTime(), be: b.end.getTime() };
  });
}
async function yearField(page, id) {
  return page.evaluate((wheelId) => {
    const input = document.getElementById(wheelId + '-input');
    const era = document.getElementById(wheelId + '-era');
    const band = document.querySelector('#' + wheelId + ' .tl-wheel-band')?.getBoundingClientRect();
    const ir = input?.getBoundingClientRect();
    const mid = ir ? (ir.top + ir.bottom) / 2 : 0;
    return {
      inputmode: input?.getAttribute('inputmode') || '',
      pattern: input?.getAttribute('pattern') || '',
      label: input?.getAttribute('aria-label') || '',
      value: input?.value || '',
      visible: !!input && !input.closest('[hidden]') && !!ir && ir.height > 0,
      centered: !!band && !!ir && mid >= band.top - 2 && mid <= band.bottom + 2,
      ih: ir ? ir.height : 0,
      eraLabel: era?.getAttribute('aria-label') || '',
      eras: era ? [...era.querySelectorAll('button')].map((b) => ({
        t: b.textContent.trim(),
        pressed: b.getAttribute('aria-pressed'),
        w: b.getBoundingClientRect().width,
        h: b.getBoundingClientRect().height,
      })) : [],
      eraOutside: !!(input && era && !input.contains(era) && !era.contains(input)),
      dialog: !!document.getElementById('tl-range-dialog')?.open,
      text: document.querySelector('#' + wheelId + ' [role="spinbutton"]')?.getAttribute('aria-valuetext') || '',
      errorHidden: document.getElementById('tl-range-error')?.hidden,
      error: document.getElementById('tl-range-error')?.textContent || '',
    };
  }, id);
}
async function openYearField(page, id) {
  await page.locator(`#${id} .tl-wheel-item.is-selected`).click();
  await page.locator(`#${id}-input`).waitFor({ state: 'visible' });
  await page.locator(`#${id}-era`).waitFor({ state: 'visible' });
}
// Typed years on the center of each year wheel. The era stays a separate control.
async function typedYearEntry(page, tag) {
  const stamp = await yearWindowStamp(page);
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-start-year');
  await waitYearWheel(page, 'tl-range-end-year');
  const bounds = await page.evaluate(() => {
    const dialog = document.getElementById('tl-range-dialog');
    return { first: dialog.dataset.yearFirst, last: dialog.dataset.yearLast };
  });
  check(`${tag}: typed years run from 4504 BC to AD 2051`, bounds.first === '-4504' && bounds.last === '2051', JSON.stringify(bounds));
  const startBefore = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  await openYearField(page, 'tl-range-start-year');
  const openedField = await yearField(page, 'tl-range-start-year');
  const targetsOk = openedField.ih >= 44 && openedField.eras.length === 2 && openedField.eras.every((b) => b.w >= 44 && b.h >= 44);
  check(`${tag}: the center year is a numeric field with a separate era`, openedField.visible && openedField.centered && openedField.inputmode === 'numeric' && openedField.pattern === '[0-9]*' && /^\d+$/.test(openedField.value) && openedField.eraOutside && openedField.eras.map((b) => b.t).join(',') === 'BC,AD' && /year number/i.test(openedField.label) && /era/i.test(openedField.eraLabel) && targetsOk, JSON.stringify(openedField));
  const startInput = page.locator('#tl-range-start-year-input');
  await startInput.fill('0');
  await startInput.press('Enter');
  const zero = await yearField(page, 'tl-range-start-year');
  check(`${tag}: year 0 shows the inline error and does not move the wheel`, zero.dialog && zero.visible && !zero.errorHidden && /no year 0/i.test(zero.error) && zero.text === startBefore, JSON.stringify(zero));
  await startInput.fill('9999');
  await startInput.press('Enter');
  const out = await yearField(page, 'tl-range-start-year');
  check(`${tag}: an out-of-range year shows the inline error`, out.dialog && out.visible && !out.errorHidden && /4504 BC/.test(out.error) && /AD 2051/.test(out.error) && out.text === startBefore, JSON.stringify(out));
  await startInput.fill('1446');
  const eraPressed = (await page.locator('#tl-range-start-year-era button[aria-pressed="true"]').innerText()).trim();
  await startInput.press('Enter');
  await page.locator('#tl-range-start-year-input').waitFor({ state: 'hidden' });
  await waitYearWheel(page, 'tl-range-start-year');
  const typed = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  const wantTyped = eraPressed === 'AD' ? 'AD 1446' : '1446 BC';
  const stillOpen = await page.locator('#tl-range-dialog').evaluate((d) => d.open);
  check(`${tag}: Enter commits a typed year and leaves the dialog open`, stillOpen && typed === wantTyped, JSON.stringify({ typed, wantTyped, eraPressed, stillOpen }));
  await page.locator('#tl-range-start-year [role="spinbutton"]').focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(80);
  const nudged = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  check(`${tag}: the year wheel still scrolls after typing`, nudged !== typed && nudged !== '', JSON.stringify({ typed, nudged }));
  await page.locator('#tl-range-end-year [role="spinbutton"]').focus();
  await page.keyboard.press('Enter');
  await page.locator('#tl-range-end-year-input').waitFor({ state: 'visible' });
  const endField = await yearField(page, 'tl-range-end-year');
  check(`${tag}: the end year center is a numeric field`, endField.visible && endField.centered && endField.inputmode === 'numeric' && endField.pattern === '[0-9]*' && endField.eraOutside && /^\d+$/.test(endField.value), JSON.stringify(endField));
  const endInput = page.locator('#tl-range-end-year-input');
  await endInput.fill('1500');
  const endEra = (await page.locator('#tl-range-end-year-era button[aria-pressed="true"]').innerText()).trim();
  await page.locator('#tl-range-start-year [role="spinbutton"]').focus();
  await page.locator('#tl-range-end-year-input').waitFor({ state: 'hidden' });
  await waitYearWheel(page, 'tl-range-end-year');
  const endTyped = await page.locator('#tl-range-end-year [role="spinbutton"]').getAttribute('aria-valuetext');
  check(`${tag}: blur commits the end year`, endTyped === (endEra === 'AD' ? 'AD 1500' : '1500 BC'), JSON.stringify({ endTyped, endEra }));
  await page.locator('#tl-range-mode-month').click();
  await page.waitForFunction(() => !document.getElementById('tl-range-start-month').hidden && document.getElementById('tl-range-mode-month').getAttribute('aria-pressed') === 'true');
  const monthInputs = await page.locator('#tl-range-start-month input, #tl-range-end-month input').count();
  await openYearField(page, 'tl-range-start-year');
  const monthField = await yearField(page, 'tl-range-start-year');
  check(`${tag}: Month and year mode types the year and not the month`, monthInputs === 0 && monthField.visible && monthField.inputmode === 'numeric' && monthField.pattern === '[0-9]*' && monthField.eraOutside, JSON.stringify({ monthInputs, monthField }));
  const monthInput = page.locator('#tl-range-start-year-input');
  await monthInput.fill('1400');
  const monthEra = (await page.locator('#tl-range-start-year-era button[aria-pressed="true"]').innerText()).trim();
  await monthInput.press('Enter');
  await page.locator('#tl-range-start-year-input').waitFor({ state: 'hidden' });
  await waitYearWheel(page, 'tl-range-start-year');
  const monthTyped = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  check(`${tag}: a typed year commits in Month and year mode`, monthTyped === (monthEra === 'AD' ? 'AD 1400' : '1400 BC'), JSON.stringify({ monthTyped, monthEra }));
  await openYearField(page, 'tl-range-start-year');
  await page.locator('#tl-range-start-year-era button', { hasText: 'BC' }).click();
  await page.locator('#tl-range-start-year-input').fill('4504');
  await page.locator('#tl-range-start-year-input').press('Enter');
  await page.locator('#tl-range-start-year-input').waitFor({ state: 'hidden' });
  await waitYearWheel(page, 'tl-range-start-year');
  const atFloor = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  await openYearField(page, 'tl-range-start-year');
  await page.locator('#tl-range-start-year-era button', { hasText: 'AD' }).click();
  await page.locator('#tl-range-start-year-input').fill('2051');
  await page.locator('#tl-range-start-year-input').press('Enter');
  await page.locator('#tl-range-start-year-input').waitFor({ state: 'hidden' });
  await waitYearWheel(page, 'tl-range-start-year');
  const atCap = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  check(`${tag}: typed years accept 4504 BC and AD 2051`, atFloor === '4504 BC' && atCap === 'AD 2051', JSON.stringify({ atFloor, atCap }));
  await openYearField(page, 'tl-range-start-year');
  await page.locator('#tl-range-start-year-era button', { hasText: 'BC' }).click();
  await page.locator('#tl-range-start-year-input').fill('4505');
  await page.locator('#tl-range-start-year-input').press('Enter');
  const past = await yearField(page, 'tl-range-start-year');
  check(`${tag}: 4505 BC is out of range`, past.visible && !past.errorHidden && /4504 BC/.test(past.error) && past.text === 'AD 2051', JSON.stringify(past));
  const mid = await yearWindowStamp(page);
  check(`${tag}: typed years do not move the timeline until Apply`, mid.as === stamp.as && mid.ae === stamp.ae && mid.bs === stamp.bs && mid.be === stamp.be, JSON.stringify({ stamp, mid }));
  await page.locator('#tl-range-start-year-input').fill('1200');
  await page.waitForFunction(() => {
    const text = document.querySelector('#tl-range-start-year [role="spinbutton"]')?.getAttribute('aria-valuetext') || '';
    return text === '1200 BC' || text === 'AD 1200';
  });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open && document.activeElement?.id === 'tl-range-open');
  const escaped = await yearWindowStamp(page);
  check(`${tag}: Escape closes a typed year without applying it`, escaped.as === stamp.as && escaped.ae === stamp.ae && escaped.bs === stamp.bs && escaped.be === stamp.be, JSON.stringify({ stamp, escaped }));
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-start-year');
  const restored = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext');
  check(`${tag}: reopening restores the window year after a cancelled type`, restored === startBefore && restored !== '1200 BC' && restored !== 'AD 1200', JSON.stringify({ restored, startBefore }));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open);
}
async function waitYearWheel(page, id) {
  await page.waitForFunction((wheelId) => {
    const root = document.getElementById(wheelId);
    const spin = root?.querySelector('[role="spinbutton"]');
    const sel = root?.querySelector('.tl-wheel-item.is-selected');
    const band = root?.querySelector('.tl-wheel-band');
    if (!spin || !sel || !band || !document.getElementById('tl-range-dialog')?.open) return false;
    const br = band.getBoundingClientRect();
    const r = sel.getBoundingClientRect();
    const mid = (r.top + r.bottom) / 2;
    return sel.textContent.trim() === (spin.getAttribute('aria-valuetext') || '').trim()
      && mid >= br.top - 2 && mid <= br.bottom + 2;
  }, id, { timeout: 5000 });
}
async function homeRangeBehavior(page, tag, restore) {
  const saved = restore ? await page.evaluate(() => {
    const w = window.__timeline.getWindow();
    return [w.start.getTime(), w.end.getTime()];
  }) : null;
  const kept = await page.evaluate(() => ({
    href: location.pathname + location.search,
    pressed: [...document.querySelectorAll('[data-tier-toggle]')].map((b) => b.getAttribute('data-tier-toggle') + ':' + b.getAttribute('aria-pressed')).join(','),
    data: document.getElementById('tl-data')?.textContent || '',
  }));
  const lay = await homeLayout(page);
  check(`${tag}: Events and People are headings above full-width panels`, layoutOk(lay), JSON.stringify(lay));
  check(`${tag}: calendar button sits beside the title`, buttonBeside(lay), JSON.stringify(lay?.button));
  const windowYears = await page.evaluate(() => {
    const w = window.__timeline.getWindow();
    function parts(d, end) {
      let x = d;
      const exact = d.getUTCDate() === 1 && d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0;
      if (end && exact) x = new Date(d.getTime() - 1);
      const a = x.getUTCFullYear();
      const year = a < 0 ? a : a + 1;
      return year < 0 ? `${-year} BC` : `AD ${year}`;
    }
    return { start: parts(w.start, false), end: parts(w.end, true) };
  });
  await page.locator('#tl-range-open').click();
  await page.getByRole('dialog', { name: 'Years shown' }).waitFor();
  await waitYearWheel(page, 'tl-range-start-year');
  await waitYearWheel(page, 'tl-range-end-year');
  const opened = await page.evaluate(() => {
    const dialog = document.getElementById('tl-range-dialog');
    const targets = ['#tl-range-cancel', '#tl-range-apply', '#tl-range-mode-year', '#tl-range-mode-month'].map((sel) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return { sel, w: r.width, h: r.height };
    });
    const row = document.querySelector('#tl-range-start-year .tl-wheel-item')?.getBoundingClientRect();
    return {
      yearPressed: document.getElementById('tl-range-mode-year').getAttribute('aria-pressed'),
      monthPressed: document.getElementById('tl-range-mode-month').getAttribute('aria-pressed'),
      monthHidden: document.getElementById('tl-range-start-month').hidden && document.getElementById('tl-range-end-month').hidden,
      start: document.querySelector('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext'),
      end: document.querySelector('#tl-range-end-year [role="spinbutton"]').getAttribute('aria-valuetext'),
      targets,
      rowH: row ? row.height : 0,
      note: document.getElementById('tl-range-note').textContent,
    };
  });
  const targetsOk = opened.targets.every((t) => t.w >= 44 && t.h >= 44) && opened.rowH >= 44;
  check(`${tag}: year dialog opens on the current years`, opened.yearPressed === 'true' && opened.monthPressed === 'false' && opened.monthHidden && opened.start === windowYears.start && opened.end === windowYears.end && /no year 0/i.test(opened.note), JSON.stringify({ opened, windowYears }));
  check(`${tag}: year dialog controls are at least 44px`, targetsOk, JSON.stringify({ targets: opened.targets, rowH: opened.rowH }));
  let trapped = true;
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('#tl-range-dialog'));
    if (!inside) trapped = false;
  }
  check(`${tag}: year dialog keeps focus inside`, trapped);
  await page.locator('#tl-range-start-year [role="spinbutton"]').focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(120);
  const nudged = await page.evaluate(() => ({
    s: document.querySelector('#tl-range-start-year [role="spinbutton"]').getAttribute('aria-valuetext'),
    e: document.querySelector('#tl-range-end-year [role="spinbutton"]').getAttribute('aria-valuetext'),
  }));
  await page.locator('#tl-range-apply').click();
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open);
  const applied = await page.evaluate(() => {
    function yearOf(d) {
      const a = d.getUTCFullYear();
      return a < 0 ? a : a + 1;
    }
    const a = window.__timeline.getWindow();
    const b = window.__timelinePeople.getWindow();
    return {
      as: yearOf(a.start), ae: yearOf(new Date(a.end.getTime() - 1)),
      bs: yearOf(b.start), be: yearOf(new Date(b.end.getTime() - 1)),
      ds: Math.abs(a.start - b.start), de: Math.abs(a.end - b.end),
    };
  });
  const wantStart = parseYearLabel(nudged.s);
  const wantEnd = parseYearLabel(nudged.e);
  check(`${tag}: Apply sets both panels to the same years`, applied.ds < 1000 && applied.de < 1000 && applied.as === wantStart && applied.ae === wantEnd && applied.bs === wantStart && applied.be === wantEnd, JSON.stringify({ applied, nudged }));
  const afterApply = await page.evaluate(() => ({
    href: location.pathname + location.search,
    pressed: [...document.querySelectorAll('[data-tier-toggle]')].map((b) => b.getAttribute('data-tier-toggle') + ':' + b.getAttribute('aria-pressed')).join(','),
    data: document.getElementById('tl-data')?.textContent || '',
  }));
  check(`${tag}: the year dialog does not change filters, the URL, or the records`, afterApply.href === kept.href && afterApply.pressed === kept.pressed && afterApply.data === kept.data);
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-start-year');
  const ends = await page.evaluate(() => {
    const dialog = document.getElementById('tl-range-dialog');
    const spin = document.querySelector('#tl-range-start-year [role="spinbutton"]');
    const scroller = document.querySelector('#tl-range-start-year .tl-wheel-scroll');
    const row = +scroller.dataset.row;
    const savedTop = scroller.scrollTop;
    spin.focus();
    return { first: dialog.dataset.yearFirst, last: dialog.dataset.yearLast, savedTop, row };
  });
  await page.keyboard.press('Home');
  await page.waitForTimeout(80);
  const atFirst = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('data-value');
  await page.keyboard.press('End');
  await page.waitForTimeout(80);
  const atLast = await page.locator('#tl-range-start-year [role="spinbutton"]').getAttribute('data-value');
  const boundary = await page.evaluate(({ row }) => {
    const dialog = document.getElementById('tl-range-dialog');
    const first = +dialog.dataset.yearFirst;
    const index = (1 >= 1 && first < 0) ? (1 - 1 - first) : (1 - first);
    const scroller = document.querySelector('#tl-range-start-year .tl-wheel-scroll');
    scroller.scrollTop = index * row;
    scroller.dispatchEvent(new Event('scroll'));
    const texts = [...document.querySelectorAll('#tl-range-start-year .tl-wheel-item')].filter((el) => !el.hidden).map((el) => el.textContent.trim());
    const value = document.querySelector('#tl-range-start-year [role="spinbutton"]').dataset.value;
    return { texts, value };
  }, { row: ends.row });
  check(`${tag}: the year wheels reach both ends and skip year 0`, atFirst === ends.first && atLast === ends.last && boundary.value === '1' && boundary.texts.includes('1 BC') && boundary.texts.includes('AD 1') && !boundary.texts.some((t) => t === '0' || t === 'AD 0' || t === '0 BC' || t === '0 AD'), JSON.stringify({ atFirst, atLast, ends, boundary }));
  await page.locator('#tl-range-cancel').click();
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open && document.activeElement?.id === 'tl-range-open');
  const afterCancel = await page.evaluate(() => {
    function yearOf(d) {
      const a = d.getUTCFullYear();
      return a < 0 ? a : a + 1;
    }
    const a = window.__timeline.getWindow();
    const b = window.__timelinePeople.getWindow();
    return { as: yearOf(a.start), ae: yearOf(new Date(a.end.getTime() - 1)), ds: Math.abs(a.start - b.start) };
  });
  check(`${tag}: Cancel leaves the shared window`, afterCancel.as === wantStart && afterCancel.ae === wantEnd && afterCancel.ds < 1000, JSON.stringify(afterCancel));
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-start-year');
  const invalid = await page.evaluate(() => {
    const start = document.querySelector('#tl-range-start-year .tl-wheel-scroll');
    const end = document.querySelector('#tl-range-end-year .tl-wheel-scroll');
    const row = +start.dataset.row;
    const last = +document.getElementById('tl-range-dialog').dataset.yearLast;
    const first = +document.getElementById('tl-range-dialog').dataset.yearFirst;
    const count = (first < 0 && last > 0) ? (last - first) : (last - first + 1);
    start.scrollTop = (count - 1) * row;
    end.scrollTop = 0;
    start.dispatchEvent(new Event('scroll'));
    end.dispatchEvent(new Event('scroll'));
    return { disabled: document.getElementById('tl-range-apply').disabled, hidden: document.getElementById('tl-range-error').hidden };
  });
  check(`${tag}: an inverted range cannot be applied`, invalid.disabled && !invalid.hidden, JSON.stringify(invalid));
  await page.locator('#tl-range-cancel').click();
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-start-year');
  await page.locator('#tl-range-mode-month').click();
  await page.waitForFunction(() => !document.getElementById('tl-range-start-month').hidden && document.getElementById('tl-range-mode-month').getAttribute('aria-pressed') === 'true');
  await page.locator('#tl-range-start-month [role="spinbutton"]').focus();
  const monthBefore = await page.locator('#tl-range-start-month [role="spinbutton"]').getAttribute('aria-valuetext');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(80);
  const monthAfter = await page.locator('#tl-range-start-month [role="spinbutton"]').getAttribute('aria-valuetext');
  await page.locator('#tl-range-apply').click();
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open);
  const monthWin = await page.evaluate(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const a = window.__timeline.getWindow();
    const b = window.__timelinePeople.getWindow();
    return { month: months[a.start.getUTCMonth()], ds: Math.abs(a.start - b.start), de: Math.abs(a.end - b.end) };
  });
  check(`${tag}: a month refines the view on both panels`, monthAfter !== monthBefore && monthWin.month === monthAfter && monthWin.ds < 1000 && monthWin.de < 1000, JSON.stringify({ monthBefore, monthAfter, monthWin }));
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-end-year');
  await page.evaluate(() => {
    const start = document.querySelector('#tl-range-start-year .tl-wheel-scroll');
    const end = document.querySelector('#tl-range-end-year .tl-wheel-scroll');
    const row = +start.dataset.row;
    const index = Math.round(start.scrollTop / row);
    end.scrollTop = (index + 3) * row;
    end.dispatchEvent(new Event('scroll'));
  });
  await page.locator('#tl-range-apply').click();
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open);
  const tight = await page.evaluate(() => window.__timeline.getWindow().end - window.__timeline.getWindow().start);
  await page.locator('[data-tl="fit"]').click();
  await page.waitForTimeout(200);
  const wide = await page.evaluate(() => {
    const a = window.__timeline.getWindow();
    const b = window.__timelinePeople.getWindow();
    return { span: a.end - a.start, ds: Math.abs(a.start - b.start), de: Math.abs(a.end - b.end) };
  });
  check(`${tag}: Show all widens both panels to the full span`, wide.span > tight * 5 && wide.ds < 1000 && wide.de < 1000, JSON.stringify({ tight, wide }));
  await page.locator('#tl-range-open').click();
  await waitYearWheel(page, 'tl-range-start-year');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('tl-range-dialog').open && document.activeElement?.id === 'tl-range-open');
  const escaped = await page.evaluate(() => {
    const a = window.__timeline.getWindow();
    const b = window.__timelinePeople.getWindow();
    return { span: a.end - a.start, ds: Math.abs(a.start - b.start) };
  });
  check(`${tag}: Escape closes the dialog and leaves the window`, !await page.locator('#tl-range-dialog').evaluate((d) => d.open) && Math.abs(escaped.span - wide.span) < 1000 && escaped.ds < 1000, JSON.stringify({ escaped, wide }));
  await typedYearEntry(page, tag);
  if (saved) {
    await page.evaluate((w) => window.__timeline.setWindow(new Date(w[0]), new Date(w[1]), { animation: false }), saved);
    await page.waitForTimeout(400);
  }
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
  const panes = await homeLayout(o.page);
  check('home: Events and People are headings above full-width panels', layoutOk(panes) && buttonBeside(panes), JSON.stringify(panes));
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
  await homeRangeBehavior(o.page, 'home', true);
  check('home: year range leaves no console errors', o.errors.length === 0, o.errors.join(' | '));
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
  const mobileLay = await homeLayout(o.page);
  check(`home mobile (${scheme}): headings sit above full-width panels`, layoutOk(mobileLay) && buttonBeside(mobileLay), JSON.stringify(mobileLay));
  await o.page.locator('#timeline').screenshot({ path: join(SHOTS, `timeline-range-home-390-${scheme}.png`) });
  await o.page.locator('#tl-range-open').click();
  await waitYearWheel(o.page, 'tl-range-start-year');
  await waitYearWheel(o.page, 'tl-range-end-year');
  const dialogBg = await o.page.evaluate(() => getComputedStyle(document.getElementById('tl-range-dialog')).backgroundColor);
  const dialogLum = dialogBg.match(/\d+/g).slice(0, 3).reduce((sum, n) => sum + Number(n), 0) / 3;
  check(`home mobile (${scheme}): year dialog uses the ${scheme} surface`, scheme === 'dark' ? dialogLum < 80 : dialogLum > 200, dialogBg);
  const dialogOverflow = await o.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(`home mobile (${scheme}): year dialog does not widen the page`, !dialogOverflow);
  await o.page.locator('#tl-range-dialog').screenshot({ path: join(SHOTS, `timeline-range-dialog-390-${scheme}.png`) });
  await o.page.locator('#tl-range-start-year .tl-wheel-item.is-selected').click();
  const typedInput = o.page.locator('#tl-range-start-year-input');
  await typedInput.waitFor({ state: 'visible' });
  await o.page.locator('#tl-range-start-year-era').waitFor({ state: 'visible' });
  await typedInput.fill('1446');
  await o.page.waitForFunction(() => {
    const text = document.querySelector('#tl-range-start-year [role="spinbutton"]')?.getAttribute('aria-valuetext') || '';
    return text === '1446 BC' || text === 'AD 1446';
  });
  const typedShot = await o.page.evaluate(() => {
    const input = document.getElementById('tl-range-start-year-input');
    return {
      focused: document.activeElement === input,
      inputmode: input?.getAttribute('inputmode') || '',
      pattern: input?.getAttribute('pattern') || '',
      value: input?.value || '',
    };
  });
  check(`home mobile (${scheme}): typed year field is focused`, typedShot.focused && typedShot.inputmode === 'numeric' && typedShot.pattern === '[0-9]*' && typedShot.value === '1446', JSON.stringify(typedShot));
  await o.page.locator('#tl-range-dialog').screenshot({ path: join(SHOTS, `timeline-range-typing-390-${scheme}.png`) });
  await o.page.keyboard.press('Escape');
  await o.page.waitForFunction(() => !document.getElementById('tl-range-dialog').open);
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
{
  async function runRange(engine, launcher, width, height) {
    const own = launcher === browser ? null : stubIiif(await launcher.launch());
    const b = own || browser;
    const ctx = await b.newContext({ viewport: { width, height }, colorScheme: 'light', deviceScaleFactor: width < 500 ? 2 : 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/(tile\.openstreetmap|tile\.loc\.gov|ERR_|Failed to load resource|aivbible\.kevinamundson\.me)/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('.vis-timeline .vis-item', { timeout: 8000 });
    await page.waitForSelector('.tl-hscroll .tl-scroll-thumb', { timeout: 8000 });
    await homeRangeBehavior(page, `${engine} ${width}`, false);
    if (width < 500) {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      check(`${engine} ${width}: home has no horizontal page overflow`, !overflow);
    }
    check(`${engine} ${width}: year range leaves no console errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
    if (own) await own.close();
  }
  await runRange('webkit', webkit, 1280, 900);
  await runRange('webkit', webkit, 390, 844);
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
    const julian = [...document.querySelectorAll('#raleigh-table td.raleigh-julian')].find((el) => el.innerText.includes('3840'));
    const world = julian?.parentElement?.querySelector('td.raleigh-world');
    const joined = [...document.querySelectorAll('#raleigh-table td')].some((el) => el.innerText.includes('3840') && el.innerText.includes('2158') && /AM 2158/.test(el.innerText));
    return {
      julian: julian ? julian.innerText.trim() : '',
      world: world ? world.innerText.replace(/\s+/g, ' ').trim() : '',
      joined,
    };
  });
  check('raleigh table: unconfirmed 3840/2158 pair is not derived', bad.julian === '3840' && bad.world.includes('2158') && bad.world.includes('Not derived') && !bad.world.includes('(derived:') && !/\(\d+ BC\)/.test(bad.world) && !bad.joined, JSON.stringify(bad).slice(0, 220));
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
  check('raleigh table: csv keeps Julian out of the AM cell', !csv.includes('683 AM 1') && !csv.includes('2338 AM 1656') && csv.includes('Julian'));
  const julianSplit = await o.page.evaluate(() => {
    const world = [...document.querySelectorAll('#raleigh-table td')].find((el) => el.classList.contains('raleigh-world') && el.innerText.includes('AM 1') && el.innerText.includes('4032 BC'));
    const julian = world?.parentElement?.querySelector('td.raleigh-julian, th.raleigh-julian');
    const joined = [...document.querySelectorAll('#raleigh-table td')].some((el) => /683/.test(el.innerText) && /AM 1/.test(el.innerText) && /4032 BC/.test(el.innerText));
    const seth = [...document.querySelectorAll('#raleigh-table a[href="/people/seth/"]')].find((a) => /Seth/i.test(a.textContent));
    const enoch = document.querySelector('#raleigh-table a[href="/events/enoch-translated/"]');
    const adam = [...document.querySelectorAll('#raleigh-table a[href="/people/adam/"]')].find((a) => /Adam|Ada/i.test(a.textContent));
    const lamech = [...document.querySelectorAll('#raleigh-table a')].filter((a) => /^Lamech/i.test(a.textContent.trim()));
    return {
      julian: julian ? julian.innerText.trim() : '',
      world: world ? world.innerText.replace(/\s+/g, ' ').trim().slice(0, 80) : '',
      joined,
      seth: seth ? seth.getAttribute('href') : '',
      enoch: enoch ? enoch.getAttribute('href') : '',
      adam: adam ? adam.getAttribute('href') : '',
      lamechLinks: lamech.length,
    };
  });
  check('raleigh table: Julian 683 is its own column beside AM 1', julianSplit.julian === '683' && /AM 1/.test(julianSplit.world) && !julianSplit.joined, JSON.stringify(julianSplit));
  check('raleigh table: Seth links to the person page', julianSplit.seth === '/people/seth/', JSON.stringify(julianSplit));
  check('raleigh table: Henoch translated links to the event', julianSplit.enoch === '/events/enoch-translated/', JSON.stringify(julianSplit));
  check('raleigh table: Adam in the first heading or row links', julianSplit.adam === '/people/adam/', JSON.stringify(julianSplit));
  check('raleigh table: Lamech stays unlinked (two records)', julianSplit.lamechLinks === 0, JSON.stringify(julianSplit));
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
  async function accountUi(engine, launcher) {
    const own = launcher === browser ? null : stubIiif(await launcher.launch());
    const b = own || browser;
    const pages = [
      ['/events/creation-week/', 'formall perfection', 'creation-week'],
      ['/people/moses/', 'Moyses', 'moses'],
    ];
    for (const [path, phrase, tag] of pages) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 60000 });
      const closed = await page.locator('#raleigh-account details.raleigh-account').evaluate((d) => !d.open && !d.hasAttribute('open'));
      const summary = await page.locator('#raleigh-account details.raleigh-account > summary').innerText();
      const innersClosed = await page.locator('#raleigh-account details.raleigh-passage').evaluateAll((els) => els.length > 0 && els.every((d) => !d.open && !d.hasAttribute('open')));
      check(`${engine} ${tag}: Raleigh's account is closed`, resp.status() === 200 && closed && summary.trim() === "Raleigh's account" && innersClosed && errors.length === 0, errors.join(' | ') || summary);
      await page.locator('#raleigh-account details.raleigh-account > summary').click();
      const phrasePart = page.locator('#raleigh-account details.raleigh-passage').filter({ hasText: phrase }).first();
      await phrasePart.locator('summary').click();
      const spell = await page.evaluate((needle) => {
        const root = document.getElementById('raleigh-account');
        const details = root.querySelector('details.raleigh-account');
        const part = [...root.querySelectorAll('details.raleigh-passage')].find((d) => d.textContent.includes(needle));
        const original = part?.querySelector('.spell-original');
        const modern = part?.querySelector('.spell-modern');
        return {
          open: !!details?.open && !!part?.open,
          found: !!original,
          originalHidden: original ? getComputedStyle(original).display === 'none' : false,
          modernShown: modern ? getComputedStyle(modern).display !== 'none' : false,
          pressed: root.querySelector('[data-set-spelling="modern"]')?.getAttribute('aria-pressed'),
        };
      }, phrase);
      check(`${engine} ${tag}: modern spelling shows the account and keeps the original text`, spell.open && spell.found && spell.originalHidden && spell.modernShown && spell.pressed === 'true', JSON.stringify(spell));
      await page.locator('#raleigh-account [data-set-spelling="original"]').click();
      const orig = await page.evaluate((needle) => {
        const root = document.getElementById('raleigh-account');
        const part = [...root.querySelectorAll('details.raleigh-passage')].find((d) => d.textContent.includes(needle));
        const original = part?.querySelector('.spell-original');
        const modern = part?.querySelector('.spell-modern');
        return {
          originalShown: original ? getComputedStyle(original).display !== 'none' : false,
          modernHidden: modern ? getComputedStyle(modern).display === 'none' : false,
          pressed: root.querySelector('[data-set-spelling="original"]')?.getAttribute('aria-pressed'),
          spelling: root.dataset.spelling,
          letters: original ? original.textContent.includes(needle) : false,
        };
      }, phrase);
      check(`${engine} ${tag}: original spelling toggle`, orig.originalShown && orig.modernHidden && orig.pressed === 'true' && orig.spelling === 'original' && orig.letters, JSON.stringify(orig));
      await ctx.close();
    }
    if (own) await own.close();
  }
  await accountUi('chromium', browser);
  await accountUi('webkit', webkit);
}
{
  async function popoutBox(page) {
    return page.evaluate(() => {
      const section = document.getElementById('raleigh-account');
      const link = section?.querySelector('a.raleigh-popout');
      const summary = section?.querySelector('details.raleigh-account > summary');
      if (!section || !link || !summary) return null;
      const lr = link.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      const sum = summary.getBoundingClientRect();
      return {
        inSummary: !!link.closest('summary'),
        topDelta: Math.abs(lr.top - sum.top),
        rightGap: sr.right - lr.right,
        target: link.getAttribute('target'),
        rel: link.getAttribute('rel') || '',
        label: link.textContent.replace(/\s+/g, ' ').trim(),
        href: link.getAttribute('href'),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });
  }
  async function nestedUi(engine, launcher) {
    const own = launcher === browser ? null : stubIiif(await launcher.launch());
    const b = own || browser;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const resp = await page.goto(`${BASE}/people/adonis/`, { waitUntil: 'load', timeout: 60000 });
    const outer = page.locator('#raleigh-account details.raleigh-account');
    const inners = page.locator('#raleigh-account details.raleigh-passage');
    const outerClosed = await outer.evaluate((d) => !d.open && !d.hasAttribute('open'));
    const innerState = await inners.evaluateAll((els) => ({
      n: els.length,
      closed: els.every((d) => !d.open && !d.hasAttribute('open')),
      first: (els[0]?.querySelector('summary')?.textContent || '').trim(),
    }));
    const box = await popoutBox(page);
    const popOk = !!box && !box.inSummary && box.topDelta <= 16 && box.rightGap >= 0 && box.rightGap <= 36 && box.target === '_blank' && box.rel.includes('noopener') && box.label.includes('Open full text') && box.href === '/people/adonis/raleigh/';
    check(`${engine} adonis: passages are closed dropdowns and the full-text link sits at the top right`, resp.status() === 200 && outerClosed && innerState.n >= 1 && innerState.closed && /sig\./.test(innerState.first) && popOk && errors.length === 0, JSON.stringify({ outerClosed, innerState, box, errors }));
    await page.locator('#raleigh-account details.raleigh-account > summary').focus();
    await page.keyboard.press('Enter');
    const opened = await outer.evaluate((d) => d.open);
    const stillClosed = await inners.evaluateAll((els) => els.every((d) => !d.open));
    check(`${engine} adonis: Enter opens the account and leaves each passage closed`, opened && stillClosed);
    const part = inners.filter({ hasText: 'riuer' }).first();
    await part.locator('summary').click();
    const modernText = await part.locator('p').innerText();
    check(`${engine} adonis: modern spelling shows river`, /\briver\b/.test(modernText) && !/\briuer\b/.test(modernText), modernText.slice(0, 180));
    await page.locator('#raleigh-account [data-set-spelling="original"]').click();
    const originalText = await part.locator('p').innerText();
    check(`${engine} adonis: original spelling keeps riuer`, /\briuer\b/.test(originalText) && !/\briver\b/.test(originalText), originalText.slice(0, 180));
    await page.setViewportSize({ width: 390, height: 800 });
    const mobile = await popoutBox(page);
    const mobileOk = !!mobile && !mobile.inSummary && mobile.topDelta <= 16 && mobile.rightGap >= 0 && mobile.rightGap <= 36 && !mobile.overflow;
    check(`${engine} adonis: full-text link stays at the top right on a narrow screen`, mobileOk, JSON.stringify(mobile));
    if (engine === 'chromium') {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.locator('#raleigh-account [data-set-spelling="modern"]').click();
      await page.locator('#raleigh-account').scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(SHOTS, 'raleigh-account-nested.png') });
    }
    const fullResp = await page.goto(`${BASE}${box.href}`, { waitUntil: 'load', timeout: 60000 });
    const full = await page.evaluate(() => {
      const root = document.getElementById('raleigh-full');
      const back = [...document.querySelectorAll('a')].find((a) => a.getAttribute('href') === '/people/adonis/' && /Back to /.test(a.textContent));
      return {
        statusOk: !!root,
        headings: root ? root.querySelectorAll('h2').length : 0,
        details: root ? root.querySelectorAll('details').length : 0,
        back: back?.textContent.trim() || '',
        ignored: document.body.hasAttribute('data-pagefind-ignore'),
      };
    });
    check(`${engine} adonis: full view lists every passage in the open`, fullResp.status() === 200 && full.statusOk && full.headings === innerState.n && full.details === 0 && full.back.startsWith('Back to ') && full.ignored, JSON.stringify(full));
    const fullModern = await page.locator('#raleigh-full .raleigh-text').first().innerText();
    check(`${engine} adonis full view: modern spelling shows river`, /\briver\b/.test(fullModern) && !/\briuer\b/.test(fullModern), fullModern.slice(0, 180));
    await page.locator('#raleigh-full [data-set-spelling="original"]').click();
    const fullOriginal = await page.locator('#raleigh-full .raleigh-text').first().innerText();
    check(`${engine} adonis full view: original spelling keeps riuer`, /\briuer\b/.test(fullOriginal), fullOriginal.slice(0, 180));
    if (engine === 'chromium') {
      await page.locator('#raleigh-full [data-set-spelling="modern"]').click();
      await page.screenshot({ path: join(SHOTS, 'raleigh-full-adonis.png'), fullPage: true });
    }
    await ctx.close();
    if (own) await own.close();
  }
  await nestedUi('chromium', browser);
  await nestedUi('webkit', webkit);
}
{
  async function italicWord(page, rootId) {
    return page.evaluate((id) => {
      const root = document.getElementById(id);
      if (!root) return { found: false };
      const mode = root.dataset.spelling;
      const sel = mode === 'original' ? '.spell-original em' : '.spell-modern em';
      const em = [...root.querySelectorAll(sel)].find((el) => el.textContent.includes('Blame'));
      if (!em) return { found: false, mode };
      const parent = em.closest(mode === 'original' ? '.spell-original' : '.spell-modern');
      return {
        found: true,
        mode,
        italic: getComputedStyle(em).fontStyle === 'italic',
        visible: !!parent && getComputedStyle(parent).display !== 'none',
        text: em.textContent.replace(/\s+/g, ' ').trim().slice(0, 40),
      };
    }, rootId);
  }
  async function italicUi(engine, launcher) {
    const own = launcher === browser ? null : stubIiif(await launcher.launch());
    const b = own || browser;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const resp = await page.goto(`${BASE}/people/seneca/`, { waitUntil: 'load', timeout: 60000 });
    await page.locator('#raleigh-account details.raleigh-account > summary').click();
    const part = page.locator('#raleigh-account details.raleigh-passage').filter({ hasText: 'Blame no man' }).first();
    await part.locator('summary').click();
    const modern = await italicWord(page, 'raleigh-account');
    check(`${engine} seneca: an italic word is italic in the modern account`, resp.status() === 200 && modern.found && modern.mode === 'modern' && modern.italic && modern.visible && modern.text.includes('Blame') && errors.length === 0, JSON.stringify({ modern, errors }));
    await page.locator('#raleigh-account [data-set-spelling="original"]').click();
    const original = await italicWord(page, 'raleigh-account');
    check(`${engine} seneca: the same italic word is italic in the original account`, original.found && original.mode === 'original' && original.italic && original.visible && original.text.includes('Blame'), JSON.stringify(original));
    const fullResp = await page.goto(`${BASE}/people/seneca/raleigh/`, { waitUntil: 'load', timeout: 60000 });
    const fullModern = await italicWord(page, 'raleigh-full');
    check(`${engine} seneca full text: an italic word is italic in the modern view`, fullResp.status() === 200 && fullModern.found && fullModern.mode === 'modern' && fullModern.italic && fullModern.visible && fullModern.text.includes('Blame'), JSON.stringify(fullModern));
    await page.locator('#raleigh-full [data-set-spelling="original"]').click();
    const fullOriginal = await italicWord(page, 'raleigh-full');
    check(`${engine} seneca full text: the same italic word is italic in the original view`, fullOriginal.found && fullOriginal.mode === 'original' && fullOriginal.italic && fullOriginal.visible && fullOriginal.text.includes('Blame'), JSON.stringify(fullOriginal));
    await ctx.close();
    if (own) await own.close();
  }
  await italicUi('chromium', browser);
  await italicUi('webkit', webkit);
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
    const own = launcher === browser ? null : stubIiif(await launcher.launch());
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
      // ABRAHAMI and ABRAHAMS are Book I spellings. ABRAHAMO is Book II, Part I, Chapter I.
      // A raham is Book II, Part I, Chapter IV. The printed name is split.
      check(`${tag}: one row per spelling`, spellings.length === 8 && new Set(keys).size === keys.length && heb.some((t) => t.includes('אַבְרָהָם')) && heb.some((t) => t.includes('אַבְרָם')) && keys.some((t) => t.startsWith('ABRAHAMI')) && keys.some((t) => t.startsWith('ABRAHAMS')) && keys.some((t) => t.startsWith('ABRAHAMO')) && keys.some((t) => t.startsWith('A raham')), keys.join(' ; '));
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
      const raleighSubs = [...table.querySelectorAll('tr[data-author-sub="raleigh-history-of-the-world"]')].map((tr) => tr.innerText);
      const hales = row('hales');
      return {
        unique: new Set(authors).size === authors.length,
        raleighRows: count('raleigh-history-of-the-world'),
        raleighQuotes: raleigh ? raleigh.querySelectorAll('.date-quote').length : 0,
        raleighHtml: raleigh ? raleigh.innerHTML : '',
        raleighSubs,
        halesRows: count('hales'),
        halesQuotes: hales ? hales.querySelectorAll('.date-quotes li').length : 0,
        halesText: hales ? hales.innerText : '',
        shuckfordRows: count('shuckford'),
        generationsRows: count('generations'),
        generationsText: (row('generations')?.innerText || '') + (table.querySelector('tr[data-author-sub="generations"]')?.innerText || ''),
      };
    });
    // The two quotations of World 2009 stay on one row. The body age and the 430 yeeres after the promise, neither a yeere of the World, are sub-rows under the same author.
    const age = (birth.raleighSubs || []).find((t) => /fiftie and eight/.test(t)) || '';
    const promise = (birth.raleighSubs || []).find((t) => /after the promise to A raham 430/.test(t)) || '';
    check(`${engine}: Abraham birth keeps both 2009 quotations, and the body lines are sub-rows`, birth.unique && birth.raleighRows === 3 && birth.raleighSubs.length === 2 && birth.raleighQuotes === 2 && birth.raleighHtml.includes('<em>2024 BC</em>') && birth.raleighHtml.includes('yeere of the World, 2009') && birth.raleighHtml.includes('1. Abram. 175') && /Not derived/.test(age) && /Not derived/.test(promise), `${birth.raleighHtml.slice(0, 180)} || ${age.slice(0, 80)} || ${promise.slice(0, 80)}`);
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
// Doré illustrations (1866): beside the title (stacked under it at 390px), IIIF v2 with a v3 fallback,
// Also-on excluding the current record, and prev/next labels that do not wrap.
// Display images load from the Internet Archive; local WebP thumbnails are the placeholder, the gallery
// dots and the index images. Plates listed in data/illustrations/dore-thumbs-pending.json have no local
// thumbnail yet: spinner and reserved box only, a plain dot, and an IIIF image on the index.
// This checks markup and controls, not IIIF image bytes, and does not need Archive.org to answer.
{
  const doreDoc = JSON.parse(readFileSync(join(here, '../data/illustrations/dore-1866.json'), 'utf8'));
  const countFor = (id) => doreDoc.illustrations.filter((il) => il.records.some((r) => r.id === id)).length;
  // Plates listed in data/illustrations/dore-thumbs-pending.json have no local thumbnail (no thumb_width).
  const hasThumb = (il) => Number.isInteger(il.thumb_width);
  const thumbsFor = (path) => {
    const id = path.split('/').filter(Boolean).pop();
    return doreDoc.illustrations.filter((il) => hasThumb(il) && il.records.some((r) => r.id === id)).length;
  };
  const pendingN = doreDoc.illustrations.filter((il) => !hasThumb(il)).length;
  const singleId = ['canaan-son-of-ham', 'balthasar', 'athalia', 'zerubbabel'].find((id) => countFor(id) === 1);
  const cases = [['/people/noah/', countFor('noah')], ['/events/the-flood/', countFor('the-flood')], ['/people/adam/', countFor('adam')], ['/events/the-fall/', countFor('the-fall')]];
  if (singleId) cases.push([`/people/${singleId}/`, 1]);
  check('doré sample: a gallery and a single figure', countFor('the-flood') > 1 && countFor('noah') >= 1 && !!singleId, `flood=${countFor('the-flood')} noah=${countFor('noah')} single=${singleId || 'none'}`);
  for (const [path, n] of cases) {
    for (const width of [390, 1280]) {
      const { ctx, page, errors, status } = await open(path, { width, height: 900 });
      const info = await page.evaluate(() => {
        const sec = document.querySelector('section.dore');
        const h1 = document.querySelector('article h1');
        const imgs = [...(sec?.querySelectorAll('img.dore-img') || [])];
        const hr = h1?.getBoundingClientRect();
        const fr = sec?.getBoundingClientRect();
        const desc = [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Description');
        const beforeDesc = !desc || !!(sec && (sec.compareDocumentPosition(desc) & Node.DOCUMENT_POSITION_FOLLOWING));
        const beside = !!(hr && fr && fr.left >= hr.right - 4 && fr.top < hr.bottom + 80);
        const stacked = !!(hr && fr && fr.top >= hr.bottom - 2 && fr.left < hr.right);
        const also = [...(sec?.querySelectorAll('figcaption li') || [])].filter((li) => li.textContent.includes('Also on'));
        const alsoHrefs = also.flatMap((li) => [...li.querySelectorAll('a')].map((a) => a.getAttribute('href')));
        const selfInAlso = alsoHrefs.some((h) => h === location.pathname);
        const btnInfo = (sel) => {
          const btn = sec?.querySelector(sel);
          if (!btn) return null;
          const r = btn.getBoundingClientRect();
          return { nowrap: getComputedStyle(btn).whiteSpace === 'nowrap', h: r.height, w: r.width, fits: btn.scrollWidth <= btn.clientWidth + 1 };
        };
        const thumbs = [...(sec?.querySelectorAll('.dore-frame > img.dore-thumb') || [])];
        const dotThumbs = [...(sec?.querySelectorAll('.dore-dot img') || [])];
        const localThumb = (i) => /^\/img\/dore\/thumbs\/\d{3}\.webp$/.test(i.getAttribute('src') || '') && +i.getAttribute('width') > 0 && +i.getAttribute('height') > 0;
        // No visible heading in the section (aria-label only); the credit is in the site footer; from 800px
        // the cards after the sort-year card flow up beside the floated plate (no gap over 20px, no overlap).
        const art = sec?.closest('article');
        const head = art?.querySelector('.record-head');
        const seq = [head, ...[...(art?.children || [])].filter((k) => !k.classList.contains('record-top') && k.offsetParent !== null)].filter(Boolean);
        let maxGap = 0;
        for (let i = 1; i < seq.length; i++) maxGap = Math.max(maxGap, seq[i].getBoundingClientRect().top - seq[i - 1].getBoundingClientRect().bottom);
        const overlap = seq.some((k) => { const q = k.getBoundingClientRect(); return q.height > 0 && q.right > fr.left + 1 && q.left < fr.right - 1 && q.top < fr.bottom - 1 && q.bottom > fr.top + 1; });
        const foot = document.querySelector('footer.site-footer');
        return {
          headings: sec?.querySelectorAll('h1, h2, h3').length ?? -1,
          label: sec?.getAttribute('aria-label') || '',
          labelledbyOk: [...(sec?.querySelectorAll('[aria-labelledby]') || [])].every((el) => el.getAttribute('aria-labelledby').split(/\s+/).every((id) => document.getElementById(id))),
          creditInSection: /Public domain|public domain/.test(sec?.textContent || ''),
          footerCredit: !!foot?.querySelector('a[href="https://archive.org/details/gustavedore"]') && !!foot?.querySelector('a[href="/illustrations/dore/"]') && /public domain/.test(foot.textContent),
          maxGap: Math.round(maxGap), overlap,
          imgs: imgs.length,
          thumbs: thumbs.length,
          thumbsLocal: thumbs.every(localThumb) && dotThumbs.every(localThumb),
          dotThumbs: dotThumbs.length,
          plainDots: sec?.querySelectorAll('.dore-dot .dore-dot-plain').length || 0,
          iiif: imgs.every((i) => {
            const src = i.getAttribute('src') || '';
            const v2 = src.startsWith('https://iiif.archive.org/image/iiif/2/gustavedore%2F');
            const retried = i.dataset.retried === '1' && src.includes('/image/iiif/3/gustavedore');
            return (v2 || retried) && i.loading === 'lazy' && i.width > 0;
          }),
          gallery: !!sec?.querySelector('[data-dore-gallery].dore-js'),
          controls: sec?.querySelector('.dore-controls') ? getComputedStyle(sec.querySelector('.dore-controls')).display : 'none',
          dots: sec?.querySelectorAll('.dore-dot').length || 0,
          status: sec?.querySelector('.dore-status')?.textContent || '',
          caption: sec?.querySelector('figcaption')?.innerText || '',
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          beside, stacked, beforeDesc, selfInAlso, alsoCount: also.length,
          prev: btnInfo('[data-dore="prev"]'), next: btnInfo('[data-dore="next"]'),
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
      const placeOk = width >= 800 ? info.beside && !info.stacked : info.stacked && !info.beside;
      const btnOk = (b) => b && b.nowrap && b.h >= 44 && b.w >= 44 && b.fits;
      const controlsOk = n > 1 ? btnOk(info.prev) && btnOk(info.next) : true;
      const tn = thumbsFor(path);
      const flowOk = width >= 800 ? info.maxGap <= 21 && !info.overlap : true;
      const labelOk = info.headings === 0 && info.label === (n > 1 ? `Illustrations, ${n}` : 'Illustration') && info.labelledbyOk && !info.creditInSection && info.footerCredit;
      const ok = status === 200 && errors.length === 0 && flowOk && labelOk && info.imgs === n && info.iiif && info.thumbs === tn && info.thumbsLocal && info.dotThumbs === (n > 1 ? tn : 0) && info.plainDots === (n > 1 ? n - tn : 0) && !info.overflow && /Gustave Doré, 1866/.test(info.caption)
        && info.beforeDesc && placeOk && !info.selfInAlso && controlsOk
        && (n > 1 ? info.gallery && info.controls === 'flex' && info.dots === n && info.status === `1 of ${n}` && moved : !info.gallery && info.dots === 0);
      check(`doré ${path} ${width}px: ${n > 1 ? `gallery of ${n}` : 'one figure'}, ${width >= 800 ? 'beside the title, content flows beside it' : 'under the title'}, no heading, credit in footer`, ok, ok ? '' : JSON.stringify({ status, errors: errors.slice(0, 3), ...info, moved }));
      await ctx.close();
    }
  }
  for (const width of [390, 1280]) {
    const { ctx, page, errors, status } = await open('/illustrations/dore/', { width, height: 900 });
    const info = await page.evaluate(() => {
      const items = [...document.querySelectorAll('.dore-index-item')];
      const all = [...document.querySelectorAll('.dore-index img')];
      const hrefs = items.map((li) => li.querySelector('a')?.getAttribute('href') || '');
      const imgs = items.map((li) => li.querySelector('img')).filter(Boolean);
      const headings = items.map((li) => li.querySelector('h2')?.textContent || '');
      return {
        n: items.length,
        xFile: hrefs.some((h) => /\d{3}x%20/.test(h)) || headings.some((h) => /^\s*\d{3}x\b/.test(h)),
        lazy: imgs.length === items.length && imgs.every((i) => i.loading === 'lazy' && i.getAttribute('width') && i.getAttribute('height')),
        // Plates with a local thumbnail: one local WebP and no spinner. Pending plates: an IIIF v2 image
        // (v3 fallback) in a reserved aspect-ratio box with a spinner and a hidden fallback label.
        local: items.every((li) => {
          const no = (li.id || '').replace('dore-', '');
          const img = li.querySelector('img');
          const remote = li.querySelector('.dore-index-remote');
          if (!remote) return (img?.getAttribute('src') || '') === `/img/dore/thumbs/${no}.webp` && !li.querySelector('.dore-loading');
          // Live IIIF may already have loaded or failed (dore.js then removes the spinner and may switch to v3),
          // so accept either state: this checks markup, not whether Archive.org answered.
          const src = img?.getAttribute('src') || '';
          const v2 = src.startsWith('https://iiif.archive.org/image/iiif/2/gustavedore%2F');
          const v3 = img?.dataset.retried === '1' && src.startsWith('https://iiif.archive.org/image/iiif/3/gustavedore%2F');
          const spin = remote.querySelector('.dore-loading[role="status"]');
          const spinOk = spin ? !!spin.querySelector('.visually-hidden') && remote.getAttribute('aria-busy') === 'true' : remote.getAttribute('aria-busy') === 'false';
          return (v2 || v3) && (img.dataset.fallbackSrc || '').startsWith('https://iiif.archive.org/image/iiif/3/gustavedore%2F')
            && /aspect-ratio/.test(remote.getAttribute('style') || '') && spinOk && !!remote.querySelector('.dore-index-fallback');
        }),
        imgCount: all.length,
        remote: document.querySelectorAll('.dore-index .dore-index-remote').length,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        dash: items.filter((li) => li.textContent.includes('—')).length,
      };
    });
    const ok = status === 200 && errors.length === 0 && info.n === 220 && info.n === doreDoc.illustrations.length && !info.xFile && info.lazy && info.local && info.imgCount === 220 && info.remote === pendingN && !info.overflow;
    check(`doré index ${width}px: 220 plates, ${220 - pendingN} local thumbnails, ${pendingN} pending on IIIF, no Apocrypha, no overflow`, ok, ok ? '' : JSON.stringify({ status, errors: errors.slice(0, 3), ...info }));
    await ctx.close();
  }
  {
    // Index: no IIIF request for a plate that has a local thumbnail; only pending plates may ask IIIF.
    // IIIF is blocked here, so the check does not depend on Archive.org: a pending plate that fails
    // keeps its reserved box with the file number and "Archive.org" inside the link.
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const pendingFiles = new Set(doreDoc.illustrations.filter((il) => !hasThumb(il)).map((il) => encodeURIComponent(il.file)));
    const iiifReqs = [];
    const thumbResp = [];
    await page.route('**/image/iiif/**', (r) => r.abort());
    page.on('request', (r) => {
      if (!/iiif\.archive\.org|archive\.org\/download/.test(r.url())) return;
      const m = r.url().match(/gustavedore%2F([^/]+)\//);
      if (!m || !pendingFiles.has(m[1])) iiifReqs.push(r.url());
    });
    page.on('response', (r) => { if (r.url().includes('/img/dore/thumbs/')) thumbResp.push([r.status(), r.headers()['content-type'] || '']); });
    await page.goto(BASE + '/illustrations/dore/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    const shown = await page.evaluate(() => [...document.querySelectorAll('.dore-index img')].slice(0, 4).every((i) => i.complete && i.naturalWidth > 0));
    const respOk = thumbResp.length > 0 && thumbResp.every(([st, ct]) => st === 200 && /image\/webp/.test(ct));
    check('doré index: no IIIF requests for plates with a local thumbnail; thumbnails served as local WebP', iiifReqs.length === 0 && shown && respOk, JSON.stringify({ iiif: iiifReqs.slice(0, 3), n: thumbResp.length, bad: thumbResp.filter(([st, ct]) => st !== 200 || !/webp/.test(ct)).slice(0, 3), shown }));
    if (pendingN) {
      await page.locator('.dore-index-remote').first().scrollIntoViewIfNeeded();
      const tidy = await page.waitForFunction(() => {
        const box = document.querySelector('.dore-index-remote');
        const r = box?.getBoundingClientRect();
        const label = box?.querySelector('.dore-index-fallback');
        return !!(box && box.classList.contains('dore-failed') && !box.querySelector('.dore-loading') && r.height > 50 && label && getComputedStyle(label).display !== 'none' && box.closest('a[href*="archive.org/details/gustavedore"]'));
      }, null, { timeout: 10000 }).then(() => true, () => false);
      check('doré index: a pending plate whose IIIF image fails keeps its box and Archive.org link', tidy);
    }
    await ctx.close();
  }
  {
    const { ctx, page } = await open('/people/noah/', { width: 390, height: 900 });
    const info = await page.evaluate(() => {
      const also = [...document.querySelectorAll('section.dore figcaption li')].filter((li) => li.textContent.includes('Also on'));
      const hrefs = also.flatMap((li) => [...li.querySelectorAll('a')].map((a) => a.getAttribute('href')));
      return { n: also.length, self: hrefs.filter((h) => h === location.pathname), sample: hrefs.slice(0, 6) };
    });
    check('doré Also on excludes the current record', info.n > 0 && info.self.length === 0, JSON.stringify(info));
    await ctx.close();
  }
}
{
  // Fallback: when IIIF v2 fails, dore.js retries on IIIF v3; when both fail, it shows a link to Archive.org.
  // The sample is whichever listed person still has exactly one plate.
  const doreDoc = JSON.parse(readFileSync(join(here, '../data/illustrations/dore-1866.json'), 'utf8'));
  const countFor = (id) => doreDoc.illustrations.filter((il) => il.records.some((r) => r.id === id)).length;
  const singlePerson = ['canaan-son-of-ham', 'balthasar', 'athalia', 'zerubbabel', 'noah'].find((id) => countFor(id) === 1);
  check('doré fallback sample is one plate', !!singlePerson, singlePerson || 'none');
  const sample = `/people/${singlePerson || 'balthasar'}/`;
  const hasThumb = (il) => Number.isInteger(il.thumb_width);
  const idOf = (path) => path.split('/').filter(Boolean).pop();
  const pageHasThumb = (path) => doreDoc.illustrations.some((il) => hasThumb(il) && il.records.some((r) => r.id === idOf(path)));
  // A one-plate page with a local thumbnail, for the "thumbnail stays" fallback (Noah: plate 9).
  const thumbSample = ['noah', 'canaan-son-of-ham', 'balthasar', 'athalia', 'zerubbabel'].map((id) => `/people/${id}/`).find((p) => countFor(idOf(p)) === 1 && pageHasThumb(p));
  const fallbackRuns = [['v2 blocked', '**/image/iiif/2/**', 'v3', sample], ['v2 and v3 blocked', '**/image/iiif/**', 'link', sample]];
  if (thumbSample && thumbSample !== sample) fallbackRuns.push(['v2 and v3 blocked, local thumbnail', '**/image/iiif/**', 'link', thumbSample]);
  for (const [label, pattern, expect, path] of fallbackRuns) {
    const withThumb = pageHasThumb(path);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.route(pattern, (r) => r.abort());
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
    await page.locator('section.dore').scrollIntoViewIfNeeded();
    const ok = expect === 'v3'
      ? await page.waitForFunction(() => document.querySelector('img.dore-img')?.src.includes('/image/iiif/3/'), null, { timeout: 10000 }).then(() => true, () => false)
      : await page.waitForFunction((withThumb) => {
          const p = document.querySelector('.dore-unavailable');
          const link = p && !p.hidden && p.querySelector('a[href*="archive.org/details/gustavedore"]');
          const spinner = document.querySelector('section.dore .dore-loading');
          const frame = document.querySelector('section.dore .dore-frame');
          const thumb = frame?.querySelector('img.dore-thumb');
          const boxOk = !!(frame && frame.classList.contains('dore-failed') && frame.getBoundingClientRect().height > 50);
          const thumbOk = withThumb
            ? !!(thumb && !thumb.hidden && thumb.complete && thumb.naturalWidth > 0 && thumb.getBoundingClientRect().height > 50 && getComputedStyle(thumb).filter === 'none')
            : !thumb;
          return !!(link && !spinner && boxOk && thumbOk);
        }, withThumb, { timeout: 10000 }).then(() => true, () => false);
    check(`doré fallback (${label}, ${path}): ${expect === 'v3' ? 'retries on IIIF v3' : withThumb ? 'keeps the local thumbnail and shows the Archive.org link' : 'keeps the reserved box and shows the Archive.org link'}`, ok);
    await ctx.close();
  }

  // Spinner: present while the image is held, gone after it loads. No visible loading text.
  // Index spinners appear only for pending plates. Reduced motion leaves the spinner static.
  const loadingState = () => {
    const textHits = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!/loading illustration/i.test(walker.currentNode.textContent || '')) continue;
      if (!walker.currentNode.parentElement?.closest('.visually-hidden')) textHits.push('visible');
    }
    const frame = document.querySelector('section.dore .dore-frame');
    const status = frame?.querySelector('.dore-loading');
    const spinner = status?.querySelector('.dore-spinner');
    return {
      busy: frame?.getAttribute('aria-busy') || '',
      status: !!status && status.getAttribute('role') === 'status',
      sr: !!status?.querySelector('.visually-hidden'),
      spinner: !!spinner,
      visibleText: textHits.length,
      anim: spinner ? getComputedStyle(spinner).animationName : '',
    };
  };
  const holdImages = async (page) => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    // 600×2. A 1px PNG is not enough: the record image uses a srcset width
    // descriptor, and the browser density-corrects naturalWidth down to 0.
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAlgAAAACCAIAAAALjjUzAAAAHUlEQVR42u3QAQEAAAABIPPNNkRNKAWAY1EAwLMB3xF46s3EUSgAAAAASUVORK5CYII=', 'base64');
    await page.route('**/image/iiif/**', async (route) => {
      await gate;
      await route.fulfill({ status: 200, contentType: 'image/png', body: png });
    });
    return release;
  };
  for (const [label, path] of [['single', sample], ['gallery', '/events/the-flood/']]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const release = await holdImages(page);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // The figure sits under the title. A lazy image below the first screen does not
    // request until it is near the viewport, so bring the frame up before the load check.
    await page.locator('section.dore .dore-frame').first().scrollIntoViewIfNeeded();
    const before = await page.evaluate(loadingState);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    const beforeOk = before.busy === 'true' && before.status && before.sr && before.spinner && before.visibleText === 0 && !overflow;
    check(`doré spinner before load (${label}, 390px)`, beforeOk, beforeOk ? '' : JSON.stringify({ ...before, overflow }));
    // With a local thumbnail, it is the placeholder: loaded, blurred, filling the reserved box, while IIIF is still held.
    // A plate still pending (no local thumbnail) has no placeholder image, only the spinner in the reserved box.
    const firstThumb = (() => {
      const id = path.split('/').filter(Boolean).pop();
      const il = doreDoc.illustrations.find((x) => x.records.some((r) => r.id === id));
      return !!(il && Number.isInteger(il.thumb_width));
    })();
    const ph = await page.waitForFunction((firstThumb) => {
      const frame = document.querySelector('section.dore .dore-frame');
      const t = frame?.querySelector('img.dore-thumb');
      const fr = frame?.getBoundingClientRect();
      const busy = frame?.getAttribute('aria-busy') === 'true' && !!frame.querySelector('.dore-loading .dore-spinner');
      if (!firstThumb) return !!(frame && !t && fr.height > 100 && busy);
      return !!(t && t.complete && t.naturalWidth > 0 && /blur/.test(getComputedStyle(t).filter) && fr.height > 100 && Math.abs(t.offsetHeight - frame.offsetHeight) < 2 && busy);
    }, firstThumb, { timeout: 10000 }).then(() => true, () => false);
    const box1 = await page.evaluate(() => document.querySelector('section.dore .dore-frame').getBoundingClientRect().height);
    check(`doré ${firstThumb ? 'thumbnail placeholder' : 'reserved box and spinner (no local thumbnail yet)'} before IIIF loads (${label})`, ph);
    release();
    const gone = await page.waitForFunction(() => {
      const frame = document.querySelector('section.dore .dore-frame');
      const img = frame?.querySelector('img.dore-img');
      return !!(img && img.complete && img.naturalWidth > 0 && frame.getAttribute('aria-busy') === 'false' && !frame.querySelector('.dore-loading'));
    }, null, { timeout: 20000 }).then(() => true, () => false);
    const box2 = await page.evaluate(() => document.querySelector('section.dore .dore-frame').getBoundingClientRect().height);
    check(`doré spinner gone after load (${label}); no layout shift`, gone && Math.abs(box2 - box1) < 1, `${box1} -> ${box2}`);
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const release = await holdImages(page);
    await page.goto(BASE + sample, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('section.dore .dore-frame').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const before = await page.evaluate(loadingState);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    const ok = before.spinner && before.anim === 'none' && before.visibleText === 0 && !overflow;
    check('doré spinner: reduced motion does not animate', ok, ok ? '' : JSON.stringify({ ...before, overflow }));
    release();
    await ctx.close();
  }
}
// Calculated dates, mother and spouse, and See more. Chromium and WebKit.
{
  async function seeMoreState(page, root) {
    return page.locator(root).evaluate((el) => {
      const details = el.querySelector('details.see-more');
      const firstList = el.querySelector(':scope > ul.links');
      const firstBody = el.querySelector(':scope > .table-wrap tbody');
      const shown = firstList ? firstList.querySelectorAll(':scope > li').length : (firstBody ? firstBody.querySelectorAll('tr').length : 0);
      const extra = details ? details.querySelectorAll('ul.links > li, tbody tr').length : 0;
      const summary = details?.querySelector('summary')?.textContent.replace(/\s+/g, ' ').trim() || '';
      return { shown, extra, summary, open: details ? details.open : null, control: !!details };
    });
  }
  async function calculatedUi(engine, launcher) {
    const own = launcher === browser ? null : stubIiif(await launcher.launch());
    const b = own || browser;
    async function visit(path) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 60000 });
      return { ctx, page, errors, status: resp.status() };
    }
    {
      const o = await visit('/people/naamah/');
      const sort = await o.page.locator('.sortbox').innerText();
      const death = await o.page.locator('#death').innerText();
      const family = await o.page.locator('#family-brief').innerText();
      const nameRows = await o.page.locator('#name table.names tbody tr').count();
      const nameMore = await o.page.locator('#name details.see-more').count();
      const deathOk = o.status === 200 && o.errors.length === 0 && /calc\./.test(sort) && /1994 BC/.test(sort) && /calculated death/i.test(sort) && /calc\./.test(death) && /1994 BC/.test(death) && /1998 BC/.test(death) && /\b4 years\b/.test(death);
      check(`${engine} naamah: calculated death 1994 BC`, deathOk, o.errors.join(' | ') || `${sort.replace(/\s+/g, ' ').slice(0, 180)} || ${death.replace(/\s+/g, ' ').slice(0, 180)}`);
      check(`${engine} naamah: mother Zillah and spouse Ham?`, /Zillah/.test(family) && /Ham\s*\?/.test(family), family.replace(/\s+/g, ' ').slice(0, 280));
      check(`${engine} naamah: a short Names list has no See more`, nameRows > 0 && nameRows <= 5 && nameMore === 0, `${nameRows} rows, ${nameMore} controls`);
      const badge = await o.page.locator('.sortbox .tier').evaluate((el) => {
        const cs = getComputedStyle(el);
        const sw = el.parentElement?.querySelector('.swatch');
        return { radius: parseFloat(cs.borderTopLeftRadius) || 0, border: cs.borderTopStyle, text: el.textContent, swatch: sw ? sw.getBoundingClientRect().width : 0 };
      });
      check(`${engine} naamah: sort tier is secondary text with a swatch`, badge.radius === 0 && badge.border === 'none' && /Calculated/.test(badge.text) && badge.swatch > 0, JSON.stringify(badge));
      await o.page.locator('#raleigh-account details.raleigh-account > summary').click();
      const spell = await o.page.locator('#raleigh-account .segmented').evaluate((el) => {
        const buttons = [...el.querySelectorAll('button')];
        const b = buttons[0];
        const cs = b ? getComputedStyle(b) : null;
        return { n: buttons.length, radius: cs ? parseFloat(cs.borderTopLeftRadius) : null, h: b ? b.getBoundingClientRect().height : 0, pressed: buttons.map((x) => x.getAttribute('aria-pressed')) };
      });
      check(`${engine} naamah: spelling is a segmented control`, spell.n === 2 && spell.radius < 16 && spell.h >= 44 && spell.pressed[0] === 'true' && spell.pressed[1] === 'false', JSON.stringify(spell));
      await o.ctx.close();
    }
    {
      const o = await visit('/');
      await o.page.waitForFunction(() => document.getElementById('timeline')?.hasAttribute('data-ready'), null, { timeout: 20000 }).catch(() => {});
      const hig = await o.page.evaluate(() => {
        const rows = [...document.querySelectorAll('[data-tier-toggle]')];
        const row = rows[0];
        const cs = row ? getComputedStyle(row) : null;
        const sw = row?.querySelector('.switch');
        const rect = row?.getBoundingClientRect();
        return {
          n: rows.length,
          radius: cs ? parseFloat(cs.borderTopLeftRadius) : null,
          border: cs ? cs.borderTopStyle : '',
          h: rect ? rect.height : 0,
          w: rect ? rect.width : 0,
          switchW: sw ? sw.getBoundingClientRect().width : 0,
          pressed: rows.map((r) => r.getAttribute('aria-pressed')),
          note: document.getElementById('tier-note')?.textContent || '',
        };
      });
      const tiersOk = hig.n >= 8 && hig.radius < 16 && hig.border === 'none' && hig.h >= 44 && hig.w > 240 && hig.switchW >= 48 && hig.pressed[0] === 'true' && hig.pressed.slice(1).every((p) => p === 'false') && /dashed and grey/.test(hig.note);
      check(`${engine} home: tier filter is a grouped list of switches`, tiersOk, JSON.stringify(hig));
      await o.page.locator('[data-tier-toggle="standby"]').click();
      const moved = await o.page.locator('[data-tier-toggle="standby"]').evaluate((el) => {
        const after = getComputedStyle(el.querySelector('.switch'), '::after');
        return { pressed: el.getAttribute('aria-pressed'), transform: after.transform };
      });
      const shifted = moved.pressed === 'true' && moved.transform && moved.transform !== 'none' && !/matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)/.test(moved.transform);
      check(`${engine} home: standby switch moves when pressed`, shifted, JSON.stringify(moved));
      await o.ctx.close();
    }
    {
      const o = await visit('/people/noah/');
      const sort = await o.page.locator('.sortbox').innerText();
      const death = await o.page.locator('#death').innerText();
      const kept = /2948 BC/.test(sort) && !/calc\./.test(sort) && !/Calculated/.test(sort) && !/calc\./.test(death);
      check(`${engine} noah: printed 2948 BC stays, and no calculated death is shown`, kept, `${sort.replace(/\s+/g, ' ').slice(0, 160)} || ${death.replace(/\s+/g, ' ').slice(0, 120)}`);
      await o.ctx.close();
    }
    {
      const o = await visit('/people/sarai/');
      const sort = await o.page.locator('.sortbox').innerText();
      const death = await o.page.locator('#death').innerText();
      const family = await o.page.locator('#family-brief').innerText();
      const override = /1987 BC/.test(sort) && !/calc\./.test(sort) && !/Calculated/.test(sort) && /calc\./.test(death) && /Abraham/.test(family);
      check(`${engine} sarah: the birth tier stays and a calculated death fills the empty slot`, override, `${sort.replace(/\s+/g, ' ').slice(0, 120)} || ${death.replace(/\s+/g, ' ').slice(0, 160)}`);
      await o.ctx.close();
    }
    {
      const o = await visit('/people/abraham/');
      const names = await seeMoreState(o.page, '#name');
      const summary = o.page.locator('#name details.see-more > summary');
      await summary.focus();
      const focused = await o.page.evaluate(() => document.activeElement?.closest('details.see-more') != null);
      await o.page.keyboard.press('Enter');
      const opened = await o.page.locator('#name details.see-more').evaluate((d) => d.open);
      const restVisible = await o.page.locator('#name details.see-more tbody tr').first().isVisible();
      const family = await o.page.locator('#family-brief').innerText();
      const namesOk = names.shown === 5 && names.extra > 0 && names.summary === `See more (${names.extra})` && names.open === false && focused && opened && restVisible;
      check(`${engine} abraham: Names See more opens from the keyboard`, namesOk, JSON.stringify({ ...names, focused, opened, restVisible }));
      check(`${engine} abraham: spouses are Sarah, Hagar and Keturah, and the mother stays unrecorded`, /Sarah/.test(family) && /Hagar/.test(family) && /Keturah/.test(family) && /Not recorded/.test(family), family.replace(/\s+/g, ' ').slice(0, 320));
      await o.ctx.close();
    }
    {
      const o = await visit('/people/jacob/');
      const other = await seeMoreState(o.page, '#other-people');
      const summary = o.page.locator('#other-people details.see-more > summary');
      await summary.focus();
      const focused = await o.page.evaluate(() => document.activeElement?.closest('details.see-more') != null);
      await o.page.keyboard.press('Enter');
      const opened = await o.page.locator('#other-people details.see-more').evaluate((d) => d.open);
      const restVisible = await o.page.locator('#other-people details.see-more li').first().isVisible();
      const otherOk = other.shown === 5 && other.extra > 0 && other.summary === `See more (${other.extra})` && other.open === false && focused && opened && restVisible;
      check(`${engine} jacob: Other people See more opens from the keyboard`, otherOk, JSON.stringify({ ...other, focused, opened, restVisible }));
      await o.ctx.close();
    }
    {
      const o = await visit('/people/rameses-ii/');
      const nameMore = await o.page.locator('#name details.see-more').count();
      const rows = await o.page.locator('#name table.names tbody tr').count();
      check(`${engine} rameses-ii: a short Names list has no See more`, nameMore === 0 && rows > 0 && rows <= 5, `${rows} rows, ${nameMore} controls`);
      await o.ctx.close();
    }
    {
      const o = await visit('/events/cain-and-abel/');
      const count = await o.page.locator('#other-people').count();
      if (!count) check(`${engine} cain-and-abel: page loaded`, o.status === 200);
      else {
        const state = await seeMoreState(o.page, '#other-people');
        const total = state.shown + state.extra;
        const ok = o.status === 200 && (total <= 5 ? state.control === false : state.shown === 5 && state.summary === `See more (${state.extra})` && state.open === false);
        check(`${engine} cain-and-abel: Other people control matches the list length`, ok, JSON.stringify(state));
      }
      await o.ctx.close();
    }
    {
      const hrefsOf = async (path) => {
        const o = await visit(path);
        const hrefs = await o.page.locator('#other-people a').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
        const names = o.status === 200 ? await o.page.locator('#name').innerText() : '';
        return { hrefs, errors: o.errors, status: o.status, names, close: () => o.ctx.close() };
      };
      const jubal = await hrefsOf('/people/jubal/');
      check(`${engine} jubal: Tubal in Cain’s line links to Tubal-cain`, jubal.status === 200 && jubal.errors.length === 0 && jubal.hrefs.includes('/people/tubal-cain/') && !jubal.hrefs.includes('/people/tubal/'), jubal.hrefs.filter((h) => h && h.includes('tubal')).join(','));
      await jubal.close();
      const japheth = await hrefsOf('/people/japheth/');
      check(`${engine} japheth: Tubal links to Japheth’s son`, japheth.status === 200 && japheth.errors.length === 0 && japheth.hrefs.includes('/people/tubal/') && !japheth.hrefs.includes('/people/tubal-cain/'), japheth.hrefs.filter((h) => h && h.includes('tubal')).join(','));
      await japheth.close();
      const naamah = await hrefsOf('/people/naamah/');
      check(`${engine} naamah: Herakles links to Heracles, and Tubal-cain is not Japheth’s Tubal`, naamah.status === 200 && naamah.errors.length === 0 && naamah.hrefs.includes('/people/heracles/') && naamah.hrefs.includes('/people/tubal-cain/') && !naamah.hrefs.includes('/people/tubal/'), naamah.hrefs.filter((h) => h && /tubal|herac/.test(h)).join(','));
      await naamah.close();
      const heracles = await hrefsOf('/people/heracles/');
      const forms = /Herakles/.test(heracles.names) && /Hercules/.test(heracles.names);
      check(`${engine} heracles: Herakles and Hercules are name forms`, heracles.status === 200 && heracles.errors.length === 0 && forms, heracles.names.replace(/\s+/g, ' ').slice(0, 240));
      await heracles.close();
    }
    if (own) await own.close();
  }
  await calculatedUi('chromium', browser);
  await calculatedUi('webkit', webkit);
}
// Conventional dating (Kevin, 2026-11-12): display only. Its dates are absent from the home timeline and shown last,
// in a red block with the note, at the bottom of the dates on person and event pages. Chromium and WebKit.
{
  const chronDoc = JSON.parse(readFileSync(join(here, '../data/chronologies.json'), 'utf8'));
  const conv = (chronDoc.display_groups || []).find((g) => g.id === 'conventional');
  const convIds = new Set(conv?.chronologies || []);
  const NOTE = 'These views are based on conventional dating practices.';
  check('conventional: group exists and holds dynasty-of-slaves', !!conv && convIds.has('dynasty-of-slaves') && conv.note.startsWith(NOTE));
  const recs = {};
  for (const dir of ['people', 'events']) for (const id of ['moses', 'exodus', 'merneptah', 'ramesses-ii', 'abisha']) {
    try { recs[id] = JSON.parse(readFileSync(join(here, `../data/${dir}/${id}.json`), 'utf8')); } catch {}
  }
  const red = (c) => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || ''); return !!m && +m[1] > +m[2] + 60 && +m[1] > +m[3] + 60; };
  for (const [engine, launcher] of [['chromium', browser], ['webkit', null]]) {
    const b = launcher || stubIiif(await webkit.launch());
    const ctxOpen = async (path, scheme = 'light') => {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
      return { ctx, page, errors, status: resp.status() };
    };
    // Home: no item is placed by a conventional date, and no conventional source is named.
    const home = await ctxOpen('/');
    const homeData = await home.page.evaluate(() => ({ items: JSON.parse(document.getElementById('tl-data').textContent), text: document.body.innerText }));
    const items = Array.isArray(homeData.items) ? homeData.items : (homeData.items.items || []);
    const exiled = items.filter((i) => ['merneptah', 'ramesses-ii', 'abisha'].includes(i.id));
    const moved = items.filter((i) => recs[i.id] && i.y != null && !i.standby && i.y !== recs[i.id].sorting_year);
    const named = /BLK SHP Scott|Dynasty of Slaves/.test(`${homeData.text} ${JSON.stringify(items)}`);
    check(`${engine} conventional: home timeline has no conventional date`, home.status === 200 && exiled.length === 0 && moved.length === 0 && !named, JSON.stringify({ exiled: exiled.map((i) => i.id), moved: moved.map((i) => i.id), named }));
    await home.ctx.close();
    for (const [path, scheme] of [['/people/moses/', 'light'], ['/people/moses/', 'dark'], ['/events/exodus/', 'light']]) {
      const o = await ctxOpen(path, scheme);
      const info = await o.page.evaluate(() => {
        const block = document.getElementById('conventional-dating');
        if (!block) return { block: false };
        const cards = [...document.querySelectorAll('main section.card, article section.card')];
        const dateCards = cards.filter((c) => ['birth', 'death', 'translated', 'reign'].includes(c.id) || /^Chronologies$/.test(c.querySelector('h2')?.textContent || ''));
        const after = dateCards.every((c) => c.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING);
        const convRows = block.querySelectorAll('tr[data-author="dynasty-of-slaves"]').length;
        const mainRows = dateCards.reduce((n, c) => n + c.querySelectorAll('tr[data-author="dynasty-of-slaves"]').length, 0);
        const cs = getComputedStyle(block);
        return { block: true, after, convRows, mainRows, note: block.querySelector('.conv-note')?.textContent || '', heading: block.querySelector('h2')?.textContent || '', border: cs.borderLeftColor, borderW: parseFloat(cs.borderLeftWidth), bg: cs.backgroundColor, h2: getComputedStyle(block.querySelector('h2')).color };
      });
      const ok = o.status === 200 && info.block && info.after && info.convRows > 0 && info.mainRows === 0 && info.note.startsWith(NOTE) && /Conventional dating/.test(info.heading) && red(info.border) && info.borderW >= 4 && red(info.h2) && o.errors.length === 0;
      check(`${engine} conventional: ${path} (${scheme}) shows dynasty-of-slaves only in the red block at the bottom of the dates`, ok, JSON.stringify({ status: o.status, ...info, errors: o.errors.slice(0, 3) }));
      await o.ctx.close();
    }
    if (!launcher) await b.close();
  }
}
await browser.close();
srv.close();
console.log(results.join('\n'));
console.log(failed ? '\nVERIFY FAILED' : '\nVERIFY PASSED');
process.exit(failed ? 1 : 0);
