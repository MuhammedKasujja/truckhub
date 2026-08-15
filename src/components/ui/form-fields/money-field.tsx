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
import { useSettings } from "@/features/settings/hooks/use-settings";
import { MaskInput } from "../mask-input";

type MoneyFieldProps<F extends FieldValues> = Omit<TextFieldProps<F>, "type">;

export function MoneyField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
}: Readonly<MoneyFieldProps<T>>) {
  const { settings } = useSettings()
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
          <MaskInput
            id={field.name}
            mask="currency"
            inputMode="decimal"
            currency="UGX"
            locale="en-UG"
            placeholder="USh"
            value={field.value}
            onValueChange={(_masked, unmasked) => field.onChange(unmasked)}
            onBlur={field.onBlur}
            invalid={!!fieldState.error}
          />
          {/* <InputGroup>
            <InputGroupInput
              {...field}
              type={"text"}
              inputMode="decimal"
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              autoComplete="off"
              // onChange={(e) => {
              //   const number = e.target.valueAsNumber;
              //   field.onChange(isNaN(number) ? null : number);
              // }}
            />
            <InputGroupAddon align="inline-start">
              <InputGroupButton variant="secondary">{settings?.currency_code}</InputGroupButton>
            </InputGroupAddon>
          </InputGroup> */}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
