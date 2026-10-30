

// java script for the personal portfolio site //



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
// NAV COLOR — switches based on section under it
// =====================================================
const navEl = document.querySelector('#navbar');
const darkSection = document.querySelector('#about'); // adjust if you use a different id/class

function updateNavColor() {
  if (!navEl || !darkSection) return;

  const navBottom = navEl.getBoundingClientRect().bottom;
  const sectionRect = darkSection.getBoundingClientRect();

  const navIsOverDarkSection = sectionRect.top <= navBottom && sectionRect.bottom >= navBottom;

  navEl.classList.toggle('nav-on-dark', navIsOverDarkSection);
}

window.addEventListener('scroll', updateNavColor, { passive: true });
window.addEventListener('resize', updateNavColor);
updateNavColor();


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

// =====================================================
// CUSTOM CURSOR — changes per section via data-cursor attributes
// =====================================================
const cursor = document.getElementById('custom-cursor');
const cursorText = cursor ? cursor.querySelector('.cursor-text') : null;

if (cursor) {
  let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
function updateCursor() {
  cursor.style.left = `${mouseX}px`;
  cursor.style.top = `${mouseY}px`;
  requestAnimationFrame(updateCursor);
}
requestAnimationFrame(updateCursor);

  const labels = {
    view: 'View',
    send: 'Send',
  };

  document.querySelectorAll('[data-cursor]').forEach((el) => {
    const type = el.getAttribute('data-cursor');

    el.addEventListener('mouseenter', () => {
      cursor.classList.add(`is-${type}`);
      if (labels[type]) cursorText.textContent = labels[type];
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove(`is-${type}`);
      cursorText.textContent = '';
    });
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}

const API_BASE = "http://127.0.0.1:8000";

// ===== Offline-aware Contact Form =====
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
const PENDING_KEY = 'pendingContactMessage';

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value,
    };
    await trySend(formData);
  });
}

async function trySend(formData) {
  if (!navigator.onLine) {
    saveForLater(formData);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error('Server error');

    contactStatus.textContent = 'Message sent — thanks for reaching out!';
    console.log('SENT SUCCESSFULLY:', formData);
    contactForm.reset();
    localStorage.removeItem(PENDING_KEY);
  } catch (err) {
    saveForLater(formData);
  }
}

function saveForLater(formData) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(formData));
  console.log('SAVED OFFLINE:', formData);                          // temporary
  contactStatus.textContent = "Connection dropped — saved your message, it'll send automatically once you're back online.";
}

window.addEventListener('online', () => {
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending) {
    trySend(JSON.parse(pending));
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending && navigator.onLine) {
    trySend(JSON.parse(pending));
  }
});

setInterval(() => {
  const pending = localStorage.getItem(PENDING_KEY);
  if (pending && navigator.onLine) {
    trySend(JSON.parse(pending));
  }
}, 15000);                                           // retries every 15s if something's pending and you're online 


// =====================================================
// ABOUT — scroll-driven zoom window + splitting text
// =====================================================
const aboutTrack = document.getElementById('about-track');
const aboutWindow = document.getElementById('about-window');
const aboutWordTop = document.getElementById('about-word-top');
const aboutWordBottom = document.getElementById('about-word-bottom');
const aboutFigure = document.getElementById('about-figure');

if (aboutTrack && aboutWindow) {
  function updateAboutZoom() {
    const rect = aboutTrack.getBoundingClientRect();
    const trackHeight = aboutTrack.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = -rect.top;
    const scrollable = trackHeight - viewportHeight;
    let progress = scrolled / scrollable;
    progress = Math.max(0, Math.min(1, progress));

    // Window grows
    const minW = 400, maxW = window.innerWidth * 0.95;
    const minH = 260, maxH = window.innerHeight * 0.85;
    const width = minW + (maxW - minW) * progress;
    const height = minH + (maxH - minH) * progress;
    aboutWindow.style.width = `${width}px`;
    aboutWindow.style.height = `${height}px`;
    aboutWindow.classList.toggle('is-expanded', progress > 0.85);

    // ABOUT moves left, ME moves right, both fade out
    const shift = progress * 400;                                    // px of horizontal separation
    aboutWordTop.style.transform = `translateX(${-shift}px)`;
    aboutWordBottom.style.transform = `translateX(${shift}px)`;
    const textOpacity = Math.max(0, 1 - progress * 1.3);
    aboutWordTop.style.opacity = textOpacity;
    aboutWordBottom.style.opacity = textOpacity;
        // Angel fades/scales in as ABOUT/ME separate
    if (aboutFigure) {
      const figureOpacity = Math.min(1, progress * 1.6);
      const figureScale = 0.5 + progress * 0.6;
      aboutFigure.style.opacity = figureOpacity;
      aboutFigure.style.transform = `scale(${figureScale}) rotate(${-4 + progress * 4}deg) translateY(50px)`;
    }
  } // end updateAboutZoom

  window.addEventListener('scroll', updateAboutZoom, { passive: true });
  window.addEventListener('resize', updateAboutZoom);
  updateAboutZoom();
}

// =====================================================
// SKILLS — full-screen pinned panels, R-to-L, persistent ghost bg
// =====================================================
const skillsTrack = document.getElementById('skills-track');
const skillsStage = document.getElementById('skills-stage');
const skillsGhostBg = document.getElementById('skills-ghost-bg');

if (skillsTrack && skillsStage) {
  const panels = Array.from(skillsStage.querySelectorAll('.skill-panel'));
  const n = panels.length;

  function lerpSkills(a, b, t) { return a + (b - a) * t; }

  function updateSkills() {
    const rect = skillsTrack.getBoundingClientRect();
    const trackHeight = skillsTrack.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = -rect.top;
    const scrollableDistance = trackHeight - viewportHeight;
    let progress = scrolled / scrollableDistance;
    progress = Math.max(0, Math.min(1, progress));
    const activeFloat = progress * (n - 1);

    panels.forEach((panel, i) => {
      const distance = activeFloat - i;
      const closeness = Math.max(0, 1 - Math.abs(distance));
      const xOffset = -distance * 100;
      const opacity = lerpSkills(0, 1, closeness);

      panel.style.transform = `translateX(${xOffset}%)`;
      panel.style.opacity = opacity;
      panel.style.zIndex = Math.round(closeness * 100);
    });

    if (skillsGhostBg) {
      const ghostShift = progress * -200;
      skillsGhostBg.style.transform = `translateX(${ghostShift}px)`;
    }
  }

  window.addEventListener('scroll', updateSkills, { passive: true });
  window.addEventListener('resize', updateSkills);
  updateSkills();
}

// ===== Last Deployed =====
fetch('deploy-info.json')
  .then(res => res.json())
  .then(data => {
    const deployed = new Date(data.deployedAt);
    const daysAgo = Math.floor((Date.now() - deployed) / 86400000);
    const text = daysAgo === 0
      ? 'Deployed today'
      : `Last deployed ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
    document.getElementById('deploy-status').textContent = text;
  })
  .catch(() => {
    document.getElementById('deploy-status').textContent = '';
  });
 