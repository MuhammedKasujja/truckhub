/**
 * The free block's fixture. Deliberately small: one list of events, one label per event, no
 * calendars to filter, no attendees, no rooms. Everything the paid blocks add lives there, not here.
 */
export interface SimpleEvent {
  id: string
  title: string
  /** Day offset from today, so the month always has something in it whenever it is opened. */
  dayOffset: number
  /** Decimal hours, so 9.5 is 09:30. Keeps the formatting maths readable. */
  start: number
  end: number
  allDay?: boolean
}

export const simpleEvents: SimpleEvent[] = [
  { id: 'v1', title: 'Release review', dayOffset: 0, start: 10, end: 11 },
  { id: 'v2', title: 'ShadcnStore call', dayOffset: 0, start: 15, end: 16 },
  { id: 'v3', title: 'Design critique', dayOffset: 1, start: 11, end: 12 },
  { id: 'v4', title: 'Deep work', dayOffset: 1, start: 13, end: 16 },
  { id: 'v5', title: 'Roadmap planning', dayOffset: 2, start: 10, end: 12 },
  { id: 'v6', title: 'Onboarding: Priya', dayOffset: 3, start: 14, end: 14.75 },
  { id: 'v7', title: 'All hands', dayOffset: 4, start: 11, end: 12 },
  { id: 'v8', title: 'Support handover', dayOffset: 4, start: 16.5, end: 17 },
  { id: 'v9', title: 'Parkrun', dayOffset: 5, start: 8, end: 9 },
  { id: 'v10', title: 'Quarterly review', dayOffset: 8, start: 13, end: 15 },
  { id: 'v11', title: 'Security review', dayOffset: 9, start: 16.5, end: 17.5 },
  { id: 'v12', title: 'Offsite', dayOffset: 11, start: 0, end: 24, allDay: true },
  { id: 'v13', title: 'Pricing workshop', dayOffset: 14, start: 14, end: 16 },
  { id: 'v14', title: 'Renewal: Halcyon', dayOffset: 16, start: 11, end: 11.75 },
  { id: 'v15', title: 'Incident retro', dayOffset: 18, start: 15, end: 16 },
  { id: 'v16', title: 'Board update', dayOffset: -3, start: 10, end: 11.5 },
  { id: 'v17', title: 'Vendor review', dayOffset: -5, start: 15, end: 16 },
  { id: 'v18', title: 'Dentist', dayOffset: -8, start: 8, end: 8.75 },
  { id: 'v19', title: 'Team lunch', dayOffset: -11, start: 12.5, end: 13.5 },
]

export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const formatRange = (event: SimpleEvent) => {
  if (event.allDay) {
    return 'All day'
  }

  const format = (value: number) => {
    const hours = Math.floor(value)
    const minutes = Math.round((value - hours) * 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  return `${format(event.start)} – ${format(event.end)}`
}

/** The compact time a month cell has room for: `9a`, `9:15a`, `4:30p`. */
export const compactTime = (value: number) => {
  const hours = Math.floor(value)
  const minutes = Math.round((value - hours) * 60)
  const suffix = hours >= 12 ? 'p' : 'a'
  const display = hours % 12 === 0 ? 12 : hours % 12
  return minutes === 0 ? `${display}${suffix}` : `${display}:${String(minutes).padStart(2, '0')}${suffix}`
}
