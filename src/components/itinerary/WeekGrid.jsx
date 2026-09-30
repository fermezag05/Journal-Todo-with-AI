import Icon from '../Icon.jsx'
import {
  GRID_END, GRID_START, blockColor, formatMinutes, formatTime, fromMinutes, layoutDay, toMinutes, withGaps,
} from '../../lib/itinerary.js'

const HOUR_PX = 48
const px = (mins) => ((mins - GRID_START) / 60) * HOUR_PX
const HOURS = Array.from({ length: (GRID_END - GRID_START) / 60 + 1 }, (_, i) => GRID_START + i * 60)
const MIN_GAP_LABEL = 40 // minutes of visible free time needed to fit a label

// Calendar-style week: hours down the side, activities placed by their start and end times.
// Activities entirely outside the grid's hours are listed in rows above and below it.
export default function WeekGrid({ week, today, now, isNow, onAdd, onEdit }) {
  const days = week.map((d) => {
    const inRange = d.blocks.filter((b) => toMinutes(b.end) > GRID_START && toMinutes(b.start) < GRID_END)
    return {
      ...d,
      placed: layoutDay(inRange),
      before: d.blocks.filter((b) => toMinutes(b.end) <= GRID_START),
      after: d.blocks.filter((b) => toMinutes(b.start) >= GRID_END),
      gaps: withGaps(d.blocks)
        .filter((r) => r.type === 'gap')
        .map((g) => ({ ...g, from: Math.max(g.from, GRID_START), to: Math.min(g.to, GRID_END) }))
        .filter((g) => g.to - g.from >= MIN_GAP_LABEL),
    }
  })
  const hasBefore = days.some((d) => d.before.length)
  const hasAfter = days.some((d) => d.after.length)
  const cols = { '--days': days.length }

  function addAt(e, day) {
    if (e.target !== e.currentTarget) return
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top
    const mins = GRID_START + Math.floor((y / HOUR_PX) * 2) * 30
    onAdd(day, fromMinutes(Math.min(mins, GRID_END - 30)))
  }

  const outsideRow = (key, label) => (
    <div className={`grid-row grid-outside ${key}`} style={cols}>
      <span className="grid-outside-label">{label}</span>
      {days.map((d) => (
        <div key={d.name} className="grid-outside-cell">
          {d[key].map((b) => (
            <button key={b.id} className="outside-chip" style={{ '--block': blockColor(b.color) }} onClick={() => onEdit(b, d.index)}>
              <span className="outside-time">{formatTime(b.start)}</span> {b.title}
            </button>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div className={`week-grid${days.length === 1 ? ' single' : ''}`}>
      <div className="grid-row grid-head" style={cols}>
        <span />
        {days.map((d) => (
          <div key={d.name} className={`grid-day-head${d.index === today ? ' today' : ''}`}>
            <span className="day-long">{d.name}</span>
            <span className="day-short">{d.name.slice(0, 3)}</span>
            {d.index === today && <span className="today-badge">Today</span>}
          </div>
        ))}
      </div>

      {hasBefore && outsideRow('before', 'Before 6 AM')}

      <div className="grid-row grid-body" style={{ ...cols, height: px(GRID_END) }}>
        <div className="grid-times" aria-hidden="true">
          {HOURS.map((h) => (
            <span key={h} className="grid-time" style={{ top: px(h) }}>{formatTime(fromMinutes(h))}</span>
          ))}
        </div>

        {days.map((d) => (
          <div
            key={d.name}
            className={`grid-day${d.index === today ? ' today' : ''}`}
            style={{ backgroundSize: `100% ${HOUR_PX}px` }}
            onClick={(e) => addAt(e, d.index)}
            title="Click an empty slot to add an activity"
          >
            {d.gaps.map((g) => (
              <span key={g.key} className="grid-gap" style={{ top: px(g.from), height: px(g.to) - px(g.from) }}>
                <Icon name="clock" size={11} /> {formatMinutes(g.minutes)} free
              </span>
            ))}

            {d.placed.map(({ block: b, col, cols: n }) => {
              const start = toMinutes(b.start)
              const end = toMinutes(b.end)
              const top = px(Math.max(start, GRID_START))
              const clip = `${start < GRID_START ? ' clip-top' : ''}${end > GRID_END ? ' clip-bottom' : ''}`
              return (
                <button
                  key={b.id}
                  className={`grid-block${d.index === today && isNow(b) ? ' now' : ''}${clip}`}
                  style={{
                    '--block': blockColor(b.color),
                    top,
                    height: px(Math.min(end, GRID_END)) - top,
                    left: `${(col / n) * 100}%`,
                    width: `${100 / n}%`,
                  }}
                  onClick={() => onEdit(b, d.index)}
                  title={`${b.title} · ${formatTime(b.start)} – ${formatTime(b.end)}${b.note ? `\n${b.note}` : ''}`}
                >
                  <span className="grid-block-title">{b.title}</span>
                  <span className="grid-block-time">{formatTime(b.start)} – {formatTime(b.end)}</span>
                </button>
              )
            })}

            {d.index === today && now >= GRID_START && now < GRID_END && (
              <span className="now-line" style={{ top: px(now) }} aria-label={`Now, ${formatTime(fromMinutes(now))}`} />
            )}
          </div>
        ))}
      </div>

      {hasAfter && outsideRow('after', 'After 8 PM')}
    </div>
  )
}
