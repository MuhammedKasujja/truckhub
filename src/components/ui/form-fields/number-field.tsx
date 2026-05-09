import { Controller, FieldValues } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextFieldProps } from "./text-field";
import { RequiredLabelIcon } from "@/components/required-label-icon";

type NumberFieldProps<F extends FieldValues> = Omit<TextFieldProps<F>, "type">;

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
}: Readonly<NumberFieldProps<T>>) {
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
          <Input
            {...field}
            type={"number"}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(e) => {
              const number = e.target.valueAsNumber;
              field.onChange(isNaN(number) ? null : number);
            }}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
