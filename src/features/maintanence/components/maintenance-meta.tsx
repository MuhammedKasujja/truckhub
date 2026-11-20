import { IconCircleDotted } from "@tabler/icons-react"
import { ClipboardCheck, Wrench } from "lucide-react"
import type { MaintenanceStatus, MaintenanceType } from "../enums"
import type { MaintenanceRecord } from "../types"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

export const TYPE_ICONS: Record<MaintenanceType, IconType> = {
  routine: IconCircleDotted,
  repair: Wrench,
  inspection: ClipboardCheck,
}

export const TYPE_DESCRIPTIONS: Record<MaintenanceType, string> = {
  routine: "Planned servicing",
  repair: "Fix a fault or damage",
  inspection: "Check and report",
}

export const STATUS_DOTS: Record<MaintenanceStatus, string> = {
  scheduled: "bg-slate-400",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
}

/** The label for moving a task into a status, used on buttons. */
export const TRANSITION_LABELS: Record<MaintenanceStatus, string> = {
  scheduled: "Move back to scheduled",
  in_progress: "Start work",
  completed: "Mark complete",
  cancelled: "Cancel task",
}

export function isOpenStatus(status: MaintenanceStatus) {
  return status === "scheduled" || status === "in_progress"
}

/** Overdue only matters while the work is still open. */
export function isOverdue(record: MaintenanceRecord) {
  return record.is_overdue && isOpenStatus(record.status)
}

export function MaintenanceTypeLabel({
  type,
  className,
}: {
  type: MaintenanceType
  className?: string
}) {
  const tr = useTranslation()
  const Icon = TYPE_ICONS[type]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5" />
      {tr(`maintenance.types.${type}`)}
    </span>
  )
}

export function MaintenanceStatusLabel({
  status,
  className,
}: {
  status: MaintenanceStatus
  className?: string
}) {
  const tr = useTranslation()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", STATUS_DOTS[status])} />
      {tr(`maintenance.statuses.${status}`)}
    </span>
  )
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive",
        className
      )}
    >
      Overdue
    </span>
  )
}
