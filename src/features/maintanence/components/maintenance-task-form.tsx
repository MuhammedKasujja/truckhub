import { Controller, useWatch } from "react-hook-form"
import { maintanenceTypes } from "../enums"
import { TYPE_DESCRIPTIONS, TYPE_ICONS } from "./maintenance-meta"
import type { Control, FieldValues, Path } from "react-hook-form"
import type { MaintenanceType } from "../enums"
import type { MaintenanceCreateInput } from "../schemas"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { DateTimePickerField, TextareaField } from "@/components/ui/form-fields"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { OptionTile } from "@/features/settings/_components/settings-ui"
import { useTranslation } from "@/i18n"

/** Routine / Repair / Inspection as selectable tiles. */
export function MaintenanceTypeField<T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>
  name: Path<T>
}) {
  const tr = useTranslation()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>
            Type
            <RequiredLabelIcon />
          </FieldLabel>
          <div
            role="radiogroup"
            aria-label="Maintenance type"
            className="grid gap-2 sm:grid-cols-3"
          >
            {maintanenceTypes.map((type: MaintenanceType) => (
              <OptionTile
                key={type}
                selected={field.value === type}
                onSelect={() => field.onChange(type)}
                icon={TYPE_ICONS[type]}
                title={tr(`maintenance.types.${type}`)}
                description={TYPE_DESCRIPTIONS[type]}
              />
            ))}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function MaintenanceReasonField<T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>
  name: Path<T>
}) {
  return (
    <TextareaField
      label="What needs doing"
      name={name}
      control={control}
      placeholder="e.g. Replace front brake pads and check the discs"
      rows={3}
    />
  )
}

/** Start, end and expected completion for a new task. */
export function MaintenanceScheduleFields({
  control,
}: {
  control: Control<MaintenanceCreateInput>
}) {
  const [start, end, expectedEnd] = useWatch({
    control,
    name: ["start", "end", "expected_end"],
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimePickerField
          label="Starts"
          name="start"
          control={control}
          selected={start}
        />
        <DateTimePickerField
          label="Ends"
          name="end"
          control={control}
          required={false}
          selected={end ?? undefined}
          description="Leave empty if you don't know yet."
        />
      </div>
      <DateTimePickerField
        label="Expected completion"
        name="expected_end"
        control={control}
        required={false}
        selected={expectedEnd ?? undefined}
        description="Tasks still open after this date are marked overdue."
      />
    </div>
  )
}
