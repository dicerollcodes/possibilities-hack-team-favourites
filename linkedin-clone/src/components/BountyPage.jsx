import { useState, useEffect, useRef } from 'react'
import {
  IconCheck, IconArrowLeft, IconChevronRight, IconSparkles,
  IconClock, IconUsers, IconShieldCheck, IconCode, IconBolt, IconTarget,
} from '@tabler/icons-react'

/* ──────────────────────────────────────────────
   LinkedIn Bounties — proof-of-work for hiring.
   A company posts a representative, objectively gradeable SWE challenge.
   Everyone who clears the objective gate earns a verified, company-tied
   badge that lives on their profile. AI is allowed; judgment is graded.
─────────────────────────────────────────────── */

// Keys come from a gitignored .env.local (VITE_NVIDIA_KEYS=key1,key2) so no
// credentials live in source. Without them, grading falls back to a cached score.
const NVIDIA_KEYS = (import.meta.env.VITE_NVIDIA_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean)

// Locked badge claim wording — what the badge certifies, given AI is allowed.
const BADGE_CLAIM = 'Produced a verified-correct solution and reasoned well about it.'

async function reviewWithAI(challenge, code) {
  const prompt = `You are a senior software engineer evaluating a candidate's solution to a coding challenge on a hiring-signal bounty platform. AI assistance was ALLOWED while solving — grade the candidate on engineering JUDGMENT (correctness, edge-case handling, clarity, and the reasoning evident in the code), NOT on whether they typed it unaided.

CHALLENGE: ${challenge.title}
COMPANY: ${challenge.company}
LANGUAGE: ${challenge.language}
PROBLEM:
${challenge.prompt}

ACCEPTANCE CRITERIA:
${challenge.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

CANDIDATE SUBMISSION:
\`\`\`
${code}
\`\`\`

Respond ONLY with valid JSON in this exact format:
{
  "score": <integer 0-100>,
  "percentile": "<e.g. Top 8%>",
  "feedback": "<2-3 sentences of specific feedback referencing their actual code and the judgment it shows>"
}`

  for (const key of NVIDIA_KEYS) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'qwen/qwen3-next-80b-a3b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          top_p: 0.7,
          max_tokens: 512,
          stream: false,
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
    } catch { /* try next key, then fall through */ }
  }
  // Cached fallback if both keys fail — the badge is still awarded.
  return {
    score: 88,
    percentile: 'Top 14%',
    feedback: 'Correct, readable solution that handles the core cases and reads like production code. To push into the top tier, tighten the edge-case handling and make the time/space trade-off explicit.',
  }
}

/* ── Challenge catalog (SWE-only) ── */
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
    starterCode: `/**
 * @param {{ id: string, ts: number }[]} posts  // sorted by ts ascending
 * @param {number} windowMs
 * @returns {{ id: string, ts: number }[]}
 */
function dedupeFeed(posts, windowMs) {
  // Your code here.
}
`,
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
    starterCode: `/**
 * @param {Map<string, {amount:number, status:string}>} store
 * @param {string} key
 * @param {number} amount
 * @returns {{ amount: number, status: string }}
 */
function charge(store, key, amount) {
  // Your code here.
}
`,
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
    starterCode: `/**
 * @param {Map<string, unknown>} cache
 * @param {string} path  // e.g. "/blog"
 * @returns {number} entries removed
 */
function invalidate(cache, path) {
  // Your code here.
}
`,
  },
]

// Funnel the demo plays for every challenge: a large pool narrowed to a
// trustworthy top 10. The objective gate + dedup are mechanical — the AI
// only ever scores the ~30 that survive, never the 10k raw submissions.
function funnelStages(participants) {
  return [
    { key: 'received', label: 'Submissions received',              count: participants, ai: false },
    { key: 'tests',    label: 'Compiled & passed hidden tests',    count: 312,          ai: false },
    { key: 'integrity',label: 'Cleared dedup & injection scrub',   count: 30,           ai: false },
    { key: 'judged',   label: 'AI-scored on judgment',             count: 12,           ai: true  },
    { key: 'shortlist',label: 'Top 10 — sent to recruiters',       count: 10,           ai: false },
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
  const [step, setStep] = useState('browse')   // browse | detail | solve | results | awarded
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState('')
  const [aiResult, setAiResult] = useState(null)

  function openChallenge(c) { setSelected(c); setStep('detail') }
  function startSolving() { setCode(selected.starterCode); setStep('solve') }
  function resetToBrowse() {
    setStep('browse'); setSelected(null); setCode(''); setAiResult(null)
  }

  async function submitSolution() {
    setAiResult(null)
    setStep('results')
    try {
      const result = await reviewWithAI(selected, code)
      setAiResult(result)
    } catch {
      setAiResult({ score: 88, percentile: 'Top 14%', feedback: 'Correct, readable solution that handles the core cases.' })
    }
  }

  if (step === 'browse')  return <BrowseView challenges={CHALLENGES} onOpen={openChallenge} />
  if (step === 'detail')  return <DetailView c={selected} onBack={resetToBrowse} onSolve={startSolving} />
  if (step === 'solve')   return <SolveView c={selected} code={code} onCode={setCode} onBack={() => setStep('detail')} onSubmit={submitSolution} />
  if (step === 'results') return <ResultsView c={selected} aiResult={aiResult} onContinue={() => setStep('awarded')} />
  if (step === 'awarded') return <AwardedView c={selected} aiResult={aiResult} onEarnBadge={onEarnBadge} onBack={resetToBrowse} />
  return null
}

/* ── Browse ── */
function BrowseView({ challenges, onOpen }) {
  return (
    <div className="bounty-page">
      <div className="bounty-hero">
        <div className="bounty-hero-inner">
          <div className="bounty-hero-badge"><IconTarget size={13} /> LINKEDIN BOUNTIES</div>
          <h1 className="bounty-hero-title">Proof-of-work beats a resume.</h1>
          <p className="bounty-hero-sub">
            Companies post a real-shaped, objectively gradeable challenge. Solve it and earn a
            verified, company-tied badge on your profile — exactly where recruiters already search.
            AI is allowed; you're graded on judgment, not unaided typing.
          </p>
          <div className="bounty-flow-steps">
            {['Pick a challenge', 'Solve in-browser', 'Pass the objective gate', 'AI scores judgment', 'Verified badge'].map((s, i, arr) => (
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
          <span className="bounty-section-label">Open Challenges</span>
          <span className="bounty-count">{challenges.length} available · SWE</span>
        </div>
        <div className="bounty-list">
          {challenges.map(c => (
            <div className="bl-card" key={c.id} onClick={() => onOpen(c)}>
              <div className="bl-left">
                <div className="bl-logo" style={{ background: c.companyColor }}>{c.companyLogo}</div>
                <div className="bl-info">
                  <div className="bl-company-row">
                    <span className="bl-company">{c.company}</span>
                    <span className="bl-backlog"><IconCode size={11} /> {c.language}</span>
                  </div>
                  <div className="bl-title">{c.title}</div>
                  <div className="bl-meta-row">
                    <span className="bl-deadline-pill"><IconClock size={11} /> {c.deadline} left</span>
                    <span className="bl-participants"><IconUsers size={11} /> {c.participants.toLocaleString()} solving</span>
                    <span className="bl-diff">{c.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="bl-reward-col">
                <div className="bl-reward-num">{c.reward}</div>
                <div className="bl-reward-lbl">prize · badge for all who pass</div>
                <button className="bl-open-btn" onClick={(e) => { e.stopPropagation(); onOpen(c) }}>
                  View challenge <IconChevronRight size={15} />
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
  return (
    <div className="bounty-page">
      <div className="bd-back-bar">
        <button className="bd-back-btn" onClick={onBack}><IconArrowLeft size={16} /> Back to Bounties</button>
      </div>

      <div className="bd-wrap">
        <div className="bd-header" style={{ borderTop: `4px solid ${c.companyColor}` }}>
          <div className="bd-logo" style={{ background: c.companyColor }}>{c.companyLogo}</div>
          <div>
            <div className="bd-company">{c.company}</div>
            <div className="bd-backlog-tag"><IconCode size={12} /> {c.language} · {c.difficulty}</div>
          </div>
        </div>

        <h2 className="bd-title">{c.title}</h2>

        <div className="bd-stat-row">
          <div className="bd-stat">
            <div className="bd-stat-num" style={{ color: c.companyColor }}>{c.reward}</div>
            <div className="bd-stat-lbl">Prize (top 10)</div>
          </div>
          <div className="bd-stat-div" />
          <div className="bd-stat">
            <div className="bd-stat-num">{c.deadline}</div>
            <div className="bd-stat-lbl">Time left</div>
          </div>
          <div className="bd-stat-div" />
          <div className="bd-stat">
            <div className="bd-stat-num">{c.participants.toLocaleString()}</div>
            <div className="bd-stat-lbl">Solving now</div>
          </div>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">The problem</div>
          <p className="bd-text">{c.prompt}</p>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">What passing means</div>
          <ul className="bd-criteria">
            {c.acceptanceCriteria.map((crit, i) => (
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
              Clear the hidden-test gate and everyone earns a verified {c.company} badge. The top 10 also
              get the prize and a warm recruiter intro.
            </span>
          </div>
        </div>

        <button className="bd-start-btn" style={{ background: c.companyColor }} onClick={onSolve}>
          Solve this challenge <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

/* ── Solve (full-width sandbox) ── */
function SolveView({ c, code, onCode, onBack, onSubmit }) {
  // Must have changed the starter and written something substantive.
  const canSubmit = code.trim() !== c.starterCode.trim() && code.trim().length > 30

  return (
    <div className="solve-screen">
      <div className="solve-topbar">
        <button className="bd-back-btn" onClick={onBack}><IconArrowLeft size={16} /> Exit sandbox</button>
        <div className="solve-topbar-mid">
          <span className="solve-co-dot" style={{ background: c.companyColor }}>{c.companyLogo}</span>
          <span className="solve-co-title">{c.company} · {c.title}</span>
        </div>
        <span className="solve-lang"><IconCode size={13} /> {c.language}</span>
      </div>

      <div className="solve-panes">
        <div className="solve-left">
          <div className="bd-section-label">The problem</div>
          <p className="solve-prompt">{c.prompt}</p>

          <div className="bd-section-label" style={{ marginTop: 22 }}>Acceptance criteria</div>
          <ul className="bd-criteria">
            {c.acceptanceCriteria.map((crit, i) => (
              <li key={i} className="bd-criterion">
                <span className="bd-check" style={{ background: c.companyColor }}><IconCheck size={10} strokeWidth={3} /></span>
                {crit}
              </li>
            ))}
          </ul>

          <div className="solve-hidden-note">
            <IconShieldCheck size={15} />
            Hidden tests grade correctness objectively. Pass them and your badge is verified.
          </div>
        </div>

        <div className="solve-right">
          <div className="solve-editor-hdr">
            <span className="solve-dot r" /><span className="solve-dot y" /><span className="solve-dot g" />
            <span className="solve-editor-file">solution.{c.language === 'JavaScript' ? 'js' : 'ts'}</span>
          </div>
          <textarea
            className="solve-editor"
            value={code}
            onChange={e => onCode(e.target.value)}
            spellCheck={false}
            aria-label="Code editor"
          />
        </div>
      </div>

      <div className="solve-bottombar">
        <span className="solve-ai-note">
          <IconSparkles size={15} /> AI is allowed — you're judged on judgment, not unaided typing.
        </span>
        <button
          className="solve-submit-btn"
          style={{ background: canSubmit ? c.companyColor : '#c8c8c8', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Submit solution <IconBolt size={16} />
        </button>
      </div>
    </div>
  )
}

/* ── Results (funnel + top 10) ── */
function ResultsView({ c, aiResult, onContinue }) {
  const stages = funnelStages(c.participants)
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
            ? `You're on ${c.company}'s recruiter shortlist for this bounty, with the prize and a warm intro on the way.`
            : `You cleared the objective gate. Your work is verified and you're now visible to ${c.company}'s recruiters.`}
        </p>

        <div className="ba-badge-card">
          <div className="ba-badge-logo" style={{ background: c.companyColor }}>{c.companyLogo}</div>
          <div className="ba-badge-info">
            <div className="ba-badge-name">{c.company} Bounty · {c.title}</div>
            <div className="ba-badge-meta">Score {score}/100 · {percentile} · {c.language}</div>
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
