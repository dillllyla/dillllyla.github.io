
// Small helpers for this mini site
(function() {
  // Set active nav link
  const navLinks = document.querySelectorAll('.nav a');
  const here = location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    if ((here === '' && href === 'index.html') || href === here) a.classList.add('active');
  });
  // Simple form handler (demo only — replace with your backend)
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contactForm).entries());
      alert('Thanks, your message was captured (demo).\n\n' + JSON.stringify(data, null, 2));
      contactForm.reset();
    });
  }
})();

const audioPlayer = document.getElementById('audio-player');
const buttons = document.querySelectorAll('.play-btn');

let currentBtn = null;
let currentSrc = null;
let isSwitching = false;

function setBtnState(btn, isPlaying) {
  if (!btn) return;
  btn.textContent = isPlaying ? 'Pause' : 'Play';
  btn.classList.toggle('is-playing', isPlaying);
}

buttons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const src = btn.dataset.audio;

    // Klik lagu baru
    if (src !== currentSrc) {
      isSwitching = true;

      // reset tombol lama
      if (currentBtn && currentBtn !== btn) setBtnState(currentBtn, false);

      // set konteks dulu supaya event berikutnya konsisten
      currentBtn = btn;
      currentSrc = src;

      try {
        // hentikan yang lama & reset waktu
        audioPlayer.pause();
        audioPlayer.currentTime = 0;

        // ganti sumber lalu play
        audioPlayer.src = src;
        const playPromise = audioPlayer.play();
        if (playPromise) await playPromise; // Safari/Chrome return Promise

        // kalau berhasil mulai, tandai UI
        setBtnState(currentBtn, true);
      } catch (e) {
        console.error('Tidak bisa memutar audio:', e);
        setBtnState(currentBtn, false);
      } finally {
        isSwitching = false;
      }
      return;
    }

    // Klik lagu yang sama -> toggle
    if (audioPlayer.paused) {
      try {
        await audioPlayer.play();
        setBtnState(btn, true);
      } catch (e) {
        console.error('Play gagal:', e);
      }
    } else {
      audioPlayer.pause();
      setBtnState(btn, false);
    }
  });
});

// --- Event sinkronisasi UI ---
audioPlayer.addEventListener('ended', () => {
  if (currentBtn) setBtnState(currentBtn, false);
});

// Abaikan pause yang muncul saat switching sumber
audioPlayer.addEventListener('pause', () => {
  if (isSwitching) return;
  if (currentBtn && currentSrc) setBtnState(currentBtn, false);
});

// 'playing' = sudah benar-benar mulai play (lebih akurat dari 'play')
audioPlayer.addEventListener('playing', () => {
  if (currentBtn && currentSrc) setBtnState(currentBtn, true);
});


// Animasi saat halaman pertama kali muncul
window.addEventListener("DOMContentLoaded", () => {
  const page = document.getElementById("page-content");
  requestAnimationFrame(() => {
    page.classList.add("page-loaded");
  });
  // Mobile nav (hamburger) toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close menu when a link is clicked
    siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
    // Optional: click outside to close (mobile)
    document.addEventListener('click', (evt) => {
      if (!siteNav.classList.contains('open')) return;
      const t = evt.target;
      if (t === navToggle || navToggle.contains(t) || t === siteNav || siteNav.contains(t)) return;
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }
});

// Tangani klik link untuk animasi keluar
document.querySelectorAll("a[href]").forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    // skip untuk link kosong / anchor
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    e.preventDefault(); // tahan redirect dulu
    const page = document.getElementById("page-content");
    page.classList.remove("page-loaded");

    setTimeout(() => {
      window.location.href = href; // pindah page setelah animasi selesai
    }, 500); // sama dengan durasi CSS transition
  });
});

// --- Reveal on scroll (fade-in, prioritized + queued) ---
(() => {
  const itemsAll = Array.from(document.querySelectorAll('.reveal'));
  if (!itemsAll.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    itemsAll.forEach(el => el.classList.add('in-view'));
    return;
  }

  // Prioritize the song card that contains "About You"
  const aboutHeading = Array.from(document.querySelectorAll('.song-card h3'))
    .find(h3 => /about you/i.test(h3.textContent || ''));
  const aboutCard = aboutHeading ? aboutHeading.closest('.song-card') : null;

  // Keep processing to one-at-a-time with a minimum gap
  const minGap = 700; // ms between reveals (slower, not all at once)
  let lastRevealAt = 0;
  let processing = false;
  const queue = [];
  const revealed = new WeakSet();

  const processQueue = () => {
    if (processing) return;
    processing = true;

    const step = () => {
      if (!queue.length) { processing = false; return; }

      // If About You hasn't revealed yet and is in queue, do it first
      let idx = 0;
      if (aboutCard && !revealed.has(aboutCard)) {
        const i = queue.indexOf(aboutCard);
        if (i >= 0) idx = i;
      }

      const now = performance.now();
      const wait = Math.max(0, minGap - (now - lastRevealAt));
      setTimeout(() => {
        const el = queue.splice(idx, 1)[0];
        el.classList.add('in-view');
        revealed.add(el);
        lastRevealAt = performance.now();
        io.unobserve(el);
        step();
      }, wait);
    };

    step();
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (revealed.has(el)) { io.unobserve(el); return; }
      if (!queue.includes(el)) queue.push(el);
    });
    processQueue();
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -15% 0px'
  });

  itemsAll.forEach(el => io.observe(el));
})();
