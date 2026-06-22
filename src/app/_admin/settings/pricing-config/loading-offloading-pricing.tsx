import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoadingOffloadingPricingForm />
}
