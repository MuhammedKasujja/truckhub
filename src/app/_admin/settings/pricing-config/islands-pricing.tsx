import { EditIslandsPricing } from "@/features/settings/pricing/components"
import { createBatchIslandPricingsFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/islands-pricing"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <EditIslandsPricing
      onSubmit={async (data) => {
        console.log("IslandPricing", data)
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
