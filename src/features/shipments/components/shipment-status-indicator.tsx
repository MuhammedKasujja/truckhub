import type { ShipmentHistoryStatus, ShipmentStatus } from "../enums"
import { useTranslation } from "@/i18n"
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "info" | "warning" | "error" | "default"

export const SHIPMENT_STATUS_TONE: Record<ShipmentHistoryStatus, StatusTone> = {
  unassigned: "warning",
  vehicle_assigned: "info",
  assigned: "info",
  dispatched: "info",
  in_progress: "info",
  delayed: "error",
  idle: "warning",
  vehicle_reassigned: "warning",
  completed: "success",
  captured_details: "success",
  invoiced: "default",
  cancelled: "default",
}

type Props = {
  status: ShipmentStatus
  className?: string
}

export function ShipmentStatusIndicator({ status, className }: Props) {
  const tr = useTranslation()

  return (
    <Status
      variant={SHIPMENT_STATUS_TONE[status]}
      className={cn("gap-1.5 py-0.5", className)}
    >
      <StatusIndicator />
      <StatusLabel>{tr(`shipments.status.${status}`)}</StatusLabel>
    </Status>
  )
}
