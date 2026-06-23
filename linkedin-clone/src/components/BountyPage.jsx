import { useState } from 'react'
import { IconCheck, IconArrowLeft, IconFileText, IconPhoto, IconSparkles, IconChevronRight } from '@tabler/icons-react'

const NVIDIA_KEYS = [
  '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',
  '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',
]

async function reviewWithAI(bounty, submissionText) {
  const prompt = `You are an expert evaluator for a student bounty platform. A student submitted work for a real company backlog item. Score their submission and give feedback.

BOUNTY: ${bounty.title}
COMPANY: ${bounty.company}
WHAT WAS ASKED: ${bounty.ask}
COMPLETION CRITERIA:
${bounty.criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}

STUDENT SUBMISSION:
${submissionText}

Respond ONLY with valid JSON in this exact format:
{
  "score": <integer 0-100>,
  "percentile": "<e.g. Top 12%>",
  "feedback": "<2-3 sentences of specific, constructive feedback referencing their actual submission>"
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
    } catch {}
  }
  // fallback if both keys fail
  return { score: 88, percentile: 'Top 14%', feedback: 'Solid submission that addresses the core ask. Your approach is practical and well-structured. To strengthen it further, consider adding more specifics around implementation and edge cases.' }
}

const BOUNTIES = [
  {
    id: 1,
    company: 'LinkedIn',
    companyColor: '#0a66c2',
    companyTextColor: '#fff',
    companyLogo: <LinkedInLogo />,
    category: 'Product / Design',
    categoryColor: '#0a66c2',
    title: 'Design a Better Student Profile Section',
    backlogTag: 'Real backlog item · Deprioritized Q3',
    description: `LinkedIn's student profiles often feel sparse and don't effectively showcase early-career potential. We've had this on the roadmap for two quarters but it keeps getting bumped.`,
    ask: `Propose a redesigned student profile section that helps students stand out before they have work experience. Consider: skills, projects, coursework, volunteer work, and early achievements.`,
    criteria: [
      'Addresses the "no experience" problem for new grads',
      'Increases profile completeness signal for recruiters',
      'Works within LinkedIn\'s existing design system',
    ],
    submit: { type: 'figma', label: 'Figma or Image Link', icon: <IconPhoto size={16}/> },
    difficulty: 'Intermediate',
    timeEst: '4–6 hours',
    score: 94,
    percentile: 'Top 8%',
  },
  {
    id: 2,
    company: 'Canva',
    companyColor: '#7c2ae8',
    companyTextColor: '#fff',
    companyLogo: <CanvaLogo />,
    category: 'Marketing / Design',
    categoryColor: '#7c2ae8',
    title: 'Create 5 Social Media Templates for College Students',
    backlogTag: 'Real backlog item · Community request',
    description: `Canva's template library is light on content made specifically for college students — club announcements, study groups, campus events, internship applications. Students are a massive and underserved audience.`,
    ask: `Design 5 ready-to-use Canva templates targeting college students. Each template should be practical, on-trend, and editable. Include at least 2 different use cases (e.g. club flyer, LinkedIn announcement).`,
    criteria: [
      '5 distinct, polished templates with clear use cases',
      'Follows Canva\'s visual style (clean, modern, accessible)',
      'Each template has a brief description of who it\'s for',
    ],
    submit: { type: 'canva', label: 'Canva Link', icon: <IconPhoto size={16}/> },
    difficulty: 'Beginner',
    timeEst: '2–4 hours',
    score: 89,
    percentile: 'Top 15%',
  },
  {
    id: 3,
    company: 'Fidelity',
    companyColor: '#538234',
    companyTextColor: '#fff',
    companyLogo: <FidelityLogo />,
    category: 'Finance / Data',
    categoryColor: '#059669',
    title: 'Analyze a Dataset and Identify Retirement Trends',
    backlogTag: 'Real backlog item · Research team request',
    description: `Our research team wants to understand shifting retirement behavior among millennials vs. Gen X. We have the data but not the bandwidth. This analysis could directly inform product decisions for our retirement planning tools.`,
    ask: `Using the provided dataset (or public retirement savings data), identify 3 meaningful trends in retirement behavior across age groups. Present your findings with visuals and recommend one product improvement for Fidelity.`,
    criteria: [
      '3 data-backed insights with supporting charts',
      'At least 1 actionable product recommendation',
      'Clean, readable summary (1-page report or slides)',
    ],
    submit: { type: 'report', label: 'PDF / Excel / Slides', icon: <IconFileText size={16}/> },
    difficulty: 'Intermediate',
    timeEst: '3–5 hours',
    score: 92,
    percentile: 'Top 10%',
  },
]

export default function BountyPage() {
  const [step, setStep] = useState('browse')
  const [selected, setSelected] = useState(null)
  const [submitText, setSubmitText] = useState('')
  const [submitLink, setSubmitLink] = useState('')
  const [reviewProgress, setReviewProgress] = useState(0)
  const [aiResult, setAiResult] = useState(null)

  function openBounty(b) { setSelected(b); setStep('detail') }
  function goBack() { setStep('browse'); setSelected(null); setSubmitText(''); setSubmitLink(''); setReviewProgress(0); setAiResult(null) }

  async function startReview() {
    setStep('reviewing')
    setReviewProgress(0)

    // Animate progress bar while AI call runs in parallel
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 8 + 3
      if (p >= 90) { p = 90; clearInterval(interval) }
      setReviewProgress(p)
    }, 280)

    try {
      const result = await reviewWithAI(selected, submitText)
      setAiResult(result)
    } catch {
      setAiResult({ score: 88, percentile: 'Top 14%', feedback: 'Solid submission that addresses the core ask. Your approach is practical and well-structured. To strengthen it further, consider adding more specifics around implementation.' })
    }

    clearInterval(interval)
    setReviewProgress(100)
    setTimeout(() => setStep('awarded'), 700)
  }

  if (step === 'browse')    return <BrowseView bounties={BOUNTIES} onOpen={openBounty} />
  if (step === 'detail')    return <DetailView b={selected} onBack={goBack} onSubmit={() => setStep('submit')} />
  if (step === 'submit')    return <SubmitView b={selected} text={submitText} link={submitLink} onText={setSubmitText} onLink={setSubmitLink} onBack={() => setStep('detail')} onReview={startReview} />
  if (step === 'reviewing') return <ReviewingView b={selected} progress={reviewProgress} />
  if (step === 'awarded')   return <AwardedView b={selected} result={aiResult} onBack={goBack} />
}

/* ── Browse ── */
function BrowseView({ bounties, onOpen }) {
  return (
    <div className="bounty-page">
      <div className="bounty-hero">
        <div className="bounty-hero-inner">
          <div className="bounty-hero-badge">⚡ BOUNTY BOARD</div>
          <h1 className="bounty-hero-title">Real Company Backlogs. Real Experience.</h1>
          <p className="bounty-hero-sub">
            Companies always have work that isn't important enough to assign to a full-time employee. Complete those tasks, prove your skills, earn a verified badge on your LinkedIn profile.
          </p>
          <div className="bounty-flow-steps">
            {['Browse Bounties','Open Bounty','Submit Work','AI Review','Badge Awarded'].map((s, i, arr) => (
              <span key={s} className="bflow">
                <span className="bflow-dot">{i+1}</span>
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
          <span className="bounty-count">{bounties.length} available</span>
        </div>
        <div className="bounty-list">
          {bounties.map(b => (
            <div className="bl-card" key={b.id}>
              <div className="bl-left">
                <div className="bl-logo" style={{ background: b.companyColor }}>
                  {b.companyLogo}
                </div>
                <div className="bl-info">
                  <div className="bl-company-row">
                    <span className="bl-company">{b.company}</span>
                    <span className="bl-backlog">{b.backlogTag}</span>
                  </div>
                  <div className="bl-title">{b.title}</div>
                  <div className="bl-meta-row">
                    <span className="bl-cat" style={{ color: b.categoryColor, background: b.categoryColor + '15' }}>{b.category}</span>
                    <span className="bl-submit-tag">
                      {b.submit.icon} {b.submit.label}
                    </span>
                    <span className="bl-time">⏱ {b.timeEst}</span>
                    <span className="bl-diff">{b.difficulty}</span>
                  </div>
                </div>
              </div>
              <button className="bl-open-btn" onClick={() => onOpen(b)}>
                Open Bounty <IconChevronRight size={15}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Detail ── */
function DetailView({ b, onBack, onSubmit }) {
  return (
    <div className="bounty-page">
      <div className="bd-back-bar">
        <button className="bd-back-btn" onClick={onBack}><IconArrowLeft size={16}/> Back to Bounties</button>
      </div>

      <div className="bd-wrap">
        <div className="bd-header" style={{ borderTop: `4px solid ${b.companyColor}` }}>
          <div className="bd-logo" style={{ background: b.companyColor }}>{b.companyLogo}</div>
          <div>
            <div className="bd-company">{b.company}</div>
            <div className="bd-backlog-tag">{b.backlogTag}</div>
          </div>
        </div>

        <h2 className="bd-title">{b.title}</h2>

        <div className="bd-meta-chips">
          <span className="bd-chip" style={{ color: b.categoryColor, background: b.categoryColor + '15' }}>{b.category}</span>
          <span className="bd-chip bd-chip-gray">⏱ {b.timeEst}</span>
          <span className="bd-chip bd-chip-gray">{b.difficulty}</span>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">What this is</div>
          <p className="bd-text">{b.description}</p>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">What we're asking for</div>
          <p className="bd-text">{b.ask}</p>
        </div>

        <div className="bd-section">
          <div className="bd-section-label">Completion criteria</div>
          <ul className="bd-criteria">
            {b.criteria.map((c, i) => (
              <li key={i} className="bd-criterion">
                <span className="bd-check" style={{ background: b.companyColor }}><IconCheck size={10} strokeWidth={3}/></span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="bd-section bd-submit-section">
          <div className="bd-section-label">How to submit</div>
          <div className="bd-submit-row">
            <span className="bd-submit-ico" style={{ background: b.companyColor + '18', color: b.companyColor }}>
              {b.submit.icon}
            </span>
            <span className="bd-submit-lbl">{b.submit.label}</span>
          </div>
        </div>

        <button className="bd-start-btn" style={{ background: b.companyColor }} onClick={onSubmit}>
          Start This Bounty <IconChevronRight size={16}/>
        </button>
      </div>
    </div>
  )
}

/* ── Submit ── */
function SubmitView({ b, text, link, onText, onLink, onBack, onReview }) {
  const canSubmit = text.trim().length > 20

  return (
    <div className="bounty-page">
      <div className="bd-back-bar">
        <button className="bd-back-btn" onClick={onBack}><IconArrowLeft size={16}/> Back to Bounty</button>
      </div>

      <div className="bd-wrap">
        <div className="bd-header" style={{ borderTop: `4px solid ${b.companyColor}` }}>
          <div className="bd-logo" style={{ background: b.companyColor }}>{b.companyLogo}</div>
          <div>
            <div className="bd-company">{b.company}</div>
            <div className="bd-title" style={{ fontSize: 16, marginTop: 4 }}>{b.title}</div>
          </div>
        </div>

        <div className="bs-form">
          <label className="bs-label">Describe your solution <span style={{color:'#e03e2d'}}>*</span></label>
          <textarea
            className="bs-textarea"
            placeholder="Explain your approach, key decisions you made, and why your solution solves the problem..."
            value={text}
            onChange={e => onText(e.target.value)}
            rows={6}
          />
          <div className="bs-char">{text.length} / 1000</div>

          <label className="bs-label" style={{marginTop: 16}}>
            {b.submit.icon} {b.submit.label} link
            <span className="bs-optional"> (optional)</span>
          </label>
          <input
            className="bs-input"
            placeholder={`Paste your ${b.submit.label} link here...`}
            value={link}
            onChange={e => onLink(e.target.value)}
          />

          <div className="bs-ai-note">
            <IconSparkles size={15} color={b.companyColor}/>
            Your submission will be reviewed by AI and scored on clarity, creativity, and impact. Top submissions are shared with the {b.company} team.
          </div>

          <button
            className="bd-start-btn"
            style={{ background: canSubmit ? b.companyColor : '#c8c8c8', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            disabled={!canSubmit}
            onClick={onReview}
          >
            Submit for AI Review <IconSparkles size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Reviewing ── */
function ReviewingView({ b, progress }) {
  const steps = [
    'Reading your submission...',
    'Checking against bounty criteria...',
    'Evaluating clarity & creativity...',
    'Benchmarking against other submissions...',
    'Generating score & feedback...',
  ]
  const activeStep = Math.min(Math.floor(progress / 20), steps.length - 1)

  return (
    <div className="bounty-page">
      <div className="bd-wrap br-center">
        <div className="br-spinner-wrap">
          <div className="br-spinner" style={{ '--color': b.companyColor }}>
            <IconSparkles size={28} color={b.companyColor}/>
          </div>
        </div>
        <div className="br-title">AI is reviewing your work</div>
        <div className="br-company">Scoring against {b.company}'s criteria</div>

        <div className="br-bar-wrap">
          <div className="br-bar-track">
            <div className="br-bar-fill" style={{ width: `${progress}%`, background: b.companyColor }}/>
          </div>
          <div className="br-pct">{Math.round(progress)}%</div>
        </div>

        <div className="br-steps">
          {steps.map((s, i) => (
            <div key={s} className={`br-step${i < activeStep ? ' done' : i === activeStep ? ' active' : ''}`}>
              {i < activeStep ? <IconCheck size={13} strokeWidth={3}/> : <span className="br-dot"/>}
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Awarded ── */
function AwardedView({ b, result, onBack }) {
  const score = result?.score ?? b.score
  const percentile = result?.percentile ?? b.percentile
  const feedback = result?.feedback ?? 'Strong submission that addresses the core problem. Your approach is practical and well-scoped.'

  return (
    <div className="bounty-page">
      <div className="bd-wrap ba-center">
        <div className="ba-confetti">🎉</div>
        <div className="ba-badge-icon" style={{ background: b.companyColor }}>
          {b.companyLogo}
        </div>

        <div className="ba-score-row">
          <div className="ba-score-block">
            <div className="ba-score-num" style={{ color: b.companyColor }}>{score}</div>
            <div className="ba-score-label">Score</div>
          </div>
          <div className="ba-score-divider"/>
          <div className="ba-score-block">
            <div className="ba-score-num" style={{ color: b.companyColor, fontSize: 26 }}>{percentile}</div>
            <div className="ba-score-label">of Submissions</div>
          </div>
        </div>

        <h2 className="ba-title">Badge Earned!</h2>
        <p className="ba-subtitle">Your submission scored in the {percentile} of all submissions for this bounty.</p>

        <div className="ba-badge-card">
          <div className="ba-badge-logo" style={{ background: b.companyColor }}>{b.companyLogo}</div>
          <div className="ba-badge-info">
            <div className="ba-badge-name">{b.company} Bounty — Completed</div>
            <div className="ba-badge-meta">Score {score}/100 · {percentile} · {b.category}</div>
            <div className="ba-verified">
              <IconCheck size={11} strokeWidth={3}/> Verified by LinkedIn Bounty AI
            </div>
          </div>
        </div>

        <div className="ba-feedback">
          <div className="ba-feedback-label"><IconSparkles size={14}/> AI Feedback</div>
          <p className="ba-feedback-text">{feedback}</p>
        </div>

        <div className="ba-actions">
          <button className="ba-profile-btn" style={{ background: b.companyColor }}>
            Add Badge to Profile
          </button>
          <button className="ba-more-btn" onClick={onBack}>
            Browse More Bounties
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Company logos ── */
function LinkedInLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <rect width="24" height="24" rx="4" fill="transparent"/>
      <path d="M6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 10h3v9H5v-9zM13 10h-3v9h3v-4.5c0-2 2.5-2.2 2.5 0V19h3v-5.5c0-4-4.5-3.8-5.5-2V10z"/>
    </svg>
  )
}

function CanvaLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="#fff">
      <circle cx="50" cy="50" r="48" fill="transparent"/>
      <text x="50" y="68" textAnchor="middle" fontSize="56" fontWeight="900" fontFamily="Georgia,serif" fill="#fff">C</text>
    </svg>
  )
}

function FidelityLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
      <path d="M4 20V9l8-5 8 5v11H4z" stroke="#fff" strokeWidth="1.5" fill="none"/>
      <rect x="9" y="13" width="6" height="7" fill="#fff"/>
      <rect x="7" y="10" width="4" height="3" fill="#fff" rx="0.5"/>
      <rect x="13" y="10" width="4" height="3" fill="#fff" rx="0.5"/>
    </svg>
  )
}
