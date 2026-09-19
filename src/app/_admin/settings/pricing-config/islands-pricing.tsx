import { CompanyIslandsPricingConfigurationDialog } from "@/features/settings/pricing/components/island-pricing/island-pricing-configurations"
import { IslandPricingTable } from "@/features/settings/pricing/components/island-pricing/island-pricing-table"
import { useCompanyIslandsPricing } from "@/features/settings/pricing/hooks/use-island-pricing"
import { createCompanyIslandPricingQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/islands-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      createCompanyIslandPricingQueryOptions()
    ),
})

function RouteComponent() {
  const { data } = useCompanyIslandsPricing()

  return (
    <div className="space-y-5">
      <CompanyIslandsPricingConfigurationDialog />
      <IslandPricingTable pricings={data?.pricings} />
    </div>
  )
}
