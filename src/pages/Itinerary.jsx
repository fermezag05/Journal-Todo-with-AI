import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import BlockEditor from '../components/itinerary/BlockEditor.jsx'
import WeekGrid from '../components/itinerary/WeekGrid.jsx'
import WeekList from '../components/itinerary/WeekList.jsx'
import { DAYS, byStart, toMinutes, todayIndex } from '../lib/itinerary.js'
import { useStore } from '../store.jsx'
import useLocalStorage from '../useLocalStorage.js'
import useMediaQuery from '../useMediaQuery.js'

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
]

// Minutes since midnight, refreshed every minute so the current activity stays highlighted.
function useNowMinutes() {
  const read = () => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  }
  const [now, setNow] = useState(read)
  useEffect(() => {
    const t = setInterval(() => setNow(read()), 60_000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function Itinerary() {
  const { blocks, addBlock, updateBlock, deleteBlock, removeBlockDay } = useStore()
  const location = useLocation()
  const [view, setView] = useLocalStorage('itinerary-view', 'grid')
  const [editor, setEditor] = useState(null) // { day, start? } to add, { block, day } to edit
  const now = useNowMinutes()
  const today = todayIndex()
  // Phones are too narrow for seven grid columns, so the grid shows one day at a time.
  const narrow = useMediaQuery('(max-width: 699px)')
  const [shownDay, setShownDay] = useState(today)

  // "New → Activity" elsewhere in the app lands here with the editor open for today.
  useEffect(() => {
    if (location.state?.newBlock) setEditor({ day: todayIndex() })
  }, [location.state])

  const week = DAYS.map((name, i) => ({ name, index: i, blocks: blocks.filter((b) => b.days.includes(i)).sort(byStart) }))
  const isNow = (b) => b.days.includes(today) && toMinutes(b.start) <= now && now < toMinutes(b.end)
  const viewProps = {
    today,
    now,
    isNow,
    onAdd: (day, start) => setEditor({ day, start }),
    onEdit: (block, day) => setEditor({ block, day }),
  }

  const subtitle = blocks.length === 0
    ? 'Plan your week once. It repeats every week until you change it.'
    : `${blocks.length} ${blocks.length === 1 ? 'activity' : 'activities'} · repeats every week`

  return (
    <div className="page-scroll">
      <div className="page itinerary">
        <header className="page-header itinerary-header">
          <div>
            <h1>Itinerary</h1>
            <p className="page-sub">{subtitle}</p>
          </div>
          <div className="itinerary-actions">
            <div className="segmented" role="radiogroup" aria-label="View">
              {VIEWS.map((v) => (
                <button key={v.value} role="radio" aria-checked={view === v.value} onClick={() => setView(v.value)}>{v.label}</button>
              ))}
            </div>
            <button className="btn primary" onClick={() => setEditor({ day: narrow && view === 'grid' ? shownDay : today })}>
              <Icon name="plus" size={15} /> Add activity
            </button>
          </div>
        </header>

        {view === 'grid' ? (
          <>
            {narrow && (
              <div className="segmented day-tabs" role="tablist" aria-label="Day">
                {DAYS.map((name, i) => (
                  <button key={name} role="tab" aria-selected={shownDay === i} aria-pressed={shownDay === i}
                    className={i === today ? 'is-today' : ''} onClick={() => setShownDay(i)}>
                    {name.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}
            <WeekGrid week={narrow ? [week[shownDay]] : week} {...viewProps} />
          </>
        ) : (
          <WeekList week={week} {...viewProps} />
        )}
      </div>

      {editor && (
        <BlockEditor
          key={editor.block?.id ?? `new-${editor.day}-${editor.start}`}
          block={editor.block}
          day={editor.day}
          start={editor.start}
          onSave={(form) => (editor.block ? updateBlock(editor.block.id, form) : addBlock(form))}
          onDelete={() => deleteBlock(editor.block)}
          onRemoveDay={() => removeBlockDay(editor.block, editor.day)}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  )
}
