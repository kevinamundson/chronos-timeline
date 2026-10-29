// Doré illustration gallery: CSS scroll-snap does the swiping; this adds prev/next, dots,
// arrow keys and a "n of N" status. No library. Without JS the strip still scrolls and snaps.
(() => {
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
