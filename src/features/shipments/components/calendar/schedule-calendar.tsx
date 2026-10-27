import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type Shipment } from "@/features/shipments/types"

import { CalendarDayPanel } from "./calendar-day-panel"
import { toDateString } from "./sample-data"

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
})

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/** Two chips is what a cell this size holds; the rest roll into a "+n more" line. */
const MAX_CHIPS = 2

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * Weeks start on Monday, which is what most of the world outside the US expects. The row count is
 * derived rather than fixed at six, so a short month never renders a whole empty trailing week.
 */
function monthGrid(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const dayCount = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0
  ).getDate()
  const weeks = Math.ceil((offset + dayCount) / 7)
  const start = addDays(first, -offset)
  return Array.from({ length: weeks * 7 }, (_, index) => addDays(start, index))
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
  const [anchor, setAnchor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selected, setSelected] = useState(today)

  const events = useMemo(() => {
    const map = new Map<string, Shipment[]>()

    for (const shipment of shipments) {
      const start = new Date(shipment.item.scheduled_start)
      const scheduledEnd = new Date(shipment.item.scheduled_end)
      if (Number.isNaN(start.getTime())) continue

      const startDay = startOfDay(start)
      const endDay =
        Number.isNaN(scheduledEnd.getTime()) || scheduledEnd < startDay
          ? startDay
          : startOfDay(scheduledEnd)

      for (let day = startDay; day <= endDay; day = addDays(day, 1)) {
        const key = toDateString(day)
        const list = map.get(key) ?? []
        list.push(shipment)
        map.set(key, list)
      }
    }

    for (const list of map.values()) {
      list.sort(
        (left, right) =>
          new Date(left.item.scheduled_start).getTime() -
          new Date(right.item.scheduled_start).getTime()
      )
    }

    return map
  }, [shipments])

  const days = useMemo(() => monthGrid(anchor), [anchor])
  const todayStr = toDateString(today)
  const selectedStr = toDateString(selected)

  const shiftMonth = (delta: number) =>
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1))

  const goToToday = () => {
    setAnchor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(today)
  }

  return (
    <div className="grid grid-cols-7 gap-6">
      <Card className="col-span-2">
        <CardContent>
          <CalendarDayPanel
            date={selected}
            events={events.get(selectedStr) ?? []}
          />
        </CardContent>
      </Card>
      <div className="col-span-5 w-full bg-background">
        <div className="w-full">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-xl tracking-tight">
                {monthFormat.format(anchor)}
              </CardTitle>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                >
                  <ChevronLeft />
                </Button>
                <Button variant="outline" onClick={goToToday} className="h-8">
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next month"
                  onClick={() => shiftMonth(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-xl border bg-border">
                <div className="grid grid-cols-7 bg-card text-xs font-medium text-muted-foreground">
                  {dayNames.map((name) => (
                    <div key={name} className="px-2 py-2.5 text-center">
                      <span className="hidden sm:inline">{name}</span>
                      <span className="sm:hidden">{name.slice(0, 1)}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px border-t pt-px">
                  {days.map((day) => {
                    const dateStr = toDateString(day)
                    const inMonth = day.getMonth() === anchor.getMonth()
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedStr
                    const dayEvents = events.get(dateStr) ?? []
                    const shown = dayEvents.slice(0, MAX_CHIPS)
                    const overflow = dayEvents.length - shown.length

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelected(day)}
                        aria-pressed={isSelected}
                        aria-label={`${day.toDateString()}, ${dayEvents.length} events`}
                        className={cn(
                          "relative flex min-h-16 flex-col gap-1 p-1.5 text-left transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-24",
                          inMonth
                            ? "bg-card hover:bg-accent/50"
                            : "bg-muted/40 hover:bg-accent/40",
                          isSelected && "z-10 ring-2 ring-ring/60 ring-inset"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums",
                            isToday
                              ? "bg-primary font-semibold text-primary-foreground"
                              : inMonth
                                ? "font-medium"
                                : "text-muted-foreground"
                          )}
                        >
                          {day.getDate()}
                        </span>

                        {/* A seven-column month at 390px gives each cell about 50px — too narrow for a
                          chip, so phones get a dot per event and the panel below carries the detail. */}
                        <span className="flex min-h-2 flex-wrap items-start gap-1 sm:hidden">
                          {dayEvents.slice(0, 4).map((event) => (
                            <span
                              key={event.id}
                              aria-hidden="true"
                              className={cn(
                                "size-1.5 rounded-full bg-foreground",
                                inMonth ? undefined : "opacity-50"
                              )}
                            />
                          ))}
                        </span>

                        <span className="hidden min-w-0 flex-col gap-0.5 sm:flex">
                          {shown.map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "flex w-full min-w-0 items-center gap-1.5 rounded bg-muted px-1.5 py-0.5 text-xs leading-5",
                                inMonth ? undefined : "opacity-60"
                              )}
                            >
                              {/* {toDateString(
                              new Date(event.item.scheduled_start)
                            ) === dateStr ? (
                              <span className="shrink-0 text-[0.6875rem] tabular-nums opacity-70">
                                {compactTime(
                                  new Date(event.item.scheduled_start)
                                )}
                              </span>
                            ) : null} */}
                              <span className="min-w-0 flex-1 truncate font-medium">
                                {event.number ?? event.item.display_name}
                              </span>
                            </span>
                          ))}

                          {overflow > 0 ? (
                            <span className="px-1.5 text-xs text-muted-foreground">{`+${overflow} more`}</span>
                          ) : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
