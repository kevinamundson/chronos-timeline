// Doré illustrations. (1) An image that fails on IIIF v2 is retried once on IIIF v3 (same Archive.org
// service), then replaced by a link to Archive.org. (2) Gallery: CSS scroll-snap does the swiping; this
// adds prev/next, dots, arrow keys and a "n of N" status. No library. Without JS the strip still scrolls.
(() => {
  const clearLoading = (img) => {
    const frame = img.closest('.dore-frame');
    if (!frame) return;
    frame.setAttribute('aria-busy', 'false');
    frame.querySelector('.dore-loading')?.remove();
  };
  const fail = (img) => {
    if (img.dataset.fallbackSrc && !img.dataset.retried) {
      img.dataset.retried = '1';
      if (img.dataset.fallbackSrcset) img.srcset = img.dataset.fallbackSrcset;
      else img.removeAttribute('srcset');
      img.src = img.dataset.fallbackSrc;
      return;
    }
    clearLoading(img);
    const fig = img.closest('figure');
    const unavailable = fig?.querySelector('.dore-unavailable');
    if (unavailable) {
      const a = img.closest('a');
      if (a) a.hidden = true;
      unavailable.removeAttribute('hidden');
      return;
    }
    // Index thumbnail: the anchor is the Archive.org link. Keep it, drop the broken image.
    img.hidden = true;
  };
  for (const img of document.querySelectorAll('img.dore-img')) {
    img.addEventListener('error', () => fail(img));
    img.addEventListener('load', () => clearLoading(img));
    // A cached image can finish before this script runs. A lazy image that has not
    // started may also report complete with no pixels, so a zero width is not a failure.
    if (img.complete && img.naturalWidth > 0) clearLoading(img);
  }
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('is-near', e.isIntersecting);
    }, { rootMargin: '200px' });
    for (const frame of document.querySelectorAll('.dore-frame')) near.observe(frame);
  }
  for (const g of document.querySelectorAll('[data-dore-gallery]')) {
    const track = g.querySelector('.dore-track');
    const slides = [...track.querySelectorAll('.dore-slide')];
    const dots = [...g.querySelectorAll('.dore-dot')];
    const status = g.querySelector('.dore-status');
    const prev = g.querySelector('[data-dore="prev"]');
    const next = g.querySelector('[data-dore="next"]');
    let cur = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const go = (i) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    };
    const mark = (i) => {
      cur = i;
      dots.forEach((d, j) => d.setAttribute('aria-current', j === i ? 'true' : 'false'));
      slides.forEach((s, j) => s.setAttribute('aria-hidden', j === i ? 'false' : 'true'));
      slides.forEach((s, j) => s.querySelectorAll('a').forEach((a) => { a.tabIndex = j === i ? 0 : -1; }));
      if (status) status.textContent = `${i + 1} of ${slides.length}`;
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    };
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting && e.intersectionRatio >= 0.6) mark(slides.indexOf(e.target));
    }, { root: track, threshold: [0.6] });
    slides.forEach((s) => io.observe(s));
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    dots.forEach((d, j) => d.addEventListener('click', () => go(j)));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
    });
    g.classList.add('dore-js');
    mark(0);
  }
})();
