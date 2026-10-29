// Gustave Doré, Bible illustrations (1866): Archive.org item "gustavedore".
// Images are never copied into the repo. Pages load them from the Internet Archive
// IIIF Image API, which scales the ~9600 x 12300 px originals server-side.
// Never link the original JPEG for display (about 60 MB each).
// IIIF v2 is primary. v3 on the same service is the fallback: on 2026-10-29 several
// v3 size requests hung for 60s (HTTP 504) while the same images at v2 returned in ~3s.
export const DORE_ITEM = 'gustavedore';
export const IIIF_V2_BASE = 'https://iiif.archive.org/image/iiif/2/';
export const IIIF_V3_BASE = 'https://iiif.archive.org/image/iiif/3/';
export const IIIF_BASE = IIIF_V2_BASE;
export const DISPLAY_W = 1200;
export const SMALL_W = 600;
export const THUMB_W = 300;
const enc = (file) => encodeURIComponent(file);
const img = (base, file, w) => `${base}${DORE_ITEM}%2F${enc(file)}/full/${w},/0/default.jpg`;
export const doreUrls = (file) => ({
  display: img(IIIF_V2_BASE, file, DISPLAY_W),
  small: img(IIIF_V2_BASE, file, SMALL_W),
  thumb: img(IIIF_V2_BASE, file, THUMB_W),
  display_v3: img(IIIF_V3_BASE, file, DISPLAY_W),
  small_v3: img(IIIF_V3_BASE, file, SMALL_W),
  thumb_v3: img(IIIF_V3_BASE, file, THUMB_W),
  iiif_info: `${IIIF_V2_BASE}${DORE_ITEM}%2F${enc(file)}/info.json`,
  details: `https://archive.org/details/${DORE_ITEM}/${enc(file)}`,
});
