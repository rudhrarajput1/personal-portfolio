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