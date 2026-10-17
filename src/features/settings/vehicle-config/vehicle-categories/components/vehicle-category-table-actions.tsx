import { Button } from "@/components/ui/button"
import { VehicleCategory, VehicleCategoryTableRowAction } from "../types"
import { ActionIcon } from "@/components/icons"
import { Can } from "@/components/has-permission"
import { VehicleCategoryForm } from "./vehicle-type-form"
import { useEditVehicleCategory } from "../../hooks/use-vehicle-category"

interface TableActionsProps {
  category: VehicleCategory
  setRowAction?: React.Dispatch<
    React.SetStateAction<VehicleCategoryTableRowAction | null>
  >
}

export function VehicleCategoryTableActions({ category }: TableActionsProps) {
  const { mutate: updateCategory } = useEditVehicleCategory()

  return (
    <div className="flex gap-2">
      <Button variant={"outline"} size={"icon"}>
        <ActionIcon action="view" />
      </Button>
      <Can permission="config:vehicle_types:edit">
        <VehicleCategoryForm
          key={category.id}
          mode="edit"
          defaultValues={{ ...category }}
          trigger={
            <Button variant={"outline"} size={"icon"}>
              <ActionIcon action="edit" />
            </Button>
          }
          onSubmit={updateCategory}
        />
      </Can>
    </div>
  )
}
