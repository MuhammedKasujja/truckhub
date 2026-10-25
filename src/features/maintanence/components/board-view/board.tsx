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
import { MaintenanceRecord } from "../../types"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import { useMoveMaintenanceRecord } from "../../hooks/use-maintenance"
import { MaintenanceStatus } from "../../enums"

const COLUMN_TITLES: Record<string, { title: string; color: string }> = {
  scheduled: { title: "Scheduled", color: "bg-blue-500" },
  in_progress: { title: "In Progress", color: "bg-yellow-500" },
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
                  <FrameTitle className="capitalize">{col.title}</FrameTitle>
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
                    />
                  ))}
                </KanbanColumnContent>
              </Frame>
            </KanbanColumn>
          )
        })}
      </KanbanBoard>
      <KanbanOverlay className="rounded-md border-2 border-dashed bg-muted/10" />
    </Kanban>
  )
}

function MaintenanceCard({
  record,
  asHandle,
  ...props
}: { record: MaintenanceRecord; asHandle?: boolean } & Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children"
>) {
  const content = (
    <Frame variant="ghost" spacing="sm" className="p-0">
      <FramePanel className="p-3">
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-medium">{record.type}</span>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {record.vehicle.number}
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
