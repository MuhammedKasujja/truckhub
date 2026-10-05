import { LoadingOffloadingPricingTable } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-offloading-pricing-table"
import { CompanyLoadingPricingConfigurationDialog } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-pricing-configurations"
import { activeLoadingFreesQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(activeLoadingFreesQueryOptions()),
})

function RouteComponent() {
  const { data } = useQuery(activeLoadingFreesQueryOptions())

  return (
    <div className="space-y-5">
      <CompanyLoadingPricingConfigurationDialog />
      <LoadingOffloadingPricingTable
        pricings={
          data
            ? {
                pricings: data.data?.pricings ??[],
                effective_date: data?.data?.effective_date,
              }
            : undefined
        }
      />
    </div>
  )
}
