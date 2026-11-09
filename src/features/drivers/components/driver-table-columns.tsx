import { Link } from "@tanstack/react-router"
import { DriverActionsMenu } from "./driver-actions-menu"
import { DriverAvatar, DriverRating, DriverVehicle } from "./driver-card"
import type { ColumnDef } from "@tanstack/react-table"
import type { DriverSummary } from "@/features/drivers/types"
import type { TFunction } from "@/i18n"
import { formatDate } from "@/lib/format"

export function getDriverTableColumns(
  tr: TFunction
): ColumnDef<DriverSummary>[] {
  return [
    {
      id: "full_name",
      accessorKey: "full_name",
      header: tr("common.form.name"),
      meta: { label: tr("common.form.name") },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <DriverAvatar driver={row.original} />
          <div className="min-w-0">
            <Link
              to="/drivers/$driverId/view"
              params={{ driverId: row.original.id }}
              className="block truncate font-medium hover:underline"
            >
              {row.original.full_name}
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
      accessorKey: "email",
      header: tr("common.form.email"),
      meta: { label: tr("common.form.email") },
    },
    {
      accessorKey: "phone",
      header: tr("common.form.phone"),
      meta: { label: tr("common.form.phone") },
      cell: ({ row }) =>
        row.original.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "vehicle",
      header: "Vehicle",
      meta: { label: "Vehicle" },
      enableSorting: false,
      cell: ({ row }) => <DriverVehicle driver={row.original} />,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      meta: { label: "Rating" },
      cell: ({ row }) =>
        row.original.rating ? (
          <DriverRating rating={row.original.rating} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
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
          <DriverActionsMenu driver={row.original} />
        </div>
      ),
    },
  ]
}
