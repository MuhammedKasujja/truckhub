import { formatDaysHint, formatHoursRange } from "./route-format"
import type { ColumnDef } from "@tanstack/react-table"
import type { BookingRoute } from "../schemas"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ConfigCardMenu } from "@/features/settings/vehicle-config/_components/config-ui"
import { formatNumber } from "@/lib/format"

/** Edit and delete handlers for one route. */
export type BookingRouteActions = {
  onEdit: (route: BookingRoute) => void
  onDelete: (route: BookingRoute) => void
}

export function getBookingRoutesColumns(
  actions?: BookingRouteActions
): ColumnDef<BookingRoute>[] {
  return [
    {
      id: "route",
      accessorFn: (route) => `${route.origin} ${route.destination}`,
      sortingFn: (a, b) =>
        a.original.origin.localeCompare(b.original.origin) ||
        a.original.destination.localeCompare(b.original.destination),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Route" />
      ),
      cell: ({ row }) => <RouteCell route={row.original} />,
      enableHiding: false,
    },
    {
      accessorKey: "distance_km",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label="Distance"
          className="ml-auto"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums">
          <span className="font-semibold">
            {formatNumber(row.original.distance_km, { fallback: "0" })}
          </span>{" "}
          <span className="text-xs text-muted-foreground">km</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: "delivery",
      accessorFn: (route) => route.max_hrs,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Delivery time" />
      ),
      cell: ({ row }) => {
        const { min_hrs, max_hrs } = row.original
        const hint = formatDaysHint(min_hrs, max_hrs)
        return (
          <div className="tabular-nums">
            <p className="font-medium">{formatHoursRange(min_hrs, max_hrs)}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
        )
      },
      enableHiding: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) =>
        actions && (
          <div className="flex justify-end">
            <ConfigCardMenu
              label={`${row.original.origin} to ${row.original.destination}`}
              onEdit={() => actions.onEdit(row.original)}
              onDelete={() => actions.onDelete(row.original)}
              editPermission="config:routes:edit"
              deletePermission="config:routes:delete"
            />
          </div>
        ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}

/** Origin → destination as a small two-stop timeline. */
function RouteCell({ route }: { route: BookingRoute }) {
  return (
    <div className="flex min-w-0 items-stretch gap-3 py-0.5">
      <div
        aria-hidden
        className="flex shrink-0 flex-col items-center py-1.5"
      >
        <span className="size-2 rounded-full border-2 border-primary bg-background" />
        <span className="w-px flex-1 bg-border" />
        <span className="size-2 rounded-full bg-primary" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm">
          <span className="sr-only">From </span>
          {route.origin}
        </p>
        <p className="truncate text-sm font-semibold">
          <span className="sr-only">To </span>
          {route.destination}
        </p>
      </div>
    </div>
  )
}
