import { Button } from "@/components/ui/button"
import { CarModel } from "@/features/settings/car-model/types"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, EyeIcon } from "lucide-react"
import { CarModelForm } from "./car-brand-form"
import { Can } from "@/components/has-permission"
import { formatNumber } from "@/lib/format"

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
            {model.name}
            {model.manufacture_year && <span className="text-muted-foreground"> ({model.manufacture_year})</span>}
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
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <Can permission="config:car_model:edit">
              <CarModelForm
                initialData={{ ...row.original }}
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
