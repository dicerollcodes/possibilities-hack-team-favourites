import { IconShieldCheck, IconCircleCheck, IconClock } from '@tabler/icons-react'
import { normalizeStatus, REVIEW_STATUS } from '../lib/demoUser'

/* The product's core artifact: company-tied, verified proof-of-work badges
   ("Bounties Completed") living on the profile, exactly where recruiters
   already search. Its own standalone section, styled identically to
   Licenses & certifications (the pf-entry treatment) so it reads as a
   first-class credential. Gold verified check (#8B6914) per the design spec.

   A badge is only "Verified" once its bounty reaches the AWARDED status — i.e.
   the submission made the top 10 AND a recruiter and an engineer both approved.
   Earlier states surface as "In review". */

const GOLD = '#8B6914'

// The badge id IS the DB bounty_status key (see App.jsx earnBadge), so the
// status map is read directly by id.
const statusKey = (b) => b?.id

// Human label + style for each review state.
const STATUS_VIEW = {
  [REVIEW_STATUS.AWARDED]:      { cls: 'done',  Icon: IconCircleCheck, text: 'Verified · awarded' },
  [REVIEW_STATUS.RECRUITER_OK]: { cls: 'review', Icon: IconClock,      text: 'In review · engineering' },
  [REVIEW_STATUS.IN_REVIEW]:    { cls: 'review', Icon: IconClock,      text: 'In review · recruiter' },
  [REVIEW_STATUS.DENIED]:       { cls: 'denied', Icon: IconClock,      text: 'Not awarded' },
}
const DEFAULT_VIEW = { cls: 'review', Icon: IconClock, text: 'In review' }

function CompanyGlyph({ company }) {
  const glyphs = {
    LinkedIn: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
        <path d="M6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 10h3v9H5v-9zM13 10h-3v9h3v-4.5c0-2 2.5-2.2 2.5 0V19h3v-5.5c0-4-4.5-3.8-5.5-2V10z" />
      </svg>
    ),
    Stripe: <span style={{ fontWeight: 900, fontSize: 16, fontFamily: 'Georgia, serif' }}>S</span>,
    Vercel: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l9 16H3L12 4z" /></svg>
    ),
    Google: (
      <svg width="22" height="22" viewBox="0 0 24 24">
        <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="900" fontFamily="Arial, sans-serif" fill="#fff">G</text>
      </svg>
    ),
  }
  return glyphs[company] ?? <span style={{ fontWeight: 800 }}>{company?.[0] ?? '?'}</span>
}

export default function VerifiedChallengesCard({ badges, bountyStatus = {} }) {
  if (!badges || badges.length === 0) return null

  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <h2 className="pf-sec-title">Bounties Completed</h2>
        <span className="vc-count">{badges.length}</span>
      </div>

      <div className="pf-entries">
        {badges.map((b, i) => {
          // Resolve the review state from the DB-backed status map.
          const status = normalizeStatus(bountyStatus[statusKey(b)])
          const awarded = status === REVIEW_STATUS.AWARDED
          const view = (status && STATUS_VIEW[status]) || DEFAULT_VIEW
          const { Icon } = view
          return (
          <div className="pf-entry" key={b.id ?? i}>
            <span className="pf-entry-logo" style={{ background: b.companyColor }}>
              <CompanyGlyph company={b.company} />
            </span>
            <div className="pf-entry-body">
              <div className="pf-entry-role pf-cert-name">
                {b.company} Bounty · {b.title}
                {awarded && <IconShieldCheck size={15} color={GOLD} />}
                <span className={`vc-status ${view.cls}`}>
                  <Icon size={12} strokeWidth={2.5} /> {view.text}
                </span>
              </div>
              <div className="pf-entry-org">LinkedIn Bounty</div>
              <div className="pf-entry-dates">
                {b.rank ? `Top 10 · #${b.rank}` : 'Shortlisted'} · {b.category ?? 'Engineering'}
              </div>
              {awarded && (
                <button className="pf-cred-btn">
                  Show credential <IconShieldCheck size={14} />
                </button>
              )}
            </div>
          </div>
          )
        })}
      </div>

      <div className="pf-cert-foot">
        <IconShieldCheck size={14} color={GOLD} />
        Verified proof-of-work, earned on LinkedIn Bounty
      </div>
    </div>
  )
}
