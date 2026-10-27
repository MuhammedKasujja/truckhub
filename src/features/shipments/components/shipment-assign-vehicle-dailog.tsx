import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shipment } from "../types"
import { useForm } from "react-hook-form"
import {
  AssignShipmentVehicleInput,
  assignShipmentVehicleSchema,
  ShipmentVehicleFilters,
} from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAssignShipmentVehicle } from "../hooks/use-shipment-actions"
import { SubmitButton } from "@/components/ui/submit-button"
import { VehiclePickerField } from "@/features/vehicles/components"
import { CarBrandPicker } from "@/features/settings/vehicle-config/car-brand/components"
import { CarModelPicker } from "@/features/settings/vehicle-config/car-model/components"
import { Label } from "@/components/ui/label"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { VehicleCategoryPicker } from "@/features/settings/vehicle-config/vehicle-categories/components"
import { useState } from "react"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ShipmentAssignVehicleDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { assignShipmentVehicle, isPending } = useAssignShipmentVehicle()

  const form = useForm<AssignShipmentVehicleInput>({
    resolver: zodResolver(assignShipmentVehicleSchema),
    defaultValues: {
      unitId: shipment?.id,
    },
  })
  const [filters, setFilters] = useState<ShipmentVehicleFilters>({})

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          onSubmit={form.handleSubmit(assignShipmentVehicle, (errors) => {
            console.log(errors)
          })}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Shipment Assign Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {shipment?.item.item_type === "small" && (
              <div className="space-y-4">
                {shipment?.item.service_id && (
                  <Item variant={"outline"}>
                    <ItemContent>
                      <ItemDescription>Service</ItemDescription>
                      <ItemTitle>{shipment.item.display_name}</ItemTitle>
                    </ItemContent>
                  </Item>
                )}
                {shipment?.item.car_brand_id && (
                  <div className="space-y-2">
                    <Label htmlFor="car_make" className="text-muted-foreground">
                      Make
                    </Label>
                    <CarBrandPicker
                      id="car_make"
                      value={shipment?.item.car_brand_id}
                    />
                  </div>
                )}
                {shipment?.item.car_model_id && (
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-muted-foreground">
                      Model
                    </Label>
                    <CarModelPicker
                      id="model"
                      value={shipment?.item.car_model_id}
                    />
                  </div>
                )}
                {shipment?.item.vehicle_category_id && (
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-muted-foreground">
                      Category
                    </Label>
                    <VehicleCategoryPicker
                      id="category"
                      value={shipment?.item.vehicle_category_id}
                    />
                  </div>
                )}
              </div>
            )}
            {shipment?.item.item_type === "truck" && (
              <Item variant={"outline"}>
                <ItemContent>
                  <ItemDescription>Tonnage Capacity</ItemDescription>
                  <ItemTitle>{shipment.item.tonnage} Tons</ItemTitle>
                </ItemContent>
              </Item>
            )}
            {shipment?.item.estimated_fuel_rate_km && (
              <Item variant={"outline"}>
                <ItemContent>
                  <ItemDescription>Consumption Rate</ItemDescription>
                  <ItemTitle>
                    {shipment.item.estimated_fuel_rate_km} km / l
                  </ItemTitle>
                </ItemContent>
              </Item>
            )}

            <VehiclePickerField
              label="Vehicle"
              name="vehicleId"
              control={form.control}
              filters={{ status: "available", ...filters }}
            />
          </div>
          <DialogFooter>
            <DialogClose>Cancle</DialogClose>
            <SubmitButton isSubmitting={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
