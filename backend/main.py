"""
Portfolio contact-form backend.
Run with: uv run uvicorn main:app --reload
"""

import sqlite3
import feedparser
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

DB_PATH = Path(__file__).parent / "messages.db"

app = FastAPI(title="Portfolio Contact API")

# Allow your frontend (adjust origin when you deploy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your real domain before going live
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
    

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str


@app.post("/contact")
def submit_contact(payload: ContactIn):
    if not payload.name.strip() or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Name and message cannot be empty.")

    conn = get_db()
    conn.execute(
        "INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
        (
            payload.name.strip(),
            payload.email,
            payload.message.strip(),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}


@app.get("/messages")
def list_messages():
    # NOTE: no auth yet — fine for local use, lock this down before deploying publicly
    conn = get_db()
    rows = conn.execute("SELECT * FROM messages ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/ai-news")
def get_ai_news():
    feed = feedparser.parse("https://techcrunch.com/category/artificial-intelligence/feed/")
    headlines = []
    for entry in feed.entries[:3]:
        headlines.append({
            "title": entry.title,
            "link": entry.link,
        })
    return {"headlines": headlines}