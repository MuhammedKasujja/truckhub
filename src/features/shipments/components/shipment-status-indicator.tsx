import { Badge } from "@/components/reui/badge"
import { ShipmentStatus } from "../enums"
import { useTranslation } from "@/i18n"

type Props = {
  status: ShipmentStatus
}

function getStatusColor(status: ShipmentStatus) {
  if (status == "completed") return "success-outline"
  else if (status == "in_progress") return "secondary"
  else if (status == "cancelled") return "destructive-light"
  else if (status == "invoiced") return "warning-light"
  else if (status == "vehicle_assigned" || status == "assigned") return "focus-light"
  return "invert-light"
}

export function ShipmentStatusIndicator({ status }: Props) {
  const tr = useTranslation()

  return (
    <Badge radius={"full"} variant={getStatusColor(status)}>
      <span className="ms-px size-1.25 rounded-full! bg-[currentColor]" />
      {tr(`shipments.status.${status}`)}
    </Badge>
  )
}
