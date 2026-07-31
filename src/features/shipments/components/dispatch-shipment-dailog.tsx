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
import { DispatchShipmentInput, dispatchShipmentSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatchShipment } from "../hooks/use-shipment-actions"
import { NumberField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function DispatchShipmentDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { dispatchShipment, isPending } = useDispatchShipment()

  const form = useForm<DispatchShipmentInput>({
    resolver: zodResolver(dispatchShipmentSchema),
    defaultValues: {
      unitId: shipment?.id,
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          onSubmit={form.handleSubmit(dispatchShipment, (errors) => {
            console.log(errors)
          })}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Dispatch Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <NumberField
              label="Vehicle Mileage"
              name="startMileage"
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
