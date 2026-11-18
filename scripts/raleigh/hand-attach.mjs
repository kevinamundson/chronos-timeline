// Chapters attached by hand: Book II, Part I, Chapter VII (pass 11),
// Chapters VIII and IX (pass 12), Chapter X (pass 13),
// Chapters XI–XIII (pass 14), Chapters XIV–XVII (pass 15),
// Chapters XVIII–XXIII (pass 16), and Chapters XXIV–XXVIII (pass 18).
// Book III, Part I, Chapters I–VI (pass 19) are joined as they are stored.
// covered.mjs keeps only these links there.
import { CH7, CH7_NEW, CH7_EVENTS } from './ch7-attach.mjs';
import { CH8_9, CH8_9_NEW, CH8_9_EVENTS } from './ch8-9-attach.mjs';
import { CH10, CH10_NEW, CH10_EVENTS } from './ch10-attach.mjs';
import { CH11_13, CH11_13_NEW, CH11_13_EVENTS } from './ch11-13-attach.mjs';
import { CH14_17, CH14_17_NEW, CH14_17_EVENTS } from './ch14-17-attach.mjs';
import { CH18_23, CH18_23_NEW, CH18_23_EVENTS } from './ch18-23-attach.mjs';
import { CH24_28, CH24_28_NEW, CH24_28_EVENTS } from './ch24-28-attach.mjs';
import { B3, B3_NEW, B3_EVENTS, B3_CHAPTERS } from './b3-ch1-attach.mjs';

export const HAND_NEW = { ...CH7_NEW, ...CH8_9_NEW, ...CH10_NEW, ...CH11_13_NEW, ...CH14_17_NEW, ...CH18_23_NEW, ...CH24_28_NEW, ...B3_NEW };
export const HAND_EVENTS = new Set([...CH7_EVENTS, ...CH8_9_EVENTS, ...CH10_EVENTS, ...CH11_13_EVENTS, ...CH14_17_EVENTS, ...CH18_23_EVENTS, ...CH24_28_EVENTS, ...B3_EVENTS]);
const CHAPTERS = new Set(['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28']);

export function isHand(p) {
  if (p.kind === 'body' && p.book === '2' && CHAPTERS.has(p.chapter)) return true;
  if (p.kind === 'body' && p.book === '3' && B3_CHAPTERS.has(p.chapter)) return true;
  return false;
}

/** True where a shared surface is not added as a spelling (passes 12–19). */
export function isPass12(p) {
  if (p.kind === 'body' && p.book === '3' && B3_CHAPTERS.has(p.chapter)) return true;
  return p.kind === 'body' && p.book === '2' && (p.chapter === '8' || p.chapter === '9' || p.chapter === '10' || p.chapter === '11' || p.chapter === '12' || p.chapter === '13' || p.chapter === '14' || p.chapter === '15' || p.chapter === '16' || p.chapter === '17' || p.chapter === '18' || p.chapter === '19' || p.chapter === '20' || p.chapter === '21' || p.chapter === '22' || p.chapter === '23' || p.chapter === '24' || p.chapter === '25' || p.chapter === '26' || p.chapter === '27' || p.chapter === '28');
}

export function handEntries(passageId) {
  return (CH7[passageId] || CH8_9[passageId] || CH10[passageId] || CH11_13[passageId] || CH14_17[passageId] || CH18_23[passageId] || CH24_28[passageId] || B3[passageId] || []).map((e) => {
    const i = e.indexOf('=');
    return i < 0 ? { id: e, surface: null } : { id: e.slice(0, i), surface: e.slice(i + 1) };
  });
}
