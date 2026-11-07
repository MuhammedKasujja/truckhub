import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDown,
  ArrowLeftRight,
  MessageSquareText,
  Truck,
} from "lucide-react"
import { reassignmentReasonsList } from "../enums"
import { changeShipmentVehicleSchema } from "../schemas"
import { useChangeShipmentVehicle } from "../hooks/use-shipment-actions"
import {
  FormSection,
  ShipmentActionDialog,
  closeOnSuccess,
} from "./shipment-action-dialog"
import type { Shipment } from "../types"
import type { ChangeShipmentVehicleInput } from "../schemas"
import {
  HiddenField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-fields"
import { VehiclePickerField } from "@/features/vehicles/components"
import { PlateNumber } from "@/features/vehicles/components/vehicle-visuals"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

const reasonOptions = reassignmentReasonsList.map((reason) => ({
  value: reason,
  label: reason
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
}))

export function ChangeShipmentVehicleDialog({
  shipment,
  open,
  onOpenChange,
}: Props) {
  const { changeShipmentVehicle, isPending } = useChangeShipmentVehicle()
  const form = useForm<ChangeShipmentVehicleInput>({
    resolver: zodResolver(changeShipmentVehicleSchema),
    defaultValues: {
      unitId: shipment?.id,
      note: "",
      reason: "other",
    },
  })

  useEffect(() => {
    if (open && shipment) {
      form.reset({
        unitId: shipment.id,
        newVehicleId: undefined,
        note: "",
        reason: "other",
      })
    }
  }, [form, open, shipment])

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={ArrowLeftRight}
      hue="amber"
      title="Change vehicle"
      description="Swap in a replacement vehicle and record why."
      formId="change-vehicle-form"
      submitLabel="Change vehicle"
      isSubmitting={isPending}
    >
      <form
        id="change-vehicle-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((values) =>
          closeOnSuccess(
            () => changeShipmentVehicle(values),
            () => onOpenChange(false)
          )
        )}
      >
        <HiddenField control={form.control} name="unitId" />

        <FormSection icon={Truck} hue="amber" title="Swap">
          <div className="flex items-center justify-between rounded-lg border border-dashed bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-xs text-muted-foreground">Current vehicle</p>
              <p className="text-sm font-medium">
                {shipment?.vehicle?.number ?? "—"}
              </p>
            </div>
            {shipment?.vehicle && (
              <PlateNumber
                value={shipment.vehicle.plate_number}
                className="opacity-70"
              />
            )}
          </div>
          <div className="-my-2 flex justify-center">
            <span className="flex size-7 items-center justify-center rounded-full border bg-background text-amber-600 shadow-xs dark:text-amber-400">
              <ArrowDown className="size-4" />
            </span>
          </div>
          <VehiclePickerField
            label="Replacement vehicle"
            name="newVehicleId"
            control={form.control}
            filters={{ status: "available" }}
          />
        </FormSection>

        <FormSection icon={MessageSquareText} hue="slate" title="Reason">
          <SelectField
            label="Why is the vehicle changing?"
            name="reason"
            control={form.control}
            options={reasonOptions}
            placeholder="Select a reason"
          />
          <TextareaField
            label="Note"
            name="note"
            control={form.control}
            required={false}
            placeholder="Add context for this change (optional)"
          />
        </FormSection>
      </form>
    </ShipmentActionDialog>
  )
}
