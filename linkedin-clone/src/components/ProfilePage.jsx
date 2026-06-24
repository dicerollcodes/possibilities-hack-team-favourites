import {
  IconPencil, IconPlus, IconBriefcase,
  IconShieldCheck, IconChevronRight, IconChevronDown, IconWorld,
  IconDots, IconStar, IconEye, IconChartBar, IconSparkles,
  IconCamera, IconUserPlus,
} from '@tabler/icons-react'
import VerifiedChallengesCard from './VerifiedChallengesCard'

/* ──────────────────────────────────────────────
   Profile page — a faithful LinkedIn member-profile clone.
   All data is fabricated for this demo. The earned Bounty badges
   (passed up from App) surface in Licenses & certifications, exactly
   where recruiters already look — the whole point of the product.
─────────────────────────────────────────────── */

const GOLD = '#8B6914'

const PROFILE = {
  name: 'Panav Mhatre',
  headline: 'CS @ UT Austin · Prev SWE Intern @ Stripe, Vercel · Building proof-of-work hiring',
  location: 'Austin, Texas Metropolitan Area',
  connections: '500+',
  followers: '1,284',
  current: { kind: 'school', name: 'The University of Texas at Austin' },
  education: { name: 'The University of Texas at Austin' },
  about: `Final-year CS student at UT Austin who learns by shipping. I care about the boring parts that make software trustworthy — idempotency, cache invalidation, and the edge cases everyone skips.

Most recently on Stripe's payments-reliability team, where a retry path I wrote now guards a few million requests a day. Before that, the edge-runtime team at Vercel.

I think a resume is a weak signal and proof-of-work is a strong one, so I spend my weekends clearing company bounties and collecting verified badges. Open to new-grad software engineering roles starting 2026.`,
}

const EXPERIENCE = [
  {
    company: 'Stripe',
    color: '#635bff',
    logo: <StripeLogo />,
    role: 'Software Engineer Intern',
    dates: 'May 2025 – Aug 2025 · 4 mos',
    place: 'San Francisco, CA · Hybrid',
    bullets: [
      'Payments Reliability team. Built an idempotent retry layer that de-duplicates charge attempts across network partitions.',
      'Cut duplicate-charge incidents to zero in the canary fleet; the path now fronts ~3M requests/day.',
    ],
    skills: ['Go', 'Distributed Systems', 'Idempotency'],
  },
  {
    company: 'Vercel',
    color: '#111111',
    logo: <VercelLogo />,
    role: 'Software Engineer Intern',
    dates: 'May 2024 – Aug 2024 · 4 mos',
    place: 'Remote',
    bullets: [
      'Edge runtime team. Shipped incremental path-based cache invalidation so revalidating a route drops only its descendants.',
      'Reduced over-invalidation on a benchmark app by 41%, measured against the previous full-flush behavior.',
    ],
    skills: ['TypeScript', 'Edge Functions', 'Caching'],
  },
  {
    company: 'The University of Texas at Austin',
    color: '#bf5700',
    logo: <UTLogo />,
    role: 'Teaching Assistant — Data Structures (CS 314)',
    dates: 'Jan 2024 – Present · 2 yrs 6 mos',
    place: 'Austin, Texas',
    bullets: [
      'Lead two weekly discussion sections (~60 students) and hold office hours on algorithmic complexity and graph problems.',
      'Authored the autograder for the heaps & balanced-trees assignment now reused across sections.',
    ],
    skills: ['Java', 'Algorithms', 'Mentoring'],
  },
  {
    company: 'The University of Texas at Austin',
    color: '#bf5700',
    logo: <UTLogo />,
    role: 'Undergraduate Research Assistant — Systems Lab',
    dates: 'Sep 2023 – Dec 2023 · 4 mos',
    place: 'Austin, Texas',
    bullets: [
      'Prototyped a deterministic feed-deduplication scheme for a streaming-systems group; results fed into a workshop poster.',
    ],
    skills: ['Python', 'Streaming Systems'],
  },
]

const EDUCATION = [
  {
    name: 'The University of Texas at Austin',
    color: '#bf5700',
    logo: <UTLogo />,
    degree: 'Bachelor of Science, Computer Science',
    dates: '2022 – 2026',
    detail: 'Activities: ACM, Longhorn Competitive Programming, TA for Data Structures. Coursework: Distributed Systems, Operating Systems, Algorithms, Databases.',
  },
  {
    name: 'Westwood High School',
    color: '#0a66c2',
    logo: <span style={{ fontWeight: 800, fontSize: 16 }}>W</span>,
    degree: 'High School Diploma',
    dates: '2018 – 2022',
    detail: 'Robotics Club captain · National Merit Finalist.',
  },
]

// Static certs that always show, in addition to the earned Bounty badges.
const STATIC_CERTS = [
  { issuer: 'Amazon Web Services', color: '#ff9900', glyph: 'aws', name: 'AWS Certified Cloud Practitioner', meta: 'Issued Mar 2024 · Credential ID AWS-CCP-4471' },
  { issuer: 'Coursera', color: '#0056d2', glyph: 'C', name: 'Meta Front-End Developer Professional Certificate', meta: 'Issued Nov 2023' },
]

const SKILLS = [
  { name: 'JavaScript', endorsements: 28, note: 'Stripe · Vercel' },
  { name: 'TypeScript', endorsements: 24, note: 'Vercel' },
  // note resolved from the live badge count so it never overstates.
  { name: 'Distributed Systems', endorsements: 19, bountyVerified: true },
  { name: 'Data Structures & Algorithms', endorsements: 31, note: 'TA · CS 314' },
  { name: 'React', endorsements: 22, note: null },
  { name: 'System Design', endorsements: 14, note: null },
]

const PEOPLE = [
  { name: 'Aisha Nasser', sub: 'SWE Intern @ Stripe · UT Austin', color: '#635bff' },
  { name: 'Diego Ramos', sub: 'New Grad SWE @ Vercel', color: '#111111' },
  { name: 'Mei Lin', sub: 'CS @ UT Austin · ACM Officer', color: '#bf5700' },
  { name: 'Sam Okafor', sub: 'Recruiter @ LinkedIn', color: '#0a66c2' },
]

export default function ProfilePage({ badges = [], onNavigate }) {
  // Earned Bounty badges become verified certifications, gold-checked.
  const bountyCerts = badges.map(b => ({
    issuer: 'LinkedIn Bounty',
    company: b.company,
    color: b.companyColor,
    name: `${b.company} Bounty · ${b.title}`,
    meta: `${b.rank ? `Top 10 · #${b.rank}` : b.percentile} · Score ${b.score}/100`,
    verified: true,
  }))

  return (
    <div className="pf-page">
      <main className="pf-main">
        <ProfileHero onNavigate={onNavigate} />
        <AnalyticsCard />
        <AboutCard />
        <ActivityCard />
        <ExperienceCard />
        <EducationCard />
        <VerifiedChallengesCard badges={badges} />
        <LicensesCard bountyCerts={bountyCerts} onNavigate={onNavigate} />
        <SkillsCard bountyCount={badges.length} />
      </main>

      <aside className="pf-rail">
        <PublicProfileCard />
        <PeopleCard />
        <PromotedCard onNavigate={onNavigate} />
        <RailFooter />
      </aside>
    </div>
  )
}

/* ── Hero ── */
function ProfileHero({ onNavigate }) {
  return (
    <div className="card pf-hero">
      <div className="pf-cover">
        <CoverSkyline />
        <button className="pf-cover-edit" title="Edit cover"><IconCamera size={18} /></button>
      </div>

      <div className="pf-hero-body">
        <div className="pf-av-row">
          <div className="pf-av"><AvatarSilhouette size={152} /></div>
          <button className="pf-edit-btn" title="Edit profile"><IconPencil size={20} /></button>
        </div>

        <div className="pf-id-grid">
          <div className="pf-id-left">
            <div className="pf-name-row">
              <h1 className="pf-name">{PROFILE.name}</h1>
              <VerifiedBadge />
              <span className="pf-pronoun">(he/him)</span>
            </div>
            <p className="pf-headline">{PROFILE.headline}</p>
            <p className="pf-sub">
              {PROFILE.location} ·{' '}
              <span className="pf-link">Contact info</span>
            </p>
            <p className="pf-connections">
              <span className="pf-link">{PROFILE.connections} connections</span>
              <span className="pf-dot">·</span>
              <span className="pf-muted">{PROFILE.followers} followers</span>
            </p>

            <div className="pf-actions">
              <button className="pf-btn pf-btn-primary" onClick={() => onNavigate?.('bounty')}>Open to <IconChevronDown size={16} /></button>
              <button className="pf-btn pf-btn-outline">Add profile section</button>
              <button className="pf-btn pf-btn-outline"><IconSparkles size={16} /> Enhance profile</button>
              <button className="pf-btn pf-btn-ghost pf-btn-icon"><IconDots size={18} /></button>
            </div>
          </div>

          <div className="pf-id-right">
            <button className="pf-entity">
              <span className="pf-entity-logo" style={{ background: '#bf5700' }}><UTLogo /></span>
              <span className="pf-entity-name">The University of Texas at Austin</span>
            </button>
            <button className="pf-entity">
              <span className="pf-entity-logo" style={{ background: '#635bff' }}><StripeLogo /></span>
              <span className="pf-entity-name">Stripe</span>
            </button>
          </div>
        </div>

        <div className="pf-open-banner" onClick={() => onNavigate?.('bounty')}>
          <div className="pf-open-text">
            <strong>Open to work</strong>
            <span>Software Engineer roles · Show details</span>
          </div>
          <IconPencil size={16} color="#6b6b6b" />
        </div>
      </div>
    </div>
  )
}

function VerifiedBadge() {
  return (
    <span className="pf-verified" title="Verified">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.5l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.7 2.6.7 2.6-2.3 1.4-1 2.5-2.7-.2L12 21.5l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.7-2.6-.7-2.6 2.3-1.4 1-2.5 2.7.2L12 2.5z" fill="#0a66c2"/>
        <path d="M8.5 12l2.2 2.2 4.8-4.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

/* ── Analytics ── */
function AnalyticsCard() {
  const stats = [
    { Icon: IconEye, num: '290', lbl: 'profile views', sub: 'Discover who\'s viewed your profile.' },
    { Icon: IconChartBar, num: '81', lbl: 'post impressions', sub: 'Check out who\'s engaging with your posts.' },
    { Icon: IconBriefcase, num: '47', lbl: 'search appearances', sub: 'See how often you show up in search.' },
  ]
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <div>
          <h2 className="pf-sec-title">Analytics</h2>
          <p className="pf-sec-note"><IconEye size={14} /> Private to you</p>
        </div>
      </div>
      <div className="pf-analytics-grid">
        {stats.map(({ Icon, num, lbl, sub }) => (
          <div className="pf-analytic" key={lbl}>
            <span className="pf-analytic-ico"><Icon size={20} /></span>
            <div>
              <div className="pf-analytic-num"><strong>{num}</strong> {lbl}</div>
              <div className="pf-analytic-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="pf-show-all">Show all analytics <IconChevronRight size={16} /></button>
    </div>
  )
}

/* ── About ── */
function AboutCard() {
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <h2 className="pf-sec-title">About</h2>
        <HdrActions />
      </div>
      <p className="pf-about-text">{PROFILE.about}</p>
    </div>
  )
}

/* ── Activity ── */
function ActivityCard() {
  const posts = [
    {
      text: 'Just cleared the Google "PageSpeed Report Card Tool" bounty (scored 94, Top 8%) and earned a verified badge. Proof-of-work > another line on a resume. The badge is now on my profile. 🔵',
      meta: 'Panav posted this · 2d',
      reactions: '212',
      comments: '34 comments',
    },
    {
      text: 'Hot take: most coding interviews test typing speed under stress, not engineering judgment. Bounties grade the work itself — and AI is allowed. That\'s the right bar.',
      meta: 'Panav posted this · 1w',
      reactions: '486',
      comments: '91 comments',
    },
  ]
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <div>
          <h2 className="pf-sec-title">Activity</h2>
          <p className="pf-sec-note pf-link-blue">{PROFILE.followers} followers</p>
        </div>
        <div className="pf-hdr-actions">
          <button className="pf-pill-btn">Create a post</button>
          <button className="pf-icon-btn" title="Edit"><IconPencil size={18} /></button>
        </div>
      </div>

      <div className="pf-activity-tabs">
        {['Posts', 'Comments', 'Images'].map((t, i) => (
          <button key={t} className={`pf-tab${i === 0 ? ' active' : ''}`}>{t}</button>
        ))}
      </div>

      {posts.map((p, i) => (
        <div className="pf-activity-post" key={i}>
          <div className="pf-act-meta">{p.meta}</div>
          <p className="pf-act-text">{p.text}</p>
          <div className="pf-act-foot">
            <span className="pf-act-react">👍❤️🎯 {p.reactions}</span>
            <span className="pf-dot">·</span>
            <span>{p.comments}</span>
          </div>
        </div>
      ))}

      <button className="pf-show-all">Show all activity <IconChevronRight size={16} /></button>
    </div>
  )
}

/* ── Experience ── */
function ExperienceCard() {
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <h2 className="pf-sec-title">Experience</h2>
        <HdrActions />
      </div>
      <div className="pf-entries">
        {EXPERIENCE.map((e, i) => (
          <div className="pf-entry" key={i}>
            <span className="pf-entry-logo" style={{ background: e.color }}>{e.logo}</span>
            <div className="pf-entry-body">
              <div className="pf-entry-role">{e.role}</div>
              <div className="pf-entry-org">{e.company}</div>
              <div className="pf-entry-dates">{e.dates}</div>
              <div className="pf-entry-place">{e.place}</div>
              <ul className="pf-entry-bullets">
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
              {e.skills && (
                <div className="pf-entry-skills">
                  <IconStar size={14} color={GOLD} />
                  <span><strong>Skills:</strong> {e.skills.join(' · ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Education ── */
function EducationCard() {
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <h2 className="pf-sec-title">Education</h2>
        <HdrActions />
      </div>
      <div className="pf-entries">
        {EDUCATION.map((e, i) => (
          <div className="pf-entry" key={i}>
            <span className="pf-entry-logo" style={{ background: e.color }}>{e.logo}</span>
            <div className="pf-entry-body">
              <div className="pf-entry-role">{e.name}</div>
              <div className="pf-entry-org">{e.degree}</div>
              <div className="pf-entry-dates">{e.dates}</div>
              <p className="pf-entry-detail">{e.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Licenses & certifications (Bounty badges land here) ── */
function LicensesCard({ bountyCerts, onNavigate }) {
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <h2 className="pf-sec-title">Licenses &amp; certifications</h2>
        <HdrActions />
      </div>

      <div className="pf-entries">
        {bountyCerts.map((c, i) => (
          <div className="pf-entry" key={`b-${i}`}>
            <span className="pf-entry-logo" style={{ background: companyLogoBg(c.company, c.color) }}><CompanyGlyph company={c.company} /></span>
            <div className="pf-entry-body">
              <div className="pf-entry-role pf-cert-name">
                {c.name}
                <IconShieldCheck size={15} color={GOLD} />
              </div>
              <div className="pf-entry-org">{c.issuer}</div>
              <div className="pf-entry-dates">{c.meta}</div>
              <button className="pf-cred-btn" onClick={() => onNavigate?.('bounty')}>
                Show credential <IconShieldCheck size={14} />
              </button>
            </div>
          </div>
        ))}

        {STATIC_CERTS.map((c, i) => (
          <div className="pf-entry" key={`s-${i}`}>
            <span className="pf-entry-logo" style={{ background: c.color }}>
              {c.glyph === 'aws' ? <AwsGlyph /> : c.glyph}
            </span>
            <div className="pf-entry-body">
              <div className="pf-entry-role">{c.name}</div>
              <div className="pf-entry-org">{c.issuer}</div>
              <div className="pf-entry-dates">{c.meta}</div>
              <button className="pf-cred-btn">Show credential <IconWorld size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {bountyCerts.length > 0 && (
        <div className="pf-cert-foot">
          <IconShieldCheck size={14} color={GOLD} />
          Verified proof-of-work, earned on LinkedIn Bounty
        </div>
      )}
    </div>
  )
}

/* ── Skills ── */
function SkillsCard({ bountyCount = 0 }) {
  // Resolve the bounty-verified note from the live badge count so it never overstates.
  const bountyNote = bountyCount > 0
    ? `Verified by ${bountyCount} Bounty challenge${bountyCount === 1 ? '' : 's'}`
    : null
  return (
    <div className="card pf-card">
      <div className="pf-sec-hdr">
        <h2 className="pf-sec-title">Skills</h2>
        <HdrActions />
      </div>
      <div className="pf-skills">
        {SKILLS.map((s) => {
          const note = s.bountyVerified ? bountyNote : s.note
          return (
          <div className="pf-skill" key={s.name}>
            <div className="pf-skill-top">
              <span className="pf-skill-name">{s.name}</span>
              {note && <span className="pf-skill-note">{note}</span>}
            </div>
            <div className="pf-skill-end">
              <IconShieldCheck size={14} color="#6b6b6b" />
              {s.endorsements} endorsements
            </div>
          </div>
          )
        })}
      </div>
      <button className="pf-show-all">Show all 18 skills <IconChevronRight size={16} /></button>
    </div>
  )
}

/* ── Right rail ── */
function PublicProfileCard() {
  return (
    <div className="card pf-rail-card">
      <div className="pf-rail-hdr">
        <span>Public profile &amp; URL</span>
        <button className="pf-icon-btn" title="Edit"><IconPencil size={16} /></button>
      </div>
      <a className="pf-rail-url">www.linkedin.com/in/panav-mhatre</a>
    </div>
  )
}

function PeopleCard() {
  return (
    <div className="card pf-rail-card">
      <div className="pf-rail-title">People you may know</div>
      <div className="pf-rail-sub">From your school and internships</div>
      {PEOPLE.map((p) => (
        <div className="pf-person" key={p.name}>
          <span className="pf-person-av" style={{ background: p.color }}>{initials(p.name)}</span>
          <div className="pf-person-info">
            <div className="pf-person-name">{p.name}</div>
            <div className="pf-person-sub">{p.sub}</div>
            <button className="pf-connect-btn"><IconUserPlus size={15} /> Connect</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function PromotedCard({ onNavigate }) {
  return (
    <div className="card pf-rail-card pf-promo" onClick={() => onNavigate?.('bounty')}>
      <div className="pf-promo-label">Promoted</div>
      <div className="pf-promo-body">
        <span className="pf-promo-ico"><IconShieldCheck size={22} /></span>
        <p className="pf-promo-text">
          Turn your skills into <strong>verified badges</strong> recruiters can trust. Clear a company bounty today.
        </p>
      </div>
      <button className="pf-promo-btn">Browse bounties <IconChevronRight size={15} /></button>
    </div>
  )
}

function RailFooter() {
  const links = ['About', 'Accessibility', 'Help Center', 'Privacy & Terms', 'Ad Choices', 'Advertising', 'Business Services', 'Get the LinkedIn app', 'More']
  return (
    <div className="pf-rail-footer">
      <div className="pf-foot-links">
        {links.map(l => <span key={l} className="pf-foot-link">{l}</span>)}
      </div>
      <div className="pf-foot-brand">
        <span className="pf-foot-logo">in</span>
        <span>LinkedIn Corporation © 2026</span>
      </div>
    </div>
  )
}

/* ── Shared bits ── */
function HdrActions() {
  return (
    <div className="pf-hdr-actions">
      <button className="pf-icon-btn" title="Add"><IconPlus size={20} /></button>
      <button className="pf-icon-btn" title="Edit"><IconPencil size={18} /></button>
    </div>
  )
}

function CompanyGlyph({ company }) {
  if (company === 'Vercel')   return <VercelLogo />
  if (company === 'Stripe')   return <StripeLogo />
  if (company === 'LinkedIn') return <LinkedInLogo />
  if (company === 'Google')   return <GoogleLogo />
  if (company === 'Canva')    return <CanvaLogo />
  if (company === 'Fidelity') return <FidelityLogo />
  return <span style={{ fontWeight: 800 }}>{company?.[0] ?? '?'}</span>
}

function companyLogoBg(company, fallback) {
  return company === 'Google' ? '#fff' : fallback
}

function initials(name) {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

/* ── Visual assets ── */
function AvatarSilhouette({ size = 152 }) {
  return (
    <svg viewBox="0 0 76 76" width={size} height={size}>
      <circle cx="38" cy="38" r="38" fill="#2d6a9f" />
      <circle cx="38" cy="30" r="14" fill="#a8c8e8" />
      <ellipse cx="38" cy="62" rx="22" ry="14" fill="#a8c8e8" />
    </svg>
  )
}

function CoverSkyline() {
  return (
    <svg className="pf-cover-svg" viewBox="0 0 250 68" preserveAspectRatio="xMidYMid slice">
      <rect width="250" height="68" fill="#0f2744" />
      {[[18,8],[45,5],[72,12],[110,4],[148,9],[185,6],[220,11],[235,3]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.7)" />
      ))}
      <rect x="0" y="28" width="28" height="40" fill="#1a3a5c"/>
      <rect x="20" y="18" width="18" height="50" fill="#1a3a5c"/>
      <rect x="36" y="24" width="22" height="44" fill="#1a3a5c"/>
      <rect x="56" y="14" width="16" height="54" fill="#1a3a5c"/>
      <rect x="70" y="22" width="30" height="46" fill="#1a3a5c"/>
      <rect x="98" y="10" width="20" height="58" fill="#1a3a5c"/>
      <rect x="116" y="20" width="24" height="48" fill="#1a3a5c"/>
      <rect x="138" y="16" width="18" height="52" fill="#1a3a5c"/>
      <rect x="154" y="26" width="26" height="42" fill="#1a3a5c"/>
      <rect x="178" y="12" width="20" height="56" fill="#1a3a5c"/>
      <rect x="196" y="22" width="16" height="46" fill="#1a3a5c"/>
      <rect x="210" y="18" width="22" height="50" fill="#1a3a5c"/>
      <rect x="230" y="30" width="20" height="38" fill="#1a3a5c"/>
      {[[25,22],[25,30],[60,18],[60,26],[102,14],[102,22],[102,30],[120,24],[142,20],[142,28],[182,16],[182,24],[214,22],[214,30]].map(([x,y],i)=>(
        <rect key={`w${i}`} x={x} y={y} width="4" height="3" rx="0.5" fill="rgba(255,220,100,0.6)" />
      ))}
      <rect x="0" y="42" width="32" height="26" fill="#0d1f35"/>
      <rect x="30" y="36" width="20" height="32" fill="#0d1f35"/>
      <rect x="48" y="40" width="28" height="28" fill="#0d1f35"/>
      <rect x="74" y="32" width="22" height="36" fill="#0d1f35"/>
      <rect x="94" y="38" width="18" height="30" fill="#0d1f35"/>
      <rect x="110" y="30" width="26" height="38" fill="#0d1f35"/>
      <rect x="134" y="36" width="20" height="32" fill="#0d1f35"/>
      <rect x="152" y="40" width="24" height="28" fill="#0d1f35"/>
      <rect x="174" y="34" width="18" height="34" fill="#0d1f35"/>
      <rect x="190" y="42" width="22" height="26" fill="#0d1f35"/>
      <rect x="210" y="38" width="20" height="30" fill="#0d1f35"/>
      <rect x="228" y="44" width="22" height="24" fill="#0d1f35"/>
    </svg>
  )
}

function StripeLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
    </svg>
  )
}
function VercelLogo() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l9 16H3L12 4z" /></svg>
}
function LinkedInLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
      <path d="M6.94 5a2 2 0 11-4 0 2 2 0 014 0zM7 8.48H3V21h4V8.48zM13.32 8.48H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.95c0-6.27-7.06-6.04-8.68-2.96v-1.61z"/>
    </svg>
  )
}
function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.35-1.04 2.5-2.21 3.26v2.71h3.57c2.08-1.92 3.28-4.74 3.28-8z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.07c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z" fill="#EA4335"/>
    </svg>
  )
}
function CanvaLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40">
      <path d="M20 3C10.6 3 3 10.6 3 20s7.6 17 17 17 17-7.6 17-17S29.4 3 20 3zm5.3 24.4c-1.4.9-3 1.4-4.8 1.4-5 0-8.7-3.7-8.7-8.8 0-5.2 3.8-9 9-9 1.6 0 3.1.4 4.3 1.2.3.2.4.5.2.8l-1.3 2c-.2.3-.5.4-.8.2-.7-.4-1.5-.7-2.4-.7-2.8 0-4.8 2.1-4.8 5.4 0 3.2 1.9 5.3 4.7 5.3 1 0 1.9-.3 2.7-.8.3-.2.6-.1.8.2l1.3 2c.2.3.1.6-.2.8z" fill="#fff"/>
    </svg>
  )
}
function FidelityLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
      <path d="M4 4h16v2.5H9v4h9v2.5H9V20H6V6.5H4V4z"/>
    </svg>
  )
}
function UTLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="Georgia,serif" fill="#fff">UT</text>
    </svg>
  )
}
function AwsGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="900" fontFamily="Arial,sans-serif" fill="#232f3e">aws</text>
    </svg>
  )
}
