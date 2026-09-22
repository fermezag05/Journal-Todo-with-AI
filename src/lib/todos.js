import { dayKey, fromDayKey } from './dates.js'

export const PRIORITIES = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
]

export const getPriority = (value) => PRIORITIES.find((p) => p.value === value)
export const priorityColor = (value) => ({ 1: 'var(--mood-5)', 2: 'var(--mood-2)', 3: 'var(--mood-1)' })[value] ?? 'var(--faint)'

// Fills in fields missing from tasks saved by older versions of the app.
// Old tasks get index-based timestamps so their original order is kept.
export function normalizeTodo(t, index) {
  const created = t.createdAt ?? new Date(index).toISOString()
  return {
    id: t.id ?? crypto.randomUUID(),
    text: t.text ?? '',
    done: Boolean(t.done),
    priority: t.priority ?? 0,
    due: t.due ?? null,
    tag: t.tag ?? '',
    createdAt: created,
    completedAt: t.completedAt ?? (t.done ? created : null),
  }
}

export const emptyTodoForm = () => ({ text: '', priority: 0, due: '', tag: '' })

export const todoToForm = (t) => ({ text: t.text, priority: t.priority, due: t.due ?? '', tag: t.tag })

export const cleanTag = (s) => s.trim().replace(/^#+/, '').toLowerCase().replace(/\s+/g, '-')

export const formToTodo = (form) => ({
  text: form.text.trim(),
  priority: form.priority,
  due: form.due || null,
  tag: cleanTag(form.tag),
})

export function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

// 'overdue' | 'today' | 'tomorrow' | 'upcoming' | null (no due date)
export function dueStatus(due) {
  if (!due) return null
  const today = dayKey(new Date())
  if (due < today) return 'overdue'
  if (due === today) return 'today'
  if (due === addDays(1)) return 'tomorrow'
  return 'upcoming'
}

export function dueLabel(due) {
  if (due === addDays(0)) return 'Today'
  if (due === addDays(1)) return 'Tomorrow'
  if (due === addDays(-1)) return 'Yesterday'
  const d = fromDayKey(due)
  if (due > addDays(0) && due <= addDays(6)) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
  })
}

export const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Completed' },
]

export const DUE_FILTERS = {
  any: { label: 'Any date', test: () => true },
  overdue: { label: 'Overdue', test: (t) => !t.done && dueStatus(t.due) === 'overdue' },
  today: { label: 'Due today', test: (t) => dueStatus(t.due) === 'today' },
  upcoming: { label: 'Upcoming', test: (t) => ['tomorrow', 'upcoming'].includes(dueStatus(t.due)) },
  none: { label: 'No date', test: (t) => !t.due },
}

const byDue = (a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999')
const byPriority = (a, b) => b.priority - a.priority
const byNewest = (a, b) => b.createdAt.localeCompare(a.createdAt)

export const SORTS = {
  smart: { label: 'Due date', fn: (a, b) => byDue(a, b) || byPriority(a, b) || byNewest(a, b) },
  priority: { label: 'Priority', fn: (a, b) => byPriority(a, b) || byDue(a, b) || byNewest(a, b) },
  newest: { label: 'Newest', fn: byNewest },
}

// Section headings used when tasks are sorted by due date.
export const BUCKETS = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'none', label: 'No date' },
]
export const bucketOf = (t) => dueStatus(t.due) ?? 'none'
