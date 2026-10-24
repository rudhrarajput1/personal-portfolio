// ===== AI News Widget =====
const API_BASE_WIDGET = "http://127.0.0.1:8000";

const widget = document.getElementById('ai-widget');
const widgetBody = document.getElementById('ai-widget-body');

// ---- Spawn at Hero's bottom-right corner ----
function spawnAtHero() {
  const hero = document.getElementById('hero');
  if (!hero) {
    console.error('AI Widget: #hero not found');
    return;
  }
  const rect = hero.getBoundingClientRect();
  const left = rect.right + window.scrollX - 240;
  const top = rect.bottom + window.scrollY - 140;
  widget.style.left = `${left}px`;
  widget.style.top = `${top}px`;
  console.log('AI Widget spawned at', left, top);
}

// Wait until layout is fully ready before measuring Hero's position
window.addEventListener('load', spawnAtHero);

// ---- Fetch live headlines ----
function loadHeadlines() {
  fetch(`${API_BASE_WIDGET}/api/ai-news`)
    .then(res => {
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      return res.json();
    })
    .then(data => {
      widgetBody.innerHTML = '';
      data.headlines.forEach(item => {
        const a = document.createElement('a');
        a.href = item.link;
        a.target = '_blank';
        a.className = 'ai-widget-headline';
        a.textContent = item.title;
        widgetBody.appendChild(a);
      });
    })
    .catch(err => {
      console.error('AI Widget fetch failed:', err);
      widgetBody.innerHTML = '<p class="ai-widget-loading">Unable to load news</p>';
    });
}
loadHeadlines();

// ---- Drag logic: double-click, then drag while held ----
let clickCount = 0;
let clickTimer = null;
let isDragging = false;
let offsetX = 0, offsetY = 0;

widget.addEventListener('mousedown', (e) => {
  clickCount++;

  if (clickCount === 1) {
    clickTimer = setTimeout(() => { clickCount = 0; }, 400);
  }

  if (clickCount === 2) {
    clearTimeout(clickTimer);
    clickCount = 0;

    isDragging = true;
    widget.classList.add('dragging');

    const rect = widget.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    e.preventDefault();
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  widget.style.left = `${e.clientX - offsetX + window.scrollX}px`;
  widget.style.top = `${e.clientY - offsetY + window.scrollY}px`;
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    widget.classList.remove('dragging');
    snapToSection();
  }
});

// ---- Snap to bottom-right of whichever section it's dropped in ----
function snapToSection() {
  const widgetRect = widget.getBoundingClientRect();
  const centerY = widgetRect.top + widgetRect.height / 2 + window.scrollY;

  const sections = document.querySelectorAll('section');
  let currentSection = null;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;
    if (centerY >= top && centerY <= bottom) {
      currentSection = sec;
    }
  });

  if (!currentSection) return;

  const aiCard = document.querySelector('.fan-card[data-index="0"]');
  if (aiCard) {
    const cardRect = aiCard.getBoundingClientRect();
    const overlaps =
      widgetRect.left < cardRect.right &&
      widgetRect.right > cardRect.left &&
      widgetRect.top < cardRect.bottom &&
      widgetRect.bottom > cardRect.top;

    if (overlaps) {
      mergeIntoCard(aiCard);
      return;
    }
  }

  const secRect = currentSection.getBoundingClientRect();
  const targetLeft = secRect.right + window.scrollX - widgetRect.width - 24;
  const targetTop = secRect.bottom + window.scrollY - widgetRect.height - 24;

  widget.style.left = `${targetLeft}px`;
  widget.style.top = `${targetTop}px`;
}

function mergeIntoCard(card) {
  const cardRect = card.getBoundingClientRect();
  widget.style.left = `${cardRect.left + window.scrollX}px`;
  widget.style.top = `${cardRect.top + window.scrollY}px`;
  widget.classList.add('merging');
  setTimeout(() => {
    widget.style.display = 'none';
  }, 300);
}