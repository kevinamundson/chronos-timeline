// Verify runs must not depend on the Internet Archive. Archive.org IIIF was returning 500/504 errors
// and 60 s hangs on 2026-10-29, and a hung in-viewport image holds a page's "load" event past the
// 30 s goto timeout. stubIiif() wraps browser.newContext so every context answers IIIF image requests
// with a small local PNG. A test that needs other behaviour (abort, hold) adds its own page.route,
// which Playwright checks before context routes. Set VERIFY_LIVE_IIIF=1 to use the live service.
// 600×2 PNG: a 1px PNG is not enough, because the record image uses a srcset width descriptor and
// the browser density-corrects naturalWidth down to 0.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAlgAAAACCAIAAAALjjUzAAAAHUlEQVR42u3QAQEAAAABIPPNNkRNKAWAY1EAwLMB3xF46s3EUSgAAAAASUVORK5CYII=', 'base64');
export const IIIF_LIVE = process.env.VERIFY_LIVE_IIIF === '1';
export function stubIiif(browser) {
  if (IIIF_LIVE) return browser;
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...args) => {
    const ctx = await newContext(...args);
    await ctx.route('**/image/iiif/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    return ctx;
  };
  return browser;
}
