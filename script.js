// Overscroll background: red at top, tan at bottom
(function overscrollBg() {
  const RED = '#c1121f';
  const TAN = '#f3dcad';
  const html = document.documentElement;
  function update() {
    const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 200;
    html.style.background = nearBottom ? TAN : RED;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close nav when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

// Close nav on outside click
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  }
});

// ── Testimonials swipe carousel (tablet / mobile) ──────────────
(function buildTestimonialCarousel() {
  const carousel = document.querySelector('.test-carousel');
  const dotsWrap = document.querySelector('.test-dots');
  if (!carousel || !dotsWrap) return;

  // Clone every testimonial card into a uniform swipeable slide
  const cards = document.querySelectorAll(
    '.testimonials-main-row .test-card, .testimonials-lower-row .test-card'
  );
  cards.forEach(card => {
    const slide = card.cloneNode(true);
    slide.classList.add('test-slide');
    carousel.appendChild(slide);
  });

  const slides = carousel.querySelectorAll('.test-slide');
  if (!slides.length) return;

  // Build pagination dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'test-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => {
      // Use offsetLeft so gaps between slides are accounted for
      carousel.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.test-dot');
  let raf = null;
  carousel.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      // Find the slide whose offsetLeft is closest to current scrollLeft
      let closest = 0, minDist = Infinity;
      slides.forEach((s, i) => {
        const dist = Math.abs(s.offsetLeft - carousel.scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closest));
      raf = null;
    });
  });
})();

// ── Scroll reveal — directional, per-section choreography ──────
(function scrollReveal() {
  // Respect reduced-motion: leave everything visible, do nothing.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  // [selector, direction]: each section enters with its own character.
  // Title-containers fade (r-fade) so their big headline can do the masked
  // rise without competing motion; cards/images keep directional entrances.
  const map = [
    ['.about-card', 'r-fade'],
    ['.experience-card', 'r-fade'],
    ['.section-header', 'r-fade'],
    ['.gallery-header', 'r-fade'],
    ['.gallery-img-wrap', 'r-zoom'],
    ['.blog-sidebar', 'r-fade'],
    ['.blog-item', 'r-left'],
    ['.testimonials-header', 'r-fade'],
    ['.test-featured', 'r-left'],
    ['.test-side-col .test-card', 'r-right'],
    ['.testimonials-lower-row .test-card', 'r-up'],
    ['.contact-left', 'r-fade'],
    ['.contact-form', 'r-right'],
    ['.footer', 'r-up']
  ];

  const els = [];
  map.forEach(([sel, dir]) => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('reveal', dir);   // added now → safe if JS is off
      els.push(el);
    });
  });
  // Project cards alternate sliding in from left / right.
  document.querySelectorAll('.proj-card').forEach((c, i) => {
    c.classList.add('reveal', i % 2 ? 'r-right' : 'r-left');
    els.push(c);
  });

  // Stagger children within grids/lists for a cascade.
  const stagger = (parentSel, childSel, step) => {
    document.querySelectorAll(parentSel).forEach(parent => {
      parent.querySelectorAll(childSel).forEach((child, i) => {
        child.style.transitionDelay = (i * step) + 's';
      });
    });
  };
  stagger('.projects-grid', '.proj-card', 0.08);
  stagger('.gallery-grid', '.gallery-img-wrap', 0.05);
  stagger('.blog-list', '.blog-item', 0.1);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  els.forEach(el => io.observe(el));
})();

// ── Signature: masked headline reveal — wrap each line in a clipping mask.
// The rise is triggered by the section's .is-visible class (scroll-reveal),
// via CSS (.is-visible .line-inner). Wrapping only — safe if JS is off.
(function maskedHeadings() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heads = document.querySelectorAll(
    '.about-heading, .exp-heading, .section-title, .gallery-title, .blog-title, .testimonials-title, .contact-title'
  );
  heads.forEach(h => {
    const lines = h.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
    h.innerHTML = lines
      .map(l => '<span class="line-mask"><span class="line-inner">' + l + '</span></span>')
      .join('');
  });
})();

// ── Parallax depth (scroll-driven, rAF-throttled) ──────────────
(function parallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // The giant faded "COLLAB" in Contact drifts at its own rate → depth.
  const rebel = document.querySelector('.contact-bg-text');
  if (!rebel) return;
  rebel.setAttribute('data-parallax', '');

  const desktop = window.matchMedia('(min-width: 992px)');
  let ticking = false;
  function update() {
    if (!desktop.matches) { rebel.style.transform = ''; ticking = false; return; } // off on tablet/phone
    const vh = window.innerHeight;
    const r = rebel.getBoundingClientRect();
    // distance of element centre from viewport centre, normalised
    const delta = (r.top + r.height / 2) - vh / 2;
    rebel.style.transform = 'translate3d(0,' + (-delta * 0.14).toFixed(1) + 'px,0)';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

// ── Living image parallax — photos slide within their frames on scroll ──
// Drives transform:translateY on each image (which has ~12% vertical overflow
// inside its overflow-hidden frame). The image scrolls slower than the page →
// visible depth. No layout change; hover uses filter so there's no conflict.
(function imageParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const imgs = Array.prototype.slice.call(
    document.querySelectorAll('.proj-img, .gallery-img-wrap img')
  );
  if (!imgs.length) return;

  const desktop = window.matchMedia('(min-width: 992px)');
  let cleared = true;
  let ticking = false;
  function update() {
    // Off on tablet/phone: clear any leftover transforms once, keep scroll native.
    if (!desktop.matches) {
      if (!cleared) { for (let i = 0; i < imgs.length; i++) imgs[i].style.transform = ''; cleared = true; }
      ticking = false; return;
    }
    cleared = false;
    const vh = window.innerHeight;
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      const frame = img.parentElement;          // the overflow-hidden box
      const r = frame.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) continue;     // skip off-screen
      // progress 0→1 as the frame travels from entering to exiting the viewport
      const progress = (vh - r.top) / (vh + r.height);
      const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
      // move within the ±10% overflow: image lags the scroll → parallax
      const ty = (0.5 - clamped) * (r.height * 0.20);
      img.style.transform = 'translate3d(0,' + ty.toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

// ── Hero typewriter for "Welcome To My Portfolio" ──────────────
(function typewriter() {
  const el = document.querySelector('.hero-sub');
  if (!el) return;
  const full = el.textContent.trim();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  el.innerHTML = '<span class="typed"></span><span class="type-cursor">|</span>';
  const typed = el.querySelector('.typed');
  const cursor = el.querySelector('.type-cursor');
  let i = 0;

  setTimeout(() => {
    const timer = setInterval(() => {
      typed.textContent = full.slice(0, ++i);
      if (i >= full.length) {
        clearInterval(timer);
        setTimeout(() => cursor && cursor.remove(), 1800);
      }
    }, 60);
  }, 850);
})();

// ── Headline letter-cascade ("SATHISH S") ──────────────────────
(function splitHeadline() {
  const name = document.querySelector('.hero-name');
  if (!name) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { name.style.visibility = 'visible'; return; }

  const text = name.textContent;
  name.textContent = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? ' ' : ch;        // keep the space
    span.style.animationDelay = (0.35 + i * 0.05) + 's';  // cascade
    name.appendChild(span);
  });
  name.style.visibility = 'visible';   // reveal once split (no flash)
})();

// ── Avatar: float + 3D mouse parallax ─────────────────────────
// After the entrance animation, JS takes over:
//   • Sine-wave float — gentle vertical breathing (no rotation = no gap)
//   • Mouse parallax — avatar tilts in 3D toward cursor (pointer devices only)
//   • On touch devices — float only, no tilt
// Avatar: CSS enter animation only — no JS motion applied

// ── Path & Practice — auto-rotating experience carousel (5s) ──────
(function experienceCarousel() {
  const wrap = document.querySelector('.exp-entries');
  const card = document.querySelector('.experience-card');
  if (!wrap || !card) return;
  const entries = Array.prototype.slice.call(wrap.querySelectorAll('.exp-entry'));
  const dots = Array.prototype.slice.call(card.querySelectorAll('.dots .dot'));
  if (entries.length < 2) return;

  const INTERVAL = 5000;
  let idx = 0, timer = null;

  function sizeWrap() {                 // hold the height of the tallest entry
    let max = 0;
    entries.forEach(e => { if (e.offsetHeight > max) max = e.offsetHeight; });
    wrap.style.minHeight = max + 'px';
  }
  function show(i) {
    idx = (i + entries.length) % entries.length;
    entries.forEach((e, j) => e.classList.toggle('active', j === idx));
    dots.forEach((d, j) => d.classList.toggle('dot-active', j === idx));
  }
  function start() { stop(); timer = setInterval(() => show(idx + 1), INTERVAL); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  sizeWrap();
  window.addEventListener('load', sizeWrap);
  window.addEventListener('resize', sizeWrap, { passive: true });

  dots.forEach((d, j) => {
    d.setAttribute('role', 'button');
    d.setAttribute('aria-label', 'Show experience ' + (j + 1));
    d.addEventListener('click', () => { show(j); start(); });   // manual jump restarts timer
  });

  // Pause on hover (pointer devices), resume on leave; otherwise always rotate.
  card.addEventListener('mouseenter', stop);
  card.addEventListener('mouseleave', start);

  // Touch swipe support (mobile / tablet)
  let touchStartX = null;
  card.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 40) return;
    show(dx < 0 ? idx + 1 : idx - 1);
    start();
  }, { passive: true });

  show(0);
  start();
})();


// ── Sticky header — scroll-direction show/hide ─────────────────
// Hick's Law fix: nav is always reachable. Pattern:
//   • At the top → always visible, no shadow.
//   • Scroll DOWN → hide (get out of the way while reading).
//   • Scroll UP → reveal (user is looking for navigation).
//   • Touch-friendly — no hover-only interaction required.
(function stickyHeader() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const TOP_ZONE = 120;
  let lastY = window.pageYOffset;
  let ticking = false;

  function onScroll() {
    const y = window.pageYOffset;
    if (y <= TOP_ZONE) {
      nav.classList.remove('is-stuck', 'nav-hidden');
    } else {
      nav.classList.add('is-stuck');
      if (y > lastY) {
        nav.classList.add('nav-hidden');    // scrolling down → hide
      } else {
        nav.classList.remove('nav-hidden'); // scrolling up → reveal
      }
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  onScroll();
})();

// ── Toast notification (design-system style) ──────────────────
function showToast(type, message) {
  const existing = document.getElementById('site-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'site-toast';
  toast.className = 'site-toast site-toast--' + type;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = type === 'success' ? '✓' : type === 'network' ? '⚡' : '✕';
  toast.innerHTML =
    '<span class="toast-icon">' + icon + '</span>' +
    '<span class="toast-msg">' + message + '</span>' +
    '<button class="toast-close" aria-label="Dismiss">&times;</button>';

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  const dismiss = () => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  const timer = setTimeout(dismiss, type === 'success' ? 4000 : 6000);
  toast.querySelector('.toast-close').addEventListener('click', () => clearTimeout(timer));
}

// ── Contact form → EmailJS (sends to Sathish's Gmail) ─────────
(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  emailjs.init({ publicKey: 'DV-nwiWGPYPGGM_Kc' });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn  = form.querySelector('.form-submit');
    const name = (form.fullname.value || '').trim();
    const email= (form.email.value    || '').trim();
    const msg  = (form.message.value  || '').trim();
    if (!name || !email || !msg) {
      showToast('error', 'Please fill in your name, email and message.');
      return;
    }

    btn.textContent = 'SENDING…';
    btn.disabled = true;

    emailjs.sendForm('service_072grvj', 'template_r9qbwqs', form)
      .then(() => {
        showToast('success', 'Message sent! Sathish will get back to you soon.');
        form.reset();
        btn.textContent = 'SEND MESSAGE';
        btn.disabled = false;
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        const isNetwork = !navigator.onLine || (err && err.status === 0);
        if (isNetwork) {
          showToast('network', 'Network issue — check your connection and try again.');
        } else {
          showToast('error', 'Something went wrong. Please try again later.');
        }
        btn.textContent = 'SEND MESSAGE';
        btn.disabled = false;
      });
  });
})();

// ── Active nav link on scroll ──────────────────────────────────
(function activeNav() {
  const sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  const links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if (!sections.length || !links.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === '#' + id);
      });
    });
  }, { threshold: 0.3 });
  sections.forEach(s => io.observe(s));
})();

// ── Gallery lightbox (Digital Playground image preview) ────────
// Click any gallery image → full-screen popup with close + prev/next.
// Closes on ✕, backdrop click, or Esc; arrows / ←→ navigate the set.
(function galleryLightbox() {
  const box = document.getElementById('lightbox');
  const imgs = Array.prototype.slice.call(
    document.querySelectorAll('.gallery-grid .gallery-img-wrap img')
  );
  if (!box || !imgs.length) return;

  const lbImg = box.querySelector('.lb-img');
  const lbCount = box.querySelector('.lb-count');
  const btnClose = box.querySelector('.lb-close');
  const btnPrev = box.querySelector('.lb-prev');
  const btnNext = box.querySelector('.lb-next');
  const total = imgs.length;
  let idx = 0;

  function render() {
    const src = imgs[idx];
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt || ('Gallery image ' + (idx + 1));
    lbCount.textContent = (idx + 1) + ' / ' + total;
  }
  function open(i) {
    idx = (i + total) % total;
    render();
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';   // lock background scroll
  }
  function close() {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function go(step) { idx = (idx + step + total) % total; render(); }

  imgs.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => open(i));
  });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); go(1); });
  // Click on the dim backdrop (not the image/buttons) closes.
  box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb-stage')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  // Touch swipe support
  let touchX = null;
  box.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
