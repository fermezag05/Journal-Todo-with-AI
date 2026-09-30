import Icon from '../Icon.jsx'
import { blockColor, daysLabel, durationLabel, formatMinutes, formatTime, withGaps } from '../../lib/itinerary.js'

// One card per day with its activities listed in order and the free time between them.
export default function WeekList({ week, today, isNow, onAdd, onEdit }) {
  return (
    <div className="week">
      {week.map((d) => {
        const rows = withGaps(d.blocks)
        return (
          <section key={d.name} className={`day-col${d.index === today ? ' today' : ''}`} aria-label={d.name}>
            <header className="day-head">
              <span className="day-name">
                <span className="day-long">{d.name}</span>
                <span className="day-short">{d.name.slice(0, 3)}</span>
              </span>
              {d.index === today && <span className="today-badge">Today</span>}
              <button className="icon-btn day-add" onClick={() => onAdd(d.index)} aria-label={`Add activity on ${d.name}`}>
                <Icon name="plus" size={16} />
              </button>
            </header>

            {rows.length > 0 ? (
              <ul className="block-list">
                {rows.map(({ type, key, block: b, minutes }) => (type === 'gap' ? (
                  <li key={key} className="gap">
                    <Icon name="clock" size={12} /> {formatMinutes(minutes)} free
                  </li>
                ) : (
                  <li key={key}>
                    <button
                      className={`block${d.index === today && isNow(b) ? ' now' : ''}`}
                      style={{ '--block': blockColor(b.color) }}
                      onClick={() => onEdit(b, d.index)}
                    >
                      <span className="block-time">
                        {formatTime(b.start)} – {formatTime(b.end)}
                        <span className="block-duration">{durationLabel(b.start, b.end)}</span>
                      </span>
                      <span className="block-title">{b.title}</span>
                      {b.note && <span className="block-note">{b.note}</span>}
                      {b.days.length > 1 && <span className="block-repeat">↻ {daysLabel(b.days)}</span>}
                      {d.index === today && isNow(b) && <span className="now-badge">Now</span>}
                    </button>
                  </li>
                )))}
              </ul>
            ) : (
              <button className="day-empty" onClick={() => onAdd(d.index)}>
                <Icon name="plus" size={14} /> Add
              </button>
            )}
          </section>
        )
      })}
    </div>
  )
}
