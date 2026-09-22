import { useEffect, useState } from 'react'

// useState that persists to localStorage under the given key.
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable; keep in-memory state
    }
  }, [key, value])

  return [value, setValue]
}
