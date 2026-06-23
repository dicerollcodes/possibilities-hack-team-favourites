import { useState } from 'react'
import { IconDots, IconX, IconWorld } from '@tabler/icons-react'
import PostActions from './PostActions'

export default function AcquisitionPost() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="card post-card">
      <div className="post-hdr">
        <div className="post-av" style={{ background: '#7a6248' }}>NR</div>
        <div className="post-info">
          <div className="post-nm-row">
            <span className="post-nm">Nelson Ray</span>
            <span className="in-bdg" style={{ fontSize: 8 }}>in</span>
            <span className="conn-deg">· 1st</span>
          </div>
          <div className="post-ttl">Business Growth Strategist</div>
          <div className="post-meta">
            2h · Edited · <IconWorld size={12} />
          </div>
        </div>
        <div className="post-top-btns">
          <button className="icon-btn"><IconDots size={20} /></button>
          <button className="icon-btn" onClick={() => setVisible(false)}><IconX size={20} /></button>
        </div>
      </div>

      <div className="post-body">
        OFFICIAL STATEMENT: VaultPath has not been acquired by{' '}
        <span className="post-link">Nexion Systems</span>. We are not merging.
        No one is buying us. We still answer to no one but our customers — and
        apparently the comment section of a…{' '}
        <span className="see-more">more</span>
      </div>

      <h2 className="post-headline">Nexion Systems Acquires VaultPath to Enhance</h2>
      <p className="post-subline">VaultPath acquired by Nexion Systems</p>

      <div className="post-tags">
        {['Acquisition', 'Government Administration', '🇺🇸 US'].map(t => (
          <span key={t} className="post-tag">{t}</span>
        ))}
      </div>

      <div className="acq-banner">
        <div className="acq-bi">VP</div>
        <div style={{ flex: 1 }}>
          <div className="acq-banner-title">Get the full VaultPath company profile</div>
          <div className="acq-banner-sub">Access contacts, investors, buying signals & more</div>
        </div>
        <button className="acq-banner-btn">Open in Dashboard →</button>
      </div>

      <div className="acq-diagram">
        <AcqCompany
          label="ACQUIRED" labelColor="#ff6b35"
          logo={<TriangleLogo />}
          name="VaultPath"
          sub1="🇺🇸 United States"
          sub2="Government Administration"
        />
        <div className="acq-arrow-col">
          <div>Undisclosed amount</div>
          <div className="acq-arrow">→</div>
          <div>February 18, 2026</div>
        </div>
        <AcqCompany
          label="ACQUIRER" labelColor="rgba(0,0,0,0.5)"
          logo={<CrossLogo />}
          name="Nexion Systems"
          sub1="Technology, Information and Media"
        />
      </div>

      <div className="post-reacts">
        <div className="remojis">
          {['#0a66c2','#44b700','#e06c2f'].map((bg, i) => (
            <div key={i} className="remoji" style={{ background: bg, zIndex: 3 - i }}>
              {['👍','🔗','❤️'][i]}
            </div>
          ))}
          <span style={{ marginLeft: 8 }}>51</span>
        </div>
        <span>3 reposts</span>
      </div>

      <PostActions />
    </div>
  )
}

function AcqCompany({ label, labelColor, logo, name, sub1, sub2 }) {
  return (
    <div className="acq-co">
      <div className="acq-label" style={{ color: labelColor }}>{label}</div>
      <div className="acq-logo-circle">{logo}</div>
      <div className="acq-co-name">{name}</div>
      {sub1 && <div className="acq-co-sub">{sub1}</div>}
      {sub2 && <div className="acq-co-sub">{sub2}</div>}
    </div>
  )
}

function TriangleLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <path d="M17 4L28 24H6L17 4Z" fill="#fff" />
      <rect x="11" y="21" width="12" height="9" rx="1" fill="rgba(255,255,255,0.6)" />
    </svg>
  )
}

function CrossLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="10" fill="none" stroke="#fff" strokeWidth="2.5" />
      <line x1="17" y1="7" x2="17" y2="27" stroke="#fff" strokeWidth="2.5" />
      <line x1="7" y1="17" x2="27" y2="17" stroke="#fff" strokeWidth="2.5" />
    </svg>
  )
}
