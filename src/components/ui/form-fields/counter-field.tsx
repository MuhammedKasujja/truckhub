import { Controller, FieldValues } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { TextFieldProps } from "./text-field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputInput,
} from "@/components/ui/number-input"

type CounterFieldProps<F extends FieldValues> = Omit<
  TextFieldProps<F>,
  "type" | "placeholder"
>

export function CounterField<T extends FieldValues>({
  control,
  name,
  label,
  required = true,
  description,
}: Readonly<CounterFieldProps<T>>) {
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
          <NumberInput className="w-full">
            <NumberInputGroup
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoCorrect="off"
            >
              <NumberInputDecrement />
              <NumberInputInput
                // {...field}
                id={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                // onChange={(e) => {
                //   const number = e.target.valueAsNumber
                //   field.onChange(isNaN(number) ? null : number)
                // }}
              />
              <NumberInputIncrement />
            </NumberInputGroup>
          </NumberInput>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
