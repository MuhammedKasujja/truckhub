import { Label } from "@/components/ui/label"
import {
  CompanyRoutePricingConfigurationDialog,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import { companyRoutePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/route-tonnage-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(companyRoutePricingQueryOptions())
  },
})

function RouteComponent() {
  const { data: companyPricings } = useQuery(companyRoutePricingQueryOptions())

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label>Active Route Pricing</Label>
        <CompanyRoutePricingConfigurationDialog />
      </div>
      <RouteTonnagePricingGrid
        routes={companyPricings?.routes ?? []}
        effectiveDate={
          companyPricings?.effective_date ?? new Date().toDateString()
        }
        title="Current Company Pricing"
      />
    </div>
  )
}
