#!/usr/bin/env node
// Person-timeline rendering checks in Chromium AND WebKit (Safari's engine), against the built site or a live URL.
//   node site/verify-timelines.mjs                       # serves site/dist locally
//   node site/verify-timelines.mjs --base https://chronos.kevinamundson.me [--shots]
// Every load uses a fresh browser context (empty cache). For each person page and width it asserts:
//   - no page errors / console errors; every /assets/ URL in the HTML is versioned (?v=hash, cache-busting)
//   - the vis-timeline container is drawn (height > 100px)
//   - rendered point items == own + context from dist/data/person-timelines.json (own and context separately)
//   - every item's dot and label have a non-zero box inside the timeline container, and each label sits
//     just right of its dot (catches dots/labels thrown off-screen by a bad first measurement)
//   - own items solid (opacity 1), context items faded (< 1); legend swatches visible (non-zero box, colour/border)
// Locally it also replays the load with the vis-timeline stylesheet delayed 1.5 s (late-CSS race seen in WebKit).
import { chromium, webkit } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const live = arg('--base');
const SHOTS = process.argv.includes('--shots');
let BASE = live, srv = null;
if (!live) { const { serve } = await import('./serve.mjs'); const port = +process.env.VERIFY_TL_PORT || 8798; srv = await serve(port); BASE = `http://localhost:${port}`; }
const expect = live ? await (await fetch(`${BASE}/data/person-timelines.json`, { cache: 'no-store' })).json()
  : JSON.parse(readFileSync(join(here, 'dist/data/person-timelines.json'), 'utf8'));
const single = Object.keys(expect).find((k) => !expect[k].none && expect[k].own + expect[k].context === 1);
// AD-era people (Generations import) exercise the AD side of the axis (AD y -> axis y-1).
const AD = ['augustine-of-hippo', 'robert-moffat', 'boniface', 'william-carey', 'adoniram-judson'].filter((k) => expect[k] && !expect[k].none);
const PEOPLE = ['joseph', 'abraham', 'noah', 'moses', single, ...AD];
const WIDTHS = [[1024, 900], [1440, 900], [390, 844]];
const results = []; let failed = false;
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); if (!ok) failed = true; };

async function inspect(page) {
  return page.evaluate(() => {
    const tl = document.querySelector('#timeline'); const vt = tl?.querySelector('.vis-timeline');
    const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
    const C = vt ? box(vt) : null;
    const pts = [...(tl?.querySelectorAll('.vis-item.vis-point') || [])].map((i) => {
      const d = box(i.querySelector('.vis-dot')), c = box(i.querySelector('.vis-item-content'));
      const inside = (b) => b.w > 0 && b.h > 0 && b.l >= C.l - 1 && b.r <= C.r + 1 && b.t >= C.t - 1 && b.b <= C.b + 1;
      return { own: i.classList.contains('own'), ctx: i.classList.contains('ctx'), text: i.textContent.trim().slice(0, 40),
        dotIn: inside(d), labelVisible: c.w > 0 && c.h > 0 && c.l < C.r && c.l >= C.l - 1, gap: Math.round(c.l - d.r),
        op: +getComputedStyle(i.querySelector('.vis-item-content')).opacity };
    });
    const sw = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); const b = box(e);
      return { w: b.w, h: b.h, bg: s.backgroundColor, border: s.borderTopStyle + ' ' + s.borderTopWidth }; };
    const unversioned = [...document.querySelectorAll('link[href^="/assets/"], script[src^="/assets/"]')].map((e) => e.getAttribute('href') || e.getAttribute('src')).filter((u) => !/\?v=[0-9a-f]{8,}/.test(u));
    const axis = [...(tl?.querySelectorAll('.vis-time-axis .vis-text.vis-minor:not(.vis-measure)') || [])].map((e) => e.textContent.trim()).filter(Boolean);
    return { axis, h: C?.h || 0, w: C?.w || 0, pts, own: sw('.lg-own'), ctx: sw('.lg-ctx'), unversioned, ready: tl?.getAttribute('data-ready') };
  });
}

for (const [bname, bt] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await bt.launch();
  for (const id of PEOPLE) {
    const ex = expect[id];
    for (const [w, h] of WIDTHS) for (const lateCss of live ? [false] : [false, true]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error' && !/cloudflareinsights|Failed to load resource.*(beacon|tile)/i.test(m.text())) errors.push(m.text()); });
      page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errors.push(`${r.status()} ${r.url()}`); });
      if (lateCss) await page.route('**/vis-timeline-graph2d.min.css*', async (r) => { await new Promise((s) => setTimeout(s, 1500)); r.continue(); });
      const tag = `[${bname} ${w}px${lateCss ? ' late-css' : ''}] /people/${id}/`;
      await page.goto(`${BASE}/people/${id}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#timeline[data-ready]', { timeout: 8000 }).catch(() => {});
      await page.locator('#timeline').scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(300);
      const r = await inspect(page);
      const own = r.pts.filter((p) => p.own), ctxs = r.pts.filter((p) => p.ctx);
      const badPos = r.pts.filter((p) => !p.dotIn || !p.labelVisible || p.gap < -2 || p.gap > 24);
      check(`${tag}: no errors`, errors.length === 0, errors.join(' | '));
      check(`${tag}: assets cache-busted`, r.unversioned.length === 0, r.unversioned.join(', '));
      check(`${tag}: chart drawn (height > 100px)`, r.h > 100, `${Math.round(r.w)}×${Math.round(r.h)}px`);
      check(`${tag}: items == own + context`, own.length === ex.own && ctxs.length === ex.context && r.pts.length === ex.own + ex.context, `own ${own.length}/${ex.own}, context ${ctxs.length}/${ex.context}`);
      check(`${tag}: every item visible inside the chart, label beside its dot`, r.pts.length > 0 && badPos.length === 0, badPos.map((p) => `${p.text} (dotIn ${p.dotIn}, gap ${p.gap})`).join('; '));
      if (ex.window && ex.window[0] > 0) check(`${tag}: AD axis labels (no year 0, no negatives)`, r.axis.length > 0 && r.axis.every((t) => /^AD [1-9]\d*$/.test(t) || /^[A-Z][a-z]{2}$/.test(t)), r.axis.slice(0, 5).join(', '));
      check(`${tag}: own solid, context faded`, own.every((p) => p.op === 1) && ctxs.every((p) => p.op < 1));
      const swOk = (s, ctxSw) => s && s.w > 0 && s.h > 0 && (ctxSw ? /dashed/.test(s.border) : s.bg !== 'rgba(0, 0, 0, 0)');
      check(`${tag}: legend swatches visible`, swOk(r.own, false) && (ex.context === 0 || swOk(r.ctx, true)), JSON.stringify({ own: r.own, ctx: r.ctx }));
      if (SHOTS && id === 'joseph' && bname === 'chromium' && (w === 1440 || w === 390)) {
        const f = join(here, 'screenshots', w > 500 ? 'person-joseph-desktop.png' : 'person-joseph-mobile.png');
        mkdirSync(dirname(f), { recursive: true }); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200); await page.screenshot({ path: f, fullPage: true }); results.push(`SHOT  ${f}`);
      }
      await ctx.close();
    }
  }
  await browser.close();
}
srv?.close?.();
console.log(results.join('\n'));
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length} passed, ${results.filter((r) => r.startsWith('FAIL')).length} failed against ${BASE}`);
console.log(failed ? 'TIMELINE VERIFY FAILED' : 'TIMELINE VERIFY PASSED');
process.exit(failed ? 1 : 0);
