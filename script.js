/* =============================================================
   bhaveshjain.com — script.js (core)
   Loaded on every page: theme, nav, reveal, scroll chrome, counters.
   ============================================================= */

/* ----- UI wiring on DOMContentLoaded ----- */
document.addEventListener('DOMContentLoaded', () => {

  /* Year stamp(s) */
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const menuToggle = document.querySelector('.menu-toggle, .nav-toggle');
  const menuLinks = document.querySelector('.masthead-nav, .nav-links');
  const setMenu = (open, restoreFocus = false) => {
    if (!menuToggle || !menuLinks) return;
    menuLinks.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle?.addEventListener('click', () => {
    const open = !menuLinks?.classList.contains('open');
    setMenu(open);
    if (open) menuLinks?.querySelector('a')?.focus();
  });
  menuLinks?.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setMenu(false);
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      const target = document.getElementById(href.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuLinks?.classList.contains('open')) {
      setMenu(false, true);
    }
  });
  document.addEventListener('click', event => {
    if (!menuLinks?.contains(event.target) && !menuToggle?.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 641px)').addEventListener('change', () => setMenu(false));
  setMenu(false);
  if (menuToggle && menuLinks) document.documentElement.classList.add('nav-ready');

  /* Scroll-reveal — fades elements with .reveal in once on viewport entry */
  (function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { els.forEach(el => el.classList.add('is-in')); return; }
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  })();

  /* Scroll progress bar — width tracks scroll position */
  (function () {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.width = pct + '%';
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  /* Nav shadow state — adds .is-scrolled when page scrolled past threshold */
  (function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    let lastState = false;
    const update = () => {
      const now = window.scrollY > 32;
      if (now !== lastState) {
        nav.classList.toggle('is-scrolled', now);
        lastState = now;
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* Active nav-link indicator — highlights the nav link for the section you're
     in. Scroll-position based (not a middle-band observer) so it lights up
     every mapped section reliably, including the last ones near the page foot. */
  (function () {
    const items = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'))
      .map(a => ({ a, sec: document.getElementById((a.getAttribute('href') || '').slice(1)) }))
      .filter(x => x.sec);
    if (!items.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const scrollY = window.scrollY;
      const line = scrollY + 110; // just below the sticky nav
      const doc = document.documentElement;
      const atBottom = window.innerHeight + scrollY >= doc.scrollHeight - 2;
      let active = null;
      let bestTop = -Infinity;
      items.forEach(it => {
        const top = it.sec.getBoundingClientRect().top + scrollY;
        if (atBottom) {
          if (top > bestTop) { bestTop = top; active = it; }       // bottom-most section
        } else if (top <= line && top > bestTop) {
          bestTop = top; active = it;                              // nearest section above the line
        }
      });
      items.forEach(it => it.a.classList.toggle('is-active', it === active));
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  /* Counter animation for .record-num[data-target] */
  (function () {
    const nums = [...document.querySelectorAll('.record-num[data-target]')];
    if (!nums.length) return;
    const record = document.getElementById('record');
    const cards = [...(record?.querySelectorAll('.record-card') || [])];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = target + suffix; return; }
      const duration = 1100;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const reveal = () => {
      cards.forEach(card => card.classList.add('is-in'));
      nums.forEach(animate);
    };
    if (reduce || !record || !('IntersectionObserver' in window)) {
      cards.forEach(card => card.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      reveal();
      io.disconnect();
    }, { threshold: 0.08, rootMargin: '0px 0px 18% 0px' });
    io.observe(record);
  })();

  /* Card mouse-glow — track cursor for radial highlight */
  (function () {
    const cards = document.querySelectorAll('.bento-card, .quote-card, .record-card, .post-card');
    if (!cards.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const handle = (e) => {
      const card = e.currentTarget;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    };
    cards.forEach(c => c.addEventListener('mousemove', handle, { passive: true }));
  })();

  /* Tech strip — duplicate items for seamless marquee loop (all viewports) */
  (function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const wrap = document.querySelector('.tech-strip-items');
    if (!wrap) return;
    wrap.innerHTML += wrap.innerHTML;
  })();
});


/* ----- Motion v4 wiring (DOM-ready) ----- */
document.addEventListener('DOMContentLoaded', () => {

  /* Floating scroll-to-top button — injected, shown past 600px scroll */
  (function () {
    if (document.getElementById('to-top')) return;
    const btn = document.createElement('button');
    btn.id = 'to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.setAttribute('title', 'Scroll to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
    document.body.appendChild(btn);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    // Hide once the footer is on screen, otherwise the fixed button sits on top
    // of the footer's right-hand link row.
    const footer = document.querySelector('.footer, .footer-compact');
    let ticking = false;
    const update = () => {
      const past = window.scrollY > 600;
      const overFooter = footer
        ? footer.getBoundingClientRect().top < window.innerHeight - 8
        : false;
      btn.classList.toggle('is-visible', past && !overFooter);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* Page transition fade — soft fade on same-origin navigation
     Uses View Transitions API where supported; falls back to opacity fade. */
  (function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const isInternalNav = (a) => {
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
      const href = a.getAttribute('href');
      if (!href) return false;
      if (href.startsWith('#')) return false;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      try {
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin) return false;
        // Skip pure in-page anchors (same path, only hash differs)
        if (url.pathname === location.pathname && url.search === location.search && url.hash) return false;
        return true;
      } catch { return false; }
    };

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = e.target.closest('a');
      if (!isInternalNav(a)) return;

      // Modern: use View Transitions API if available (Chrome 111+/Edge)
      if ('startViewTransition' in document) return;

      // Fallback: brief opacity fade then navigate
      e.preventDefault();
      document.body.classList.add('is-leaving');
      const href = a.href;
      setTimeout(() => { window.location.href = href; }, 220);
    });

    // Belt-and-braces: clear is-leaving if pageshow fires (back/forward cache)
    window.addEventListener('pageshow', () => {
      document.body.classList.remove('is-leaving');
    });
  })();

});
