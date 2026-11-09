import {
  addDays,
  differenceInCalendarDays,
  eachWeekOfInterval,
  endOfMonth,
  max,
  min,
  startOfDay,
  startOfMonth,
} from "date-fns"
import type { Shipment } from "@/features/shipments/types"

/** A shipment reduced to the whole local days it occupies on the calendar. */
export type ShipmentSpan = {
  shipment: Shipment
  start: Date
  end: Date
}

/** The part of a shipment's span that falls within one week row. */
export type WeekSegment = {
  shipment: Shipment
  /** Zero-based day of the week the bar starts on. */
  column: number
  /** How many day columns the bar covers. */
  length: number
  /** Zero-based vertical slot within the week. */
  lane: number
  continuesBefore: boolean
  continuesAfter: boolean
}

export type WeekLayout = {
  /** Bars that fit in the visible lanes. */
  segments: WeekSegment[]
  /** Shipments on each day, visible or not. */
  counts: number[]
  /** Shipments on each day that did not fit in the visible lanes. */
  hidden: number[]
}

const DAYS_IN_WEEK = 7

/** Rows a week shows when its height is set by its content rather than by the space available. */
export const DEFAULT_WEEK_ROWS = 4

/** Top border, day number and bottom padding of a week: must match `CalendarWeekRow`'s classes. */
const WEEK_CHROME_PX = 45
/** A 20px row plus the 2px gap between rows: must match `CalendarWeekRow`'s classes. */
const WEEK_ROW_PX = 22

/** How many rows fit in a week of this height, never fewer than one bar and its "+n more". */
export const weekRowsForHeight = (height: number) =>
  Math.max(2, Math.floor((height - WEEK_CHROME_PX + 2) / WEEK_ROW_PX))

/** The Monday-first weeks a month touches, so a short month never renders an empty trailing row. */
export function monthWeeks(anchor: Date): Date[][] {
  const weekStarts = eachWeekOfInterval(
    { start: startOfMonth(anchor), end: endOfMonth(anchor) },
    { weekStartsOn: 1 }
  )
  return weekStarts.map((weekStart) =>
    Array.from({ length: DAYS_IN_WEEK }, (_, day) => addDays(weekStart, day))
  )
}

/**
 * Shipments without a usable start are dropped, and a missing or backwards end collapses to a single
 * day. Earliest and then longest come first, which keeps long bars on the top lanes and gives
 * `layoutWeek` the order its first-fit placement needs.
 */
export function toShipmentSpans(shipments: Shipment[]): ShipmentSpan[] {
  const spans: ShipmentSpan[] = []

  for (const shipment of shipments) {
    const scheduledStart = new Date(shipment.item.scheduled_start)
    if (Number.isNaN(scheduledStart.getTime())) continue

    const scheduledEnd = new Date(shipment.item.scheduled_end)
    const start = startOfDay(scheduledStart)
    const end =
      Number.isNaN(scheduledEnd.getTime()) || scheduledEnd < start
        ? start
        : startOfDay(scheduledEnd)

    spans.push({ shipment, start, end })
  }

  return spans.sort(
    (left, right) =>
      left.start.getTime() - right.start.getTime() ||
      right.end.getTime() - left.end.getTime() ||
      new Date(left.shipment.item.scheduled_start).getTime() -
        new Date(right.shipment.item.scheduled_start).getTime()
  )
}

export const overlapsRange = (span: ShipmentSpan, from: Date, to: Date) =>
  span.start <= to && span.end >= from

export const spansOnDay = (spans: ShipmentSpan[], day: Date) =>
  spans.filter((span) => overlapsRange(span, day, day))

/**
 * Clips each span to the week and stacks the resulting bars so none overlap. Anything landing at or
 * past `maxLanes` is left out of `segments` and counted in `hidden` for each day it covers.
 */
export function layoutWeek(
  week: Date[],
  spans: ShipmentSpan[],
  maxLanes: number
): WeekLayout {
  const weekStart = week[0]
  const weekEnd = week[week.length - 1]
  const segments: WeekSegment[] = []
  const counts: number[] = new Array(week.length).fill(0)
  const hidden: number[] = new Array(week.length).fill(0)
  /** The last column occupied in each lane. */
  const laneEnds: number[] = []

  for (const span of spans) {
    if (!overlapsRange(span, weekStart, weekEnd)) continue

    const column = differenceInCalendarDays(
      max([span.start, weekStart]),
      weekStart
    )
    const lastColumn = differenceInCalendarDays(
      min([span.end, weekEnd]),
      weekStart
    )

    let lane = laneEnds.findIndex((end) => end < column)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = lastColumn

    for (let day = column; day <= lastColumn; day++) {
      counts[day]++
      if (lane >= maxLanes) hidden[day]++
    }

    if (lane < maxLanes) {
      segments.push({
        shipment: span.shipment,
        column,
        length: lastColumn - column + 1,
        lane,
        continuesBefore: span.start < weekStart,
        continuesAfter: span.end > weekEnd,
      })
    }
  }

  return { segments, counts, hidden }
}

/**
 * Lays a week out in `rows` rows. Every row can hold a bar when everything fits; otherwise the last
 * one is given up to the "+n more" links.
 */
export function fitWeek(
  week: Date[],
  spans: ShipmentSpan[],
  rows: number
): WeekLayout {
  const layout = layoutWeek(week, spans, rows)
  return layout.hidden.some((count) => count > 0)
    ? layoutWeek(week, spans, rows - 1)
    : layout
}
