import { IconShieldCheck, IconChevronRight } from '@tabler/icons-react'

/* The product's core artifact: company-tied, verified proof-of-work badges
   ("Bounties Completed") living on the profile, exactly where recruiters
   already search. Gold verified check (#8B6914) per the design spec. */

const GOLD = '#8B6914'

function CompanyMark({ company, color }) {
  if (company === 'Google') return (
    <div className="vc-logo" style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.35-1.04 2.5-2.21 3.26v2.71h3.57c2.08-1.92 3.28-4.74 3.28-8z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.07c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z" fill="#EA4335"/>
      </svg>
    </div>
  )
  if (company === 'Canva') return (
    <div className="vc-logo" style={{ background: 'transparent', padding: 0 }}>
      <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="vc-cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00c4cc"/><stop offset="100%" stopColor="#7c2ae8"/></linearGradient></defs>
        <circle cx="32" cy="32" r="32" fill="url(#vc-cg)"/>
        <path fill="#fff" d="M45.6,43.1c-1.7,2.3-3.9,4.7-6.8,6.5c-2.8,1.8-6,3.2-9.8,3.2c-3.5,0-6.4-1.8-8-3.3c-2.4-2.3-3.7-5.6-4.1-8.7c-1.2-9.6,4.7-22.3,13.8-27.8c2.1-1.3,4.4-1.9,6.6-1.9c4.4,0,7.7,3.1,8.1,6.9c0.4,3.4-0.9,6.3-4.7,8.2c-1.9,1-2.9,0.9-3.2,0.5c-0.2-0.3-0.1-0.8,0.3-1.1c3.5-2.9,3.6-5.3,3.2-8.7c-0.3-2.2-1.7-3.6-3.3-3.6c-6.9,0-16.9,15.5-15.5,26.7c0.5,4.4,3.2,9.5,8.8,9.5c1.8,0,3.8-0.5,5.5-1.4c3.9-2,5.6-3.4,7.9-6.6c0.3-0.4,0.6-0.9,0.9-1.3c0.2-0.4,0.6-0.5,0.9-0.5c0.3,0,0.7,0.3,0.7,0.8c0,0.3-0.1,0.9-0.5,1.4C46.3,42.1,46,42.7,45.6,43.1z"/>
      </svg>
    </div>
  )
  if (company === 'Fidelity') {
    const cx = 16, cy = 16, n = 16, outerR = 14, innerR = 3
    const pts = Array.from({ length: n * 2 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / n
      const r = i % 2 === 0 ? outerR : innerR
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
    }).join(' ')
    return (
      <div className="vc-logo" style={{ background: 'transparent', padding: 0 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs><clipPath id="vc-fc"><circle cx="16" cy="16" r="15"/></clipPath></defs>
          <circle cx="16" cy="16" r="15" fill="#538234"/>
          <g clipPath="url(#vc-fc)" fill="#fff">
            <polygon points={pts}/>
            <polygon points={`${cx},${cy} ${cx-10},31 ${cx+10},31`}/>
          </g>
        </svg>
      </div>
    )
  }
  const glyphs = {
    LinkedIn: <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 10h3v9H5v-9zM13 10h-3v9h3v-4.5c0-2 2.5-2.2 2.5 0V19h3v-5.5c0-4-4.5-3.8-5.5-2V10z" /></svg>,
    Stripe: <span style={{ fontWeight: 900, fontSize: 15, fontFamily: 'Georgia, serif' }}>S</span>,
    Vercel: <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l9 16H3L12 4z" /></svg>,
  }
  return (
    <div className="vc-logo" style={{ background: color }}>
      {glyphs[company] ?? company[0]}
    </div>
  )
}

export default function VerifiedChallengesCard({ badges }) {
  if (!badges || badges.length === 0) return null

  return (
    <div className="card vc-card">
      <div className="vc-hdr">
        <span className="vc-hdr-title">
          <IconShieldCheck size={17} color={GOLD} /> Bounties Completed
        </span>
        <span className="vc-count">{badges.length}</span>
      </div>

      {badges.map((b, i) => (
        <button className="puz-item vc-item" key={b.id ?? i}>
          <CompanyMark company={b.company} color={b.companyColor} />
          <div className="vc-info">
            <div className="vc-nm">
              {b.company} · {b.title}
              <IconShieldCheck size={13} color={GOLD} className="vc-check" />
            </div>
            <div className="vc-sub">
              {b.rank ? `Top 10 · #${b.rank}` : b.percentile} · Score {b.score}/100
            </div>
          </div>
          <IconChevronRight size={18} color="rgba(0,0,0,0.4)" />
        </button>
      ))}

      <div className="vc-foot">
        Proof-of-work, verified by LinkedIn Bounty
      </div>
    </div>
  )
}
