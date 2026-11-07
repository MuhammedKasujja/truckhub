import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconSend } from "@tabler/icons-react"
import { dispatchShipmentSchema } from "../schemas"
import { useDispatchShipment } from "../hooks/use-shipment-actions"
import { ShipmentActionDialog, closeOnSuccess } from "./shipment-action-dialog"
import type { DispatchShipmentInput } from "../schemas"
import type { Shipment } from "../types"
import { NumberField, TextField } from "@/components/ui/form-fields"

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
    defaultValues: { unitId: shipment?.id },
  })

  useEffect(() => {
    if (open && shipment) {
      form.reset({
        unitId: shipment.id,
        contactName: shipment.contact_name ?? "",
      })
    }
  }, [form, open, shipment])

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={IconSend}
      title="Dispatch shipment"
      description="Send the vehicle out. Record the odometer before it leaves."
      formId="dispatch-shipment-form"
      submitLabel="Dispatch"
      isSubmitting={isPending}
    >
      <form
        id="dispatch-shipment-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          closeOnSuccess(
            () => dispatchShipment(values),
            () => onOpenChange(false)
          )
        )}
      >
        <NumberField
          label="Odometer at start (km)"
          name="startMileage"
          control={form.control}
        />
        <TextField
          label="On-site contact person"
          name="contactName"
          placeholder="Who receives the vehicle"
          control={form.control}
        />
      </form>
    </ShipmentActionDialog>
  )
}
