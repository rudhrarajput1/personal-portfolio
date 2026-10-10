# Personal Portfolio

My personal portfolio site — built from scratch to showcase my projects as a BCA (AI/ML) student.

## Tech stack

**Frontend**
- HTML5, CSS3, vanilla JavaScript — no frameworks
- Custom font (Bebas Neue, via Google Fonts) for the hero headline
- Light/dark theme toggle, persisted via `localStorage`

**Backend**
- Python, FastAPI
- SQLite for storing contact-form messages
- Dependency management via [uv](https://github.com/astral-sh/uv)

## Features

- Responsive, single-page layout: Hero, About, Education, Skills, Projects, Featured project, Contact
- Light/dark theme toggle with persisted preference
- Contact form wired to a real backend — messages are stored in a database, not just logged

## Project structure

```
frontend/
├── index.html
├── css/style.css
├── js/script.js
└── fonts/            # self-hosted fonts, if any
backend/
├── main.py            # FastAPI app: /contact and /messages routes
├── pyproject.toml     # dependencies
└── uv.lock            # locked dependency versions
```

## Running locally

**Frontend**
Open `frontend/index.html` with a live-reload tool (e.g. VS Code's Live Server extension).

**Backend**
```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```
Starts the API at `http://127.0.0.1:8000` and creates `messages.db` on first run.

> Both the frontend (Live Server) and backend (uvicorn) need to be running at the same time for the contact form to work.

## Status

🚧 Work in progress. Currently done: structure, hero styling, theme toggle, contact form + backend. Still open: final color palette, skills section content, real project preview videos.

## Projects featured

- **AI News Widget** — Python/Tkinter desktop app for AI/ML headlines
- **Offline AI Chat** — personal assistant with automatic online→offline fallback (Gemini + Ollama)
- **Personal MCP Server** — exposes my projects as tools for any MCP client
- **Student Result Analyzer** — team project for analyzing student academic results
