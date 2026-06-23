const BARS = [20,30,16,44,26,54,34,60,28,50,18,46,14,40,22]

export default function ProfileCard() {
  return (
    <div className="card profile-card">
      {/* Cover */}
      <div className="prof-cover">
        <svg className="cover-bars" viewBox="0 0 250 68" preserveAspectRatio="none">
          {BARS.map((h, i) => (
            <rect
              key={i}
              x={8 + i * 16}
              y={68 - h}
              width={12}
              height={h}
              rx={2}
              fill="rgba(120,160,220,0.55)"
            />
          ))}
        </svg>
        <span className="prem-badge">Premium</span>
      </div>

      {/* Avatar — negative margin overlaps cover */}
      <div className="prof-av-wrap">
        <div className="prof-av">PM</div>
      </div>

      {/* Info */}
      <div className="prof-texts">
        <div className="prof-name-row">
          <span className="prof-name">Panav Mhatre</span>
          <span className="in-bdg">in</span>
        </div>
        <p className="prof-hl">CS @ UT Austin</p>
        <p className="prof-loc">Austin, Texas Metropolitan Area</p>
      </div>

      <div className="prof-school-row">
        <span className="school-ico">S</span>
        <span className="prof-school-nm">Stanford University</span>
      </div>

      <div className="divider" />

      <div className="p-stat">
        <span className="p-stat-lbl">Profile viewers</span>
        <span className="p-stat-val">290</span>
      </div>
      <div className="p-stat">
        <span className="p-stat-lbl">Post impressions</span>
        <span className="p-stat-val">81</span>
      </div>

      <div className="prem-row">
        <StarIcon />
        Your Premium features
      </div>
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
      <path d="M8 1L9.8 5.6L14.7 6L11.1 9.1L12.2 14L8 11.5L3.8 14L4.9 9.1L1.3 6L6.2 5.6L8 1Z" fill="#0077b6"/>
    </svg>
  )
}
