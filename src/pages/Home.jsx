import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import MoodInsights from '../components/journal/MoodInsights.jsx'
import { getMood, moodColor } from '../lib/moods.js'
import { greeting } from '../lib/dates.js'
import { entryTitle, snippet } from '../lib/entries.js'
import { SORTS, dueLabel, dueStatus, priorityColor } from '../lib/todos.js'
import { useStore } from '../store.jsx'

export default function Home() {
  const { entries, todos, createEntry, toggleTodo } = useStore()
  const navigate = useNavigate()

  const recent = entries.slice(0, 4)
  const open = todos.filter((t) => !t.done)
  const upNext = [...open].sort(SORTS.smart.fn).slice(0, 6)
  const dueToday = open.filter((t) => dueStatus(t.due) === 'today').length
  const overdue = open.filter((t) => dueStatus(t.due) === 'overdue').length

  const todayLong = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const summary = [
    open.length ? `${open.length} open ${open.length === 1 ? 'task' : 'tasks'}` : 'No open tasks',
    dueToday ? `${dueToday} due today` : null,
    overdue ? `${overdue} overdue` : null,
  ].filter(Boolean).join(' · ')

  const newEntry = () => navigate(`/journal/${createEntry()}`)

  return (
    <div className="page-scroll">
      <div className="page home">
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">{todayLong}</p>
            <h1>{greeting()}</h1>
            <p className="hero-sub">{summary}</p>
          </div>
          <div className="hero-actions">
            <button className="btn primary" onClick={newEntry}>
              <Icon name="edit" size={15} /> Write in journal
            </button>
            <Link className="btn" to="/tasks" state={{ newTask: Date.now() }}>
              <Icon name="plus" size={15} /> Add task
            </Link>
          </div>
        </section>

        <section className="widget widget-recent">
          <header className="widget-head">
            <h2>Recent entries</h2>
            {entries.length > 0 && <Link to="/journal" className="widget-link">View all <Icon name="arrowRight" size={14} /></Link>}
          </header>
          <div className="recent-grid">
            <button className="recent-card new" onClick={newEntry}>
              <span className="new-icon"><Icon name="plus" size={20} /></span>
              <span>New entry</span>
            </button>
            {recent.map((e) => {
              const mood = getMood(e.mood)
              return (
                <Link key={e.id} to={`/journal/${e.id}`} className="recent-card" style={mood ? { '--mood': moodColor(mood.value) } : undefined}>
                  <span className="recent-title">{entryTitle(e)}</span>
                  <span className="recent-snippet">{snippet(e.body, 110) || 'No text yet'}</span>
                  <span className="recent-foot">
                    <time dateTime={e.date}>{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                    {mood && <span title={mood.label}>{mood.emoji}</span>}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <div className="widget-row">
          <section className="widget">
            <header className="widget-head">
              <h2>Up next</h2>
              <Link to="/tasks" className="widget-link">All tasks <Icon name="arrowRight" size={14} /></Link>
            </header>
            {upNext.length === 0 ? (
              <div className="widget-empty">
                <p>{todos.length ? 'All caught up. Nice work.' : 'No tasks yet.'}</p>
                <Link to="/tasks" state={{ newTask: Date.now() }} className="link-btn">Add a task</Link>
              </div>
            ) : (
              <ul className="mini-tasks">
                {upNext.map((t) => {
                  const status = dueStatus(t.due)
                  return (
                    <li key={t.id} style={{ '--priority': priorityColor(t.priority) }}>
                      <button className="check" role="checkbox" aria-checked={false} aria-label={`Complete "${t.text}"`} onClick={() => toggleTodo(t.id)}>
                        <Icon name="tick" size={12} strokeWidth="3" />
                      </button>
                      <span className="mini-text">{t.text}</span>
                      {t.due && <span className={`due ${status}`}>{status === 'overdue' ? 'Overdue' : dueLabel(t.due)}</span>}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="widget">
            <header className="widget-head">
              <h2>Mood</h2>
              <Link to="/journal" className="widget-link">Journal <Icon name="arrowRight" size={14} /></Link>
            </header>
            <MoodInsights entries={entries} />
          </section>
        </div>
      </div>
    </div>
  )
}
