// Chapters attached by hand: Book II, Part I, Chapter VII (pass 11),
// Chapters VIII and IX (pass 12), Chapter X (pass 13),
// Chapters XI–XIII (pass 14), and Chapters XIV–XVII (pass 15).
// covered.mjs keeps only these links there.
import { CH7, CH7_NEW, CH7_EVENTS } from './ch7-attach.mjs';
import { CH8_9, CH8_9_NEW, CH8_9_EVENTS } from './ch8-9-attach.mjs';
import { CH10, CH10_NEW, CH10_EVENTS } from './ch10-attach.mjs';
import { CH11_13, CH11_13_NEW, CH11_13_EVENTS } from './ch11-13-attach.mjs';
import { CH14_17, CH14_17_NEW, CH14_17_EVENTS } from './ch14-17-attach.mjs';

export const HAND_NEW = { ...CH7_NEW, ...CH8_9_NEW, ...CH10_NEW, ...CH11_13_NEW, ...CH14_17_NEW };
export const HAND_EVENTS = new Set([...CH7_EVENTS, ...CH8_9_EVENTS, ...CH10_EVENTS, ...CH11_13_EVENTS, ...CH14_17_EVENTS]);
const CHAPTERS = new Set(['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17']);

export function isHand(p) {
  return p.kind === 'body' && p.book === '2' && CHAPTERS.has(p.chapter);
}

/** True where a shared surface is not added as a spelling (passes 12–15). */
export function isPass12(p) {
  return p.kind === 'body' && p.book === '2' && (p.chapter === '8' || p.chapter === '9' || p.chapter === '10' || p.chapter === '11' || p.chapter === '12' || p.chapter === '13' || p.chapter === '14' || p.chapter === '15' || p.chapter === '16' || p.chapter === '17');
}

export function handEntries(passageId) {
  return (CH7[passageId] || CH8_9[passageId] || CH10[passageId] || CH11_13[passageId] || CH14_17[passageId] || []).map((e) => {
    const i = e.indexOf('=');
    return i < 0 ? { id: e, surface: null } : { id: e.slice(0, i), surface: e.slice(i + 1) };
  });
}
