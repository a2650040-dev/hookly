# Hookly

AI-powered content idea generator for social media. Generates 5 platform-specific ideas with hooks and angles, then writes a full ready-to-post piece for any of them.

**Live:** [hookly-alpha.vercel.app](https://hookly-alpha.vercel.app)

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — single `index.html`, no build step
- **Backend:** Vercel Serverless Function (`api/proxy.js`) — proxies requests to Pollinations API, keeps the key server-side
- **Model:** DeepSeek via [Pollinations.ai](https://pollinations.ai) (`gen.pollinations.ai/v1/chat/completions`) — OpenAI-compatible API, free tier
- **Hosting:** Vercel

---

## Project Structure

```
hookly/
├── index.html       # Full frontend — UI, state, API calls
├── api/
│   └── proxy.js     # Vercel serverless function — API proxy
└── package.json     # Minimal, Node >=18
```

---

## How It Works

```
Browser → POST /api/proxy → Vercel Function → Pollinations API (DeepSeek)
                                ↑
                     Injects POLLINATIONS_API_KEY
                     from environment variables
```

The frontend never touches the API key. `api/proxy.js` receives `{ model, max_tokens, system, messages }`, injects the server-side key, converts to OpenAI format, and returns `choices[0].message.content`.

---

## Features

- **Generate 5 ideas** — title + hook + angle per idea
- **Write Full Post** — expands any idea into a complete platform-optimized post
- **Platform support:** Telegram, X (Twitter), Instagram, LinkedIn, YouTube, TikTok, Facebook
- **Tone chips:** Conversational, Inspiring, Humorous, Serious, Bold
- **Language select:** Russian, English, and others
- **Copy / Save** — save ideas to localStorage, persistent across sessions
- **Saved section** — review and copy saved ideas

---

## Prompts

Two-stage generation:

**Stage 1 — Ideas (`generateIdeas`)**

Few-shot prompt with explicit BAD/GOOD hook examples. Forces 5 different hook strategies per run: curiosity gap, contrarian take, personal confession, surprising statistic, direct challenge. Returns JSON array `[{title, hook, angle}]`.

**Stage 2 — Full Post (`expandPost`)**

Platform guide map with format constraints per platform (char limits, tone, structure). Explicit banned phrases (`"In today's world"`, `"Let's dive in"`, `"It's important to note"`). One core idea rule — no generic listicles unless format calls for it.

---

## Deploy

### Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli): `npm install -g vercel`
- Pollinations API key (`sk_...`) — get one at [enter.pollinations.ai](https://enter.pollinations.ai)

### Steps

```powershell
cd hookly
vercel --prod
```

Then add the environment variable in Vercel Dashboard → Project → Settings → Environment Variables:

```
POLLINATIONS_API_KEY = sk_xxxxxxxxxx
```

Set scope to **Production**. Then redeploy:

```powershell
vercel --prod
```

> On Windows use `vercel.cmd --prod`

---

## Local Development

No build step needed. Open `index.html` directly in a browser for UI — but API calls will fail without the proxy running. To test the full flow locally:

```powershell
vercel dev
```

This spins up the serverless function at `localhost:3000/api/proxy` with env vars from `.env.local`:

```
# .env.local
POLLINATIONS_API_KEY=sk_xxxxxxxxxx
```

---

## API Proxy Details

`api/proxy.js` accepts:

```json
POST /api/proxy
Content-Type: application/json

{
  "model": "deepseek",
  "max_tokens": 3000,
  "system": "...",
  "messages": [{ "role": "user", "content": "..." }]
}
```

Transforms to OpenAI format (system as first message in array), forwards to `gen.pollinations.ai/v1/chat/completions`, returns response as-is. CORS headers included for `*`.

---

## Design Tokens

```css
--bg:           #0E0E0E
--surface:      #1A1A1A
--surface2:     #242424
--border:       rgba(255,255,255,0.08)
--amber:        #F5A623
--amber-dim:    rgba(245,166,35,0.12)
--amber-soft:   #FDE68A
--text:         #F5F0E8
--text-muted:   #8A8580
--success:      #4ADE80
--font-display: 'Syne'
--font-body:    'Inter'
```
