import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Icon from './components/Icon.jsx'
import NewMenu from './components/NewMenu.jsx'
import Sidebar from './components/Sidebar.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import Journal from './pages/Journal.jsx'
import Tasks from './pages/Tasks.jsx'
import { useStore } from './store.jsx'
import { useTheme } from './theme.js'

const TITLES = { '/': 'Home', '/journal': 'Journal', '/tasks': 'Tasks' }

export default function App() {
  const [pref, setPref, resolved] = useTheme()
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()
  const { toast, setToast } = useStore()

  useEffect(() => setNavOpen(false), [pathname])

  const section = '/' + (pathname.split('/')[1] ?? '')
  // The journal editor has its own mobile header with a back button.
  const inEditor = /^\/journal\/.+/.test(pathname)

  return (
    <div className={`shell${navOpen ? ' nav-open' : ''}`}>
      <Sidebar theme={{ pref, setPref, resolved }} onClose={() => setNavOpen(false)} />
      <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />

      <div className="main">
        {!inEditor && (
          <header className="topbar">
            <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu">
              <Icon name="menu" size={20} />
            </button>
            <span className="topbar-title">{TITLES[section] ?? 'Notebook'}</span>
            <NewMenu compact />
          </header>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:entryId" element={<Journal />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/todo" element={<Navigate to="/tasks" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          actionLabel="Undo"
          onAction={() => {
            toast.undo()
            setToast(null)
          }}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
