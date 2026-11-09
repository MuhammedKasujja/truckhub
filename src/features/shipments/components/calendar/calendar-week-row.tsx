import { isSameDay, isSameMonth } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { SHIPMENT_STATUS_TONE } from "../shipment-status-indicator"
import { fitWeek } from "./calendar-layout"
import { formatRange, toDateString } from "./sample-data"
import type { StatusTone } from "../shipment-status-indicator"
import type { ShipmentSpan, WeekSegment } from "./calendar-layout"
import type { Shipment } from "@/features/shipments/types"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

const TONE_DOT: Record<StatusTone, string> = {
  success: "bg-green-600 dark:bg-green-400",
  info: "bg-blue-600 dark:bg-blue-400",
  warning: "bg-orange-600 dark:bg-orange-400",
  error: "bg-destructive",
  default: "bg-muted-foreground",
}

type CalendarWeekRowProps = {
  week: Date[]
  spans: ShipmentSpan[]
  /** Rows of bars this week has room for, including any "+n more" row. */
  rows: number
  month: Date
  today: Date
  selected: Date
  onSelectDay: (day: Date) => void
  onOpenShipment: (shipment: Shipment) => void
}

/**
 * One row of the month: day cells behind, shipment bars over them. They are separate layers because
 * a bar crosses several days, so it can't live inside any one day's button. The bar layer ignores
 * pointer events apart from the bars themselves, which lets clicks reach the cells underneath.
 */
export function CalendarWeekRow({
  week,
  spans,
  rows,
  month,
  today,
  selected,
  onSelectDay,
  onOpenShipment,
}: CalendarWeekRowProps) {
  const { segments, counts, hidden } = fitWeek(week, spans, rows)

  return (
    <div className="relative border-t xl:min-h-22">
      <div className="absolute inset-0 grid grid-cols-7">
        {week.map((day, index) => {
          const inMonth = isSameMonth(day, month)
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, selected)
          const count = counts[index]

          return (
            <button
              key={toDateString(day)}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={isSelected}
              aria-label={`${day.toDateString()}, ${count} shipment${count === 1 ? "" : "s"}`}
              className={cn(
                "flex flex-col items-start border-r p-1 text-left transition-colors last:border-r-0 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset sm:p-1.5",
                inMonth ? "hover:bg-muted/50" : "bg-muted/40 hover:bg-muted/70",
                isSelected &&
                  "bg-primary/5 ring-1 ring-primary/40 ring-inset hover:bg-primary/10"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : isSelected
                      ? "font-semibold text-primary"
                      : inMonth
                        ? "font-medium"
                        : "text-muted-foreground"
                )}
              >
                {day.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* `weekRowsForHeight` depends on this spacing, so keep the two in step. */}
      <div
        style={{ "--week-rows": rows } as React.CSSProperties}
        className="pointer-events-none relative grid grid-cols-7 grid-rows-[repeat(var(--week-rows),0.375rem)] gap-y-0.5 pt-8 pb-2 sm:grid-rows-[repeat(var(--week-rows),1.25rem)] sm:pt-9"
      >
        {segments.map((segment) => (
          <ShipmentBar
            key={String(segment.shipment.id)}
            segment={segment}
            dimmed={
              !isSameMonth(week[segment.column], month) &&
              !isSameMonth(week[segment.column + segment.length - 1], month)
            }
            onOpen={() => onOpenShipment(segment.shipment)}
          />
        ))}

        {hidden.map((count, index) =>
          count > 0 ? (
            <button
              key={index}
              type="button"
              onClick={() => onSelectDay(week[index])}
              style={{ gridColumn: index + 1, gridRow: rows }}
              className="pointer-events-auto hidden min-w-0 truncate rounded-md px-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:block"
            >
              {`+${count} more`}
            </button>
          ) : null
        )}
      </div>
    </div>
  )
}

/**
 * Phones get about 50px per day, too narrow for text, so a bar there is a thin line that leaves taps
 * to the day cell and the panel below it. From `sm` up it is a labelled, clickable bar. Flat edges
 * and chevrons mark a shipment that carries on from or into the neighbouring week.
 */
function ShipmentBar({
  segment,
  dimmed,
  onOpen,
}: {
  segment: WeekSegment
  dimmed: boolean
  onOpen: () => void
}) {
  const tr = useTranslation()
  const { shipment, column, length, lane, continuesBefore, continuesAfter } =
    segment
  const name = shipment.number ?? shipment.item.display_name
  const status = tr(`shipments.status.${shipment.status}`)
  const description = `${name} · ${status} · ${formatRange(shipment)}`
  const cancelled = shipment.status === "cancelled"

  return (
    <button
      type="button"
      onClick={onOpen}
      title={description}
      aria-label={description}
      style={{
        gridColumn: `${column + 1} / span ${length}`,
        gridRow: lane + 1,
      }}
      className={cn(
        "flex min-w-0 items-center gap-1.5 bg-muted-foreground/40 text-left text-xs transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:pointer-events-auto sm:border sm:bg-background sm:px-1.5 sm:shadow-xs sm:hover:bg-muted",
        continuesBefore ? "sm:border-l-0" : "ml-1 rounded-l-md",
        continuesAfter ? "sm:border-r-0" : "mr-1 rounded-r-md",
        dimmed && "opacity-50"
      )}
    >
      <span className="hidden min-w-0 flex-1 items-center gap-1.5 sm:flex">
        {continuesBefore ? (
          <ChevronLeft
            aria-hidden="true"
            className="size-3 shrink-0 text-muted-foreground"
          />
        ) : null}
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            TONE_DOT[SHIPMENT_STATUS_TONE[shipment.status]]
          )}
        />
        <span
          className={cn(
            "min-w-0 truncate font-medium",
            cancelled && "text-muted-foreground line-through"
          )}
        >
          {name}
        </span>
        {length > 1 && shipment.vehicle ? (
          <span className="min-w-0 truncate text-muted-foreground">
            {shipment.vehicle.plate_number}
          </span>
        ) : null}
        {continuesAfter ? (
          <ChevronRight
            aria-hidden="true"
            className="ml-auto size-3 shrink-0 text-muted-foreground"
          />
        ) : null}
      </span>
    </button>
  )
}
