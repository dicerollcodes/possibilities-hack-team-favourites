import { IconDots, IconRosetteDiscountCheck } from '@tabler/icons-react'
import PostActions from './PostActions'

export default function PromotedPost() {
  return (
    <div className="card post-card" style={{ overflow: 'hidden' }}>
      <div className="post-hdr">
        <div className="promo-logo">
          <AlertFlowLogo />
        </div>
        <div className="post-info">
          <div className="post-nm-row">
            <span className="post-nm">AlertFlow</span>
            <IconRosetteDiscountCheck size={16} color="#0a66c2" />
          </div>
          <div className="post-ttl">23,646 followers</div>
          <div className="post-ttl" style={{ color: 'rgba(0,0,0,0.45)' }}>Promoted</div>
        </div>
        <button className="icon-btn"><IconDots size={20} /></button>
      </div>

      <div className="post-body" style={{ paddingBottom: 12 }}>
        Opsgenie is ending. Keep the on-call workflows your team knows, then
        route every alert to the right engineer with AlertFlow IMR.
      </div>

      <div className="promo-img">
        <div className="promo-grid" />
        <div className="promo-corner promo-corner-tl">4</div>
        <div className="promo-corner promo-corner-tr">5</div>
        <div className="promo-deadline">THE DEADLINE</div>
        <div className="promo-big-text">
          Opsgenie<br />
          <span className="promo-ends">ends</span>
        </div>
        <div className="promo-date">April 5, 2027</div>
      </div>

      <div className="post-reacts" style={{ marginTop: 0, borderTop: 'none' }}>
        <div className="remojis">
          <div className="remoji" style={{ background: '#0a66c2' }}>👍</div>
          <span style={{ marginLeft: 6 }}>142</span>
        </div>
        <span>18 comments · 5 reposts</span>
      </div>

      <PostActions />
    </div>
  )
}

function AlertFlowLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30">
      <path d="M7 7L23 7L19 15L23 23L7 23L11 15Z" fill="#a855f7" />
      <path d="M7 7L15 15L7 23Z" fill="#7c3aed" />
    </svg>
  )
}
