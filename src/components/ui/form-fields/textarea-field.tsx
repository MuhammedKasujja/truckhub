import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "../textarea";
import { RequiredLabelIcon } from "@/components/required-label-icon";

interface TextareaFieldProps<
  F extends FieldValues,
> extends React.ComponentProps<"textarea"> {
  label?: string;
  control: Control<F>;
  name: FieldPath<F>;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
  ...rest
}: Readonly<TextareaFieldProps<T>>) {
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
          <Textarea
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            autoComplete="off"
            {...rest}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
