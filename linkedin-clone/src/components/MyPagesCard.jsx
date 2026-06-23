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
  { initials: 'B',    bg: '#f4a020', name: 'Beacon of Hope' },
  { initials: 'SRP',  bg: '#2e6da4', name: 'Spot Robotics Podcast', small: true },
  { initials: '</>', bg: '#1a1a2e', name: 'Tech Thinkers', small: true },
]

const NAV_LINKS = [
  { Icon: IconBookmark,    label: 'Saved items' },
  { Icon: IconLayoutGrid,  label: 'Groups' },
  { Icon: IconNews,        label: 'Newsletters' },
  { Icon: IconCalendarEvent, label: 'Events' },
  { Icon: BountyIcon,       label: 'Bounty' },
]

export default function MyPagesCard() {
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
        {NAV_LINKS.map(({ Icon, label }) => (
          <button className="nav-sec-item" key={label}>
            <Icon size={20} color="rgba(0,0,0,0.6)" />
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
      <path d="M8 1L9.8 5.6L14.7 6L11.1 9.1L12.2 14L8 11.5L3.8 14L4.9 9.1L1.3 6L6.2 5.6L8 1Z" fill="#915907"/>
    </svg>
  )
}
