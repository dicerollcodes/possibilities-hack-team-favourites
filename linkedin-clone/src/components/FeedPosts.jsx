import { useState } from 'react'
import { IconThumbUp, IconThumbUpFilled, IconHeart, IconHeartFilled, IconStar, IconStarFilled, IconMessage, IconRepeat, IconSend, IconDots, IconX } from '@tabler/icons-react'

const POSTS = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Head of Product @ Stripe',
    time: '3h',
    avatar: 'SC',
    avatarBg: '#0077b6',
    body: `After 6 years in product, here's the one thing I wish someone told me earlier:\n\nShipping fast doesn't mean shipping sloppy. It means cutting scope ruthlessly — not quality.\n\nThe best PMs I've worked with don't ask "how do we build this?" They ask "what's the smallest version of this that actually solves the problem?"\n\nShip that. Learn fast. Iterate.\n\nThe longer you wait for perfect, the longer your users wait for better.`,
    likes: 2847,
    comments: 184,
    reposts: 312,
  },
  {
    id: 2,
    name: 'Marcus Williams',
    title: 'Engineering Manager @ Vercel',
    time: '5h',
    avatar: 'MW',
    avatarBg: '#333',
    body: `We just shipped a feature that took 3 engineers 2 weeks.\n\nA year ago the same feature would have taken a team of 6 two months.\n\nWhat changed? We stopped writing documentation for the code. We started writing documentation for the decisions.\n\nWhy did we build it this way? What did we consider and reject? What breaks if this assumption changes?\n\nFuture us doesn't need to know what the code does — it can read the code. Future us needs to know why.`,
    likes: 4102,
    comments: 267,
    reposts: 589,
  },
  {
    id: 3,
    name: 'Priya Nair',
    title: 'Founder @ Beacon of Hope | Forbes 30u30',
    time: '1d',
    avatar: 'PN',
    avatarBg: '#6b6b6b',
    body: `Hot take: the best pitch decks I've seen have fewer than 10 slides.\n\nInvestors don't fund decks. They fund founders who can think clearly under pressure.\n\nIf you need 30 slides to explain your idea, you haven't found product-market fit yet — you've found product-market confusion.\n\nChallenge: take your current deck. Remove every slide you added to "cover your bases." What's left is your real pitch.\n\nThat's what you should be sending.`,
    likes: 6731,
    comments: 453,
    reposts: 1204,
  },
  {
    id: 4,
    name: 'James Okafor',
    title: 'Senior SWE @ Anthropic',
    time: '2d',
    avatar: 'JO',
    avatarBg: '#0077b6',
    body: `3 years ago I failed my Google interview. Twice.\n\nLast month I got an offer from Anthropic.\n\nHere's what actually changed — and it wasn't grinding 500 LeetCode problems:\n\n1. I built things in public. Broke things in public. Fixed things in public.\n2. I stopped optimizing for interviews and started optimizing for learning.\n3. I found a community that pushed me harder than any recruiter ever did.\n\nThe job you want isn't behind a whiteboard. It's behind the work you do when no one's watching.`,
    likes: 11284,
    comments: 891,
    reposts: 2376,
  },
]

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
  return n
}

function Post({ post }) {
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const lines = post.body.split('\n')
  const preview = lines.slice(0, 3).join('\n')
  const hasMore = lines.length > 3

  return (
    <div className="card feed-post">
      <div className="post-hdr">
        <div className="post-av" style={{ background: post.avatarBg }}>{post.avatar}</div>
        <div className="post-meta">
          <div className="post-name">{post.name}</div>
          <div className="post-title">{post.title}</div>
          <div className="post-time">{post.time} · <span style={{ opacity: 0.6 }}>🌐</span></div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button className="icon-btn"><IconDots size={18} color="rgba(0,0,0,0.5)" /></button>
          <button className="icon-btn"><IconX size={18} color="rgba(0,0,0,0.5)" /></button>
        </div>
      </div>

      <div className="post-body">
        {(expanded ? post.body : preview).split('\n').map((line, i) => (
          <p key={i} style={{ marginBottom: line === '' ? 8 : 0 }}>{line}</p>
        ))}
        {hasMore && !expanded && (
          <button className="see-more-btn" onClick={() => setExpanded(true)}>…more</button>
        )}
      </div>

      <div className="post-stats">
        <span className="post-reactions">
          <span className="reaction-ico" style={{background:'#0077b6'}}>
            <IconThumbUpFilled size={11} color="#fff" />
          </span>
          <span className="reaction-ico" style={{background:'#e03e2d'}}>
            <IconHeartFilled size={11} color="#fff" />
          </span>
          <span className="reaction-ico" style={{background:'#f5a623'}}>
            <IconStarFilled size={11} color="#fff" />
          </span>
          {formatCount(post.likes + (liked ? 1 : 0))}
        </span>
        <span>{formatCount(post.comments)} comments · {formatCount(post.reposts)} reposts</span>
      </div>

      <div className="post-actions">
        <button className={`post-act-btn${liked ? ' post-act-active' : ''}`} onClick={() => setLiked(l => !l)}>
          <IconThumbUp size={18} /> Like
        </button>
        <button className="post-act-btn">
          <IconMessage size={18} /> Comment
        </button>
        <button className="post-act-btn">
          <IconRepeat size={18} /> Repost
        </button>
        <button className="post-act-btn">
          <IconSend size={18} /> Send
        </button>
      </div>
    </div>
  )
}

export default function FeedPosts() {
  return (
    <>
      {POSTS.map(post => <Post key={post.id} post={post} />)}
    </>
  )
}
