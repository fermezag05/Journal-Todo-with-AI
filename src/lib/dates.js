// Local-time YYYY-MM-DD key for grouping entries by calendar day.
export function dayKey(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromDayKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function dayLabel(key) {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (key === dayKey(today)) return 'Today'
  if (key === dayKey(yesterday)) return 'Yesterday'
  const d = fromDayKey(key)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() && { year: 'numeric' }),
  })
}

// Day keys for the last n days, oldest first, ending today.
export function lastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(dayKey(d))
  }
  return days
}

// Consecutive days with an entry, counting back from today (or yesterday if today is empty).
export function streak(daysWithEntries) {
  const d = new Date()
  if (!daysWithEntries.has(dayKey(d))) d.setDate(d.getDate() - 1)
  let count = 0
  while (daysWithEntries.has(dayKey(d))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
