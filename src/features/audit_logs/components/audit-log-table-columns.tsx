import type { ColumnDef } from "@tanstack/react-table"
import type {
  AuditLog,
  AuditLogTableRowAction,
} from "@/features/audit_logs/types"
import { TFunction } from "@/i18n"
import { formatDate } from "@/lib/format"
import { ActionButton } from "@/components/ui/action-button"
import { EyeIcon, Trash2Icon } from "lucide-react"
import { AuditLogSource } from "@/config/constants"
import { Button } from "@/components/ui/button"

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
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.actor_name}</div>
      },
      meta: {
        label: tr("user"),
      },
    },
    {
      accessorKey: "action",
      header: tr("action"),
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.action}</div>
      },
    },
    {
      id: "source",
      accessorKey: "source",
      header: tr("source"),
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.source}</div>
      },
      meta: {
        label: "Source",
        variant: "select",
        options: AuditLogSource.map((s) => ({ label: s, value: s })),
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "created_at",
      header: tr("payments.date"),
      cell: ({ row }) => {
        return <p>{formatDate(row.original.created_at)}</p>
      },
      meta: {
        label: tr("payments.date"),
        variant: "dateRange",
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              size={"icon"}
              variant={"outline"}
              onClick={() => setRowAction({ row, variant: "view" })}
            >
              <EyeIcon />
            </Button>
            <ActionButton
              variant={"destructive"}
              size={"icon"}
              requireAreYouSure
              action={async () => {
                return { error: true, message: "Not implemented yet...." }
              }}
            >
              <Trash2Icon />
            </ActionButton>
          </div>
        )
      },
      size: 100,
    },
  ]
}
