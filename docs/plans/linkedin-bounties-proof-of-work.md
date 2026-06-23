---
title: LinkedIn Bounties — Proof-of-Work for Hiring
execution: code
status: ready
source: ~/justi-main-design-20260623-142501.md
generated: 2026-06-23
---

# Plan: LinkedIn Bounties — Proof-of-Work for Hiring

## Context

Reworks the existing `BountyPage.jsx` from the "real company backlogs / get work
done" framing into the design doc's **hiring-signal proof-of-work** framing:
SWE-only code challenges, a full-width `/solve` code sandbox, a `/results` funnel
that turns a large submission pool into a trustworthy top-10, and a
`VerifiedChallengesCard` on the profile (the product's core artifact).

The badge — not prize money — is the product. Everyone who clears the objective
gate earns a verified company-tied badge; only the top 10 see prize money. Nobody
who passes hits a dead end.

### Decisions locked (this session)
1. **Build the doc's vision, replacing the old BountyPage** (SWE-only, full screen set).
2. **Simulated grading + real AI judgment**: monospace code editor with starter
   code; on submit, run the existing NVIDIA AI review against the user's actual
   code, then play the funnel animation with a seeded submission pool. No real
   in-browser test execution.
3. **Keep the working NVIDIA (qwen) integration** for grading. The doc's "Claude"
   mention is aspirational; switching needs an Anthropic key + has browser CORS.

### Scope boundaries (non-goals)
- No real test runner / code execution sandbox.
- No backend, no persistence — all state is in-memory React.
- Desktop-only (matches the rest of the app). No phone-width layout.
- No generalization beyond SWE bounties. SWE-only is honest.
- No routing library — page switching stays as `App.jsx` `useState`, consistent
  with the current code.

## Visual language (cite real tokens from `src/App.css`)
- Cards: `.card` (white, `#c8c8c8` border, 8px radius).
- LinkedIn blue: `#0a66c2` (used in doc) / `#0077b6` (app's actual primary token).
  Use `#0077b6` to stay consistent with the existing app palette.
- Funnel bar fill `#0a66c2` on `rgba(0,0,0,0.06)` track (per doc).
- Gold verified check `#8B6914` for the profile badge card (per doc).
- Reuse `.puz-item` / profile-row pattern for ranked rows and badge rows.
- Monospace editor border like `.cmt-in`.

---

## Implementation Units

### U1 — Navbar entry (Bounties between Jobs and Messaging)
**Goal:** Surface Bounties as a primary nav item with `IconTarget`, placed between
Jobs and Messaging, wired to navigate to the bounty page. Keep the existing
`MyPagesCard` "Bounty" link working too (both routes set `page === 'bounty'`).

**Files:**
- Modify: `src/components/Navbar.jsx`
- Modify: `src/App.jsx` (Navbar already receives `onNavigate`/`currentPage`)

**Approach:** Add a `{ id: 'bounty', label: 'Bounties', Icon: IconTarget }` item to
`NAV_ITEMS` between `jobs` and `messages`. Update `handleNav` so a non-home nav id
calls `onNavigate(id)` when it maps to a real page (currently only `home`
navigates). Make the active-state logic account for `currentPage === 'bounty'`.

**Patterns to follow:** existing `NAV_ITEMS` map + `.nav-item` rendering in
`Navbar.jsx`; `MyPagesCard.jsx` navigation toggle pattern.

**Verification:** Clicking "Bounties" in the top nav opens the bounty page; the nav
item shows active state while on it; Home still works.

---

### U2 — SWE-only challenge data model
**Goal:** Replace the 3 non-code bounties with SWE code challenges carrying the
fields the new screens need.

**Files:**
- Modify: `src/components/BountyPage.jsx` (the `BOUNTIES` array + logos)

**Approach:** Each challenge: `id, company, companyColor, companyLogo, title,
prompt/description, acceptanceCriteria[], starterCode, language, reward,
deadline, participants, difficulty, aiCollabNote`. 3 companies (e.g. LinkedIn,
Stripe, Vercel) with distinct brand colors. `starterCode` is a realistic function
stub in JS/Python. Include a `funnel` stage spec per challenge for U5
(10,000 → ~312 → 30 → 12 → 10).

**Patterns to follow:** existing `BOUNTIES` shape and inline logo SVG components.

**Verification:** Browse + detail render the new SWE challenges; reward number is
the visual anchor on the card.

---

### U3 — Browse + Detail views (reframed)
**Goal:** Update browse list and detail to the hiring-signal framing.

**Files:**
- Modify: `src/components/BountyPage.jsx`
- Modify: `src/App.css`

**Approach:** Browse: bounty cards where the **reward number** is the visual
anchor, plus a monospace deadline pill (`#cef531`-style accent per doc, but kept
on-palette), participant count, difficulty. Detail: company header → title →
`.p-stat`-style stat row (reward / deadline / #participants) → problem statement →
"What passing means" → sticky blue **Solve** CTA. Replace "How to submit"
(Figma/Canva) with the code-challenge framing.

**Patterns to follow:** `.bl-card`, `.bd-wrap`, `.bd-section`, `.post-tag`, blue
`.modal-post-btn` CTA.

**Verification:** Detail shows reward/deadline/participants, problem, acceptance
criteria, and a Solve CTA that opens the sandbox.

---

### U4 — Full-width `/solve` code sandbox
**Goal:** A 2-pane solve screen that escapes the 1128px grid (full-width).

**Files:**
- Modify: `src/components/BountyPage.jsx` (SolveView)
- Modify: `src/App.jsx` (allow the bounty wrap / solve to go full-width)
- Modify: `src/App.css`

**Approach:** 2-pane flex — left: problem + acceptance criteria; right: monospace
code editor (a styled `<textarea>`, border like `.cmt-in`) pre-filled with
`starterCode` (never blank). Bottom bar: "Submit solution" button + muted
"AI allowed, judged on judgment" line. On failed/blank submit, **keep the user's
code** (never wipe). Submitting runs the AI review on the actual code, then routes
to `/results`.

**Patterns to follow:** doc UI spec; `.cmt-in` border, `.bd-start-btn` CTA,
monospace from `.promo-deadline`.

**Verification:** Sandbox is full-width, starter code present, code survives a
re-render, Submit triggers the funnel.

---

### U5 — `/results` funnel + top-10
**Goal:** Vertical stage rows that count a submission pool down to a trustworthy
top-10, with progressive stage-by-stage reveal, ending in ranked profile rows.

**Files:**
- Modify: `src/components/BountyPage.jsx` (ResultsView)
- Modify: `src/App.css`

**Approach:** Vertical stage rows in a `.card`, each row = label + shrinking bar
(`#0a66c2` fill on `rgba(0,0,0,0.06)` track) + count-down number
(10,000 → ~312 → 30 → 12 → 10). **Progressive reveal**: stages appear one at a
time; the AI-scoring stage **shimmers** ("scoring 30…") while the real AI call
runs, so latency becomes the demo's drama. End in top-10 ranked profile rows
(`.puz-item`/profile-row pattern). The current user lands in the list with their
AI score. Respect `prefers-reduced-motion` (numbers just appear). On AI failure →
cached/fallback result + badge still awarded.

**Patterns to follow:** `.puz-item`, doc funnel viz spec, existing
`reviewWithAI` + progress-interval pattern in `BountyPage.jsx`.

**Verification:** Stages reveal sequentially, numbers count down, top-10 renders,
the user sees their rank/score, reduced-motion shows static numbers.

---

### U6 — Non-winner moment + badge award
**Goal:** Everyone who clears the objective gate gets a verified badge +
"you're now visible to [Company]'s recruiters." Only top 10 see prize money.
Nobody who passes hits a dead end.

**Files:**
- Modify: `src/components/BountyPage.jsx` (AwardedView)
- Modify: `src/App.css`

**Approach:** After the funnel, show the badge-earned state. If the user is in the
top 10 → prize money + warm recruiter intro line. If they passed the gate but not
top-10 → verified badge + "visible to [Company]'s recruiters" (no dead end).
Badge claim wording locked: **"Produced a verified-correct solution and reasoned
well about it."** "Add to profile" wires the badge into the profile card (U7).

**Patterns to follow:** existing `AwardedView`, `.ba-*` classes, gold verified
check `#8B6914`.

**Verification:** Top-10 and pass-but-not-top-10 both show a non-dead-end state
with the correct messaging.

---

### U7 — `VerifiedChallengesCard` on profile
**Goal:** The product's core artifact — a "Verified Challenges" card in the
profile left column showing earned company-tied badges.

**Files:**
- Create: `src/components/VerifiedChallengesCard.jsx`
- Modify: `src/App.jsx` (render in `.li-left` under `ProfileCard`)
- Modify: `src/App.css`

**Approach:** `.card` + `.puz-item` rows + `.page-ico` company logos + gold
`#8B6914` verified check + rank/percentile. Seed with 1–2 pre-earned badges so the
profile looks credible on load. When the user finishes a bounty and clicks "Add
Badge to Profile", their new badge appears here (lift earned-badge state to
`App.jsx` and pass a setter down, OR keep a shared in-memory store — keep it
simple: lift state to `App.jsx`).

**Patterns to follow:** `Puzzles.jsx` (`.puz-item` rows + card header), `.page-ico`
from `MyPagesCard.jsx`, `ProfileCard.jsx` placement.

**Verification:** Card renders on the home left column with seeded badges; completing
a bounty and adding to profile shows the new badge with company logo + gold check.

---

## Build order
U1 → U2 → U3 → U4 → U5 → U6 → U7. U2 is a dependency for U3–U6. U7 depends on the
earned-badge state from U6.

## Verification (whole feature)
- `npm run build` succeeds and `npm run lint` (oxlint) is clean.
- Manual demo path: Home → click Bounties (nav) → open a challenge → Solve
  (full-width, starter code) → Submit → funnel counts down with live AI scoring →
  badge awarded (correct top-10 vs pass messaging) → Add to profile → badge appears
  on the Verified Challenges card.
- 30-second story holds: a judge understands why a verified bounty badge beats a
  resume line, and "the AI never saw 10k raw submissions."
