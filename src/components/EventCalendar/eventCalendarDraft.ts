import { fromISO } from '../Calendar/calendarModel'
import { parseMarkupProps } from '../Kanban/kanbanMarkup'
import type { EventCalendarFields, EventCalendarFreq, EventCalendarItem, EventCalendarRule } from './eventCalendarMarkup'

export interface EventCalendarDraft {
  itemId: string | null
  /** The occurrence of a repeat that was opened. */
  occurrence: string | null
  scope: 'one' | 'all'
  title: string
  allDay: boolean
  date: string
  endDate: string | null
  time: string
  endTime: string
  freq: 'none' | EventCalendarFreq
  interval: number
  byDay: number[]
  monthMode: 'day' | 'nth' | 'last'
  monthDay: number
  nth: number
  nthDay: number
  ends: 'never' | 'until' | 'count'
  until: string | null
  count: number
  except: string[]
  tags: string[]
  where: string
  extra: string
}

const KNOWN = new Set(['where', 'from', 'until', 'count', 'except', 'rrule'])

function weekdayOf(iso: string): number {
  return (fromISO(iso).getDay() + 6) % 7
}

function plusHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  return `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function newDraft(date: string, time?: string): EventCalendarDraft {
  return {
    itemId: null,
    occurrence: null,
    scope: 'all',
    title: '',
    allDay: !time,
    date,
    endDate: null,
    time: time ?? '10:00',
    endTime: time ? plusHour(time) : '11:00',
    freq: 'none',
    interval: 1,
    byDay: [weekdayOf(date)],
    monthMode: 'day',
    monthDay: Number(date.slice(8, 10)),
    nth: Math.min(4, Math.ceil(Number(date.slice(8, 10)) / 7)),
    nthDay: weekdayOf(date),
    ends: 'never',
    until: null,
    count: 10,
    except: [],
    tags: [],
    where: '',
    extra: '',
  }
}

export function draftOf(item: EventCalendarItem, occurrence: string | null): EventCalendarDraft {
  const start = item.rule ? (item.rule.from ?? occurrence ?? item.date ?? '') : (item.date ?? '')
  const d = newDraft(start || occurrence || '', item.time ?? undefined)
  d.itemId = item.id
  d.occurrence = item.rule ? occurrence : null
  d.title = item.title
  d.allDay = !item.time
  d.endTime = item.endTime ?? (item.time ? plusHour(item.time) : d.endTime)
  d.endDate = item.endDate
  d.tags = [...item.tags]
  d.where = item.props.get('where') ?? ''
  d.extra = [...item.props].filter(([k]) => !KNOWN.has(k)).map(([k, v]) => (v === '' ? k : `${k}: ${v}`)).join('\n')
  const r = item.rule
  if (r) {
    d.freq = r.freq
    d.interval = r.interval
    if (r.byDay.length && r.freq === 'weekly') d.byDay = r.byDay.map((b) => b.day)
    if (r.freq === 'monthly') {
      if (r.byDay.length === 1 && r.byDay[0].nth !== undefined) {
        d.monthMode = 'nth'
        d.nth = r.byDay[0].nth
        d.nthDay = r.byDay[0].day
      } else if (r.byMonthDay[0] === -1) d.monthMode = 'last'
      else if (r.byMonthDay.length) d.monthDay = r.byMonthDay[0]
    }
    if (r.freq === 'yearly' && r.byMonth.length && r.byMonthDay.length) {
      const y = (start || '2000').slice(0, 4)
      d.date = `${y}-${String(r.byMonth[0]).padStart(2, '0')}-${String(r.byMonthDay[0]).padStart(2, '0')}`
    }
    d.ends = r.until ? 'until' : r.count !== null ? 'count' : 'never'
    d.until = r.until
    d.count = r.count ?? 10
    d.except = [...r.except]
  }
  return d
}

export function ruleOf(d: EventCalendarDraft): EventCalendarRule | null {
  if (d.freq === 'none') return null
  const rule: EventCalendarRule = { freq: d.freq, interval: Math.max(1, d.interval || 1), byDay: [], byMonthDay: [], byMonth: [], from: d.date || null, until: null, count: null, except: [...d.except] }
  if (d.freq === 'weekly') rule.byDay = [...new Set(d.byDay.length ? d.byDay : [weekdayOf(d.date)])].sort().map((day) => ({ day }))
  if (d.freq === 'monthly') {
    if (d.monthMode === 'nth') rule.byDay = [{ day: d.nthDay, nth: d.nth }]
    else rule.byMonthDay = [d.monthMode === 'last' ? -1 : d.monthDay]
  }
  if (d.freq === 'yearly' && d.date) {
    rule.byMonth = [Number(d.date.slice(5, 7))]
    rule.byMonthDay = [Number(d.date.slice(8, 10))]
  }
  if (d.ends === 'until' && d.until) rule.until = d.until
  if (d.ends === 'count') rule.count = Math.max(1, d.count || 1)
  return rule
}

export function fieldsOf(d: EventCalendarDraft, single = false): EventCalendarFields {
  const props = new Map<string, string>()
  if (d.where.trim()) props.set('where', d.where.trim())
  for (const line of d.extra.split('\n')) for (const [k, v] of parseMarkupProps(line)) props.set(k, v)
  const timed = !d.allDay && d.time
  return {
    title: d.title,
    date: single && d.occurrence ? d.occurrence : d.date,
    endDate: !single && d.freq === 'none' && d.endDate && d.endDate > d.date ? d.endDate : null,
    time: timed ? d.time : null,
    endTime: timed && d.endTime && d.endTime > d.time ? d.endTime : null,
    tags: d.tags.map((t) => t.replace(/^#/, '').trim()).filter(Boolean),
    props,
    rule: single ? null : ruleOf(d),
  }
}
