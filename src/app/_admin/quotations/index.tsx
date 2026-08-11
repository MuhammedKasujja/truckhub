import { Button } from "@/components/ui/button"
import { QuotationTable } from "@/features/quotations/components"
import { quotationQueryOptions } from "@/features/quotations/query-options"
import { QuotationSearchParams } from "@/features/quotations/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/")({
  component: RouteComponent,
  validateSearch: QuotationSearchParams,
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  const search = Route.useSearch()

  const { data, error } = useQuery(quotationQueryOptions(search))
  return (
    <div className="space-y-5">
      <Button asChild>
        <Link to="/quotations/new">New Quotation</Link>
      </Button>{" "}
      <QuotationTable data={data?.data} pagination={data?.pagination} />
    </div>
  )
}
