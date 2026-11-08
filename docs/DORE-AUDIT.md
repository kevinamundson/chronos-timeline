# Doré correction audit (2026-10-29)

Kevin's ruling: a person is linked to a plate only when Doré draws that person. The basis is `named-in-title` (the file title names the person, and that person is drawn) or `depicted` (the person is clearly the figure shown, with a short note of who and where). An event may still be linked when the plate draws that event (`event-depicted`). A person who is only named in the verse, and not drawn, is not linked. `in-scripture-passage` is rejected.

Each row below was decided in this pass. Plates in the re-audit were viewed before the link was kept or removed. The file requested first was the Archive.org IIIF v2 image at 600px. On this day many of those requests returned HTTP 500 or 504, so the same file was viewed on IIIF v3, or at 400px when 600px failed. The site still requests v2 first. Copies stayed in `/tmp/dore-audit/` and are not in the repo. Plates viewed below 600px: 025 and 029 (v2, 400px), 113 and 189 (v3, 400px).

Named-in-title links that were not on the removal list, and not Canaan on plate 009, were left as they were.

## Counts

| | Before | After |
|---|---|---|
| Plates in the data | 220 | 220 |
| Plates with at least one link | 124 | 113 |
| Unmatched | 96 | 107 |
| Links | 206 | 157 |
| `event-depicted` | 68 | 71 |
| `in-scripture-passage` | 63 | 0 |
| `depicted` | 0 | 12 |
| `named-in-title` | 75 | 74 |
| Distinct records linked | 94 | 86 |

Person links removed: 52. Event links added: 3. Person links kept and moved from `in-scripture-passage` to `depicted`: 12. Person and event files edited: 0. Sort diff against `origin/main`: 0.

## Removed on the correction list

The old link was that the verse names the person. The person is not the figure the plate draws. Event links on these plates stay.

| Plate | Record | Reason |
|---|---|---|
| 006 | noah, shem, ham, japheth | The deluge. The four men are not drawn as separate figures. `the-flood` stays. |
| 007 | noah, shem, ham, japheth | Same plate subject as 006. `the-flood` stays. |
| 008 | noah, shem, ham, japheth | The dove. Noah and his sons are not drawn as separate figures. `the-flood` stays. |
| 033 | moses | Not the figure drawn. The plate has no record link. |
| 034 | moses | Not the figure drawn. The plate has no record link. |
| 042 | moses, aaron | Viewed. The grape-carrying spies are a group. None is marked as Moses or Aaron. |
| 042 | caleb, iosua | Viewed with the same plate. None of the spies is marked as Caleb or Joshua. The plate has no record link. |
| 061 | jephthah | The mourners are the women. He is not drawn. He stays on plate 060, where the title names him. |
| 089 | solomon | The felling of cedars. He is not drawn. The plate has no record link. |
| 096 | ahaziah-king-of-israel | The fire on the captains. He sends them, and the title names him, but he is not drawn. |
| 106 | david | Not the figure drawn. The plate has no record link. |
| 109 | jehoshaphat | Not the figure drawn. The plate has no record link. |
| 149 | nebuchadnezzar-ii | The furnace. He is named in Dan 3:24 and is not a distinct figure. |
| 163 | herod-the-great | The massacre. He is named in Matt 2:16 and is not drawn. |

## Borderline, viewed

| Plate | Record | Decision | Reason |
|---|---|---|---|
| 009 | canaan-son-of-ham | Removed | A child stands in the family group at the lower left. The youth Noah addresses is the figure the title names as Ham. Canaan is not a distinct figure. |
| 009 | shem, japheth | Removed | The men behind Noah are not marked as Shem and Japheth. This plate is the curse, not the covering in Gen 9:23. `noah` and `ham` stay `named-in-title`. |
| 099 | joram-king-of-israel | Kept, `depicted` | The crowned king on the steps, whom the woman at his feet addresses. That is the king of the Samaria famine (2 Kgs 6). |

## Verse-basis person links, viewed

Kept. The basis is now `depicted`, with the note stored on the link.

| Plate | Record | Note |
|---|---|---|
| 002 | adam | The man asleep on the ground at the lower right, while the woman stands over him. |
| 014 | sarai | The woman seated at the tent door, holding a child, as Hagar and Ishmael leave. |
| 016 | isaac | The boy on the left, carrying the wood on his shoulders. |
| 017 | abraham | The elderly bearded man in the centre of the mourners, supported as they enter the cave. |
| 028 | benjamin | The brother collapsed against Joseph on the steps, while the others bow or stand around them. Gen 45:14 is the embrace, so this one brother is Benjamin. |
| 044 | moses | The bearded man on the right, arm raised toward the serpent, with rays from his head. |
| 074 | samuel | The elderly man at the left, holding the sword over the kneeling captive. |
| 080 | samuel | The shrouded figure rising at the left, whom the kneeling king faces. |
| 150 | balthasar | The crowned king seated on the dais, below the writing on the wall. |
| 181 | moses | The figure at the left of Jesus, holding the stone tablets. |
| 211 | john-the-baptist | The man in skins on the bank, hand raised over the man standing in the water. |

Removed. A crowd, a procession, several bodies, or a speck is not "clearly the figure."

| Plate | Record | Reason |
|---|---|---|
| 011 | sarai | Riders and flocks. No woman is singled out as Sarai. `abraham` stays `named-in-title`. |
| 012 | sarai | A small figure by the tent is too small to see as Sarah rather than a servant. `abraham` stays `named-in-title`. |
| 025 | rachel | Women and children in the companies. No one woman is marked as Rachel. `jacob` and `esau` stay `named-in-title`. Viewed at 400px. |
| 026 | judah | The brothers are a group around Joseph. No one brother is marked as Judah. `joseph` and `joseph-sold-into-egypt` stay. |
| 029 | joseph | The household is on the road. No figure comes out as Joseph the vizier. `jacob` and `jacob-enters-egypt` stay. Viewed at 400px. |
| 030 | miriam | Angels over the basket. No girl in the reeds. `moses` stays `named-in-title` (the baby). |
| 031 | miriam | Pharaoh's daughter and her attendants. The kneeling woman is a maid reaching for the basket. `moses` stays `named-in-title`. |
| 036 | aaron | One robed man faces Pharaoh. That man is Moses, named in the title. The others are Egyptians. |
| 037 | moses | The drowning host and the crowd on the rocks. No one figure is Moses. `exodus` stays. |
| 039 | moses | The people bow before the mountain. No one figure is Moses. `arrival-at-sinai` stays. |
| 041 | aaron | The men below the tablets are the crowd. None is Aaron. `moses` stays `named-in-title`. |
| 043 | moses, aaron | The men on the cliff are a group. None is Moses or Aaron. |
| 046 | iosua | The host crossing the river. No one rider is marked as Joshua. `crossing-the-jordan` stays. |
| 048 | iosua | The army and the ark are a procession. No one figure is Joshua. `fall-of-jericho` stays. |
| 050 | iosua | Only the body under the stones. Joshua is not in the plate. |
| 052 | iosua | Horsemen under the falling stones. No one rider is Joshua. |
| 057 | gedeon | A mass of riders and a line of torches. Gideon is not a separate figure. `gideon-defeats-midian` stays. He stays on plate 056, where the title names him. |
| 058 | abimelech-son-of-gideon | The plate is the bodies. The standing figure at the right is not Abimelech. `reign-of-abimelech` stays. He stays on plate 059, where the title names him. |
| 074 | saul | No crowned figure is marked as Saul. Samuel stays, above. |
| 100 | jehu | The men below the window are a company. No one is marked as Jehu. |
| 104 | nebuchadnezzar-ii | One crowned man watches from the steps. The title names him as Zedekiah. No second king is marked as Nebuchadnezzar. `zedekiah` and `fall-of-jerusalem-586-bc` stay. |
| 105 | jonathan | Several bodies on the wall. No one body is Jonathan rather than another son. `saul` stays `named-in-title`. |
| 112 | zerubbabel | Workers, guards, and a man with raised arms on the wall. That man is not marked as Zerubbabel. `temple-rebuilding-begins` stays. |

## Added

Only records that already exist. No person id was invented.

| Plate | Record | Decision | Reason |
|---|---|---|---|
| 121 | ahasuerus-feast | Added, `event-depicted` | The plate is Vashti refusing the summons (Esth 1:12). The event cites the banquet (Esth 1:4). Linked because the plate is that court. No Esther, Vashti, Haman, Mordecai or Ahasuerus person record exists. `xerxes-i` and `darius-i` were not used as stand-ins. |
| 122 | ahasuerus-sleepless-night | Added, `event-depicted` | The plate is the parade (Esth 6:11), not the king in bed. The event cites Esth 6:1. No Mordecai or Haman person record exists. |
| 123 | haman-hanged | Added, `event-depicted` | The plate is Esther pointing at the banquet, with Haman at her feet. No gallows. The event cites Esth 7:10. No Esther, Haman or Ahasuerus person record exists. |
| 097 | elijah-translated | Kept | Viewed. Elijah is the figure ascending in the chariot, and Elisha is on the steps. The "person needed" note is right. There is no Elijah person record (`elishah` is Javan's son). Plate 097 is already in `docs/DORE-SUGGESTED-RECORDS.md`. |

## Not linked, left open

These two rows are the 2026-10-29 pass. They are not a ruling. The 2026-11-07 viewing, and the question for Kevin, are in the ruling request at the end of this file.

| Plate | Records not linked | Reason |
|---|---|---|
| 113 | artaxerxes-decree, artaxerxes-longimanus | The event cites Neh 2:1, the cupbearer's private request, and its note will not choose Longimanus or Mnemon. The title fits Ezra 7 and Nehemiah 2, so `scripture_ref` stays null. Viewed at 400px: a king on a throne proclaiming to a crowd in a square, not a private request. See C11. |
| 189 | (event kept) | `birth-of-jesus` stays. Viewed at 400px: the nativity, with Mary, the infant, Joseph with a staff, shepherds and animals in a stable (Luke 2). The event cites Matt 2:1–23. The event record was not edited. See C11. |

## Ruling request (2026-11-07)

No link was added or removed. No `scripture_ref` was changed. No person or event was created, and no date or sort was changed. The two plates stay as they are until Kevin rules.

Copies of the files that were viewed stayed in `/tmp/dore-audit/` and are not in the repo. Plate 113 was viewed as the Archive.org IIIF v3 image at 600px. On the same day v2 at 600px and v2 at 400px returned HTTP 500 for that file; v3 at 600px and v2 at 240px returned it. Plate 189 was viewed as the IIIF v2 image at 600px.

### Plate 113, "Artaxerxes Grants Freedom to the Jews"

The plate prints that caption. In the data, `scripture_ref` is null and `records` is empty.

What is drawn. A court in front of a palace. The walls carry winged bulls and winged human-headed figures. A crowd fills the court, with a rider among them. Two men in long robes stand with their backs to the viewer, between the crowd and the reliefs, both with an arm raised. Soldiers with helmets, spears and a shield stand on the steps at the right. A cloaked figure kneels in the foreground. There is no interior room, no woman seated beside a king, no cup, and no city wall. This 600px view does not show a throne, and it does not mark one man, by a crown or by a seat, as the king. The 400px note of 2026-10-29 called the same plate a king on a throne. That throne is not visible here, so the two viewings are not the same description. The raised arms can be read as a proclamation or as the crowd's response. Neither reading picks out Artaxerxes as one body.

Passages the title can name. The file title is not a verse.

- Ezra 7:11–26 is the letter of Artaxerxes. Ezra 7:13 says that the people of Israel, and the priests and the Levites, who are minded of their own freewill to go up to Jerusalem, may go. No event in the data cites Ezra 7:11–26.
- Ezra 7:1–10 is the journey up to Jerusalem. `ezra-returns-to-jerusalem` cites that range. The plate is not a journey.
- Ezra 7:27 is Ezra speaking about the king's heart being moved to beautify the house. `ezra-beautifies-the-temple` cites that verse. The plate is not the Temple.
- Nehemiah 2:1 is the cupbearer giving wine to the king. Nehemiah 2:6 has the queen sitting by him. `artaxerxes-decree` cites Nehemiah 2:1 only, and its note will not choose Artaxerxes Longimanus or Artaxerxes Mnemon. The plate is not that private room.
- Nehemiah 2:1–8 is the same request and the letters that follow. `nehemiah-rebuilds-the-wall` cites that range. Its title begins "Artaxerxes' decree", and the Jones line on it is the wall built and dedicated. The plate is not the wall. Plate 115 is the ruins, and it is already linked to `nehemiah-comes-to-jerusalem` (Nehemiah 2:11).

Records this plate should not take on the evidence above.

- `artaxerxes-longimanus` and `artaxerxes-mnemon`. The title says Artaxerxes and does not say which. No figure is marked as either man. Linking one of them would choose the king the decree's note refuses to choose.
- `artaxerxes-decree`. The picture is not the cupbearer's private request in Nehemiah 2:1.
- `nehemiah-rebuilds-the-wall`. The picture is not the wall, and it is not the private audience in Nehemiah 2:1–8.
- `ezra-returns-to-jerusalem` and `ezra-beautifies-the-temple`. The picture is not the journey and not the Temple.
- `cyrus-decree-of-return` and `cyrus-the-great`. That decree is Cyrus, and plate 111 is the vessels. This title says Artaxerxes.
- There is no Ezra person and no Nehemiah person. Neither was created. The crowd is not split into named records.

What is left open. The plate may be the publishing of a decree the data does not yet record (Ezra 7:11–26), or it may be a court scene that does not settle on one of the events above. This pass does not add that event and does not set `scripture_ref`.

Question for Kevin. Leave plate 113 unmatched, or name the one existing record it should take.

### Plate 189, "Luke 2A The Birth of Jesus"

The plate prints "The Birth of Jesus". In the data, `scripture_ref` is `Luke.2.6-Luke.2.7`. The only link is `birth-of-jesus`, basis `event-depicted`. That link was not changed.

What is drawn. A stable, with beams and a gap in the roof. A woman in a veil sits holding an infant. A bearded man stands behind her with a long staff. Shepherds stand and kneel around them, several of them with staffs. An ox and sheep are in the foreground. One star shows through the gap. There are no wise men, no gifts, no journey, no soldiers, and no Herod.

The stored reference is Luke 2:6–7, the birth. The shepherds are also drawn, and they come to the child in Luke 2:16. The reference was not widened.

`birth-of-jesus` is titled "Birth of Jesus Christ". Its scripture is Matthew 2:1–23. Matthew 2:1 says that Jesus had been born, and the chapter is then the wise men, the flight into Egypt and the massacre. `herod-the-great` is on that event's people list. He is not drawn on this plate.

Three other plates draw parts of Matthew 2, and none of them is linked to `birth-of-jesus`:

| Plate | Title | Reference | Records |
|---|---|---|---|
| 161 | Matt 2A Wise Men Are Guided by a Star | Matt 2:9 | none |
| 162 | Matt 2B Joseph Leads Mary and Jesus into Egypt | Matt 2:13–15 | none |
| 163 | Matt 2C The Children of Bethlehem are Massacred | Matt 2:16 | none |

Plate 163 does not draw Herod. He was left off that plate on 2026-10-29 for that reason.

Persons this plate should not take.

- The seated woman is the mother of the child. There is no record for her. `mary-i-of-england` and `mary-slessor` are other women.
- The infant is the child named in the title. There is no Jesus person record. None was created.
- The standing man with the staff is the husband in this scene. The person `joseph` is Jacob's son. There is no record for the husband of Mary. He was not linked.
- The shepherds are a group. No one of them is named.
- `herod-the-great` is not drawn.

What is left open. The event's name is the birth, and the plate is a birth. The event's verses are Matthew 2, and this plate does not draw the wise men, the flight or the massacre. Those three scenes are plates 161 to 163, which are not on this event.

Question for Kevin. Keep `birth-of-jesus` on plate 189, or take that link off until the event cites Luke 2 or a separate nativity event exists. This pass does not edit the event.
