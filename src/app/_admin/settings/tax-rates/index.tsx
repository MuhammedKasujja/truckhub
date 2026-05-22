import { TaxRatesTable } from "@/features/settings/tax-rates/components"
import { createTaxRatesQueryOptions } from "@/features/settings/tax-rates/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/tax-rates/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createTaxRatesQueryOptions()),
})

function RouteComponent() {
  return <TaxRatesTable />
}
