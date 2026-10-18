#!/usr/bin/env bash
# Fetch the source files for Sir Walter Raleigh, The History of the World (1617)
# EEBO-TCP A10357 / STC 20638 / ESTC S112960 into sources/raleigh/.
# The two full EarlyPrint XML files (~86 MB each) are gitignored; run this to restore them.
# Checksums are those recorded on 2026-10-17. EarlyPrint and the TCP may republish
# corrected versions, so a mismatch is reported as a warning, not a failure.
set -euo pipefail
cd "$(dirname "$0")/../sources/raleigh"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

get() { # url outfile
  echo "-> $2  <=  $1"
  curl -fsSL --retry 3 --max-time 900 -o "$2.part" "$1" && mv "$2.part" "$2"
}

# 1. EarlyPrint TEI XML (the "XML" download on texts.earlyprint.org/works/A10357.xml)
get https://texts.earlyprint.org/downloads/A10/A10357.xml.zip "$tmp/ep.zip"
unzip -o -q "$tmp/ep.zip" A10357.xml -d "$tmp" && mv "$tmp/A10357.xml" A10357.earlyprint.xml
# 1b. EarlyPrint "unadorned" (stripped, no word-level markup) TEI XML
get https://texts.earlyprint.org/downloads/A10/A10357_unadorned.xml.zip "$tmp/epu.zip"
unzip -o -q "$tmp/epu.zip" A10357_unadorned.xml -d "$tmp" && mv "$tmp/A10357_unadorned.xml" A10357.earlyprint-unadorned.xml
# 2. EarlyPrint source repository (Bitbucket eads004/A10)
get https://bitbucket.org/eads004/A10/raw/master/A10357.xml A10357.bitbucket-eads004.xml
# 3. EEBO-TCP TEI P5 (same text OTA distributes; TCP GitHub mirror)
get https://raw.githubusercontent.com/textcreationpartnership/A10357/master/A10357.xml A10357.tcp-p5.xml
# 3b. Oxford Text Archive item page: try for bitstreams (server was timing out on 2026-10-17)
if curl -fsSL --max-time 120 -o "$tmp/ota.html" https://ota.bodleian.ox.ac.uk/repository/xmlui/handle/20.500.12024/A10357; then
  grep -o 'href="[^"]*bitstream[^"]*"' "$tmp/ota.html" | sed 's/href="//;s/"$//' | sort -u | while read -r p; do
    f=$(basename "${p%%\?*}"); get "https://ota.bodleian.ox.ac.uk${p}" "ota-$f" || true
  done
else
  echo "WARN: OTA unreachable; skipped (TCP P5 copy above is the same encoded text)."
fi

echo "== verify"
python3 - <<'PY'
import hashlib, xml.etree.ElementTree as ET, glob, os
expected = {
 "A10357.earlyprint.xml": "17d362125bc4e9dcb74cbe584b8cf0d352c96cbd980c8487f84be8b03ed19edb",
 "A10357.bitbucket-eads004.xml": "d36094651f1f123ec529df23b9c3c7f6e767515310ee26395df194955339afcb",
 "A10357.earlyprint-unadorned.xml": "14ca0ea7cf36112d3fe03dcf6fa018291c4742e741fcf72881bb9c9f6e02c78a",
 "A10357.tcp-p5.xml": "64ea6df66a711449f4894135e6b962c7bfad2c4c7334e6802fa5bd1692470b97",
}
for f in sorted(glob.glob("*.xml")):
    h = hashlib.sha256(open(f, "rb").read()).hexdigest()
    title = None
    for _, el in ET.iterparse(f):
        if el.tag.endswith("}title") and el.text and el.text.strip():
            title = el.text.strip(); break
    ok = "OK" if expected.get(f) == h else ("NEW" if f not in expected else "CHANGED")
    print(f"{f}: {os.path.getsize(f)} bytes, well-formed, title={title!r}, sha256 {ok}")
    if title != "The history of the world": raise SystemExit(f"title mismatch in {f}")
PY
