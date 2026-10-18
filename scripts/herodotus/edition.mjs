// Herodotus, The Histories, tr. George Rawlinson: edition constants for scripts/herodotus/*.
// Edition read: Roman Roads Media etext (the owner's private copy; PDF not in the repo).
// Public-domain links: Wikisource transcription of Rawlinson's translation (one page per Book).
export const SRC_EDITION = 'herodotus-rawlinson-roman-roads';
export const SRC_PUBLIC = 'herodotus-rawlinson-wikisource';
export const WS_ROOT = 'https://en.wikisource.org/wiki/The_History_of_Herodotus_(Rawlinson)';
export const wsBook = (b) => `${WS_ROOT}/Book_${b}`;
// Wikisource numbers the chapters in Books 1, 2 (partly), 7, 8 and 9 only; Books 3-6 are unnumbered running text.
export const WS_NUMBERED = new Set([1, 7, 8, 9]);
// Printed page = PDF page - 2 (checked on PDF pp. 4, 10, 50, 153, 300, 450, 600, 630).
export const PRINTED_OFFSET = -2;
export const citation = (ref, pdf) => `Herodotus, Histories ${ref} (tr. George Rawlinson; Roman Roads Media etext, 2013), p. ${pdf + PRINTED_OFFSET} (PDF p. ${pdf})`;
export const MARK = 'Added from the Herodotus import';
