import { NavLink } from 'react-router-dom'
import { getMood, moodColor } from '../../lib/moods.js'
import { dayKey } from '../../lib/dates.js'
import { entryTitle, snippet } from '../../lib/entries.js'

function shortDate(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(d) === dayKey(today)) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (dayKey(d) === dayKey(yesterday)) return 'Yesterday'
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() && { year: 'numeric' }),
  })
}

// Entries grouped under month headings, newest first.
export default function EntryList({ entries }) {
  const groups = []
  for (const e of entries) {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const last = groups[groups.length - 1]
    if (last?.key === key) last.entries.push(e)
    else groups.push({ key, label: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), entries: [e] })
  }

  return (
    <div className="entry-list">
      {groups.map((g) => (
        <div key={g.key} className="list-group">
          <h2 className="list-group-label">{g.label}</h2>
          {g.entries.map((e) => {
            const mood = getMood(e.mood)
            return (
              <NavLink
                key={e.id}
                to={`/journal/${e.id}`}
                className={`note-item${e.title.trim() ? '' : ' untitled'}`}
                style={mood ? { '--mood': moodColor(mood.value) } : undefined}
              >
                <div className="note-item-top">
                  <span className="note-title">{entryTitle(e)}</span>
                  {mood && <span className="note-mood" title={mood.label}>{mood.emoji}</span>}
                </div>
                {e.body.trim() && <p className="note-snippet">{snippet(e.body)}</p>}
                <div className="note-item-foot">
                  <time dateTime={e.date}>{shortDate(e.date)}</time>
                  {e.tags.slice(0, 2).map((t) => <span key={t} className="note-tag">#{t}</span>)}
                  {e.tags.length > 2 && <span className="note-tag more">+{e.tags.length - 2}</span>}
                </div>
              </NavLink>
            )
          })}
        </div>
      ))}
    </div>
  )
}
