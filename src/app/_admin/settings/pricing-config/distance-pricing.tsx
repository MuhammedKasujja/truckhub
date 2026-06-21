import DistancePricingScheduleForm from "@/features/settings/pricing/components/distance-pricing-schedule"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/distance-pricing"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <DistancePricingScheduleForm onSave={undefined} />
}
