"use client"

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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useState } from "react"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { CURRENCY_CODE } from "@/config/constants"

type DiscountFieldProps<F extends FieldValues> = Omit<TextFieldProps<F>, "type">

export function DiscountField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
}: Readonly<DiscountFieldProps<T>>) {
  const { settings } = useSettings()
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("fixed")
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
              type={"number"}
              id={field.name}
              aria-invalid={fieldState.invalid}
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder={placeholder}
              autoComplete="off"
              onChange={(e) => {
                const number = e.target.valueAsNumber
                field.onChange(isNaN(number) ? null : number)
              }}
            />
            {discountType === "fixed" && (
              <InputGroupAddon align="inline-start">
                <InputGroupButton variant="secondary">
                  {settings?.currency_code ?? CURRENCY_CODE}
                </InputGroupButton>
              </InputGroupAddon>
            )}
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="secondary"
                onClick={() =>
                  setDiscountType(
                    discountType === "fixed" ? "percent" : "fixed"
                  )
                }
              >
                {discountType}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
