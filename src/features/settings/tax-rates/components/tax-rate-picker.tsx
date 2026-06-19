import { AutoComplete } from "@/components/ui/autocomplete"
import { TaxRate } from "../types"
import { useTaxRatesQuery } from "../hooks/use-tax-rates"

type TaxRatePickerProps = {
  onSelect: (taxRate: TaxRate | null) => void
}

export function TaxRatePicker({ onSelect }: TaxRatePickerProps) {
  const { data } = useTaxRatesQuery()
  return (
    <AutoComplete<TaxRate>
      triggerClassName="flex-1 w-full"
      fetcher={async (_) => {
        return data?? []
      }}
      renderOption={(taxRate) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="font-medium">{taxRate.name}</div>
          </div>
        </div>
      )}
      getOptionValue={(taxRate) => taxRate.id.toString()}
      getDisplayValue={(taxRate) => (
        <div className="flex items-center gap-2 text-left">
          <div className="flex flex-col leading-tight">
            <div className="font-medium">{taxRate.name}</div>
          </div>
        </div>
      )}
      notFound={
        <div className="py-6 text-center text-sm">No Tax Rates found</div>
      }
      label="Tax Rate"
      placeholder="Search tax rates..."
      value={undefined}
      onChange={(client) => {
        if (client) onSelect(client)
        else onSelect(null)
      }}
    />
  )
}
