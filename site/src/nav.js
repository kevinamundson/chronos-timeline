/* Primary nav: on narrow screens, hide the link list behind the menu button.
   .nav-collapsible is added only when this file runs, so the links stay visible with JavaScript off. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var btn = header && header.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (!header || !btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  header.classList.add('nav-collapsible');
  btn.hidden = false;
  setOpen(false);

  btn.addEventListener('click', function () {
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a');
    if (link && nav.contains(link)) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || btn.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    btn.focus();
  });

  var mq = window.matchMedia('(max-width: 640px)');
  function onViewport() { if (!mq.matches) setOpen(false); }
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onViewport);
  else mq.addListener(onViewport);
})();
