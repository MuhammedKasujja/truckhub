import { ComponentProps, useEffect, useState } from "react"
import { Badge } from "@/components/reui/badge"
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanCommitMeta,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban"

import { cn } from "cn"
import { MaintenanceRecord } from "@/features/maintanence/types"
import { formatDate } from "@/lib/format"
import { useMoveMaintenanceRecord } from "@/features/maintanence/hooks/use-maintenance"
import { MaintenanceStatus } from "@/features/maintanence/enums"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { MaintenanceTaskDialog } from "../maintenance-task-dialog"
import { ActionIcon } from "@/components/icons"

const COLUMN_TITLES: Record<string, { title: string; color: string }> = {
  scheduled: { title: "Scheduled", color: "bg-gray-500" },
  in_progress: { title: "In Progress", color: "bg-blue-500" },
  completed: { title: "Completed", color: "bg-green-500" },
  cancelled: { title: "Cancelled", color: "bg-red-500" },
}

type RecordColumn = Record<string, MaintenanceRecord[]>

type Props = {
  records: RecordColumn
}

export function BoardViewMaintenanceRecord({ records }: Props) {
  const board = useMoveMaintenanceRecord()
  const [columns, setColumns] = useState<RecordColumn>({})
  const [recordToEdit, setRecordToEdit] = useState<MaintenanceRecord>()

  useEffect(() => {
    setColumns(records)
  }, [records])

  const handleValueCommit = (
    _next: RecordColumn,
    meta: KanbanCommitMeta<MaintenanceRecord>
  ) => {
    const previous = meta.previousValue
    if (meta.kind === "item") {
      const item = meta.previousValue[meta.activeContainer].at(meta.overIndex)
      if (item) {
        board.mutate(
          {
            data: {
              maintanenceId: item.id,
              newStatus: meta.overContainer as MaintenanceStatus,
            },
          },
          {
            onError: () => {
              // Roll back to the pre-drag arrangement.
              //  TODO: prefer a refetch here so a newer drag is not clobbered by this snapshot.
              setColumns(previous)
            },
          }
        )
      }
    }
    const label =
      meta.kind === "column"
        ? `Reordered "${COLUMN_TITLES[meta.activeContainer].title ?? meta.activeContainer}"`
        : `Moved to "${COLUMN_TITLES[meta.overContainer].title ?? meta.overContainer}"`

    // toast.promise(persistBoard(), {
    //   loading: "Saving board...",
    //   success: () => label,
    //   error: () => {
    //     setColumns(previous)
    //     return "Could not save. Board restored."
    //   },
    // })
  }

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
      onValueCommit={handleValueCommit}
      draggable={false}
    >
      <KanbanBoard className="grid grid-cols-4 sm:grid-cols-4">
        {Object.entries(columns).map(([colId, features]) => {
          const col = COLUMN_TITLES[colId]
          return (
            <KanbanColumn key={colId} value={colId}>
              <Frame spacing="sm" className="h-full">
                <FrameHeader className="flex flex-row items-center gap-2">
                  <div className={cn("size-2 rounded-full", col.color)} />
                  <FrameTitle className="font-normal capitalize">
                    {col.title}
                  </FrameTitle>
                  <Badge variant="outline" size="sm" className="ml-auto">
                    {features.length}
                  </Badge>
                </FrameHeader>
                <KanbanColumnContent
                  value={colId}
                  className="flex flex-col gap-2 p-0.5"
                >
                  {features.map((feature) => (
                    <MaintenanceCard
                      key={feature.id}
                      record={feature}
                      asHandle
                      onEdit={() => setRecordToEdit(feature)}
                    />
                  ))}
                </KanbanColumnContent>
              </Frame>
            </KanbanColumn>
          )
        })}
      </KanbanBoard>
      <KanbanOverlay className="rounded-md border-2 border-dashed bg-muted/10" />
      <MaintenanceTaskDialog
        open={recordToEdit !== undefined}
        onOpenChange={(open) => {
          if (!open) setRecordToEdit(undefined)
        }}
        record={recordToEdit}
      />
    </Kanban>
  )
}

function MaintenanceCard({
  record,
  asHandle,
  onEdit,
  ...props
}: { record: MaintenanceRecord; asHandle?: boolean; onEdit: () => void } & Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children" | "onEdit"
>) {
  const content = (
    <Frame variant="ghost" spacing="sm" className="p-0">
      <FramePanel className="p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-normal">{record.type}</span>
            {/* {record.status === "scheduled" && ( */}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Edit maintenance task"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onEdit()
              }}
            >
              <ActionIcon action="edit" />
            </Button>
            {/* )} */}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {record.vehicle.plate_number}
          </p>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatDate(record.scheduled_start)}
              </span>
            </div>
          </div>
        </div>
      </FramePanel>
    </Frame>
  )

  return (
    <KanbanItem value={record.id} {...props}>
      {asHandle ? <KanbanItemHandle>{content}</KanbanItemHandle> : content}
    </KanbanItem>
  )
}
