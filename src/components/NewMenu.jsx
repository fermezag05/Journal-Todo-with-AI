import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useStore } from '../store.jsx'

// "+ New" button with a menu to start a journal entry, a task, or an itinerary activity.
export default function NewMenu({ compact = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { createEntry } = useStore()

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  function newEntry() {
    setOpen(false)
    navigate(`/journal/${createEntry()}`)
  }

  function newTask() {
    setOpen(false)
    navigate('/tasks', { state: { newTask: Date.now() } })
  }

  function newActivity() {
    setOpen(false)
    navigate('/itinerary', { state: { newBlock: Date.now() } })
  }

  return (
    <div className={`new-menu${compact ? ' compact' : ''}`} ref={ref}>
      <button className="new-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} title="New">
        <Icon name="plus" size={18} strokeWidth="2.5" />
        <span className="new-btn-label">New</span>
      </button>
      {open && (
        <div className="menu" role="menu">
          <button role="menuitem" onClick={newEntry}>
            <span className="menu-icon journal"><Icon name="note" size={16} /></span>
            <span>
              <strong>Journal entry</strong>
              <small>Write about your day</small>
            </span>
          </button>
          <button role="menuitem" onClick={newTask}>
            <span className="menu-icon tasks"><Icon name="check" size={16} /></span>
            <span>
              <strong>Task</strong>
              <small>Add something to do</small>
            </span>
          </button>
          <button role="menuitem" onClick={newActivity}>
            <span className="menu-icon itinerary"><Icon name="calendar" size={16} /></span>
            <span>
              <strong>Activity</strong>
              <small>Add a block to your weekly itinerary</small>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
