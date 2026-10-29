// Gustave Doré, Bible illustrations (1866): Archive.org item "gustavedore".
// Images are never copied into the repo. Pages load them from the Internet Archive
// IIIF Image API, which scales the ~9600 x 12300 px originals server-side to 1200 and
// 600 px wide. Never link the original JPEG for display (about 60 MB each).
// IIIF v3 is primary. v2 on the same service is the fallback: on 2026-10-29 one v3 size
// request for file 009 timed out (HTTP 504) while the same image at v2 returned in ~3 s.
export const DORE_ITEM = 'gustavedore';
export const IIIF_BASE = 'https://iiif.archive.org/image/iiif/3/';
export const IIIF_V2_BASE = 'https://iiif.archive.org/image/iiif/2/';
export const DISPLAY_W = 1200;
export const SMALL_W = 600;
const enc = (file) => encodeURIComponent(file);
const img = (base, file, w) => `${base}${DORE_ITEM}%2F${enc(file)}/full/${w},/0/default.jpg`;
export const doreUrls = (file) => ({
  display: img(IIIF_BASE, file, DISPLAY_W),
  small: img(IIIF_BASE, file, SMALL_W),
  display_v2: img(IIIF_V2_BASE, file, DISPLAY_W),
  small_v2: img(IIIF_V2_BASE, file, SMALL_W),
  iiif_info: `${IIIF_BASE}${DORE_ITEM}%2F${enc(file)}/info.json`,
  details: `https://archive.org/details/${DORE_ITEM}/${enc(file)}`,
});
