import { useState } from 'react'
import { IconInfoCircle, IconChevronDown } from '@tabler/icons-react'

const ALL_NEWS = [
  { headline: 'Prime Day spending expected to soar ...', meta: '49m ago · 6,632 readers' },
  { headline: 'Oracle cut 21K jobs over the past year ...', meta: '49m ago · 4,628 readers' },
  { headline: 'Meta unveils new smart glasses, ...', meta: '49m ago · 2,197 readers' },
  { headline: 'Most US consumers now prefer buying...', meta: '40m ago · 1,903 readers' },
  { headline: 'Tech selloff pressures Nasdaq, S&P 50...', meta: '40m ago · 559 readers' },
  { headline: 'AI reshapes the PM role in 2025', meta: '1h ago · 3,841 readers' },
  { headline: 'Remote work policies continue tightening', meta: '2h ago · 2,104 readers' },
]

export default function LinkedInNews() {
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? ALL_NEWS : ALL_NEWS.slice(0, 5)

  return (
    <div className="card news-card">
      <div className="news-hdr">
        <span className="news-ttl">LinkedIn News</span>
        <IconInfoCircle size={18} color="rgba(0,0,0,0.5)" style={{ cursor: 'pointer' }} />
      </div>

      <div className="news-sec-lbl">Top stories</div>

      {items.map(({ headline, meta }) => (
        <div className="news-item" key={headline}>
          <div className="news-hl">{headline}</div>
          <div className="news-meta">{meta}</div>
        </div>
      ))}

      <button className="show-more-btn" onClick={() => setExpanded(e => !e)}>
        {expanded ? 'Show less' : 'Show more news'}
        <IconChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
    </div>
  )
}
