import Icon from '../Icon.jsx'
import { getMood, moodColor } from '../../lib/moods.js'
import { dayKey, fromDayKey, lastNDays, streak } from '../../lib/dates.js'

const average = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)

// Writing streak, weekly mood and a 14-day mood chart.
export default function MoodInsights({ entries }) {
  const byDay = {}
  for (const e of entries) {
    const key = dayKey(e.date)
    ;(byDay[key] ??= []).push(e)
  }

  const days = lastNDays(14)
  const currentStreak = streak(new Set(Object.keys(byDay)))
  const weekAvg = average(lastNDays(7).flatMap((k) => (byDay[k] ?? []).map((e) => e.mood).filter(Boolean)))
  const weekMood = weekAvg && getMood(Math.round(weekAvg))

  return (
    <div className="mood-insights">
      <div className="stats">
        <div className="stat">
          <span className="stat-icon streak"><Icon name="flame" size={16} /></span>
          <span className="stat-value">{currentStreak}</span>
          <span className="stat-label">day streak</span>
        </div>
        <div className="stat">
          <span className="stat-icon emoji">{weekMood ? weekMood.emoji : '–'}</span>
          <span className="stat-value">{weekMood ? weekMood.label : 'No data'}</span>
          <span className="stat-label">avg mood · 7 days</span>
        </div>
        <div className="stat">
          <span className="stat-icon"><Icon name="note" size={16} /></span>
          <span className="stat-value">{entries.length}</span>
          <span className="stat-label">{entries.length === 1 ? 'entry' : 'entries'}</span>
        </div>
      </div>

      <div className="trend" role="img" aria-label="Mood over the last 14 days">
        {days.map((key) => {
          const dayEntries = byDay[key] ?? []
          const avg = average(dayEntries.map((e) => e.mood).filter(Boolean))
          const date = fromDayKey(key)
          const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
          const title = avg
            ? `${label}: ${getMood(Math.round(avg)).label}`
            : `${label}: ${dayEntries.length ? 'no mood logged' : 'no entry'}`
          return (
            <div key={key} className="trend-day" title={title}>
              <div className="trend-track">
                <div
                  className={`trend-bar${avg ? '' : dayEntries.length ? ' no-mood' : ' no-entry'}`}
                  style={avg ? { height: `${(avg / 5) * 100}%`, background: moodColor(Math.round(avg)) } : undefined}
                />
              </div>
              <span className="trend-label">{date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
