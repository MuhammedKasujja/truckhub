import { TaxRate } from "../types"
import { useTaxRatesQuery } from "../hooks/use-tax-rates"
import { EntityPickerProps } from "@/common/types"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { formatNumber } from "@/lib/format"
import { FieldValues } from "react-hook-form"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"

export function TaxRatePicker({
  id,
  value,
  onSelected,
}: EntityPickerProps<TaxRate>) {
  const { data, isLoading } = useTaxRatesQuery()
  return (
    <AutoComplete<TaxRate>
      id={id}
      options={data ?? []}
      loading={isLoading}
      value={value}
      onChange={(taxRate) => {
        onSelected?.(taxRate)
      }}
      filterFn={(t, q) => t.name.toLowerCase().includes(q.toLowerCase())}
      label="Tax Rate"
      getOptionValue={(t) => t.id}
      renderOption={(t) => (
        <span>
          {formatNumber(t.rate)}% {t.name}
        </span>
      )}
    />
  )
}

export function TaxRatePickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, TaxRate>) {
  const { data, isLoading } = useTaxRatesQuery()
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={data ?? []}
      control={control}
      label={label}
      remote={remote}
      filterFn={(b, q) => b.name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(b) => b.id}
      renderOption={(t) => (
        <span>
          {formatNumber(t.rate)}% {t.name}
        </span>
      )}
      onSelected={onSelected}
      {...props}
    />
  )
}
