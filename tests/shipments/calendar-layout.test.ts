import { describe, expect, it } from "vitest"
import {
  fitWeek,
  layoutWeek,
  monthWeeks,
  spansOnDay,
  toShipmentSpans,
  weekRowsForHeight,
} from "../../src/features/shipments/components/calendar/calendar-layout"
import type { Shipment } from "../../src/features/shipments/types"

const shipment = (id: string, start: string, end: string) =>
  ({
    id,
    item: { scheduled_start: start, scheduled_end: end },
  }) as unknown as Shipment

/** Monday 9 Nov 2026 to Sunday 15 Nov 2026. */
const week = monthWeeks(new Date(2026, 10, 1))[2]

const layout = (shipments: Shipment[], maxLanes = 3) =>
  layoutWeek(week, toShipmentSpans(shipments), maxLanes)

const byId = (result: ReturnType<typeof layout>) =>
  Object.fromEntries(result.segments.map((s) => [s.shipment.id, s]))

describe("monthWeeks", () => {
  it("starts weeks on Monday", () => {
    const weeks = monthWeeks(new Date(2026, 10, 1))
    expect(weeks[0][0]).toEqual(new Date(2026, 9, 26))
    expect(weeks.every((days) => days.length === 7)).toBe(true)
  })

  it("renders only the weeks the month touches", () => {
    expect(monthWeeks(new Date(2026, 10, 1))).toHaveLength(6)
    // February 2027 starts on a Monday and fits exactly four rows.
    expect(monthWeeks(new Date(2027, 1, 1))).toHaveLength(4)
  })
})

describe("toShipmentSpans", () => {
  it("drops shipments without a valid start", () => {
    const spans = toShipmentSpans([shipment("a", "nope", "2026-11-10T10:00:00")])
    expect(spans).toEqual([])
  })

  it("collapses a missing or backwards end to the start day", () => {
    const [missing, backwards] = toShipmentSpans([
      shipment("missing", "2026-11-09T08:00:00", "nope"),
      shipment("backwards", "2026-11-10T08:00:00", "2026-11-02T08:00:00"),
    ])
    expect(missing.end).toEqual(new Date(2026, 10, 9))
    expect(backwards.end).toEqual(new Date(2026, 10, 10))
  })

  it("orders by earliest start, then longest", () => {
    const spans = toShipmentSpans([
      shipment("late", "2026-11-11T08:00:00", "2026-11-11T09:00:00"),
      shipment("short", "2026-11-09T08:00:00", "2026-11-09T09:00:00"),
      shipment("long", "2026-11-09T10:00:00", "2026-11-12T09:00:00"),
    ])
    expect(spans.map((s) => s.shipment.id)).toEqual(["long", "short", "late"])
  })
})

describe("layoutWeek", () => {
  it("spans a multi-day shipment across its columns", () => {
    const { a } = byId(
      layout([shipment("a", "2026-11-10T08:00:00", "2026-11-13T17:00:00")])
    )
    expect(a).toMatchObject({
      column: 1,
      length: 4,
      lane: 0,
      continuesBefore: false,
      continuesAfter: false,
    })
  })

  it("counts a shipment ending at any time on a day as covering that day", () => {
    const { a } = byId(
      layout([shipment("a", "2026-11-09T23:00:00", "2026-11-10T00:30:00")])
    )
    expect(a.length).toBe(2)
  })

  it("clips a shipment that runs through the whole week", () => {
    const { a } = byId(
      layout([shipment("a", "2026-11-02T08:00:00", "2026-11-20T17:00:00")])
    )
    expect(a).toMatchObject({
      column: 0,
      length: 7,
      continuesBefore: true,
      continuesAfter: true,
    })
  })

  it("marks only the side that continues", () => {
    const { before, after } = byId(
      layout([
        shipment("before", "2026-11-05T08:00:00", "2026-11-10T17:00:00"),
        shipment("after", "2026-11-14T08:00:00", "2026-11-18T17:00:00"),
      ])
    )
    expect(before).toMatchObject({
      column: 0,
      length: 2,
      continuesBefore: true,
      continuesAfter: false,
    })
    expect(after).toMatchObject({
      column: 5,
      length: 2,
      continuesBefore: false,
      continuesAfter: true,
    })
  })

  it("ignores shipments outside the week", () => {
    const result = layout([
      shipment("a", "2026-11-01T08:00:00", "2026-11-08T23:00:00"),
      shipment("b", "2026-11-16T00:00:00", "2026-11-17T08:00:00"),
    ])
    expect(result.segments).toEqual([])
    expect(result.counts).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it("stacks overlaps and reuses a lane once it is free", () => {
    const { a, b, c } = byId(
      layout([
        shipment("a", "2026-11-09T08:00:00", "2026-11-11T17:00:00"),
        shipment("b", "2026-11-10T08:00:00", "2026-11-12T17:00:00"),
        shipment("c", "2026-11-12T08:00:00", "2026-11-13T17:00:00"),
      ])
    )
    expect(a.lane).toBe(0)
    expect(b.lane).toBe(1)
    expect(c.lane).toBe(0)
  })

  it("does not share a lane between bars touching on the same day", () => {
    const { a, b } = byId(
      layout([
        shipment("a", "2026-11-09T08:00:00", "2026-11-10T17:00:00"),
        shipment("b", "2026-11-10T18:00:00", "2026-11-11T17:00:00"),
      ])
    )
    expect(b.lane).not.toBe(a.lane)
  })

  it("hides bars past the lane limit and counts them per covered day", () => {
    const result = layout(
      [
        shipment("a", "2026-11-09T08:00:00", "2026-11-11T17:00:00"),
        shipment("b", "2026-11-09T08:30:00", "2026-11-11T17:00:00"),
        shipment("c", "2026-11-10T08:00:00", "2026-11-11T17:00:00"),
      ],
      2
    )
    expect(result.segments.map((s) => s.shipment.id)).toEqual(["a", "b"])
    expect(result.hidden).toEqual([0, 1, 1, 0, 0, 0, 0])
    expect(result.counts).toEqual([2, 3, 3, 0, 0, 0, 0])
  })
})

describe("spansOnDay", () => {
  it("includes the first, middle and last day only", () => {
    const spans = toShipmentSpans([
      shipment("a", "2026-11-10T08:00:00", "2026-11-12T01:00:00"),
    ])
    const on = (date: number) => spansOnDay(spans, new Date(2026, 10, date))
    expect(on(9)).toHaveLength(0)
    expect(on(10)).toHaveLength(1)
    expect(on(11)).toHaveLength(1)
    expect(on(12)).toHaveLength(1)
    expect(on(13)).toHaveLength(0)
  })
})

describe("weekRowsForHeight", () => {
  it("fits as many rows as the height allows", () => {
    expect(weekRowsForHeight(131)).toBe(4)
    expect(weekRowsForHeight(130)).toBe(3)
    expect(weekRowsForHeight(200)).toBe(7)
  })

  it("always leaves room for one bar and its overflow link", () => {
    expect(weekRowsForHeight(40)).toBe(2)
  })
})

describe("fitWeek", () => {
  const spans = (count: number) =>
    toShipmentSpans(
      Array.from({ length: count }, (_, index) =>
        shipment(String(index), "2026-11-09T08:00:00", "2026-11-10T17:00:00")
      )
    )

  it("uses every row when all the bars fit", () => {
    const result = fitWeek(week, spans(3), 3)
    expect(result.segments).toHaveLength(3)
    expect(result.hidden).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it("gives up the last row to the overflow link when they do not", () => {
    const result = fitWeek(week, spans(4), 3)
    expect(result.segments).toHaveLength(2)
    expect(result.hidden).toEqual([2, 2, 0, 0, 0, 0, 0])
  })
})
