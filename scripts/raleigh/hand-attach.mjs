// Chapters attached by hand: Book II, Part I, Chapter VII (pass 11), and
// Chapters VIII and IX (pass 12). covered.mjs keeps only these links there.
import { CH7, CH7_NEW, CH7_EVENTS } from './ch7-attach.mjs';
import { CH8_9, CH8_9_NEW, CH8_9_EVENTS } from './ch8-9-attach.mjs';

export const HAND_NEW = { ...CH7_NEW, ...CH8_9_NEW };
export const HAND_EVENTS = new Set([...CH7_EVENTS, ...CH8_9_EVENTS]);
const CHAPTERS = new Set(['7', '8', '9']);

export function isHand(p) {
  return p.kind === 'body' && p.book === '2' && CHAPTERS.has(p.chapter);
}

/** True for the chapters of pass 12, where a shared surface is not added as a spelling. */
export function isPass12(p) {
  return p.kind === 'body' && p.book === '2' && (p.chapter === '8' || p.chapter === '9');
}

export function handEntries(passageId) {
  return (CH7[passageId] || CH8_9[passageId] || []).map((e) => {
    const i = e.indexOf('=');
    return i < 0 ? { id: e, surface: null } : { id: e.slice(0, i), surface: e.slice(i + 1) };
  });
}
