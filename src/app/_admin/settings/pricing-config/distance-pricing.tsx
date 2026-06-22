import { DistancePricingScheduleForm } from "@/features/settings/pricing/components"
import { distancePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { createBatchDistancePricingFn } from "@/features/settings/pricing/services"
import { fromDbRows } from "@/features/settings/pricing/utils/distance-tonnage-pricing-utils"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/distance-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(distancePricingQueryOptions()),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return (
    <DistancePricingScheduleForm
      initialSchedule={fromDbRows(data ?? [])}
      onSave={async (pricings, _) => {
        const { message, error } = await createBatchDistancePricingFn({
          data: { pricings },
        })
        if (error) {
          toast.error(error.message)
        } else {
          toast.success(message)
        }
      }}
    />
  )
}
