import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RequiredLabelIcon } from "@/components/required-label-icon"

export type InputType = "text" | "number" | "email" | "url" | "phone"

export type TextFieldProps<F extends FieldValues> = {
  label?: string
  control: Control<F>
  name: FieldPath<F>
  placeholder?: string
  description?: string
  type?: InputType
  required?: boolean
  readOnly?: boolean
  className?: string
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = true,
  readOnly = false,
  description,
  className
}: Readonly<TextFieldProps<T>>) {
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
          <Input
            {...field}
            readOnly={readOnly}
            type={type}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            autoComplete="off"
            className={className}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
