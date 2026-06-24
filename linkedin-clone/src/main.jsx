import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RecruiterView from './pages/RecruiterView.jsx'

const isRecruiter = window.location.pathname === '/recruiter'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isRecruiter ? <RecruiterView /> : <App />}
  </StrictMode>,
)
