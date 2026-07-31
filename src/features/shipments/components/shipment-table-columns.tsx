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
      size: 20,
      maxSize: 16,
      cell: ({ row }) => (
        <ShipmentTableActions
          shipmentRow={{ row }}
          setRowAction={setRowAction}
        />
      ),
    },
    {
      id: "driver",
      header: tr("driver"),
      cell: ({ row }) => {
        const driver = row.original.driver
        if (!driver) return <p>-</p>
        return (
          <Link to="/drivers/$driverId/view" params={{ driverId: driver?.id }}>
            {driver?.name}
          </Link>
        )
      },
    },
    {
      id: "vehicle",
      header: tr("vehicle"),
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
      header: tr("status"),
      cell: ({ row }) => {
        return <Badge variant={"outline"}>{row.original.status}</Badge>
      },
    },
    {
      id: "started_at",
      header: "Start Time",
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
