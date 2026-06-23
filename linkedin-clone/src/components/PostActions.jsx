import { useState } from 'react'
import { IconThumbUp, IconMessage2, IconRepeat, IconSend } from '@tabler/icons-react'

export default function PostActions({ commentSlot }) {
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)

  return (
    <>
      <div className="act-bar">
        <button
          className={`ab${liked ? ' liked' : ''}`}
          onClick={() => setLiked(l => !l)}
        >
          <IconThumbUp size={20} />
          {liked ? 'Liked' : 'Like'}
        </button>
        <button className="ab" onClick={() => setShowComments(s => !s)}>
          <IconMessage2 size={20} />
          Comment
        </button>
        <button className="ab">
          <IconRepeat size={20} />
          Repost
        </button>
        <button className="ab">
          <IconSend size={20} />
          Send
        </button>
      </div>

      {showComments && (
        <div className="comment-section">
          <div className="cmt-iw">
            <div className="cmt-av">PM</div>
            <input className="cmt-in" type="text" placeholder="Add a comment…" />
          </div>
          {commentSlot}
        </div>
      )}
    </>
  )
}
