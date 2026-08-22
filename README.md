# YouTube Summarizer — Phase 1 MVP

Paste a YouTube URL, get 5 key bullet points and a ~100-word summary. No auth, no history yet — that's Phase 2.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Node.js + Express 5
- **AI:** Gemini 2.5 Flash (`@google/genai`) with structured JSON output
- **Transcript:** `youtube-transcript` (unofficial — no API key needed, but only works on videos with captions available)
- **DB:** MongoDB via Mongoose — optional for Phase 1. If `MONGODB_URI` isn't set, the app still works, it just won't save history.

## Get it running locally

You need two terminals — the backend and frontend run separately.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
- `GEMINI_API_KEY` — required. Get a free one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- `MONGODB_URI` — optional for now. Leave blank to skip persistence, or paste a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) connection string.

```bash
npm run dev
```

Backend runs on `http://localhost:5000`. Check `http://localhost:5000/api/health` → `{"status":"ok"}`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`. The first `npm run dev` needs internet access once, to fetch the Google Fonts used in the design.

### 3. Try it

Open `http://localhost:3000`, paste a YouTube URL (something with captions — most talks, tutorials, and news clips have them), hit Summarize.

## Known limitations (Phase 1, by design)

- **No auth yet** — anyone with the URL can use it. Coming in Phase 2.
- **Transcript-only** — no audio transcription fallback yet. If a video has captions disabled, is private, or is age-restricted, you'll get a clean error instead of a summary. Audio/PDF upload is the Phase 3 stretch goal.
- **`youtube-transcript` is an unofficial library** — it can break if YouTube changes something server-side. Worth knowing if it suddenly stops working weeks from now — it's the library, not your code.
- Long transcripts are trimmed before hitting the AI to control cost/latency — fine for typical videos, may lose detail on multi-hour content.

## Project structure

```
youtube-summarizer/
├── backend/
│   └── src/
│       ├── server.js            # entry point
│       ├── config/db.js         # MongoDB connection (graceful if unset)
│       ├── routes/               # Express routes
│       ├── controllers/          # request handling
│       ├── services/             # transcript fetch + Gemini call
│       ├── models/Summary.js     # Mongoose schema
│       ├── middleware/errorHandler.js
│       └── utils/                # AppError, asyncHandler
└── frontend/
    └── src/
        ├── app/                  # pages, layout, fonts, theme
        ├── components/           # form, loading state, result view
        └── lib/api.ts            # typed fetch wrapper to the backend
```

## Next up (from the roadmap)

- **Phase 2:** JWT auth + dashboard history, "Chat with the content," export/share.
- **Phase 3:** Audio/PDF upload, UI polish, full architecture README.
