import { useState } from 'react'
import {
  IconHome, IconUsers, IconBriefcase, IconMessage2, IconBell,
  IconSearch, IconGridDots, IconBook, IconChevronDown
} from '@tabler/icons-react'

// Nav ids that map to a real page in App.jsx. Bounties lives in the left
// sidebar (MyPagesCard), not the top nav.
const PAGE_NAV = { home: 'home', me: 'profile' }

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',          Icon: IconHome },
  { id: 'network',  label: 'My Network',    Icon: IconUsers },
  { id: 'jobs',     label: 'Jobs',          Icon: IconBriefcase },
  { id: 'messages', label: 'Messaging',     Icon: IconMessage2, badge: 2 },
  { id: 'notifs',   label: 'Notifications', Icon: IconBell },
]

export default function Navbar({ onNavigate, currentPage }) {
  const [active, setActive] = useState('home')

  function handleNav(id) {
    setActive(id)
    if (onNavigate && PAGE_NAV[id]) onNavigate(PAGE_NAV[id])
  }

  // Page-nav items follow the current page; decorative items only light up on home.
  function isActive(id) {
    if (PAGE_NAV[id]) return currentPage === PAGE_NAV[id]
    return active === id && currentPage === 'home'
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <div className="nav-logo">in</div>
          <div className="nav-search">
            <IconSearch size={16} color="#6b6b6b" />
            <span>I'm looking for...</span>
          </div>
        </div>

        <div className="nav-center">
          {NAV_ITEMS.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              className={`nav-item${isActive(id) ? ' active' : ''}`}
              onClick={() => handleNav(id)}
            >
              <div className="nav-item-icon">
                <Icon size={22} />
                {badge && <span className="nav-badge">{badge}</span>}
              </div>
              <span>{label}</span>
            </button>
          ))}

          <button
            className={`nav-item nav-item-me${isActive('me') ? ' active' : ''}`}
            onClick={() => handleNav('me')}
          >
            <div className="nav-avatar-sm">PM</div>
            <span className="nav-me-label">
              Me <IconChevronDown size={12} />
            </span>
          </button>
        </div>

        <div className="nav-right">
          <div className="nav-divider" />
          <button className="nav-item-r">
            <IconGridDots size={22} />
            <span className="nav-me-label">
              For Business <IconChevronDown size={11} />
            </span>
          </button>
          <button className="nav-item-r">
            <IconBook size={22} />
            <span>Learning</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
