import { useState } from 'react'
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

// Seeded so the profile looks credible on first load — the badge is the product.
const SEED_BADGES = [
  { id: 'seed-google', company: 'Google', companyColor: '#4285f4', title: 'PageSpeed Report Card Tool', score: 94, percentile: 'Top 8%', rank: null },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [badges, setBadges] = useState(SEED_BADGES)

  function earnBadge(badge) {
    setBadges(prev => (prev.some(b => b.id === badge.id) ? prev : [badge, ...prev]))
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
            <ProfilePage badges={badges} onNavigate={setPage} />
          </div>
        ) : page === 'bounty' ? (
          <div className="li-bounty-wrap">
            <BountyPage onEarnBadge={earnBadge} onNavigate={setPage} />
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
