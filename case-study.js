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
