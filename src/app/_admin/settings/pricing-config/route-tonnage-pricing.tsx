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
import { companyRoutePricingQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/route-tonnage-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(companyRoutePricingQueryOptions(search))
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data: companyPricings } = useQuery(
    companyRoutePricingQueryOptions(search)
  )

  const { data } = useCompanyPricingDates()
  const navigate = Route.useNavigate()

  const referenceDate = search.referenceDate ?? companyPricings?.effective_date

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Select
          value={referenceDate}
          onValueChange={(date) => {
            navigate({ search: { ...search, referenceDate: date } })
          }}
        >
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
