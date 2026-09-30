import { useEffect, useRef, useState } from 'react'
import AutoTextarea from '../AutoTextarea.jsx'
import Icon from '../Icon.jsx'
import { BLOCK_COLORS, DAYS, blockToForm, daysLabel, emptyBlockForm, toMinutes } from '../../lib/itinerary.js'

// Dialog for adding or editing an activity. `day` is the column it was opened from, and
// `start` an optional start time for a new activity (from clicking an empty grid slot).
export default function BlockEditor({ block, day, start, onSave, onDelete, onRemoveDay, onClose }) {
  const ref = useRef(null)
  const [form, setForm] = useState(() => (block ? blockToForm(block) : emptyBlockForm(day, start)))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const editing = Boolean(block)
  const repeating = editing && block.days.length > 1

  useEffect(() => {
    ref.current.showModal()
  }, [])

  const timesSet = Boolean(form.start && form.end)
  const badTimes = timesSet && toMinutes(form.end) <= toMinutes(form.start)
  const canSave = form.title.trim() && form.days.length > 0 && timesSet && !badTimes

  function toggleDay(i) {
    update({ days: form.days.includes(i) ? form.days.filter((d) => d !== i) : [...form.days, i].sort() })
  }

  function submit(e) {
    e.preventDefault()
    if (!canSave) return
    onSave(form)
    onClose()
  }

  function done(action) {
    action()
    onClose()
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="block-editor-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onMouseDown={(e) => e.target === ref.current && onClose()}
    >
      <form className="block-form" onSubmit={submit}>
        <header className="modal-head">
          <h2 id="block-editor-title">{editing ? 'Edit activity' : 'New activity'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </header>

        <input
          className="block-title-input"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Activity name"
          aria-label="Activity name"
          autoFocus
        />

        <div className="field">
          <span className="field-label">Repeats on</span>
          <div className="day-picker" role="group" aria-label="Repeats on">
            {DAYS.map((name, i) => (
              <button
                key={name}
                type="button"
                role="checkbox"
                aria-checked={form.days.includes(i)}
                className="option-chip"
                onClick={() => toggleDay(i)}
                title={name}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="day-presets">
            <button type="button" className="link-btn" onClick={() => update({ days: [0, 1, 2, 3, 4] })}>Weekdays</button>
            <button type="button" className="link-btn" onClick={() => update({ days: [5, 6] })}>Weekends</button>
            <button type="button" className="link-btn" onClick={() => update({ days: [0, 1, 2, 3, 4, 5, 6] })}>Every day</button>
            <span className="field-hint">
              {form.days.length ? `Repeats weekly: ${daysLabel(form.days)}` : 'Pick at least one day'}
            </span>
          </div>
        </div>

        <div className="field time-fields">
          <label>
            <span className="field-label">Start</span>
            <input type="time" className="input" value={form.start} onChange={(e) => update({ start: e.target.value })} required />
          </label>
          <label>
            <span className="field-label">End</span>
            <input type="time" className="input" value={form.end} onChange={(e) => update({ end: e.target.value })} required />
          </label>
        </div>
        {badTimes && <p className="form-error">End time must be after the start time.</p>}

        <div className="field">
          <span className="field-label">Color</span>
          <div className="swatches" role="radiogroup" aria-label="Color">
            {BLOCK_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={form.color === c.value}
                aria-label={c.label}
                title={c.label}
                className="swatch"
                style={{ '--swatch': c.css }}
                onClick={() => update({ color: c.value })}
              >
                <Icon name="tick" size={12} strokeWidth="3" />
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Note</span>
          <AutoTextarea
            className="input"
            minRows={2}
            value={form.note}
            onChange={(e) => update({ note: e.target.value })}
            placeholder="Optional details, like a location"
          />
        </label>

        {confirmDelete ? (
          <div className="delete-choice" role="group" aria-label="Delete activity">
            <span>Delete this activity from:</span>
            <button type="button" className="btn sm" onClick={() => done(onRemoveDay)}>Only {DAYS[day]}</button>
            <button type="button" className="btn sm danger" onClick={() => done(onDelete)}>All {block.days.length} days</button>
            <button type="button" className="link-btn subtle" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        ) : (
          <footer className="modal-foot">
            {editing && (
              <button
                type="button"
                className="ghost danger"
                onClick={() => (repeating && block.days.includes(day) ? setConfirmDelete(true) : done(onDelete))}
              >
                <Icon name="trash" size={15} /> Delete
              </button>
            )}
            <span className="spacer" />
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={!canSave}>{editing ? 'Save' : 'Add activity'}</button>
          </footer>
        )}
      </form>
    </dialog>
  )
}
