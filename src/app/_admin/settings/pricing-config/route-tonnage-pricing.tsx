import {
  EditCompanyRoutePricingDialog,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import { useRouteTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { companyRoutePricingQueryOptions } from "@/features/settings/pricing/query-options"
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
  const { data: companyPricings } = useRouteTonnagePricing()
  return (
    <div className="space-y-4">
      <EditCompanyRoutePricingDialog />
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
