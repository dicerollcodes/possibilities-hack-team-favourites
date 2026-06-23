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

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="li-page">
      <Navbar onNavigate={setPage} currentPage={page} />
      <div className="li-body">
        <aside className="li-left">
          <ProfileCard />
          <MyPagesCard onNavigate={setPage} currentPage={page} />
        </aside>

        {page === 'bounty' ? (
          <div className="li-bounty-wrap">
            <BountyPage />
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
