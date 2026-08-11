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
  AssignShipmentDriverInput,
  assignShipmentDriverSchema,
} from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAssignShipmentDriver } from "../hooks/use-shipment-actions"
import { SubmitButton } from "@/components/ui/submit-button"
import { DriverPickerField } from "@/features/drivers/components"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ShipmentAssignDriverDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { assignShipmentDriver, isPending } = useAssignShipmentDriver()

  const form = useForm<AssignShipmentDriverInput>({
    resolver: zodResolver(assignShipmentDriverSchema),
    defaultValues: {
      unitId: shipment?.id,
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          onSubmit={form.handleSubmit(assignShipmentDriver, (errors) => {
            console.log(errors)
          })}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Shipment Assign Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DriverPickerField
              label="Driver"
              name="driverId"
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
