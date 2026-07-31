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
import { FinishShipmentInput, finishShipmentSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFinishShipment } from "../hooks/use-shipment-actions"
import { NumberField, TextareaField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function RecordShipmentDetailsDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { finishShipment, isPending } = useFinishShipment()

  const form = useForm<FinishShipmentInput>({
    resolver: zodResolver(finishShipmentSchema),
    defaultValues: {
      unitId: shipment?.id,
      consumed_fuel_rates: [],
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          onSubmit={form.handleSubmit(finishShipment, (errors) => {
            console.log(errors)
          })}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Record Shipment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <NumberField
              label="End Mileage"
              name="end_mileage"
              control={form.control}
            />
            <NumberField
              label="Distance (km)"
              name="distance_km"
              control={form.control}
            />
            <NumberField
              label="Fuel Rate"
              name="average_fuel_rate_per_km"
              control={form.control}
            />
            <NumberField
              label="Fuel Consumed (litres)"
              name="fuel_used_litres"
              control={form.control}
            />
            <TextareaField
              label="Notes"
              name="note"
              control={form.control}
              required={false}
              placeholder="optional"
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
