import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DistancePricingScheduleForm } from "@/features/settings/pricing/components"
import { useCompanyPricingDates } from "@/features/settings/pricing/hooks/use-company-pricing-dates"
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
  const { data: pricingDates } = useCompanyPricingDates()

  return (
    <div className="space-y-5">
      <Select value="" onValueChange={(d) => {}}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pricingDates?.distance_tonnage.dates.map((date) => (
            <SelectItem key={date} value={date}>
              {date}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DistancePricingScheduleForm
        initialSchedule={fromDbRows(data.pricings)}
        initialDate={data.effective_date}
        onSave={async (pricings, _, effectiveDate) => {
          await createDistanceTonnage({
            pricings,
            effectiveDate: effectiveDate.toString(),
          })
        }}
      />
    </div>
  )
}
