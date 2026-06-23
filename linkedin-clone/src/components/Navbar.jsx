import { useState } from 'react'
import {
  IconHome, IconUsers, IconBriefcase, IconMessage2, IconBell,
  IconSearch, IconGridDots, IconBook, IconChevronDown
} from '@tabler/icons-react'

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',        Icon: IconHome },
  { id: 'network',  label: 'My Network',  Icon: IconUsers },
  { id: 'jobs',     label: 'Jobs',        Icon: IconBriefcase },
  { id: 'messages', label: 'Messaging',   Icon: IconMessage2,  badge: 2 },
  { id: 'notifs',   label: 'Notifications', Icon: IconBell },
]

export default function Navbar() {
  const [active, setActive] = useState('home')

  return (
    <nav className="nav">
      <div className="nav-left">
        <div className="nav-logo">in</div>
        <div className="nav-search">
          <IconSearch size={16} color="rgba(0,0,0,0.5)" />
          <span>I'm looking for...</span>
        </div>
      </div>

      <div className="nav-center">
        {NAV_ITEMS.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            className={`nav-item${active === id ? ' active' : ''}`}
            onClick={() => setActive(id)}
          >
            <div className="nav-item-icon">
              <Icon size={22} />
              {badge && <span className="nav-badge">{badge}</span>}
            </div>
            <span>{label}</span>
          </button>
        ))}

        <button
          className={`nav-item nav-item-me${active === 'me' ? ' active' : ''}`}
          onClick={() => setActive('me')}
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
    </nav>
  )
}
