import { DistancePricingScheduleForm } from "@/features/settings/pricing/components"
import { useCreateDistanceTonnage } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { distancePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { fromDbRows } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/distance-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(distancePricingQueryOptions()),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  const { createDistanceTonnage } = useCreateDistanceTonnage()

  return (
    <DistancePricingScheduleForm
      initialSchedule={fromDbRows(data.pricings)}
      initialDate={data.effective_date}
      onSave={async (pricings, _, effectiveDate) => {
        await createDistanceTonnage(pricings)
      }}
    />
  )
}
