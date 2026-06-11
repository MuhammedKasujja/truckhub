import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { MultiSelect, MultiSelectOption } from "@/components/multi-select"

export type MultiSelectFieldProps<F extends FieldValues> = {
  label?: string
  control: Control<F>
  name: FieldPath<F>
  placeholder?: string
  description?: string
  required?: boolean
  readOnly?: boolean
  options: MultiSelectOption[]
}

export function MultiSelectField<T extends FieldValues>({
  label,
  required,
  name,
  control,
  placeholder,
  options,
}: MultiSelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>
            {label}
            {required && <RequiredLabelIcon />}
          </FieldLabel>
          <MultiSelect
            options={options}
            onValueChange={field.onChange}
            defaultValue={field.value || []}
            placeholder={placeholder}
            variant="default"
            animationConfig={{
              badgeAnimation: "none",
              popoverAnimation: "none",
            }}
          />
        </Field>
      )}
    />
  )
}
