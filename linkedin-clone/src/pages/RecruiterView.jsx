import { useState, useEffect, useRef } from 'react'
import './RecruiterView.css'

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

const BOUNTIES = [
  { id:1, company:'LinkedIn', companyColor:'#0a66c2', title:'Redesign Student Profile UX', category:'Design', desc:'Improve the profile page experience for recent grads. Focus on skills showcase.', submissions:34, deadline:'Jul 12' },
  { id:2, company:'Canva', companyColor:'#7c2ae8', title:'Gen-Z Social Campaign Templates', category:'Marketing', desc:'Create 5 Canva templates targeting college-age users for back-to-school season.', submissions:21, deadline:'Jul 18' },
  { id:3, company:'Fidelity', companyColor:'#538234', title:'Retirement Savings Trend Analysis', category:'Finance', desc:'Analyze Gen-Z retirement savings data and produce actionable insights report.', submissions:19, deadline:'Jul 25' },
  { id:4, company:'Google', companyColor:'#4285f4', title:'URL Shortener with Analytics', category:'Engineering', desc:'Build a URL shortening service with click tracking and geo analytics dashboard.', submissions:12, deadline:'Aug 3' },
]

const RANK_MEDALS = ['🥇','🥈','🥉']
const RANK_COLORS = ['#f59e0b','#94a3b8','#b45309','#6b7280','#6b7280']

export default function RecruiterView() {
  const [screen, setScreen] = useState('scanning') // scanning | home | leaderboard | bounties | post | profile
  const [scanCount, setScanCount] = useState(0)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (screen !== 'scanning') return
    const iv = setInterval(() => setScanCount(c => { const n = c + Math.floor(Math.random()*32+10); return n>=1247?1247:n }), 70)
    return () => clearInterval(iv)
  }, [screen])

  useEffect(() => {
    const t = setTimeout(() => setScreen('home'), 2600)
    return () => clearTimeout(t)
  }, [])

  const nav = (s, candidate=null) => { setSelected(candidate); setScreen(s) }

  return (
    <div className="rv-page">
      <RvNav>
        {screen !== 'scanning' && screen !== 'home' && (
          <button className="rv-back-btn" onClick={() => setScreen('home')}>← Home</button>
        )}
      </RvNav>

      {screen === 'scanning' && <ScanningView scanCount={scanCount}/>}
      {screen === 'home'      && <HomeView onNav={nav}/>}
      {screen === 'leaderboard' && <LeaderboardView onProfile={c => nav('profile', c)}/>}
      {screen === 'bounties'    && <BountiesView onPost={() => nav('post')}/>}
      {screen === 'post'        && <PostBountyView onDone={() => nav('bounties')}/>}
      {screen === 'profile' && selected && <ProfileView candidate={selected} onBack={() => nav('leaderboard')}/>}
    </div>
  )
}

/* ─── SCANNING ─── */
function ScanningView({ scanCount }) {
  return (
    <div className="rv-body rv-center">
      <div className="rv-search-card">
        <div className="rv-radar-wrap">
          <div className="rv-radar-ring r1"/><div className="rv-radar-ring r2"/><div className="rv-radar-ring r3"/>
          <div className="rv-radar-core">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
        </div>
        <h2 className="rv-search-title">Scanning LinkedIn Bounties</h2>
        <p className="rv-search-sub">Finding students who completed real company bounties and ranking by verified AI score</p>
        <div className="rv-count-row">
          <span className="rv-count-num">{scanCount.toLocaleString()}</span>
          <span className="rv-count-label">/ 1,247 submissions scanned</span>
        </div>
        <div className="rv-scan-track"><div className="rv-scan-fill" style={{width:`${(scanCount/1247)*100}%`}}/></div>
        <div className="rv-co-chips">
          {['LinkedIn','Google','Canva','Fidelity','HubSpot','Adobe'].map((c,i)=>(
            <span key={c} className="rv-co-chip" style={{animationDelay:`${i*0.18}s`}}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── HOME ─── */
function HomeView({ onNav }) {
  return (
    <div className="rv-body">
      <div className="rv-home-hero">
        <div>
          <h1 className="rv-home-title">Welcome back, Emily</h1>
          <p className="rv-home-sub">Here's what's happening with your LinkedIn Bounties today.</p>
        </div>
        <button className="rv-home-post-btn" onClick={() => onNav('post')}>+ Post a Bounty</button>
      </div>

      {/* stats */}
      <div className="rv-stats-row">
        {[
          { label:'Active Bounties', value:'4', icon:'📋', color:'#0a66c2' },
          { label:'Total Submissions', value:'86', icon:'📥', color:'#7c2ae8' },
          { label:'Candidates Ranked', value:'1,247', icon:'🏆', color:'#f59e0b' },
          { label:'Badges Awarded', value:'312', icon:'⭐', color:'#059669' },
        ].map((s,i)=>(
          <div key={s.label} className="rv-stat-card" style={{animationDelay:`${i*0.06}s`}}>
            <div className="rv-stat-icon" style={{background:s.color+'18'}}>{s.icon}</div>
            <div>
              <div className="rv-stat-val" style={{color:s.color}}>{s.value}</div>
              <div className="rv-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* section cards */}
      <div className="rv-home-cards">

        <button className="rv-home-card" onClick={() => onNav('leaderboard')}>
          <div className="rv-hcard-top">
            <span className="rv-hcard-icon">🏆</span>
            <span className="rv-hcard-arrow">→</span>
          </div>
          <div className="rv-hcard-title">Candidate Leaderboard</div>
          <div className="rv-hcard-desc">Top students ranked by verified bounty score</div>
          <div className="rv-hcard-divider"/>
          {CANDIDATES.slice(0,3).map((c,i)=>(
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
          <div className="rv-hcard-desc">Open company tasks accepting student submissions</div>
          <div className="rv-hcard-divider"/>
          {BOUNTIES.slice(0,3).map(b=>(
            <div key={b.id} className="rv-hcard-row">
              <div className="rv-hcard-dot" style={{background:b.companyColor}}/>
              <span className="rv-hcard-name">{b.title}</span>
              <span className="rv-hcard-badge">{b.submissions}</span>
            </div>
          ))}
        </button>

        <button className="rv-home-card" onClick={() => onNav('post')}>
          <div className="rv-hcard-top">
            <span className="rv-hcard-icon">✏️</span>
            <span className="rv-hcard-arrow">→</span>
          </div>
          <div className="rv-hcard-title">Post a Bounty</div>
          <div className="rv-hcard-desc">Turn a backlog task into a student challenge</div>
          <div className="rv-hcard-divider"/>
          {['Describe your task','Set deadline & type','Students compete','AI scores & ranks'].map((s,i)=>(
            <div key={i} className="rv-hcard-row">
              <div className="rv-step-num">{i+1}</div>
              <span className="rv-hcard-name">{s}</span>
            </div>
          ))}
        </button>

      </div>
    </div>
  )
}

/* ─── LEADERBOARD ─── */
function LeaderboardView({ onProfile }) {
  const [visibleCards, setVisibleCards] = useState(new Set())
  const [sorted, setSorted] = useState(false)

  useEffect(() => {
    ;[4,3,2,1,0].forEach((idx,i)=>{
      setTimeout(()=>{
        setVisibleCards(s=>new Set([...s,idx]))
        if(i===4) setTimeout(()=>setSorted(true),300)
      }, i*260)
    })
  }, [])

  return (
    <div className="rv-body">
      <div className="rv-lb-wrap">
        <div className="rv-lb-hdr">
          <div>
            <h2 className="rv-lb-title">🏆 Candidate Leaderboard</h2>
            <p className="rv-lb-sub">Students ranked by verified LinkedIn Bounty score across all companies</p>
          </div>
          <span className="rv-ai-chip">⭐ AI-Ranked</span>
        </div>
        <div className={`rv-list${sorted?' rv-list-sorted':''}`}>
          {CANDIDATES.map((c,idx)=>{
            const visible = visibleCards.has(idx)
            return (
              <div key={c.id}
                className={`rv-row${visible?' rv-row-visible':''}${sorted&&idx===0?' rv-row-gold':''}`}
                onClick={()=>onProfile(c)}
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
function BountiesView({ onPost }) {
  return (
    <div className="rv-body">
      <div className="rv-lb-wrap">
        <div className="rv-lb-hdr">
          <div>
            <h2 className="rv-lb-title">📋 Active Bounties</h2>
            <p className="rv-lb-sub">Company tasks open for student submissions</p>
          </div>
          <button className="rv-post-inline-btn" onClick={onPost}>+ Post New</button>
        </div>
        <div className="rv-bounty-list">
          {BOUNTIES.map((b,i)=>(
            <div key={b.id} className="rv-bounty-card" style={{animationDelay:`${i*0.08}s`}}>
              <div className="rv-bounty-hdr">
                <div className="rv-bounty-co" style={{background:b.companyColor}}>{b.company[0]}</div>
                <div style={{flex:1}}>
                  <div className="rv-bounty-co-name" style={{color:b.companyColor}}>{b.company}</div>
                  <div className="rv-bounty-title">{b.title}</div>
                </div>
                <span className="rv-bounty-cat">{b.category}</span>
              </div>
              <p className="rv-bounty-desc">{b.desc}</p>
              <div className="rv-bounty-footer">
                <span className="rv-bounty-meta">📥 {b.submissions} submissions</span>
                <span className="rv-bounty-meta">🗓 Due {b.deadline}</span>
                <span className="rv-bounty-status">● Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── POST BOUNTY ─── */
function PostBountyView({ onDone }) {
  const [form, setForm] = useState({company:'',title:'',category:'Engineering',desc:'',submitType:'github',deadline:''})
  const [posted, setPosted] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const canPost = form.company && form.title && form.desc && form.deadline

  if (posted) return (
    <div className="rv-body rv-center">
      <div className="rv-posted-card">
        <div className="rv-posted-icon">🎉</div>
        <h2 className="rv-posted-title">Bounty Posted!</h2>
        <p className="rv-posted-sub"><strong>{form.title}</strong> from <strong>{form.company}</strong> is now live. Students can discover and submit for AI-verified badges.</p>
        <div className="rv-posted-info">
          <span>📂 {form.category}</span>
          <span>🗓 Due {form.deadline}</span>
        </div>
        <button className="rv-post-btn" onClick={onDone}>← Back to Bounties</button>
      </div>
    </div>
  )

  return (
    <div className="rv-body">
      <div className="rv-post-wrap">
        <h2 className="rv-lb-title">Post a Bounty</h2>
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
              <label className="rv-label">Deadline <span className="rv-req">*</span></label>
              <input className="rv-input" type="date" value={form.deadline} onChange={e=>set('deadline',e.target.value)}/>
            </div>
          </div>
          <div className="rv-ai-note">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#0a66c2"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v5h-1.5v-5zm0 6h1.5v1.5h-1.5V10.5z"/></svg>
            Submissions are automatically scored by LinkedIn Bounty AI on clarity, creativity, and impact.
          </div>
          <button className="rv-post-btn" disabled={!canPost} style={{opacity:canPost?1:0.45,cursor:canPost?'pointer':'not-allowed'}} onClick={()=>setPosted(true)}>
            Post Bounty →
          </button>
        </div>
      </div>
    </div>
  )
}

const SUBMIT_LABELS = { github:'GitHub Repo', figma:'Figma / Image Link', excel:'Excel / PDF Report', campaign:'Campaign Plan (Slides)', email:'Written Outreach', dashboard:'Data Dashboard', presentation:'Presentation Deck' }

/* ─── PROFILE ─── */
function ProfileView({ candidate, onBack }) {
  const rank = CANDIDATES.indexOf(candidate)+1
  return (
    <div className="rv-body">
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
            <button className="rp-btn-primary">📅 Schedule Interview</button>
            <button className="rp-btn-secondary">🔖 Save</button>
            <button className="rp-btn-secondary">💬 Message</button>
          </div>
        </div>
      </div>
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
function RvNav({ children }) {
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
        {children}
        <div className="rv-av-sm" style={{marginLeft:'auto'}}>HR</div>
      </div>
    </div>
  )
}
