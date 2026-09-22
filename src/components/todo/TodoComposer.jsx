import { useState } from 'react'
import Icon from '../Icon.jsx'
import { PRIORITIES, addDays, emptyTodoForm, priorityColor } from '../../lib/todos.js'

// Form for adding a task, or editing one when onCancel is provided.
export default function TodoComposer({ initial, onSubmit, onCancel, submitLabel = 'Add task', tagSuggestions = [] }) {
  const [form, setForm] = useState(() => initial ?? emptyTodoForm())
  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const today = addDays(0)
  const tomorrow = addDays(1)

  function submit(e) {
    e.preventDefault()
    if (!form.text.trim()) return
    onSubmit(form)
    if (!onCancel) setForm((f) => ({ ...emptyTodoForm(), tag: f.tag }))
  }

  return (
    <form
      className={`card todo-composer${onCancel ? ' editing' : ''}`}
      onSubmit={submit}
      onKeyDown={(e) => e.key === 'Escape' && onCancel?.()}
    >
      <div className="todo-composer-main">
        {!onCancel && <Icon name="plus" className="add-icon" />}
        <input
          className="todo-text-input"
          value={form.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="Add a task…"
          aria-label="Task"
          autoFocus={Boolean(onCancel)}
        />
      </div>

      <div className="todo-composer-bar">
        <div className="option-row">
          <div className="chip-group" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={form.priority === p.value}
                className="option-chip"
                style={{ '--chip': priorityColor(p.value) }}
                onClick={() => update({ priority: form.priority === p.value ? 0 : p.value })}
                title={`${p.label} priority`}
              >
                <Icon name="flag" size={13} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="chip-group" aria-label="Due date">
            <button type="button" className="option-chip" aria-pressed={form.due === today}
              onClick={() => update({ due: form.due === today ? '' : today })}>
              Today
            </button>
            <button type="button" className="option-chip" aria-pressed={form.due === tomorrow}
              onClick={() => update({ due: form.due === tomorrow ? '' : tomorrow })}>
              Tomorrow
            </button>
            <label className={`option-chip date-chip${form.due && form.due !== today && form.due !== tomorrow ? ' set' : ''}`}>
              <input type="date" value={form.due} onChange={(e) => update({ due: e.target.value })} aria-label="Due date" />
            </label>
          </div>

          <label className="option-chip tag-chip">
            <span aria-hidden="true">#</span>
            <input
              value={form.tag}
              onChange={(e) => update({ tag: e.target.value })}
              placeholder="tag"
              list="todo-tag-suggestions"
              aria-label="Tag"
            />
            <datalist id="todo-tag-suggestions">
              {tagSuggestions.map((t) => <option key={t} value={t} />)}
            </datalist>
          </label>
        </div>

        <div className="actions">
          {onCancel && <button type="button" className="ghost" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="primary" disabled={!form.text.trim()}>{submitLabel}</button>
        </div>
      </div>
    </form>
  )
}
