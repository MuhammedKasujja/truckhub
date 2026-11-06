import { formatDistanceToNowStrict } from "date-fns"
import { ChevronRightIcon } from "lucide-react"
import { getRecordLabel, humanize } from "../utils"
import { AuditActionBadge, AuditActor } from "./audit-log-parts"
import type { ColumnDef } from "@tanstack/react-table"
import type {
  AuditLog,
  AuditLogTableRowAction,
} from "@/features/audit_logs/types"
import type { TFunction } from "@/i18n"
import { formatDateTime } from "@/lib/format"
import { AuditLogSource } from "@/config/constants"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  tr: TFunction
  setRowAction: React.Dispatch<
    React.SetStateAction<AuditLogTableRowAction | null>
  >
}

export function getAuditLogTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<AuditLog>[] {
  return [
    
    {
      accessorKey: "actor_name",
      header: tr("user"),
      cell: ({ row }) => <AuditActor log={row.original} />,
      meta: {
        label: tr("user"),
      },
      size: 200,
    },
    {
      accessorKey: "action",
      header: tr("action"),
      cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
      size: 130,
    },
    {
      accessorKey: "resource_type",
      header: "Record",
      cell: ({ row }) => {
        const record = getRecordLabel(row.original)
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-medium">
              {row.original.resource_type}
            </span>
            {record && (
              <span className="max-w-56 truncate text-xs text-muted-foreground">
                {record}
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "created_at",
      header: "When",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col leading-tight whitespace-nowrap">
                <span className="font-medium">
                  {formatDistanceToNowStrict(date, { addSuffix: true })}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(date)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{date.toLocaleString()}</TooltipContent>
          </Tooltip>
        )
      },
      meta: {
        label: "Date",
        variant: "dateRange",
      },
      enableColumnFilter: true,
      size: 170,
    },
    {
      id: "source",
      accessorKey: "source",
      header: tr("source"),
      // shown inside the actor cell; column kept for the toolbar filter
      cell: () => null,
      meta: {
        label: "Source",
        variant: "select",
        options: AuditLogSource.map((s) => ({ label: humanize(s), value: s })),
      },
      enableColumnFilter: true,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => setRowAction({ row, variant: "view" })}
        >
          Details
          <ChevronRightIcon />
        </Button>
      ),
      size: 100,
    },
  ]
}
