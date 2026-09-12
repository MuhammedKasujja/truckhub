import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  EditCompanyRoutePricingDialog,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import { useCompanyPricingDates } from "@/features/settings/pricing/hooks/use-company-pricing-dates"
import { useRouteTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { companyRoutePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/route-tonnage-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(companyRoutePricingQueryOptions())
  },
})

function RouteComponent() {
  const { data: companyPricings } = useRouteTonnagePricing()
  const { data } = useCompanyPricingDates()

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Select value="" onValueChange={(d) => {}}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data?.route_tonnage.dates.map((date) => (
              <SelectItem key={date} value={date}>
                {date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <EditCompanyRoutePricingDialog />
      </div>

      <RouteTonnagePricingGrid
        routes={companyPricings?.routes ?? []}
        effectiveDate={
          companyPricings?.effective_date ?? new Date().toDateString()
        }
        title="Current Company Pricing"
      />
    </div>
  )
}
