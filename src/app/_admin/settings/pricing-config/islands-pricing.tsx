import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EditIslandsPricingForm } from "@/features/settings/pricing/components"
import { useCompanyPricingDates } from "@/features/settings/pricing/hooks/use-company-pricing-dates"
import { createCompanyIslandPricingQueryOptions } from "@/features/settings/pricing/query-options"
import { createBatchIslandPricingsFn } from "@/features/settings/pricing/services"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/islands-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      createCompanyIslandPricingQueryOptions()
    ),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const { data: pricingDates } = useCompanyPricingDates()
  return (
    <div className="space-y-5">
      <Select value="" onValueChange={(d) => {}}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pricingDates?.island.dates.map((date) => (
            <SelectItem key={date} value={date}>
              {date}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <EditIslandsPricingForm
        initialData={{
          pricings: data?.pricings ?? [],
          validFromDate:
            data?.validFromDate ?? new Date().toLocaleDateString("en-CA"),
        }}
        onSubmit={async (data) => {
          console.log("Validated Data", data)
          const { message, error } = await createBatchIslandPricingsFn({ data })
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
