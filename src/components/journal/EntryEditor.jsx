import { Link } from 'react-router-dom'
import AutoTextarea from '../AutoTextarea.jsx'
import Icon from '../Icon.jsx'
import MoodPicker from './MoodPicker.jsx'
import TagInput from './TagInput.jsx'
import { ENERGY } from '../../lib/moods.js'
import { dayKey } from '../../lib/dates.js'
import { isBlankEntry, withDay } from '../../lib/entries.js'
import { useStore } from '../../store.jsx'

function editedLabel(iso) {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000)
  if (mins < 1) return 'Edited just now'
  if (mins < 60) return `Edited ${mins} min ago`
  const d = new Date(iso)
  if (dayKey(d) === dayKey(new Date())) return `Edited at ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  return `Edited ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

// Always-editable entry view; every change saves immediately.
export default function EntryEditor({ entry, onDelete, tagSuggestions }) {
  const { updateEntry } = useStore()
  const set = (patch) => updateEntry(entry.id, patch)
  const words = entry.body.trim() ? entry.body.trim().split(/\s+/).length : 0
  const today = dayKey(new Date())

  return (
    <article className="editor">
      <header className="editor-bar">
        <Link to="/journal" className="icon-btn editor-back" aria-label="Back to entries">
          <Icon name="back" size={18} />
        </Link>
        <span className="editor-crumb">
          <Icon name="note" size={14} />
          Journal
        </span>
        <span className="editor-status">
          <span className="saved-dot" aria-hidden="true" />
          {editedLabel(entry.updatedAt)}
          <span className="editor-words"> · {words} {words === 1 ? 'word' : 'words'}</span>
        </span>
        <button className="icon-btn danger" onClick={onDelete} aria-label="Delete entry" title="Delete entry">
          <Icon name="trash" size={17} />
        </button>
      </header>

      <div className="editor-scroll">
        <div className="editor-doc">
          <input
            className="editor-title"
            value={entry.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Untitled"
            aria-label="Title"
            autoFocus={isBlankEntry(entry)}
          />

          <dl className="props">
            <div className="prop">
              <dt><Icon name="calendar" size={14} />Date</dt>
              <dd>
                <input
                  type="date"
                  className="prop-date"
                  value={dayKey(entry.date)}
                  max={today}
                  onChange={(e) => e.target.value && set({ date: withDay(entry.date, e.target.value) })}
                  aria-label="Entry date"
                />
              </dd>
            </div>
            <div className="prop">
              <dt><Icon name="smile" size={14} />Mood</dt>
              <dd><MoodPicker value={entry.mood} onChange={(mood) => set({ mood })} /></dd>
            </div>
            <div className="prop">
              <dt><Icon name="bolt" size={14} />Energy</dt>
              <dd>
                <div className="segmented" role="radiogroup" aria-label="Energy">
                  {ENERGY.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={entry.energy === opt.value}
                      onClick={() => set({ energy: entry.energy === opt.value ? null : opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </dd>
            </div>
            <div className="prop">
              <dt><Icon name="tag" size={14} />Tags</dt>
              <dd><TagInput tags={entry.tags} onChange={(tags) => set({ tags })} suggestions={tagSuggestions} /></dd>
            </div>
            <div className="prop">
              <dt><Icon name="heart" size={14} />Grateful for</dt>
              <dd>
                <input
                  className="prop-input"
                  value={entry.gratitude}
                  onChange={(e) => set({ gratitude: e.target.value })}
                  placeholder="One small good thing…"
                  aria-label="Grateful for"
                />
              </dd>
            </div>
          </dl>

          <AutoTextarea
            className="editor-body"
            value={entry.body}
            onChange={(e) => set({ body: e.target.value })}
            placeholder="Start writing…"
            aria-label="Entry"
            minRows={10}
          />
        </div>
      </div>
    </article>
  )
}
