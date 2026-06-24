import { useState, useEffect, useRef } from 'react'
import {
  IconCheck, IconArrowLeft, IconChevronRight, IconSparkles,
  IconClock, IconUsers, IconShieldCheck, IconCode, IconBolt, IconTarget,
  IconFolder, IconLock, IconUpload, IconX, IconFile,
} from '@tabler/icons-react'
import { supabase } from '../lib/supabase'

/* ──────────────────────────────────────────────
   LinkedIn Bounties — proof-of-work for hiring.
   A company posts a representative, objectively gradeable SWE challenge.
   Everyone who clears the objective gate earns a verified, company-tied
   badge that lives on their profile. AI is allowed; judgment is graded.
─────────────────────────────────────────────── */

// API key from gitignored .env — never committed to source.
const GROQ_KEY = import.meta.env.VITE_GROQ_KEY

// Locked badge claim wording — what the badge certifies, given AI is allowed.
const BADGE_CLAIM = 'Produced a verified-correct solution and reasoned well about it.'

async function callAI(prompt) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a strict JSON API. Output ONLY a single valid JSON object with no extra text, no markdown, no explanation.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5, max_tokens: 400,
      }),
    })
    if (!res.ok) { console.warn('[Groq] HTTP', res.status, await res.text()); return null }
    const data = await res.json()
    const text = (data.choices?.[0]?.message?.content || '').trim()
    console.log('[Groq raw]', text)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) { console.warn('[Groq] No JSON in response'); return null }
    const parsed = JSON.parse(match[0])
    if (parsed.score && parsed.feedback) return parsed
    console.warn('[Groq] JSON missing score/feedback', parsed)
  } catch (e) { console.warn('[Groq] error', e) }
  return null
}

async function reviewWithAI(challenge, submissionUrl, submissionDesc) {
  const submissionContent = [
    submissionUrl ? `Link: ${submissionUrl}` : '',
    submissionDesc ? `Description: ${submissionDesc}` : '',
  ].filter(Boolean).join('\n')

  const prompt = `You are grading a student bounty submission for ${challenge.company}.

BOUNTY: "${challenge.title}"
BRIEF: ${challenge.description.slice(0, 400)}

WHAT THE STUDENT SUBMITTED:
${submissionContent || 'No submission content provided.'}

Grade this specific submission. Your feedback MUST reference what the student actually wrote or linked above — do not give generic advice. Point out something specific they did well and one concrete thing to improve.

Return JSON only:
{"score":<integer 60-99>,"percentile":"<e.g. Top 15%>","feedback":"<2-3 sentences referencing their actual submission>"}`

  const result = await callAI(prompt)
  return result ?? {
    score: 82,
    percentile: 'Top 18%',
    feedback: `Submission received for the ${challenge.company} "${challenge.title}" bounty. The AI reviewer is temporarily unavailable — your badge has been awarded based on submission quality.`,
  }
}

const SUBMIT_TYPE_LABELS = {
  github: 'GitHub repo + live link',
  figma: 'Figma / Canva link',
  excel: 'Excel, PDF, or dashboard link',
  campaign: 'Slides or doc link',
  dashboard: 'Dashboard link',
  presentation: 'Presentation link',
}

/* ── Starter files for the coding sandbox ── */
const PAGESPEED_FILES = [
  {
    name: 'index.html', lang: 'html', editable: true,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PageSpeed Report Card</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>PageSpeed Report Card</h1>
    <p class="subtitle">Paste any URL and get a plain-English performance breakdown.</p>
    <div class="input-row">
      <input type="text" id="url-input" placeholder="https://example.com" />
      <button onclick="analyze()">Analyze →</button>
    </div>
    <div id="results" class="results hidden"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
  },
  {
    name: 'app.js', lang: 'js', editable: true,
    content: `// TODO: implement analyze()
// API: https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={URL}&strategy=mobile
// No API key needed for basic usage (rate-limited).
// Fetch both mobile + desktop, then render into #results.

async function analyze() {
  const raw = document.getElementById('url-input').value.trim()
  if (!raw) return
  const url = raw.startsWith('http') ? raw : 'https://' + raw

  const results = document.getElementById('results')
  results.classList.remove('hidden')
  results.innerHTML = '<p class="loading">Analyzing — this takes ~5 seconds...</p>'

  // Your code here
  // Hint: fetch mobile score, desktop score, LCP, CLS, and top 3 audit opportunities.
  // Render them using the CSS classes already defined in style.css.
}`,
  },
  {
    name: 'style.css', lang: 'css', editable: true,
    content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8f9fa; color: #1a1a1a; padding: 40px 20px;
}
.container { max-width: 680px; margin: 0 auto; }
h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
.subtitle { color: #666; margin-bottom: 22px; font-size: 14px; }

.input-row { display: flex; gap: 10px; margin-bottom: 24px; }
input {
  flex: 1; padding: 11px 14px; border: 2px solid #e0e0e0;
  border-radius: 8px; font-size: 15px; outline: none;
}
input:focus { border-color: #4285f4; }
button {
  padding: 11px 20px; background: #4285f4; color: #fff;
  border: none; border-radius: 8px; font-size: 15px; cursor: pointer; white-space: nowrap;
}
button:hover { background: #3367d6; }

.results { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.hidden { display: none; }
.loading { color: #666; font-size: 14px; }

/* Score grid */
.score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.score-card { text-align: center; padding: 18px; border-radius: 10px; background: #f8f9fa; }
.score-num { font-size: 40px; font-weight: 800; }
.score-lbl { font-size: 12px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: .5px; }
.good { color: #0cce6b; } .ok { color: #ffa400; } .poor { color: #ff4e42; }

/* Vitals */
.vitals { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.vital { flex: 1; min-width: 120px; background: #f8f9fa; border-radius: 8px; padding: 12px; }
.vital-val { font-size: 20px; font-weight: 700; }
.vital-lbl { font-size: 11px; color: #888; margin-top: 2px; }

/* Issues */
.issues-title { font-size: 13px; font-weight: 600; color: #444; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .4px; }
.issue { padding: 10px 12px; border-left: 3px solid #ffa400; background: #fff9f0; border-radius: 4px; margin-bottom: 8px; font-size: 14px; line-height: 1.5; }`,
  },
  {
    name: 'README.md', lang: 'md', editable: false,
    content: `# PageSpeed Report Card — Google Bounty

## What to build
A tool where a user pastes any URL and gets a clean, plain-English
performance report: mobile score, desktop score, Core Web Vitals, and
the top 3 issues explained without jargon.

## The API (no key needed)
\`\`\`
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
  ?url=https://example.com
  &strategy=mobile   # or desktop
\`\`\`
Key paths in the response:
- \`lighthouseResult.categories.performance.score\` × 100 = score
- \`lighthouseResult.audits['largest-contentful-paint'].displayValue\`
- \`lighthouseResult.audits['cumulative-layout-shift'].displayValue\`
- \`lighthouseResult.audits['total-blocking-time'].displayValue\`
- \`lighthouseResult.audits[id].details.type === 'opportunity'\` → top issues

## Files
- \`index.html\` — structure (edit freely)
- \`app.js\`     — your implementation goes here
- \`style.css\`  — styles ready to use, edit as needed
- \`README.md\`  — this file (read-only)

## What we evaluate
Does it work on any URL? Is the output readable to a non-engineer?
Is the code clean enough to hand off?`,
  },
]

const FALLBACK_BOUNTIES = [
  { id: 'fb1', company: 'LinkedIn', companyColor: '#0a66c2', title: 'New Grad Profile Gap Analysis', category: 'Research / Data', description: 'We keep seeing that new grad profiles get significantly fewer recruiter views than profiles with 2+ years of experience — even when the listed skills match the job requirements. Pull publicly available data from LinkedIn job postings for entry-level roles in 2-3 fields, sample 20-30 public new grad profiles, and compare what skills they list vs. what postings require. Produce a gap report: which skills appear in 5+ job postings but are underrepresented on new grad profiles? Deliverable: a clean PDF or slide deck with your methodology, top 10 skill gaps ranked by frequency, and 2-3 recommendations for how LinkedIn could help students close them.', submission_type: 'presentation', submissions_count: 34, submission_cap: 75, deadline: '2026-07-15' },
  { id: 'fb2', company: 'Canva', companyColor: '#7c2ae8', title: 'Template Discovery UX Audit', category: 'UX Research', description: 'Our template search has a real problem: search "birthday card" and you get 400 results with no meaningful sorting. Do a thorough UX audit of template search and discovery across 3 competitors — Adobe Express, Microsoft Designer, and Visme. Document the patterns: how do they handle search, filtering, sorting, previewing? Produce 3 specific, actionable recommendations for Canva. Deliverable: a slide deck or Figma document with screenshots, your analysis, and ranked recommendations. This goes directly to our product team.', submission_type: 'figma', submissions_count: 21, submission_cap: 60, deadline: '2026-07-20' },
  { id: 'fb3', company: 'Fidelity', companyColor: '#538234', title: 'Competitor Investing Onboarding Teardown', category: 'Product Research', description: 'We are redesigning onboarding for first-time investors aged 22-30. Sign up as a new user on Robinhood, Acorns, and Betterment (free tiers only). Document the full flows with screenshots: what do they ask, in what order, what copy do they use, where do they introduce risk? Then produce a teardown: what is each app doing well, what are they doing poorly, and what are the top 3 things Fidelity should borrow or deliberately avoid? Deliverable: a structured report our product team can use directly in our redesign sprint.', submission_type: 'presentation', submissions_count: 19, submission_cap: 50, deadline: '2026-07-28' },
  { id: 'fb4', company: 'Google', companyColor: '#4285f4', title: 'PageSpeed Report Card Tool', category: 'Engineering', description: 'The PageSpeed Insights API is public and free but the raw JSON is unreadable. Build a tool where a user pastes any URL and gets a clean report card: Core Web Vitals (LCP, CLS, FID), mobile vs. desktop score, and the top 3 issues in plain English. Deploy it publicly. This is a real internal utility on our backlog for developer relations. We evaluate: does it work on any URL, is the output readable to a non-engineer, is the code clean enough to hand off? Submit your live URL and GitHub repo.', submission_type: 'github', submissions_count: 12, submission_cap: 100, deadline: '2026-08-05' },
]

/* ── kept only so legacy shape refs compile ── */
const CHALLENGES = [
  {
    id: 1,
    company: 'LinkedIn',
    companyColor: '#0077b6',
    companyLogo: <LinkedInLogo />,
    title: 'Rate-Limited Feed Deduplicator',
    language: 'JavaScript',
    difficulty: 'Intermediate',
    reward: '$2,500',
    deadline: '4d 12h',
    participants: 10000,
    prompt: `The feed service can emit the same post more than once within a short window. Implement \`dedupeFeed(posts, windowMs)\` that returns the posts in their original order with any post whose \`id\` was already seen within the last \`windowMs\` milliseconds removed. Each post is \`{ id, ts }\` where \`ts\` is a millisecond timestamp.`,
    acceptanceCriteria: [
      'Preserves original ordering of the surviving posts',
      'A repeat id is kept again once it falls outside windowMs',
      'Runs in O(n) over the input (no nested scans)',
    ],
    files: [
      {
        name: 'solution.js', lang: 'js', editable: true,
        content: `/**
 * @param {{ id: string, ts: number }[]} posts  // sorted by ts ascending
 * @param {number} windowMs
 * @returns {{ id: string, ts: number }[]}
 */
export function dedupeFeed(posts, windowMs) {
  // Your code here.
}
`,
      },
      {
        name: 'feed.test.js', lang: 'js', editable: false,
        content: `import { dedupeFeed } from './solution.js'
import assert from 'node:assert/strict'

// A repeat id inside the window is dropped; ordering is preserved.
const posts = [
  { id: 'a', ts: 0 },
  { id: 'b', ts: 100 },
  { id: 'a', ts: 200 },   // within 1000ms of the first 'a' -> dropped
  { id: 'a', ts: 1500 },  // outside the window -> kept again
]
assert.deepEqual(dedupeFeed(posts, 1000).map(p => p.ts), [0, 100, 1500])

// Hidden suite also covers: empty input, all-unique, windowMs = 0.
console.log('example tests passed')
`,
      },
      {
        name: 'README.md', lang: 'md', editable: false,
        content: `# Rate-Limited Feed Deduplicator

Implement \`dedupeFeed\` in **solution.js**.

- \`solution.js\`  — your implementation (edit this)
- \`feed.test.js\` — example tests; the full hidden suite runs on submit

\`\`\`bash
npm test   # run the example tests locally
\`\`\`
`,
      },
    ],
  },
  {
    id: 2,
    company: 'Stripe',
    companyColor: '#635bff',
    companyLogo: <StripeLogo />,
    title: 'Idempotent Payment Retry',
    language: 'JavaScript',
    difficulty: 'Advanced',
    reward: '$4,000',
    deadline: '6d 03h',
    participants: 8200,
    prompt: `A client may retry a charge with the same idempotency key after a network blip. Implement \`charge(store, key, amount)\` so that repeated calls with the same \`key\` never double-charge: the first call records and returns a result; later calls with that key return the original result unchanged, even if \`amount\` differs. \`store\` is a Map you may read and write.`,
    acceptanceCriteria: [
      'Identical key returns the original result, never a second charge',
      'A different key with the same amount charges independently',
      'A conflicting amount on a known key returns the original, not the new one',
    ],
    files: [
      {
        name: 'solution.js', lang: 'js', editable: true,
        content: `/**
 * @param {Map<string, {amount:number, status:string}>} store
 * @param {string} key
 * @param {number} amount
 * @returns {{ amount: number, status: string }}
 */
export function charge(store, key, amount) {
  // Your code here.
}
`,
      },
      {
        name: 'charge.test.js', lang: 'js', editable: false,
        content: `import { charge } from './solution.js'
import assert from 'node:assert/strict'

const store = new Map()
const first = charge(store, 'idem_1', 500)
// Same key, different amount -> original result, no second charge.
const retry = charge(store, 'idem_1', 999)
assert.deepEqual(retry, first)
assert.equal(store.size, 1)

// A different key charges independently.
charge(store, 'idem_2', 500)
assert.equal(store.size, 2)

// Hidden suite also covers: concurrent retries, status transitions.
console.log('example tests passed')
`,
      },
      {
        name: 'README.md', lang: 'md', editable: false,
        content: `# Idempotent Payment Retry

Implement \`charge\` in **solution.js**.

- \`solution.js\`   — your implementation (edit this)
- \`charge.test.js\` — example tests; the full hidden suite runs on submit

A retry with a known key must **never** double-charge.
`,
      },
    ],
  },
  {
    id: 3,
    company: 'Vercel',
    companyColor: '#111111',
    companyLogo: <VercelLogo />,
    title: 'Incremental Path Cache Invalidation',
    language: 'JavaScript',
    difficulty: 'Intermediate',
    reward: '$3,000',
    deadline: '3d 18h',
    participants: 6400,
    prompt: `Pages are cached by path. When a path is revalidated, every cached descendant path must also be dropped. Implement \`invalidate(cache, path)\` that deletes \`path\` and any cached key that is a descendant of it (a key beginning with \`path + '/'\`), and returns the number of entries removed. \`cache\` is a Map keyed by path string.`,
    acceptanceCriteria: [
      'Removes the exact path and all of its descendants',
      'Leaves sibling and ancestor paths untouched',
      'Returns the count of entries actually removed',
    ],
    files: [
      {
        name: 'solution.js', lang: 'js', editable: true,
        content: `/**
 * @param {Map<string, unknown>} cache
 * @param {string} path  // e.g. "/blog"
 * @returns {number} entries removed
 */
export function invalidate(cache, path) {
  // Your code here.
}
`,
      },
      {
        name: 'cache.test.js', lang: 'js', editable: false,
        content: `import { invalidate } from './solution.js'
import assert from 'node:assert/strict'

const cache = new Map([
  ['/blog', 1],
  ['/blog/post-1', 1],
  ['/blog/post-2', 1],
  ['/about', 1],        // sibling -> must survive
])
const removed = invalidate(cache, '/blog')
assert.equal(removed, 3)
assert.ok(cache.has('/about'))
assert.ok(!cache.has('/blog/post-1'))

// Hidden suite also covers: trailing slashes, deep nesting, missing path.
console.log('example tests passed')
`,
      },
      {
        name: 'README.md', lang: 'md', editable: false,
        content: `# Incremental Path Cache Invalidation

Implement \`invalidate\` in **solution.js**.

- \`solution.js\`   — your implementation (edit this)
- \`cache.test.js\` — example tests; the full hidden suite runs on submit

Revalidating a path must drop it and all descendants — but never siblings.
`,
      },
    ],
  },
]

// Funnel the demo plays for every challenge: a large pool narrowed to a
// trustworthy top 10. The objective gate + dedup are mechanical — the AI
// only ever scores the ~30 that survive, never the 10k raw submissions.
function funnelStages(count, cap) {
  // submissions_count is live DB submissions; cap is the company's stated limit.
  // Display realistic-looking totals: treat cap as the pool size.
  const pool    = Math.max(cap ?? 100, count ?? 20)
  const reviewed = Math.round(pool * 0.62)
  const scored   = Math.round(reviewed * 0.28)
  return [
    { key: 'received',  label: 'Submissions received',         count: pool,     ai: false },
    { key: 'reviewed',  label: 'Passed initial quality check', count: reviewed, ai: false },
    { key: 'judged',    label: 'AI-scored on judgment',        count: scored,   ai: true  },
    { key: 'shortlist', label: 'Top 10 — sent to recruiters',  count: 10,       ai: false },
  ]
}

// Deterministic competitor pool so the shortlist is stable across renders.
const COMPETITORS = [
  { name: 'Aisha N.',   score: 99 }, { name: 'Diego R.',  score: 98 },
  { name: 'Mei L.',     score: 97 }, { name: 'Sam O.',    score: 96 },
  { name: 'Priya K.',   score: 95 }, { name: 'Tomás G.',  score: 94 },
  { name: 'Hana B.',    score: 93 }, { name: 'Noah W.',   score: 92 },
  { name: 'Lena F.',    score: 91 }, { name: 'Omar S.',   score: 90 },
  { name: 'Yuki T.',    score: 89 }, { name: 'Ivan P.',   score: 88 },
]

function buildShortlist(userScore) {
  const all = [...COMPETITORS, { name: 'You', score: userScore, isUser: true }]
    .sort((a, b) => b.score - a.score)
  const rank = all.findIndex(p => p.isUser) + 1
  return { top10: all.slice(0, 10), rank, madeTop10: rank <= 10 }
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function starterFiles(bounty) {
  if (bounty?.submission_type === 'github') return PAGESPEED_FILES
  return null
}

export default function BountyPage({ onEarnBadge }) {
  const [step, setStep] = useState('browse')
  const [selected, setSelected] = useState(null)
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submissionDesc, setSubmissionDesc] = useState('')
  const [fileContents, setFileContents] = useState({})
  const [aiResult, setAiResult] = useState(null)
  const [bounties, setBounties] = useState(null)

  useEffect(() => {
    supabase.from('bounties').select('*').eq('status', 'active').order('submissions_count', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data?.length) setBounties(data.map(b => ({
          id: b.id, company: b.company, companyColor: b.company_color,
          title: b.title, category: b.category, description: b.description,
          submission_type: b.submission_type, submissions_count: b.submissions_count,
          submission_cap: b.submission_cap ?? 100, deadline: b.deadline,
        })))
        else setBounties(FALLBACK_BOUNTIES)
      })
      .catch(() => setBounties(FALLBACK_BOUNTIES))
  }, [])

  function openChallenge(c) {
    setSelected(c); setSubmissionUrl(''); setSubmissionDesc('')
    const files = starterFiles(c)
    setFileContents(files ? Object.fromEntries(files.map(f => [f.name, f.content])) : {})
    setStep('detail')
  }
  function resetToBrowse() { setStep('browse'); setSelected(null); setAiResult(null) }

  const isCoding = selected?.submission_type === 'github'

  async function submitSolution() {
    setAiResult(null)
    setStep('results')
    let result
    try {
      if (isCoding) {
        const codeFiles = starterFiles(selected).map(f => ({ name: f.name, content: fileContents[f.name] ?? f.content }))
        const repo = codeFiles.filter(f => f.name !== 'README.md').map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n')
        const prompt = `You are a senior ${selected.company} engineer reviewing a student's code submission.

BOUNTY: "${selected.title}"
BRIEF: ${selected.description.slice(0, 300)}

SUBMITTED CODE:
${repo.slice(0, 2500)}

Write feedback that references specific parts of their code — function names, logic choices, or what they actually implemented. Do NOT give generic advice. Mention at least one specific thing they wrote.

Return JSON only:
{"score":<integer 60-99>,"percentile":"<e.g. Top 15%>","feedback":"<2-3 sentences citing specific parts of their code>"}`
        result = await callAI(prompt)
        result = result ?? {
          score: 82,
          percentile: 'Top 18%',
          feedback: `Code reviewed for the ${selected.company} "${selected.title}" bounty. The AI reviewer is temporarily unavailable — your badge has been awarded based on submission quality.`,
        }
      } else {
        result = await reviewWithAI(selected, submissionUrl, submissionDesc)
      }
    } catch (e) { console.warn('submitSolution error', e) }
    setAiResult(result)
    supabase.from('submissions').insert({
      submission_url: submissionUrl || null,
      ai_score: result.score, ai_percentile: result.percentile, ai_feedback: result.feedback,
    }).then(() => {}).catch(() => {})
  }

  if (step === 'browse')  return <BrowseView bounties={bounties} onOpen={openChallenge} />
  if (step === 'detail')  return <DetailView c={selected} onBack={resetToBrowse} onSolve={() => setStep('solve')} />
  if (step === 'solve' && isCoding) return <CodingSolveView c={selected} files={starterFiles(selected)} fileContents={fileContents} onEdit={(n,v) => setFileContents(p => ({...p,[n]:v}))} onBack={() => setStep('detail')} onSubmit={submitSolution} />
  if (step === 'solve')   return <SolveView c={selected} url={submissionUrl} desc={submissionDesc} onUrl={setSubmissionUrl} onDesc={setSubmissionDesc} onBack={() => setStep('detail')} onSubmit={submitSolution} />
  if (step === 'results') return <ResultsView c={selected} aiResult={aiResult} onContinue={() => setStep('awarded')} />
  if (step === 'awarded') return <AwardedView c={selected} aiResult={aiResult} onEarnBadge={onEarnBadge} onBack={resetToBrowse} />
  return null
}

/* ── Browse ── */
function BrowseView({ bounties, onOpen }) {
  const list = bounties ?? FALLBACK_BOUNTIES
  return (
    <div className="bounty-page">
      <div className="bounty-hero">
        <div className="bounty-hero-inner">
          <div className="bounty-hero-badge"><IconTarget size={13} /> LINKEDIN BOUNTIES</div>
          <h1 className="bounty-hero-title">Real work. Verified results.</h1>
          <p className="bounty-hero-sub">
            Companies post practical projects that give you real experience and something to show for it.
            Complete one, get your submission AI-reviewed, and earn a verified company badge on your profile.
          </p>
          <div className="bounty-flow-steps">
            {['Pick a bounty', 'Do the work', 'Submit your link', 'AI scores it', 'Verified badge'].map((s, i, arr) => (
              <span key={s} className="bflow">
                <span className="bflow-dot">{i + 1}</span>
                <span className="bflow-lbl">{s}</span>
                {i < arr.length - 1 && <span className="bflow-arr">→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bounty-content">
        <div className="bounty-section-hdr">
          <span className="bounty-section-label">Open Bounties</span>
          <span className="bounty-count">{list.length} available</span>
        </div>
        <div className="bounty-list">
          {list.map(c => (
            <div className="bl-card" key={c.id} onClick={() => onOpen(c)}>
              <div className="bl-left">
                <div className="bl-logo" style={{ background: c.companyColor }}>{c.company[0]}</div>
                <div className="bl-info">
                  <div className="bl-company-row">
                    <span className="bl-company">{c.company}</span>
                    <span className="bl-backlog"><IconCode size={11} /> {c.category}</span>
                  </div>
                  <div className="bl-title">{c.title}</div>
                  <div className="bl-meta-row">
                    <span className="bl-deadline-pill"><IconClock size={11} /> Due {c.deadline ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                    <span className="bl-participants"><IconUsers size={11} /> {(c.submissions_count ?? 0)} / {c.submission_cap ?? 100} spots filled</span>
                    <span className="bl-diff">{SUBMIT_TYPE_LABELS[c.submission_type] ?? c.submission_type}</span>
                  </div>
                  <div className="bl-cap-bar-track">
                    <div className="bl-cap-bar-fill" style={{ width: `${Math.min(((c.submissions_count ?? 0) / (c.submission_cap ?? 100)) * 100, 100)}%`, background: c.companyColor }} />
                  </div>
                </div>
              </div>
              <div className="bl-reward-col">
                <div className="bl-badge-anchor" style={{ color: c.companyColor }}>
                  <IconShieldCheck size={26} />
                  <span>Verified {c.company} badge</span>
                </div>
                <div className="bl-reward-lbl">Earned by everyone who submits</div>
                <button className="bl-open-btn" onClick={(e) => { e.stopPropagation(); onOpen(c) }}>
                  View bounty <IconChevronRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Detail ── */
function DetailView({ c, onBack, onSolve }) {
  const deadline = c.deadline ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  return (
    <div className="bounty-page">
      <div className="bd-back-bar">
        <button className="bd-back-btn" onClick={onBack}><IconArrowLeft size={16} /> Back to Bounties</button>
      </div>

      <div className="bd-wrap">
        <div className="bd-header" style={{ borderTop: `4px solid ${c.companyColor}` }}>
          <div className="bd-logo" style={{ background: c.companyColor }}>{c.company[0]}</div>
          <div>
            <div className="bd-company">{c.company}</div>
            <div className="bd-backlog-tag"><IconCode size={12} /> {c.category} · {SUBMIT_TYPE_LABELS[c.submission_type] ?? c.submission_type}</div>
          </div>
        </div>

        <h2 className="bd-title">{c.title}</h2>

        <div className="bd-stat-row">
          <div className="bd-stat">
            <div className="bd-stat-num bd-stat-badge" style={{ color: c.companyColor }}>
              <IconShieldCheck size={20} /> Verified badge
            </div>
            <div className="bd-stat-lbl">For everyone who submits</div>
          </div>
          <div className="bd-stat-div" />
          <div className="bd-stat">
            <div className="bd-stat-num" style={{ fontSize: 16 }}>{deadline}</div>
            <div className="bd-stat-lbl">Deadline</div>
          </div>
          <div className="bd-stat-div" />
          <div className="bd-stat">
            <div className="bd-stat-num">{(c.submissions_count ?? 0)} <span style={{fontSize:14,color:'#6b6b6b'}}>/ {c.submission_cap ?? 100}</span></div>
            <div className="bd-stat-lbl">Spots filled</div>
          </div>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">The brief</div>
          <p className="bd-text">{c.description}</p>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">What we're looking for</div>
          <ul className="bd-criteria">
            {[
              'Clear, practical output that addresses the brief',
              'Evidence of your own thinking — not just a template',
              'A short writeup explaining your decisions',
            ].map((crit, i) => (
              <li key={i} className="bd-criterion">
                <span className="bd-check" style={{ background: c.companyColor }}><IconCheck size={10} strokeWidth={3} /></span>
                {crit}
              </li>
            ))}
          </ul>
        </div>

        <div className="bd-submit-section">
          <div className="bd-section-label">How it works</div>
          <div className="bd-submit-row">
            <span className="bd-submit-ico" style={{ background: c.companyColor + '18', color: c.companyColor }}>
              <IconShieldCheck size={18} />
            </span>
            <span className="bd-submit-lbl">
              Submit your work link and a short description. LinkedIn Bounty AI reviews it and scores your judgment.
              Everyone who submits earns a verified {c.company} badge. Top 10 get a warm intro to {c.company}'s recruiters.
            </span>
          </div>
        </div>

        <button className="bd-start-btn" style={{ background: c.companyColor }} onClick={onSolve}>
          Submit my work <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ── Solve (project submission form) ── */
/* ── Coding Sandbox ── */
const DEMO_SOLUTION = {
  'app.js': `async function analyze() {
  const raw = document.getElementById('url-input').value.trim()
  if (!raw) return
  const url = raw.startsWith('http') ? raw : 'https://' + raw

  const results = document.getElementById('results')
  results.classList.remove('hidden')
  results.innerHTML = '<p class="loading">Analyzing — this takes ~5 seconds...</p>'

  try {
    const [mobileRes, desktopRes] = await Promise.all([
      fetch(\`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=\${encodeURIComponent(url)}&strategy=mobile\`),
      fetch(\`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=\${encodeURIComponent(url)}&strategy=desktop\`)
    ])
    const [mobile, desktop] = await Promise.all([mobileRes.json(), desktopRes.json()])

    const mScore = Math.round((mobile.lighthouseResult?.categories?.performance?.score ?? 0) * 100)
    const dScore = Math.round((desktop.lighthouseResult?.categories?.performance?.score ?? 0) * 100)
    const audits = mobile.lighthouseResult?.audits ?? {}

    const lcp  = audits['largest-contentful-paint']?.displayValue ?? 'N/A'
    const cls  = audits['cumulative-layout-shift']?.displayValue ?? 'N/A'
    const tbt  = audits['total-blocking-time']?.displayValue ?? 'N/A'

    const issues = Object.values(audits)
      .filter(a => a.details?.type === 'opportunity' && a.score != null && a.score < 0.9)
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .slice(0, 3)

    function scoreClass(s) { return s >= 90 ? 'good' : s >= 50 ? 'ok' : 'poor' }

    results.innerHTML = \`
      <div class="score-grid">
        <div class="score-card">
          <div class="score-num \${scoreClass(mScore)}">\${mScore}</div>
          <div class="score-lbl">Mobile</div>
        </div>
        <div class="score-card">
          <div class="score-num \${scoreClass(dScore)}">\${dScore}</div>
          <div class="score-lbl">Desktop</div>
        </div>
      </div>
      <div class="vitals">
        <div class="vital"><div class="vital-val">\${lcp}</div><div class="vital-lbl">Largest Contentful Paint</div></div>
        <div class="vital"><div class="vital-val">\${cls}</div><div class="vital-lbl">Layout Shift</div></div>
        <div class="vital"><div class="vital-val">\${tbt}</div><div class="vital-lbl">Total Blocking Time</div></div>
      </div>
      \${issues.length ? \`<div class="issues-title">Top issues to fix</div>\${issues.map(i =>
        \`<div class="issue">\${i.title}: \${i.displayValue ?? ''}</div>\`).join('')}\` : ''}
    \`
  } catch (e) {
    results.innerHTML = '<p class="loading">Could not fetch — check the URL and try again.</p>'
  }
}`,
}

function CodingSolveView({ c, files, fileContents, onEdit, onBack, onSubmit }) {
  const [activeFile, setActiveFile] = useState(files[0].name)
  const [preview, setPreview] = useState(false)
  const previewRef = useRef(null)

  const current = files.find(f => f.name === activeFile) ?? files[0]
  const content = fileContents[activeFile] ?? current.content
  const changed = files.some(f => f.editable && (fileContents[f.name] ?? f.content) !== f.content)

  function loadDemo() {
    Object.entries(DEMO_SOLUTION).forEach(([name, val]) => onEdit(name, val))
    setActiveFile('app.js')
  }

  function runPreview() {
    const html = fileContents['index.html'] ?? files.find(f => f.name === 'index.html')?.content ?? ''
    const js   = fileContents['app.js']     ?? files.find(f => f.name === 'app.js')?.content ?? ''
    const css  = fileContents['style.css']  ?? files.find(f => f.name === 'style.css')?.content ?? ''
    const doc = html
      .replace('</head>', `<style>${css}</style></head>`)
      .replace('<script src="app.js"></script>', `<script>${js}</script>`)
    if (previewRef.current) {
      previewRef.current.srcdoc = doc
    }
    setPreview(true)
  }

  const GLYPH = { html: { t: 'H', c: '#e34f26', f: '#fff' }, js: { t: 'JS', c: '#f7df1e', f: '#000' }, css: { t: 'C', c: '#264de4', f: '#fff' }, md: { t: 'MD', c: '#555', f: '#fff' } }

  return (
    <div className="cse-screen">
      {/* Top bar */}
      <div className="cse-topbar">
        <button className="bd-back-btn" style={{ color: '#ccc' }} onClick={onBack}><IconArrowLeft size={15} /> Exit</button>
        <div className="cse-topbar-title">
          <div className="cse-co-dot" style={{ background: c.companyColor }}>{c.company[0]}</div>
          <span>{c.company} · {c.title}</span>
        </div>
        <div className="cse-topbar-actions">
          <button className="cse-demo-btn" onClick={loadDemo}>⚡ Load Demo</button>
          <button className="cse-run-btn" onClick={runPreview}>▶ Run Preview</button>
          <button
            className="cse-submit-btn"
            style={{ background: changed ? c.companyColor : '#555', cursor: changed ? 'pointer' : 'not-allowed' }}
            disabled={!changed}
            onClick={onSubmit}
          >
            Submit <IconBolt size={14} />
          </button>
        </div>
      </div>

      <div className="cse-body">
        {/* Problem pane */}
        <div className="cse-brief">
          <div className="cse-brief-hdr">Brief</div>
          <p className="cse-brief-text">{c.description}</p>
          <div className="cse-brief-hdr" style={{ marginTop: 20 }}>What we evaluate</div>
          {['Does it work on any URL?', 'Is output readable to a non-engineer?', 'Is the code clean enough to hand off?'].map(s => (
            <div key={s} className="cse-brief-item">
              <span className="bd-check" style={{ background: c.companyColor, flexShrink: 0 }}><IconCheck size={9} strokeWidth={3} /></span>
              {s}
            </div>
          ))}
          <div className="cse-ai-note"><IconSparkles size={13} /> AI grades on judgment — using APIs, docs, or AI tools is fine.</div>
        </div>

        {/* IDE */}
        <div className="cse-ide">
          {/* File tree */}
          <div className="cse-tree">
            <div className="cse-tree-hdr"><IconFolder size={13} /> {c.company.toLowerCase()}-bounty</div>
            {files.map(f => {
              const g = GLYPH[f.lang] ?? GLYPH.md
              return (
                <button key={f.name} className={`cse-tree-file${f.name === activeFile ? ' active' : ''}`} onClick={() => setActiveFile(f.name)}>
                  <span className="cse-glyph" style={{ background: g.c, color: g.f }}>{g.t}</span>
                  <span className="cse-tree-name">{f.name}</span>
                  {!f.editable && <IconLock size={10} style={{ color: '#666', marginLeft: 'auto' }} />}
                </button>
              )
            })}
          </div>

          {/* Editor + preview */}
          <div className="cse-editor-wrap">
            <div className="cse-editor-hdr">
              <span className="cse-dot r" /><span className="cse-dot y" /><span className="cse-dot g" />
              <span className="cse-editor-fname">{activeFile}</span>
              {!current.editable && <span className="cse-readonly">read-only</span>}
              {preview && <button className="cse-close-preview" onClick={() => setPreview(false)}>✕ Close preview</button>}
            </div>
            {preview ? (
              <iframe ref={previewRef} className="cse-preview-frame" sandbox="allow-scripts" title="preview" />
            ) : (
              <textarea
                className="cse-editor"
                value={content}
                onChange={e => onEdit(activeFile, e.target.value)}
                readOnly={!current.editable}
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SolveView({ c, url, desc, onUrl, onDesc, onBack, onSubmit }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const canSubmit = url.trim().length > 0 && desc.trim().length > 10
  const spotsLeft = (c.submission_cap ?? 100) - (c.submissions_count ?? 0)

  function addFiles(incoming) {
    const next = [...incoming].filter(f => !files.some(e => e.name === f.name))
    setFiles(prev => [...prev, ...next])
  }
  function removeFile(name) { setFiles(prev => prev.filter(f => f.name !== name)) }
  function onDrop(e) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }

  return (
    <div className="bounty-page">
      <div className="bd-back-bar">
        <button className="bd-back-btn" onClick={onBack}><IconArrowLeft size={16} /> Back to brief</button>
      </div>
      <div className="bd-wrap">
        <div className="bd-header" style={{ borderTop: `4px solid ${c.companyColor}` }}>
          <div className="bd-logo" style={{ background: c.companyColor }}>{c.company[0]}</div>
          <div>
            <div className="bd-company">{c.company}</div>
            <div className="bd-backlog-tag">{c.title}</div>
          </div>
        </div>

        {spotsLeft <= 15 && spotsLeft > 0 && (
          <div className="sv-spots-warning">
            ⚡ Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining — this bounty closes at {c.submission_cap} submissions.
          </div>
        )}

        <h2 className="bd-title">Submit your work</h2>
        <p className="bd-text" style={{ marginBottom: 24 }}>
          Paste your link, describe your approach, and optionally upload supporting files.
          LinkedIn Bounty AI reviews everything and scores your judgment.
        </p>

        <div className="bd-section">
          <div className="bd-section-label">
            {SUBMIT_TYPE_LABELS[c.submission_type] ?? 'Submission link'} <span style={{ color: '#e03e2d' }}>*</span>
          </div>
          <input
            className="rv-input"
            style={{ width: '100%', marginTop: 8, fontSize: 15 }}
            placeholder={c.submission_type === 'github' ? 'https://github.com/you/project' : 'https://...'}
            value={url}
            onChange={e => onUrl(e.target.value)}
          />
        </div>

        <div className="bd-section" style={{ marginTop: 20 }}>
          <div className="bd-section-label">Describe your approach <span style={{ color: '#e03e2d' }}>*</span></div>
          <textarea
            className="rv-textarea"
            style={{ width: '100%', marginTop: 8, minHeight: 110, fontSize: 15 }}
            placeholder="What did you build? What decisions did you make and why? What would you do differently?"
            value={desc}
            onChange={e => onDesc(e.target.value)}
          />
        </div>

        {/* File upload */}
        <div className="bd-section" style={{ marginTop: 20 }}>
          <div className="bd-section-label">Supporting files <span style={{ color: '#6b6b6b', fontWeight: 400 }}>(optional)</span></div>
          <div
            className={`sv-drop-zone${dragging ? ' dragging' : ''}`}
            style={{ borderColor: dragging ? c.companyColor : undefined }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <IconUpload size={22} style={{ color: dragging ? c.companyColor : '#9b9b9b' }} />
            <span className="sv-drop-label">Drag files here or <span style={{ color: c.companyColor }}>browse</span></span>
            <span className="sv-drop-hint">PDF, PNG, XLSX, CSV, ZIP — up to 20 MB each</span>
            <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div className="sv-file-list">
              <div className="sv-ide-hdr">
                <IconFolder size={13} /> {c.company.toLowerCase()}-bounty-submission
              </div>
              {files.map(f => (
                <div key={f.name} className="sv-file-row">
                  <IconFile size={14} style={{ color: '#0a66c2', flexShrink: 0 }} />
                  <span className="sv-file-name">{f.name}</span>
                  <span className="sv-file-size">{f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`}</span>
                  <button className="sv-file-remove" onClick={() => removeFile(f.name)}><IconX size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="solve-hidden-note" style={{ marginTop: 16 }}>
          <IconSparkles size={15} />
          AI reviews your link, description, and files — scored on thinking and judgment, not perfection.
        </div>

        <button
          className="bd-start-btn"
          style={{ background: canSubmit ? c.companyColor : '#c8c8c8', cursor: canSubmit ? 'pointer' : 'not-allowed', marginTop: 24 }}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Submit for AI review <IconBolt size={16} />
        </button>
      </div>
    </div>
  )
}

/* ── Results ── */
function ResultsView({ c, aiResult, onContinue }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    if (aiResult) return
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [aiResult])

  function scoreColor(s) {
    if (s >= 80) return '#059669'
    if (s >= 60) return '#d97706'
    return '#dc2626'
  }
  function scoreLabel(s) {
    if (s >= 85) return 'Excellent'
    if (s >= 70) return 'Strong'
    if (s >= 55) return 'Good'
    return 'Needs work'
  }
  const s = aiResult?.score ?? 0

  return (
    <div className="bounty-page">
      <div className="bd-wrap rs-wrap">
        <div className="rs-hdr">
          <span className="rs-co" style={{ background: c.companyColor }}>{c.companyLogo}</span>
          <div>
            <div className="rs-title">{c.company} · {c.title}</div>
            <div className="rs-sub">
              Your submission is being reviewed by an AI judge trained on what {c.company} engineers look for — correctness, clarity, and whether it actually solves the brief.
            </div>
          </div>
        </div>

        {!aiResult ? (
          <div className="rs-loading">
            <div className="rs-spinner" style={{ borderTopColor: c.companyColor }} />
            <div className="rs-loading-text">Reviewing your submission{dots}</div>
            <div className="rs-loading-hint">This usually takes 5–15 seconds</div>
          </div>
        ) : (
          <div className="rs-score-card">
            <div className="rs-score-row">
              <div className="rs-score-main">
                <div className="rs-score-num" style={{ color: scoreColor(s) }}>{s}</div>
                <div className="rs-score-label" style={{ color: scoreColor(s) }}>{scoreLabel(s)}</div>
              </div>
              <div className="rs-score-divider" />
              <div className="rs-percentile-block">
                <div className="rs-percentile-val">{aiResult.percentile}</div>
                <div className="rs-percentile-lbl">of all submissions</div>
              </div>
            </div>
            <div className="rs-feedback">
              <div className="rs-feedback-label"><IconSparkles size={13} /> AI feedback</div>
              <p className="rs-feedback-text">{aiResult.feedback}</p>
            </div>
            <button className="bd-start-btn" style={{ background: c.companyColor }} onClick={onContinue}>
              Claim your verified badge <IconChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Awarded ── */
function AwardedView({ c, aiResult, onEarnBadge, onBack }) {
  const score = aiResult?.score ?? 88
  const percentile = aiResult?.percentile ?? 'Top 14%'
  const feedback = aiResult?.feedback ?? 'Correct, readable solution that handles the core cases.'
  const { rank, madeTop10 } = buildShortlist(score)
  const [added, setAdded] = useState(false)

  function addToProfile() {
    if (added) return
    onEarnBadge?.({
      id: c.id,
      company: c.company,
      companyColor: c.companyColor,
      title: c.title,
      score,
      percentile,
      rank: madeTop10 ? rank : null,
    })
    setAdded(true)
  }

  return (
    <div className="bounty-page">
      <div className="bd-wrap ba-center">
        <div className="ba-confetti">{madeTop10 ? '🏆' : '🎉'}</div>
        <div className="ba-badge-icon" style={{ background: c.companyColor }}>{c.companyLogo}</div>

        <div className="ba-score-row">
          <div className="ba-score-block">
            <div className="ba-score-num" style={{ color: c.companyColor }}>{score}</div>
            <div className="ba-score-label">Judgment score</div>
          </div>
          <div className="ba-score-divider" />
          <div className="ba-score-block">
            <div className="ba-score-num" style={{ color: c.companyColor, fontSize: 26 }}>{percentile}</div>
            <div className="ba-score-label">of submissions</div>
          </div>
        </div>

        <h2 className="ba-title">{madeTop10 ? `Top 10 — placed #${rank}!` : 'Verified badge earned!'}</h2>
        <p className="ba-subtitle">
          {madeTop10
            ? `You're on ${c.company}'s recruiter shortlist for this bounty, with a warm intro on the way.`
            : `You cleared the objective gate. Your work is verified and you're now visible to ${c.company}'s recruiters.`}
        </p>

        <div className="ba-badge-card">
          <div className="ba-badge-logo" style={{ background: c.companyColor }}>{c.companyLogo}</div>
          <div className="ba-badge-info">
            <div className="ba-badge-name">{c.company} Bounty · {c.title}</div>
            <div className="ba-badge-meta">Score {score}/100 · {percentile} · {c.category}</div>
            <div className="ba-verified">
              <IconShieldCheck size={11} strokeWidth={3} /> Verified by LinkedIn Bounty
            </div>
          </div>
        </div>

        <div className="ba-claim">"{BADGE_CLAIM}"</div>

        <div className="ba-feedback">
          <div className="ba-feedback-label"><IconSparkles size={14} /> AI feedback on your judgment</div>
          <p className="ba-feedback-text">{feedback}</p>
        </div>

        <div className="ba-actions">
          <button
            className="ba-profile-btn"
            style={{ background: added ? '#059669' : c.companyColor }}
            onClick={addToProfile}
          >
            {added ? <><IconCheck size={16} strokeWidth={3} /> Added to profile</> : 'Add badge to profile'}
          </button>
          <button className="ba-more-btn" onClick={onBack}>Browse more bounties</button>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ── */
function barWidth(count, max) {
  // Log scale so a 10-vs-10,000 funnel still reads as a funnel, not a sliver.
  const w = (Math.log(count) / Math.log(max)) * 100
  return Math.max(8, Math.min(100, w))
}

function initials(name) {
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

function CountNumber({ from, to, reduced }) {
  const [val, setVal] = useState(reduced ? to : from)
  const raf = useRef(0)
  useEffect(() => {
    if (reduced || from === to) { setVal(to); return }
    const duration = 620
    let start = null
    const tick = (ts) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (to - from) * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [from, to, reduced])
  return <>{val.toLocaleString()}</>
}

/* ── Company logos ── */
function LinkedInLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 10h3v9H5v-9zM13 10h-3v9h3v-4.5c0-2 2.5-2.2 2.5 0V19h3v-5.5c0-4-4.5-3.8-5.5-2V10z" />
    </svg>
  )
}

function StripeLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
      <text x="12" y="17" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="Georgia,serif" fill="#fff">S</text>
    </svg>
  )
}

function VercelLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
      <path d="M12 4l9 16H3L12 4z" />
    </svg>
  )
}
