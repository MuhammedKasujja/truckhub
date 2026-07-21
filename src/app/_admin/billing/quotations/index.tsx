import { QuotationTable } from "@/features/quotations/components"
import { quotationQueryOptions } from "@/features/quotations/query-options"
import { QuotationSearchParams } from "@/features/quotations/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/billing/quotations/")({
  component: RouteComponent,
  validateSearch: QuotationSearchParams,
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  const search = Route.useSearch()

  const { data, error } = useQuery(quotationQueryOptions(search))
  return <QuotationTable data={data?.data} pagination={data?.pagination} />
}
