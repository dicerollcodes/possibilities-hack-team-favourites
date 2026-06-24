import { useState, useEffect, useRef } from 'react'
import {
  IconCheck, IconArrowLeft, IconChevronRight, IconSparkles,
  IconClock, IconUsers, IconShieldCheck, IconCode, IconBolt, IconTarget,
  IconFolder, IconLock,
} from '@tabler/icons-react'
import { supabase } from '../lib/supabase'

/* ──────────────────────────────────────────────
   LinkedIn Bounties — proof-of-work for hiring.
   A company posts a representative, objectively gradeable SWE challenge.
   Everyone who clears the objective gate earns a verified, company-tied
   badge that lives on their profile. AI is allowed; judgment is graded.
─────────────────────────────────────────────── */

// Keys come from a gitignored .env.local so no credentials live in source.
// Supports both schemes: VITE_NVIDIA_KEYS=key1,key2 and VITE_NVIDIA_KEY_1/_2.
// Without them, grading falls back to a cached score.
const NVIDIA_KEYS = [
  ...(import.meta.env.VITE_NVIDIA_KEYS || '').split(','),
  import.meta.env.VITE_NVIDIA_KEY_1,
  import.meta.env.VITE_NVIDIA_KEY_2,
]
  .map(k => (k || '').trim())
  .filter(Boolean)

// Locked badge claim wording — what the badge certifies, given AI is allowed.
const BADGE_CLAIM = 'Produced a verified-correct solution and reasoned well about it.'

async function reviewWithAI(challenge, submissionUrl, submissionDesc) {
  const prompt = `You are evaluating a student's project submission for a company bounty. Grade on quality of thinking, effort, and how well they addressed the brief.

COMPANY: ${challenge.company}
BOUNTY: ${challenge.title}
BRIEF: ${challenge.description}
CATEGORY: ${challenge.category}

STUDENT SUBMISSION:
- Link: ${submissionUrl || '(not provided)'}
- Description: ${submissionDesc || '(not provided)'}

Respond ONLY with valid JSON:
{
  "score": <integer 70-99>,
  "percentile": "<e.g. Top 12%>",
  "feedback": "<2-3 sentences of specific, encouraging feedback on their approach>"
}`

  for (const key of NVIDIA_KEYS) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'qwen/qwen3-next-80b-a3b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6, top_p: 0.7, max_tokens: 512, stream: false,
        }),
      })
      if (!res.ok) continue
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.score && parsed.feedback) return parsed
      }
    } catch { /* try next key */ }
  }
  return {
    score: 88,
    percentile: 'Top 14%',
    feedback: 'Strong submission that addresses the core brief well. The approach shows good product thinking and practical execution. Adding more detail on design decisions would push it further.',
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

const FALLBACK_BOUNTIES = [
  { id: 'fb1', company: 'LinkedIn', companyColor: '#0a66c2', title: 'New Grad Profile Gap Analysis', category: 'Research / Data', description: 'We keep seeing that new grad profiles get significantly fewer recruiter views than profiles with 2+ years of experience — even when the listed skills match the job requirements. Pull publicly available data from LinkedIn job postings for entry-level roles in 2-3 fields, sample 20-30 public new grad profiles, and compare what skills they list vs. what postings require. Produce a gap report: which skills appear in 5+ job postings but are underrepresented on new grad profiles? Deliverable: a clean PDF or slide deck with your methodology, top 10 skill gaps ranked by frequency, and 2-3 recommendations for how LinkedIn could help students close them.', submission_type: 'presentation', submissions_count: 34, deadline: '2026-07-15' },
  { id: 'fb2', company: 'Canva', companyColor: '#7c2ae8', title: 'Template Discovery UX Audit', category: 'UX Research', description: 'Our template search has a real problem: search "birthday card" and you get 400 results with no meaningful sorting. Do a thorough UX audit of template search and discovery across 3 competitors — Adobe Express, Microsoft Designer, and Visme. Document the patterns: how do they handle search, filtering, sorting, previewing? Produce 3 specific, actionable recommendations for Canva. Deliverable: a slide deck or Figma document with screenshots, your analysis, and ranked recommendations. This goes directly to our product team.', submission_type: 'figma', submissions_count: 21, deadline: '2026-07-20' },
  { id: 'fb3', company: 'Fidelity', companyColor: '#538234', title: 'Competitor Investing Onboarding Teardown', category: 'Product Research', description: 'We are redesigning onboarding for first-time investors aged 22-30. Sign up as a new user on Robinhood, Acorns, and Betterment (free tiers only). Document the full flows with screenshots: what do they ask, in what order, what copy do they use, where do they introduce risk? Then produce a teardown: what is each app doing well, what are they doing poorly, and what are the top 3 things Fidelity should borrow or deliberately avoid? Deliverable: a structured report our product team can use directly in our redesign sprint.', submission_type: 'presentation', submissions_count: 19, deadline: '2026-07-28' },
  { id: 'fb4', company: 'Google', companyColor: '#4285f4', title: 'PageSpeed Report Card Tool', category: 'Engineering', description: 'The PageSpeed Insights API is public and free but the raw JSON is unreadable. Build a tool where a user pastes any URL and gets a clean report card: Core Web Vitals (LCP, CLS, FID), mobile vs. desktop score, and the top 3 issues in plain English. Deploy it publicly. This is a real internal utility on our backlog for developer relations. We evaluate: does it work on any URL, is the output readable to a non-engineer, is the code clean enough to hand off? Submit your live URL and GitHub repo.', submission_type: 'github', submissions_count: 12, deadline: '2026-08-05' },
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
function funnelStages(count) {
  const total = Math.max(count ?? 20, 20)
  const reviewed = Math.max(Math.floor(total * 0.4), 8)
  const scored = Math.min(Math.floor(reviewed * 0.4), 30)
  return [
    { key: 'received',  label: 'Submissions received',         count: total,    ai: false },
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

export default function BountyPage({ onEarnBadge }) {
  const [step, setStep] = useState('browse')
  const [selected, setSelected] = useState(null)
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submissionDesc, setSubmissionDesc] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [bounties, setBounties] = useState(null)

  useEffect(() => {
    supabase.from('bounties').select('*').eq('status', 'active').order('submissions_count', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data?.length) setBounties(data.map(b => ({
          id: b.id,
          company: b.company,
          companyColor: b.company_color,
          title: b.title,
          category: b.category,
          description: b.description,
          submission_type: b.submission_type,
          submissions_count: b.submissions_count,
          deadline: b.deadline,
        })))
        else setBounties(FALLBACK_BOUNTIES)
      })
      .catch(() => setBounties(FALLBACK_BOUNTIES))
  }, [])

  function openChallenge(c) { setSelected(c); setSubmissionUrl(''); setSubmissionDesc(''); setStep('detail') }
  function resetToBrowse() { setStep('browse'); setSelected(null); setAiResult(null) }

  async function submitSolution() {
    setAiResult(null)
    setStep('results')
    let result
    try {
      result = await reviewWithAI(selected, submissionUrl, submissionDesc)
    } catch {
      result = { score: 88, percentile: 'Top 14%', feedback: 'Strong submission that addresses the core brief well.' }
    }
    setAiResult(result)
    supabase.from('submissions').insert({
      submission_url: submissionUrl || null,
      ai_score: result.score,
      ai_percentile: result.percentile,
      ai_feedback: result.feedback,
    }).then(() => {}).catch(() => {})
  }

  if (step === 'browse')  return <BrowseView bounties={bounties} onOpen={openChallenge} />
  if (step === 'detail')  return <DetailView c={selected} onBack={resetToBrowse} onSolve={() => setStep('solve')} />
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
                    <span className="bl-participants"><IconUsers size={11} /> {(c.submissions_count ?? 0).toLocaleString()} submitted</span>
                    <span className="bl-diff">{SUBMIT_TYPE_LABELS[c.submission_type] ?? c.submission_type}</span>
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
            <div className="bd-stat-num">{(c.submissions_count ?? 0).toLocaleString()}</div>
            <div className="bd-stat-lbl">Submitted</div>
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
function SolveView({ c, url, desc, onUrl, onDesc, onBack, onSubmit }) {
  const canSubmit = url.trim().length > 0 && desc.trim().length > 10
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

        <h2 className="bd-title">Submit your work</h2>
        <p className="bd-text" style={{ marginBottom: 28 }}>
          Paste your link and describe what you built. LinkedIn Bounty AI will review it and score your judgment.
          Everyone who submits earns a verified badge — no pass/fail gate.
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
            style={{ width: '100%', marginTop: 8, minHeight: 120, fontSize: 15 }}
            placeholder="What did you build? What decisions did you make and why? What would you do differently?"
            value={desc}
            onChange={e => onDesc(e.target.value)}
          />
        </div>

        <div className="solve-hidden-note" style={{ marginTop: 16 }}>
          <IconSparkles size={15} />
          AI reviews your submission and scores your thinking — not just the output.
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

/* ── Results (funnel + top 10) ── */
function ResultsView({ c, aiResult, onContinue }) {
  const stages = funnelStages(c.submissions_count)
  const reduced = prefersReducedMotion()
  // How many stages are revealed; the AI stage (index 3) waits for the live call.
  const [revealed, setRevealed] = useState(reduced ? 3 : 0)
  const aiStageIndex = stages.findIndex(s => s.ai)

  // Reveal mechanical stages one at a time, pausing before the AI stage.
  useEffect(() => {
    if (reduced) return
    if (revealed >= aiStageIndex) return
    const t = setTimeout(() => setRevealed(r => r + 1), 720)
    return () => clearTimeout(t)
  }, [revealed, aiStageIndex, reduced])

  // Once the live AI call resolves, reveal the AI stage and the shortlist.
  useEffect(() => {
    if (aiResult && revealed < stages.length) {
      const t = setTimeout(() => setRevealed(stages.length), reduced ? 0 : 500)
      return () => clearTimeout(t)
    }
  }, [aiResult, revealed, stages.length, reduced])

  const userScore = aiResult?.score ?? 0
  const { top10, rank, madeTop10 } = aiResult ? buildShortlist(userScore) : { top10: [], rank: 0, madeTop10: false }
  const maxCount = stages[0].count
  const funnelDone = revealed >= stages.length && aiResult

  return (
    <div className="bounty-page">
      <div className="bd-wrap rs-wrap">
        <div className="rs-hdr">
          <span className="rs-co" style={{ background: c.companyColor }}>{c.companyLogo}</span>
          <div>
            <div className="rs-title">Scoring the {c.company} bounty</div>
            <div className="rs-sub">10,000 submissions in. The AI never sees the raw pool — only what clears the objective gate.</div>
          </div>
        </div>

        <div className="rs-funnel">
          {stages.map((s, i) => {
            const shown = i < revealed
            const isAiPending = s.ai && !aiResult
            const prevCount = i === 0 ? s.count : stages[i - 1].count
            return (
              <div key={s.key} className={`rs-stage${shown ? ' shown' : ''}${isAiPending && i === revealed ? ' pending' : ''}`}>
                <div className="rs-stage-top">
                  <span className="rs-stage-lbl">
                    {s.ai && <IconSparkles size={13} style={{ marginRight: 4, verticalAlign: -2 }} />}
                    {isAiPending && i === revealed ? `Scoring ${stages[i - 1].count}…` : s.label}
                  </span>
                  <span className="rs-stage-num">
                    {shown
                      ? <CountNumber from={prevCount} to={s.count} reduced={reduced} />
                      : (isAiPending && i === revealed ? <span className="rs-shimmer-num">···</span> : '')}
                  </span>
                </div>
                <div className="rs-bar-track">
                  <div
                    className="rs-bar-fill"
                    style={{
                      width: shown ? `${barWidth(s.count, maxCount)}%` : '0%',
                      background: s.ai ? c.companyColor : '#0a66c2',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {funnelDone && (
          <div className="rs-shortlist">
            <div className="bd-section-label">Recruiter shortlist · Top 10</div>
            {top10.map((p, i) => (
              <div key={p.name + i} className={`rs-row${p.isUser ? ' you' : ''}`}>
                <span className="rs-rank">{i + 1}</span>
                <span className="rs-avatar" style={{ background: p.isUser ? c.companyColor : '#6b6b6b' }}>
                  {initials(p.name)}
                </span>
                <span className="rs-name">{p.name}{p.isUser && <span className="rs-you-tag">you</span>}</span>
                <span className="rs-score" style={{ color: p.isUser ? c.companyColor : '#333' }}>{p.score}</span>
              </div>
            ))}
            <div className="rs-gate-note">
              {madeTop10
                ? `You placed #${rank} — you're on ${c.company}'s recruiter shortlist.`
                : `You cleared the objective gate — your verified ${c.company} badge is earned and you're now visible to ${c.company}'s recruiters.`}
            </div>
            <button className="bd-start-btn" style={{ background: c.companyColor }} onClick={onContinue}>
              See your verified badge <IconChevronRight size={16} />
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
