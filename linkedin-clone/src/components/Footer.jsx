import { IconChevronDown } from '@tabler/icons-react'

const LINKS = [
  ['About', 'Accessibility', 'Help Center'],
  [['Privacy & Terms', true], 'Ad Choices', 'Advertising'],
  [['Business Services', true], 'Get the LinkedIn app'],
  ['More'],
]

export default function Footer() {
  return (
    <footer className="li-footer">
      {LINKS.map((row, i) => (
        <div className="ft-row" key={i}>
          {row.map(item => {
            const [label, hasChevron] = Array.isArray(item) ? item : [item, false]
            return (
              <span className="ft-lnk" key={label}>
                {label}
                {hasChevron && <IconChevronDown size={10} />}
              </span>
            )
          })}
        </div>
      ))}
      <div className="ft-brand">
        <span className="ft-logo">in</span>
        <span>LinkedIn Corp © 2025</span>
      </div>
    </footer>
  )
}
