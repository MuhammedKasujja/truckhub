import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Truck, Wrench } from "lucide-react"
import {
  useCreateMaintenanceRecord,
  useUpdateMaintenanceRecord,
} from "../hooks/use-maintenance"
import { maintenanceCreateSchema, maintenanceUpdateSchema } from "../schemas"
import {
  MaintenanceReasonField,
  MaintenanceScheduleFields,
  MaintenanceTypeField,
} from "./maintenance-task-form"
import type { MaintenanceCreateInput, MaintenanceUpdateInput } from "../schemas"
import type { MaintenanceRecord } from "../types"
import { DateTimePickerField } from "@/components/ui/form-fields"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { VehiclePickerField } from "@/features/vehicles/components"

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Schedule a new maintenance task. Mount it fresh each time it opens. */
export function CreateMaintenanceTaskDialog({
  open,
  onOpenChange,
  trigger,
}: DialogProps & { trigger?: React.ReactNode }) {
  const create = useCreateMaintenanceRecord()
  const form = useForm<MaintenanceCreateInput>({
    resolver: zodResolver(maintenanceCreateSchema),
    defaultValues: { type: "routine", start: new Date() },
  })

  function handleOpenChange(next: boolean) {
    if (!next) form.reset()
    onOpenChange(next)
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      icon={Wrench}
      eyebrow="Maintenance"
      title="New maintenance task"
      description="Schedule work on a vehicle."
      submitText="Create task"
      isSubmitting={create.isPending}
      onSubmit={form.handleSubmit((data) =>
        create.mutate({ data }, { onSuccess: () => handleOpenChange(false) })
      )}
    >
      <FormGroup title="Vehicle">
        <VehiclePickerField
          label="Vehicle"
          name="vehicle_id"
          control={form.control}
        />
      </FormGroup>
      <FormGroup title="Work">
        <MaintenanceTypeField control={form.control} name="type" />
        <MaintenanceReasonField control={form.control} name="reason" />
      </FormGroup>
      <FormGroup title="Schedule">
        <MaintenanceScheduleFields control={form.control} />
      </FormGroup>
    </SettingsFormDialog>
  )
}

/** Change the type, description or expected completion of a task. */
export function EditMaintenanceTaskDialog({
  record,
  open,
  onOpenChange,
}: DialogProps & { record: MaintenanceRecord }) {
  const update = useUpdateMaintenanceRecord()
  const form = useForm<MaintenanceUpdateInput>({
    resolver: zodResolver(maintenanceUpdateSchema),
    defaultValues: {
      maintanence_id: record.id,
      type: record.type,
      reason: record.reason,
      expected_end: record.expected_end,
    },
  })
  const expectedEnd = useWatch({ control: form.control, name: "expected_end" })

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Wrench}
      eyebrow="Maintenance"
      title="Edit maintenance task"
      description={`${record.vehicle.plate_number}${record.vehicle.number ? ` · ${record.vehicle.number}` : ""}`}
      submitText="Save changes"
      submitDisabled={!form.formState.isDirty}
      isSubmitting={update.isPending}
      footerNote={
        <span className="inline-flex items-center gap-1.5">
          <Truck className="size-3.5" />
          The vehicle and start date can't be changed
        </span>
      }
      onSubmit={form.handleSubmit((data) =>
        update.mutate({ data }, { onSuccess: () => onOpenChange(false) })
      )}
    >
      <FormGroup title="Work">
        <MaintenanceTypeField control={form.control} name="type" />
        <MaintenanceReasonField control={form.control} name="reason" />
      </FormGroup>
      <FormGroup title="Schedule">
        <DateTimePickerField
          label="Expected completion"
          name="expected_end"
          control={form.control}
          required={false}
          selected={expectedEnd ?? undefined}
          description="Tasks still open after this date are marked overdue."
        />
      </FormGroup>
    </SettingsFormDialog>
  )
}
