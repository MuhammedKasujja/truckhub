import { Settings, ToolCase } from "lucide-react"
import { MaintenanceType } from "../enums"
import { IconCircleDotted } from "@tabler/icons-react"
import { useTranslation } from "@/i18n"

type Props = {
  type: MaintenanceType
}

function Indicator({ type }: Props) {
  if (type === "repair") {
    return <ToolCase className="size-3" />
  } else if (type === "inspection") {
    return <Settings className="size-3" />
  }
  return <IconCircleDotted className="size-3" />
}

export function MaintenanceTaskTypeIndicator({ type }: Props) {
  const tr = useTranslation()
  return (
    <span className="flex items-center gap-1 text-sm font-normal">
      <Indicator type={type} />
      {tr(`maintenance.types.${type}`)}
    </span>
  )
}
