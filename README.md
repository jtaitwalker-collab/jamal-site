# Jamal Walker — AI-Powered Hiring Page

A personal landing page where hiring managers can ask questions about Jamal via voice or text and receive instant AI-generated answers grounded in his CV.

## Tech Stack

- **Next.js 15** (App Router) — fullstack framework
- **Vercel** — hosting + serverless functions
- **Anthropic Claude** — AI answers via a secure server-side proxy
- **Deepgram** — real-time browser voice transcription

---

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd jamal-site
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys:

| Variable | Where to get it | Side |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Server only |
| `NEXT_PUBLIC_DEEPGRAM_API_KEY` | [console.deepgram.com](https://console.deepgram.com) | Client (safe) |

> **Security note:** `ANTHROPIC_API_KEY` is used only in the `/api/ask` serverless function and is never sent to the browser. Deepgram keys are intended for client-side use; restrict yours to your domain in the Deepgram dashboard.

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

During the guided setup, Vercel will ask for your environment variables. Add both keys when prompted.

### Option B — GitHub integration (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` (Production + Preview)
   - `NEXT_PUBLIC_DEEPGRAM_API_KEY` (Production + Preview)
4. Click **Deploy**.

Vercel auto-detects Next.js — no build configuration needed.

---

## API Endpoint

### `POST /api/ask`

Accepts a question, sends it to Claude with Jamal's CV as context, and streams the response back.

**Request body:**
```json
{ "question": "What's your biggest enterprise deal?" }
```

**Response:** Plain-text stream (`text/plain; charset=utf-8`). Read it with the Fetch Streams API or collect the full string.

**Error responses:**
- `400` — missing `question` field
- `500` — upstream API error (check server logs)

---

## Deepgram Free Tier

The Deepgram free tier includes 45,000 minutes of transcription — more than enough for a hiring page. Sign up at [console.deepgram.com](https://console.deepgram.com), create a project, and generate an API key. Restrict it to your Vercel domain for security.

---

## Customisation

- **CV context** — edit the `CV_CONTEXT` constant in `app/api/ask/route.ts`
- **Suggested questions** — edit the `SUGGESTED_QUESTIONS` array in `components/SuggestedQuestions.tsx`
- **Metrics** — edit the `METRICS` array in `components/MetricsSidebar.tsx`
- **Timeline** — edit the `ROLES` array in `components/CareerTimeline.tsx`
- **Colours** — edit `tailwind.config.ts`
