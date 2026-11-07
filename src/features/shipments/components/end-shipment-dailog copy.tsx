import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Flag } from "lucide-react"
import { endShipmentSchema } from "../schemas"
import { useEndShipment } from "../hooks/use-shipment-actions"
import { elapsedLabel, toDecimal } from "../format"
import { ShipmentActionDialog, closeOnSuccess } from "./shipment-action-dialog"
import type { EndShipmentInput } from "../schemas"
import type { Shipment } from "../types"
import { DateTimePickerField, NumberField } from "@/components/ui/form-fields"
import { formatDateTime, formatNumber } from "@/lib/format"

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
      tone="success"
      title="Finish trip"
      description="Record the odometer and when the trip ended."
      formId="end-trip-form"
      submitLabel="Finish trip"
      isSubmitting={isPending}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Started</dt>
          <dd className="mt-0.5">{formatDateTime(started) || "—"}</dd>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Odometer at start</dt>
          <dd className="mt-0.5 tabular-nums">
            {formatNumber(startMileage, { fallback: "—" })} km
          </dd>
        </div>
      </dl>

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

      {distance && (
        <div
          className={
            distance.lt(0)
              ? "flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              : "flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm"
          }
        >
          {distance.lt(0) ? (
            <>
              <AlertTriangle className="size-4" />
              End reading is lower than the start reading
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Trip summary</span>
              <span className="tabular-nums">
                {distance.toString()} km
                {started && <> · {elapsedLabel(started, endedAt)}</>}
              </span>
            </>
          )}
        </div>
      )}
    </ShipmentActionDialog>
  )
}
