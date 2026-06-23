import { IconChevronDown, IconBookmark, IconLayoutGrid, IconNews, IconCalendarEvent, IconSpeakerphone } from '@tabler/icons-react'

function BountyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
      <circle cx="10" cy="10" r="9" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" fill="none"/>
      <path d="M10 4L11.8 7.6L15.8 8.2L12.9 11L13.6 15L10 13.1L6.4 15L7.1 11L4.2 8.2L8.2 7.6L10 4Z" fill="rgba(0,0,0,0.6)"/>
    </svg>
  )
}

const PAGES = [
  { initials: 'B',    bg: '#0077b6', name: 'Beacon of Hope' },
  { initials: 'SRP',  bg: '#333',    name: 'Spot Robotics Podcast', small: true },
  { initials: '</>', bg: '#6b6b6b', name: 'Tech Thinkers', small: true },
]

const NAV_LINKS = [
  { Icon: IconBookmark,    label: 'Saved items',  page: null },
  { Icon: IconLayoutGrid,  label: 'Groups',       page: null },
  { Icon: IconNews,        label: 'Newsletters',  page: null },
  { Icon: IconCalendarEvent, label: 'Events',     page: null },
  { Icon: BountyIcon,       label: 'Bounty',      page: 'bounty' },
]

export default function MyPagesCard({ onNavigate, currentPage }) {
  return (
    <div className="card">
      <div className="pages-hdr">
        <span>My pages (3)</span>
        <IconChevronDown size={16} color="rgba(0,0,0,0.45)" />
      </div>

      {PAGES.map(({ initials, bg, name, small }) => (
        <div className="page-row" key={name}>
          <div className="page-inner">
            <div className="page-ico" style={{ background: bg, fontSize: small ? 9 : 13 }}>
              {initials}
            </div>
            <span className="page-nm">{name}</span>
          </div>
          <div className="page-act">
            <span>Activity</span>
            <span>0</span>
          </div>
        </div>
      ))}

      <div className="grow-sec">
        <p className="grow-lbl">Grow your business faster</p>
        <div className="grow-row">
          <StarIcon />
          Try Premium Page
        </div>
        <div className="grow-row">
          <IconSpeakerphone size={16} color="rgba(0,0,0,0.55)" />
          Advertise on LinkedIn
        </div>
      </div>

      <div className="nav-sec">
        {NAV_LINKS.map(({ Icon, label, page }) => (
          <button
            className={`nav-sec-item${currentPage === page && page ? ' nav-sec-item-active' : ''}`}
            key={label}
            onClick={() => page && onNavigate(currentPage === page ? 'home' : page)}
          >
            <Icon size={20} color={currentPage === page && page ? '#0a66c2' : 'rgba(0,0,0,0.6)'} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
      <path d="M8 1L9.8 5.6L14.7 6L11.1 9.1L12.2 14L8 11.5L3.8 14L4.9 9.1L1.3 6L6.2 5.6L8 1Z" fill="#0077b6"/>
    </svg>
  )
}
