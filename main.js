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

/* ── PROJECT CARD FADE-IN ON SCROLL ──────────────── */
(function initProjectFadeIn() {
  const projectCards = document.querySelectorAll('.project-card');
  if (!projectCards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.25, // Trigger when 15% of card is visible
    rootMargin: '0px 0px -20px 0px' // Slight offset
  });

  projectCards.forEach(card => {
    observer.observe(card);
  });
})();

/* ── BLOG CARD FADE-IN ON SCROLL ──────────────── */
(function initBlogFadeIn() {
  const blogCards = document.querySelectorAll('.blog-card');
  if (!blogCards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -20px 0px'
  });

  blogCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
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

/* ── RANDOM QUOTE (DAILY) ─────────────────────── */
(function initDailyQuote() {
  const quoteEl = document.getElementById('quote-text');
  if (!quoteEl) return;

  const STORAGE_KEY = 'daily_quote';
  const LAST_FETCH_KEY = 'quote_last_fetch';

  async function fetchQuotes() {
    try {
      const response = await fetch('quotes.json');
      const data = await response.json();
      return data.quotes;
    } catch (error) {
      console.error('Failed to load quotes:', error);
      return null;
    }
  }

  function getDailyQuote(quotes) {
    // Use date string to ensure same quote all day
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % quotes.length;
    return quotes[index];
  }

  async function updateQuote() {
    let quoteData = null;

    // Check if we already have today's quote in sessionStorage
    const storedQuote = sessionStorage.getItem(STORAGE_KEY);
    const lastFetch = sessionStorage.getItem(LAST_FETCH_KEY);
    const today = new Date().toDateString();

    if (storedQuote && lastFetch === today) {
      quoteData = JSON.parse(storedQuote);
    } else {
      const quotes = await fetchQuotes();
      if (quotes) {
        quoteData = getDailyQuote(quotes);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(quoteData));
        sessionStorage.setItem(LAST_FETCH_KEY, today);
      }
    }

    if (quoteData) {
      quoteEl.textContent = `"${quoteData.text}" — ${quoteData.author}`;
    } else {
      quoteEl.textContent = '"Yeah, idk what to put here."  — Me';
    }
  }

  updateQuote();
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


/* ── PROJECT MODAL FOR LONG IMAGES ──────────────── */
(function initProjectModals() {
  // Check if modal already exists
  if (document.getElementById('project-modal')) return;

  // Create modal element
  const modal = document.createElement('div');
  modal.id = 'project-modal';
  modal.className = 'project-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-container">
      <button class="modal-close" aria-label="Close modal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="modal-content">
        <img id="modal-image" src="" alt="Project preview">
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalOverlay = modal.querySelector('.modal-overlay');
  const modalClose = modal.querySelector('.modal-close');
  const modalImage = document.getElementById('modal-image');
  const modalContent = modal.querySelector('.modal-content');

  // Function to open modal
  function openModal(imageSrc) {
    if (!imageSrc) {
      console.error('No image source provided');
      return;
    }
    console.log('Opening modal with image:', imageSrc);
    modalImage.src = imageSrc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Function to close modal
  function closeModal() {
    console.log('Closing modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset scroll position
    if (modalContent) modalContent.scrollTop = 0;
    // Clear image src after animation
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        modalImage.src = '';
      }
    }, 300);
  }

  // Close handlers
  modalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  modalOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Find all project cards and attach click handlers
  function attachModalHandlers() {
    const projectCards = document.querySelectorAll('.project-card');
    console.log('Found project cards:', projectCards.length);

    projectCards.forEach((card) => {
      // Remove existing listener to avoid duplicates
      if (card._modalHandler) {
        card.removeEventListener('click', card._modalHandler);
      }

      // Create handler
      const handler = function(e) {
        // Don't open modal if clicking on interactive elements inside the card
        if (e.target.closest('a, button, .see-more-btn')) {
          console.log('Clicked on interactive element, skipping modal');
          return;
        }

        console.log('Project card clicked');

        // Get image from data-modal-image attribute
        let imageSrc = card.dataset.modalImage;

        // If not set, try to get from the image inside the card
        if (!imageSrc) {
          const cardImg = card.querySelector('img');
          if (cardImg && cardImg.src) {
            // Replace preview with long version (e.g., preview.png -> long.png)
            imageSrc = cardImg.src.replace('preview', 'long');
            // Or use a default pattern
            if (imageSrc === cardImg.src) {
              imageSrc = null;
            }
          }
        }

        // If still no image, show a placeholder
        if (!imageSrc) {
          console.warn('No modal image found for card, using placeholder');
          imageSrc = 'https://placehold.co/800x2000/1a1a1a/ffffff?text=Long+Image+Preview';
        }

        openModal(imageSrc);
      };

      card._modalHandler = handler;
      card.addEventListener('click', handler);
      card.style.cursor = 'pointer';
    });
  }

  // Initial attachment
  attachModalHandlers();

  // Also watch for dynamically added cards (if any)
  const observer = new MutationObserver(() => {
    attachModalHandlers();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('Modal system initialized');
})();

/* =========================================
   BUBBLES — one gravity well per heading
   Load AFTER main.js.
   About-me bubbles: float in place, hover to enlarge.
   Skill tags: each heading owns the tags that follow it
   in the HTML. Those tags are pulled to a well under that
   heading, repel each other, and stay inside their own
   lane so groups never mix. Draggable in fields marked
   data-draggable.
   ========================================= */
(function initFloatingBubbles() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── TUNING ─────────────────────────────── */
  const HOVER_SCALE = 1.12;  // enlarge on hover
  const DRAG_SCALE  = 1.18;  // enlarge while dragging

  const WELL_DROP   = 0.5;   // well height: 0 = just under heading, 1 = bottom of field
  const GRAVITY     = 3.2;   // pull toward the well; higher = tighter cluster
  const REPEL       = 1400;  // strength of the push between tags in a group
  const REPEL_RANGE = 45;    // px of gap over which the push fades out
  const WANDER      = reduceMotion ? 0 : 70; // drift so clusters keep breathing
  const DAMPING     = 2.2;   // lower = floatier / bouncier
  const MAX_SPEED   = 900;   // px/s safety cap
  const PADDING     = 6;     // keep tags this far inside their lane

  const rand = (a, b) => a + Math.random() * (b - a);
  const isMobile = () => window.innerWidth <= 640;

  const bodies = [];
  const fields = [];

  /* ── ABOUT-ME BUBBLES (float in place) ──── */
  document.querySelectorAll('.tag-bubble').forEach(el => {
    const b = {
      el, s: 1, ts: 1,
      ax: reduceMotion ? 0 : rand(4, 9),
      ay: reduceMotion ? 0 : rand(5, 11),
      fx: rand(0.25, 0.55), fy: rand(0.3, 0.6),
      px: rand(0, 6.28),    py: rand(0, 6.28),
      update(t, dt) {
        this.s += (this.ts - this.s) * Math.min(1, dt * 12);
        const x = this.ax * Math.sin(t * this.fx + this.px) + this.ax * 0.4 * Math.sin(t * this.fx * 2.3 + this.py);
        const y = this.ay * Math.cos(t * this.fy + this.py) + this.ay * 0.4 * Math.cos(t * this.fy * 1.9 + this.px);
        el.style.setProperty('--x', x.toFixed(2) + 'px');
        el.style.setProperty('--y', y.toFixed(2) + 'px');
        el.style.setProperty('--s', this.s.toFixed(3));
      },
    };
    el.addEventListener('pointerenter', () => { b.ts = HOVER_SCALE; el.style.zIndex = 5; });
    el.addEventListener('pointerleave', () => { b.ts = 1; el.style.zIndex = ''; });
    bodies.push(b);
  });

  /* ── SKILL TAG FIELDS ───────────────────── */
  document.querySelectorAll('.bubble-field').forEach(fieldEl => {
    const field = {
      el: fieldEl,
      draggable: fieldEl.hasAttribute('data-draggable'),
      W: 0, H: 0,
      onScreen: false,
      groups: [],
    };

    // A group = a .bubble-heading plus every .skill-tag that follows it (until the next heading)
    let group = null;
    function newGroup(heading) {
      group = {
        field, heading, tags: [],
        gx: 0, gy: 0,                       // well centre (px, field coords)
        minX: 0, maxX: 0, minY: 0, maxY: 0, // lane bounds
      };
      field.groups.push(group);
    }

    Array.from(fieldEl.children).forEach(child => {
      if (child.classList.contains('bubble-heading')) {
        newGroup(child);
      } else if (child.classList.contains('skill-tag')) {
        if (!group) newGroup(null);
        const tag = {
          el: child, field, group,
          cx: parseFloat(child.dataset.cx) / 100,   // only sets the START position
          cy: parseFloat(child.dataset.cy) / 100,
          w: 0, h: 0,
          x: 0, y: 0, vx: 0, vy: 0,
          s: 1, ts: 1,
          dragging: false,
          fx: rand(0.2, 0.5), fy: rand(0.2, 0.5),
          px: rand(0, 6.28),  py: rand(0, 6.28),
          placed: false,
        };
        group.tags.push(tag);

        child.addEventListener('pointerenter', () => { if (!tag.dragging) tag.ts = HOVER_SCALE; child.style.zIndex = 5; });
        child.addEventListener('pointerleave', () => { if (!tag.dragging) { tag.ts = 1; child.style.zIndex = ''; } });

        if (field.draggable) attachDrag(tag);
      }
    });

    field.groups = field.groups.filter(g => g.tags.length);
    fields.push(field);
  });

  function clampTag(t) {
    const g = t.group;
    const left = g.minX + t.w / 2 + PADDING, right = g.maxX - t.w / 2 - PADDING;
    const top  = g.minY + t.h / 2 + PADDING, bottom = g.maxY - t.h / 2 - PADDING;
    if (t.x < left)   { t.x = left;   if (t.vx < 0) t.vx = 0; }
    if (t.x > right)  { t.x = right;  if (t.vx > 0) t.vx = 0; }
    if (t.y < top)    { t.y = top;    if (t.vy < 0) t.vy = 0; }
    if (t.y > bottom) { t.y = bottom; if (t.vy > 0) t.vy = 0; }
  }

  function measure(field) {
    field.W = field.el.offsetWidth;
    field.H = field.el.offsetHeight;
    const fr = field.el.getBoundingClientRect();

    // well + vertical limits come from each group's heading
    field.groups.forEach(g => {
      if (g.heading) {
        const r = g.heading.getBoundingClientRect();
        g.gx = r.left + r.width / 2 - fr.left;
        g.minY = r.bottom - fr.top;
      } else {
        g.gx = field.W / 2;
        g.minY = 0;
      }
      g.maxY = field.H;
      g.gy = g.minY + (g.maxY - g.minY) * WELL_DROP;
    });

    // lanes: split the field between neighbouring wells at their midpoint
    const sorted = field.groups.slice().sort((a, b) => a.gx - b.gx);
    sorted.forEach((g, i) => {
      g.minX = i === 0 ? 0 : (sorted[i - 1].gx + g.gx) / 2;
      g.maxX = i === sorted.length - 1 ? field.W : (g.gx + sorted[i + 1].gx) / 2;
    });

    field.groups.forEach(g => g.tags.forEach(t => {
      t.w = t.el.offsetWidth;   // offset* ignores transforms, so scaling doesn't skew this
      t.h = t.el.offsetHeight;
      if (!t.placed) { t.x = t.cx * field.W; t.y = t.cy * field.H; t.placed = true; }
      clampTag(t);
    }));
  }

  /* ── DRAGGING ───────────────────────────── */
  function attachDrag(tag) {
    const el = tag.el;
    let offX = 0, offY = 0, lastX = 0, lastY = 0, lastT = 0;

    function toField(e) {
      const r = tag.field.el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    el.addEventListener('pointerdown', e => {
      if (isMobile()) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const p = toField(e);
      offX = p.x - tag.x; offY = p.y - tag.y;
      lastX = tag.x; lastY = tag.y; lastT = performance.now();
      tag.dragging = true;
      tag.ts = DRAG_SCALE;
      tag.vx = tag.vy = 0;
      el.classList.add('is-dragging');
      el.style.zIndex = 10;
    });

    el.addEventListener('pointermove', e => {
      if (!tag.dragging) return;
      const p = toField(e);
      const tx = p.x - offX, ty = p.y - offY;

      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      tag.vx = tag.vx * 0.6 + ((tx - lastX) / dt) * 0.4;
      tag.vy = tag.vy * 0.6 + ((ty - lastY) / dt) * 0.4;
      lastX = tx; lastY = ty; lastT = now;

      tag.x = tx; tag.y = ty;
      clampTag(tag);          // a dragged tag can't leave its own lane
    });

    function release(e) {
      if (!tag.dragging) return;
      tag.dragging = false;
      tag.ts = 1;
      el.classList.remove('is-dragging');
      el.style.zIndex = '';
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
  }

  /* ── PHYSICS ────────────────────────────── */
  // radius of a tag's pill (treated as an ellipse) along direction (ux, uy)
  function radiusAlong(t, ux, uy) {
    const a = (t.w * t.s) / 2, b = (t.h * t.s) / 2;
    return (a * b) / Math.sqrt((b * ux) ** 2 + (a * uy) ** 2);
  }

  function stepGroup(g, t, dt) {
    const tags = g.tags;

    for (const tag of tags) {
      tag.s += (tag.ts - tag.s) * Math.min(1, dt * 12);
      if (tag.dragging) continue;

      // gravity well under this group's heading
      let ax = (g.gx - tag.x) * GRAVITY;
      let ay = (g.gy - tag.y) * GRAVITY;

      ax += Math.sin(t * tag.fx + tag.px) * WANDER;
      ay += Math.cos(t * tag.fy + tag.py) * WANDER;

      tag.vx += (ax - tag.vx * DAMPING) * dt;
      tag.vy += (ay - tag.vy * DAMPING) * dt;
    }

    // repulsion within the group, measured edge-to-edge
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const a = tags[i], b = tags[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.01) { dx = rand(-1, 1); dy = rand(-1, 1); dist = Math.hypot(dx, dy); }
        const ux = dx / dist, uy = dy / dist;

        const gap = dist - radiusAlong(a, ux, uy) - radiusAlong(b, ux, uy);
        const gc = Math.max(gap, -25);
        let force = REPEL * Math.exp(-gc / REPEL_RANGE);
        if (gap < 0) force += -gap * 60;

        const aw = a.dragging ? 0 : 1;
        const bw = b.dragging ? 0 : 1;
        a.vx -= ux * force * aw * dt; a.vy -= uy * force * aw * dt;
        b.vx += ux * force * bw * dt; b.vy += uy * force * bw * dt;
      }
    }

    for (const tag of tags) {
      if (!tag.dragging) {
        const sp = Math.hypot(tag.vx, tag.vy);
        if (sp > MAX_SPEED) { tag.vx *= MAX_SPEED / sp; tag.vy *= MAX_SPEED / sp; }
        tag.x += tag.vx * dt;
        tag.y += tag.vy * dt;
        clampTag(tag);
      }
      tag.el.style.setProperty('--x', (tag.x - tag.w / 2).toFixed(2) + 'px');
      tag.el.style.setProperty('--y', (tag.y - tag.h / 2).toFixed(2) + 'px');
      tag.el.style.setProperty('--s', tag.s.toFixed(3));
    }
  }

  /* ── LOOP ───────────────────────────────── */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    for (const b of bodies) b.update(t, dt);

    if (!isMobile()) {
      for (const f of fields) {
        if (f.onScreen) f.groups.forEach(g => stepGroup(g, t, dt));
      }
    }
    requestAnimationFrame(frame);
  }

  /* ── SETUP ──────────────────────────────── */
  function measureAll() { fields.forEach(measure); }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const f = fields.find(x => x.el === e.target);
      if (f) {
        f.onScreen = e.isIntersecting;
        if (e.isIntersecting) measure(f);
      }
    });
  }, { rootMargin: '100px' });
  fields.forEach(f => io.observe(f.el));

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.skill-tag').forEach((tag, i) => {
        setTimeout(() => tag.classList.add('visible'), i * 75);
      });
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  fields.forEach(f => reveal.observe(f.el));

  window.addEventListener('resize', measureAll);
  window.addEventListener('load', measureAll);   // fonts change tag widths
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);

  measureAll();
  requestAnimationFrame(frame);
})();
