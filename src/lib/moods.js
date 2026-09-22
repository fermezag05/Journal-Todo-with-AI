export const MOODS = [
  { value: 1, label: 'Awful', emoji: '😣' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Great', emoji: '😄' },
]

export const ENERGY = [
  { value: 1, label: 'Drained' },
  { value: 2, label: 'Steady' },
  { value: 3, label: 'Energized' },
]

export const getMood = (value) => MOODS.find((m) => m.value === value)
export const getEnergy = (value) => ENERGY.find((e) => e.value === value)
export const moodColor = (value) => `var(--mood-${value})`
