import { type BatchPricingInput } from "@/features/settings/pricing"
import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/pricing-config/")({
  component: RouteComponent,
})

function RouteComponent() {
  async function handleSubmit(data: BatchPricingInput) {
    console.log("Form data", data)
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
