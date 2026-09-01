import { EditIslandsPricingForm } from "@/features/settings/pricing/components"
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
  const data = Route.useLoaderData()
  return (
    <EditIslandsPricingForm
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
    />
  )
}
