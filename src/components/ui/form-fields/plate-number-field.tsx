import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { PlateNumber } from "../extensions/plate-number"


 type PlateNumberFieldProps<F extends FieldValues> = {
  label?: string
  control: Control<F>
  name: FieldPath<F>
  description?: string
  required?: boolean
  readOnly?: boolean
}

export function PlateNumberField<T extends FieldValues>({
  control,
  name,
  label,
  required = true,
  readOnly = false,
  description,
}: Readonly<PlateNumberFieldProps<T>>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={field.name}>
              {label}
              {required && <RequiredLabelIcon />}
            </FieldLabel>
          )}
          <PlateNumber
            id={field.name}
            invalid={fieldState.invalid}
            field={field}
            readOnly={readOnly}
            // placeholder={placeholder}
            // autoComplete="off"
            
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
