import { CompanyIslandsPricingConfigurationDialog } from "@/features/settings/pricing/components/island-pricing/island-pricing-configurations"
import { IslandPricingTable } from "@/features/settings/pricing/components/island-pricing/island-pricing-table"
import { useCompanyActiveIslandsPricing } from "@/features/settings/pricing/hooks/use-island-pricing"
import { companyActiveRoutePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/islands-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      companyActiveRoutePricingQueryOptions()
    ),
})

function RouteComponent() {
  const { data } = useCompanyActiveIslandsPricing()

  return (
    <div className="space-y-5">
      <CompanyIslandsPricingConfigurationDialog />
      <IslandPricingTable pricings={data?.pricings} />
    </div>
  )
}
