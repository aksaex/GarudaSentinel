/* ═══════════════════════════════════════════════════════════════
   GARUDA SENTINEL // SCRIPT.JS
   Interactive Layer — v1.1
   Kartika Cyber Hackathon 2026
   v1.1: Tambah reveal selector untuk Roadmap + Sovereign Statement
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────
     CONFIG
     ───────────────────────────────────────────── */
  const CONFIG = {
    navbarScrollThreshold: 20,
    revealThreshold: 0.15,
    revealRootMargin: '0px 0px -80px 0px',
    counterDuration: 2000,
    counterOffset: 150
  };

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  /* ══════════════════════════════════════════════
     MODULE 1 — NAVBAR SCROLL DETECTION
     ══════════════════════════════════════════════ */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    function update() {
      const shouldScroll = window.scrollY > CONFIG.navbarScrollThreshold;
      navbar.classList.toggle('is-scrolled', shouldScroll);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ══════════════════════════════════════════════
     MODULE 2 — MOBILE MENU TOGGLE
     ══════════════════════════════════════════════ */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');

    if (!toggle || !menu || !navbar) return;

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Tutup menu navigasi');
      toggle.classList.add('is-open');
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu navigasi');
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      const isOpen = toggle.classList.contains('is-open');
      isOpen ? close() : open();
    }

    toggle.addEventListener('click', toggleMenu);

    menu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!menu.classList.contains('is-open')) return;
      if (navbar.contains(e.target)) return;
      close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && menu.classList.contains('is-open')) {
        close();
      }
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════
     MODULE 3 — SCROLL REVEAL
     v1.1: ditambahkan .roadmap-card & .sovereign-statement
     ══════════════════════════════════════════════ */
  const REVEAL_SELECTORS = [
    '.section-header',
    '.tech-strip',
    '.metrics__grid',
    '.feature-card',
    '.arch-layer',
    '.perf-card',
    '.perf-note',
    '.access-card',
    '.roadmap-card',
    '.sovereign-statement',
    '.founder__photo',
    '.founder__content'
  ];

  function initReveal() {
    const targets = REVEAL_SELECTORS.flatMap(sel =>
      Array.from(document.querySelectorAll(sel))
    );

    if (!targets.length) return;

    if (prefersReducedMotion || !supportsIO) {
      targets.forEach(el => el.classList.add('reveal', 'is-visible'));
      return;
    }

    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.revealThreshold,
      rootMargin: CONFIG.revealRootMargin
    });

    targets.forEach(el => io.observe(el));
  }

  /* ══════════════════════════════════════════════
     MODULE 4 — METRIC COUNTER ANIMATION
     ══════════════════════════════════════════════ */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const duration = CONFIG.counterDuration;

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = target * eased;
      const display = Math.round(current);

      el.textContent = display + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    if (!supportsIO || prefersReducedMotion) {
      counters.forEach(el => {
        el.textContent = (el.dataset.target || '0') + (el.dataset.suffix || '');
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -80px 0px'
    });

    counters.forEach(el => io.observe(el));
  }

  /* ══════════════════════════════════════════════
     MODULE 5 — NAV ACTIVE STATE
     ══════════════════════════════════════════════ */
  function getAbsoluteTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function initNavActive() {
    const links = Array.from(
      document.querySelectorAll('.navbar__link[href^="#"]')
    );
    if (!links.length) return;

    const sections = links.map(link => ({
      link,
      href: link.getAttribute('href'),
      section: document.querySelector(link.getAttribute('href'))
    })).filter(item => item.section);

    if (!sections.length) return;

    let ticking = false;

    function update() {
      const probeLine = window.scrollY + CONFIG.counterOffset;
      let activeSection = null;

      for (const item of sections) {
        const top = getAbsoluteTop(item.section);
        const bottom = top + item.section.offsetHeight;

        if (probeLine >= top && probeLine < bottom) {
          activeSection = item;
          break;
        }
      }

      if (!activeSection) {
        const last = sections[sections.length - 1];
        if (probeLine >= getAbsoluteTop(last.section)) {
          activeSection = last;
        }
      }

      sections.forEach(item => {
        item.link.classList.toggle('is-active', item === activeSection);
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ══════════════════════════════════════════════
     MODULE 6 — SMOOTH SCROLL FALLBACK
     ══════════════════════════════════════════════ */
  function initSmoothScrollFallback() {
    if ('scrollBehavior' in document.documentElement.style) return;

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const offset = 88;
        const top = getAbsoluteTop(target) - offset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ══════════════════════════════════════════════
     SAFE INIT WRAPPER
     ══════════════════════════════════════════════ */
  function safe(fn) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[GARUDA SENTINEL] Module error:', err);
      }
    }
  }

  function init() {
    safe(initNavbarScroll);
    safe(initMobileMenu);
    safe(initReveal);
    safe(initCounters);
    safe(initNavActive);
    safe(initSmoothScrollFallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
