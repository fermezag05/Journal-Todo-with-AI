import { useEffect, useState } from 'react'

const KEY = 'theme'
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')
const resolve = (pref) => (pref === 'system' ? (darkQuery().matches ? 'dark' : 'light') : pref)

// Theme preference: 'light' | 'dark' | 'system'. Applied as <html data-theme>.
// index.html applies the stored theme before first paint to avoid a flash.
export function useTheme() {
  const [pref, setPref] = useState(() => {
    try {
      return localStorage.getItem(KEY) || 'system'
    } catch {
      return 'system'
    }
  })

  useEffect(() => {
    const apply = () => {
      const theme = resolve(pref)
      document.documentElement.dataset.theme = theme
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1e1e1e' : '#ffffff')
    }
    apply()
    try {
      localStorage.setItem(KEY, pref)
    } catch {
      // preference just won't persist
    }
    if (pref !== 'system') return
    const mq = darkQuery()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [pref])

  return [pref, setPref, resolve(pref)]
}
