# Doré thumbnails still to fetch

Recorded on 2026-10-29. On 2026-10-29 the Internet Archive IIIF Image API (iiif.archive.org, v2 and v3) returned HTTP 500 and 504 errors, or timed out, for most scaled requests of these plates, so their thumbnails could not be made.

PR #25 shipped local WebP thumbnails for 72 of the 220 plates. The 148 plates below have none yet. They are listed, with the same fields, in [`data/illustrations/dore-thumbs-pending.json`](../data/illustrations/dore-thumbs-pending.json), and the validator allows a plate to lack a thumbnail only if it is on that list.

Until then these plates still show on the site. Record pages keep the reserved image box and the spinner (no visible text) until the Archive.org IIIF image loads, then the existing fallback link to Archive.org if it fails. Gallery dots are plain dots. The index page loads a small (300 px) IIIF image, v2 then v3; if both fail, the box stays with the file number and an Archive.org link.

## How to finish

1. When Archive.org IIIF answers again, run `npm run dore:thumbs`. It fetches only the missing thumbnails and skips the files already saved. Re-run it until it reports no failures.
2. Once a run has no failures, the script writes `thumb_width`/`thumb_height` for every plate into `data/illustrations/dore-1866.json`. Remove each fetched plate from `data/illustrations/dore-thumbs-pending.json` (and update its `count`) and from the table below.
3. When every plate has a thumbnail, delete `data/illustrations/dore-thumbs-pending.json` and this file, then drop the pending-list allowance in `scripts/validate.mjs` (and the fallback branches in `site/build.mjs` and `site/verify.mjs` if wanted), so that every plate must have a thumbnail again.
4. Run `npm run validate`, `npm run build` and `npm run verify`.

## Plates (148)

| No. | Title | Archive.org file |
|---:|---|---|
| 011 | Abraham Goes to the Land of Canaan | [011 Abraham Goes to the Land of Canaan.jpg](https://archive.org/details/gustavedore/011%20Abraham%20Goes%20to%20the%20Land%20of%20Canaan.jpg) |
| 025 | Jacob and Esau Meet | [025 Jacob and Esau Meet.jpg](https://archive.org/details/gustavedore/025%20Jacob%20and%20Esau%20Meet.jpg) |
| 026 | Joseph is Sold by His Brothers | [026 Joseph is Sold by His Brothers.jpg](https://archive.org/details/gustavedore/026%20Joseph%20is%20Sold%20by%20His%20Brothers.jpg) |
| 028 | Joseph Reveals Himself to His Brothers | [028 Joseph Reveals Himself to His Brothers.jpg](https://archive.org/details/gustavedore/028%20Joseph%20Reveals%20Himself%20to%20His%20Brothers.jpg) |
| 029 | Jacob Goes to Egypt | [029 Jacob Goes to Egypt.jpg](https://archive.org/details/gustavedore/029%20Jacob%20Goes%20to%20Egypt.jpg) |
| 033 | The Fifth Plague - Livestock Disease | [033 The Fifth Plague - Livestock Disease.jpg](https://archive.org/details/gustavedore/033%20The%20Fifth%20Plague%20-%20Livestock%20Disease.jpg) |
| 034 | The Ninth Plague - Darkness | [034 The Ninth Plague - Darkness.jpg](https://archive.org/details/gustavedore/034%20The%20Ninth%20Plague%20-%20Darkness.jpg) |
| 038 | Moses Strikes the Rock at Horeb | [038 Moses Strikes the Rock at Horeb.jpg](https://archive.org/details/gustavedore/038%20Moses%20Strikes%20the%20Rock%20at%20Horeb.jpg) |
| 045 | An Angel Appears to Balaam | [045 An Angel Appears to Balaam.jpg](https://archive.org/details/gustavedore/045%20An%20Angel%20Appears%20to%20Balaam.jpg) |
| 055 | Deborah Praises Jael | [055 Deborah Praises Jael.jpg](https://archive.org/details/gustavedore/055%20Deborah%20Praises%20Jael.jpg) |
| 061 | Israelite Women Mourn with Jephthah’s Daughter | [061 Israelite Women Mourn with Jephthah’s Daughter.jpg](https://archive.org/details/gustavedore/061%20Israelite%20Women%20Mourn%20with%20Jephthah%E2%80%99s%20Daughter.jpg) |
| 062 | Samson Slays a Lion | [062 Samson Slays a Lion.jpg](https://archive.org/details/gustavedore/062%20Samson%20Slays%20a%20Lion.jpg) |
| 064 | Samson Carries away the Gates of Gaza | [064 Samson Carries away the Gates of Gaza.jpg](https://archive.org/details/gustavedore/064%20Samson%20Carries%20away%20the%20Gates%20of%20Gaza.jpg) |
| 065 | Samson and Delilah | [065 Samson and Delilah.jpg](https://archive.org/details/gustavedore/065%20Samson%20and%20Delilah.jpg) |
| 076 | Saul Attempts to Kill David | [076 Saul Attempts to Kill David.jpg](https://archive.org/details/gustavedore/076%20Saul%20Attempts%20to%20Kill%20David.jpg) |
| 083 | David Attacks the Ammonites | [083 David Attacks the Ammonites.jpg](https://archive.org/details/gustavedore/083%20David%20Attacks%20the%20Ammonites.jpg) |
| 087 | Abishai Saves David’s Life | [087 Abishai Saves David’s Life.jpg](https://archive.org/details/gustavedore/087%20Abishai%20Saves%20David%E2%80%99s%20Life.jpg) |
| 090 | The Disobedient Prophet is Slain by a Lion | [090 The Disobedient Prophet is Slain by a Lion.jpg](https://archive.org/details/gustavedore/090%20The%20Disobedient%20Prophet%20is%20Slain%20by%20a%20Lion.jpg) |
| 091 | Elijah Raises the Son of the Widow of Zarephath | [091 Elijah Raises the Son of the Widow of Zarephath.jpg](https://archive.org/details/gustavedore/091%20Elijah%20Raises%20the%20Son%20of%20the%20Widow%20of%20Zarephath.jpg) |
| 092 | The Prophets of Baal are Slaughtered | [092 The Prophets of Baal are Slaughtered.jpg](https://archive.org/details/gustavedore/092%20The%20Prophets%20of%20Baal%20are%20Slaughtered.jpg) |
| 093 | Elijah is Nourished by an Angel | [093 Elijah is Nourished by an Angel.jpg](https://archive.org/details/gustavedore/093%20Elijah%20is%20Nourished%20by%20an%20Angel.jpg) |
| 094 | The Israelites Slaughter the Syrians | [094 The Israelites Slaughter the Syrians.jpg](https://archive.org/details/gustavedore/094%20The%20Israelites%20Slaughter%20the%20Syrians.jpg) |
| 095 | The Death of Ahab | [095 The Death of Ahab.jpg](https://archive.org/details/gustavedore/095%20The%20Death%20of%20Ahab.jpg) |
| 096 | Elijah Destroys the Messengers of Ahaziah | [096 Elijah Destroys the Messengers of Ahaziah.jpg](https://archive.org/details/gustavedore/096%20Elijah%20Destroys%20the%20Messengers%20of%20Ahaziah.jpg) |
| 097 | Elijah Ascends to Heaven in a Chariot of Fire | [097 Elijah Ascends to Heaven in a Chariot of Fire.jpg](https://archive.org/details/gustavedore/097%20Elijah%20Ascends%20to%20Heaven%20in%20a%20Chariot%20of%20Fire.jpg) |
| 098 | Some Children are Destroyed by Bears | [098 Some Children are Destroyed by Bears.jpg](https://archive.org/details/gustavedore/098%20Some%20Children%20are%20Destroyed%20by%20Bears.jpg) |
| 099 | A Famine in Samaria | [099 A Famine in Samaria.jpg](https://archive.org/details/gustavedore/099%20A%20Famine%20in%20Samaria.jpg) |
| 100 | The Death of Jezebel | [100 The Death of Jezebel.jpg](https://archive.org/details/gustavedore/100%20The%20Death%20of%20Jezebel.jpg) |
| 101 | Jehu's Companions Find Jezebel's Remains | [101 Jehu's Companions Find Jezebel's Remains.jpg](https://archive.org/details/gustavedore/101%20Jehu's%20Companions%20Find%20Jezebel's%20Remains.jpg) |
| 102 | Foreign Nations are Slain by Lions in Samaria | [102 Foreign Nations are Slain by Lions in Samaria.jpg](https://archive.org/details/gustavedore/102%20Foreign%20Nations%20are%20Slain%20by%20Lions%20in%20Samaria.jpg) |
| 103 | Sennacherib's Army is Destroyed | [103 Sennacherib's Army is Destroyed.jpg](https://archive.org/details/gustavedore/103%20Sennacherib's%20Army%20is%20Destroyed.jpg) |
| 104 | Zedekiah's Sons are Slaughtered Before His Eyes | [104 Zedekiah's Sons are Slaughtered Before His Eyes.jpg](https://archive.org/details/gustavedore/104%20Zedekiah's%20Sons%20are%20Slaughtered%20Before%20His%20Eyes.jpg) |
| 105 | Jabesh-Gileadites Recover the Bodies of Saul and His Sons | [105 Jabesh-Gileadites Recover the Bodies of Saul and His Sons.jpg](https://archive.org/details/gustavedore/105%20Jabesh-Gileadites%20Recover%20the%20Bodies%20of%20Saul%20and%20His%20Sons.jpg) |
| 106 | The Plague of Jerusalem | [106 The Plague of Jerusalem.jpg](https://archive.org/details/gustavedore/106%20The%20Plague%20of%20Jerusalem.jpg) |
| 107 | Solomon Receives the Queen of Sheba | [107 Solomon Receives the Queen of Sheba.jpg](https://archive.org/details/gustavedore/107%20Solomon%20Receives%20the%20Queen%20of%20Sheba.jpg) |
| 108 | King Solomon in Old Age | [108 King Solomon in Old Age.jpg](https://archive.org/details/gustavedore/108%20King%20Solomon%20in%20Old%20Age.jpg) |
| 109 | The Ammonite and Moabite Armies are Destroyed | [109 The Ammonite and Moabite Armies are Destroyed.jpg](https://archive.org/details/gustavedore/109%20The%20Ammonite%20and%20Moabite%20Armies%20are%20Destroyed.jpg) |
| 110 | The Death of Athaliah | [110 The Death of Athaliah.jpg](https://archive.org/details/gustavedore/110%20The%20Death%20of%20Athaliah.jpg) |
| 111 | Cyrus Restores the Vessels of the Temple | [111 Cyrus Restores the Vessels of the Temple.jpg](https://archive.org/details/gustavedore/111%20Cyrus%20Restores%20the%20Vessels%20of%20the%20Temple.jpg) |
| 112 | The Rebuilding of the Temple is Begun | [112 The Rebuilding of the Temple is Begun.jpg](https://archive.org/details/gustavedore/112%20The%20Rebuilding%20of%20the%20Temple%20is%20Begun.jpg) |
| 113 | Artaxerxes Grants Freedom to the Jews | [113 Artaxerxes Grants Freedom to the Jews.jpg](https://archive.org/details/gustavedore/113%20Artaxerxes%20Grants%20Freedom%20to%20the%20Jews.jpg) |
| 114 | Ezra Kneels in Prayer | [114 Ezra Kneels in Prayer.jpg](https://archive.org/details/gustavedore/114%20Ezra%20Kneels%20in%20Prayer.jpg) |
| 115 | Nehemiah Views the Ruins of Jerusalem's Walls | [115 Nehemiah Views the Ruins of Jerusalem's Walls.jpg](https://archive.org/details/gustavedore/115%20Nehemiah%20Views%20the%20Ruins%20of%20Jerusalem's%20Walls.jpg) |
| 116 | Ezra Reads the Law to the People | [116 Ezra Reads the Law to the People.jpg](https://archive.org/details/gustavedore/116%20Ezra%20Reads%20the%20Law%20to%20the%20People.jpg) |
| 121 | Queen Vashti Refuses to Obey Ahasuerus' Command | [121 Queen Vashti Refuses to Obey Ahasuerus' Command.jpg](https://archive.org/details/gustavedore/121%20Queen%20Vashti%20Refuses%20to%20Obey%20Ahasuerus'%20Command.jpg) |
| 122 | The Triumph of Mordecai | [122 The Triumph of Mordecai.jpg](https://archive.org/details/gustavedore/122%20The%20Triumph%20of%20Mordecai.jpg) |
| 123 | Esther Accuses Haman | [123 Esther Accuses Haman.jpg](https://archive.org/details/gustavedore/123%20Esther%20Accuses%20Haman.jpg) |
| 137 | Job Hears of His Misfortunes | [137 Job Hears of His Misfortunes.jpg](https://archive.org/details/gustavedore/137%20Job%20Hears%20of%20His%20Misfortunes.jpg) |
| 138 | Job Speaks with His Friends | [138 Job Speaks with His Friends.jpg](https://archive.org/details/gustavedore/138%20Job%20Speaks%20with%20His%20Friends.jpg) |
| 139 | The Prophet Isaiah | [139 The Prophet Isaiah.jpg](https://archive.org/details/gustavedore/139%20The%20Prophet%20Isaiah.jpg) |
| 140 | Isaiah's Vision of the Destruction of Babylon | [140 Isaiah's Vision of the Destruction of Babylon.jpg](https://archive.org/details/gustavedore/140%20Isaiah's%20Vision%20of%20the%20Destruction%20of%20Babylon.jpg) |
| 141 | The Destruction of Leviathan | [141 The Destruction of Leviathan.jpg](https://archive.org/details/gustavedore/141%20The%20Destruction%20of%20Leviathan.jpg) |
| 142 | The Prophet Jeremiah | [142 The Prophet Jeremiah.jpg](https://archive.org/details/gustavedore/142%20The%20Prophet%20Jeremiah.jpg) |
| 143 | Baruch Writes Down Jeremiah's Prophecies | [143 Baruch Writes Down Jeremiah's Prophecies.jpg](https://archive.org/details/gustavedore/143%20Baruch%20Writes%20Down%20Jeremiah's%20Prophecies.jpg) |
| 144 | People Mourn over the Destruction of Jerusalem | [144 People Mourn over the Destruction of Jerusalem.jpg](https://archive.org/details/gustavedore/144%20People%20Mourn%20over%20the%20Destruction%20of%20Jerusalem.jpg) |
| 146 | The Prophet Ezekiel | [146 The Prophet Ezekiel.jpg](https://archive.org/details/gustavedore/146%20The%20Prophet%20Ezekiel.jpg) |
| 147 | Ezekiel's Vision of the Valley of Dry Bones | [147 Ezekiel's Vision of the Valley of Dry Bones.jpg](https://archive.org/details/gustavedore/147%20Ezekiel's%20Vision%20of%20the%20Valley%20of%20Dry%20Bones.jpg) |
| 148 | Daniel Among the Exiles | [148 Daniel Among the Exiles.jpg](https://archive.org/details/gustavedore/148%20Daniel%20Among%20the%20Exiles.jpg) |
| 149 | Shadrach, Meshach, and Abed-nego in the Furnace | [149 Shadrach, Meshach, and Abed-nego in the Furnace.jpg](https://archive.org/details/gustavedore/149%20Shadrach%2C%20Meshach%2C%20and%20Abed-nego%20in%20the%20Furnace.jpg) |
| 150 | Daniel Interprets the Writing on the Wall | [150 Daniel Interprets the Writing on the Wall.jpg](https://archive.org/details/gustavedore/150%20Daniel%20Interprets%20the%20Writing%20on%20the%20Wall.jpg) |
| 151 | Daniel in the Lion's Den | [151 Daniel in the Lion's Den.jpg](https://archive.org/details/gustavedore/151%20Daniel%20in%20the%20Lion's%20Den.jpg) |
| 152 | Daniel's Vision of the Four Beasts | [152 Daniel's Vision of the Four Beasts.jpg](https://archive.org/details/gustavedore/152%20Daniel's%20Vision%20of%20the%20Four%20Beasts.jpg) |
| 156 | The Prophet Amos | [156 The Prophet Amos.jpg](https://archive.org/details/gustavedore/156%20The%20Prophet%20Amos.jpg) |
| 157 | Jonah is Spewed Forth by the Whale | [157 Jonah is Spewed Forth by the Whale.jpg](https://archive.org/details/gustavedore/157%20Jonah%20is%20Spewed%20Forth%20by%20the%20Whale.jpg) |
| 158 | Jonah Preaches to the Ninevites | [158 Jonah Preaches to the Ninevites.jpg](https://archive.org/details/gustavedore/158%20Jonah%20Preaches%20to%20the%20Ninevites.jpg) |
| 159 | Micah Exhorts the Israelites to Repent | [159 Micah Exhorts the Israelites to Repent.jpg](https://archive.org/details/gustavedore/159%20Micah%20Exhorts%20the%20Israelites%20to%20Repent.jpg) |
| 160 | Zechariah's Vision of Four Chariots | [160 Zechariah's Vision of Four Chariots.jpg](https://archive.org/details/gustavedore/160%20Zechariah's%20Vision%20of%20Four%20Chariots.jpg) |
| 161 | Matt 2A Wise Men Are Guided by a Star | [161 Matt 2A Wise Men Are Guided by a Star.jpg](https://archive.org/details/gustavedore/161%20Matt%202A%20Wise%20Men%20Are%20Guided%20by%20a%20Star.jpg) |
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt | [162 Matt 2B Joseph Leads Mary and Jesus into Egypt.jpg](https://archive.org/details/gustavedore/162%20Matt%202B%20Joseph%20Leads%20Mary%20and%20Jesus%20into%20Egypt.jpg) |
| 163 | Matt 2C The Children of Bethlehem are Massacred | [163 Matt 2C The Children of Bethlehem are Massacred.jpg](https://archive.org/details/gustavedore/163%20Matt%202C%20The%20Children%20of%20Bethlehem%20are%20Massacred.jpg) |
| 164 | Matt 6 The Sermon on the Mount | [164 Matt 6 The Sermon on the Mount.jpg](https://archive.org/details/gustavedore/164%20Matt%206%20The%20Sermon%20on%20the%20Mount.jpg) |
| 165 | Matt 12 Jesus Heals a Paralytic | [165 Matt 12 Jesus Heals a Paralytic.jpg](https://archive.org/details/gustavedore/165%20Matt%2012%20Jesus%20Heals%20a%20Paralytic.jpg) |
| 166 | Matt 14A Herod's Daughter Receives the Head of John the Baptist | [166 Matt 14A Herod's Daughter Receives the Head of John the Baptist.jpg](https://archive.org/details/gustavedore/166%20Matt%2014A%20Herod's%20Daughter%20Receives%20the%20Head%20of%20John%20the%20Baptist.jpg) |
| 167 | Matt 14B Jesus Feeds the Multitudes | [167 Matt 14B Jesus Feeds the Multitudes.jpg](https://archive.org/details/gustavedore/167%20Matt%2014B%20Jesus%20Feeds%20the%20Multitudes.jpg) |
| 168 | Matt 15 Jesus Heals the Sick | [168 Matt 15 Jesus Heals the Sick.jpg](https://archive.org/details/gustavedore/168%20Matt%2015%20Jesus%20Heals%20the%20Sick.jpg) |
| 169 | Matt 17 Jesus Heals the Epilectic Demoniac | [169 Matt 17 Jesus Heals the Epilectic Demoniac.jpg](https://archive.org/details/gustavedore/169%20Matt%2017%20Jesus%20Heals%20the%20Epilectic%20Demoniac.jpg) |
| 170 | Matt 21 Jesus Enters Into Jerusalem | [170 Matt 21 Jesus Enters Into Jerusalem.jpg](https://archive.org/details/gustavedore/170%20Matt%2021%20Jesus%20Enters%20Into%20Jerusalem.jpg) |
| 171 | Matt 22 Jesus Replies About the Tribute Money | [171 Matt 22 Jesus Replies About the Tribute Money.jpg](https://archive.org/details/gustavedore/171%20Matt%2022%20Jesus%20Replies%20About%20the%20Tribute%20Money.jpg) |
| 172 | Matt 26 Jesus Prays in the Garden | [172 Matt 26 Jesus Prays in the Garden.jpg](https://archive.org/details/gustavedore/172%20Matt%2026%20Jesus%20Prays%20in%20the%20Garden.jpg) |
| 173 | Matt 27A Jesus is Crowned with Thorns | [173 Matt 27A Jesus is Crowned with Thorns.jpg](https://archive.org/details/gustavedore/173%20Matt%2027A%20Jesus%20is%20Crowned%20with%20Thorns.jpg) |
| 174 | Matt 27B Jesus is Mocked | [174 Matt 27B Jesus is Mocked.jpg](https://archive.org/details/gustavedore/174%20Matt%2027B%20Jesus%20is%20Mocked.jpg) |
| 175 | Matt 27C The Crucifixion of Jesus and Two Criminals | [175 Matt 27C The Crucifixion of Jesus and Two Criminals.jpg](https://archive.org/details/gustavedore/175%20Matt%2027C%20The%20Crucifixion%20of%20Jesus%20and%20Two%20Criminals.jpg) |
| 176 | Matt 28 The Angel and Women at the Empty Tomb | [176 Matt 28 The Angel and Women at the Empty Tomb.jpg](https://archive.org/details/gustavedore/176%20Matt%2028%20The%20Angel%20and%20Women%20at%20the%20Empty%20Tomb.jpg) |
| 177 | Mark 1A John the Baptist Preaches in the Wilderness | [177 Mark 1A John the Baptist Preaches in the Wilderness.jpg](https://archive.org/details/gustavedore/177%20Mark%201A%20John%20the%20Baptist%20Preaches%20in%20the%20Wilderness.jpg) |
| 178 | Mark 1B Jesus Preaches in the Synagogue | [178 Mark 1B Jesus Preaches in the Synagogue.jpg](https://archive.org/details/gustavedore/178%20Mark%201B%20Jesus%20Preaches%20in%20the%20Synagogue.jpg) |
| 179 | Mark 2 The Disciples Pluck Grain on the Sabbath | [179 Mark 2 The Disciples Pluck Grain on the Sabbath.jpg](https://archive.org/details/gustavedore/179%20Mark%202%20The%20Disciples%20Pluck%20Grain%20on%20the%20Sabbath.jpg) |
| 180 | Mark 4 Jesus Calms the Storm at Sea | [180 Mark 4 Jesus Calms the Storm at Sea.jpg](https://archive.org/details/gustavedore/180%20Mark%204%20Jesus%20Calms%20the%20Storm%20at%20Sea.jpg) |
| 181 | Mark 9 The Transfiguration | [181 Mark 9 The Transfiguration.jpg](https://archive.org/details/gustavedore/181%20Mark%209%20The%20Transfiguration.jpg) |
| 182 | Mark 10 Jesus Blesses the Little Children | [182 Mark 10 Jesus Blesses the Little Children.jpg](https://archive.org/details/gustavedore/182%20Mark%2010%20Jesus%20Blesses%20the%20Little%20Children.jpg) |
| 183 | Mark 12 The Widow's Mite | [183 Mark 12 The Widow's Mite.jpg](https://archive.org/details/gustavedore/183%20Mark%2012%20The%20Widow's%20Mite.jpg) |
| 184 | Mark 14 Judas Betrays Jesus | [184 Mark 14 Judas Betrays Jesus.jpg](https://archive.org/details/gustavedore/184%20Mark%2014%20Judas%20Betrays%20Jesus.jpg) |
| 185 | Mark 15A Jesus is Scourged | [185 Mark 15A Jesus is Scourged.jpg](https://archive.org/details/gustavedore/185%20Mark%2015A%20Jesus%20is%20Scourged.jpg) |
| 186 | Mark 15B Jesus Falls Beneath the Cross | [186 Mark 15B Jesus Falls Beneath the Cross.jpg](https://archive.org/details/gustavedore/186%20Mark%2015B%20Jesus%20Falls%20Beneath%20the%20Cross.jpg) |
| 187 | Mark 15C Jesus' Body is Removed from the Cross | [187 Mark 15C Jesus' Body is Removed from the Cross.jpg](https://archive.org/details/gustavedore/187%20Mark%2015C%20Jesus'%20Body%20is%20Removed%20from%20the%20Cross.jpg) |
| 188 | Luke 1 - The Annunciation | [188 Luke 1 - The Annunciation.jpg](https://archive.org/details/gustavedore/188%20Luke%201%20-%20The%20Annunciation.jpg) |
| 189 | Luke 2A The Birth of Jesus | [189 Luke 2A The Birth of Jesus.jpg](https://archive.org/details/gustavedore/189%20Luke%202A%20The%20Birth%20of%20Jesus.jpg) |
| 190 | Luke 2B Jesus Questions the Doctors | [190 Luke 2B Jesus Questions the Doctors.jpg](https://archive.org/details/gustavedore/190%20Luke%202B%20Jesus%20Questions%20the%20Doctors.jpg) |
| 191 | Luke 4A The Temptation of Jesus | [191 Luke 4A The Temptation of Jesus.jpg](https://archive.org/details/gustavedore/191%20Luke%204A%20The%20Temptation%20of%20Jesus.jpg) |
| 192 | Luke 4B Jesus Heals a Demoniac | [192 Luke 4B Jesus Heals a Demoniac.jpg](https://archive.org/details/gustavedore/192%20Luke%204B%20Jesus%20Heals%20a%20Demoniac.jpg) |
| 193 | Luke 5 Jesus Preaches at the Sea of Galilee | [193 Luke 5 Jesus Preaches at the Sea of Galilee.jpg](https://archive.org/details/gustavedore/193%20Luke%205%20Jesus%20Preaches%20at%20the%20Sea%20of%20Galilee.jpg) |
| 194 | Luke 7 A Sinful Woman Repents | [194 Luke 7 A Sinful Woman Repents.jpg](https://archive.org/details/gustavedore/194%20Luke%207%20A%20Sinful%20Woman%20Repents.jpg) |
| 195 | Luke 8 Jesus Raises the Daughter of Jairus | [195 Luke 8 Jesus Raises the Daughter of Jairus.jpg](https://archive.org/details/gustavedore/195%20Luke%208%20Jesus%20Raises%20the%20Daughter%20of%20Jairus.jpg) |
| 196 | Luke 10A The Parable of the Good Samaritan | [196 Luke 10A The Parable of the Good Samaritan.jpg](https://archive.org/details/gustavedore/196%20Luke%2010A%20The%20Parable%20of%20the%20Good%20Samaritan.jpg) |
| 197 | Luke 10B The Good Samaritan Arrives at the Inn | [197 Luke 10B The Good Samaritan Arrives at the Inn.jpg](https://archive.org/details/gustavedore/197%20Luke%2010B%20The%20Good%20Samaritan%20Arrives%20at%20the%20Inn.jpg) |
| 198 | Luke 10C Jesus at the House of Martha and Mary | [198 Luke 10C Jesus at the House of Martha and Mary.jpg](https://archive.org/details/gustavedore/198%20Luke%2010C%20Jesus%20at%20the%20House%20of%20Martha%20and%20Mary.jpg) |
| 199 | Luke 12 Jesus Preaches to the Multitude | [199 Luke 12 Jesus Preaches to the Multitude.jpg](https://archive.org/details/gustavedore/199%20Luke%2012%20Jesus%20Preaches%20to%20the%20Multitude.jpg) |
| 200 | Luke 15A The Prodigal Son Returns Home | [200 Luke 15A The Prodigal Son Returns Home.jpg](https://archive.org/details/gustavedore/200%20Luke%2015A%20The%20Prodigal%20Son%20Returns%20Home.jpg) |
| 201 | Luke 15B The Prodigal Son in His Father's Arms | [201 Luke 15B The Prodigal Son in His Father's Arms.jpg](https://archive.org/details/gustavedore/201%20Luke%2015B%20The%20Prodigal%20Son%20in%20His%20Father's%20Arms.jpg) |
| 202 | Luke 16 Lazarus Outside the Rich Man's House | [202 Luke 16 Lazarus Outside the Rich Man's House.jpg](https://archive.org/details/gustavedore/202%20Luke%2016%20Lazarus%20Outside%20the%20Rich%20Man's%20House.jpg) |
| 203 | Luke 18 The Pharisee and the Publican | [203 Luke 18 The Pharisee and the Publican.jpg](https://archive.org/details/gustavedore/203%20Luke%2018%20The%20Pharisee%20and%20the%20Publican.jpg) |
| 204 | Luke 19 Buyers and Sellers Are Driven Out of the Temple | [204 Luke 19 Buyers and Sellers Are Driven Out of the Temple.jpg](https://archive.org/details/gustavedore/204%20Luke%2019%20Buyers%20and%20Sellers%20Are%20Driven%20Out%20of%20the%20Temple.jpg) |
| 205 | Luke 22 An Angel Appears to Jesus in the Garden | [205 Luke 22 An Angel Appears to Jesus in the Garden.jpg](https://archive.org/details/gustavedore/205%20Luke%2022%20An%20Angel%20Appears%20to%20Jesus%20in%20the%20Garden.jpg) |
| 206 | Luke 23A Jesus Arrives at Calvary | [206 Luke 23A Jesus Arrives at Calvary.jpg](https://archive.org/details/gustavedore/206%20Luke%2023A%20Jesus%20Arrives%20at%20Calvary.jpg) |
| 207 | Luke 23B The Cross is Lifted Up | [207 Luke 23B The Cross is Lifted Up.jpg](https://archive.org/details/gustavedore/207%20Luke%2023B%20The%20Cross%20is%20Lifted%20Up.jpg) |
| 208 | Luke 23C Darkness at the Crucifixion | [208 Luke 23C Darkness at the Crucifixion.jpg](https://archive.org/details/gustavedore/208%20Luke%2023C%20Darkness%20at%20the%20Crucifixion.jpg) |
| 209 | Luke 24A Jesus and Two Disciples Go to Emmaus | [209 Luke 24A Jesus and Two Disciples Go to Emmaus.jpg](https://archive.org/details/gustavedore/209%20Luke%2024A%20Jesus%20and%20Two%20Disciples%20Go%20to%20Emmaus.jpg) |
| 210 | Luke 24B Jesus Ascends to Heaven | [210 Luke 24B Jesus Ascends to Heaven.jpg](https://archive.org/details/gustavedore/210%20Luke%2024B%20Jesus%20Ascends%20to%20Heaven.jpg) |
| 211 | John 1 The Baptism of Jesus | [211 John 1 The Baptism of Jesus.jpg](https://archive.org/details/gustavedore/211%20John%201%20The%20Baptism%20of%20Jesus.jpg) |
| 212 | John 2 The Wedding at Cana | [212 John 2 The Wedding at Cana.jpg](https://archive.org/details/gustavedore/212%20John%202%20The%20Wedding%20at%20Cana.jpg) |
| 213 | John 4 Jesus and the Woman of Samaria | [213 John 4 Jesus and the Woman of Samaria.jpg](https://archive.org/details/gustavedore/213%20John%204%20Jesus%20and%20the%20Woman%20of%20Samaria.jpg) |
| 214 | John 6 Jesus Walks on the Sea | [214 John 6 Jesus Walks on the Sea.jpg](https://archive.org/details/gustavedore/214%20John%206%20Jesus%20Walks%20on%20the%20Sea.jpg) |
| 215 | John 8 Jesus and the Woman Taken in Adultery | [215 John 8 Jesus and the Woman Taken in Adultery.jpg](https://archive.org/details/gustavedore/215%20John%208%20Jesus%20and%20the%20Woman%20Taken%20in%20Adultery.jpg) |
| 216 | John 11 The Raising of Lazarus | [216 John 11 The Raising of Lazarus.jpg](https://archive.org/details/gustavedore/216%20John%2011%20The%20Raising%20of%20Lazarus.jpg) |
| 217 | John 13 The Last Supper | [217 John 13 The Last Supper.jpg](https://archive.org/details/gustavedore/217%20John%2013%20The%20Last%20Supper.jpg) |
| 218 | John 18 Peter Denies Knowing Jesus | [218 John 18 Peter Denies Knowing Jesus.jpg](https://archive.org/details/gustavedore/218%20John%2018%20Peter%20Denies%20Knowing%20Jesus.jpg) |
| 219 | John 19A Jesus is Presented to the People | [219 John 19A Jesus is Presented to the People.jpg](https://archive.org/details/gustavedore/219%20John%2019A%20Jesus%20is%20Presented%20to%20the%20People.jpg) |
| 220 | John 19B Jesus is Nailed to the Cross | [220 John 19B Jesus is Nailed to the Cross.jpg](https://archive.org/details/gustavedore/220%20John%2019B%20Jesus%20is%20Nailed%20to%20the%20Cross.jpg) |
| 221 | John 19C Disciples Mourn over the Dead Jesus | [221 John 19C Disciples Mourn over the Dead Jesus.jpg](https://archive.org/details/gustavedore/221%20John%2019C%20Disciples%20Mourn%20over%20the%20Dead%20Jesus.jpg) |
| 222 | John 19D Jesus is Buried in the Tomb | [222 John 19D Jesus is Buried in the Tomb.jpg](https://archive.org/details/gustavedore/222%20John%2019D%20Jesus%20is%20Buried%20in%20the%20Tomb.jpg) |
| 223 | John 21 The Miraculous Catch of Fish | [223 John 21 The Miraculous Catch of Fish.jpg](https://archive.org/details/gustavedore/223%20John%2021%20The%20Miraculous%20Catch%20of%20Fish.jpg) |
| 224 | Acts 2A The Holy Spirit Descends on the Disciples | [224 Acts 2A The Holy Spirit Descends on the Disciples.jpg](https://archive.org/details/gustavedore/224%20Acts%202A%20The%20Holy%20Spirit%20Descends%20on%20the%20Disciples.jpg) |
| 225 | Acts 2B The Apostles Preach the Gospel | [225 Acts 2B The Apostles Preach the Gospel.jpg](https://archive.org/details/gustavedore/225%20Acts%202B%20The%20Apostles%20Preach%20the%20Gospel.jpg) |
| 226 | Acts 3 Peter and John at the Beautiful Gate | [226 Acts 3 Peter and John at the Beautiful Gate.jpg](https://archive.org/details/gustavedore/226%20Acts%203%20Peter%20and%20John%20at%20the%20Beautiful%20Gate.jpg) |
| 227 | Acts 5 The Death of Ananias | [227 Acts 5 The Death of Ananias.jpg](https://archive.org/details/gustavedore/227%20Acts%205%20The%20Death%20of%20Ananias.jpg) |
| 228 | Acts 7 The Martyrdom of St Stephen | [228 Acts 7 The Martyrdom of St Stephen.jpg](https://archive.org/details/gustavedore/228%20Acts%207%20The%20Martyrdom%20of%20St%20Stephen.jpg) |
| 229 | Acts 9 The Conversion of Saul | [229 Acts 9 The Conversion of Saul.jpg](https://archive.org/details/gustavedore/229%20Acts%209%20The%20Conversion%20of%20Saul.jpg) |
| 230 | Acts 10 Peter Preaches in the House of Cornelius | [230 Acts 10 Peter Preaches in the House of Cornelius.jpg](https://archive.org/details/gustavedore/230%20Acts%2010%20Peter%20Preaches%20in%20the%20House%20of%20Cornelius.jpg) |
| 231 | Acts 12 Peter is Delivered from Prison | [231 Acts 12 Peter is Delivered from Prison.jpg](https://archive.org/details/gustavedore/231%20Acts%2012%20Peter%20is%20Delivered%20from%20Prison.jpg) |
| 232 | Acts 17 Paul Preaches to the Thessalonians | [232 Acts 17 Paul Preaches to the Thessalonians.jpg](https://archive.org/details/gustavedore/232%20Acts%2017%20Paul%20Preaches%20to%20the%20Thessalonians.jpg) |
| 233 | Acts 19 Paul Preaches at Ephesus | [233 Acts 19 Paul Preaches at Ephesus.jpg](https://archive.org/details/gustavedore/233%20Acts%2019%20Paul%20Preaches%20at%20Ephesus.jpg) |
| 234 | Acts 21 Paul is Rescued from the Crowd | [234 Acts 21 Paul is Rescued from the Crowd.jpg](https://archive.org/details/gustavedore/234%20Acts%2021%20Paul%20is%20Rescued%20from%20the%20Crowd.jpg) |
| 235 | Acts 27 Paul is Shipwrecked | [235 Acts 27 Paul is Shipwrecked.jpg](https://archive.org/details/gustavedore/235%20Acts%2027%20Paul%20is%20Shipwrecked.jpg) |
| 236 | Rev 1 John on Patmos | [236 Rev 1 John on Patmos.jpg](https://archive.org/details/gustavedore/236%20Rev%201%20John%20on%20Patmos.jpg) |
| 237 | Rev 6 The Pale Horse of Death | [237 Rev 6 The Pale Horse of Death.jpg](https://archive.org/details/gustavedore/237%20Rev%206%20The%20Pale%20Horse%20of%20Death.jpg) |
| 238 | Rev 12 The Virgin is Crowned | [238 Rev 12 The Virgin is Crowned.jpg](https://archive.org/details/gustavedore/238%20Rev%2012%20The%20Virgin%20is%20Crowned.jpg) |
| 239 | Rev 18 Babylon Has Fallen | [239 Rev 18 Babylon Has Fallen.jpg](https://archive.org/details/gustavedore/239%20Rev%2018%20Babylon%20Has%20Fallen.jpg) |
| 240 | Rev 20 The Last Judgment | [240 Rev 20 The Last Judgment.jpg](https://archive.org/details/gustavedore/240%20Rev%2020%20The%20Last%20Judgment.jpg) |
| 241 | Rev 21 The New Jerusalem | [241 Rev 21 The New Jerusalem.jpg](https://archive.org/details/gustavedore/241%20Rev%2021%20The%20New%20Jerusalem.jpg) |
