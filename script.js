document.addEventListener('DOMContentLoaded', () => {
  setupLanguageToggle();
  initDynamicGallery();
});

/* =========================
   Language toggle (EN / MY)
   ========================= */
function setupLanguageToggle() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const langSections = document.querySelectorAll('.lang-section');

  if (!langButtons.length || !langSections.length) return;

  function setLanguage(lang) {
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    langSections.forEach(sec => {
      if (sec.classList.contains('lang-' + lang)) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  // Default language
  setLanguage('en');
}

/* =========================
   Dynamic gallery slideshow
   ========================= */
function initDynamicGallery() {
  const slidesContainer = document.getElementById('gallery-slides');
  const dotsContainer = document.getElementById('gallery-dots');
  const prevBtn = document.querySelector('.slide-nav.prev');
  const nextBtn = document.querySelector('.slide-nav.next');

  if (!slidesContainer || !dotsContainer) {
    console.warn('Gallery containers not found in DOM.');
    return;
  }

  // Small helper to show error text in UI
  const showError = (msg) => {
    slidesContainer.innerHTML = `<p style="padding:12px;font-size:0.9rem;color:#b91c1c;background:#fee2e2;border-radius:12px;">
      ${msg}
    </p>`;
  };

  // For GitHub Pages: load image list from static JSON file
  // Add cache-buster to avoid old cached JSON when you update it
  fetch('gallery.json?v=' + Date.now())
    .then(res => {
      if (!res.ok) {
        console.error('Failed to fetch gallery.json', res.status, res.statusText);
        showError('Unable to load photo gallery (gallery.json not found).');
        throw new Error('Failed to load gallery.json');
      }
      return res.json();
    })
    .then(images => {
      console.log('Gallery images loaded:', images);

      if (!Array.isArray(images) || images.length === 0) {
        showError('No images defined in gallery.json.');
        return;
      }

      // Build slides & dots dynamically
      images.forEach((item, idx) => {
        const url = item.url;
        if (!url) return; // skip invalid entries

        // Slide figure
        const fig = document.createElement('figure');
        fig.className = 'slide' + (idx === 0 ? ' active' : '');

        const img = document.createElement('img');
        img.src = url;
        img.alt = item.caption || `Gallery photo ${idx + 1}`;

        const cap = document.createElement('figcaption');
        cap.className = 'slide-caption';
        cap.textContent = item.caption || '';

        fig.appendChild(img);
        fig.appendChild(cap);
        slidesContainer.appendChild(fig);

        // Dot
        const dot = document.createElement('button');
        dot.className = 'dot' + (idx === 0 ? ' active' : '');
        dot.dataset.index = String(idx);
        dotsContainer.appendChild(dot);
      });

      const slides = slidesContainer.querySelectorAll('.slide');
      const dots = dotsContainer.querySelectorAll('.dot');

      if (!slides.length) {
        showError('No valid images in gallery.json.');
        return;
      }

      let currentIndex = 0;
      const intervalMs = 5000;
      let autoInterval = null;

      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
      }

      function nextSlide() {
        const newIndex = (currentIndex + 1) % slides.length;
        showSlide(newIndex);
      }

      function prevSlideFn() {
        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(newIndex);
      }

      function restartInterval() {
        if (autoInterval) clearInterval(autoInterval);
        autoInterval = setInterval(nextSlide, intervalMs);
      }

      // Button handlers
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          nextSlide();
          restartInterval();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          prevSlideFn();
          restartInterval();
        });
      }

      // Dot click handlers
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.index, 10);
          if (!Number.isNaN(idx)) {
            showSlide(idx);
            restartInterval();
          }
        });
      });

      // Start auto-rotation
      showSlide(0);
      autoInterval = setInterval(nextSlide, intervalMs);
    })
    .catch(err => {
      console.error('Error loading gallery.json:', err);
      showError('Error loading photo gallery. Please try again later.');
    });
}
