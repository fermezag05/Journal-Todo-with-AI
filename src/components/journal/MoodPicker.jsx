import { MOODS, moodColor } from '../../lib/moods.js'

export default function MoodPicker({ value, onChange }) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="Mood">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={value === m.value}
          className="mood-option"
          style={{ '--mood': moodColor(m.value) }}
          onClick={() => onChange(value === m.value ? null : m.value)}
        >
          <span className="mood-emoji">{m.emoji}</span>
          <span className="mood-label">{m.label}</span>
        </button>
      ))}
    </div>
  )
}
