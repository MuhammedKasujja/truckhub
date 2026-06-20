import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import { createBatchRoutePricingFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/route-tonnage-pricing"
)({
  component: RouteComponent,
})

function RouteComponent() {
  async function handleSubmit(data: BatchPricingPayload) {
    const { message, error, isSuccess } = await createBatchRoutePricingFn({
      data,
    })

    if (error) {
      toast.error(error.message)
    }

    if (isSuccess) {
      toast.success(message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium tracking-tight">
          Route tonnage pricing
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define tonnage bands then fill prices per route in the grid. Columns
          are generated automatically from your band definitions.
        </p>
      </div>
      <RoutePricingDataGridForm onSubmit={handleSubmit} />
    </div>
  )
}
