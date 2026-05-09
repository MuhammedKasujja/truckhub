import { Controller, FieldValues } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { TextFieldProps } from "./text-field";
import { RequiredLabelIcon } from "@/components/required-label-icon";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CURRENCY_CODE } from "@/config/constants";

type MoneyFieldProps<F extends FieldValues> = Omit<TextFieldProps<F>, "type">;

export function MoneyField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
}: Readonly<MoneyFieldProps<T>>) {
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
          <InputGroup>
            <InputGroupInput
              {...field}
              type={"text"}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              autoComplete="off"
              onChange={(e) => {
                const number = e.target.valueAsNumber;
                field.onChange(isNaN(number) ? null : number);
              }}
            />
            <InputGroupAddon align="inline-start">
              <InputGroupButton variant="secondary">{CURRENCY_CODE}</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
