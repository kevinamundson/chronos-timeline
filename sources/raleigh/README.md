# Sir Walter Raleigh, *The History of the World* (1617)

Primary text for the `raleigh-history-of-the-world` chronology.

- **Edition:** London, 1617. Printed [by William Stansby] for Walter Burre.
- **Identifiers:** EEBO-TCP **A10357** · STC **20638** · ESTC **S112960** (<http://estc.bl.uk/S112960>)
- **TCP header:** "Approx. 7107 KB of XML-encoded text transcribed from 810 1-bit group-IV TIFF page images."
- **Fetched:** 2026-10-17, about 23:30 EDT (UTC-4). Restore or refresh with `scripts/fetch-raleigh.sh`.

## Files

| File | In git | Size (bytes) | SHA-256 | Source URL |
|---|---|---|---|---|
| `A10357.earlyprint.xml` | no (gitignored, >50 MB) | 86,395,381 | `17d362125bc4e9dcb74cbe584b8cf0d352c96cbd980c8487f84be8b03ed19edb` | <https://texts.earlyprint.org/works/A10357.xml> → "XML" download `https://texts.earlyprint.org/downloads/A10/A10357.xml.zip` (11,314,661-byte zip) |
| `A10357.bitbucket-eads004.xml` | no (gitignored, >50 MB) | 86,374,295 | `d36094651f1f123ec529df23b9c3c7f6e767515310ee26395df194955339afcb` | <https://bitbucket.org/eads004/A10/raw/master/A10357.xml> |
| `A10357.earlyprint-unadorned.xml` | yes | 7,406,680 | `14ca0ea7cf36112d3fe03dcf6fa018291c4742e741fcf72881bb9c9f6e02c78a` | `https://texts.earlyprint.org/downloads/A10/A10357_unadorned.xml.zip` (EarlyPrint "stripped" XML, no word-level tags) |
| `A10357.tcp-p5.xml` | yes | 9,896,063 | `64ea6df66a711449f4894135e6b962c7bfad2c4c7334e6802fa5bd1692470b97` | <https://raw.githubusercontent.com/textcreationpartnership/A10357/master/A10357.xml> (EEBO-TCP TEI P5) |

Verification on 2026-10-17: every file parses as well-formed XML, and every file's first `<title>` is "The history of the world" (author "Raleigh, Sir, Walter, 1552?-1618.", edition date 1617).

### Notes on the files
- **EarlyPrint (1) and Bitbucket (2)** are the same linguistically tagged EarlyPrint TEI (about 1.25 million elements, one `<w>` per word, with regularized spellings and lemmas). They differ only in the EarlyPrint header block: the Bitbucket repository copy has filled-in `ep:` metadata (TCP A10357, STC 20638, ESTC S112960, 1,619 pages, 1,220,488 words, 10,812 defective tokens), while the site download has those fields blank.
- **Unadorned** is EarlyPrint's stripped version of (1): the same text and divisions without word-level markup. It is the easiest copy to search, and it's the one used for the date checks below.
- **TCP P5** is the original EEBO-TCP keyboarded text. It's what the Oxford Text Archive distributes.

## Oxford Text Archive (not downloaded)
<https://ota.bodleian.ox.ac.uk/repository/xmlui/handle/20.500.12024/A10357>: on 2026-10-17 the OTA server returned **504 Gateway Time-out** or timed out for the item page, its bitstream, REST and METS endpoints, from both the box and the web fetcher, over about 10 minutes. So the OTA bitstreams (normally TEI P5 XML plus derived formats) were not retrieved. `A10357.tcp-p5.xml` from the TCP's own GitHub repository is the same EEBO-TCP P5 encoding. `scripts/fetch-raleigh.sh` tries OTA again and saves any bitstreams it finds as `ota-*`.

## Licence
- **EarlyPrint (1–3)**, from the `<availability>` statement in each file's header: "To the extent possible under law, the Text Creation Partnership has waived all copyright and related or neighboring rights to this keyboarded and encoded edition of the work described above, according to the terms of the CC0 1.0 Public Domain Dedication (http://creativecommons.org/publicdomain/zero/1.0/). This waiver does not extend to any page images or other supplementary files associated with this work…"
- **TCP P5 (4)**, from its header: "This Phase I text is available for reuse, according to the terms of Creative Commons 0 1.0 Universal. The text can be copied, modified, distributed and performed, even for commercial purposes, all without asking permission."
- **OTA:** the item page couldn't be reached to confirm its stated licence. OTA's EEBO-TCP Phase I items are normally listed as CC0 as well.
- The underlying 1617 work is public domain by age. Page images (EEBO/ProQuest) are **not** covered and are not included.

## Use in the data
- `data/sources.json` → `raleigh-history-of-the-world-1617` (primary text). `raleigh-history-of-the-world-1736` (Internet Archive, 11th ed.) is kept as the secondary reading copy.
- Dates have **not** been re-extracted from this text yet. The existing `raleigh-history-of-the-world` anchors still cite the 1736 edition.
