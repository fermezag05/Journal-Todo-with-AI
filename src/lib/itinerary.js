// Weekly itinerary: each block repeats on a set of weekdays (0 = Monday … 6 = Sunday), not
// on dates, so the same week repeats until a block is edited or deleted.

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const todayIndex = () => (new Date().getDay() + 6) % 7

export const BLOCK_COLORS = [
  { value: 'green', label: 'Green', css: 'var(--accent)' },
  { value: 'blue', label: 'Blue', css: 'var(--mood-5)' },
  { value: 'purple', label: 'Purple', css: 'var(--purple)' },
  { value: 'red', label: 'Red', css: 'var(--mood-1)' },
  { value: 'orange', label: 'Orange', css: 'var(--mood-2)' },
  { value: 'yellow', label: 'Yellow', css: 'var(--mood-3)' },
  { value: 'gray', label: 'Gray', css: 'var(--text-3)' },
]

export const blockColor = (value) => (BLOCK_COLORS.find((c) => c.value === value) ?? BLOCK_COLORS[0]).css

const cleanDays = (days) => [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort()

// Older versions stored a single `day` per block instead of a `days` list.
export function normalizeBlock(b) {
  const days = cleanDays(Array.isArray(b.days) ? b.days : [b.day])
  return {
    id: b.id ?? crypto.randomUUID(),
    days: days.length ? days : [0],
    title: b.title ?? '',
    start: b.start ?? '09:00',
    end: b.end ?? '10:00',
    color: b.color ?? 'green',
    note: b.note ?? '',
  }
}

// Folds identical blocks on different days (how older versions saved multi-day activities)
// into one block that repeats on all of those days.
export function mergeDuplicateBlocks(blocks) {
  const byContent = new Map()
  for (const b of blocks) {
    const key = JSON.stringify([b.title, b.start, b.end, b.color, b.note])
    const existing = byContent.get(key)
    if (existing) existing.days = cleanDays([...existing.days, ...b.days])
    else byContent.set(key, { ...b })
  }
  return [...byContent.values()]
}

export function emptyBlockForm(day, start = '09:00') {
  const end = Math.min(toMinutes(start) + 60, 23 * 60 + 59)
  return { title: '', days: [day], start, end: fromMinutes(end), color: 'green', note: '' }
}

export const blockToForm = (b) => ({ title: b.title, days: b.days, start: b.start, end: b.end, color: b.color, note: b.note })

export const formToBlock = (form) => ({
  title: form.title.trim(),
  days: cleanDays(form.days),
  start: form.start,
  end: form.end,
  color: form.color,
  note: form.note.trim(),
})

// "Weekdays", "Weekends", "Every day", or a short list like "Mon, Wed, Fri".
export function daysLabel(days) {
  const key = days.join('')
  if (key === '0123456') return 'Every day'
  if (key === '01234') return 'Weekdays'
  if (key === '56') return 'Weekends'
  return days.map((d) => DAYS[d].slice(0, 3)).join(', ')
}

export function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function fromMinutes(mins) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`
}

export function formatTime(time) {
  const [h, m] = time.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatMinutes(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ')
}

export const durationLabel = (start, end) => formatMinutes(toMinutes(end) - toMinutes(start))

export const byStart = (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end)

// A day's blocks (sorted by start) with free-time gaps between them. Overlapping blocks
// count as busy until the latest end seen so far, so no gap appears inside an overlap.
export function withGaps(sorted) {
  const rows = []
  let busyUntil = null
  for (const b of sorted) {
    const start = toMinutes(b.start)
    if (busyUntil !== null && start > busyUntil) rows.push({ type: 'gap', key: `gap-${b.id}`, from: busyUntil, to: start, minutes: start - busyUntil })
    rows.push({ type: 'block', key: b.id, block: b })
    busyUntil = Math.max(busyUntil ?? 0, toMinutes(b.end))
  }
  return rows
}

// Hours shown in the grid view.
export const GRID_START = 6 * 60
export const GRID_END = 20 * 60

// Places a day's blocks (sorted by start) side by side where they overlap: each block gets
// a column index and the column count of its overlap cluster, like a calendar app.
export function layoutDay(sorted) {
  const placed = []
  let cluster = []
  let clusterEnd = -1
  let columnEnds = []

  const closeCluster = () => {
    for (const p of cluster) p.cols = columnEnds.length
    cluster = []
    columnEnds = []
  }

  for (const block of sorted) {
    const start = toMinutes(block.start)
    const end = toMinutes(block.end)
    if (start >= clusterEnd) closeCluster()
    let col = columnEnds.findIndex((e) => e <= start)
    if (col === -1) col = columnEnds.length
    columnEnds[col] = end
    const p = { block, col, cols: 1 }
    cluster.push(p)
    placed.push(p)
    clusterEnd = Math.max(clusterEnd, end)
  }
  closeCluster()
  return placed
}
