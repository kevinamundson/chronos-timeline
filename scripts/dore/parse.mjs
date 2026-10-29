// Archive.org file names for the item "gustavedore" start with a three-digit
// number, an optional "x" (the uploader's mark for the Apocrypha), and a space.
// The title is the rest, without the .jpg extension.
// Examples: "001 The Creation of Light.jpg", "117x Tobias and the Angel.jpg".
const FILE_RE = /^(\d{3})(x?) (.+)\.jpg$/;

export function parseDoreFileName(name) {
  const m = FILE_RE.exec(String(name || ''));
  if (!m) return null;
  return { number: Number(m[1]), suffix: m[2], title: m[3] };
}
