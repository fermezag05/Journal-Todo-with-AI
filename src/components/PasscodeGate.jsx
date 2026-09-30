import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

// SHA-256 of the passcode. The unlocked state lives only in memory, so every
// page load or reload asks again. This is a client-side gate on a static site:
// it keeps casual visitors out but is not real authentication.
const PASSCODE_HASH = 'bf7a6f8dc01edc317fb982b81bf19931f18be43d97e22320bddbf1273a5e58a6'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function PasscodeGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!unlocked) inputRef.current?.focus()
  }, [unlocked])

  if (unlocked) return children

  const submit = async (e) => {
    e.preventDefault()
    if (!code || checking) return
    setChecking(true)
    const ok = (await sha256(code.trim())) === PASSCODE_HASH
    setChecking(false)
    if (ok) {
      setUnlocked(true)
    } else {
      setError(true)
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="gate">
      <form className="gate-card card" onSubmit={submit}>
        <span className="gate-icon"><Icon name="lock" size={22} /></span>
        <h1 className="gate-title">Enter passcode</h1>
        <p className="gate-sub">This notebook is locked.</p>
        <input
          ref={inputRef}
          className={`gate-input${error ? ' has-error' : ''}`}
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          aria-label="Passcode"
          aria-invalid={error}
          placeholder="Passcode"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
        />
        {error && <p className="gate-error" role="alert">Incorrect passcode. Try again.</p>}
        <button className="primary gate-btn" type="submit" disabled={!code || checking}>
          Unlock
        </button>
      </form>
    </div>
  )
}
