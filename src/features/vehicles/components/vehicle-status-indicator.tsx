import { Status, StatusLabel } from "@/components/ui/status"
import { VehicleStatus } from "../enums"
import { StatIndicator } from "@/components/ui/stat"

type VehicleStatusIndicatorProps = {
  status: VehicleStatus
}

export function VehicleStatusIndicator({
  status,
}: VehicleStatusIndicatorProps) {
  return (
    <Status className="gap-1 py-0.5">
      <StatIndicator color={"success"}>•</StatIndicator>
      <StatusLabel>{status}</StatusLabel>
    </Status>
  )
}
