
// Small helpers for this mini site
(function() {
// Hamburger menu logic
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
    });
    // Optional: close nav when link clicked (on mobile)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

// ...existing code...
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
