import { CompanyIslandsPricingConfigurationDialog } from "@/features/settings/pricing/components/island-pricing/island-pricing-configurations"
import { IslandPricingTable } from "@/features/settings/pricing/components/island-pricing/island-pricing-table"
import { useCompanyPricingDates } from "@/features/settings/pricing/hooks/use-company-pricing-dates"
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
  const data = Route.useLoaderData()
  const { data: pricingDates } = useCompanyPricingDates()
  
  const referenceDate = data?.validFromDate

  return (
    <div className="space-y-5">
      
      <CompanyIslandsPricingConfigurationDialog/>
      {/* <EditIslandsPricingForm
        initialData={{
          pricings: data?.pricings ?? [],
          validFromDate:
            data?.validFromDate ?? new Date().toLocaleDateString("en-CA"),
        }}
        onSubmit={async (data) => {
          console.log("Validated Data", data)
          const { message, error } = await createBatchIslandPricingsFn({ data })
          if (error) {
            toast.error(error.message)
          } else {
            toast.success(message)
          }
        }}
      /> */}
      <IslandPricingTable data={data?.pricings}/>
    </div>
  )
}
