import Icon from './Icon.jsx'

const OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'Auto', icon: 'monitor' },
]

// Full segmented control, plus a single cycling button shown when the sidebar is collapsed.
export default function ThemeSwitcher({ pref, setPref, resolved }) {
  const next = resolved === 'dark' ? 'light' : 'dark'
  return (
    <>
      <div className="theme-switch" role="radiogroup" aria-label="Theme">
        {OPTIONS.map((o) => (
          <button key={o.value} role="radio" aria-checked={pref === o.value} onClick={() => setPref(o.value)} title={`${o.label} theme`}>
            <Icon name={o.icon} size={14} />
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      <button className="theme-toggle" onClick={() => setPref(next)} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
        <Icon name={resolved === 'dark' ? 'sun' : 'moon'} size={18} />
      </button>
    </>
  )
}
