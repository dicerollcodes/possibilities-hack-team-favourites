import { useState } from 'react'
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react'

const PUZZLES = [
  {
    name: 'Patches #98', sub: '64 connections played',
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#1a73e8" rx="7"/>
        <rect x="3" y="3" width="15" height="15" rx="2" fill="#fbbc04"/>
        <rect x="22" y="3" width="15" height="15" rx="2" fill="#ea4335"/>
        <rect x="3" y="22" width="15" height="15" rx="2" fill="#34a853"/>
        <rect x="22" y="22" width="15" height="15" rx="2" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Zip #463', sub: '83 connections played',
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#f97316" rx="7"/>
        <polygon points="20,6 24,16 35,16 26,23 29,34 20,27 11,34 14,23 5,16 16,16" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Mini Sudoku #316', sub: '27 connections played',
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#0d9488" rx="7"/>
        <rect x="4" y="4" width="14" height="14" rx="2" fill="rgba(255,255,255,0.95)"/>
        <rect x="22" y="4" width="14" height="14" rx="2" fill="rgba(255,255,255,0.45)"/>
        <rect x="4" y="22" width="14" height="14" rx="2" fill="rgba(255,255,255,0.45)"/>
        <rect x="22" y="22" width="14" height="14" rx="2" fill="rgba(255,255,255,0.95)"/>
      </svg>
    ),
  },
  {
    name: 'Tango #624', sub: '39 connections played',
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#7c3aed" rx="7"/>
        <circle cx="20" cy="12" r="7" fill="#fff"/>
        <circle cx="20" cy="12" r="3.5" fill="#7c3aed"/>
        <rect x="4" y="24" width="32" height="5" rx="2.5" fill="rgba(255,255,255,0.9)"/>
        <rect x="4" y="32" width="20" height="4" rx="2" fill="rgba(255,255,255,0.45)"/>
      </svg>
    ),
  },
]

export default function Puzzles() {
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? PUZZLES : PUZZLES.slice(0, 4)

  return (
    <div className="card">
      <div className="puzzle-hdr">Today's puzzles</div>

      {items.map(({ name, sub, icon }) => (
        <button className="puz-item" key={name}>
          <div className="puz-ico">{icon}</div>
          <div className="puz-info">
            <div className="puz-nm">{name}</div>
            <div className="puz-sub">{sub}</div>
          </div>
          <IconChevronRight size={20} color="rgba(0,0,0,0.4)" />
        </button>
      ))}

      <button className="show-more-btn" onClick={() => setExpanded(e => !e)}>
        {expanded ? 'Show less' : 'Show more'}
        <IconChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
    </div>
  )
}
