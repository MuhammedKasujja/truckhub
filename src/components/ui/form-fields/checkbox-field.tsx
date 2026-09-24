import { Controller, FieldValues } from "react-hook-form"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { TextFieldProps } from "./text-field"
import { Checkbox } from "../checkbox"

type CheckboxFieldProps<F extends FieldValues> = Omit<
  TextFieldProps<F>,
  "type" | "placeholder"
> & { className?: string }

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
}: Readonly<CheckboxFieldProps<T>>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={className}
          orientation={"horizontal"}
        >
          <Checkbox
            id={field.name}
            name={field.name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
            ref={field.ref}
          />
          <FieldContent>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  )
}
