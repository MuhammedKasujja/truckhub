import { vehicleStatusMeta } from "../format"
import type { VehicleStatus } from "../enums"
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status"
import { cn } from "@/lib/utils"

type VehicleStatusIndicatorProps = {
  status: VehicleStatus
  className?: string
}

export function VehicleStatusIndicator({
  status,
  className,
}: VehicleStatusIndicatorProps) {
  const { label, tone } = vehicleStatusMeta(status)

  return (
    <Status variant={tone} className={cn("gap-1.5 py-0.5", className)}>
      <StatusIndicator />
      <StatusLabel>{label}</StatusLabel>
    </Status>
  )
}
