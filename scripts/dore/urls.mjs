// Gustave Doré, Bible illustrations (1866): Archive.org item "gustavedore".
// Full-size display images are never copied. Pages load them from the Internet Archive
// IIIF Image API, which scales the ~9600 x 12300 px originals server-side.
// Never link the original JPEG for display (about 60 MB each).
// IIIF v2 is primary. v3 on the same service is the fallback: on 2026-10-29 several
// v3 size requests hung for 60s (HTTP 504) while the same images at v2 returned in ~3s.
// Local thumbnails (about 240 px WebP) live in site/static/img/dore/thumbs/ and are
// produced by scripts/dore/fetch-thumbs.mjs. Apocrypha files (an x after the number) are not fetched.
export const DORE_ITEM = 'gustavedore';
export const IIIF_V2_BASE = 'https://iiif.archive.org/image/iiif/2/';
export const IIIF_V3_BASE = 'https://iiif.archive.org/image/iiif/3/';
export const IIIF_BASE = IIIF_V2_BASE;
export const DISPLAY_W = 1200;
export const SMALL_W = 600;
export const THUMB_W = 300;
export const LOCAL_THUMB_W = 240;
export const DORE_THUMB_DIR = 'site/static/img/dore/thumbs';
const enc = (file) => encodeURIComponent(file);
const img = (base, file, w) => `${base}${DORE_ITEM}%2F${enc(file)}/full/${w},/0/default.jpg`;
export const iiifScaled = (file, width, version = 2) => img(version === 3 ? IIIF_V3_BASE : IIIF_V2_BASE, file, width);
export const doreThumbName = (number) => `${String(number).padStart(3, '0')}.webp`;
export const doreThumbPublicPath = (number) => `/img/dore/thumbs/${doreThumbName(number)}`;
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
