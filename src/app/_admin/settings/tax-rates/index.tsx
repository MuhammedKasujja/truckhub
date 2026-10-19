import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { useEditSettings } from "@/features/settings/hooks/use-settings"
import {
  TaxRatePicker,
  TaxRatesTable,
} from "@/features/settings/tax-rates/components"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import { createTaxRatesQueryOptions } from "@/features/settings/tax-rates/query-options"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { EntityId } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/_admin/settings/tax-rates/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createTaxRatesQueryOptions()),
})

function RouteComponent() {
  const defaultTaxRate = useDefaultTaxRate()
  const [taxRateId, setTaxRateId] = useState<EntityId>()
  const back = useBackNavigation()
  const { mutate: updateSettings } = useEditSettings()

  async function updateDefaultTaxRate() {
    if (defaultTaxRate?.id === taxRateId) return
    updateSettings({ default_tax_rate_id: taxRateId ?? null })
  }

  useEffect(() => {
    setTaxRateId(defaultTaxRate?.id)
  }, [defaultTaxRate])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader className="pb-0">
        <PageTitle>Tax Rates</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} onClick={back}>
            Back
          </Button>
          {defaultTaxRate?.id !== taxRateId && (
            <Button type="button" onClick={() => updateDefaultTaxRate()}>
              Save
            </Button>
          )}
        </PageAction>
      </PageHeader>
      <FieldLabel>Default Tax Rate</FieldLabel>
      <TaxRatePicker
        value={taxRateId}
        onSelected={(value) => {
          setTaxRateId(value?.id)
        }}
      />
      <TaxRatesTable />
    </div>
  )
}
