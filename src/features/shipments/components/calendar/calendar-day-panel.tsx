import { differenceInCalendarDays } from "date-fns"
import { ArrowRight } from "lucide-react"

import { ShipmentStatusIndicator } from "../shipment-status-indicator"
import { formatRange } from "./sample-data"
import type { ShipmentSpan } from "./calendar-layout"
import type { Shipment } from "@/features/shipments/types"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { tripRoute } from "@/features/shipments/format"

const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })
const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
})

export function CalendarDayPanel({
  date,
  spans,
  onOpenShipment,
}: {
  date: Date
  spans: ShipmentSpan[]
  onOpenShipment: (shipment: Shipment) => void
}) {
  return (
    <section
      aria-label={`Shipments on ${weekday.format(date)}, ${monthDay.format(date)}`}
      className="flex min-h-0 flex-1 flex-col gap-4"
    >
      <header className="flex shrink-0 items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {weekday.format(date)}
          </p>
          <h3 className="text-xl font-semibold tracking-tight">
            {monthDay.format(date)}
          </h3>
        </div>
        {spans.length > 0 ? (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {`${spans.length} shipment${spans.length === 1 ? "" : "s"}`}
          </span>
        ) : null}
      </header>

      {spans.length === 0 ? (
        <Empty className="flex-1 border border-dashed py-8">
          <EmptyHeader>
            <EmptyTitle>Nothing scheduled</EmptyTitle>
            <EmptyDescription>
              Pick another day to see what is on.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex min-h-0 flex-col gap-2 xl:-mr-2 xl:overflow-y-auto xl:pr-2 xl:pb-px">
          {spans.map((span) => (
            <li key={String(span.shipment.id)}>
              <ShipmentCard
                span={span}
                date={date}
                onOpen={() => onOpenShipment(span.shipment)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ShipmentCard({
  span,
  date,
  onOpen,
}: {
  span: ShipmentSpan
  date: Date
  onOpen: () => void
}) {
  const { shipment, start, end } = span
  const route = tripRoute(shipment)
  const totalDays = differenceInCalendarDays(end, start) + 1
  const dayNumber = differenceInCalendarDays(date, start) + 1
  const assignment = [shipment.vehicle?.plate_number, shipment.driver?.full_name]
    .filter(Boolean)
    .join(" · ")

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-2 rounded-lg border bg-background p-3 text-left text-sm shadow-xs transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-medium">
          {shipment.number ?? shipment.item.display_name}
        </span>
        <ShipmentStatusIndicator status={shipment.status} />
      </span>

      {route ? (
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <span className="min-w-0 truncate">{route.origin}</span>
          <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="min-w-0 truncate">{route.destination}</span>
        </span>
      ) : null}

      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
        <span className="min-w-0 truncate">{formatRange(shipment)}</span>
        {totalDays > 1 ? (
          <span className="shrink-0 font-medium">
            {`Day ${dayNumber} of ${totalDays}`}
          </span>
        ) : null}
      </span>

      {assignment ? (
        <span className="truncate border-t pt-2 text-xs text-muted-foreground">
          {assignment}
        </span>
      ) : null}
    </button>
  )
}
