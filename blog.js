/* =========================================
   BLOG PAGE JS
   ========================================= */

/* ── STARFIELD ──────────────────────────── */
(function initStars() {
    const canvas = document.getElementById("stars");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    const STAR_COUNT = 220;

    function resize() {
        canvas.width = window.innerWidth;
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
                offset: Math.random() * Math.PI * 2
            });
        }
    }
    function draw(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of stars) {
            const twinkle = 0.6 + 0.4 * Math.sin(t * 0.001 * s.speed + s.offset);
            ctx.globalAlpha = s.alpha * twinkle;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    let raf;
    function loop(t) {
        draw(t);
        raf = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", () => {
        cancelAnimationFrame(raf);
        resize();
        raf = requestAnimationFrame(loop);
    });
    resize();
    raf = requestAnimationFrame(loop);
})();

/* ── RANDOM QUOTE (DAILY) ─────────────────────── */
(function initDailyQuote() {
    const quoteEl = document.getElementById("quote-text");
    if (!quoteEl) return;

    const STORAGE_KEY = "daily_quote";
    const LAST_FETCH_KEY = "quote_last_fetch";

    async function fetchQuotes() {
        try {
            const response = await fetch("quotes.json");
            const data = await response.json();
            return data.quotes;
        } catch (error) {
            console.error("Failed to load quotes:", error);
            return null;
        }
    }

    function getDailyQuote(quotes) {
        // Use date string to ensure same quote all day
        const today = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            hash = (hash << 5) - hash + today.charCodeAt(i);
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

/* ── THOUGHTS SYSTEM WITH SMOOTH ANIMATION ────── */
(async function initThoughts() {
    try {
        const response = await fetch("thoughts.json");
        const thoughts = await response.json();

        const latestThought = thoughts[thoughts.length - 1];
        const latestDate = document.getElementById("latest-date");
        const latestContent = document.getElementById("latest-content");
        const seeMoreBtn = document.getElementById("see-more-thoughts");
        const allThoughtsDiv = document.getElementById("all-thoughts");
        const thoughtsList = document.getElementById("thoughts-list");
        const closeBtn = document.getElementById("close-thoughts");

        // Display latest thought
        latestDate.textContent = latestThought.date;
        latestContent.textContent = latestThought.content;

        // Build all thoughts list (excluding latest)
        const olderThoughts = thoughts.slice(0, -1).reverse();
        olderThoughts.forEach((thought, index) => {
            const thoughtDiv = document.createElement("div");
            thoughtDiv.className = "thought-item mb-4";
            thoughtDiv.innerHTML = `
                <p class="font-['DM_Mono'] text-xs text-white/40 mb-2">${thought.date}</p>
                <p class="font-['DM_Mono'] text-sm leading-relaxed text-white/70">${thought.content}</p>
            `;
            thoughtsList.appendChild(thoughtDiv);
        });

        // See More button handler
        seeMoreBtn.addEventListener("click", () => {
            // Hide see more button
            seeMoreBtn.classList.add("hide");

            // Show the thoughts container
            allThoughtsDiv.classList.add("show");

            // Show close button
            setTimeout(() => {
                closeBtn.classList.add("show");
            }, 200);

            // Animate each thought item
            const thoughtItems = document.querySelectorAll(".thought-item");
            thoughtItems.forEach((item, i) => {
                setTimeout(() => {
                    item.classList.add("show");
                }, i * 100);
            });
        });

        // Close button handler
        closeBtn.addEventListener("click", () => {
            // Hide close button
            closeBtn.classList.remove("show");

            // Hide all thought items
            const thoughtItems = document.querySelectorAll(".thought-item");
            thoughtItems.forEach((item) => {
                item.classList.remove("show");
            });

            // Collapse the thoughts container
            allThoughtsDiv.classList.remove("show");

            // Show see more button
            setTimeout(() => {
                seeMoreBtn.classList.remove("hide");
            }, 400);
        });
    } catch (error) {
        console.error("Failed to load thoughts:", error);
    }
})();

/* ── IMAGE PRELOADING OPTIMIZATION ───────────────── */
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.loading = "eager";
        img.src = url;
    });
}


/* ── TRAVELS SYSTEM WITH POLAROID CARDS ───────────── */
(async function initTravels() {
    try {
        const response = await fetch("travels.json");
        const travels = await response.json();
        const travelsGrid = document.getElementById("travels-grid");

        // Create modal for travel images
        const modal = document.createElement("div");
        modal.id = "travel-modal";
        modal.className = "project-modal";
        modal.innerHTML = `
  <div class="modal-overlay"></div>
  <div class="modal-container">
    <button class="modal-close" aria-label="Close modal">✕</button>
    <div class="modal-content">
      <img id="modal-image" src="" alt="Travel preview">
    </div>
  </div>
`;
        document.body.appendChild(modal);

        const modalOverlay = modal.querySelector(".modal-overlay");
        const modalClose = modal.querySelector(".modal-close");
        const modalImage = document.getElementById("modal-image");
        const modalContent = modal.querySelector(".modal-content");

        function openModal(imageSrc) {
            if (!imageSrc) return;
            modalImage.src = imageSrc;
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeModal() {
            modal.classList.remove("active");
            document.body.style.overflow = "";
            if (modalContent) modalContent.scrollTop = 0;
            setTimeout(() => {
                if (!modal.classList.contains("active")) {
                    modalImage.src = "";
                }
            }, 300);
        }

        // Close on X button
        modalClose.addEventListener("click", closeModal);

        // Close on overlay click (outside the image container)
        modalOverlay.addEventListener("click", closeModal);

        // Close on ESC key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                closeModal();
            }
        });

        // Prevent clicks on the modal container from closing (only overlay should close)
        const modalContainer = modal.querySelector(".modal-container");
        modalContainer.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Also prevent clicks on the image from closing
        modalImage.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Create polaroid-style travel cards with optimized images
        travels.forEach((travel) => {
            const card = document.createElement("div");
            card.className = "travel-card";
            card.setAttribute("data-modal-image", travel.longImage || travel.image);
            card.innerHTML = `
        <div class="travel-img-wrapper">
            <img
                src="${travel.image}"
                alt="${travel.title}"
                loading="lazy"
                decoding="async"
                onerror="this.parentElement.classList.add('img-missing'); this.style.display='none'"
            />
        </div>
        <div class="travel-body">
            <div class="travel-header">
                <div class="travel-location">${travel.location}</div>
                <div class="travel-date">${travel.date}</div>
            </div>
            <div class="travel-title">${travel.title}</div>
        </div>
    `;

            card.style.cursor = "pointer";
            card.addEventListener("click", (e) => {
                if (e.target.closest("a, button")) return;
                const imgSrc = card.dataset.modalImage;
                openModal(imgSrc);
            });

            travelsGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to load travels:", error);
    }
})();
