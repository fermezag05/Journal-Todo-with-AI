import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Select from '../components/Select.jsx'
import EntryEditor from '../components/journal/EntryEditor.jsx'
import EntryList from '../components/journal/EntryList.jsx'
import { MOODS } from '../lib/moods.js'
import { isBlankEntry } from '../lib/entries.js'
import { useStore } from '../store.jsx'
import useMediaQuery from '../useMediaQuery.js'

const MOOD_OPTIONS = [{ value: '0', label: 'Any mood' }, ...[...MOODS].reverse().map((m) => ({ value: String(m.value), label: `${m.emoji}  ${m.label}` }))]

export default function Journal() {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const { entries, createEntry, deleteEntry } = useStore()
  const twoPane = useMediaQuery('(min-width: 900px)')

  const [query, setQuery] = useState('')
  const [mood, setMood] = useState(0)
  const [tag, setTag] = useState('')

  const selected = entries.find((e) => e.id === entryId)
  const allTags = useMemo(() => [...new Set(entries.flatMap((e) => e.tags))].sort(), [entries])

  const q = query.trim().toLowerCase()
  const filtered = entries.filter(
    (e) =>
      (!mood || e.mood === mood) &&
      (!tag || e.tags.includes(tag)) &&
      (!q || [e.title, e.body, e.gratitude, ...e.tags].some((s) => s.toLowerCase().includes(q))),
  )
  const isFiltering = Boolean(q || mood || tag)

  // Two-pane layout: open the newest entry when nothing is selected.
  useEffect(() => {
    if (twoPane && !entryId && entries.length) navigate(`/journal/${entries[0].id}`, { replace: true })
  }, [twoPane, entryId, entries, navigate])

  // Unknown or deleted entry in the URL: fall back to the list.
  useEffect(() => {
    if (entryId && !selected) navigate('/journal', { replace: true })
  }, [entryId, selected, navigate])

  // Discard an entry that was left blank when moving to another one.
  const latest = useRef(entries)
  latest.current = entries
  const prevId = useRef(entryId)
  useEffect(() => {
    const prev = prevId.current
    prevId.current = entryId
    if (!prev || prev === entryId) return
    const left = latest.current.find((e) => e.id === prev)
    if (left && isBlankEntry(left)) deleteEntry(left, { silent: true })
  }, [entryId, deleteEntry])

  function handleDelete() {
    const list = filtered.some((e) => e.id === selected.id) ? filtered : entries
    const i = list.findIndex((e) => e.id === selected.id)
    const next = list[i + 1] ?? list[i - 1]
    deleteEntry(selected, { silent: isBlankEntry(selected) })
    navigate(next && twoPane ? `/journal/${next.id}` : '/journal', { replace: true })
  }

  function clearFilters() {
    setQuery('')
    setMood(0)
    setTag('')
  }

  return (
    <div className={`journal${entryId ? ' has-selection' : ''}`}>
      <section className="list-pane" aria-label="Journal entries">
        <header className="list-head">
          <div className="list-title-row">
            <div>
              <h1>Journal</h1>
              <span className="list-count">
                {isFiltering ? `${filtered.length} of ${entries.length}` : entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <button className="btn primary sm" onClick={() => navigate(`/journal/${createEntry()}`)}>
              <Icon name="plus" size={15} strokeWidth="2.5" /> New entry
            </button>
          </div>
          {entries.length > 0 && (
            <>
              <label className="search">
                <Icon name="search" size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries" aria-label="Search entries" />
                {query && (
                  <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search"><Icon name="x" size={14} /></button>
                )}
              </label>
              <div className="list-filters">
                <Select label="Mood" icon="smile" value={String(mood)} onChange={(v) => setMood(Number(v))} options={MOOD_OPTIONS} active={mood > 0} />
                {allTags.length > 0 && (
                  <Select
                    label="Tag"
                    icon="tag"
                    value={tag}
                    onChange={setTag}
                    options={[{ value: '', label: 'Any tag' }, ...allTags.map((t) => ({ value: t, label: `#${t}` }))]}
                    active={Boolean(tag)}
                  />
                )}
                {isFiltering && <button className="link-btn" onClick={clearFilters}>Clear</button>}
              </div>
            </>
          )}
        </header>

        <div className="list-scroll">
          {entries.length === 0 ? (
            <div className="empty">
              <span className="empty-icon"><Icon name="note" size={22} /></span>
              <p className="empty-title">No entries yet</p>
              <p className="empty-text">Start a journal entry to capture your day, mood and what you're grateful for.</p>
              <button className="btn primary" onClick={() => navigate(`/journal/${createEntry()}`)}>Write your first entry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p className="empty-title">No matching entries</p>
              <button className="link-btn" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <EntryList entries={filtered} />
          )}
        </div>
      </section>

      <section className="editor-pane">
        {selected ? (
          <EntryEditor key={selected.id} entry={selected} onDelete={handleDelete} tagSuggestions={allTags} />
        ) : (
          <div className="empty editor-empty">
            <span className="empty-icon"><Icon name="note" size={22} /></span>
            <p className="empty-title">Nothing selected</p>
            <p className="empty-text">Pick an entry from the list, or start a new one.</p>
          </div>
        )}
      </section>
    </div>
  )
}
