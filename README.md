# Possibilities Hack — LinkedIn Bounties

**Proof-of-work hiring, built on top of a LinkedIn clone.**

Resumes are claims. This project replaces the resume line with a *verified badge*:
candidates clear a real, company-tied challenge inside the app, an AI judges the
actual solution, and a recruiter-side portal turns a large submission pool into a
trustworthy ranked shortlist. The badge — not prize money — is the product.

The whole thing runs as a no-backend React SPA: AI grading happens client-side
against Groq, and the only persistence is a Supabase Postgres project hit directly
from the browser with the anon key.

---

## What's in here

| Path | What it is |
|------|------------|
| `linkedin-clone/` | The entire app (Vite + React SPA). |
| `linkedin-clone/supabase/` | SQL migrations for the Supabase project (`migration.sql` → `_v2` → `_v3`). |
| `docs/plans/` | Design/plan docs (e.g. the proof-of-work hiring plan). |

There is no separate server — `linkedin-clone/` is the product.

---

## Tech stack

- **React 19** + **Vite 8** — SPA, no router. Page switching is `useState` in
  `App.jsx` (`home` / `bounty` / `profile`), kept deliberately simple.
- **Monaco Editor** (`@monaco-editor/react`) — the in-browser code IDE candidates
  solve coding bounties in.
- **Supabase** (`@supabase/supabase-js`) — hosted Postgres + RLS, called directly
  from the browser with the **anon** key. `src/lib/supabase.js` falls back to a
  stub client when env vars are missing, so the app runs on seeded data instead of
  crashing.
- **Groq** (`api.groq.com`, OpenAI-compatible API) — LLM grading of submitted
  solutions, called client-side. Falls back to a cached/seeded score when no key
  is set or the call fails.
- **@tabler/icons-react** — icon set.
- **oxlint** — linting. **Vercel** — deploy target.

> Note: `.env.example` still references NVIDIA keys and the plan doc mentions
> NVIDIA/qwen — those are historical. The live AI integration is **Groq**
> (`VITE_GROQ_KEY`).

---

## The two surfaces

### 1. Candidate app (`src/App.jsx`, `src/components/`)
A LinkedIn-style feed/profile shell with a **Bounties** flow bolted on:

- **Browse / detail** — SWE coding challenges framed as real company backlog bugs
  (e.g. Google's "fix the city-search race condition").
- **Solve** — a full-width Monaco IDE pre-filled with starter code; AI assistance
  is allowed and that's the point — judgment is graded, not memorization.
- **Results funnel** — on submit, the real AI grades the candidate's actual code,
  then a funnel animation counts a seeded submission pool down to a top-10.
- **Badge award** — everyone who clears the objective gate earns a verified,
  company-tied badge ("Produced a verified-correct solution and reasoned well about
  it"); only the top 10 see prize money. The badge surfaces on the profile via
  `VerifiedChallengesCard.jsx`.

### 2. Recruiter portal (`src/pages/RecruiterView.jsx`)
The hiring side, scoped to a single company (LinkedIn / recruiter "Emily"):

- Company-scoped stats (bounties, submissions, badges, interviews).
- A per-bounty **medal leaderboard** (top-10, max 3 medals) with a two-stage
  **recruiter → engineer** approval flow; denying promotes #11.
- Inline solution preview (sandboxed iframe), a "send to engineer" review portal,
  a schedule-interview popup, and a messaging dock.

---

## Data model (Supabase)

Migrations live in `linkedin-clone/supabase/` and are written to be **idempotent
and re-runnable** in the Supabase SQL editor.

- `bounties` — challenges, including an `awardees` JSONB column used for medals.
- `jobs` — job postings.
- `members` — candidate profiles + a `bounty_status` JSONB map (added in
  `migration_v3.sql`); the demo user **Panav** is seeded here.

⚠️ **Schema drift is real here.** The migration files have historically been
partly aspirational — earlier versions declare `candidates` / `submissions` tables
that the live DB doesn't have, and some live columns (`awardees`,
`potential_job_*`) were added out-of-band rather than via a migration. The app
degrades gracefully (the Supabase stub + `.catch` fall back to seeded data), so
missing tables show seed data rather than crashing. If you stand up a fresh DB,
expect to reconcile the migrations against what the app actually reads.

---

## Running locally

```bash
cd linkedin-clone
npm install
npm run dev      # vite dev server
npm run build    # production build
npm run lint     # oxlint
```

### Environment

Copy `linkedin-clone/.env.example` to `.env.local` (gitignored) and fill in:

```bash
# Supabase (optional — without it, the app runs on seeded/stub data)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Groq — enables live AI grading (optional — falls back to cached scores)
VITE_GROQ_KEY=...
```

Everything is optional for a demo: with no keys, the app runs entirely on seeded
data and cached AI scores.

> **Security note:** because there's no backend, any `VITE_*` key (Groq, Supabase
> anon) is inlined into the shipped browser bundle and is readable by anyone using
> the deployed app. RLS on the Supabase tables is wide-open for demo convenience.
> This is fine for a throwaway hackathon DB — **do not point it at anything you
> care about**, and scope/rotate the Groq key after demos.

---

## Demo path (30-second story)

Home → **Bounties** → open the Google race-condition challenge → **Solve** in the
full-width IDE → **Submit** → funnel counts down with live AI scoring → **badge
awarded** → it appears on your profile's Verified Challenges card. Flip to the
**recruiter portal** to see the same submission ranked, medal-able, and routable to
an engineer for final approval.
