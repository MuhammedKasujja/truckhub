import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserRoundPlus } from "lucide-react"
import { assignShipmentDriverSchema } from "../schemas"
import { useAssignShipmentDriver } from "../hooks/use-shipment-actions"
import { ShipmentActionDialog, closeOnSuccess } from "./shipment-action-dialog"
import type { AssignShipmentDriverInput } from "../schemas"
import type { Shipment } from "../types"
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
    defaultValues: { unitId: shipment?.id },
  })

  useEffect(() => {
    if (open && shipment) form.reset({ unitId: shipment.id })
  }, [form, open, shipment])

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={UserRoundPlus}
      title="Assign driver"
      description="Choose who will drive this trip."
      formId="assign-driver-form"
      submitLabel="Assign driver"
      isSubmitting={isPending}
    >
      <form
        id="assign-driver-form"
        onSubmit={form.handleSubmit((values) =>
          closeOnSuccess(
            () => assignShipmentDriver(values),
            () => onOpenChange(false)
          )
        )}
      >
        <DriverPickerField
          label="Driver"
          name="driverId"
          control={form.control}
        />
      </form>
    </ShipmentActionDialog>
  )
}
