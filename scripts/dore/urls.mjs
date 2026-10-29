// Gustave Doré, Bible illustrations (1866): Archive.org item "gustavedore".
// Images are never copied into the repo. Pages load them from the Internet Archive
// IIIF Image API (v3), which scales the ~9633 x 12332 originals server-side.
// Each illustration stores display_width and small_width: the 1/8 and 1/16 levels its info.json
// lists in "sizes" (about 1200 and 600 px wide; they differ slightly per file), so the service
// serves a pyramid level, not an arbitrary rescale. Never link the original JPEG for display.
export const DORE_ITEM = 'gustavedore';
export const IIIF_BASE = 'https://iiif.archive.org/image/iiif/3/';
const enc = (file) => encodeURIComponent(file);
export const iiifId = (file) => `${IIIF_BASE}${DORE_ITEM}%2F${enc(file)}`;
export const doreUrls = (file, displayW, smallW) => ({
  display: `${iiifId(file)}/full/${displayW},/0/default.jpg`,
  small: `${iiifId(file)}/full/${smallW},/0/default.jpg`,
  iiif_info: `${iiifId(file)}/info.json`,
  details: `https://archive.org/details/${DORE_ITEM}/${enc(file)}`,
});
