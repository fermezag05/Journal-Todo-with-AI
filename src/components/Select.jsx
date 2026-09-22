import Icon from './Icon.jsx'

// Native select styled as a chip, with an optional leading icon.
export default function Select({ value, onChange, options, icon, label, active }) {
  return (
    <label className={`select-chip${active ? ' active' : ''}`}>
      {icon && <Icon name={icon} size={13} />}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Icon name="chevron" size={13} className="select-caret" />
    </label>
  )
}
