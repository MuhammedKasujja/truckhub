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
    <Status>
      <StatIndicator color={"success"}>•</StatIndicator>
      <StatusLabel>{status}</StatusLabel>
    </Status>
  )
}
