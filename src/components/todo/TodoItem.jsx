import { useState } from 'react'
import Icon from '../Icon.jsx'
import TodoComposer from './TodoComposer.jsx'
import { dayKey } from '../../lib/dates.js'
import { dueLabel, dueStatus, getPriority, priorityColor, todoToForm } from '../../lib/todos.js'

function completedLabel(iso) {
  const d = new Date(iso)
  if (dayKey(d) === dayKey(new Date())) {
    return `Completed today, ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  }
  return `Completed ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export default function TodoItem({ todo, onToggle, onUpdate, onDelete, onTagClick, tagSuggestions }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="todo-item editing">
        <TodoComposer
          initial={todoToForm(todo)}
          onSubmit={(form) => {
            onUpdate(form)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
          submitLabel="Save"
          tagSuggestions={tagSuggestions}
        />
      </li>
    )
  }

  const priority = getPriority(todo.priority)
  const status = dueStatus(todo.due)
  const hasMeta = todo.done ? true : Boolean(todo.due || priority || todo.tag)

  return (
    <li className={`todo-item${todo.done ? ' done' : ''}`} style={{ '--priority': priorityColor(todo.priority) }}>
      <button
        className="check"
        role="checkbox"
        aria-checked={todo.done}
        aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Complete "${todo.text}"`}
        onClick={onToggle}
      >
        <Icon name="tick" size={12} strokeWidth="3" />
      </button>

      <div className="todo-body" onDoubleClick={() => !todo.done && setEditing(true)}>
        <span className="todo-text">{todo.text}</span>
        {hasMeta && (
          <div className="todo-meta">
            {todo.done ? (
              <span className="completed-at">{completedLabel(todo.completedAt)}</span>
            ) : (
              <>
                {todo.due && (
                  <span className={`due ${status}`}>
                    <Icon name={status === 'overdue' ? 'alert' : 'calendar'} size={12} />
                    {status === 'overdue' ? `Overdue · ${dueLabel(todo.due)}` : dueLabel(todo.due)}
                  </span>
                )}
                {priority && (
                  <span className="priority-label">
                    <Icon name="flag" size={12} />
                    {priority.label}
                  </span>
                )}
              </>
            )}
            {todo.tag && (
              <button className="tag" onClick={() => onTagClick(todo.tag)} title={`Show tasks tagged #${todo.tag}`}>
                #{todo.tag}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="todo-actions">
        {!todo.done && (
          <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit task" title="Edit">
            <Icon name="edit" />
          </button>
        )}
        <button className="icon-btn danger" onClick={onDelete} aria-label="Delete task" title="Delete">
          <Icon name="trash" />
        </button>
      </div>
    </li>
  )
}
