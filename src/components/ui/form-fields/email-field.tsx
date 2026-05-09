import { FieldValues } from "react-hook-form";
import { TextField, TextFieldProps } from "./text-field";

type EmailFieldProps<F extends FieldValues> = Omit<TextFieldProps<F>, "type">;

export function EmailField<F extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
}: Readonly<EmailFieldProps<F>>) {
  return (
    <TextField
      control={control}
      name={name}
      placeholder={placeholder}
      label={label}
      required={required}
      type={"email"}
    />
  );
}