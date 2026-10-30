import { VehicleCategory } from "@/features/settings/vehicle-config/vehicle-categories/types"
import { ColumnDef } from "@tanstack/react-table"
import { VehicleCategoryTableActions } from "./vehicle-category-table-actions"

export function getVehicleCategoryColumns(): ColumnDef<VehicleCategory>[] {
  return [
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => {
        return <p>{row.original.id}</p>
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <p>{row.original.name}</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <VehicleCategoryTableActions category={row.original} />
      },
    },
  ]
}
