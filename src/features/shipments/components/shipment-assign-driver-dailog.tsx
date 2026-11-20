import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarClock, UserRoundPlus } from "lucide-react"
import { assignShipmentDriverSchema } from "../schemas"
import { useAssignShipmentDriver } from "../hooks/use-shipment-actions"
import {
  FormSection,
  ShipmentActionDialog,
  closeOnSuccess,
} from "./shipment-action-dialog"
import type { AssignShipmentDriverInput } from "../schemas"
import type { Shipment } from "../types"
import { DriverPickerField } from "@/features/drivers/components"
import { formatDate } from "@/lib/format"

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
      hue="violet"
      title="Assign driver"
      description="Choose who will drive this trip."
      formId="assign-driver-form"
      submitLabel="Assign driver"
      isSubmitting={isPending}
    >
      <FormSection
        icon={UserRoundPlus}
        hue="violet"
        title="Driver"
        description="Make sure they're free for the whole trip."
      >
        {shipment && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <CalendarClock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Trip runs</span>
            <span className="font-medium">
              {formatDate(shipment.item.scheduled_start)} –{" "}
              {formatDate(shipment.item.scheduled_end)}
            </span>
          </div>
        )}
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
      </FormSection>
    </ShipmentActionDialog>
  )
}
