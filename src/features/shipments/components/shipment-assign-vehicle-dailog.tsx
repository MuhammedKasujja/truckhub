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
} from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAssignShipmentVehicle } from "../hooks/use-shipment-actions"
import { SubmitButton } from "@/components/ui/submit-button"
import { VehiclePickerField } from "@/features/vehicles/components"
import { CarBrandPicker } from "@/features/settings/car-brand/components"
import { CarModelPicker } from "@/features/settings/car-model/components"
import { ServicePicker } from "@/features/services/components"
import { Label } from "@/components/ui/label"

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
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <ServicePicker
                      id="service"
                      value={shipment?.item.service_id}
                    />
                  </div>
                )}
                {shipment?.item.car_brand_id && (
                  <div className="space-y-2">
                    <Label htmlFor="car_make">Car Make</Label>
                    <CarBrandPicker
                      id="car_make"
                      value={shipment?.item.car_brand_id}
                    />
                  </div>
                )}
                {shipment?.item.car_model_id && (
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <CarModelPicker
                      id="model"
                      value={shipment?.item.car_model_id}
                    />
                  </div>
                )}
              </div>
            )}
            {shipment?.item.item_type === "truck" && (
              <div>
                <div>Tonnage Capacity</div>
                <div>{shipment.item.tonnage} Tons</div>
              </div>
            )}
            <VehiclePickerField
              label="Vehicle"
              name="vehicleId"
              control={form.control}
              filters={{ status: "available" }}
            />
          </div>
          <DialogFooter>
            <DialogClose>
              {/* <Button type="button" variant={"ghost"}> */}
              Cancle
              {/* </Button> */}
            </DialogClose>
            <SubmitButton isSubmitting={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
