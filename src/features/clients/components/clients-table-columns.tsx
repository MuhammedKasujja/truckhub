import { Link } from "@tanstack/react-router"
import { ClientActionsMenu } from "./client-actions-menu"
import { ClientBalance, ClientMonogram, ClientTypeBadge } from "./client-card"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client } from "@/features/clients/types"
import type { TFunction } from "@/i18n"
import { formatDate } from "@/lib/format"

const muted = <span className="text-muted-foreground">—</span>

export function getClientsTableColumns(tr: TFunction): ColumnDef<Client>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: tr("common.client"),
      meta: { label: tr("common.client") },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <ClientMonogram
            client={row.original}
            className="size-8 text-[10px]"
          />
          <div className="min-w-0">
            <Link
              to="/clients/$clientId/view"
              params={{ clientId: row.original.id }}
              className="block truncate font-medium capitalize hover:underline"
            >
              {row.original.name}
            </Link>
            {row.original.number && (
              <p className="text-xs text-muted-foreground">
                {row.original.number}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "client_type",
      header: "Type",
      meta: { label: "Type" },
      enableSorting: false,
      cell: ({ row }) => <ClientTypeBadge type={row.original.client_type} />,
    },
    {
      accessorKey: "email",
      header: tr("common.form.email"),
      meta: { label: tr("common.form.email") },
      cell: ({ row }) => row.original.email || muted,
    },
    {
      accessorKey: "phone",
      header: tr("common.form.phone"),
      meta: { label: tr("common.form.phone") },
      cell: ({ row }) => row.original.phone || muted,
    },
    {
      id: "balance",
      header: "Balance",
      meta: { label: "Balance" },
      enableSorting: false,
      cell: ({ row }) => {
        const balance =
          row.original.financial_summary?.balance ?? row.original.balance
        return <ClientBalance balance={balance} />
      },
    },
    {
      accessorKey: "created_at",
      header: tr("common.form.date"),
      meta: { label: tr("common.form.date") },
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ClientActionsMenu client={row.original} />
        </div>
      ),
    },
  ]
}
