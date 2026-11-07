import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftRight } from "lucide-react"
import { reassignmentReasonsList } from "../enums"
import { changeShipmentVehicleSchema } from "../schemas"
import { useChangeShipmentVehicle } from "../hooks/use-shipment-actions"
import { ShipmentActionDialog, closeOnSuccess } from "./shipment-action-dialog"
import type { Shipment } from "../types"
import type { ChangeShipmentVehicleInput } from "../schemas"
import {
  HiddenField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-fields"
import { VehiclePickerField } from "@/features/vehicles/components"

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
        <VehiclePickerField
          label="Replacement vehicle"
          name="newVehicleId"
          control={form.control}
          filters={{ status: "available" }}
        />
        <SelectField
          label="Reason"
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
      </form>
    </ShipmentActionDialog>
  )
}
