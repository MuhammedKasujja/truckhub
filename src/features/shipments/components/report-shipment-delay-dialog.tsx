import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  CalendarClock,
  ClockAlert,
  MessageSquareText,
} from "lucide-react"
import { shipmentDelayReasons } from "../enums"
import { delayReasonLabel } from "../format"
import { reportShipmentDelaySchema } from "../schemas"
import { useReportShipmentDelay } from "../hooks/use-shipment-actions"
import { FormSection, ShipmentActionDialog } from "./shipment-action-dialog"
import { ShipmentStatusIndicator } from "./shipment-status-indicator"
import type { ReportShipmentDelayInput } from "../schemas"
import type { Shipment, ShipmentDelayCollision } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DateTimePickerField,
  HiddenField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-fields"
import { formatDateTime } from "@/lib/format"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

const reasonOptions = shipmentDelayReasons.map((reason) => ({
  value: reason,
  label: delayReasonLabel(reason),
}))

export function ReportShipmentDelayDialog({
  shipment,
  open,
  onOpenChange,
}: Props) {
  const { reportShipmentDelay, isPending } = useReportShipmentDelay()
  // The other trips the delay collides with, shown once the report is saved
  const [collisions, setCollisions] = useState<ShipmentDelayCollision[]>([])

  const form = useForm<ReportShipmentDelayInput>({
    resolver: zodResolver(reportShipmentDelaySchema),
    defaultValues: { unitId: shipment?.id, note: "" },
  })

  useEffect(() => {
    if (open && shipment) {
      form.reset({
        unitId: shipment.id,
        reason: undefined,
        expectedEnd: undefined,
        note: "",
      })
    }
  }, [form, open, shipment])

  async function submit(values: ReportShipmentDelayInput) {
    try {
      const affected = await reportShipmentDelay(values)
      onOpenChange(false)
      setCollisions(affected)
    } catch {
      // errors are already surfaced as a toast by the action hook
    }
  }

  const reason = form.watch("reason")

  return (
    <>
      <ShipmentActionDialog
        open={open}
        onOpenChange={onOpenChange}
        shipment={shipment}
        icon={ClockAlert}
        hue="red"
        title="Report a delay"
        description="Record why the trip is late and when it is expected back."
        formId="report-delay-form"
        submitLabel="Report delay"
        isSubmitting={isPending}
      >
        <form
          id="report-delay-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(submit)}
        >
          <HiddenField control={form.control} name="unitId" />

          <FormSection icon={MessageSquareText} hue="red" title="Reason">
            <SelectField
              label="What is holding the trip up?"
              name="reason"
              control={form.control}
              options={reasonOptions}
              placeholder="Select a reason"
            />
            <TextareaField
              label="Note"
              name="note"
              control={form.control}
              required={reason === "other"}
              placeholder={
                reason === "other"
                  ? "Say what is holding the trip up"
                  : "Add context for this delay (optional)"
              }
            />
          </FormSection>

          <FormSection
            icon={CalendarClock}
            hue="slate"
            title="New estimate"
            description="An estimate only: the vehicle stays held until the trip ends."
          >
            <DateTimePickerField
              label="Expected back"
              name="expectedEnd"
              control={form.control}
              required={false}
              startDate={new Date()}
              description={
                shipment?.expected_end
                  ? `Last estimate: ${formatDateTime(shipment.expected_end)}. Leave empty to keep it.`
                  : "Leave empty if it is not known yet."
              }
            />
          </FormSection>
        </form>
      </ShipmentActionDialog>

      <Dialog
        open={collisions.length > 0}
        onOpenChange={(isOpen) => !isOpen && setCollisions([])}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Other trips need this vehicle
            </DialogTitle>
            <DialogDescription>
              {collisions.length === 1 ? "This trip is" : "These trips are"}{" "}
              booked on the same vehicle before it is expected back. Nothing was
              changed: open {collisions.length === 1 ? "it" : "each one"} and
              change its vehicle.
            </DialogDescription>
          </DialogHeader>
          <ul className="divide-y rounded-lg border">
            {collisions.map((trip) => (
              <li
                key={trip.trip_id.toString()}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {trip.number ?? "Unnumbered shipment"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Starts {formatDateTime(trip.starts_at)}
                  </p>
                </div>
                <ShipmentStatusIndicator status={trip.status} />
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button onClick={() => setCollisions([])}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
