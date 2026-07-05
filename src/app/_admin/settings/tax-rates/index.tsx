import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { useUpdateSettings } from "@/features/settings/hooks/use-settings"
import {
  TaxRatePicker,
  TaxRatesTable,
} from "@/features/settings/tax-rates/components"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { createTaxRatesQueryOptions } from "@/features/settings/tax-rates/query-options"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/_admin/settings/tax-rates/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createTaxRatesQueryOptions()),
})

function RouteComponent() {
  const queryInvalidator = useQueryInvalidator()

  const defaultTaxRate = useDefaultTaxRate()
  const [taxRate, setTaxRate] = useState(defaultTaxRate)

  async function updateDefaultTaxRate() {
    if (defaultTaxRate?.id === taxRate?.id) return
    const { isSuccess, error, message } = await useUpdateSettings({
      default_tax_rate_id: taxRate?.id,
    })
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.refresh()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <div className="flex-1 space-y-2">
          <FieldLabel>Default Tax Rate</FieldLabel>
          <TaxRatePicker
            value={taxRate}
            onSelected={(value) => {
              setTaxRate(value)
            }}
          />
        </div>
        {defaultTaxRate && defaultTaxRate?.id !== taxRate?.id && (
          <Button type="button" onClick={() => updateDefaultTaxRate()}>
            Save
          </Button>
        )}
      </div>

      <TaxRatesTable />
    </div>
  )
}
