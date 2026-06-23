import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { createBatchLoadingPricingFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <LoadingOffloadingPricingForm
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
