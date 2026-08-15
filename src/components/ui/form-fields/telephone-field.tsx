import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { TelephoneInput } from "../extensions/telephone-input"

type FieldProps<F extends FieldValues> = {
  label?: string
  control: Control<F>
  name: FieldPath<F>
  description?: string
  required?: boolean
  readOnly?: boolean
}

export function TelephoneField<T extends FieldValues>({
  control,
  name,
  label,
  required = true,
  readOnly = false,
  description,
}: Readonly<FieldProps<T>>) {
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
          <TelephoneInput
            id={field.name}
            invalid={fieldState.invalid}
            field={field}
            readOnly={readOnly}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
