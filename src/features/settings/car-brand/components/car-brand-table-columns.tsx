import { Button } from "@/components/ui/button"
import { CarBrand } from "@/features/settings/car-brand/types"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, EyeIcon } from "lucide-react"
import { CarBrandForm } from "./car-brand-form"
import { Can } from "@/components/has-permission"

export function getCarBrandColumns(): ColumnDef<CarBrand>[] {
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
        const brand = row.original
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <Can permission="config:car_brand:edit">
              <CarBrandForm
                initialData={{ ...brand }}
                trigger={
                  <Button variant={"outline"} size={"icon"}>
                    <EditIcon />
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
