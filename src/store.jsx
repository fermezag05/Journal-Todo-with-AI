import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { isBlankEntry, normalizeEntry } from './lib/entries.js'
import { formToTodo, normalizeTodo } from './lib/todos.js'

const StoreContext = createContext(null)

// Shared app data: journal entries, tasks, and the undo toast.
export function StoreProvider({ children }) {
  const [rawEntries, setRawEntries] = useLocalStorage('journal-entries', [])
  const [rawTodos, setRawTodos] = useLocalStorage('todos', [])
  const [toast, setToast] = useState(null)

  const entries = useMemo(
    () => rawEntries.map(normalizeEntry).sort((a, b) => b.date.localeCompare(a.date)),
    [rawEntries],
  )
  const todos = useMemo(() => rawTodos.map(normalizeTodo), [rawTodos])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [toast])

  // One-time cleanup: drop blank entries and turn an old unsaved draft into a real entry.
  useEffect(() => {
    let draftEntry = null
    try {
      const draft = JSON.parse(localStorage.getItem('journal-draft'))
      localStorage.removeItem('journal-draft')
      if (draft) {
        const now = new Date().toISOString()
        draftEntry = normalizeEntry({ ...draft, id: crypto.randomUUID(), date: now, createdAt: now })
      }
    } catch {
      // no readable draft
    }
    setRawEntries((prev) => {
      const next = prev.map(normalizeEntry).filter((e) => !isBlankEntry(e))
      if (draftEntry && !isBlankEntry(draftEntry)) next.push(draftEntry)
      return next
    })
  }, [setRawEntries])

  const createEntry = useCallback(() => {
    const now = new Date().toISOString()
    const entry = normalizeEntry({ id: crypto.randomUUID(), date: now, createdAt: now })
    setRawEntries((prev) => [...prev, entry])
    return entry.id
  }, [setRawEntries])

  const updateEntry = useCallback((id, patch) => {
    const now = new Date().toISOString()
    setRawEntries((prev) => prev.map((e) => (e.id === id ? { ...normalizeEntry(e), ...patch, updatedAt: now } : e)))
  }, [setRawEntries])

  const deleteEntry = useCallback((entry, { silent = false } = {}) => {
    setRawEntries((prev) => prev.filter((e) => e.id !== entry.id))
    if (!silent) {
      setToast({ message: 'Entry deleted', undo: () => setRawEntries((prev) => [...prev, entry]) })
    }
  }, [setRawEntries])

  const addTodo = useCallback((form) => {
    const now = new Date().toISOString()
    setRawTodos((prev) => [...prev, { id: crypto.randomUUID(), ...formToTodo(form), done: false, createdAt: now, completedAt: null }])
  }, [setRawTodos])

  const updateTodo = useCallback((id, form) => {
    setRawTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...formToTodo(form) } : t)))
  }, [setRawTodos])

  const toggleTodo = useCallback((id) => {
    setRawTodos((prev) => prev.map((t) =>
      t.id === id ? { ...t, done: !t.done, completedAt: t.done ? null : new Date().toISOString() } : t,
    ))
  }, [setRawTodos])

  const deleteTodos = useCallback((items, message) => {
    const ids = new Set(items.map((t) => t.id))
    setRawTodos((prev) => prev.filter((t) => !ids.has(t.id)))
    setToast({ message, undo: () => setRawTodos((prev) => [...prev, ...items]) })
  }, [setRawTodos])

  const value = {
    entries, createEntry, updateEntry, deleteEntry,
    todos, addTodo, updateTodo, toggleTodo, deleteTodos,
    toast, setToast,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
