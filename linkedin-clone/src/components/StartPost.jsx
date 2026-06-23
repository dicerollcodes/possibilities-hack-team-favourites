import { useState } from 'react'
import { IconVideo, IconPhoto, IconWriting, IconX } from '@tabler/icons-react'

const ACTIONS = [
  { Icon: IconVideo,   label: 'Video',        color: '#0077b6' },
  { Icon: IconPhoto,   label: 'Photo',        color: '#333' },
  { Icon: IconWriting, label: 'Write article', color: '#6b6b6b' },
]

export default function StartPost() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  return (
    <>
      <div className="card start-post-card">
        <div className="start-post-row">
          <div className="sp-av">PM</div>
          <button className="sp-input" onClick={() => setOpen(true)}>
            Start a post
          </button>
        </div>
        <div className="post-quick-acts">
          {ACTIONS.map(({ Icon, label, color }) => (
            <button className="pqa" key={label} onClick={() => setOpen(true)}>
              <Icon size={22} color={color} />
              <span style={{ color }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div className="modal-profile">
                <div className="sp-av">PM</div>
                <div>
                  <div className="modal-name">Panav Mhatre</div>
                  <button className="modal-vis-btn">🌐 Anyone &nbsp;▾</button>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setOpen(false)}>
                <IconX size={22} />
              </button>
            </div>
            <textarea
              className="modal-textarea"
              placeholder="What do you want to talk about?"
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
            <div className="modal-footer">
              <div className="modal-actions">
                {ACTIONS.map(({ Icon, color }) => (
                  <button key={color} className="icon-btn">
                    <Icon size={22} color={color} />
                  </button>
                ))}
              </div>
              <button
                className="modal-post-btn"
                disabled={!text.trim()}
                onClick={() => { setText(''); setOpen(false) }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
