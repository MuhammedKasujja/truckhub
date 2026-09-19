import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { LoadingOffloadingPricingTable } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-offloading-pricing-table"
import { CompanyLoadingPricingConfigurationDialog } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-pricing-configurations"
import { createCompanyLoadingFreesQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { createBatchLoadingPricingFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      createCompanyLoadingFreesQueryOptions()
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  return (
    <div className="space-y-5">
      <CompanyLoadingPricingConfigurationDialog/>
      <LoadingOffloadingPricingTable
        pricings={
          data
            ? { pricings: data.pricings, effective_date: data.effective_date }
            : undefined
        }
        onSubmit={async (data) => {
          const { message, error } = await createBatchLoadingPricingFn({ data })
          if (error) {
            toast.error(error.message)
          } else {
            toast.success(message)
          }
        }}
      />
    </div>
  )
}
