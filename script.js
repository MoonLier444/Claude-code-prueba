/* ================================================================
   DINA ESTÉTICA · script.js
   Custom cursor · Scroll reveals · Parallax · Nav · Testimonials
   Counter animation · Magnetic buttons · Form handling
================================================================ */

'use strict';

/* ---- Utility ---- */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/* ================================================================
   1. CUSTOM CURSOR
================================================================ */
const cursor    = qs('#cursor');
const cursorDot = qs('#cursorDot');

if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0, cx = 0, cy = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  const lerp = (a, b, t) => a + (b - a) * t;

  const animCursor = () => {
    cx = lerp(cx, mx, 0.12);
    cy = lerp(cy, my, 0.12);
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    raf = requestAnimationFrame(animCursor);
  };
  animCursor();

  // Hover state
  const hoverEls = qsa('a, button, .service-item, .testimonial-card, .bcontact-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Dark sections
  const darkSections = qsa('.experience, .cta-final, .footer, .authority');
  const checkDark = () => {
    const isDark = darkSections.some(el => {
      const r = el.getBoundingClientRect();
      return r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2;
    });
    document.body.classList.toggle('cursor-dark', isDark);
  };
  window.addEventListener('scroll', checkDark, { passive: true });
}

/* ================================================================
   2. NAVIGATION
================================================================ */
const nav       = qs('#nav');
const navToggle = qs('#navToggle');
const mobileMenu = qs('#mobileMenu');
const mobileLinks = qsa('.mobile-link');

// Scroll state
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile toggle
navToggle && navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ================================================================
   3. SCROLL REVEAL (IntersectionObserver)
================================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px'
});

const revealEls = qsa('.reveal-up, .reveal-title, .reveal-right, .reveal-service');
revealEls.forEach(el => revealObserver.observe(el));

/* ================================================================
   4. COUNTER ANIMATION
================================================================ */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const isDecimal = target % 1 !== 0;
    const hasPlus = el.classList.contains('count-plus');
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + (hasPlus && progress === 1 ? '+' : '');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

qsa('[data-count]').forEach(el => counterObserver.observe(el));

/* ================================================================
   5. PARALLAX (hero image + experience image)
================================================================ */
const parallaxImg = qs('#parallaxImg');

let ticking = false;

const doParallax = () => {
  if (parallaxImg) {
    const rect = parallaxImg.closest('.experience').getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const y = (progress - 0.5) * 80;
      parallaxImg.style.transform = `translateY(${y}px)`;
    }
  }
  ticking = false;
};

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(doParallax);
    ticking = true;
  }
}, { passive: true });

/* ================================================================
   6. TESTIMONIALS SLIDER
================================================================ */
const track = qs('#testimonialsTrack');
const cards = qsa('.testimonial-card', track);
const prevBtn = qs('#tPrev');
const nextBtn = qs('#tNext');
const dotsWrap = qs('#tDots');

const VISIBLE = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
let current = 0;

// Build dots
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'tdot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Reseña ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsWrap && dotsWrap.appendChild(dot);
});

const updateSlider = () => {
  const vis = VISIBLE();
  const maxIdx = Math.max(0, cards.length - vis);
  current = clamp(current, 0, maxIdx);

  cards.forEach((card, i) => {
    const inView = i >= current && i < current + vis;
    card.style.display = inView ? '' : 'none';
    card.style.opacity = inView ? '1' : '0';
  });

  const dots = qsa('.tdot', dotsWrap);
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
};

const goTo = (idx) => { current = idx; updateSlider(); };
prevBtn && prevBtn.addEventListener('click', () => { current--; updateSlider(); });
nextBtn && nextBtn.addEventListener('click', () => { current++; updateSlider(); });

updateSlider();
window.addEventListener('resize', updateSlider, { passive: true });

// Auto-advance
let autoSlide = setInterval(() => {
  const vis = VISIBLE();
  current = (current + 1) % Math.max(1, cards.length - vis + 1);
  updateSlider();
}, 5000);

track.addEventListener('mouseenter', () => clearInterval(autoSlide));
track.addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => {
    const vis = VISIBLE();
    current = (current + 1) % Math.max(1, cards.length - vis + 1);
    updateSlider();
  }, 5000);
});

/* ================================================================
   7. MAGNETIC BUTTONS
================================================================ */
const magnetBtns = qsa('.btn-magnetic');

if (window.matchMedia('(pointer: fine)').matches) {
  magnetBtns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ================================================================
   8. SMOOTH SCROLL (for older Safari)
================================================================ */
qsa('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = qs(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav ? nav.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ================================================================
   9. BOOKING FORM
================================================================ */
const form = qs('#bookingForm');
const successEl = qs('#bookingSuccess');

form && form.addEventListener('submit', e => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span>Enviando…</span>';
  btn.disabled = true;

  // Simulate API call (replace with real endpoint)
  setTimeout(() => {
    form.style.opacity = '0';
    form.style.pointerEvents = 'none';
    successEl.classList.add('visible');

    // Reset after 6 seconds for re-use
    setTimeout(() => {
      form.reset();
      form.style.opacity = '1';
      form.style.pointerEvents = '';
      successEl.classList.remove('visible');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }, 6000);
  }, 1000);
});

/* ================================================================
   10. HERO ENTRANCE ANIMATION TRIGGER
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Trigger hero reveals immediately
  const heroReveals = qsa('#heroContent .reveal-up, #heroContent .reveal-title');
  heroReveals.forEach(el => {
    setTimeout(() => el.classList.add('revealed'), 100);
  });
  // Hero float card
  const floatCard = qs('.hero-float-card');
  if (floatCard) {
    setTimeout(() => floatCard.classList.add('revealed'), 900);
  }
});

/* ================================================================
   11. SERVICE ITEMS — track hover for cursor
================================================================ */
qsa('.service-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-hover');
  });
  item.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-hover');
  });
});

/* ================================================================
   12. HOURS — real-time open/closed (Europe/Madrid = Ibiza)
================================================================ */
const SCHEDULE = {
  1: { open: 10, close: 20 },
  2: { open: 10, close: 20 },
  3: { open: 10, close: 20 },
  4: { open: 10, close: 20 },
  5: { open: 10, close: 20 },
  6: { open: 10, close: 14 },
  0: null
};

const updateHours = () => {
  const statusEl   = qs('#hoursStatus');
  const dotEl      = qs('#statusDot');
  const labelEl    = qs('#statusLabel');
  const localTimeEl = qs('#hoursLocalTime');
  if (!statusEl) return;

  const now = new Date();
  const ibizaStr = now.toLocaleString('en-GB', { timeZone: 'Europe/Madrid' });
  // "DD/MM/YYYY, HH:MM:SS"
  const [, timeStr] = ibizaStr.split(', ');
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const dayOfWeek = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
  ).getDay();

  const schedule = SCHEDULE[dayOfWeek];
  const minutesNow = h * 60 + m;
  const isOpen = schedule
    ? minutesNow >= schedule.open * 60 && minutesNow < schedule.close * 60
    : false;

  // Badge
  statusEl.className = 'hours-status ' + (isOpen ? 'is-open' : 'is-closed');
  labelEl.textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora';
  localTimeEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} · Ibiza`;

  // Highlight today in the hours table
  qsa('.htable-row').forEach(row => {
    const rDay = parseInt(row.dataset.day, 10);
    // row data-day="1" covers Mon–Fri (days 1–5), day "6" = Sat, "0" = Sun
    const isToday = rDay === 0
      ? dayOfWeek === 0
      : rDay === 6
        ? dayOfWeek === 6
        : (dayOfWeek >= 1 && dayOfWeek <= 5);
    row.classList.toggle('today', isToday);
  });
};

updateHours();
setInterval(updateHours, 30000);
