import { Button } from "@/components/ui/button"
import { Island } from "@/features/settings/islands/types"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, EyeIcon } from "lucide-react"
import { IslandEditForm } from "./island-edit-form"
import { Can } from "@/components/has-permission"

export function getIslandColumns(): ColumnDef<Island>[] {
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
      accessorKey: "locations",
      header: "Locations",
      cell: ({ row }) => {
        return <p>{row.original.locations.length}</p>
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
              <IslandEditForm
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
