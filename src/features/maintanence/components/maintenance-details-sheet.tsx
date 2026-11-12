import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Loader2, Truck } from "lucide-react"
import { useMoveMaintenanceRecord } from "../hooks/use-maintenance"
import {
  MaintenanceStatusLabel,
  MaintenanceTypeLabel,
  OverdueBadge,
  TRANSITION_LABELS,
  isOpenStatus,
  isOverdue,
} from "./maintenance-meta"
import type { MaintenanceStatus } from "../enums"
import type { MaintenanceRecord } from "../types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ActionIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type MaintenanceDetailsSheetProps = {
  record: MaintenanceRecord | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (record: MaintenanceRecord) => void
}

// Forward moves first, so the main action sits at the end of the footer.
const TRANSITION_ORDER: MaintenanceStatus[] = [
  "scheduled",
  "cancelled",
  "in_progress",
  "completed",
]

/** Side panel with a task's schedule, progress and status actions. */
export function MaintenanceDetailsSheet({
  record,
  open,
  onOpenChange,
  onEdit,
}: MaintenanceDetailsSheetProps) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("maintenance:edit")
  const canChangeStatus = hasPermission("maintenance:change_status")
  const move = useMoveMaintenanceRecord()
  const [pending, setPending] = useState<MaintenanceStatus>()
  const [confirmCancel, setConfirmCancel] = useState(false)

  function moveTo(status: MaintenanceStatus) {
    if (!record) return
    setPending(status)
    move.mutate(
      { data: { maintanenceId: record.id, newStatus: status } },
      {
        onSuccess: () => setConfirmCancel(false),
        onSettled: () => setPending(undefined),
      }
    )
  }

  const transitions = record
    ? TRANSITION_ORDER.filter((s) => record.allowed_transitions.includes(s))
    : []
  const showEdit = !!record && canEdit && isOpenStatus(record.status)
  const showTransitions = canChangeStatus && transitions.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        {record && (
          <>
            <SheetHeader className="gap-3 border-b pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <MaintenanceStatusLabel status={record.status} />
                <MaintenanceTypeLabel type={record.type} />
                {isOverdue(record) && <OverdueBadge />}
              </div>
              <SheetTitle className="text-lg leading-snug">
                {record.reason}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Maintenance task details
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
              <section className="space-y-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Vehicle
                </h3>
                <Link
                  to="/vehicles/$vehicleId/view"
                  params={{ vehicleId: record.vehicle.id }}
                  className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Truck className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {record.vehicle.plate_number}
                    </span>
                    {record.vehicle.number && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {record.vehicle.number}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </Link>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Timeline
                </h3>
                <MaintenanceTimeline record={record} />
              </section>
            </div>

            {(showEdit || showTransitions) && (
              <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-t">
                {showEdit && (
                  <Button
                    variant="outline"
                    className="mr-auto"
                    onClick={() => onEdit(record)}
                  >
                    <ActionIcon action="edit" />
                    Edit
                  </Button>
                )}
                {showTransitions &&
                  transitions.map((status) => {
                    const isMain =
                      status === "in_progress" || status === "completed"
                    return (
                      <Button
                        key={status}
                        variant={
                          status === "cancelled"
                            ? "ghost"
                            : isMain
                              ? "default"
                              : "outline"
                        }
                        className={cn(
                          status === "cancelled" &&
                            "text-destructive hover:text-destructive"
                        )}
                        disabled={move.isPending}
                        onClick={() =>
                          status === "cancelled"
                            ? setConfirmCancel(true)
                            : moveTo(status)
                        }
                      >
                        {pending === status && (
                          <Loader2 className="animate-spin" />
                        )}
                        {TRANSITION_LABELS[status]}
                      </Button>
                    )
                  })}
              </SheetFooter>
            )}

            <ConfirmDialog
              open={confirmCancel}
              onOpenChange={setConfirmCancel}
              isLoading={pending === "cancelled"}
              title="Cancel this task?"
              description="The task moves to Cancelled and is hidden from the board unless you show cancelled tasks."
              confirmLabel="Cancel task"
              onConfirm={() => moveTo("cancelled")}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

type TimelineStep = {
  label: string
  date: Date | null
  /** Whether this has happened, as opposed to being planned. */
  done: boolean
  tone?: "danger"
}

function MaintenanceTimeline({ record }: { record: MaintenanceRecord }) {
  const overdue = isOverdue(record)
  const steps: TimelineStep[] = [
    { label: "Scheduled start", date: record.scheduled_start, done: false },
    { label: "Started", date: record.actual_start, done: true },
    { label: "Scheduled end", date: record.scheduled_end, done: false },
    {
      label: "Expected completion",
      date: record.expected_end,
      done: false,
      tone: overdue ? "danger" : undefined,
    },
    {
      label: record.status === "cancelled" ? "Closed" : "Finished",
      date: record.actual_end,
      done: true,
    },
  ]
  const visible = steps
    .filter((step) => step.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

  return (
    <ol className="relative space-y-4 pl-5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-px before:bg-border">
      {visible.map((step) => (
        <li key={step.label} className="relative">
          <span
            className={cn(
              "absolute top-1 -left-5 size-[11px] rounded-full border-2 bg-background",
              step.done ? "border-primary bg-primary" : "border-border",
              step.tone === "danger" && "border-destructive"
            )}
          />
          <p
            className={cn(
              "text-xs text-muted-foreground",
              step.tone === "danger" && "text-destructive"
            )}
          >
            {step.label}
            {step.tone === "danger" && " · overdue"}
          </p>
          <p className="text-sm font-medium tabular-nums">
            {formatDateTime(step.date)}
          </p>
        </li>
      ))}
    </ol>
  )
}
