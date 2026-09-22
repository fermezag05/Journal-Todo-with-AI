import { useState } from 'react'

const clean = (s) => s.trim().replace(/^#+/, '').toLowerCase().replace(/\s+/g, '-')

export default function TagInput({ tags, onChange, suggestions = [] }) {
  const [text, setText] = useState('')

  function commit() {
    const tag = clean(text)
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setText('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !text && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input">
      {tags.map((t) => (
        <span key={t} className="tag">
          #{t}
          <button type="button" className="tag-remove" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={tags.length ? '' : 'Add tags, e.g. work, family'}
        list="tag-suggestions"
      />
      <datalist id="tag-suggestions">
        {suggestions.filter((s) => !tags.includes(s)).map((s) => <option key={s} value={s} />)}
      </datalist>
    </div>
  )
}
