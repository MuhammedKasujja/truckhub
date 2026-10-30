import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  DateTimePickerField,
  HiddenField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { VehiclePickerField } from "@/features/vehicles/components"
import { maintenanceCreateSchema, maintenanceUpdateSchema } from "../schemas"
import { maintanenceTypes } from "../enums"

type MaintenanceTaskFormProps = {
  defaultValues?: Partial<z.infer<typeof maintenanceCreateSchema>>
  isPending?: boolean
  onSubmit: (
    values: z.infer<typeof maintenanceCreateSchema>
  ) => void | Promise<void>
}

const maintenanceTypeOptions = maintanenceTypes.map((type) => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
}))

export function MaintenanceTaskForm({
  defaultValues,
  isPending = false,
  onSubmit,
}: MaintenanceTaskFormProps) {
  type Values = z.infer<typeof maintenanceCreateSchema>

  const form = useForm<Values>({
    resolver: zodResolver(maintenanceCreateSchema),
    defaultValues: {
      ...defaultValues,
      start: defaultValues?.start ?? new Date(),
    },
  })

  async function handleSubmit(values: Values) {
    await onSubmit(maintenanceCreateSchema.parse(values))
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Schedule a maintenance task</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="pb-6">
          <FieldGroup>
            <VehiclePickerField
              label="Vehicle"
              name="vehicle_id"
              control={form.control}
            />
            <SelectField
              label="Maintenance type"
              name="type"
              control={form.control}
              options={maintenanceTypeOptions}
              placeholder="Select a maintenance type"
            />
            <TextareaField
              label="Reason"
              name="reason"
              control={form.control}
              placeholder="Describe the work required"
            />
            <Field orientation="horizontal" className="gap-4">
              <DateTimePickerField
                label="Scheduled start"
                name="start"
                control={form.control}
                selected={form.watch("start")}
              />
              <DateTimePickerField
                label="Scheduled end"
                name="end"
                control={form.control}
                required={false}
                selected={form.watch("end") ?? undefined}
              />
            </Field>
            <DateTimePickerField
              label="Expected completion"
              name="expected_end"
              control={form.control}
              required={false}
              selected={form.watch("expected_end") ?? undefined}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton
            text="Create task"
            isSubmitting={form.formState.isSubmitting || isPending}
          />
        </CardFooter>
      </form>
    </Card>
  )
}

type MaintenanceTaskEditFormProps = {
  defaultValues: z.infer<typeof maintenanceUpdateSchema>
  onSubmit: (
    values: z.infer<typeof maintenanceUpdateSchema>
  ) => void | Promise<void>
}

export function MaintenanceTaskEditForm({
  defaultValues,
  onSubmit,
}: MaintenanceTaskEditFormProps) {
  type Values = z.infer<typeof maintenanceUpdateSchema>

  const form = useForm<Values>({
    resolver: zodResolver(maintenanceUpdateSchema),
    defaultValues,
  })

  async function handleSubmit(values: Values) {
    await onSubmit(maintenanceUpdateSchema.parse(values))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} id="task-update">
      <FieldGroup>
        <HiddenField control={form.control} name="maintanence_id" />
        <SelectField
          label="Maintenance type"
          name="type"
          control={form.control}
          options={maintenanceTypeOptions}
          placeholder="Select a maintenance type"
        />
        <TextareaField
          label="Reason"
          name="reason"
          control={form.control}
          placeholder="Describe the work required"
        />
        <DateTimePickerField
          label="Expected completion"
          name="expected_end"
          control={form.control}
          required={false}
          selected={form.watch("expected_end") ?? undefined}
        />
      </FieldGroup>
    </form>
  )
}
