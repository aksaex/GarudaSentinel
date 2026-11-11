/* ═══════════════════════════════════════════════════════════════
   GARUDA SENTINEL · SCRIPT.JS
   Modern Interactive Layer
   Kartika Cyber Hackathon 2026
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.matchMedia('(min-width: 960px)').matches;

  /* ─────────────────────────────────────────────
     MODULE 1 — NAVBAR SCROLL EFFECT
     ───────────────────────────────────────────── */
  function initNavScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;
    const update = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 20);
      ticking = false;
    };

    update();
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     MODULE 2 — MOBILE MENU TOGGLE
     ───────────────────────────────────────────── */
  function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const close = () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu');
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { if (!isDesktop()) close(); });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    // Reset on resize to desktop
    window.addEventListener('resize', () => {
      if (isDesktop() && menu.classList.contains('is-open')) close();
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     MODULE 3 — SCROLL REVEAL
     ───────────────────────────────────────────── */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    targets.forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────────────
     MODULE 4 — NAV ACTIVE STATE
     ───────────────────────────────────────────── */
  function initNavActive() {
    const links = document.querySelectorAll('.nav-menu a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const sections = Array.from(links)
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    if (!sections.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          links.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(s => io.observe(s));
  }

  /* ─────────────────────────────────────────────
     MODULE 5 — COUNTER ANIMATION
     ───────────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(el => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        el.textContent = target.toFixed(decimals);
      });
      return;
    }

    const animate = (el) => {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = current.toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────────────
     MODULE 6 — SMOOTH SCROLL FALLBACK
     ───────────────────────────────────────────── */
  function initSmoothScroll() {
    if ('scrollBehavior' in document.documentElement.style) return;

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ─────────────────────────────────────────────
     MODULE 7 — FOOTER YEAR
     ───────────────────────────────────────────── */
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /* ─────────────────────────────────────────────
     SAFE INIT
     ───────────────────────────────────────────── */
  const safe = (fn) => {
    try { fn(); } catch (err) {
      if (window.console?.warn) console.warn('[GARUDA]', err);
    }
  };

  const init = () => {
    safe(initNavScroll);
    safe(initMobileMenu);
    safe(initReveal);
    safe(initNavActive);
    safe(initCounters);
    safe(initSmoothScroll);
    safe(initFooterYear);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
