import {
  type BatchPricingInput,
} from "@/features/settings/pricing"
import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/pricing-config/")({
  component: RouteComponent,
})

function RouteComponent() {
  async function handleSubmit(data: BatchPricingInput) {
    console.log("Form data", data)
  }

  return <RoutePricingDataGridForm onSubmit={handleSubmit} />
}
