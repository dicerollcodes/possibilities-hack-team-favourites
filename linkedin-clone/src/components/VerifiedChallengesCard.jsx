import { IconShieldCheck, IconChevronRight } from '@tabler/icons-react'

/* The product's core artifact: company-tied, verified proof-of-work badges
   living on the profile, exactly where recruiters already search.
   Gold verified check (#8B6914) per the design spec. */

const GOLD = '#8B6914'

function CompanyMark({ company, color }) {
  // Tiny per-company glyph reusing the .page-ico circle treatment.
  const glyphs = {
    LinkedIn: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 10h3v9H5v-9zM13 10h-3v9h3v-4.5c0-2 2.5-2.2 2.5 0V19h3v-5.5c0-4-4.5-3.8-5.5-2V10z" />
      </svg>
    ),
    Stripe: <span style={{ fontWeight: 900, fontSize: 15, fontFamily: 'Georgia, serif' }}>S</span>,
    Vercel: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l9 16H3L12 4z" /></svg>
    ),
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
          <IconShieldCheck size={17} color={GOLD} /> Verified Challenges
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
