import { Button } from "@/components/ui/button"
import { CarModel, CarModelTableRowAction } from "../types"
import { ActionIcon } from "@/components/icons"
import { Can } from "@/components/has-permission"
import { CarModelForm } from "./car-brand-form"
import { useEditCarModel } from "../../hooks/use-car-model"

interface TableActionsProps {
  model: CarModel
  setRowAction?: React.Dispatch<
    React.SetStateAction<CarModelTableRowAction | null>
  >
}

export function CarModelTableActions({ model }: TableActionsProps) {
  const { mutate: updateCarModel } = useEditCarModel()

  return (
    <div className="flex gap-2">
      <Button variant={"outline"} size={"icon"}>
        <ActionIcon action="view" />
      </Button>
      <Can permission="config:vehicle_config:edit">
        <CarModelForm
          key={model.id}
          mode="edit"
          defaultValues={{ ...model }}
          trigger={
            <Button variant={"outline"} size={"icon"}>
              <ActionIcon action="edit" />
            </Button>
          }
          onSubmit={updateCarModel}
        />
      </Can>
    </div>
  )
}
