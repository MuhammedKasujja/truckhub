import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  KanbanBoard,
  KanbanOverlay,
  KanbanItem,
  KanbanColumn,
  KanbanColumnHandle,
  Kanban,
} from "@/components/ui/kanban"
import { GripVertical } from "lucide-react"
import React, { useEffect } from "react"
import { MaintenanceRecord } from "@/features/maintanence/types"
import { formatDate } from "@/lib/format"

type RecordColumn = Record<string, MaintenanceRecord[]>

type Props = {
  records: RecordColumn
}

export function BoardViewMaintenanceRecord({ records }: Props) {
  const [columns, setColumns] = React.useState<RecordColumn>({})

  useEffect(() => {
    setColumns(records)
  }, [records])

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid auto-rows-fr grid-cols-4">
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <MaintenanceRecordColumn
            key={columnValue}
            value={columnValue}
            records={tasks}
          />
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === "column") {
            const records = columns[value] ?? []

            return <MaintenanceRecordColumn value={value} records={records} />
          }

          const record = Object.values(columns)
            .flat()
            .find((record) => record.id === value)

          if (!record) return null

          return <MaintenanceRecordCard record={record} />
        }}
      </KanbanOverlay>
    </Kanban>
  )
}

interface MaintenanceRecordCardProps extends Omit<
  React.ComponentProps<typeof KanbanItem>,
  "value"
> {
  record: MaintenanceRecord
}

function MaintenanceRecordCard({
  record,
  ...props
}: MaintenanceRecordCardProps) {
  return (
    <KanbanItem
      key={record.id}
      value={record.id}
      render={<div className="rounded-md border bg-card p-3 shadow-xs" />}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-sm font-medium">
            {record.type}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-primary/20" />
            <span className="line-clamp-1">{record.vehicle.number}</span>
          </div>
          {record.scheduled_start && (
            <time className="text-[10px] tabular-nums">
              {formatDate(record.scheduled_start)}
            </time>
          )}
        </div>
      </div>
    </KanbanItem>
  )
}

interface MaintenanceRecordColumnProps extends Omit<
  React.ComponentProps<typeof KanbanColumn>,
  "children"
> {
  records: MaintenanceRecord[]
}

function MaintenanceRecordColumn({
  value,
  records,
  ...props
}: MaintenanceRecordColumnProps) {
  return (
    <KanbanColumn value={value} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{value}</span>
          <Badge variant="secondary" className="pointer-events-none">
            {records.length}
          </Badge>
        </div>
        <KanbanColumnHandle render={<Button variant="ghost" size="icon" />}>
          <GripVertical className="h-4 w-4" />
        </KanbanColumnHandle>
      </div>
      <div className="flex flex-col gap-2 p-0.5">
        {records.map((record) => (
          <MaintenanceRecordCard key={record.id} record={record} asHandle />
        ))}
      </div>
    </KanbanColumn>
  )
}
