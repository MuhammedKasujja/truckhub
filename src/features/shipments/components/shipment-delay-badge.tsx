import { ClockAlert } from "lucide-react"
import { DELAY_KIND_LABEL, delaySummary } from "../format"
import type { Shipment } from "../types"
import { cn } from "@/lib/utils"

type Props = {
  shipment: Pick<Shipment, "delay_kind" | "expected_end">
  className?: string
}

/**
 * Marks a trip that is behind its plan. Shown next to the status, because being
 * late is not a status: a late trip is still unassigned, dispatched and so on.
 */
export function ShipmentDelayBadge({ shipment, className }: Props) {
  if (!shipment.delay_kind) return null

  return (
    <span
      title={delaySummary(shipment as Shipment) ?? undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-destructive",
        className
      )}
    >
      <ClockAlert className="size-3" />
      {DELAY_KIND_LABEL[shipment.delay_kind]}
    </span>
  )
}
