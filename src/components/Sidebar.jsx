import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import NewMenu from './NewMenu.jsx'
import ThemeSwitcher from './ThemeSwitcher.jsx'
import { useStore } from '../store.jsx'

export default function Sidebar({ theme, onClose }) {
  const { entries, todos } = useStore()
  const openTasks = todos.filter((t) => !t.done).length

  const links = [
    { to: '/', label: 'Home', icon: 'home', end: true },
    { to: '/journal', label: 'Journal', icon: 'note', count: entries.length },
    { to: '/tasks', label: 'Tasks', icon: 'check', count: openTasks },
  ]

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-head">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true"><Icon name="book" size={15} /></span>
          <span className="brand-name">Notebook</span>
        </span>
        <button className="sidebar-close icon-btn" onClick={onClose} aria-label="Close menu">
          <Icon name="x" size={18} />
        </button>
      </div>

      <NewMenu />

      <nav className="side-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="side-link" title={l.label}>
            <Icon name={l.icon} size={18} />
            <span className="side-label">{l.label}</span>
            {l.count > 0 && <span className="side-count">{l.count}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <ThemeSwitcher {...theme} />
      </div>
    </aside>
  )
}
