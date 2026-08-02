import { FieldValues } from "react-hook-form"
import {
  AutoCompleteField,
  AutoCompleteFieldProps,
} from "./auto-complete-field"
import { VEHICLE_END_DATE, VEHICLE_START_DATE } from "@/common/config"

interface YearPickerFieldProps<T extends FieldValues> extends Omit<
  AutoCompleteFieldProps<T>,
  "options"
> {
  startYear?: number
  endYear?: number
}

export function YearPickerField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "search",
  required = true,
  description,
  emptyPlaceholder,
  startYear = VEHICLE_START_DATE,
  endYear = VEHICLE_END_DATE,
}: Readonly<YearPickerFieldProps<T>>) {
  const range = endYear - startYear
  const years = Array.from({ length: range + 1 }, (_, i) => startYear + i)

  return (
    <AutoCompleteField
      required={required}
      label={label}
      control={control}
      name={name}
      description={description}
      placeholder={placeholder}
      emptyPlaceholder={emptyPlaceholder}
      options={
        years.map((opt) => ({
          label: opt.toString(),
          value: opt.toString(),
        })) ?? []
      }
    />
  )
}
