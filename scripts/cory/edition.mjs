// Cory's Ancient Fragments, new and enlarged edition, London: Reeves & Turner, 1876,
// editor E. Richmond Hodges. Read on the University of Toronto (Robarts) scan,
// Internet Archive corysancientfrag00coryuoft, on 2026-10-23.
// Printed page P is scan leaf P + 44 (printed p. 1 = leaf 45; printed p. 28 = leaf 72).
export const SRC = 'cory-ancient-fragments-1876';
export const ITEM = 'https://archive.org/details/corysancientfrag00coryuoft';
export const MARK = 'Added from the Cory import';
export const leafOf = (page) => page + 44;
export const pageLink = (page) => `${ITEM}/page/n${leafOf(page)}/mode/1up`;
export const citation = (page, chain) => `Cory, Ancient Fragments (London: Reeves & Turner, 1876, ed. E. Richmond Hodges), p. ${page}; ${chain}`;
