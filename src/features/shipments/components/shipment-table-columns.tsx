import { ColumnDef } from "@tanstack/react-table"
import { Shipment } from "../types"
import { TFunction } from "@/i18n"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Link } from "@tanstack/react-router"
import {
  SetShipmentTableAction,
  ShipmentTableActions,
} from "./shipment-table-actions"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"

type Props = {
  tr: TFunction
  setRowAction: SetShipmentTableAction
}

export function getShipmentTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<Shipment>[] {
  return [
    {
      id: "left-actions",
      header: tr("shipments.shipmentNumber"),
      size: 20,
      maxSize: 16,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => setRowAction({ row, variant: "view" })}
            className="cursor-pointer"
          >
            {row.original.number}
          </Button>
          <CopyIcon className="size-3.5" />
        </div>
        // <ShipmentTableActions
        //   shipmentRow={{ row }}
        //   setRowAction={setRowAction}
        // />
      ),
    },
    {
      id: "driver",
      header: tr("common.driver"),
      cell: ({ row }) => {
        const driver = row.original.driver
        if (!driver) return <p>-</p>
        return (
          <div className="space-y-0.5">
            <Link
              to="/drivers/$driverId/view"
              params={{ driverId: driver?.id }}
            >
              {driver?.fullname}
            </Link>
            <div className="text-xs text-muted-foreground">{driver.phone}</div>
          </div>
        )
      },
    },
    {
      id: "vehicle",
      header: tr("common.vehicle"),
      cell: ({ row }) => {
        const vehicle = row.original.vehicle
        if (!vehicle) return <p>-</p>
        return (
          <Link
            to="/vehicles/$vehicleId/view"
            params={{ vehicleId: vehicle?.id }}
          >
            {vehicle?.plate_number}
          </Link>
        )
      },
    },
    {
      accessorKey: "status",
      header: tr("common.status"),
      cell: ({ row }) => {
        return (
          <Badge variant={"outline"}>
            {tr(`shipments.status.${row.original.status}`)}
          </Badge>
        )
      },
    },
    {
      id: "started_at",
      header: tr("common.startDate"),
      cell: ({ row }) => {
        return (
          <p>
            {formatDate(row.original.item.scheduled_start, {
              timeStyle: undefined,
            })}
          </p>
        )
      },
    },
  ]
}
