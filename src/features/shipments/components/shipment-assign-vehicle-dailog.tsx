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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { useState } from "react"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import { cn } from "cn"

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
  const { data: config } = useVehicleConfigurations()

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
            <DialogTitle>Assign Vehicle</DialogTitle>
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
              </div>
            )}
            {shipment?.item.vehicle_category_id && (
              <Item
                variant={filters.category_id ? "muted" : "outline"}
                className={cn(filters.category_id && "border-primary")}
                onClick={() =>
                  setFilters((pre) => ({
                    ...pre,
                    category_id: pre.category_id
                      ? undefined
                      : shipment?.item.vehicle_category_id,
                  }))
                }
              >
                <ItemContent>
                  <ItemDescription>Category</ItemDescription>
                  <ItemTitle>
                    {
                      config?.vehicle_types.find(
                        (e) => e.id === shipment?.item?.vehicle_category_id
                      )?.name
                    }
                  </ItemTitle>
                </ItemContent>
              </Item>
            )}
            <div className="grid grid-cols-2 gap-4">
              {shipment?.item?.car_brand_id && (
                <Item
                  variant={filters.brand_id ? "muted" : "outline"}
                  className={cn(filters.brand_id && "border-primary")}
                  onClick={() =>
                    setFilters((pre) => ({
                      ...pre,
                      category_id: pre.brand_id
                        ? undefined
                        : shipment?.item.car_brand_id,
                    }))
                  }
                >
                  <ItemContent>
                    <ItemDescription>Make</ItemDescription>
                    <ItemTitle>
                      {
                        config?.car_brands.find(
                          (e) => e.id === shipment?.item?.car_brand_id
                        )?.name
                      }
                    </ItemTitle>
                  </ItemContent>
                </Item>
              )}
              {shipment?.item?.car_model_id && (
                <Item
                  variant={filters.model_id ? "muted" : "outline"}
                  className={cn(filters.model_id && "border-primary")}
                  onClick={() =>
                    setFilters((pre) => ({
                      ...pre,
                      category_id: pre.model_id
                        ? undefined
                        : shipment?.item.car_model_id,
                    }))
                  }
                >
                  <ItemContent>
                    <ItemDescription>Model</ItemDescription>
                    <ItemTitle>
                      {
                        config?.car_models.find(
                          (e) => e.id === shipment?.item?.car_model_id
                        )?.name
                      }
                    </ItemTitle>
                  </ItemContent>
                </Item>
              )}
            </div>
            {shipment?.item.estimated_fuel_rate_km && (
              <Item
                variant={filters.consumption_rate ? "muted" : "outline"}
                className={cn(filters.consumption_rate && "border-primary")}
                onClick={() =>
                  setFilters((pre) => ({
                    ...pre,
                    category_id: pre.consumption_rate
                      ? undefined
                      : shipment?.item.estimated_consumption_rate_km?.toString(),
                  }))
                }
              >
                <ItemContent>
                  <ItemDescription>Consumption Rate</ItemDescription>
                  <ItemTitle>
                    {shipment.item.estimated_fuel_rate_km} km / l
                  </ItemTitle>
                </ItemContent>
              </Item>
            )}
            {shipment?.item.tonnage && (
              <Item
                variant={filters.tonnage ? "muted" : "outline"}
                className={cn(filters.tonnage && "border-primary")}
                onClick={() =>
                  setFilters((pre) => ({
                    ...pre,
                    category_id: pre.tonnage
                      ? undefined
                      : shipment?.item.tonnage,
                  }))
                }
              >
                <ItemContent>
                  <ItemDescription>Tonnage</ItemDescription>
                  <ItemTitle>{shipment.item.tonnage} Tons</ItemTitle>
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
