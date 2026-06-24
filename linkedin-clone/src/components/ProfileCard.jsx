export default function ProfileCard({ onNavigate }) {
  return (
    <div className="card profile-card">
      {/* Cover — city skyline */}
      <div className="prof-cover">
        <svg className="cover-bars" viewBox="0 0 250 68" preserveAspectRatio="xMidYMid slice">
          {/* Sky */}
          <rect width="250" height="68" fill="#0f2744"/>
          {/* Stars */}
          {[[18,8],[45,5],[72,12],[110,4],[148,9],[185,6],[220,11],[235,3]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="1" fill="rgba(255,255,255,0.7)"/>
          ))}
          {/* Back buildings */}
          <rect x="0"   y="28" width="28" height="40" fill="#1a3a5c"/>
          <rect x="20"  y="18" width="18" height="50" fill="#1a3a5c"/>
          <rect x="36"  y="24" width="22" height="44" fill="#1a3a5c"/>
          <rect x="56"  y="14" width="16" height="54" fill="#1a3a5c"/>
          <rect x="70"  y="22" width="30" height="46" fill="#1a3a5c"/>
          <rect x="98"  y="10" width="20" height="58" fill="#1a3a5c"/>
          <rect x="116" y="20" width="24" height="48" fill="#1a3a5c"/>
          <rect x="138" y="16" width="18" height="52" fill="#1a3a5c"/>
          <rect x="154" y="26" width="26" height="42" fill="#1a3a5c"/>
          <rect x="178" y="12" width="20" height="56" fill="#1a3a5c"/>
          <rect x="196" y="22" width="16" height="46" fill="#1a3a5c"/>
          <rect x="210" y="18" width="22" height="50" fill="#1a3a5c"/>
          <rect x="230" y="30" width="20" height="38" fill="#1a3a5c"/>
          {/* Windows */}
          {[[25,22],[25,30],[60,18],[60,26],[102,14],[102,22],[102,30],[120,24],[142,20],[142,28],[182,16],[182,24],[214,22],[214,30]].map(([x,y],i)=>(
            <rect key={i} x={x} y={y} width="4" height="3" rx="0.5" fill="rgba(255,220,100,0.6)"/>
          ))}
          {/* Foreground buildings */}
          <rect x="0"   y="42" width="32" height="26" fill="#0d1f35"/>
          <rect x="30"  y="36" width="20" height="32" fill="#0d1f35"/>
          <rect x="48"  y="40" width="28" height="28" fill="#0d1f35"/>
          <rect x="74"  y="32" width="22" height="36" fill="#0d1f35"/>
          <rect x="94"  y="38" width="18" height="30" fill="#0d1f35"/>
          <rect x="110" y="30" width="26" height="38" fill="#0d1f35"/>
          <rect x="134" y="36" width="20" height="32" fill="#0d1f35"/>
          <rect x="152" y="40" width="24" height="28" fill="#0d1f35"/>
          <rect x="174" y="34" width="18" height="34" fill="#0d1f35"/>
          <rect x="190" y="42" width="22" height="26" fill="#0d1f35"/>
          <rect x="210" y="38" width="20" height="30" fill="#0d1f35"/>
          <rect x="228" y="44" width="22" height="24" fill="#0d1f35"/>
          {/* Foreground windows */}
          {[[4,46],[4,54],[52,44],[52,52],[78,36],[78,44],[114,34],[114,42],[114,50],[138,40],[156,44],[178,38],[178,46],[214,42]].map(([x,y],i)=>(
            <rect key={i} x={x} y={y} width="3" height="2.5" rx="0.3" fill="rgba(255,220,80,0.5)"/>
          ))}
        </svg>
        <span className="prem-badge">Premium</span>
      </div>

      {/* Avatar */}
      <div className="prof-av-wrap">
        <div
          className="prof-av"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate?.('profile')}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onNavigate?.('profile') }}
          style={{ cursor: 'pointer' }}
        >
          <svg viewBox="0 0 76 76" width="76" height="76">
            <circle cx="38" cy="38" r="38" fill="#2d6a9f"/>
            <circle cx="38" cy="30" r="14" fill="#a8c8e8"/>
            <ellipse cx="38" cy="62" rx="22" ry="14" fill="#a8c8e8"/>
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="prof-texts">
        <div className="prof-name-row">
          <span className="prof-name" onClick={() => onNavigate?.('profile')}>Panav Mhatre</span>
          <span className="in-bdg">in</span>
        </div>
        <p className="prof-hl">CS @ UT Austin</p>
        <p className="prof-loc">Austin, Texas Metropolitan Area</p>
      </div>

      <div className="prof-school-row">
        <span className="school-ico">UT</span>
        <span className="prof-school-nm">The University of Texas at Austin</span>
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
