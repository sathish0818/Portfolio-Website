// Case study pages: nav behaviour (same as the home page) and scroll reveals.
document.documentElement.classList.add('cs-js');

(function nav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    }));
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

  const bar = document.querySelector('.navbar');
  if (!bar) return;
  const TOP_ZONE = 120;
  let lastY = window.pageYOffset, ticking = false;
  function onScroll() {
    const y = window.pageYOffset;
    if (y <= TOP_ZONE) bar.classList.remove('is-stuck', 'nav-hidden');
    else {
      bar.classList.add('is-stuck');
      bar.classList.toggle('nav-hidden', y > lastY);
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();

(function reveal() {
  const els = document.querySelectorAll('.cs-rv');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();

// Zepto live demo: the observed button fills itself and places the order; the proposed one waits for a tap.
(function zepto() {
  const root = document.querySelector('[data-zepto]');
  if (!root) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll('.zp-col').forEach(col => {
    const auto = col.dataset.mode === 'auto';
    const btn = col.querySelector('.zp-btn');
    const note = col.querySelector('.zp-note');
    let timer = null;
    function reset() {
      clearTimeout(timer);
      col.classList.remove('running', 'placed');
      const fill = col.querySelector('.fill');
      if (fill) { fill.style.transition = 'none'; fill.style.width = '0'; void fill.offsetWidth; fill.style.transition = ''; fill.style.width = ''; }
    }
    function place(text) { note.textContent = text; col.classList.add('placed'); }
    if (auto) {
      if (reduce) { col.classList.add('static'); return; }
      const run = () => { reset(); setTimeout(() => { col.classList.add('running'); timer = setTimeout(() => place('No tap. The interface decided for you.'), 1450); }, 40); };
      col.querySelector('.zp-replay').addEventListener('click', run);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(); io.disconnect(); } }), { threshold: 0.6 });
        io.observe(col);
      } else run();
    } else {
      btn.addEventListener('click', () => place('You tapped, so the order is placed. Your call.'));
      col.querySelector('.zp-replay').addEventListener('click', reset);
    }
  });
})();
