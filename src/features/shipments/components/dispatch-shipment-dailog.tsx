import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconSend } from "@tabler/icons-react"
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Gauge,
  ListChecks,
} from "lucide-react"
import { dispatchShipmentSchema } from "../schemas"
import { useDispatchShipment } from "../hooks/use-shipment-actions"
import {
  FormSection,
  ShipmentActionDialog,
  closeOnSuccess,
} from "./shipment-action-dialog"
import type { DispatchShipmentInput } from "../schemas"
import type { Shipment } from "../types"
import { NumberField, TextField } from "@/components/ui/form-fields"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

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

  const checklist = [
    {
      label: "Vehicle assigned",
      detail: shipment?.vehicle?.plate_number,
      ok: !!shipment?.vehicle,
    },
    {
      label: "Driver assigned",
      detail: shipment?.driver?.full_name,
      ok: !!shipment?.driver,
    },
  ]

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={IconSend}
      hue="blue"
      title="Dispatch shipment"
      description="Send the vehicle out on this trip."
      formId="dispatch-shipment-form"
      submitLabel="Dispatch now"
      isSubmitting={isPending}
    >
      <FormSection icon={ListChecks} hue="emerald" title="Ready to go">
        <ul className="space-y-2 text-sm">
          {checklist.map((row) => (
            <li key={row.label} className="flex items-center gap-2.5">
              {row.ok ? (
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
              <span className={cn(!row.ok && "text-muted-foreground")}>
                {row.label}
              </span>
              {row.detail && (
                <span className="ml-auto truncate text-xs text-muted-foreground">
                  {row.detail}
                </span>
              )}
            </li>
          ))}
          {shipment?.item.scheduled_start && (
            <li className="flex items-center gap-2.5">
              <CalendarClock className="size-4 text-muted-foreground" />
              <span>Scheduled start</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDateTime(shipment.item.scheduled_start)}
              </span>
            </li>
          )}
        </ul>
      </FormSection>

      <FormSection
        icon={Gauge}
        hue="blue"
        title="Departure"
        description="Record the odometer before the vehicle leaves."
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
      </FormSection>
    </ShipmentActionDialog>
  )
}
