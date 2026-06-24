import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import MyPagesCard from './components/MyPagesCard'
import StartPost from './components/StartPost'
import FeedPosts from './components/FeedPosts'
import LinkedInNews from './components/LinkedInNews'
import Puzzles from './components/Puzzles'
import Footer from './components/Footer'
import BountyPage from './components/BountyPage'
import ProfilePage from './components/ProfilePage'
import {
  fetchBountyStatus,
  setBountyStatus as persistBountyStatus,
  LI_RACE_BOUNTY_ID,
  REVIEW_STATUS,
} from './lib/demoUser'

// Seeded so the profile looks credible on first load. The badge is the product —
// but it is NOT verified until the submission clears recruiter + engineer review.
// Panav has submitted the LinkedIn city-search bounty and is "in review". Its id
// is the shared LI_RACE_BOUNTY_ID so the recruiter dashboard, the candidate
// submission, and this profile entry all key off the same DB status.
const SEED_BADGES = [
  {
    id: LI_RACE_BOUNTY_ID,
    company: 'LinkedIn', companyColor: '#0a66c2',
    title: 'Fix the city-search race condition', category: 'Engineering', rank: 7,
  },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [badges, setBadges] = useState(SEED_BADGES)
  // Demo user's per-bounty review status: { '<bounty_id>': '<status>' }.
  const [bountyStatus, setBountyStatusState] = useState({})

  // Load Panav's saved status from the DB once on mount (no-op if unavailable).
  useEffect(() => {
    fetchBountyStatus().then(setBountyStatusState)
  }, [])

  // Recruiter approvals happen in the /recruiter tab and persist to the same DB
  // row — refetch whenever we open the profile so a freshly-awarded badge shows.
  useEffect(() => {
    if (page === 'profile') fetchBountyStatus().then(setBountyStatusState)
  }, [page])

  // A bounty is submitted (coding → 'in_review') or awarded outright (project
  // bounties). Adds the badge to the profile and persists the status to the DB.
  // The badge id IS the DB status key, so the profile pill and the recruiter
  // dashboard read/write the same row.
  function earnBadge(badge, status = REVIEW_STATUS.AWARDED) {
    setBadges(prev => (prev.some(b => b.id === badge.id) ? prev : [badge, ...prev]))
    setBountyStatusState(prev => ({ ...prev, [badge.id]: status }))
    persistBountyStatus(badge.id, status).then(next => { if (next) setBountyStatusState(next) })
  }

  return (
    <div className="li-page">
      <Navbar onNavigate={setPage} currentPage={page} />
      <div className="li-body">
        <aside className="li-left">
          <ProfileCard onNavigate={setPage} />
          <MyPagesCard onNavigate={setPage} currentPage={page} />
        </aside>

        {page === 'profile' ? (
          <div className="li-bounty-wrap">
            <ProfilePage badges={badges} bountyStatus={bountyStatus} onNavigate={setPage} />
          </div>
        ) : page === 'bounty' ? (
          <div className="li-bounty-wrap">
            <BountyPage onEarnBadge={earnBadge} />
          </div>
        ) : (
          <>
            <main className="li-feed">
              <StartPost />
              <div className="sort-bar">
                Sort by: <strong>Top</strong>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <FeedPosts />
            </main>

            <aside className="li-right">
              <LinkedInNews />
              <Puzzles />
              <Footer />
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
