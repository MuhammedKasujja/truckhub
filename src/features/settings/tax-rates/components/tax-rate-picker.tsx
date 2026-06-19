import { TaxRate } from "../types"
import { useTaxRatesQuery } from "../hooks/use-tax-rates"
import { EntityPickerProps } from "@/common/types"
import { AutoComplete } from "@/components/ui/autocomplete-modified"

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
      onChange={(user) => {
        onSelected?.(user)
      }}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      label="Tax Rate"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
    />
  )
}
