// Full AI review pipeline: Rubric → Safety → Dual-agent grade → Reconcile → Score
// Artificial results work with zero API key. Real Groq calls activate when VITE_GROQ_KEY present.

const key = () =>
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_GROQ_KEY
    : (typeof process !== 'undefined' && process.env?.VITE_GROQ_KEY)

async function groq(prompt, temperature = 0.4) {
  const k = key()
  if (!k) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${k}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Output ONLY a single valid JSON object. No markdown, no extra text.' },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: 400,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = (data.choices?.[0]?.message?.content || '').trim()
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch {
    return null
  }
}

// ── Stage 0: Rubric ──────────────────────────────────────────────────────────
const CODING_RUBRIC = [
  { criterion: 'Root cause correctly identified and resolved', weight: 0.4 },
  { criterion: 'Solution handles all edge cases', weight: 0.3 },
  { criterion: 'Code clarity and reasoning quality', weight: 0.2 },
  { criterion: 'No regression or unnecessary complexity', weight: 0.1 },
]
const PROJECT_RUBRIC = [
  { criterion: 'Brief fully addressed', weight: 0.35 },
  { criterion: 'Evidence of original thinking', weight: 0.3 },
  { criterion: 'Clarity and structure', weight: 0.2 },
  { criterion: 'Actionable, specific recommendations', weight: 0.15 },
]

async function generateRubric(bounty, isCoding) {
  const live = await groq(
    `Generate 4 grading criteria for this bounty: "${(bounty.title || bounty.description || '').slice(0, 200)}".
Return JSON: {"rubric":[{"criterion":"...","weight":0.X},...]}  (weights must sum to 1.0)`, 0.3
  )
  if (live?.rubric?.length === 4) return live.rubric
  return isCoding ? CODING_RUBRIC : PROJECT_RUBRIC
}

// ── Stage 1: Safety ──────────────────────────────────────────────────────────
const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) instructions/i,
  /ignore all instructions/i,
  /you are now/i,
  /pretend (you are|to be)/i,
  /forget (everything|all)/i,
  /\[INST\]/,
  /<\|im_start\|>/,
  /act as (an? )?(unrestricted|unfiltered|evil)/i,
  /DAN mode/i,
]

export function runSafetyChecks(submission) {
  const text = typeof submission === 'string' ? submission : JSON.stringify(submission)
  const flags = []

  if (!text || text.trim().length < 20) {
    flags.push({ type: 'empty', severity: 'block', message: 'Submission too short to evaluate.' })
    return { passed: false, flags }
  }

  for (const p of INJECTION_PATTERNS)
    if (p.test(text))
      flags.push({ type: 'prompt_injection', severity: 'block', message: `Injection pattern detected: ${p}` })

  if (/(.)\1{20,}/.test(text))
    flags.push({ type: 'gibberish', severity: 'warn', message: 'Excessive character repetition.' })

  if (text.includes('// Your code here.') && text.split('\n').length < 6)
    flags.push({ type: 'unedited', severity: 'warn', message: 'Appears to be unmodified starter code.' })

  return { passed: !flags.some(f => f.severity === 'block'), flags }
}

// ── Artificial scorer ─────────────────────────────────────────────────────────
function artificialBase(submission, isCoding) {
  const text = typeof submission === 'string' ? submission : JSON.stringify(submission)
  let score = Math.min(62 + Math.floor(text.length / 100), 82)

  if (isCoding) {
    if (/latestRequestId|requestId/.test(text)) score += 9
    if (/AbortController/.test(text))           score += 9
    if (/clearTimeout|debounce/.test(text))     score += 6
    if (/\+\+latestRequestId|\+\+requestId/.test(text)) score += 3
    // still has the raw unfixed call with no guard
    if (/await searchCities\(query\)/.test(text) &&
        !/requestId|AbortController/.test(text))  score -= 14
  } else {
    if (text.length > 600)  score += 5
    if (text.length > 1200) score += 4
    if (/recommend|analysis|finding/i.test(text)) score += 4
  }

  return Math.max(60, Math.min(99, score))
}

// ── Stage 2+3: Dual-agent grading ────────────────────────────────────────────
async function gradeWithAgent(label, submission, isCoding, rubric, bounty, reference) {
  const rubricText = rubric.map(r => `- ${r.criterion} (weight ${r.weight})`).join('\n')
  const refText = reference
    ? `\nREFERENCE SOLUTION (for coding evaluation only — not shown to candidate):\n${
        Object.entries(reference).map(([n, v]) => `--- ${n} ---\n${v}`).join('\n').slice(0, 1400)}`
    : ''

  const live = await groq(
    `You are Grader ${label}, one of two independent judges.
BOUNTY: "${(bounty.title || bounty.description || '').slice(0, 200)}"
RUBRIC:\n${rubricText}${refText}
SUBMISSION:\n${String(submission).slice(0, 2200)}
Grade strictly. Return JSON:
{"score":<int 60-99>,"feedback":"<1-2 sentences citing specifics>","confidence":<0.0-1.0>}`,
    label === 'A' ? 0.3 : 0.6
  )

  if (live?.score && live?.feedback)
    return { agent: label, source: 'live', confidence: 0.85, ...live }

  // Artificial fallback — B is slightly more generous than A
  const base = artificialBase(submission, isCoding)
  const jitter = label === 'A' ? -2 : 3
  const score = Math.max(60, Math.min(99, base + jitter))

  const templates = {
    coding: {
      high: `Agent ${label}: Correctly resolves the root cause with a solid guard pattern. Implementation is clean and the approach is well-reasoned.`,
      mid:  `Agent ${label}: Partially addresses the race condition but edge cases may remain. Guard logic needs refinement.`,
      low:  `Agent ${label}: The core race condition does not appear resolved — stale responses can still overwrite current results.`,
    },
    project: {
      high: `Agent ${label}: Well-structured with clear analysis and specific, actionable recommendations tied to the brief.`,
      mid:  `Agent ${label}: Covers the brief adequately but recommendations could be more concrete and evidence-based.`,
      low:  `Agent ${label}: Lacks sufficient depth. More specific analysis and actionable recommendations required.`,
    },
  }
  const tier = score >= 88 ? 'high' : score >= 75 ? 'mid' : 'low'
  const domain = isCoding ? 'coding' : 'project'

  return {
    agent: label,
    source: 'artificial',
    score,
    feedback: templates[domain][tier],
    confidence: 0.78 + (score % 10) / 100,
  }
}

// ── Stage 4: Reconciliation ───────────────────────────────────────────────────
function reconcile(gradeA, gradeB) {
  const delta = Math.abs(gradeA.score - gradeB.score)

  let finalScore, method, note
  if (delta <= 10) {
    finalScore = Math.round((gradeA.score + gradeB.score) / 2)
    method = 'consensus'
    note = null
  } else if (delta <= 20) {
    const ca = gradeA.confidence || 0.8
    const cb = gradeB.confidence || 0.8
    finalScore = Math.round((gradeA.score * ca + gradeB.score * cb) / (ca + cb))
    method = 'weighted'
    note = `Agents diverged by ${delta} pts — weighted by confidence.`
  } else {
    finalScore = Math.round((gradeA.score + gradeB.score) / 2)
    method = 'escalated'
    note = `Large disagreement (${delta} pts). Averaged; manual review recommended.`
  }

  finalScore = Math.max(60, Math.min(99, finalScore))

  const feedback = gradeA.source === 'live' || gradeB.source === 'live'
    ? [gradeA.feedback, gradeB.feedback].filter(Boolean).join(' ')
    : gradeA.feedback

  const percentile =
    finalScore >= 95 ? 'Top 5%'  :
    finalScore >= 90 ? 'Top 10%' :
    finalScore >= 85 ? 'Top 15%' :
    finalScore >= 80 ? 'Top 20%' :
    finalScore >= 75 ? 'Top 30%' :
    finalScore >= 70 ? 'Top 40%' : 'Top 50%'

  return { score: finalScore, percentile, feedback, agents: { A: gradeA, B: gradeB }, delta, method, note }
}

// ── Main entry point ─────────────────────────────────────────────────────────
export async function runReviewPipeline(bounty, submission, isCoding, reference = null) {
  const t0 = performance.now()

  const rubric = await generateRubric(bounty, isCoding)
  const safety = runSafetyChecks(submission)

  if (!safety.passed) {
    return {
      score: 60,
      percentile: 'Below average',
      feedback: safety.flags.find(f => f.severity === 'block')?.message || 'Submission blocked by safety checks.',
      safety, rubric, blocked: true, method: 'blocked', durationMs: 0,
    }
  }

  const [gradeA, gradeB] = await Promise.all([
    gradeWithAgent('A', submission, isCoding, rubric, bounty, reference),
    gradeWithAgent('B', submission, isCoding, rubric, bounty, reference),
  ])

  const result = reconcile(gradeA, gradeB)

  return {
    ...result,
    safety,
    rubric,
    blocked: false,
    durationMs: Math.round(performance.now() - t0),
  }
}
