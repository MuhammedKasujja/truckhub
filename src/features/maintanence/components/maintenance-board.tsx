import { useMemo, useState } from "react"
import { toast } from "sonner"
import { maintanenceStatuses } from "../enums"
import { useMoveMaintenanceRecord } from "../hooks/use-maintenance"
import { MaintenanceCard } from "./maintenance-card"
import { MaintenanceDetailsSheet } from "./maintenance-details-sheet"
import { STATUS_DOTS } from "./maintenance-meta"
import { EditMaintenanceTaskDialog } from "./maintenance-task-dialog"
import type { KanbanCommitMeta } from "@/components/reui/kanban"
import type { MaintenanceStatus } from "../enums"
import type { MaintenanceRecord } from "../types"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

type RecordColumns = Record<string, MaintenanceRecord[]>

type MaintenanceBoardProps = {
  records: RecordColumns
  showCancelled: boolean
}

/**
 * Tasks in status columns. Dragging a card to another column changes its
 * status, if the task allows that move and the user may change statuses.
 */
export function MaintenanceBoard({
  records,
  showCancelled,
}: MaintenanceBoardProps) {
  const tr = useTranslation()
  const { hasPermission } = usePermissions()
  const canMove = hasPermission("maintenance:change_status")
  const move = useMoveMaintenanceRecord()

  const statuses = useMemo(
    () => maintanenceStatuses.filter((s) => s !== "cancelled" || showCancelled),
    [showCancelled]
  )

  // Local copy so a drag shows straight away; rolled back if the move fails.
  const toColumns = () =>
    Object.fromEntries(statuses.map((s) => [s, records[s] ?? []]))
  const [columns, setColumns] = useState<RecordColumns>(toColumns)
  // Resync during render (not in an effect) so the Kanban value always has a
  // key for every rendered column — e.g. "cancelled" right after it's toggled on.
  const [source, setSource] = useState({ records, statuses })
  if (source.records !== records || source.statuses !== statuses) {
    setSource({ records, statuses })
    setColumns(toColumns())
  }

  const [selectedId, setSelectedId] = useState<MaintenanceRecord["id"]>()
  const [snapshot, setSnapshot] = useState<MaintenanceRecord>()
  const [editing, setEditing] = useState<MaintenanceRecord>()

  // Keep the open sheet in step with refetched data after a change.
  const selected = useMemo(() => {
    if (selectedId === undefined) return undefined
    for (const list of Object.values(records)) {
      const found = list.find((r) => r.id === selectedId)
      if (found) return found
    }
    return snapshot
  }, [records, selectedId, snapshot])

  function openDetails(record: MaintenanceRecord) {
    setSnapshot(record)
    setSelectedId(record.id)
  }

  function handleCommit(
    _next: RecordColumns,
    meta: KanbanCommitMeta<MaintenanceRecord>
  ) {
    if (meta.kind !== "item" || meta.activeContainer === meta.overContainer) {
      return
    }
    const previous = meta.previousValue
    const record = previous[meta.activeContainer].find(
      (r) => String(r.id) === String(meta.event.active.id)
    )
    if (!record) return

    const target = meta.overContainer as MaintenanceStatus
    if (!record.allowed_transitions.includes(target)) {
      setColumns(previous)
      toast.error(
        `Can't move a ${tr(`maintenance.statuses.${record.status}`).toLowerCase()} task to ${tr(`maintenance.statuses.${target}`).toLowerCase()}`
      )
      return
    }

    move.mutate(
      { data: { maintanenceId: record.id, newStatus: target } },
      // The board refetches on success; on failure put the card back.
      { onError: () => setColumns(previous) }
    )
  }

  return (
    <>
      <Kanban
        value={columns}
        onValueChange={setColumns}
        getItemValue={(item) => String(item.id)}
        onValueCommit={handleCommit}
      >
        <KanbanBoard
          className={cn(
            "grid auto-cols-[minmax(17rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2",
            "lg:auto-cols-auto lg:grid-flow-row",
            showCancelled ? "lg:grid-cols-4" : "lg:grid-cols-3"
          )}
        >
          {statuses.map((status) => {
            const tasks = columns[status] ?? []
            return (
              <KanbanColumn
                key={status}
                value={status}
                className="flex min-h-80 flex-col rounded-xl border bg-muted/40 p-2"
              >
                <div className="flex items-center gap-2 px-1.5 pt-1 pb-2.5">
                  <span
                    className={cn("size-2 rounded-full", STATUS_DOTS[status])}
                  />
                  <h2 className="text-sm font-semibold">
                    {tr(`maintenance.statuses.${status}`)}
                  </h2>
                  <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                    {tasks.length}
                  </span>
                </div>
                <KanbanColumnContent
                  value={status}
                  className="flex flex-1 flex-col gap-2"
                >
                  {tasks.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center text-xs text-muted-foreground">
                      {canMove ? "No tasks · drop one here" : "No tasks"}
                    </p>
                  ) : (
                    tasks.map((record) => {
                      const card = (
                        <MaintenanceCard
                          record={record}
                          onOpen={() => openDetails(record)}
                        />
                      )
                      const draggable =
                        canMove && record.allowed_transitions.length > 0
                      return (
                        <KanbanItem key={record.id} value={String(record.id)}>
                          {draggable ? (
                            <KanbanItemHandle>{card}</KanbanItemHandle>
                          ) : (
                            card
                          )}
                        </KanbanItem>
                      )
                    })
                  )}
                </KanbanColumnContent>
              </KanbanColumn>
            )
          })}
        </KanbanBoard>
        <KanbanOverlay className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5" />
      </Kanban>

      <MaintenanceDetailsSheet
        record={selected}
        open={selectedId !== undefined}
        onOpenChange={(open) => {
          if (!open) setSelectedId(undefined)
        }}
        onEdit={setEditing}
      />

      {editing && (
        <EditMaintenanceTaskDialog
          key={editing.id}
          record={editing}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(undefined)
          }}
        />
      )}
    </>
  )
}

export function MaintenanceBoardSkeleton({
  columns = 3,
}: {
  columns?: number
}) {
  return (
    <div
      aria-busy="true"
      className={cn(
        "grid gap-4",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border bg-muted/40 p-2">
          <Skeleton className="m-1.5 h-4 w-28" />
          {Array.from({ length: 3 - (i % 2) }).map((__, j) => (
            <Skeleton key={j} className="h-32 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}
