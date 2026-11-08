# Doré thumbnails still to fetch

None. Every plate in `data/illustrations/dore-1866.json` has a local WebP in `site/static/img/dore/thumbs/`.

## Plates that still fail

None.

## What was pending

Recorded on 2026-10-29. On that day the Internet Archive IIIF Image API (iiif.archive.org, v2 and v3) returned HTTP 500 and 504 errors, or timed out, for most scaled requests, so PR #25 shipped local WebP thumbnails for 72 of the 220 plates and left 148 on the pending list (`data/illustrations/dore-thumbs-pending.json`).

On 2026-11-07 those 148 were saved. 122 came from the IIIF Image API at 240 px (v2, then v3 when v2 failed). The 26 plates below returned HTTP 500 from both v2 and v3 at 240 px ("Java heap space" on the IIIF service). Each of those was made from the Archive.org original JPEG on the item `gustavedore`, scaled to 240 px wide and encoded as WebP (quality 70, effort 4), the same encoding `scripts/dore/fetch-thumbs.mjs` writes. The original JPEG was not kept. All 26 succeeded.

| No. | Title |
|---:|---|
| 094 | The Israelites Slaughter the Syrians |
| 099 | A Famine in Samaria |
| 101 | Jehu's Companions Find Jezebel's Remains |
| 103 | Sennacherib's Army is Destroyed |
| 138 | Job Speaks with His Friends |
| 143 | Baruch Writes Down Jeremiah's Prophecies |
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt |
| 164 | Matt 6 The Sermon on the Mount |
| 170 | Matt 21 Jesus Enters Into Jerusalem |
| 175 | Matt 27C The Crucifixion of Jesus and Two Criminals |
| 176 | Matt 28 The Angel and Women at the Empty Tomb |
| 178 | Mark 1B Jesus Preaches in the Synagogue |
| 183 | Mark 12 The Widow's Mite |
| 185 | Mark 15A Jesus is Scourged |
| 186 | Mark 15B Jesus Falls Beneath the Cross |
| 191 | Luke 4A The Temptation of Jesus |
| 195 | Luke 8 Jesus Raises the Daughter of Jairus |
| 205 | Luke 22 An Angel Appears to Jesus in the Garden |
| 208 | Luke 23C Darkness at the Crucifixion |
| 210 | Luke 24B Jesus Ascends to Heaven |
| 212 | John 2 The Wedding at Cana |
| 216 | John 11 The Raising of Lazarus |
| 217 | John 13 The Last Supper |
| 227 | Acts 5 The Death of Ananias |
| 238 | Rev 12 The Virgin is Crowned |
| 241 | Rev 21 The New Jerusalem |

`data/illustrations/dore-thumbs-pending.json` was removed because the list is empty. The validator still allows that file if a later fetch has to defer a plate. A deferred plate has no thumbnail file and no `thumb_width`/`thumb_height`, and its file, title and `details_url` must match the data.
