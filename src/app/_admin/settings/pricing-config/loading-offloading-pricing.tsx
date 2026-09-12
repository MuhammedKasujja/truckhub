import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { useCompanyPricingDates } from "@/features/settings/pricing/hooks/use-company-pricing-dates"
import { createCompanyLoadingFreesQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { createBatchLoadingPricingFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      createCompanyLoadingFreesQueryOptions()
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  const { data: pricingDates } = useCompanyPricingDates()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const referenceDate = search.referenceDate ?? data?.effective_date

  return (
    <div className="space-y-5">
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
          {pricingDates?.loading_offloading.dates.map((date) => (
            <SelectItem key={date} value={date}>
              {date}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <LoadingOffloadingPricingForm
        initialData={
          data
            ? { pricings: data.pricings, effective_date: data.effective_date }
            : undefined
        }
        onSubmit={async (data) => {
          const { message, error } = await createBatchLoadingPricingFn({ data })
          if (error) {
            toast.error(error.message)
          } else {
            toast.success(message)
          }
        }}
      />
    </div>
  )
}
