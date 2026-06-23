import { useState } from 'react'
import { IconChevronRight, IconBookmark, IconClock, IconCheck, IconX } from '@tabler/icons-react'

const CATEGORIES = ['All', 'Finance', 'Marketing', 'Technology', 'Design', 'Legal', 'Operations']

const BOUNTIES = [
  {
    id: 1,
    category: 'Technology',
    title: 'Build an AI-Powered Invoice Parser',
    company: 'VaultPath',
    companyInitials: 'VP',
    companyBg: '#1a1a2e',
    reward: '$4,500',
    rewardType: 'Fixed',
    description: 'Develop a production-ready ML pipeline that extracts structured data from unstructured invoice PDFs with >95% accuracy across diverse formats.',
    criteria: [
      'OCR + NLP pipeline with >95% field extraction accuracy',
      'Supports PDF, PNG, JPEG inputs up to 20 pages',
      'REST API with documented endpoints and under 2s latency',
    ],
    deadline: 'Jul 15, 2026',
    applicants: 12,
    featured: true,
  },
  {
    id: 2,
    category: 'Finance',
    title: 'Revenue Attribution Model for Multi-Touch Campaigns',
    company: 'Nexion Systems',
    companyInitials: 'NS',
    companyBg: '#0077b6',
    reward: '$3,200',
    rewardType: 'Fixed',
    description: 'Design and implement a data-driven revenue attribution model that accurately assigns credit across multiple marketing touchpoints in a B2B sales cycle.',
    criteria: [
      'Implements at least 3 attribution models (linear, time-decay, Shapley)',
      'Integrates with CRM export (CSV/JSON) and outputs dashboard-ready data',
      'Documented methodology with statistical validation report',
    ],
    deadline: 'Jul 22, 2026',
    applicants: 7,
    featured: true,
  },
  {
    id: 3,
    category: 'Marketing',
    title: 'Viral LinkedIn Content Strategy for SaaS Brand',
    company: 'AlertFlow',
    companyInitials: 'AF',
    companyBg: '#333',
    reward: '$1,800',
    rewardType: 'Milestone',
    description: 'Create a 90-day LinkedIn content playbook and produce 12 high-engagement posts that grow the company page following by at least 2,000 targeted followers.',
    criteria: [
      '12 original posts published over 90 days with minimum 500 impressions each',
      'Follower growth ≥2,000 from ICP (B2B DevOps/Engineering leads)',
      'Final report with analytics, A/B test results, and repeatable playbook',
    ],
    deadline: 'Aug 1, 2026',
    applicants: 23,
    featured: false,
  },
  {
    id: 4,
    category: 'Design',
    title: 'Rebrand Visual Identity for B2B Startup',
    company: 'Beacon of Hope',
    companyInitials: 'B',
    companyBg: '#6b6b6b',
    reward: '$2,600',
    rewardType: 'Fixed',
    description: 'Deliver a complete brand identity overhaul including logo suite, color system, typography, and brand guidelines doc ready for immediate production use.',
    criteria: [
      'Logo in 4 variants (full, icon, dark, light) delivered as SVG + PNG',
      'Brand guidelines PDF covering colors, type, spacing, do/don\'t usage',
      '3 application mockups (website hero, LinkedIn banner, pitch deck slide)',
    ],
    deadline: 'Jul 30, 2026',
    applicants: 18,
    featured: false,
  },
  {
    id: 5,
    category: 'Legal',
    title: 'SaaS MSA & DPA Template for EU Compliance',
    company: 'Tech Thinkers',
    companyInitials: '</>',
    companyBg: '#1a1a2e',
    reward: '$5,000',
    rewardType: 'Fixed',
    description: 'Draft a production-ready Master Service Agreement and Data Processing Addendum compliant with GDPR, CCPA, and standard SaaS commercial terms for a Series A company.',
    criteria: [
      'MSA covers liability caps, IP ownership, SLA remedies, and termination rights',
      'DPA includes SCCs, sub-processor list template, and breach notification clauses',
      'Reviewed by qualified legal counsel (verification required)',
    ],
    deadline: 'Aug 10, 2026',
    applicants: 4,
    featured: true,
  },
  {
    id: 6,
    category: 'Operations',
    title: 'SOC 2 Readiness Assessment & Gap Report',
    company: 'Spot Robotics Podcast',
    companyInitials: 'SRP',
    companyBg: '#0077b6',
    reward: '$3,800',
    rewardType: 'Milestone',
    description: 'Conduct a comprehensive SOC 2 Type II readiness assessment, identify control gaps, and deliver a prioritized remediation roadmap with timeline estimates.',
    criteria: [
      'Assessment covers all 5 Trust Service Criteria with evidence mapping',
      'Gap report with risk-ranked findings and effort estimates per control',
      'Remediation roadmap covering 12 months with owner assignments template',
    ],
    deadline: 'Jul 28, 2026',
    applicants: 9,
    featured: false,
  },
  {
    id: 7,
    category: 'Technology',
    title: 'Open-Source CLI Tool for K8s Cost Optimization',
    company: 'VaultPath',
    companyInitials: 'VP',
    companyBg: '#1a1a2e',
    reward: '$2,200',
    rewardType: 'Fixed',
    description: 'Build and publish an open-source CLI tool that analyzes Kubernetes cluster resource utilization and surfaces actionable cost reduction recommendations.',
    criteria: [
      'Works with EKS, GKE, AKS clusters via kubeconfig; outputs JSON + human-readable report',
      'Identifies idle/oversized workloads and estimates monthly savings',
      'Published on GitHub with MIT license, README, and passing CI tests',
    ],
    deadline: 'Aug 5, 2026',
    applicants: 15,
    featured: false,
  },
  {
    id: 8,
    category: 'Finance',
    title: 'Financial Model for Series A Due Diligence',
    company: 'Nexion Systems',
    companyInitials: 'NS',
    companyBg: '#0077b6',
    reward: '$2,900',
    rewardType: 'Fixed',
    description: 'Build an investor-ready 5-year financial model with three scenarios, unit economics dashboard, and sensitivity analysis for a B2B SaaS company raising Series A.',
    criteria: [
      '5-year P&L, balance sheet, and cash flow with monthly granularity for Y1–Y2',
      'Unit economics tab: CAC, LTV, payback period, net revenue retention',
      'Fully documented assumptions tab and one-page exec summary output',
    ],
    deadline: 'Jul 18, 2026',
    applicants: 11,
    featured: false,
  },
]

const REWARD_COLOR = { Fixed: '#000', Milestone: '#6b6b6b' }

export default function BountyPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [saved, setSaved] = useState(new Set())

  const visible = activeCategory === 'All'
    ? BOUNTIES
    : BOUNTIES.filter(b => b.category === activeCategory)

  const featured = visible.filter(b => b.featured)
  const rest     = visible.filter(b => !b.featured)

  function toggleSave(id) {
    setSaved(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <div className="bounty-page">

      {/* ── Hero ── */}
      <div className="bounty-hero">
        <div className="bounty-hero-inner">
          <div className="bounty-hero-badge">
            <BountyStarIcon size={14} color="#fff" /> BOUNTY BOARD
          </div>
          <h1 className="bounty-hero-title">Find & Complete Bounties</h1>
          <p className="bounty-hero-sub">
            Real work. Real rewards. Browse open bounties from verified companies across six industries.
          </p>
        </div>
      </div>

      {/* ── Category filters ── */}
      <div className="bounty-filters-wrap">
        <div className="bounty-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`bounty-cat${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <CategoryIcon cat={cat} active={activeCategory === cat} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bounty-content">

        {/* Featured */}
        {featured.length > 0 && (
          <section className="bounty-section">
            <div className="bounty-section-hdr">
              <span className="bounty-section-label">⭐ Featured</span>
              <span className="bounty-count">{featured.length} bounties</span>
            </div>
            <div className="bounty-grid">
              {featured.map(b => <BountyCard key={b.id} b={b} saved={saved.has(b.id)} onSave={() => toggleSave(b.id)} />)}
            </div>
          </section>
        )}

        {/* All others */}
        {rest.length > 0 && (
          <section className="bounty-section">
            <div className="bounty-section-hdr">
              <span className="bounty-section-label">All Bounties</span>
              <span className="bounty-count">{rest.length} bounties</span>
            </div>
            <div className="bounty-grid">
              {rest.map(b => <BountyCard key={b.id} b={b} saved={saved.has(b.id)} onSave={() => toggleSave(b.id)} />)}
            </div>
          </section>
        )}

        {visible.length === 0 && (
          <div className="bounty-empty">
            <p>No bounties in this category yet — check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BountyCard({ b, saved, onSave }) {
  const [applied, setApplied] = useState(false)

  return (
    <div className={`bounty-card${b.featured ? ' bounty-card-featured' : ''}`}>
      {b.featured && <div className="bounty-featured-ribbon">Featured</div>}

      {/* Card header */}
      <div className="bc-hdr">
        <div className="bc-logo" style={{ background: b.companyBg }}>
          <span style={{ fontSize: b.companyInitials.length > 2 ? 9 : 13 }}>{b.companyInitials}</span>
        </div>
        <div className="bc-company-info">
          <div className="bc-company">{b.company}</div>
          <div className="bc-cat-badge" style={{ background: CATEGORY_COLORS[b.category]?.bg, color: CATEGORY_COLORS[b.category]?.text }}>
            {b.category}
          </div>
        </div>
        <button className={`bc-save${saved ? ' saved' : ''}`} onClick={onSave}>
          <IconBookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Title & description */}
      <h3 className="bc-title">{b.title}</h3>
      <p className="bc-desc">{b.description}</p>

      {/* Criteria */}
      <div className="bc-criteria-hdr">Completion criteria</div>
      <ul className="bc-criteria">
        {b.criteria.map((c, i) => (
          <li key={i} className="bc-criterion">
            <div className="bc-check"><IconCheck size={10} strokeWidth={3} /></div>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="bc-footer">
        <div className="bc-meta">
          <div className="bc-reward">
            <span className="bc-reward-val">{b.reward}</span>
            <span className="bc-reward-type" style={{ background: REWARD_COLOR[b.rewardType] + '1a', color: REWARD_COLOR[b.rewardType] }}>
              {b.rewardType}
            </span>
          </div>
          <div className="bc-deadline">
            <IconClock size={13} color="rgba(0,0,0,0.45)" />
            <span>Due {b.deadline}</span>
          </div>
          <div className="bc-applicants">{b.applicants} applicants</div>
        </div>
        <div className="bc-actions">
          <button className="bc-view-btn" onClick={() => setApplied(true)} disabled={applied}>
            {applied ? <><IconCheck size={14} /> Applied</> : <>View Bounty <IconChevronRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

const CATEGORY_COLORS = {
  Finance:    { bg: '#c8c8c8', text: '#000' },
  Marketing:  { bg: '#c8c8c8', text: '#000' },
  Technology: { bg: '#0077b6', text: '#fff' },
  Design:     { bg: '#c8c8c8', text: '#000' },
  Legal:      { bg: '#333',    text: '#fff' },
  Operations: { bg: '#c8c8c8', text: '#000' },
}

function CategoryIcon({ cat, active }) {
  const color = active ? '#fff' : 'rgba(0,0,0,0.55)'
  const icons = {
    All:        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill={color}/><rect x="8" y="1" width="5" height="5" rx="1" fill={color}/><rect x="1" y="8" width="5" height="5" rx="1" fill={color}/><rect x="8" y="8" width="5" height="5" rx="1" fill={color}/></svg>,
    Finance:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M4 4h4.5a1.5 1.5 0 010 3H5a1.5 1.5 0 000 3H10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>,
    Marketing:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9l3-3 2 2 5-5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 3h2v2" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    Technology: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.3"/><path d="M4.5 6.5L6 8l3-3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    Design:     <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.3"/><path d="M7 4v3l2 2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>,
    Legal:      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M4 2h6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><path d="M3 5l-2 4h4L3 5zM11 5l-2 4h4L11 5z" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    Operations: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1.3"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M11.2 2.8l-1.4 1.4M4.2 9.8l-1.4 1.4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  }
  return icons[cat] || null
}

function BountyStarIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L9.8 5.6L14.7 6L11.1 9.1L12.2 14L8 11.5L3.8 14L4.9 9.1L1.3 6L6.2 5.6L8 1Z" fill={color}/>
    </svg>
  )
}
