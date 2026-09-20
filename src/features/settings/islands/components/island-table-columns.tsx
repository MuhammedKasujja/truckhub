import { Button } from "@/components/ui/button"
import { Island } from "@/features/settings/islands/types"
import { ColumnDef } from "@tanstack/react-table"
import { IslandEditForm } from "./island-edit-form"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"

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
        const island = row.original
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <ActionIcon action="view" />
            </Button>
            <Can permission="config:car_brand:edit">
              <IslandEditForm
                initialData={{
                  ...island,
                  locations: island.locations.map((loc) => ({ value: loc })),
                }}
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
