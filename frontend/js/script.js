// Point this at your backend (local dev shown here; change on deploy)
const API_BASE = "http://127.0.0.1:8000";

const form = document.getElementById("contact-form");
const status = document.getElementById("contact-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Sending...";

  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  };

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Request failed");
    status.textContent = "Message sent. Thanks!";
    form.reset();
  } catch (err) {
    status.textContent = "Something went wrong. Try again.";
  }
});

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// Load saved preference, or default to light
const saved = localStorage.getItem('theme');
if (saved) root.setAttribute('data-theme', saved);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', current);
  localStorage.setItem('theme', current);
  themeToggle.textContent = current === 'dark' ? '☀️' : '🌙';
});



// =====================================================
// PROJECTS — scroll-linked stacked fan (Campione-style)
// =====================================================


const fanTrack = document.getElementById('fan-track');
const fanStage = document.getElementById('fan-stage');

if (fanTrack && fanStage) {
  const cards = Array.from(fanStage.querySelectorAll('.fan-card'));
  const n = cards.length;

  // Fixed scattered positions (like the reference fan image) — one
  // per card, by index. Tweak x/y/rotate here to adjust the scatter look.
  const fanPositions = [
    { x: -140, y: 50,  rotate: -10 },
    { x: -45,  y: 15,  rotate: -4  },
    { x: 45,   y: -15, rotate: 4   },
    { x: 140,  y: -50, rotate: 10  },
  ];

  const frontPosition = { x: 0, y: 0, rotate: 0 };

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function updateFan() {
    const rect = fanTrack.getBoundingClientRect();
    const trackHeight = fanTrack.offsetHeight;
    const viewportHeight = window.innerHeight;

    const scrolled = -rect.top;
    const scrollableDistance = trackHeight - viewportHeight;
    let progress = scrolled / scrollableDistance;
    progress = Math.max(0, Math.min(1, progress)); // clamp 0–1

    // Which card "should" be front-and-center right now, as a continuous
    // (not integer) value — e.g. 1.5 means halfway between card 1 and 2.
    const activeFloat = progress * (n - 1);

    cards.forEach((card, i) => {
      // How close this card is to being the active one right now.
      // 1 = fully active/front, 0 = one full step away or more (fully fanned).
      const closeness = Math.max(0, 1 - Math.abs(activeFloat - i));

      const fan = fanPositions[i];
      const x = lerp(fan.x, frontPosition.x, closeness);
      const y = lerp(fan.y, frontPosition.y, closeness);
      const rotate = lerp(fan.rotate, frontPosition.rotate, closeness);
      const scale = lerp(0.82, 1.08, closeness);
      const opacity = lerp(0.35, 1, closeness);

      card.style.transform =
        `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
      card.style.opacity = opacity;
      // Closer-to-active cards sit on top of the stack.
      card.style.zIndex = Math.round(closeness * 100);

      const vid = card.querySelector('video');
      const isActive = closeness > 0.85;
      card.classList.toggle('is-active', isActive);
      if (vid) {
        if (isActive) vid.play();
        else { vid.pause(); }
      }
    });
  }

  window.addEventListener('scroll', updateFan, { passive: true });
  window.addEventListener('resize', updateFan);
  updateFan(); // correct positions on load, before any scrolling
}