import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { RequiredLabelIcon } from "@/components/required-label-icon";

type SwitchFieldProps<T extends FieldValues> = {
  label?: string;
  control: Control<T>;
  name: FieldPath<T>;
  description?: string;
  required?: boolean;
};

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  description,
}: Readonly<SwitchFieldProps<T>>) {
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
              checked={field.value}
              aria-invalid={fieldState.invalid}
              onCheckedChange={field.onChange}
            />
          </Field>
        </FieldLabel>
      )}
    />
  );
}
