/* ═══════════════════════════════════════════════════════════════
   GARUDA SENTINEL // SCRIPT.JS
   Tactical Interactive Layer — v2.0
   Kartika Cyber Hackathon 2026 · PUSSIBERAD
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────
     CONFIG
     ───────────────────────────────────────────── */
  const CONFIG = {
    typingSpeed: 26,
    typingDelay: 700,
    packetsInterval: 1300,
    latencyInterval: 1700,
    revealThreshold: 0.15,
    revealRootMargin: '0px 0px -60px 0px',
    navRootMargin: '-40% 0px -55% 0px'
  };

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     MODULE 1 — TYPING EFFECT
     ───────────────────────────────────────────── */
  const TYPING_TEXT =
    'Triase ancaman real-time. Deteksi anomali proses OT. ' +
    'Dirancang untuk kondisi DIL (Disconnected, Intermittent, Limited) satuan TNI AD.';

  function initTyping() {
    const el = document.getElementById('typing');
    if (!el) return;

    // Respect reduced-motion: langsung tampilkan teks
    if (prefersReducedMotion) {
      el.textContent = TYPING_TEXT;
      return;
    }

    let i = 0;
    function tick() {
      if (i < TYPING_TEXT.length) {
        el.textContent += TYPING_TEXT.charAt(i);
        i++;
        setTimeout(tick, CONFIG.typingSpeed);
      }
    }
    setTimeout(tick, CONFIG.typingDelay);
  }

  /* ─────────────────────────────────────────────
     MODULE 2 — LIVE METRICS
     ───────────────────────────────────────────── */
  function initLiveMetrics() {
    const packetsEl = document.getElementById('packets');
    const latencyEl = document.getElementById('latency');

    if (packetsEl) {
      let packets = 1284902;
      setInterval(() => {
        packets += Math.floor(Math.random() * 220) + 60;
        packetsEl.textContent = packets.toLocaleString('en-US');
      }, CONFIG.packetsInterval);
    }

    if (latencyEl) {
      setInterval(() => {
        const lat = (2.2 + Math.random() * 2.8).toFixed(1);
        latencyEl.textContent = lat + ' ms';
      }, CONFIG.latencyInterval);
    }
  }

  /* ─────────────────────────────────────────────
     MODULE 3 — TICKER DUPLICATION
     (clone children agar loop seamless di -50%)
     ───────────────────────────────────────────── */
  function initTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    // Duplikasi satu kali — animation translateX(-50%) di CSS
    // akan reset tepat saat salinan kedua berada di posisi awal.
    track.innerHTML = track.innerHTML + track.innerHTML;
  }

  /* ─────────────────────────────────────────────
     MODULE 4 — SCROLL REVEAL
     Auto-tag element, watch via IntersectionObserver
     ───────────────────────────────────────────── */
  const REVEAL_TARGETS = [
    '.section-label',
    '.section-title',
    '.feature-card',
    '.live-demo-panel',
    '.founder-inner',
    '.ticker'
  ];

  function initReveal() {
    // Kumpulkan semua target
    const targets = REVEAL_TARGETS.flatMap(sel =>
      Array.from(document.querySelectorAll(sel))
    );

    if (!targets.length) return;

    // Fallback: no IO atau reduced-motion → semua langsung terlihat
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Auto-tag `.reveal` (baru setelah JS aktif, jadi no-JS tetap visible)
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

  /* ─────────────────────────────────────────────
     MODULE 5 — NAV ACTIVE STATE
     Highlight menu sesuai section di viewport
     ───────────────────────────────────────────── */
  function initNavActive() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
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
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        }
      });
    }, {
      rootMargin: CONFIG.navRootMargin,
      threshold: 0
    });

    sections.forEach(s => io.observe(s));
  }

  /* ─────────────────────────────────────────────
     MODULE 6 — SMOOTH SCROLL FALLBACK
     Hanya aktif jika browser tidak support CSS scroll-behavior
     ───────────────────────────────────────────── */
  function initSmoothScrollFallback() {
    if ('scrollBehavior' in document.documentElement.style) return;

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.length < 2) return;

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
     MODULE 7 — KONAMI EASTER EGG
     ↑ ↑ ↓ ↓ ← → ← → B A  →  TACTICAL MODE
     ───────────────────────────────────────────── */
  const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  function initKonami() {
    let pos = 0;

    document.addEventListener('keydown', (e) => {
      // Abaikan jika user sedang mengetik di input/textarea
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === KONAMI_CODE[pos]) {
        pos++;
        if (pos === KONAMI_CODE.length) {
          activateTacticalMode();
          pos = 0;
        }
      } else {
        pos = (key === KONAMI_CODE[0]) ? 1 : 0;
      }
    });
  }

  function activateTacticalMode() {
    document.body.classList.add('tactical-mode');

    const banner = document.createElement('div');
    banner.className = 'tactical-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML =
      '// TACTICAL MODE ENGAGED<br>' +
      '// ALL SYSTEMS OPTIMAL';
    document.body.appendChild(banner);

    setTimeout(() => {
      document.body.classList.remove('tactical-mode');
      banner.remove();
    }, 5000);
  }

  /* ─────────────────────────────────────────────
     MODULE 8 — HEADER SCROLL SHADOW
     Navbar dapat shadow saat scroll > 20px
     ───────────────────────────────────────────── */
  function initNavShadow() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        nav.classList.toggle('is-scrolled', window.scrollY > 20);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     MODULE 9 — SAFE INIT
     ───────────────────────────────────────────── */
  function safeCall(fn) {
    try { fn(); } catch (err) {
      // Silent fail — jangan sampai satu modul menghambat modul lain
      if (window.console && console.warn) {
        console.warn('[GARUDA SENTINEL] Module error:', err);
      }
    }
  }

  function init() {
    safeCall(initTyping);
    safeCall(initLiveMetrics);
    safeCall(initTicker);
    safeCall(initReveal);
    safeCall(initNavActive);
    safeCall(initSmoothScrollFallback);
    safeCall(initKonami);
    safeCall(initNavShadow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();