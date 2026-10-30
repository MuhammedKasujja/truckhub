import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  HiddenField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { VehiclePickerField } from "@/features/vehicles/components"
import { reassignmentReasonsList } from "../enums"
import {
  ChangeShipmentVehicleInput,
  changeShipmentVehicleSchema,
} from "../schemas"
import { Shipment } from "../types"
import { useChangeShipmentVehicle } from "../hooks/use-shipment-actions"

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

  async function handleSubmit(values: ChangeShipmentVehicleInput) {
    await changeShipmentVehicle(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Change shipment vehicle</DialogTitle>
            <DialogDescription>
              Select a replacement vehicle and provide the reason for
              reassignment.
            </DialogDescription>
          </DialogHeader>
          <HiddenField control={form.control} name="unitId" />
          <VehiclePickerField
            label="Replacement vehicle"
            name="newVehicleId"
            control={form.control}
            filters={{ status: "available" }}
          />
          <SelectField
            label="Reason for reassignment"
            name="reason"
            control={form.control}
            options={reasonOptions}
            placeholder="Select a reason"
          />
          <TextareaField
            label="Additional note"
            name="note"
            control={form.control}
            required={false}
            placeholder="Add context for this vehicle change"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton
              text="Change vehicle"
              isSubmitting={isPending || form.formState.isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
