import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { createCompanyLoadingFreesQueryOptions } from "@/features/settings/pricing/query-options"
import { createBatchLoadingPricingFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      createCompanyLoadingFreesQueryOptions()
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return (
    <LoadingOffloadingPricingForm
      initialData={data ? { pricings: data.pricings, effective_date: data.effective_date } : undefined}
      onSubmit={async (data) => {
        const { message, error } = await createBatchLoadingPricingFn({ data })
        if (error) {
          toast.error(error.message)
        } else {
          toast.success(message)
        }
      }}
    />
  )
}
