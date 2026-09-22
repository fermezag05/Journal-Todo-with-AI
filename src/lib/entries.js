// Fills in fields missing from entries saved by older versions of the app.
export function normalizeEntry(e) {
  const created = e.createdAt ?? e.date ?? new Date().toISOString()
  return {
    id: e.id ?? crypto.randomUUID(),
    title: e.title ?? '',
    body: e.body ?? e.text ?? '',
    mood: e.mood ?? null,
    energy: e.energy ?? null,
    gratitude: e.gratitude ?? '',
    tags: e.tags ?? [],
    date: e.date ?? created,
    createdAt: created,
    updatedAt: e.updatedAt ?? created,
  }
}

export const isBlankEntry = (e) =>
  !e.title.trim() && !e.body.trim() && !e.mood && !e.energy && !e.gratitude.trim() && e.tags.length === 0

// Moves an ISO timestamp to another calendar day (YYYY-MM-DD), keeping the time of day.
export function withDay(iso, day) {
  const d = new Date(iso)
  const [y, m, dd] = day.split('-').map(Number)
  d.setFullYear(y, m - 1, dd)
  return d.toISOString()
}

export const entryTitle = (e) => e.title.trim() || 'Untitled'

export function snippet(text, length = 140) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > length ? `${flat.slice(0, length).trimEnd()}…` : flat
}
