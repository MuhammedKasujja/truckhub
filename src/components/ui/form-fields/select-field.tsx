"use client";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequiredLabelIcon } from "@/components/required-label-icon";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

type SelectFieldProps<T extends FieldValues> = {
  label?: string;
  options: readonly Option[];
  control: Control<T>;
  name: FieldPath<T>;
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
};

export function SelectField<T extends FieldValues>({
  options,
  control,
  name,
  label,
  placeholder = "Select...",
  required = true,
  description,
  className,
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={cn("w-full", className)}
        >
          <FieldLabel htmlFor={field.name}>
            {label}
            {required && <RequiredLabelIcon />}
          </FieldLabel>
          <Select {...field} onValueChange={field.onChange}>
            <SelectTrigger aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
