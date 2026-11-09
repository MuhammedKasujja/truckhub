import { useEffect, useMemo, useRef, useState } from "react"
import { addMonths, endOfMonth, startOfDay, startOfMonth } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { ShipmentDetailsDialog } from "../shipment-details-dialog"
import { CalendarDayPanel } from "./calendar-day-panel"
import {
  DEFAULT_WEEK_ROWS,
  monthWeeks,
  overlapsRange,
  spansOnDay,
  toShipmentSpans,
  weekRowsForHeight,
} from "./calendar-layout"
import { CalendarWeekRow } from "./calendar-week-row"
import { toDateString } from "./sample-data"
import type { RefObject } from "react"
import type { Shipment } from "@/features/shipments/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
})

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * From `xl` the grid fills a fixed height, so the rows per week follow from what each week is given.
 * Below that the weeks size themselves from their content, and measuring them would chase its tail.
 */
function useFittedWeekRows(
  weeksRef: RefObject<HTMLDivElement | null>,
  weekCount: number
) {
  const [rows, setRows] = useState(DEFAULT_WEEK_ROWS)

  useEffect(() => {
    const element = weeksRef.current
    if (!element) return

    const fillsHeight = window.matchMedia("(min-width: 80rem)")
    const observer = new ResizeObserver(() =>
      setRows(
        fillsHeight.matches
          ? weekRowsForHeight(element.clientHeight / weekCount)
          : DEFAULT_WEEK_ROWS
      )
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [weeksRef, weekCount])

  return rows
}

/**
 * The plain month view: a grid, a day panel, and nothing else.
 *
 * Deliberately not an application shell. No sidebar, no mini month, no calendar filters, no search,
 * no attendees, no create dialog — those are what the paid calendar blocks are for. This one is the
 * piece you drop into a page that just needs to show a month.
 */
export function CalendarSchedule({ shipments }: { shipments: Shipment[] }) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [anchor, setAnchor] = useState(() => startOfMonth(today))
  const [selected, setSelected] = useState(today)
  const [openShipment, setOpenShipment] = useState<Shipment>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const spans = useMemo(() => toShipmentSpans(shipments), [shipments])
  const weeks = useMemo(() => monthWeeks(anchor), [anchor])
  const weeksRef = useRef<HTMLDivElement>(null)
  const weekRows = useFittedWeekRows(weeksRef, weeks.length)
  const monthCount = useMemo(
    () =>
      spans.filter((span) => overlapsRange(span, anchor, endOfMonth(anchor)))
        .length,
    [spans, anchor]
  )

  const goToToday = () => {
    setAnchor(startOfMonth(today))
    setSelected(today)
  }

  const showShipment = (shipment: Shipment) => {
    setOpenShipment(shipment)
    setDialogOpen(true)
  }

  return (
    <div className="grid gap-6 xl:h-[calc(100vh-9.125rem)] xl:grid-cols-[20rem_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)]">
      <Card className="order-2 xl:order-1">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <CalendarDayPanel
            date={selected}
            spans={spansOnDay(spans, selected)}
            onOpenShipment={showShipment}
          />
        </CardContent>
      </Card>

      <Card className="order-1 xl:order-2">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl tracking-tight">
              {monthFormat.format(anchor)}
            </CardTitle>
            <p className="text-xs text-muted-foreground tabular-nums">
              {`${monthCount} shipment${monthCount === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" onClick={goToToday} className="h-8">
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous month"
              onClick={() => setAnchor(addMonths(anchor, -1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() => setAnchor(addMonths(anchor, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
            <div className="grid shrink-0 grid-cols-7 bg-muted/40 text-xs font-medium text-muted-foreground">
              {dayNames.map((name) => (
                <div key={name} className="px-2 py-2 text-center">
                  <span className="hidden sm:inline">{name}</span>
                  <span className="sm:hidden">{name.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            <div
              ref={weeksRef}
              className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 xl:overflow-y-auto"
            >
              {weeks.map((week) => (
                <CalendarWeekRow
                  key={toDateString(week[0])}
                  week={week}
                  spans={spans}
                  rows={weekRows}
                  month={anchor}
                  today={today}
                  selected={selected}
                  onSelectDay={setSelected}
                  onOpenShipment={showShipment}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ShipmentDetailsDialog
        shipment={openShipment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
