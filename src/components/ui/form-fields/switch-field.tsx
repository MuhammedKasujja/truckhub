import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { RequiredLabelIcon } from "@/components/required-label-icon"

type SwitchFieldProps<T extends FieldValues> = {
  label?: string
  control: Control<T>
  name: FieldPath<T>
  description?: string
  required?: boolean
  // optional string mapping
  trueValue?: string | boolean | number
  falseValue?: string | boolean | number
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  description,
  trueValue,
  falseValue,
}: Readonly<SwitchFieldProps<T>>) {
  const isStringMode = trueValue && falseValue
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldLabel htmlFor={field.name}>
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldTitle>
                {label} {required && <RequiredLabelIcon />}
              </FieldTitle>
              {description && (
                <FieldDescription>{description}</FieldDescription>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Switch
              {...field}
              id={field.name}
              checked={
                isStringMode ? field.value === trueValue : Boolean(field.value)
              }
              aria-invalid={fieldState.invalid}
              onCheckedChange={(checked) => {
                field.onChange(
                  isStringMode ? (checked ? trueValue : falseValue) : checked
                )
              }}
            />
          </Field>
        </FieldLabel>
      )}
    />
  )
}
