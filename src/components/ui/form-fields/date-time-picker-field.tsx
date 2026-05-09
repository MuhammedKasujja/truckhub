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
import {
  DateTimePickerModified,
  DateTimePickerProps,
} from "../date-range-picker/date-time-picker";

type DateTimePickerFieldProps<F extends FieldValues> = Omit<
  TextFieldProps<F>,
  "type"
> &
  Omit<DateTimePickerProps, "onSelect">;

export function DateTimePickerField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
  startDate,
  selected,
  endDate,
}: Readonly<DateTimePickerFieldProps<T>>) {
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
          <DateTimePickerModified
            {...field}
            selected={selected}
            startDate={startDate}
            endDate={endDate}
            placeholder={placeholder}
            onSelect={(date) => {
              field.onChange(date);
            }}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
