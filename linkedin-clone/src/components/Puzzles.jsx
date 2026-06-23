import { useState } from 'react'
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react'

const PUZZLES = [
  {
    name: 'Patches #98', sub: '64 connections played',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#fff" rx="7"/>
        <rect x="3" y="3" width="15" height="15" rx="2" fill="#0077b6"/>
        <rect x="22" y="3" width="15" height="15" rx="2" fill="#333"/>
        <rect x="3" y="22" width="15" height="15" rx="2" fill="#6b6b6b"/>
        <rect x="22" y="22" width="15" height="15" rx="2" fill="#c8c8c8"/>
      </svg>
    ),
  },
  {
    name: 'Zip #463', sub: '83 connections played',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#0077b6" rx="7"/>
        <polyline points="20,7 13,19 20,17 20,33 27,21 20,23" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Mini Sudoku #316', sub: '27 connections played',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#333" rx="7"/>
        <rect x="4" y="4" width="14" height="14" rx="2" fill="rgba(255,255,255,0.92)"/>
        <rect x="22" y="4" width="14" height="14" rx="2" fill="rgba(255,255,255,0.92)"/>
        <rect x="4" y="22" width="14" height="14" rx="2" fill="rgba(255,255,255,0.92)"/>
        <rect x="22" y="22" width="14" height="14" rx="2" fill="rgba(255,255,255,0.92)"/>
      </svg>
    ),
  },
  {
    name: 'Tango #624', sub: '39 connections played',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#6b6b6b" rx="7"/>
        <rect x="3" y="3" width="34" height="15" rx="2" fill="rgba(255,255,255,0.92)"/>
        <rect x="3" y="22" width="34" height="15" rx="2" fill="rgba(255,255,255,0.32)"/>
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
