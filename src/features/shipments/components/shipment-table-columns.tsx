import { Link } from "@tanstack/react-router"
import { Copy, Eye, Route as RouteIcon } from "lucide-react"
import { toast } from "sonner"
import { tripRoute } from "../format"
import { ShipmentStatusIndicator } from "./shipment-status-indicator"
import type { ColumnDef } from "@tanstack/react-table"
import type { Shipment } from "../types"
import type { TFunction } from "@/i18n"
import type { SetShipmentTableAction } from "./shipment-table-actions"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"

type Props = {
  tr: TFunction
  setRowAction: SetShipmentTableAction
}

async function copyNumber(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${value}`)
  } catch {
    toast.error("Could not copy to clipboard")
  }
}

export function getShipmentTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<Shipment>[] {
  return [
    {
      id: "number",
      header: tr("shipments.shipmentNumber"),
      cell: ({ row }) => {
        const shp = row.original
        return (
          <div className="group min-w-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRowAction({ row, variant: "view" })}
                className="font-medium text-primary hover:underline"
              >
                {shp.number ?? "Unnumbered"}
              </button>
              {shp.number && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => copyNumber(shp.number!)}
                  aria-label={`Copy ${shp.number}`}
                >
                  <Copy className="size-3" />
                </Button>
              )}
            </div>
            {shp.item.display_name && (
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {shp.item.display_name}
              </p>
            )}
          </div>
        )
      },
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => {
        const route = tripRoute(row.original)
        if (!route) return <span className="text-muted-foreground">—</span>
        return (
          <div className="max-w-64 min-w-0 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="truncate">{route.origin}</span>
              <RouteIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{route.destination}</span>
            </div>
            {route.checkpoints.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {route.checkpoints.length} stop
                {route.checkpoints.length === 1 ? "" : "s"} in between
              </p>
            )}
          </div>
        )
      },
    },
    {
      id: "schedule",
      header: tr("common.startDate"),
      cell: ({ row }) => {
        const { scheduled_start, scheduled_end } = row.original.item
        return (
          <div className="text-sm whitespace-nowrap">
            <p>{formatDate(scheduled_start)}</p>
            {scheduled_end && (
              <p className="text-xs text-muted-foreground">
                to {formatDate(scheduled_end)}
              </p>
            )}
          </div>
        )
      },
    },
    {
      id: "vehicle",
      header: tr("common.vehicle"),
      cell: ({ row }) => {
        const vehicle = row.original.vehicle
        if (!vehicle)
          return (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )
        return (
          <Link
            to="/vehicles/$vehicleId/view"
            params={{ vehicleId: vehicle.id }}
            className="group inline-flex flex-col"
          >
            <span className="w-fit rounded border border-foreground/70 bg-amber-300 px-1.5 font-mono text-xs font-bold text-black">
              {vehicle.plate_number}
            </span>
            <span className="text-xs text-muted-foreground group-hover:underline">
              {vehicle.number}
            </span>
          </Link>
        )
      },
    },
    {
      id: "driver",
      header: tr("common.driver"),
      cell: ({ row }) => {
        const driver = row.original.driver
        if (!driver)
          return (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )
        return (
          <div className="text-sm">
            <Link
              to="/drivers/$driverId/view"
              params={{ driverId: driver.id }}
              className="hover:underline"
            >
              {driver.full_name}
            </Link>
            {driver.phone && (
              <a
                href={`tel:${driver.phone.replace(/\s/g, "")}`}
                className="block text-xs text-muted-foreground hover:text-foreground"
              >
                {driver.phone}
              </a>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: tr("common.status"),
      cell: ({ row }) => (
        <ShipmentStatusIndicator status={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      size: 48,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRowAction({ row, variant: "view" })}
          aria-label={`View ${row.original.number ?? "shipment"}`}
        >
          <Eye />
        </Button>
      ),
    },
  ]
}
