import { Button } from "@/components/ui/button"
import { Vehicle } from "@/features/vehicles/types"
import { ColumnDef } from "@tanstack/react-table"
import { Link } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { VehicleStatusIndicator } from "./vehicle-status-indicator"
import { vehicleStatuses } from "../enums"
import {
  type VehicleRowAction,
  VehicleTableActions,
} from "./vehicle-table-actions"

type Props = {
  setRowAction: VehicleRowAction
}

export function getVehicleTableColumns({
  setRowAction,
}: Props): ColumnDef<Vehicle>[] {
  return [
    {
      id: "left-actions",
      size: 20,
      maxSize: 16,
      cell: ({ row }) => (
        <VehicleTableActions vehicleRow={{ row }} setRowAction={setRowAction} />
      ),
    },
    {
      accessorKey: "number",
      header: "ID",
      cell: ({ row }) => {
        return (
          <Can permission={"vehicles:view"}>
            <Button variant={"link"} asChild>
              <Link
                to={`/vehicles/$vehicleId/view`}
                params={{ vehicleId: row.original.id }}
              >
                {row.original.number}
              </Link>
            </Button>
          </Can>
        )
      },
    },
    {
      id: "model",
      header: "Make/Model",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="space-y-1">
            <div>
              {vehicle.car_model.car_brand.name}/{vehicle.car_model.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {vehicle.plate_number}
            </div>
          </div>
        )
      },
    },
    {
      id: "engine_type",
      header: "Engine",
      cell: ({ row }) => {
        return (
          <p>
            {row.original.engine_type}/ {row.original.gearbox}
          </p>
        )
      },
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => {
        return (
          <p>
            {row.original.color}/ {row.original.interior_color}
          </p>
        )
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <VehicleStatusIndicator status={row.original.status} />
      },
      meta: {
        label: "Status",
        variant: "select",
        options: vehicleStatuses.map((status) => ({
          label: status,
          value: `${status}`,
        })),
      },
      enableColumnFilter: true,
    },
    {
      id: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.original.driver
        return driver == null ? (
          <p>-</p>
        ) : (
          <Can permission="drivers:view">
            <Button variant={"link"} asChild>
              <Link
                to={`/drivers/$driverId/view`}
                params={{ driverId: driver.id }}
              >
                {driver.name}
              </Link>
            </Button>
          </Can>
        )
      },
    },
  ]
}
