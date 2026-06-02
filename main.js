/* =========================================
   MARCUS CHAN — PORTFOLIO JS
   main.js
   ========================================= */

/* ── STARFIELD ──────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 220;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
    buildStars();
  }
  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.7 + 0.15,
        speed: Math.random() * 0.4 + 0.05,
        offset: Math.random() * Math.PI * 2,
      });
    }
  }
  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const twinkle = 0.6 + 0.4 * Math.sin(t * 0.001 * s.speed + s.offset);
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  let raf;
  function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); raf = requestAnimationFrame(loop); });
  resize();
  raf = requestAnimationFrame(loop);
})();


/* ── POSITION SKILL TAGS ────────────────── */
/*
   data-cx / data-cy = position as % of bubble-field container
   Tag is centred on that point: left = cx*W - tagW/2, top = cy*H - tagH/2
*/
(function initBubbleFields() {
  const fields = document.querySelectorAll('.bubble-field');
  if (!fields.length) return;

  function isMobile() { return window.innerWidth <= 640; }

  function positionTags(field) {
    if (isMobile()) return;
    const W = field.offsetWidth;
    const H = field.offsetHeight;
    field.querySelectorAll('.skill-tag').forEach(tag => {
      const cx = parseFloat(tag.dataset.cx) / 100;
      const cy = parseFloat(tag.dataset.cy) / 100;
      const tw = tag.offsetWidth;
      const th = tag.offsetHeight;
      tag.style.left = Math.round(cx * W - tw / 2) + 'px';
      tag.style.top  = Math.round(cy * H - th / 2) + 'px';
    });
  }

  fields.forEach(positionTags);
  window.addEventListener('resize', () => fields.forEach(positionTags));

  // Staggered reveal on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const tags = Array.from(entry.target.querySelectorAll('.skill-tag'));
      tags.forEach((tag, i) => {
        setTimeout(() => tag.classList.add('visible'), i * 75);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  fields.forEach(f => observer.observe(f));
})();


/* ── FADE-IN FOR ABOUT BUBBLES ──────────── */
(function initFadeTags() {
  const tags = document.querySelectorAll('.fade-tag');
  if (!tags.length) return;
  const groups = new Map();
  tags.forEach(t => {
    const p = t.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(t);
  });
  groups.forEach(group => {
    group.forEach((t, i) => { t.style.transitionDelay = `${i * 0.08}s`; });
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });
  tags.forEach(t => observer.observe(t));
})();


/* ── QUOTE COUNTDOWN ────────────────────── */
(function initQuoteTimer() {
  const el = document.getElementById('quote-timer');
  if (!el) return;
  const KEY = 'quote_refresh_target';
  let target = Number(sessionStorage.getItem(KEY));
  if (!target || target < Date.now()) {
    target = Date.now() + (Math.random() * 23 * 3600 + 1800) * 1000;
    sessionStorage.setItem(KEY, target);
  }
  function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }
  function tick() {
    const d = Math.max(0, target - Date.now());
    const h = Math.floor(d / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    const s = Math.floor((d % 60000) / 1000);
    el.textContent = `refreshes in ${h}h ${pad(m)}m ${pad(s)}s`;
    if (d > 0) setTimeout(tick, 1000);
  }
  tick();
})();


/* ── ACTIVE NAV HIGHLIGHT ───────────────── */
(function initNav() {
  const links    = document.querySelectorAll('.nav-link');
  const sections = ['about','projects','blog'].map(id => document.getElementById(id)).filter(Boolean);
  function onScroll() {
    const y = window.scrollY + window.innerHeight * 0.35;
    let active = null;
    sections.forEach(s => { if (s.offsetTop <= y) active = s.id; });
    links.forEach(l => { l.style.color = l.getAttribute('href') === `#${active}` ? '#fff' : ''; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
