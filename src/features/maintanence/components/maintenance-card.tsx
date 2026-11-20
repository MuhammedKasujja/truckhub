import { CalendarCheck, CalendarClock, Truck } from "lucide-react"
import {
  MaintenanceTypeLabel,
  OverdueBadge,
  isOpenStatus,
  isOverdue,
} from "./maintenance-meta"
import type { MaintenanceRecord } from "../types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

type MaintenanceCardProps = {
  record: MaintenanceRecord
  onOpen: () => void
  className?: string
}

/** One task on the board. Clicking anywhere opens its details. */
export function MaintenanceCard({
  record,
  onOpen,
  className,
}: MaintenanceCardProps) {
  const overdue = isOverdue(record)
  const open = isOpenStatus(record.status)
  // Open work shows when it is due; finished work shows when it ended.
  const dueDate = open
    ? (record.expected_end ?? record.scheduled_end)
    : (record.actual_end ?? record.scheduled_end)

  return (
    <article
      onClick={onOpen}
      className={cn(
        "group/card relative flex cursor-pointer flex-col gap-2.5 rounded-lg border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm",
        overdue && "border-destructive/40",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <MaintenanceTypeLabel type={record.type} />
        {overdue && <OverdueBadge />}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onOpen()
        }}
        className="line-clamp-2 text-left text-sm leading-snug font-medium outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
      >
        {record.reason}
      </button>

      <div className="flex items-center gap-1.5 text-xs">
        <Truck className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">
          {record.vehicle.plate_number}
        </span>
        {record.vehicle.number && (
          <span className="truncate text-muted-foreground">
            · {record.vehicle.number}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground tabular-nums">
        <span
          className="inline-flex items-center gap-1"
          title={record.actual_start ? "Started" : "Scheduled start"}
        >
          <CalendarClock className="size-3.5" />
          {formatDate(record.actual_start ?? record.scheduled_start)}
        </span>
        {dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "font-medium text-destructive"
            )}
            title={open ? "Expected completion" : "Finished"}
          >
            <CalendarCheck className="size-3.5" />
            {formatDate(dueDate)}
          </span>
        )}
      </div>
    </article>
  )
}
