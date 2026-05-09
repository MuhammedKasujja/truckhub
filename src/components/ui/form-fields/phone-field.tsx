import { FieldValues } from "react-hook-form";
import { TextField, TextFieldProps } from "./text-field";

type PhoneFieldProps<F extends FieldValues> = Omit<TextFieldProps<F>, "type">;

export function PhoneField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: Readonly<PhoneFieldProps<T>>) {
  return (
    <TextField
      control={control}
      name={name}
      placeholder={placeholder}
      label={label}
      required={required}
      type={"phone"}
    />
  );
}