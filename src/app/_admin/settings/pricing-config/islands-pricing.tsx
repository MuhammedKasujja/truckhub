import { EditIslandsPricing } from "@/features/settings/pricing/components"
import { createCompanyIslandPricingQueryOptions } from "@/features/settings/pricing/query-options"
import { createBatchIslandPricingsFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/islands-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      createCompanyIslandPricingQueryOptions()
    ),
})

function RouteComponent() {
  const pricings = Route.useLoaderData()
  return (
    <EditIslandsPricing
      initialData={{ pricings: pricings ?? [] }}
      onSubmit={async (data) => {
        const { message, error } = await createBatchIslandPricingsFn({ data })
        if (error) {
          toast.error(error.message)
        } else {
          toast.success(message)
        }
      }}
    />
  )
}
