# Doré plates that need a record, or were left unmatched

The 220 canonical plates are in `data/illustrations/dore-1866.json` and on `/illustrations/dore/`. The 21 Apocrypha files, whose number has an x after it, are not in the data and not on that page. No person or event was created in this pass. Sort order was not changed.

A Scripture reference on a plate is identified from the Archive.org file title. It is not printed on the engraving. Where the title does not name one passage, `scripture_ref` is null.

A plate is linked only to a person or event the scene clearly includes. A crowd ("his brothers", "the Israelites", "the disciples") is not split into every named record. A closed list in the verse is linked (Noah's sons in Gen 7:13; Shem and Japheth in Gen 9:23).

## Scripture reference left null

These titles do not settle on one passage. People or events are linked only where the scene is clear without the disputed verse.

| Plate | Title | Why the reference is null |
|---|---|---|
| 006 | The World is Destroyed by Water | The title covers the flood, not one passage. The flood event and the four men are linked. |
| 007 | The Great Flood | Same as plate 006. |
| 032 | Moses and Aaron Appear Before Pharaoh | The title fits Exodus 5 and Exodus 7. Moses and Aaron are linked. No pharaoh was chosen. |
| 040 | Moses Comes Down from Mount Sinai | Exodus 32:15 and Exodus 34:29 are both a descent with the tables. Moses is linked. |
| 078 | David and Jonathan | The title fits 1 Samuel 20 and 1 Samuel 23:16. David and Jonathan son of Saul are linked. Jonathan Goforth is not. |
| 079 | David Shows Saul How He Saved His Life | The title fits 1 Samuel 24 and 1 Samuel 26. David and Saul are linked. david-spares-saul-the-second-time was not attached, because the plate may be the first time. |
| 083 | David Attacks the Ammonites | The title does not say which Ammonite campaign. David is linked. saul-defeats-the-ammonites is Saul's campaign, not this one. |
| 094 | The Israelites Slaughter the Syrians | The title fits 1 Kings 20 and 2 Kings 6-7. Nothing is linked. |
| 113 | Artaxerxes Grants Freedom to the Jews | Ezra 7 and Nehemiah 2 both have an Artaxerxes freeing or sending Jews. Nothing is linked. |
| 139 | The Prophet Isaiah | A portrait, not one passage. |
| 142 | The Prophet Jeremiah | A portrait, not one passage. |
| 144 | People Mourn over the Destruction of Jerusalem | The mourning is not pinned to one text. |
| 146 | The Prophet Ezekiel | A portrait, not one passage. |
| 156 | The Prophet Amos | A portrait, not one passage. |
| 159 | Micah Exhorts the Israelites to Repent | The title does not give a chapter. |
| 165 | Matt 12 Jesus Heals a Paralytic | The file says Matt 12 and a paralytic. The paralytic is Matthew 9 and Mark 2. The two disagree, so the ref is null. |
| 186 | Mark 15B Jesus Falls Beneath the Cross | Falling under the cross is the Stations of the Cross. No Gospel verse says it. Mark 15 is the file's chapter label, not a verse for this scene. |

## Names that match more than one record

Where two ancient records could each be the person, the plate is not linked to either. A later namesake of a different kind is excluded, and the biblical record is used.

| Plate | Title | Decision |
|---|---|---|
| 009 | Noah Curses Ham and Canaan | ham (Son of Noah) is linked. cham, "Ham (Egypt)", is not. |
| 011 | Abraham Goes to the Land of Canaan | The land of Canaan is not canaan-son-of-ham. That person is linked only on plate 009, where the title names him. |
| 078 | David and Jonathan | jonathan is Saul's son. jonathan-goforth is not linked. |
| 089 | Cedars Are Cut Down for the Jerusalem Temple | hiram-of-tyre and hiram-of-tyre-ii are both Cory kings of Tyre. The file does not say which one answered Solomon, so neither is linked. |
| 096 | Elijah Destroys the Messengers of Ahaziah | ahaziah-king-of-israel is linked (2 Kgs 1:2). ahaziah-of-judah is not. |
| 098 | Some Children are Destroyed by Bears | elishah is Javan's son (Gen 10:4), not Elisha. Nothing is linked. |
| 111 | Cyrus Restores the Vessels of the Temple | cyrus-the-great is linked. cyras-in-persia is the Raleigh duplicate and is not linked. |
| 150 | Daniel Interprets the Writing on the Wall | balthasar carries the alt name Belshazzar and is linked. The Daniel 2 dream is not this plate. |
| 156 | The Prophet Amos | amos-d18 is a Cory king named Amos, not the prophet. Nothing is linked. |
| 160 | Zechariah's Vision of Four Chariots | zachariah-king-of-israel is not the prophet Zechariah. Nothing is linked. |
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt | joseph, Jacob's son, is not the husband of Mary. He is not linked to the Matt 2 flight. |
| 184 | Mark 14 Judas Betrays Jesus | iudas-macchabaeus and judas-maccabeus are not the betrayer. Neither is linked. The Apocrypha plates are omitted. |
| 202 | Luke 16 Lazarus Outside the Rich Man's House | The Lazarus of Luke 16 is the parable. He is not a proposed link to a John 11 record. |
| 229 | Acts 9 The Conversion of Saul | The Saul of Acts 9 is Paul. The king saul is not linked. The conversion event is linked. |
| 238 | Rev 12 The Virgin is Crowned | The woman of Revelation 12 was not identified as Mary, or as Mary I or Mary Slessor. |

Also excluded, with no plate linked to them: the modern Samuels (Marsden, Lamb, Crowther, Zwemer, Kirkland) and the modern Davids (Livingstone, Brainerd). The plates use `samuel` and `david`. The person `hosea` is Raleigh's Israel column and is likely Hoshea. No plate is titled Hosea, so he is not linked. Two Hezekiah records exist (`hezekiah` and `hezekiah-high-priest`). Plate 103 does not show either of them.

## Close calls

- Plate 004, the sacrifices, is not linked to `cain-and-abel`. That event is the murder. Plate 005 is the murder.
- Plate 008, the dove, is linked to `the-flood` (the event cites Genesis 6-8). It is not `ark-landing`, which is Genesis 8:4.
- Plate 010 is the tower (Genesis 11). Nimrod exists, and Josephus makes him the instigator, and `founding-of-babel` cites Genesis 10:8-10. Genesis 11 does not name him, so he is not linked.
- Plate 015 is Hagar and Ishmael in the wilderness. `weaning-of-isaac` cites Genesis 21:8-21, which includes those verses. The plate is not the weaning, so the event is not linked. Ishmael is linked. Add the event if the record should carry both halves.
- Plate 027, the dream, is linked to `joseph-made-vizier`. That event cites Genesis 41:38-46, the appointment, which follows the interpretation in the same audience.
- Plate 029 links Joseph by Genesis 46:29. He meets the family in Goshen. He is not on the road in Genesis 46:5-7.
- Plate 035, the firstborn, is not linked to `exodus`. That event cites Exodus 12:29, but the plate is the houses, and Moses stays indoors (Exod 12:22-23).
- Plate 039 does not link Aaron. The law is given to Moses (Exod 20:21). Aaron is told to come up in Exodus 19:24, before this scene.
- Plate 042 links Aaron because Numbers 13:26 names him with Moses when the spies return. Joshua is linked by Numbers 14:6, where he is named in the answer to that report.
- Plate 061 links Jephthah by Judges 11:38. He sent his daughter away. The mourners in the plate are the women.
- Plate 069 is Judges 21, the virgins of Jabesh-gilead. `the-levites-concubine` cites Judges 19:1 only, so it is not linked.
- Plate 074 is linked to `death-of-apophis-anointing-of-david`, whose scripture includes 1 Samuel 15:32-33 and the anointing in 1 Samuel 16:13. The plate shows Agag's death, not the anointing.
- Plate 081 is Saul's death (1 Sam 31:4). Jonathan dies at 31:2 and is not in the suicide verse, so he is not linked here. He is linked on plate 105, where the bodies of Saul and his sons are taken up (1 Sam 31:12).
- Plate 082 links only `civil-war-david-and-ish-bosheth`. The kings are named as the sides. They are not on the field.
- Plate 095 links Ahab only. Jehoshaphat is in the battle earlier (1 Kgs 22:29-33) and is not in the death verses 22:34-37.
- Plate 099 links Joram by 2 Kings 6:26, the king the woman cries to during the famine of 6:25.
- Plate 103 links only `angel-slays-the-assyrians` (2 Kgs 19:35). It is not the siege, and it is not Sennacherib.
- Plate 111 links `cyrus-decree-of-return`, which cites Ezra 1:1-4. The plate is the vessels in Ezra 1:7-11. Cyrus is named in the title.
- Plate 115 links `nehemiah-comes-to-jerusalem` (Neh 2:11). The plate is the night ride (Neh 2:13-15) in that arrival, not the hearing at Susa and not the rebuilding.
- Plates 137 and 138 link the existing person `job`. Jones identifies him as Issachar's third son (Gen 46:13) and as the man of the trial. Both the person and `job-trial` are linked.
- Plate 189 links `birth-of-jesus` from the Luke 2 title. That event's scripture is Matthew 2:1-23. Plates 161 to 163 are the star, the flight and the massacre, which sit inside Matthew 2, and they are not linked to the birth event. Plate 163 links Herod the Great (Matt 2:16) and not `reign-of-herod`.
- `death-and-resurrection-of-christ` is linked only where the plate is the death, the burial or the empty tomb: 175, 176, 187, 206, 207, 208, 220, 221, 222. It is not linked to the scourging, the crown of thorns, the mocking, the fall under the cross, the walk to Emmaus, the ascension, or the catch of fish.
- Plates 207 and 221 use a chapter reference (`Luke.23`, `John.19`). Lifting the cross, and the lament over the body, are not one verse. The title gives the chapter.

## Suggested person: Jesus

There is no person record for Jesus. These plates depict him. Several already link an event (the birth, the temple at twelve, the transfiguration, the baptism, the death and resurrection) and still have no person to hang the portrait on.

| Plate | Title |
|---|---|
| 161 | Matt 2A Wise Men Are Guided by a Star |
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt |
| 164 | Matt 6 The Sermon on the Mount |
| 165 | Matt 12 Jesus Heals a Paralytic |
| 167 | Matt 14B Jesus Feeds the Multitudes |
| 168 | Matt 15 Jesus Heals the Sick |
| 169 | Matt 17 Jesus Heals the Epilectic Demoniac |
| 170 | Matt 21 Jesus Enters Into Jerusalem |
| 171 | Matt 22 Jesus Replies About the Tribute Money |
| 172 | Matt 26 Jesus Prays in the Garden |
| 173 | Matt 27A Jesus is Crowned with Thorns |
| 174 | Matt 27B Jesus is Mocked |
| 175 | Matt 27C The Crucifixion of Jesus and Two Criminals |
| 178 | Mark 1B Jesus Preaches in the Synagogue |
| 179 | Mark 2 The Disciples Pluck Grain on the Sabbath |
| 180 | Mark 4 Jesus Calms the Storm at Sea |
| 181 | Mark 9 The Transfiguration |
| 182 | Mark 10 Jesus Blesses the Little Children |
| 183 | Mark 12 The Widow's Mite |
| 184 | Mark 14 Judas Betrays Jesus |
| 185 | Mark 15A Jesus is Scourged |
| 186 | Mark 15B Jesus Falls Beneath the Cross |
| 189 | Luke 2A The Birth of Jesus |
| 190 | Luke 2B Jesus Questions the Doctors |
| 191 | Luke 4A The Temptation of Jesus |
| 192 | Luke 4B Jesus Heals a Demoniac |
| 193 | Luke 5 Jesus Preaches at the Sea of Galilee |
| 194 | Luke 7 A Sinful Woman Repents |
| 195 | Luke 8 Jesus Raises the Daughter of Jairus |
| 198 | Luke 10C Jesus at the House of Martha and Mary |
| 199 | Luke 12 Jesus Preaches to the Multitude |
| 204 | Luke 19 Buyers and Sellers Are Driven Out of the Temple |
| 205 | Luke 22 An Angel Appears to Jesus in the Garden |
| 206 | Luke 23A Jesus Arrives at Calvary |
| 207 | Luke 23B The Cross is Lifted Up |
| 208 | Luke 23C Darkness at the Crucifixion |
| 209 | Luke 24A Jesus and Two Disciples Go to Emmaus |
| 210 | Luke 24B Jesus Ascends to Heaven |
| 211 | John 1 The Baptism of Jesus |
| 212 | John 2 The Wedding at Cana |
| 213 | John 4 Jesus and the Woman of Samaria |
| 214 | John 6 Jesus Walks on the Sea |
| 215 | John 8 Jesus and the Woman Taken in Adultery |
| 216 | John 11 The Raising of Lazarus |
| 217 | John 13 The Last Supper |
| 219 | John 19A Jesus is Presented to the People |
| 220 | John 19B Jesus is Nailed to the Cross |
| 221 | John 19C Disciples Mourn over the Dead Jesus |
| 222 | John 19D Jesus is Buried in the Tomb |
| 223 | John 21 The Miraculous Catch of Fish |

Not in that list: plate 166 (the head of John), plate 176 (the women and the angel at the empty tomb; Jesus is not standing there), plate 177 (John preaching), plate 218 (Peter's denial; Jesus is inside, not in the courtyard).

## Suggested person: Mary, the mother of Jesus

| Plate | Title | Suggested record | Why it is not linked |
|---|---|---|---|
| 161 | Matt 2A Wise Men Are Guided by a Star | Mary, mother of Jesus | The star leads to the child (Matt 2:11). |
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt | Mary, mother of Jesus | She goes to Egypt (Matt 2:13-14). |
| 188 | Luke 1 - The Annunciation | Mary, mother of Jesus | The annunciation is to her (Luke 1:26-38). |
| 189 | Luke 2A The Birth of Jesus | Mary, mother of Jesus | She gives birth (Luke 2:7). |
| 212 | John 2 The Wedding at Cana | Mary, mother of Jesus | She is at Cana (John 2:1-5). |

Plate 198 is Mary of Bethany, not this Mary. Plate 238 was not assigned to her.

## Suggested person: Joseph, husband of Mary

| Plate | Title | Suggested record | Why it is not linked |
|---|---|---|---|
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt | Joseph, husband of Mary | He leads them to Egypt (Matt 2:13-14). Not the existing person joseph, who is Jacob's son. |
| 189 | Luke 2A The Birth of Jesus | Joseph, husband of Mary | He is with Mary at the birth (Luke 2:4-7). |

## Suggested person: Peter

| Plate | Title | Suggested record | Why it is not linked |
|---|---|---|---|
| 181 | Mark 9 The Transfiguration | Peter | He is on the mountain (Mark 9:2). |
| 218 | John 18 Peter Denies Knowing Jesus | Peter | He denies Jesus (John 18:25-27). |
| 223 | John 21 The Miraculous Catch of Fish | Peter | He hauls the net (John 21:11). |
| 225 | Acts 2B The Apostles Preach the Gospel | Peter | He stands up to preach (Acts 2:14). |
| 226 | Acts 3 Peter and John at the Beautiful Gate | Peter | He is at the gate (Acts 3:1-6). |
| 227 | Acts 5 The Death of Ananias | Peter | He confronts Ananias (Acts 5:3). |
| 230 | Acts 10 Peter Preaches in the House of Cornelius | Peter | He preaches in the house (Acts 10:34). The event is linked. |
| 231 | Acts 12 Peter is Delivered from Prison | Peter | He is led out of the prison (Acts 12:7-9). |

## Suggested person: Paul

| Plate | Title | Suggested record | Why it is not linked |
|---|---|---|---|
| 228 | Acts 7 The Martyrdom of St Stephen | Paul | Saul is present, consenting, at the stoning (Acts 7:58). |
| 229 | Acts 9 The Conversion of Saul | Paul | The title's Saul is Paul on the road (Acts 9:3-6). The event is linked. Not the king saul. |
| 232 | Acts 17 Paul Preaches to the Thessalonians | Paul | He reasons in the synagogue (Acts 17:2). |
| 233 | Acts 19 Paul Preaches at Ephesus | Paul | He speaks in the synagogue at Ephesus (Acts 19:8). |
| 234 | Acts 21 Paul is Rescued from the Crowd | Paul | The crowd seizes him (Acts 21:30). The event is linked. |
| 235 | Acts 27 Paul is Shipwrecked | Paul | He is in the wreck (Acts 27:41-44). |

## Suggested person: John the apostle

John the Baptist already has a record and is linked on plates 166, 177 and 211. The apostle does not.

| Plate | Title | Suggested record | Why it is not linked |
|---|---|---|---|
| 181 | Mark 9 The Transfiguration | John the apostle | He is on the mountain (Mark 9:2). |
| 226 | Acts 3 Peter and John at the Beautiful Gate | John the apostle | He is with Peter at the gate (Acts 3:1). |
| 236 | Rev 1 John on Patmos | John the apostle | Rev 1:9 names John on Patmos. The event is linked. Not john-the-baptist. |

## Other suggested records

One row per gap. A plate can appear more than once when the scene needs more than one record.

| Plate | Title | Suggested record | Why it is not linked |
|---|---|---|---|
| 002 | The Creation of Eve | Eve | Adam is linked. Genesis 2:21-22 is the making of the woman. There is no Eve record. |
| 003 | Adam and Eve Are Driven out of Eden | Eve | She leaves the garden with Adam (Gen 3:23-24). |
| 004 | Cain and Abel Offer Their Sacrifices | Abel | He brings an offering (Gen 4:4). The murder record cain-and-abel is plate 005, not this sacrifice. |
| 005 | Cain Slays Abel | Abel | Cain kills him (Gen 4:8). Cain and the murder event are linked. |
| 006 | The World is Destroyed by Water | Noah's wife, and the wives of Shem, Ham and Japheth | Genesis 7:13 names them in the ark. They have no records. The four men and the flood event are linked. |
| 007 | The Great Flood | Noah's wife, and the wives of Shem, Ham and Japheth | Same closed set as plate 006. |
| 008 | A Dove is Sent Forth from the Ark | Noah's wife, and the wives of Shem, Ham and Japheth | Genesis 8:16 still names them in the ark when the dove is sent. |
| 011 | Abraham Goes to the Land of Canaan | Lot | Genesis 12:5 says he went with Abram. There is no Lot record. |
| 013 | Lot Flees as Sodom and Gomorrah Burn | Lot, his wife, and his two daughters | They are the people who leave the city (Gen 19:15-16). Abraham is not in the flight. |
| 014 | Abraham Sends Hagar and Ishmael Away | Hagar | Abraham sends her away (Gen 21:14). She is named in the title. Abraham, Ishmael, Sarah and the weaning event are linked. |
| 015 | Hagar and Ishmael in the Wilderness | Hagar | She is with Ishmael in the wilderness (Gen 21:15-19). Ishmael is linked. |
| 018 | Eliezer and Rebekah at the Well | Rebekah, and Abraham's servant | The title says Eliezer. Genesis 24 does not name the servant. Genesis 15:2 names Eliezer of Damascus, which is not this chapter. No record was inferred from that. |
| 019 | The Meeting of Isaac and Rebekah | Rebekah | Isaac meets her (Gen 24:63-67). Isaac and the marriage event are linked. |
| 020 | Isaac Blesses Jacob | Rebekah | She prepared the meal (Gen 27:14-17). She is not in the blessing verses themselves. Listed so the gap is visible; do not add her unless the blessing scene is taken to include her. |
| 022 | Jacob Tends Laban's Flock and Meets Rachel | Laban, and Leah | Jacob meets Rachel at Laban's flock (Gen 29:9-10). Leah is not in this meeting. |
| 026 | Joseph is Sold by His Brothers | Joseph's other brothers, as a group | Judah is named at the sale (Gen 37:26) and is linked. Reuben is absent (Gen 37:29) and is not linked. The others are not expanded one by one. |
| 043 | The Death of Korah, Dathan, and Abiram | Korah, Dathan and Abiram | The ground swallows them (Num 16:31-33). Moses and Aaron are linked. |
| 045 | An Angel Appears to Balaam | Balaam | The angel stands in his way (Num 22:22-31). Balak is not in this scene. |
| 049 | Joshua Spares Rahab | Rahab | Joshua sends the spies to bring her out (Josh 6:22-23). Joshua is linked. |
| 050 | Achan is Stoned to Death | Achan | He is stoned (Josh 7:25). Joshua is linked. |
| 054 | Jael Kills Sisera | Jael, Sisera, Deborah and Barak | Jael kills Sisera (Judg 4:21). The deborah-and-barak event is linked. None of the four has a person record. |
| 055 | Deborah Praises Jael | Jael, and Deborah | Deborah's song praises Jael (Judg 5:24). The same event is linked. |
| 060 | Jephthah’s Daughter Comes to Meet Her Father | Jephthah's daughter | She comes out to meet him (Judg 11:34). Jephthah is linked. |
| 061 | Israelite Women Mourn with Jephthah’s Daughter | Jephthah's daughter, and the women who mourn with her | They go into the hills (Judg 11:37-40). Jephthah is linked by 11:38, the verse in which he sent her. |
| 065 | Samson and Delilah | Delilah | She has his head shaved (Judg 16:19). Samson is linked. |
| 067 | A Levite Finds a Woman's Corpse | The Levite, and the woman | He finds her at the door (Judg 19:26-28). The event is linked. Neither person exists. |
| 068 | The Levite Carries the Woman's Body Away | The Levite | He cuts the body in pieces (Judg 19:29). The event is linked. |
| 069 | The Benjamites Take the Virgins of Jabesh-gilead | The virgins of Jabesh-gilead, as a group | Judges 21:12-14. This is not the Levite's concubine (that event cites Judg 19:1 only), so no event is linked. |
| 070 | Naomi and Her Daughters-in-law | Naomi, Ruth and Orpah | Naomi tells them to return (Ruth 1:8-14). |
| 071 | Ruth and Boaz | Ruth, Boaz and Naomi | Ruth gleans in Boaz's field (Ruth 2:2-8). |
| 072 | The Ark is Returned to Beth-shemesh | None proposed | The men of Beth-shemesh are not a closed named set. No ark-return event was attached: ark-brought-to-jerusalem and the battle of Aphek are different scenes. |
| 074 | The Death of Agag | Agag | Samuel kills him (1 Sam 15:33). Samuel, Saul and the Apophis/anointing event are linked. The event also cites the anointing, which this plate does not show. |
| 075 | David Slays Goliath | Goliath | David strikes him (1 Sam 17:49). David and the event are linked. Saul is not in the verse. |
| 077 | David Escapes Through a Window | Michal | She lets David down through the window (1 Sam 19:12). David and the flight event are linked. |
| 080 | Saul and the Witch of Endor | The woman of Endor | Saul asks her to bring Samuel up (1 Sam 28:7-11). Saul and Samuel are linked. |
| 082 | Combat Between Soldiers of Ish-bosheth and David | Abner and Joab | They meet at the pool of Gibeon (2 Sam 2:12-14). The civil-war event is linked. David and Ish-bosheth are the sides, not men on the field, so they are not linked. |
| 084 | The Death of Absalom | Absalom and Joab | Joab strikes Absalom (2 Sam 18:14-15). David is not there. rebellion-of-absalom cites 2 Samuel 15, not this death, so it is not linked. |
| 086 | Rizpah’s Kindness toward the Dead | Rizpah | She keeps the bodies (2 Sam 21:10). David is not in the verse. |
| 087 | Abishai Saves David’s Life | Abishai | He kills the giant (2 Sam 21:17). David is linked. |
| 089 | Cedars Are Cut Down for the Jerusalem Temple | Hiram of Tyre | Solomon asks him for cedars (1 Kgs 5:1-8). Two Hiram records exist (see below), so neither is linked. Solomon is linked. |
| 090 | The Disobedient Prophet is Slain by a Lion | The man of God from Judah | A lion kills him (1 Kgs 13:24). Jeroboam is not in that verse. |
| 091 | Elijah Raises the Son of the Widow of Zarephath | Elijah, and the widow of Zarephath | He raises her son (1 Kgs 17:17-23). |
| 092 | The Prophets of Baal are Slaughtered | Elijah | He brings the prophets of Baal down (1 Kgs 18:40). |
| 093 | Elijah is Nourished by an Angel | Elijah | An angel feeds him (1 Kgs 19:5-7). |
| 096 | Elijah Destroys the Messengers of Ahaziah | Elijah | Fire consumes the captains (2 Kgs 1:10-12). Ahaziah of Israel is linked because he sends them (2 Kgs 1:2) and the title names him. He is not standing in the fire. |
| 097 | Elijah Ascends to Heaven in a Chariot of Fire | Elijah and Elisha | Elijah goes up; Elisha sees it (2 Kgs 2:11-12). The translation event is linked. The person elishah is Javan's son, not this Elisha. |
| 098 | Some Children are Destroyed by Bears | Elisha | Bears come out after he curses the youths (2 Kgs 2:23-24). |
| 099 | A Famine in Samaria | Elisha | The famine is 2 Kgs 6:25. Elisha is in the city (6:31-32), which is the next moment, so he is not linked. Joram is linked by 6:26. |
| 100 | The Death of Jezebel | Jezebel | Jehu has her thrown down (2 Kgs 9:33). Jehu is linked. |
| 101 | Jehu's Companions Find Jezebel's Remains | Jezebel | They find her skull and feet (2 Kgs 9:35). Jehu is linked. |
| 102 | Foreign Nations are Slain by Lions in Samaria | None proposed | The settlers are a crowd. fall-of-samaria is the siege, not the lions of 2 Kgs 17:25, so it is not linked. |
| 103 | Sennacherib's Army is Destroyed | Sennacherib, as a possible later link | 2 Kings 19:35 is the camp. Verse 36 has him at Nineveh, so he is not linked. Hezekiah is not in verse 35, and two Hezekiah records exist. The angel event is linked. |
| 105 | Jabesh-Gileadites Recover the Bodies of Saul and His Sons | The men of Jabesh-gilead, as a group | They take the bodies (1 Sam 31:12). Saul and Jonathan are linked. |
| 107 | Solomon Receives the Queen of Sheba | The queen of Sheba | She comes to Solomon (1 Kgs 10:1-2). Solomon is linked. The sons of Sheba are a different name and are not linked. |
| 110 | The Death of Athaliah | Jehoiada | He brings Athaliah out (2 Kgs 11:13-15). Athaliah is linked. |
| 113 | Artaxerxes Grants Freedom to the Jews | Artaxerxes, once the king is chosen | The title fits Ezra 7 and Nehemiah 2. The records do not decide between Longimanus and Mnemon. Left unmatched. |
| 114 | Ezra Kneels in Prayer | Ezra | He prays (Ezra 9:5-6). |
| 115 | Nehemiah Views the Ruins of Jerusalem's Walls | Nehemiah | He rides around the walls (Neh 2:13-15). The arrival event is linked. |
| 116 | Ezra Reads the Law to the People | Ezra, and Nehemiah | Ezra reads (Neh 8:2-3). Nehemiah is present at 8:9, which is after the reading the title names, so he is not linked. nehemiah-reforms is a different set of acts. |
| 121 | Queen Vashti Refuses to Obey Ahasuerus' Command | Vashti, and Ahasuerus | She refuses to come (Esth 1:12). esther-made-queen is a later scene. No Xerxes record was chosen. |
| 122 | The Triumph of Mordecai | Mordecai, and Haman | The king has Haman lead Mordecai (Esth 6:11). haman-hanged is 7:10, so it is not linked. |
| 123 | Esther Accuses Haman | Esther, Haman and Ahasuerus | Esther names Haman (Esth 7:6). The hanging is the next verses, so that event is not linked. |
| 137 | Job Hears of His Misfortunes | None beyond the existing job record | Jones identifies the person job as Issachar's son and as the man of the trial. Both job and job-trial are linked. A separate Book-of-Job person was not created. |
| 138 | Job Speaks with His Friends | Eliphaz, Bildad and Zophar | They sit with him (Job 2:11). Job and the trial are linked. |
| 139 | The Prophet Isaiah | Isaiah | A portrait. No chapter is one scene, so scripture_ref is null. |
| 140 | Isaiah's Vision of the Destruction of Babylon | Isaiah | The title is his vision of Babylon (Isaiah 13). The chapter ref is set. He is not given a person record. |
| 141 | The Destruction of Leviathan | Isaiah | The leviathan verse is Isaiah 27:1. The ref is set. |
| 142 | The Prophet Jeremiah | Jeremiah | A portrait. scripture_ref is null. |
| 143 | Baruch Writes Down Jeremiah's Prophecies | Baruch, and Jeremiah | Baruch writes at Jeremiah's dictation (Jer 36:4). |
| 144 | People Mourn over the Destruction of Jerusalem | None proposed | The mourning is not pinned to one passage, and it is not the same scene as fall-of-jerusalem-586-bc. |
| 146 | The Prophet Ezekiel | Ezekiel | A portrait. Not ezekiel-begins-to-prophesy, which is the call, not a portrait. |
| 147 | Ezekiel's Vision of the Valley of Dry Bones | Ezekiel | The valley of bones (Ezek 37:1-10). glory-departs is a different vision. |
| 148 | Daniel Among the Exiles | Daniel, Hananiah, Mishael and Azariah | They are taken to Babylon (Dan 1:6). The event is linked. |
| 149 | Shadrach, Meshach, and Abed-nego in the Furnace | Shadrach, Meshach and Abednego | They are in the furnace (Dan 3:23). Nebuchadnezzar is linked by Dan 3:24. |
| 150 | Daniel Interprets the Writing on the Wall | Daniel | He reads the writing (Dan 5:17-28). Balthasar (Belshazzar) is linked. The Daniel 2 dream event is a different night. |
| 151 | Daniel in the Lion's Den | Daniel, and Darius the Mede | Daniel is cast in (Dan 6:16). reign-of-darius-i is Darius I, not the Mede, so it is not linked. |
| 152 | Daniel's Vision of the Four Beasts | Daniel | He sees the four beasts (Dan 7:3-7). |
| 156 | The Prophet Amos | Amos the prophet | A portrait. amos-d18 is a Cory king, not this Amos, so nothing is linked. |
| 157 | Jonah is Spewed Forth by the Whale | Jonah | The fish casts him out (Jonah 2:10). The Nineveh preaching event is plate 158, not this one. |
| 158 | Jonah Preaches to the Ninevites | Jonah | He cries against Nineveh (Jonah 3:4). The preaching event is linked. |
| 159 | Micah Exhorts the Israelites to Repent | Micah the prophet | The title is the prophet exhorting Israel. The Judges Micah (the Levite's employer) is a different man, and there is no event for the prophet, so nothing is linked. |
| 160 | Zechariah's Vision of Four Chariots | Zechariah the prophet | The four chariots (Zech 6:1-8). zachariah-king-of-israel is the king, not the prophet. |
| 166 | Matt 14A Herod's Daughter Receives the Head of John the Baptist | Herodias's daughter, and Herod Antipas | She receives the head (Matt 14:8-11). John and the beheading event are linked. |
| 176 | Matt 28 The Angel and Women at the Empty Tomb | The women at the tomb | The angel speaks to them (Matt 28:5). The death-and-resurrection event is linked. Jesus is not standing in the tomb in these verses. |
| 181 | Mark 9 The Transfiguration | Elijah, Peter, James and John | Moses and Elijah talk with Jesus (Mark 9:4). Peter, James and John are there (Mark 9:2). Moses and the transfiguration event are linked. |
| 183 | Mark 12 The Widow's Mite | The widow | She puts in two mites (Mark 12:42). |
| 184 | Mark 14 Judas Betrays Jesus | Judas Iscariot | He kisses Jesus (Mark 14:45). The two Judas Maccabeus records are not this man. The Apocrypha plates that show the Maccabee are omitted. |
| 187 | Mark 15C Jesus' Body is Removed from the Cross | Joseph of Arimathea | He takes the body down (Mark 15:46). The death-and-resurrection event is linked. |
| 194 | Luke 7 A Sinful Woman Repents | The woman who anoints Jesus | She weeps at his feet (Luke 7:37-38). |
| 195 | Luke 8 Jesus Raises the Daughter of Jairus | Jairus, and his daughter | Jesus raises her (Luke 8:49-55). |
| 198 | Luke 10C Jesus at the House of Martha and Mary | Martha, and Mary of Bethany | Mary sits at his feet (Luke 10:39). This Mary is not the mother of Jesus. |
| 202 | Luke 16 Lazarus Outside the Rich Man's House | None: this is the parable | Luke 16:20 is the parable Lazarus, not the Lazarus of John 11 (plate 216). |
| 209 | Luke 24A Jesus and Two Disciples Go to Emmaus | Cleopas, and the other disciple | They walk with Jesus (Luke 24:13-18). The death-and-resurrection event is not the walk to Emmaus. |
| 210 | Luke 24B Jesus Ascends to Heaven | None beyond Jesus | He is carried up (Luke 24:51). The ascension is not the death-and-resurrection event. |
| 212 | John 2 The Wedding at Cana | Mary, the mother of Jesus | She speaks to him at Cana (John 2:3). |
| 213 | John 4 Jesus and the Woman of Samaria | The woman of Samaria | She meets him at the well (John 4:7). |
| 215 | John 8 Jesus and the Woman Taken in Adultery | The woman accused | The scribes bring her (John 8:3). |
| 216 | John 11 The Raising of Lazarus | Lazarus of Bethany, Mary of Bethany and Martha | Jesus calls Lazarus out (John 11:43-44). Not the parable of plate 202. |
| 217 | John 13 The Last Supper | The twelve, as a group | John 13 is the supper. They are not expanded into twelve records. |
| 218 | John 18 Peter Denies Knowing Jesus | Peter | He denies Jesus (John 18:25-27). execution-of-peter is a later death, so it is not linked. |
| 219 | John 19A Jesus is Presented to the People | Pilate, and Jesus | Pilate brings him out (John 19:5). pontius-pilate-governor is the governorship, not this moment. |
| 221 | John 19C Disciples Mourn over the Dead Jesus | The mourners, as a group | The title is the lament over the body. John 19 does not narrate a pietà in one verse, so the ref is the chapter. The death-and-resurrection event is linked. |
| 222 | John 19D Jesus is Buried in the Tomb | Joseph of Arimathea, and Nicodemus | They lay the body in the tomb (John 19:38-42). The event is linked. |
| 223 | John 21 The Miraculous Catch of Fish | Peter | He draws the net (John 21:11). |
| 224 | Acts 2A The Holy Spirit Descends on the Disciples | The disciples gathered in the house | The Spirit comes (Acts 2:1-4). korean-pentecost is a different event and is not linked. |
| 225 | Acts 2B The Apostles Preach the Gospel | Peter | He addresses the crowd (Acts 2:14). |
| 226 | Acts 3 Peter and John at the Beautiful Gate | Peter, John, and the lame man | They meet him at the gate (Acts 3:1-8). |
| 227 | Acts 5 The Death of Ananias | Ananias, Sapphira and Peter | Ananias falls (Acts 5:1-5). |
| 228 | Acts 7 The Martyrdom of St Stephen | Stephen, and Saul (Paul) | They stone Stephen; Saul is watching (Acts 7:58-59). The martyrdom event is linked. |
| 231 | Acts 12 Peter is Delivered from Prison | Peter | The angel leads him out (Acts 12:7-9). execution-of-james and the death of Herod Agrippa I are other events in the chapter and are not this plate. |
| 236 | Rev 1 John on Patmos | John the apostle | He is on Patmos (Rev 1:9). The banishment event is linked. Not John the Baptist. |
| 238 | Rev 12 The Virgin is Crowned | None | Revelation 12:1 is the woman clothed with the sun. Identifying her as Mary, or as Israel, would be a guess. Nothing is linked. |

## Parables

These plates tell a parable. The people in them are not proposed as timeline records.

| Plate | Title | Note |
|---|---|---|
| 196 | Luke 10A The Parable of the Good Samaritan | The man who fell among thieves, and the Samaritan. |
| 197 | Luke 10B The Good Samaritan Arrives at the Inn | The Samaritan at the inn. |
| 200 | Luke 15A The Prodigal Son Returns Home | The son returns. |
| 201 | Luke 15B The Prodigal Son in His Father's Arms | The father embraces him. Same verse as plate 200, a second moment. |
| 202 | Luke 16 Lazarus Outside the Rich Man's House | Lazarus and the rich man. Not John 11. |
| 203 | Luke 18 The Pharisee and the Publican | The Pharisee and the tax collector. |

## Plates with no suggested record

Revelation 6, 18, 20 and 21 (plates 237, 239, 240, 241) are visions without a person record to add. Plate 141 is the verse about Leviathan, with the reference set and no person to add beyond Isaiah, who is named in the section above.
