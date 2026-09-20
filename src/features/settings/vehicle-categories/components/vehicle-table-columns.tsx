import { Button } from "@/components/ui/button"
import { VehicleType } from "@/features/settings/vehicle-categories/types"
import { ColumnDef } from "@tanstack/react-table"
import { VehicleCategoryForm } from "./vehicle-type-form"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"

export function getVehicleTypeColumns(): ColumnDef<VehicleType>[] {
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
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <ActionIcon action="view" />
            </Button>
            <Can permission="config:vehicle_types:edit">
              <VehicleCategoryForm
                initialData={{ ...row.original }}
                trigger={
                  <Button variant={"outline"} size={"icon"}>
                    <ActionIcon action="edit" />
                  </Button>
                }
              />
            </Can>
          </div>
        )
      },
    },
  ]
}
