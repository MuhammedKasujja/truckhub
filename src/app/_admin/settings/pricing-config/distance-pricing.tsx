import { CompanyLoadingPricingConfigurationDialog } from "@/features/settings/pricing/components"
import { DistancePricingScheduleGrid } from "@/features/settings/pricing/components/distance-pricing/distance-pricing-schedule-grid"
import { useDistanceTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { distancePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { MAX_TONNAGE } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/distance-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(distancePricingQueryOptions()),
})

function RouteComponent() {
  const { data } = useDistanceTonnagePricing()

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Price schedule</h1>
          <p className="text-sm text-muted-foreground">
            Rates by distance and tonnage bracket. Tonnage is capped at{" "}
            {MAX_TONNAGE} MT, and neither axis may overlap itself.
          </p>
        </div>
        <CompanyLoadingPricingConfigurationDialog />
      </header>
      <DistancePricingScheduleGrid
        pricings={data?.pricings ?? []}
        initialDate={data?.effective_date}
      />
    </div>
  )
}
