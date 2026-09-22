import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useLocalStorage from '../useLocalStorage.js'
import Icon from '../components/Icon.jsx'
import Select from '../components/Select.jsx'
import TodoComposer from '../components/todo/TodoComposer.jsx'
import TodoItem from '../components/todo/TodoItem.jsx'
import { dayKey } from '../lib/dates.js'
import { BUCKETS, DUE_FILTERS, PRIORITIES, SORTS, STATUS_FILTERS, bucketOf, dueStatus } from '../lib/todos.js'
import { useStore } from '../store.jsx'

const DUE_OPTIONS = Object.entries(DUE_FILTERS).map(([value, f]) => ({ value, label: f.label }))
const PRIORITY_OPTIONS = [{ value: '0', label: 'Any priority' }, ...[...PRIORITIES].reverse().map((p) => ({ value: String(p.value), label: p.label }))]
const SORT_OPTIONS = Object.entries(SORTS).map(([value, s]) => ({ value, label: s.label }))

export default function Tasks() {
  const { todos, addTodo, updateTodo, toggleTodo, deleteTodos } = useStore()
  const location = useLocation()

  const [status, setStatus] = useState('all')
  const [due, setDue] = useState('any')
  const [priority, setPriority] = useState(0)
  const [tagFilter, setTagFilter] = useState(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useLocalStorage('todo-sort', 'smart')
  const [showCompleted, setShowCompleted] = useLocalStorage('todo-show-completed', true)

  // "New → Task" elsewhere in the app lands here with focus in the composer.
  useEffect(() => {
    if (location.state?.newTask) document.querySelector('.todo-text-input')?.focus()
  }, [location.state])

  const allTags = useMemo(() => [...new Set(todos.map((t) => t.tag).filter(Boolean))].sort(), [todos])

  function clearFilters() {
    setStatus('all')
    setDue('any')
    setPriority(0)
    setTagFilter(null)
    setQuery('')
  }

  const open = todos.filter((t) => !t.done)
  const today = dayKey(new Date())
  const counts = {
    open: open.length,
    today: open.filter((t) => dueStatus(t.due) === 'today').length,
    overdue: open.filter((t) => dueStatus(t.due) === 'overdue').length,
    doneToday: todos.filter((t) => t.done && t.completedAt && dayKey(t.completedAt) === today).length,
  }

  const q = query.trim().toLowerCase()
  const matches = (t) =>
    DUE_FILTERS[due].test(t) &&
    (!priority || t.priority === priority) &&
    (!tagFilter || t.tag === tagFilter) &&
    (!q || t.text.toLowerCase().includes(q) || t.tag.includes(q))

  const active = todos.filter((t) => !t.done && matches(t)).sort(SORTS[sort].fn)
  const completed = todos
    .filter((t) => t.done && matches(t))
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  const groups = sort === 'smart'
    ? BUCKETS.map((b) => ({ ...b, items: active.filter((t) => bucketOf(t) === b.key) })).filter((g) => g.items.length)
    : [{ key: 'all', label: null, items: active }]

  const isFiltering = Boolean(status !== 'all' || due !== 'any' || priority || tagFilter || q)
  const showActive = status !== 'done'
  const showDone = status !== 'active' && completed.length > 0
  const completedOpen = showCompleted || status === 'done'

  const itemProps = (t) => ({
    todo: t,
    onToggle: () => toggleTodo(t.id),
    onUpdate: (form) => updateTodo(t.id, form),
    onDelete: () => deleteTodos([t], 'Task deleted'),
    onTagClick: setTagFilter,
    tagSuggestions: allTags,
  })

  const summary = [
    { key: 'open', label: 'To do', icon: 'list', value: counts.open, apply: () => setStatus('active'), isOn: status === 'active' && due === 'any' },
    { key: 'today', label: 'Due today', icon: 'sun', value: counts.today, apply: () => setDue('today'), isOn: due === 'today' },
    { key: 'overdue', label: 'Overdue', icon: 'alert', value: counts.overdue, apply: () => setDue('overdue'), isOn: due === 'overdue' },
    { key: 'done', label: 'Done today', icon: 'tick', value: counts.doneToday, apply: () => setStatus('done'), isOn: status === 'done' },
  ]

  const subtitle =
    todos.length === 0 ? 'Nothing on your plate yet.'
      : counts.open === 0 ? 'All caught up. Nice work.'
        : `${counts.open} open ${counts.open === 1 ? 'task' : 'tasks'}${counts.today ? ` · ${counts.today} due today` : ''}`

  return (
    <div className="page-scroll">
      <div className="page tasks">
        <header className="page-header">
          <h1>Tasks</h1>
          <p className="page-sub">{subtitle}</p>
        </header>

        <TodoComposer onSubmit={addTodo} tagSuggestions={allTags} />

        {todos.length > 0 && (
          <>
            <div className="task-summary">
              {summary.map((s) => (
                <button
                  key={s.key}
                  className={`summary-card ${s.key}${s.isOn ? ' on' : ''}${s.value ? '' : ' zero'}`}
                  onClick={() => {
                    clearFilters()
                    if (!s.isOn) s.apply()
                  }}
                  aria-pressed={s.isOn}
                >
                  <span className="summary-icon"><Icon name={s.icon} size={15} /></span>
                  <span className="summary-value">{s.value}</span>
                  <span className="summary-label">{s.label}</span>
                </button>
              ))}
            </div>

            <div className="task-filters">
              <label className="search">
                <Icon name="search" size={15} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" aria-label="Search tasks" />
                {query && (
                  <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search"><Icon name="x" size={14} /></button>
                )}
              </label>
              <div className="filter-row">
                <div className="segmented" role="group" aria-label="Status">
                  {STATUS_FILTERS.map((f) => (
                    <button key={f.value} aria-pressed={status === f.value} onClick={() => setStatus(f.value)}>{f.label}</button>
                  ))}
                </div>
                <Select label="Due date" icon="calendar" value={due} onChange={setDue} options={DUE_OPTIONS} active={due !== 'any'} />
                <Select label="Priority" icon="flag" value={String(priority)} onChange={(v) => setPriority(Number(v))} options={PRIORITY_OPTIONS} active={priority > 0} />
                {tagFilter && (
                  <button className="chip active" onClick={() => setTagFilter(null)}>
                    #{tagFilter} <Icon name="x" size={12} />
                  </button>
                )}
                <span className="spacer" />
                <Select label="Sort by" icon="sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
              </div>
              {isFiltering && (
                <p className="filter-note">
                  Showing {active.length + completed.length} of {todos.length} tasks ·{' '}
                  <button className="link-btn" onClick={clearFilters}>Clear filters</button>
                </p>
              )}
            </div>
          </>
        )}

        {todos.length === 0 ? (
          <div className="empty">
            <span className="empty-icon"><Icon name="check" size={22} /></span>
            <p className="empty-title">No tasks yet</p>
            <p className="empty-text">Add a task above. Set a priority or due date if it helps.</p>
          </div>
        ) : (
          <>
            {showActive && (active.length > 0 ? (
              groups.map((g) => (
                <section key={g.key} className="task-group">
                  {g.label && (
                    <h2 className={`group-label ${g.key}`}>
                      {g.label} <span className="count">{g.items.length}</span>
                    </h2>
                  )}
                  <ul className="task-list">
                    {g.items.map((t) => <TodoItem key={t.id} {...itemProps(t)} />)}
                  </ul>
                </section>
              ))
            ) : (
              <div className="empty compact">
                <p className="empty-title">{isFiltering ? 'No open tasks match these filters' : 'All caught up!'}</p>
                {isFiltering && <button className="link-btn" onClick={clearFilters}>Clear filters</button>}
              </div>
            ))}

            {showDone && (
              <section className="completed-section">
                <div className="completed-head">
                  <button
                    className="disclosure"
                    aria-expanded={completedOpen}
                    onClick={() => setShowCompleted(!showCompleted)}
                    disabled={status === 'done'}
                  >
                    <Icon name="chevron" size={14} className="disclosure-icon" />
                    Completed <span className="count">{completed.length}</span>
                  </button>
                  <button
                    className="link-btn subtle"
                    onClick={() => deleteTodos(completed, `Cleared ${completed.length} completed ${completed.length === 1 ? 'task' : 'tasks'}`)}
                  >
                    Clear
                  </button>
                </div>
                {completedOpen && (
                  <ul className="task-list completed-list">
                    {completed.map((t) => <TodoItem key={t.id} {...itemProps(t)} />)}
                  </ul>
                )}
              </section>
            )}

            {status === 'done' && completed.length === 0 && (
              <div className="empty compact">
                <p className="empty-title">No completed tasks{due !== 'any' || priority || tagFilter || q ? ' match these filters' : ' yet'}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
