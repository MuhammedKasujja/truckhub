import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Clock, Flag, Gauge } from "lucide-react"
import { endShipmentSchema } from "../schemas"
import { useEndShipment } from "../hooks/use-shipment-actions"
import { elapsedLabel, toDecimal } from "../format"
import {
  FormSection,
  OdometerReading,
  ResultBanner,
  ShipmentActionDialog,
  closeOnSuccess,
} from "./shipment-action-dialog"
import type { EndShipmentInput } from "../schemas"
import type { Shipment } from "../types"
import { DateTimePickerField, NumberField } from "@/components/ui/form-fields"
import { formatDateTime } from "@/lib/format"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EndShipmentDialog({ shipment, onOpenChange, open }: Props) {
  const { endShipment, isPending } = useEndShipment()

  const form = useForm<EndShipmentInput>({
    resolver: zodResolver(endShipmentSchema),
    defaultValues: { unitId: shipment?.id },
  })

  useEffect(() => {
    if (open && shipment) {
      form.reset({ unitId: shipment.id, endedAt: new Date() })
    }
  }, [form, open, shipment])

  const endMileage = useWatch({ control: form.control, name: "endMileage" })
  const endedAt = useWatch({ control: form.control, name: "endedAt" })
  const startMileage = shipment?.consumption?.start_mileage
  const distance =
    startMileage && endMileage
      ? toDecimal(endMileage).minus(toDecimal(startMileage))
      : null
  const started = shipment?.actual_start ?? shipment?.started_at

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={Flag}
      hue="emerald"
      title="Finish trip"
      description="Record the odometer and when the trip ended."
      formId="end-trip-form"
      submitLabel="Finish trip"
      isSubmitting={isPending}
    >
      <FormSection icon={Gauge} hue="violet" title="Odometer">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <OdometerReading label="Start (km)" value={startMileage} />
          </div>
          <span className="h-0.5 w-6 rounded-full bg-border" />
          <div className="flex-1">
            <OdometerReading
              label="End (km)"
              value={endMileage}
              muted={!endMileage}
            />
          </div>
        </div>

        <form
          id="end-trip-form"
          className="space-y-4"
          onSubmit={form.handleSubmit((values) =>
            closeOnSuccess(
              () => endShipment(values),
              () => onOpenChange(false)
            )
          )}
        >
          <NumberField
            label="Odometer at end (km)"
            control={form.control}
            name="endMileage"
          />
          <DateTimePickerField
            label="Trip ended at"
            control={form.control}
            name="endedAt"
          />
        </form>
      </FormSection>

      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Started {formatDateTime(started) || "—"}
      </div>

      {distance &&
        (distance.lt(0) ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            End reading is lower than the start reading
          </div>
        ) : (
          <ResultBanner
            hue="emerald"
            label="Trip summary"
            hint={
              started
                ? `${elapsedLabel(started, endedAt)} on the road`
                : undefined
            }
            value={`${distance.toString()} km`}
          />
        ))}
    </ShipmentActionDialog>
  )
}
