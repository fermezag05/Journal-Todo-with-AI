import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import useLocalStorage from './useLocalStorage.js'
import { isBlankEntry, normalizeEntry } from './lib/entries.js'
import { formToTodo, normalizeTodo } from './lib/todos.js'
import { DAYS, formToBlock, mergeDuplicateBlocks, normalizeBlock } from './lib/itinerary.js'

const StoreContext = createContext(null)

// Shared app data: journal entries, tasks, the weekly itinerary, and the undo toast.
export function StoreProvider({ children }) {
  const [rawEntries, setRawEntries] = useLocalStorage('journal-entries', [])
  const [rawTodos, setRawTodos] = useLocalStorage('todos', [])
  const [rawBlocks, setRawBlocks] = useLocalStorage('itinerary', [])
  const [toast, setToast] = useState(null)

  const entries = useMemo(
    () => rawEntries.map(normalizeEntry).sort((a, b) => b.date.localeCompare(a.date)),
    [rawEntries],
  )
  const todos = useMemo(() => rawTodos.map(normalizeTodo), [rawTodos])
  const blocks = useMemo(() => rawBlocks.map(normalizeBlock), [rawBlocks])

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

  // One-time migration: one block per activity, repeating on a list of days.
  useEffect(() => {
    setRawBlocks((prev) => mergeDuplicateBlocks(prev.map(normalizeBlock)))
  }, [setRawBlocks])

  const addBlock = useCallback((form) => {
    setRawBlocks((prev) => [...prev, { id: crypto.randomUUID(), ...formToBlock(form) }])
  }, [setRawBlocks])

  const updateBlock = useCallback((id, form) => {
    setRawBlocks((prev) => prev.map((b) => (b.id === id ? { id, ...formToBlock(form) } : b)))
  }, [setRawBlocks])

  const deleteBlock = useCallback((block) => {
    setRawBlocks((prev) => prev.filter((b) => b.id !== block.id))
    setToast({ message: 'Activity deleted', undo: () => setRawBlocks((prev) => [...prev, block]) })
  }, [setRawBlocks])

  // Takes one day out of a repeating block; the other days keep it.
  const removeBlockDay = useCallback((block, day) => {
    setRawBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, days: block.days.filter((d) => d !== day) } : b)))
    setToast({
      message: `Removed from ${DAYS[day]}`,
      undo: () => setRawBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b))),
    })
  }, [setRawBlocks])

  const value = {
    entries, createEntry, updateEntry, deleteEntry,
    todos, addTodo, updateTodo, toggleTodo, deleteTodos,
    blocks, addBlock, updateBlock, deleteBlock, removeBlockDay,
    toast, setToast,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
