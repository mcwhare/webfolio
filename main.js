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
