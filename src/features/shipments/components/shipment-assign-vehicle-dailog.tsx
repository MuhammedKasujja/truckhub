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
            <VehiclePickerField
              label="Vehicle"
              name="vehicleId"
              control={form.control}
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
