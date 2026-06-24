import { useState, useEffect, useRef } from 'react'
import './RecruiterView.css'
import { supabase } from '../lib/supabase'

/* Emily is a recruiter at LinkedIn. She can open her own company's bounties,
   but not other companies' (their candidate data is private to them). */
const RECRUITER_COMPANY = 'LinkedIn'

const COMPANY_COLORS = {
  LinkedIn: '#0a66c2', Google: '#4285f4', 'AI Dynamics': '#7c2ae8',
  Innovatech: '#059669', FutureWorks: '#e8590c',
  'Global Solutions LLC': '#538234', 'Tech Innovators Inc.': '#e03e2d', Canva: '#7c2ae8', Fidelity: '#538234',
}
const colorFor = (c) => COMPANY_COLORS[c] || '#0a66c2'

const CANDIDATES = [
  { id:1, name:'Alex Chen', school:'UC Berkeley · CS Junior', avatar:'AC', avatarBg:'#0a66c2', score:94, percentile:'Top 8%',
    badges:[{ company:'LinkedIn', color:'#0a66c2', task:'Redesigned student profile section' },{ company:'Fidelity', color:'#538234', task:'Retirement trends analysis' }] },
  { id:2, name:'Priya Sharma', school:'UT Austin · CS Senior', avatar:'PS', avatarBg:'#7c2ae8', score:91, percentile:'Top 11%',
    badges:[{ company:'Canva', color:'#7c2ae8', task:'Student social media templates' },{ company:'Google', color:'#4285f4', task:'URL shortener with analytics' }] },
  { id:3, name:'Marcus Johnson', school:'Georgia Tech · CS Senior', avatar:'MJ', avatarBg:'#059669', score:88, percentile:'Top 15%',
    badges:[{ company:'LinkedIn', color:'#0a66c2', task:'Student profile redesign' }] },
  { id:4, name:'Sofia Rodriguez', school:'Stanford · CS Sophomore', avatar:'SR', avatarBg:'#f97316', score:85, percentile:'Top 20%',
    badges:[{ company:'Canva', color:'#7c2ae8', task:'Gen-Z campaign strategy' }] },
  { id:5, name:'David Kim', school:'CMU · CS Junior', avatar:'DK', avatarBg:'#e03e2d', score:82, percentile:'Top 24%',
    badges:[{ company:'Fidelity', color:'#538234', task:'DCF valuation model' }] },
]

/* Fallback bounties in the LIVE table shape (id/company/description/...), so the
   demo still works if the network is down. The live DB has no `title`/`status`
   columns — those are derived in the UI. */
const FALLBACK_BOUNTIES = [
  { id:'demo_google', company:'Google', description:'Your task: build a local-first semantic search prototype over a corpus of 500 product-doc snippets using a sentence-transformer model and cosine similarity. Wrap it in a minimal FastAPI + HTML/JS UI.', potential_job_position:'Software Engineer', awardees:[{id:'user_3490'},{id:'user_9883'}] },
  { id:'demo_aidyn', company:'AI Dynamics', description:'Your task: write a Python script that cross-references job-description keyword frequencies against a course-metadata JSON and outputs a ranked list of topic gaps as a clean CSV.', potential_job_position:'Marketing Specialist', awardees:[{id:'user_4579'}] },
  { id:'demo_innov', company:'Innovatech', description:'Your task: build a Python tool that auto-generates 10 multiple-choice questions from a chapter excerpt using an NLP technique for distractors, exported as structured JSON.', potential_job_position:'HR Coordinator', awardees:[{id:'user_9435'}] },
]

/* The completed LinkedIn bounty Emily already ran — always present in her
   dashboard (the live DB has no LinkedIn rows of its own). Same live-table
   shape as everything else; deduped by id if it ever lands in the DB too. */
const SEED_LINKEDIN_BOUNTY = {
  id: 'bounty_li_completed_pilot',
  company: RECRUITER_COMPANY,
  description: 'LinkedIn ran this internal bounty as a completed pilot. Your task: redesign the student profile page to better showcase verified bounty badges to recruiters.',
  awardees: [{ id: 'user_8821' }, { id: 'user_4410' }, { id: 'user_7793' }],
  potential_job_position: 'Product Designer',
  potential_job_ids: [],
  relevant_course_name: 'UX/UI Design',
  relevant_course_id: 'course_6335',
}

/* Merge the seeded LinkedIn bounty into a live result set (dedupe by id),
   keeping LinkedIn's completed pilot pinned to the top. */
function withLinkedInSeed(rows) {
  const list = Array.isArray(rows) ? rows : []
  return list.some(b => b.id === SEED_LINKEDIN_BOUNTY.id)
    ? list
    : [SEED_LINKEDIN_BOUNTY, ...list]
}

const RANK_MEDALS = ['🥇','🥈','🥉']
const RANK_COLORS = ['#f59e0b','#94a3b8','#b45309','#6b7280','#6b7280']
const MEDAL_COUNT = 3   // gold / silver / bronze available per bounty

/* derive a short, human title from a live bounty's long description */
function deriveTitle(b) {
  const d = b.description || ''
  const marker = d.indexOf('Your task:')
  if (marker >= 0) {
    let t = d.slice(marker + 'Your task:'.length).trim()
    const end = t.search(/[.;]/)
    if (end > 0) t = t.slice(0, end)
    t = t.charAt(0).toUpperCase() + t.slice(1)
    return t.length > 84 ? t.slice(0, 81) + '…' : t
  }
  const first = d.split('.')[0]
  if (first && first.length < 90) return first
  return `${b.company} · ${b.potential_job_position || 'Bounty'}`
}

/* map a raw live-DB bounty row to the shape the UI renders */
function mapBounty(b) {
  return {
    id: b.id,
    company: b.company,
    companyColor: colorFor(b.company),
    title: deriveTitle(b),
    category: b.potential_job_position || 'General',
    desc: b.description,
    submissions: Array.isArray(b.awardees) ? Math.max(b.awardees.length * 9 + 12, 12) : 12,
    awardees: Array.isArray(b.awardees) ? b.awardees : [],
    isMine: b.company === RECRUITER_COMPANY,
  }
}

const emailFor = (name) =>
  name.toLowerCase().replace(/[^a-z ]/g, '').trim().split(/\s+/).join('.') + '@gmail.com'

export default function RecruiterView() {
  const [screen, setScreen] = useState('home') // home | leaderboard | bounties | post | profile | bountyboard
  const [selected, setSelected] = useState(null)         // candidate (profile)
  const [selectedBounty, setSelectedBounty] = useState(null)

  // ── global LinkedIn-style messaging dock ──
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgRecipient, setMsgRecipient] = useState(null)
  const [threads, setThreads] = useState({}) // name -> [{ from:'me'|'them', text }]

  const openMessage = (candidate) => {
    setMsgRecipient(candidate)
    setMsgOpen(true)
    setThreads(prev => prev[candidate.name] ? prev : {
      ...prev,
      [candidate.name]: [{ from: 'them', text: `Hi! Thanks for checking out my bounty work. Happy to chat about opportunities at ${RECRUITER_COMPANY}.` }],
    })
  }
  const sendMessage = (name, text) => {
    setThreads(prev => ({ ...prev, [name]: [...(prev[name] || []), { from: 'me', text }] }))
  }

  const goHome = () => setScreen('home')
  const openProfile = (candidate) => { setSelected(candidate); setScreen('profile') }
  const openBountyBoard = (bounty) => { setSelectedBounty(bounty); setScreen('bountyboard') }

  return (
    <div className="rv-page">
      <RvNav />

      {screen === 'home'        && <HomeView onNav={setScreen} />}
      {screen === 'leaderboard' && <LeaderboardView onHome={goHome} onProfile={openProfile} />}
      {screen === 'bounties'    && <BountiesView onHome={goHome} onOpenBounty={openBountyBoard} />}
      {screen === 'post'        && <PostBountyView onHome={goHome} onDone={() => setScreen('bounties')} />}
      {screen === 'profile' && selected && (
        <ProfileView candidate={selected} onBack={() => setScreen('leaderboard')} onMessage={openMessage} />
      )}
      {screen === 'bountyboard' && selectedBounty && (
        <BountyBoardView bounty={selectedBounty} onBack={() => setScreen('bounties')} onMessage={openMessage} />
      )}

      <MessagingDock
        open={msgOpen}
        recipient={msgRecipient}
        threads={threads}
        onToggle={() => setMsgOpen(o => !o)}
        onSend={sendMessage}
        onPickRecipient={setMsgRecipient}
      />
    </div>
  )
}

/* small inline back-to-home button, sits to the LEFT of each subpage title */
function HomeBtn({ onClick, label = '← Home' }) {
  return <button className="rv-home-inline" onClick={onClick}>{label}</button>
}

/* Company-specific stats, computed from this recruiter's own bounties. */
function computeCompanyStats(mine) {
  const bountyCount = mine.length
  const submissions = mine.reduce((sum, b) => sum + (b.submissions || 0), 0)
  const badges = mine.reduce((sum, b) => sum + (b.awardees?.length || 0), 0)
  return { bounties: bountyCount, submissions, badges, hires: 6 + badges }
}

/* ─── HOME ─── */
function HomeView({ onNav }) {
  // Start from the seeded completed LinkedIn bounty so stats are never empty.
  const [mineBounties, setMineBounties] = useState(() =>
    withLinkedInSeed([]).filter(b => b.company === RECRUITER_COMPANY).map(mapBounty)
  )
  const [topCandidates] = useState(CANDIDATES.slice(0, 3))

  useEffect(() => {
    supabase.from('bounties').select('*').limit(100)
      .then(({ data }) => {
        const merged = withLinkedInSeed(data?.length ? data : [])
        setMineBounties(merged.filter(b => b.company === RECRUITER_COMPANY).map(mapBounty))
      }).catch(() => {})
  }, [])

  const stats = computeCompanyStats(mineBounties)
  const topBounties = mineBounties.slice(0, 3)

  const statCards = [
    { label: `${RECRUITER_COMPANY} Bounties`, value: stats.bounties.toLocaleString(), icon: '📋', color: '#0a66c2' },
    { label: 'Submissions', value: stats.submissions.toLocaleString(), icon: '📥', color: '#f59e0b' },
    { label: 'Badges Awarded', value: stats.badges.toLocaleString(), icon: '⭐', color: '#059669' },
    { label: 'Interviews Booked', value: stats.hires.toLocaleString(), icon: '📅', color: '#7c2ae8' },
  ]

  return (
    <div className="rv-body">
      <div className="rv-home-hero">
        <div>
          <h1 className="rv-home-title">Welcome back, Emily</h1>
          <p className="rv-home-sub">Here's what's happening with your {RECRUITER_COMPANY} Bounties today.</p>
        </div>
        <button className="rv-home-post-btn" onClick={() => onNav('post')}>+ Post a Bounty</button>
      </div>

      <div className="rv-stats-row">
        {statCards.map((s,i)=>(
          <div key={s.label} className="rv-stat-card" style={{animationDelay:`${i*0.06}s`}}>
            <div className="rv-stat-icon" style={{background:s.color+'18'}}>{s.icon}</div>
            <div>
              <div className="rv-stat-val" style={{color:s.color}}>{s.value}</div>
              <div className="rv-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rv-home-cards rv-home-cards-2">
        <button className="rv-home-card" onClick={() => onNav('leaderboard')}>
          <div className="rv-hcard-top">
            <span className="rv-hcard-icon">🏆</span>
            <span className="rv-hcard-arrow">→</span>
          </div>
          <div className="rv-hcard-title">Candidate Leaderboard</div>
          <div className="rv-hcard-desc">Top students ranked by verified bounty score</div>
          <div className="rv-hcard-divider"/>
          {topCandidates.map((c,i)=>(
            <div key={c.id} className="rv-hcard-row">
              <span className="rv-hcard-medal">{RANK_MEDALS[i]}</span>
              <div className="rv-hcard-av" style={{background:c.avatarBg}}>{c.avatar}</div>
              <span className="rv-hcard-name">{c.name}</span>
              <span className="rv-hcard-score" style={{color:RANK_COLORS[i]}}>{c.score}</span>
            </div>
          ))}
        </button>

        <button className="rv-home-card" onClick={() => onNav('bounties')}>
          <div className="rv-hcard-top">
            <span className="rv-hcard-icon">📋</span>
            <span className="rv-hcard-arrow">→</span>
          </div>
          <div className="rv-hcard-title">Active Bounties</div>
          <div className="rv-hcard-desc">Company tasks accepting student submissions</div>
          <div className="rv-hcard-divider"/>
          {topBounties.map(b=>(
            <div key={b.id} className="rv-hcard-row">
              <div className="rv-hcard-dot" style={{background:b.companyColor}}/>
              <span className="rv-hcard-name">{b.title}</span>
              <span className="rv-hcard-badge">{b.submissions}</span>
            </div>
          ))}
        </button>
      </div>
    </div>
  )
}

/* ─── CANDIDATE LEADERBOARD ─── */
function LeaderboardView({ onHome, onProfile }) {
  const [candidates, setCandidates] = useState(null)
  const [visibleCards, setVisibleCards] = useState(new Set())
  const [sorted, setSorted] = useState(false)

  useEffect(() => {
    supabase
      .from('candidates')
      .select('*, candidate_badges(*)')
      .order('score', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setCandidates(data.map(c => ({
            id: c.id, name: c.name, school: c.school, avatar: c.avatar, avatarBg: c.avatar_bg,
            score: c.score, percentile: c.percentile,
            badges: (c.candidate_badges || []).map(b => ({ company: b.company, color: b.company_color, task: b.task })),
          })))
        } else {
          setCandidates(CANDIDATES)
        }
      })
      .catch(() => setCandidates(CANDIDATES))
  }, [])

  useEffect(() => {
    if (!candidates) return
    const len = candidates.length
    ;[...Array(len)].map((_,i)=>len-1-i).forEach((idx,i)=>{
      setTimeout(()=>{
        setVisibleCards(s=>new Set([...s,idx]))
        if(i===len-1) setTimeout(()=>setSorted(true),300)
      }, i*260)
    })
  }, [candidates])

  return (
    <div className="rv-body">
      <div className="rv-lb-wrap">
        <div className="rv-lb-hdr">
          <div className="rv-lb-hdr-left">
            <HomeBtn onClick={onHome} />
            <div>
              <h2 className="rv-lb-title">🏆 Candidate Leaderboard</h2>
              <p className="rv-lb-sub">Students ranked by verified LinkedIn Bounty score across all companies</p>
            </div>
          </div>
        </div>
        {!candidates && <div className="rv-loading">Loading candidates…</div>}
        <div className={`rv-list${sorted?' rv-list-sorted':''}`}>
          {(candidates||[]).map((c,idx)=>{
            const visible = visibleCards.has(idx)
            return (
              <div key={c.id}
                className={`rv-row${visible?' rv-row-visible':''}${sorted&&idx===0?' rv-row-gold':''}`}
                onClick={()=>onProfile({...c, rank: idx+1})}
              >
                <div className="rv-rank">
                  {idx<3?<span className="rv-medal-emoji">{['🥇','🥈','🥉'][idx]}</span>:<span className="rv-rank-num">#{idx+1}</span>}
                </div>
                <div className="rv-av" style={{background:c.avatarBg}}>{c.avatar}</div>
                <div className="rv-info">
                  <div className="rv-name">{c.name}</div>
                  <div className="rv-school">{c.school}</div>
                  <div className="rv-badges">
                    {c.badges.map(b=>(
                      <span key={b.company} className="rv-badge" style={{color:b.color,background:b.color+'18',borderColor:b.color+'50'}}>{b.company}</span>
                    ))}
                  </div>
                </div>
                <div className="rv-score-col">
                  <ScoreCounter target={c.score} active={visible} color={RANK_COLORS[idx]}/>
                  <div className="rv-pct">{c.percentile}</div>
                  <div className="rv-bar-track">
                    <div className="rv-bar-fill" style={{width:visible?`${c.score}%`:'0%',background:RANK_COLORS[idx]}}/>
                  </div>
                </div>
                <span className="rv-chevron">›</span>
              </div>
            )
          })}
        </div>
        <p className="rv-hint">Click any candidate to view their full bounty profile</p>
      </div>
    </div>
  )
}

/* ─── BOUNTIES ─── */
function BountiesView({ onHome, onOpenBounty }) {
  // Seed the completed LinkedIn bounty so it's there before/without any DB call.
  const [bounties, setBounties] = useState(withLinkedInSeed(FALLBACK_BOUNTIES).map(mapBounty))
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'mine'
  const [showAdd, setShowAdd] = useState(false)
  const [locked, setLocked] = useState(null) // company name we just blocked, for toast

  const load = () => {
    supabase
      .from('bounties')
      .select('*')
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data?.length) setBounties(withLinkedInSeed(data).map(mapBounty))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }
  useEffect(load, [])

  const displayed = filter === 'mine'
    ? bounties.filter(b => b.isMine)
    : bounties

  const handleOpen = (b) => {
    if (b.isMine) { onOpenBounty(b) }
    else { setLocked(b.company); setTimeout(() => setLocked(null), 2600) }
  }

  return (
    <div className="rv-body">
      <div className="rv-lb-wrap">
        <div className="rv-lb-hdr">
          <div className="rv-lb-hdr-left">
            <HomeBtn onClick={onHome} />
            <div>
              <h2 className="rv-lb-title">📋 Active Bounties</h2>
              <p className="rv-lb-sub">Company tasks open for student submissions. You can open <strong>{RECRUITER_COMPANY}</strong> bounties.</p>
            </div>
          </div>
        </div>

        <div className="rv-filter-row">
          <button className={`rv-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All Bounties</button>
          <button className={`rv-filter-btn${filter === 'mine' ? ' active' : ''}`} onClick={() => setFilter('mine')}>My Bounties ({RECRUITER_COMPANY})</button>
          <button className="rv-add-li-btn" onClick={() => setShowAdd(true)}>+ Add LinkedIn Bounty</button>
        </div>

        {locked && <div className="rv-lock-toast">🔒 {locked} bounties are private to {locked} recruiters. You can only open {RECRUITER_COMPANY} bounties.</div>}

        {loading ? (
          <div className="rv-loading">Loading bounties…</div>
        ) : displayed.length === 0 ? (
          <div className="rv-loading">
            No {filter === 'mine' ? RECRUITER_COMPANY + ' ' : ''}bounties yet.
            <button className="rv-post-inline-btn" style={{marginLeft:8}} onClick={() => setShowAdd(true)}>Add one →</button>
          </div>
        ) : (
          <div className="rv-bounty-list">
            {displayed.map((b,i)=>(
              <div
                key={b.id}
                className={`rv-bounty-card${b.isMine ? ' rv-bounty-open' : ' rv-bounty-locked'}`}
                style={{animationDelay:`${i*0.06}s`}}
                onClick={() => handleOpen(b)}
              >
                <div className="rv-bounty-hdr">
                  <div className="rv-bounty-co" style={{background:b.companyColor}}>{b.company[0]}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="rv-bounty-co-name" style={{color:b.companyColor}}>{b.company}</div>
                    <div className="rv-bounty-title">{b.title}</div>
                  </div>
                  <span className="rv-bounty-cat">{b.category}</span>
                </div>
                <p className="rv-bounty-desc">{b.desc}</p>
                <div className="rv-bounty-footer">
                  <span className="rv-bounty-meta">📥 {b.submissions} submissions</span>
                  {b.isMine
                    ? <span className="rv-bounty-open-cta">View leaderboard →</span>
                    : <span className="rv-bounty-lock">🔒 {b.company} only</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddLinkedInBountyModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); setFilter('mine'); setLoading(true); load() }} />}
    </div>
  )
}

/* Modal: Emily adds a completed LinkedIn bounty straight into the live DB.
   Uses the REAL live-table columns (no title/status columns exist). */
function AddLinkedInBountyModal({ onClose, onAdded }) {
  const [task, setTask] = useState('Redesign the student profile page to better showcase verified bounty badges to recruiters.')
  const [position, setPosition] = useState('Product Designer')
  const [course, setCourse] = useState('UX/UI Design')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async () => {
    setSaving(true); setErr(null)
    const row = {
      id: `bounty_li_${Date.now()}`,
      company: RECRUITER_COMPANY,
      description: `LinkedIn ran this internal bounty as a completed pilot. Your task: ${task}`,
      awardees: [{ id: 'user_8821' }, { id: 'user_4410' }, { id: 'user_7793' }],
      potential_job_position: position,
      potential_job_ids: [],
      relevant_course_name: course,
      relevant_course_id: `course_${Math.floor(1000 + (course.length * 137) % 9000)}`,
    }
    const { error } = await supabase.from('bounties').insert(row)
    setSaving(false)
    if (error) { setErr(error.message || 'Could not save — check your connection.'); return }
    onAdded()
  }

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal" onClick={e => e.stopPropagation()}>
        <div className="rv-modal-hdr">
          <h3 className="rv-modal-title">Add a completed LinkedIn bounty</h3>
          <button className="rv-modal-x" onClick={onClose}>✕</button>
        </div>
        <p className="rv-modal-sub">This writes a <strong>completed</strong> bounty to the live database under <strong>{RECRUITER_COMPANY}</strong>, with awardees already attached.</p>
        <label className="rv-label">The task</label>
        <textarea className="rv-textarea" rows={3} value={task} onChange={e => setTask(e.target.value)} />
        <div className="rv-form-row" style={{marginTop:14}}>
          <div className="rv-field" style={{marginBottom:0}}>
            <label className="rv-label">Potential role</label>
            <input className="rv-input" value={position} onChange={e => setPosition(e.target.value)} />
          </div>
          <div className="rv-field" style={{marginBottom:0}}>
            <label className="rv-label">Relevant course</label>
            <input className="rv-input" value={course} onChange={e => setCourse(e.target.value)} />
          </div>
        </div>
        {err && <div className="rv-modal-err">{err}</div>}
        <div className="rv-modal-actions">
          <button className="rp-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="rv-post-btn" style={{flex:1.4, opacity: saving ? 0.6 : 1}} disabled={saving} onClick={submit}>
            {saving ? 'Adding…' : 'Add completed bounty →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── POST BOUNTY ─── */
function PostBountyView({ onHome, onDone }) {
  const [form, setForm] = useState({company:RECRUITER_COMPANY,title:'',category:'Engineering',desc:'',submitType:'github',deadline:''})
  const [posted, setPosted] = useState(false)
  const [posting, setPosting] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const canPost = form.company && form.title && form.desc && !posting

  const handlePost = async () => {
    setPosting(true)
    try {
      // write in the LIVE table shape
      await supabase.from('bounties').insert({
        id: `bounty_${Date.now()}`,
        company: form.company,
        description: `Your task: ${form.desc}`,
        awardees: [],
        potential_job_position: form.category,
        potential_job_ids: [],
        relevant_course_name: form.title,
        relevant_course_id: `course_${Date.now() % 10000}`,
      })
    } catch (_) {}
    setPosting(false)
    setPosted(true)
  }

  if (posted) return (
    <div className="rv-body rv-center">
      <div className="rv-posted-card">
        <div className="rv-posted-icon">🎉</div>
        <h2 className="rv-posted-title">Bounty Posted!</h2>
        <p className="rv-posted-sub"><strong>{form.title}</strong> from <strong>{form.company}</strong> is now live. Students can discover and submit for AI-verified badges.</p>
        <div className="rv-posted-info">
          <span>📂 {form.category}</span>
          {form.deadline && <span>🗓 Due {form.deadline}</span>}
        </div>
        <button className="rv-post-btn" onClick={onDone}>← Back to Bounties</button>
      </div>
    </div>
  )

  return (
    <div className="rv-body">
      <div className="rv-post-wrap">
        <div className="rv-lb-hdr-left" style={{marginBottom:8}}>
          <HomeBtn onClick={onHome} />
          <h2 className="rv-lb-title">Post a Bounty</h2>
        </div>
        <p className="rv-lb-sub" style={{marginBottom:24}}>Turn your company's backlog into a student opportunity. Submissions are AI-scored and top performers earn a verified badge.</p>
        <div className="rv-form">
          <div className="rv-form-row">
            <div className="rv-field">
              <label className="rv-label">Company Name <span className="rv-req">*</span></label>
              <input className="rv-input" placeholder="e.g. Google" value={form.company} onChange={e=>set('company',e.target.value)}/>
            </div>
            <div className="rv-field">
              <label className="rv-label">Category <span className="rv-req">*</span></label>
              <select className="rv-input" value={form.category} onChange={e=>set('category',e.target.value)}>
                {['Engineering','Data / Analytics','Finance','Marketing','Sales','Design','Operations','Consulting'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="rv-field">
            <label className="rv-label">Bounty Title <span className="rv-req">*</span></label>
            <input className="rv-input" placeholder="e.g. Design a better student onboarding flow" value={form.title} onChange={e=>set('title',e.target.value)}/>
          </div>
          <div className="rv-field">
            <label className="rv-label">What are you asking for? <span className="rv-req">*</span></label>
            <textarea className="rv-textarea" rows={4} placeholder="Describe the task. What problem needs solving? What should students build or create?" value={form.desc} onChange={e=>set('desc',e.target.value)}/>
          </div>
          <div className="rv-form-row">
            <div className="rv-field">
              <label className="rv-label">Submission Type</label>
              <select className="rv-input" value={form.submitType} onChange={e=>set('submitType',e.target.value)}>
                {Object.entries(SUBMIT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="rv-field">
              <label className="rv-label">Deadline</label>
              <input className="rv-input" type="date" value={form.deadline} onChange={e=>set('deadline',e.target.value)}/>
            </div>
          </div>
          <div className="rv-ai-note">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#0a66c2"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v5h-1.5v-5zm0 6h1.5v1.5h-1.5V10.5z"/></svg>
            Submissions are automatically scored by LinkedIn Bounty AI on clarity, creativity, and impact.
          </div>
          <button className="rv-post-btn" disabled={!canPost} style={{opacity:canPost?1:0.45,cursor:canPost?'pointer':'not-allowed'}} onClick={handlePost}>
            Post Bounty →
          </button>
        </div>
      </div>
    </div>
  )
}

const SUBMIT_LABELS = { github:'GitHub Repo', figma:'Figma / Image Link', excel:'Excel / PDF Report', campaign:'Campaign Plan (Slides)', email:'Written Outreach', dashboard:'Data Dashboard', presentation:'Presentation Deck' }

/* ─── BOUNTY MEDAL LEADERBOARD (per-company bounty) ─── */
const BOUNTY_POOL = [
  { id:'p1',  name:'Aisha Nwosu',     school:'MIT · CS Senior',          avatar:'AN', avatarBg:'#0a66c2', score:98, time:'5h 12m', solution:'Rebuilt the profile header with a verified-badge rail and a recruiter-first information hierarchy. Shipped a Figma prototype plus a working React slice with skeleton states.' },
  { id:'p2',  name:'Diego Ramos',     school:'Stanford · CS Junior',     avatar:'DR', avatarBg:'#7c2ae8', score:97, time:'6h 02m', solution:'Ran a 12-person usability study on the current profile, then redesigned the skills section around evidence (badges, links, metrics). Included before/after task-completion data.' },
  { id:'p3',  name:'Mei Lin',         school:'CMU · HCI Masters',        avatar:'ML', avatarBg:'#059669', score:96, time:'4h 48m', solution:'Designed a progressive-disclosure profile that surfaces bounty proof above the fold. Annotated every decision with a rationale and WCAG AA contrast checks.' },
  { id:'p4',  name:'Sam Okafor',      school:'GA Tech · CS Senior',      avatar:'SO', avatarBg:'#e8590c', score:95, time:'7h 20m', solution:'Built a clickable prototype with a recruiter mode toggle that reorders the profile to lead with verified work. Strong visual polish, slightly thin on research.' },
  { id:'p5',  name:'Priya Kapoor',    school:'UT Austin · CS Senior',    avatar:'PK', avatarBg:'#e03e2d', score:94, time:'5h 55m', solution:'Focused on the first-job storytelling angle — a timeline that ties each badge to a concrete skill. Clean component breakdown and a tidy design-token sheet.' },
  { id:'p6',  name:'Tomás García',    school:'Berkeley · EECS Junior',   avatar:'TG', avatarBg:'#0a66c2', score:93, time:'6h 41m', solution:'Prototype emphasizes social proof (endorsements + bounty rank). Good interaction design, but the recruiter flow needed one fewer step.' },
  { id:'p7',  name:'Hana Bauer',      school:'UW · Design Senior',       avatar:'HB', avatarBg:'#7c2ae8', score:92, time:'8h 03m', solution:'Strong visual system and a thoughtful empty state for students with zero badges yet. Submitted PNG screens plus a one-page rationale.' },
  { id:'p8',  name:'Noah Williams',   school:'UIUC · CS Junior',         avatar:'NW', avatarBg:'#059669', score:91, time:'5h 30m', solution:'Reframed the profile around "proof of work". Solid IA, but the chart for skill coverage felt decorative rather than informative.' },
  { id:'p9',  name:'Lena Fischer',    school:'NYU · IxD Senior',         avatar:'LF', avatarBg:'#e8590c', score:90, time:'6h 18m', solution:'Mobile-first redesign with a sticky badge summary. Nice motion design; needs a desktop pass for wide screens.' },
  { id:'p10', name:'Omar Said',       school:'Purdue · CS Senior',       avatar:'OS', avatarBg:'#e03e2d', score:89, time:'7h 47m', solution:'Mapped the full recruiter journey then redesigned only the highest-leverage screen. Pragmatic and well-justified.' },
  { id:'p11', name:'Yuki Tanaka',     school:'UMich · CS Junior',        avatar:'YT', avatarBg:'#0a66c2', score:88, time:'6h 09m', solution:'Clean, conventional redesign. Everything works; nothing surprises. Good baseline candidate if a top pick drops out.' },
  { id:'p12', name:'Ivan Petrov',     school:'UCSD · CS Senior',         avatar:'IP', avatarBg:'#7c2ae8', score:87, time:'5h 02m', solution:'Strong engineering proof-of-concept with real data binding, lighter on visual craft. Would shine on an eng-leaning role.' },
  { id:'p13', name:'Grace Kim',       school:'Cornell · CS Junior',      avatar:'GK', avatarBg:'#059669', score:86, time:'8h 31m', solution:'Research-heavy submission with a competitive teardown of three rival profile pages. Recommendations were sharp.' },
]

function makePool() {
  // deterministic copy so re-renders don't reshuffle
  return BOUNTY_POOL.map(c => ({ ...c }))
}

function BountyBoardView({ bounty, onBack, onMessage }) {
  const [pool] = useState(makePool)
  const [statuses, setStatuses] = useState({}) // id -> pending | recruiter_ok | awarded | denied
  const [awardOrder, setAwardOrder] = useState([]) // ids in the order medals were finalized
  const [notified, setNotified] = useState({}) // id -> true (engineer emailed)
  const [selectedId, setSelectedId] = useState(null)

  const statusOf = (id) => statuses[id] || 'pending'
  const awardedCount = awardOrder.length
  const medalsLeft = MEDAL_COUNT - awardedCount

  const active = pool.filter(c => statusOf(c.id) !== 'denied').sort((a,b)=>b.score-a.score)
  const top10 = active.slice(0, 10)
  const selected = pool.find(c => c.id === selectedId) || null

  const setStatus = (id, s) => setStatuses(prev => ({ ...prev, [id]: s }))

  const deny = (id) => { setStatus(id, 'denied'); setSelectedId(null) }
  const recruiterApprove = (id) => setStatus(id, 'recruiter_ok')
  const engineerApprove = (id) => {
    if (medalsLeft <= 0) return
    setStatus(id, 'awarded')
    setAwardOrder(prev => prev.includes(id) ? prev : [...prev, id])
  }
  const notifyEngineer = (id) => setNotified(prev => ({ ...prev, [id]: true }))

  if (selected) {
    return (
      <SubmissionDetail
        bounty={bounty}
        candidate={selected}
        status={statusOf(selected.id)}
        notified={!!notified[selected.id]}
        medalsLeft={medalsLeft}
        medalRank={awardOrder.indexOf(selected.id)}
        onBack={() => setSelectedId(null)}
        onNotify={() => notifyEngineer(selected.id)}
        onApprove={() => recruiterApprove(selected.id)}
        onDeny={() => deny(selected.id)}
        onEngineerApprove={() => engineerApprove(selected.id)}
        onMessage={() => onMessage(selected)}
      />
    )
  }

  return (
    <div className="rv-body">
      <div className="rv-lb-wrap">
        <div className="rv-lb-hdr">
          <div className="rv-lb-hdr-left">
            <HomeBtn onClick={onBack} label="← Bounties" />
            <div>
              <h2 className="rv-lb-title rv-bd-title">
                <span className="rv-bd-co" style={{background:bounty.companyColor}}>{bounty.company[0]}</span>
                {bounty.title}
              </h2>
              <p className="rv-lb-sub">Top 10 qualifying for the <strong>{bounty.company} bounty medal</strong> · {bounty.category}</p>
            </div>
          </div>
        </div>

        <div className="rv-medal-status">
          <span className="rv-medal-pill">🏅 {medalsLeft} of {MEDAL_COUNT} medals remaining</span>
          {medalsLeft === 0 && <span className="rv-medal-done">All medals distributed ✓</span>}
        </div>

        <div className="rv-list rv-list-sorted">
          {top10.map((c, idx) => {
            const st = statusOf(c.id)
            const medalRank = awardOrder.indexOf(c.id)
            return (
              <div key={c.id} className={`rv-row rv-row-visible${st==='awarded'?' rv-row-gold':''}`} onClick={() => setSelectedId(c.id)}>
                <div className="rv-rank">
                  {idx<3?<span className="rv-medal-emoji">{['🥇','🥈','🥉'][idx]}</span>:<span className="rv-rank-num">#{idx+1}</span>}
                </div>
                <div className="rv-av" style={{background:c.avatarBg}}>{c.avatar}</div>
                <div className="rv-info">
                  <div className="rv-name">{c.name}</div>
                  <div className="rv-school">{c.school}</div>
                  <div className="rv-badges">
                    <StatusBadge status={st} medalRank={medalRank} />
                    <span className="rv-time-chip">⏱ {c.time}</span>
                  </div>
                </div>
                <div className="rv-score-col">
                  <div className="rv-score" style={{color:RANK_COLORS[idx]}}>{c.score}</div>
                  <div className="rv-pct">bounty score</div>
                </div>
                <span className="rv-chevron">›</span>
              </div>
            )
          })}
        </div>
        <p className="rv-hint">Click a submission to review the solution, send it to engineering, and approve or deny the medal.</p>
      </div>
    </div>
  )
}

function StatusBadge({ status, medalRank }) {
  if (status === 'awarded') {
    const m = RANK_MEDALS[medalRank] || '🏅'
    return <span className="rv-st-badge rv-st-awarded">{m} Medal awarded</span>
  }
  if (status === 'recruiter_ok') return <span className="rv-st-badge rv-st-pending">⏳ Pending engineering review</span>
  return <span className="rv-st-badge rv-st-new">● Awaiting review</span>
}

function SubmissionDetail({ bounty, candidate, status, notified, medalsLeft, medalRank, onBack, onNotify, onApprove, onDeny, onEngineerApprove, onMessage }) {
  const [email, setEmail] = useState('engineering@linkedin.com')
  const c = candidate

  return (
    <div className="rv-body">
      <div className="rv-post-wrap">
        <div className="rv-lb-hdr-left" style={{marginBottom:16}}>
          <HomeBtn onClick={onBack} label="← Top 10" />
          <div>
            <h2 className="rv-lb-title">{c.name}</h2>
            <p className="rv-lb-sub">{c.school} · {bounty.company} bounty submission</p>
          </div>
        </div>

        <div className="rv-sd-card">
          <div className="rv-sd-top">
            <div className="rv-av" style={{background:c.avatarBg}}>{c.avatar}</div>
            <div style={{flex:1, minWidth:0}}>
              <div className="rv-sd-name">{c.name}</div>
              <div className="rv-sd-meta">
                <span className="rv-sd-score">{c.score}<span className="rv-sd-score-sm">/100</span></span>
                <span className="rv-time-chip">⏱ {c.time} to solve</span>
                <StatusBadge status={status} medalRank={medalRank} />
              </div>
            </div>
            <button className="rp-btn-secondary rv-sd-msg" onClick={onMessage}>💬 Message</button>
          </div>

          <div className="rv-sd-section-lbl">📝 Solution</div>
          <p className="rv-sd-solution">{c.solution}</p>
          <div className="rv-sd-files">
            <span className="rv-sd-file">📎 solution.pdf</span>
            <span className="rv-sd-file">🔗 figma.com/file/{c.id}-profile</span>
          </div>
        </div>

        {/* ── Sub-section 1: send to engineer for approval ── */}
        <div className="rv-sd-card">
          <div className="rv-sd-section-lbl">①  Send to engineer for approval</div>
          <p className="rv-sd-help">Loop in an engineer to verify the technical quality before the medal is finalized.</p>
          <div className="rv-sd-email-row">
            <input className="rv-input" style={{flex:1}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="engineer@linkedin.com" />
            <button className={`rv-sd-send${notified?' sent':''}`} onClick={onNotify} disabled={notified}>
              {notified ? '✓ Sent' : 'Send →'}
            </button>
          </div>
          {notified && <div className="rv-sd-sent-note">Submission sent to <strong>{email}</strong> for engineering review.</div>}
        </div>

        {/* ── Sub-section 2: recruiter approve / deny + engineering finalize ── */}
        <div className="rv-sd-card">
          <div className="rv-sd-section-lbl">②  Recruiter decision</div>

          {status === 'pending' && (
            <>
              <p className="rv-sd-help">Approve to advance this candidate to engineering review, or deny to drop them — the next-ranked student (#11) moves into the top 10.</p>
              <div className="rv-sd-decide">
                <button className="rv-sd-approve" onClick={onApprove}>✓ Approve solution</button>
                <button className="rv-sd-deny" onClick={onDeny}>✕ Deny</button>
              </div>
            </>
          )}

          {status === 'recruiter_ok' && (
            <>
              <div className="rv-sd-pending-banner">⏳ You approved this candidate. <strong>Pending engineering review.</strong></div>
              {medalsLeft > 0 ? (
                <>
                  <p className="rv-sd-help">Engineering verifies the work, then finalizes the medal. (Demo: act as the engineer to finalize.)</p>
                  <div className="rv-sd-decide">
                    <button className="rv-sd-approve" onClick={onEngineerApprove}>🏅 Approve as engineer — award medal</button>
                    <button className="rv-sd-deny" onClick={onDeny}>✕ Engineer denies</button>
                  </div>
                </>
              ) : (
                <div className="rv-sd-pending-banner">All {MEDAL_COUNT} medals have already been distributed for this bounty.</div>
              )}
            </>
          )}

          {status === 'awarded' && (
            <div className="rv-sd-awarded-banner">
              {RANK_MEDALS[medalRank] || '🏅'} <strong>Medal awarded.</strong> {c.name} passed both recruiter and engineering review and now holds the {bounty.company} bounty medal.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── PROFILE ─── */
function ProfileView({ candidate, onBack, onMessage }) {
  const rank = candidate.rank ?? 1
  const [saved, setSaved] = useState(false)
  const [scheduling, setScheduling] = useState(false)

  return (
    <div className="rv-body">
      <div className="rv-lb-hdr-left rv-profile-top">
        <HomeBtn onClick={onBack} label="← Leaderboard" />
        <h2 className="rv-lb-title" style={{fontSize:18}}>Candidate Profile</h2>
      </div>
      <div className="rp-card">
        <div className="rp-cover">
          <svg width="100%" height="100%" viewBox="0 0 700 120" preserveAspectRatio="xMidYMid slice">
            <rect width="700" height="120" fill="#0f2744"/>
            {[[60,20],[140,10],[220,30],[300,8],[390,18],[470,12],[550,25],[630,15]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,0.65)"/>))}
            {[0,55,120,190,265,340,415,490,565,630].map((x,i)=>(<rect key={i} x={x} y={120-(30+i*5%55)} width={38+i*4%22} height={30+i*5%55} fill="#1a3a5c" rx="2"/>))}
          </svg>
          <div className="rp-av" style={{background:candidate.avatarBg}}>{candidate.avatar}</div>
        </div>
        <div className="rp-body">
          <div className="rp-name-row">
            <h2 className="rp-name">{candidate.name}</h2>
            <span className="rp-rank-chip">#{rank} on Leaderboard</span>
          </div>
          <p className="rp-school">{candidate.school}</p>
          <div className="rp-stats">
            <div className="rp-stat"><span className="rp-stat-num" style={{color:'#0a66c2'}}>{candidate.score}<span style={{fontSize:14}}>/100</span></span><span className="rp-stat-lbl">Bounty Score</span></div>
            <div className="rp-stat-div"/>
            <div className="rp-stat"><span className="rp-stat-num" style={{color:'#f59e0b',fontSize:22}}>{candidate.percentile}</span><span className="rp-stat-lbl">of all submissions</span></div>
            <div className="rp-stat-div"/>
            <div className="rp-stat"><span className="rp-stat-num" style={{fontSize:28}}>{candidate.badges.length}</span><span className="rp-stat-lbl">Verified Badges</span></div>
          </div>
          <div className="rp-section-lbl">⭐ LinkedIn Bounty Badges</div>
          {candidate.badges.map(b=>(
            <div key={b.company} className="rp-badge-card">
              <div className="rp-badge-ico" style={{background:b.color}}>{b.company[0]}</div>
              <div>
                <div className="rp-badge-co">{b.company} Bounty — Completed</div>
                <div className="rp-badge-task">{b.task}</div>
                <div className="rp-badge-score">Score {candidate.score}/100 · {candidate.percentile}</div>
                <div className="rp-verified">✓ Verified by LinkedIn Bounty AI</div>
              </div>
            </div>
          ))}
          <div className="rp-actions">
            <button className="rp-btn-primary" onClick={() => setScheduling(true)}>📅 Schedule Interview</button>
            <button className={`rp-btn-secondary${saved?' rp-saved':''}`} onClick={() => setSaved(s => !s)}>{saved ? '✓ Saved' : '🔖 Save'}</button>
            <button className="rp-btn-secondary" onClick={() => onMessage(candidate)}>💬 Message</button>
          </div>
        </div>
      </div>

      {scheduling && <ScheduleInterviewModal candidate={candidate} onClose={() => setScheduling(false)} />}
    </div>
  )
}

/* ─── SCHEDULE INTERVIEW MODAL ─── */
function ScheduleInterviewModal({ candidate, onClose }) {
  const email = emailFor(candidate.name)
  const [body, setBody] = useState(
    `Hi ${candidate.name.split(' ')[0]},\n\nYour ${candidate.badges?.[0]?.company || 'LinkedIn'} bounty work really stood out to our team. We'd love to set up a short interview to learn more about how you approached it.\n\nAre you available next week? Reply with a few times that work and we'll send a calendar invite.\n\nBest,\nEmily · ${RECRUITER_COMPANY} Recruiting`
  )
  const [sent, setSent] = useState(false)

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal" onClick={e => e.stopPropagation()}>
        {!sent ? (
          <>
            <div className="rv-modal-hdr">
              <h3 className="rv-modal-title">📅 Schedule Interview</h3>
              <button className="rv-modal-x" onClick={onClose}>✕</button>
            </div>
            <div className="rv-modal-to">
              <span className="rv-modal-to-lbl">To</span>
              <span className="rv-modal-to-email">{email}</span>
              <span className="rv-modal-to-src">🔗 via LinkedIn account</span>
            </div>
            <label className="rv-label" style={{marginTop:14, display:'block'}}>Your message</label>
            <textarea className="rv-textarea" rows={9} value={body} onChange={e => setBody(e.target.value)} />
            <div className="rv-modal-actions">
              <button className="rp-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="rv-post-btn" style={{flex:1.4}} onClick={() => setSent(true)}>Send email →</button>
            </div>
          </>
        ) : (
          <div className="rv-modal-sent">
            <div className="rv-posted-icon">📨</div>
            <h3 className="rv-modal-title">Interview request sent</h3>
            <p className="rv-modal-sub">Your message is on its way to <strong>{email}</strong>. You'll be notified when {candidate.name.split(' ')[0]} replies with availability.</p>
            <button className="rv-post-btn" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── MESSAGING DOCK (LinkedIn-style, bottom-right) ─── */
function MessagingDock({ open, recipient, threads, onToggle, onSend, onPickRecipient }) {
  const [draft, setDraft] = useState('')
  const listRef = useRef(null)
  const thread = recipient ? (threads[recipient.name] || []) : []
  const names = Object.keys(threads)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [thread.length, open, recipient])

  const submit = () => {
    const t = draft.trim()
    if (!t || !recipient) return
    onSend(recipient.name, t)
    setDraft('')
  }

  if (!open) {
    return (
      <button className="rv-msg-bar" onClick={onToggle}>
        <span className="rv-msg-bar-icon">💬</span>
        <span className="rv-msg-bar-title">Messaging</span>
        {names.length > 0 && <span className="rv-msg-bar-count">{names.length}</span>}
        <span className="rv-msg-bar-caret">▴</span>
      </button>
    )
  }

  return (
    <div className="rv-msg-panel">
      <div className="rv-msg-head" onClick={onToggle}>
        <span className="rv-msg-bar-icon">💬</span>
        <span className="rv-msg-bar-title">Messaging</span>
        <span className="rv-msg-bar-caret">▾</span>
      </div>

      {recipient ? (
        <>
          <div className="rv-msg-recipient">
            <div className="rv-msg-av" style={{background:recipient.avatarBg||'#0a66c2'}}>{recipient.avatar}</div>
            <div style={{minWidth:0}}>
              <div className="rv-msg-rname">{recipient.name}</div>
              <div className="rv-msg-rsub">{recipient.school || 'Candidate'}</div>
            </div>
            {names.length > 1 && <button className="rv-msg-back" onClick={() => onPickRecipient(null)} title="All conversations">☰</button>}
          </div>
          <div className="rv-msg-thread" ref={listRef}>
            {thread.length === 0 && <div className="rv-msg-empty">Start the conversation with {recipient.name.split(' ')[0]}.</div>}
            {thread.map((m,i)=>(
              <div key={i} className={`rv-msg-bubble ${m.from === 'me' ? 'me' : 'them'}`}>{m.text}</div>
            ))}
          </div>
          <div className="rv-msg-compose">
            <input
              className="rv-msg-input"
              placeholder={`Message ${recipient.name.split(' ')[0]}…`}
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') submit() }}
            />
            <button className="rv-msg-send" onClick={submit} disabled={!draft.trim()}>Send</button>
          </div>
        </>
      ) : (
        <div className="rv-msg-list">
          {names.length === 0
            ? <div className="rv-msg-empty">No conversations yet. Open a candidate and hit <strong>Message</strong> to start one.</div>
            : names.map(n => {
                const last = threads[n][threads[n].length-1]
                return (
                  <button key={n} className="rv-msg-list-item" onClick={() => onPickRecipient({ name: n, avatar: n.split(' ').map(w=>w[0]).join('').slice(0,2) })}>
                    <div className="rv-msg-av" style={{background:'#0a66c2'}}>{n.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                    <div style={{minWidth:0}}>
                      <div className="rv-msg-rname">{n}</div>
                      <div className="rv-msg-preview">{last?.text}</div>
                    </div>
                  </button>
                )
              })}
        </div>
      )}
    </div>
  )
}

/* ─── SCORE COUNTER ─── */
function ScoreCounter({ target, active, color }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)
  useEffect(()=>{
    if(!active||started.current) return
    started.current=true
    const start=Date.now(),dur=900
    const raf=()=>{ const p=Math.min((Date.now()-start)/dur,1); setDisplay(Math.round((1-Math.pow(1-p,3))*target)); if(p<1) requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
  },[active,target])
  return <div className="rv-score" style={{color}}>{display}</div>
}

/* ─── NAV ─── */
function RvNav() {
  return (
    <div className="rv-nav">
      <div className="rv-nav-inner">
        <div className="rv-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#0A66C2"/>
            <text x="5" y="21" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" fontWeight="800" fontSize="16" fill="white">in</text>
          </svg>
          <span className="rv-logo-text">Recruiter</span>
          <span className="rv-logo-tag">Bounty Dashboard</span>
        </div>
        <div className="rv-av-sm" style={{marginLeft:'auto'}}>HR</div>
      </div>
    </div>
  )
}
