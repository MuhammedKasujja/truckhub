import { CarModel } from "@/features/settings/vehicle-config/car-model/types"
import { ColumnDef } from "@tanstack/react-table"
import { formatNumber } from "@/lib/format"
import { CarModelTableActions } from "./car-model-table-actions"

export function getCarModelColumns(): ColumnDef<CarModel>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return <p>{row.original.id}</p>
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const model = row.original
        return (
          <p>
            {model?.car_brand?.name} {model.name}
            {model.manufacture_year && (
              <span className="text-muted-foreground">
                {" "}
                ({model.manufacture_year})
              </span>
            )}
          </p>
        )
      },
    },
    {
      accessorKey: "consumption_rate",
      header: "Consumption Rate",
      cell: ({ row }) => {
        return <p>{formatNumber(row.original.consumption_rate)} km/l</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <CarModelTableActions model={row.original} />,
    },
  ]
}
