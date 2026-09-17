import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  QuotationTable,
  QuotationTableSkeleton,
} from "@/features/quotations/components"
import { quotationQueryOptions } from "@/features/quotations/query-options"
import { QuotationSearchParams } from "@/features/quotations/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/")({
  component: RouteComponent,
  pendingComponent: QuotationTableSkeleton,
  validateSearch: QuotationSearchParams,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps: search }) => {
    return queryClient.ensureQueryData(quotationQueryOptions(search))
  },
})

function RouteComponent() {
  const search = Route.useSearch()

  const { data } = useQuery(quotationQueryOptions(search))
  return (
    <div>
      <PageHeader>
        <PageTitle>Quotations</PageTitle>
        <PageAction>
          <Button asChild>
            <Link to="/quotations/new">New Quotation</Link>
          </Button>
        </PageAction>
      </PageHeader>
      <QuotationTable data={data?.data} pagination={data?.pagination} />
    </div>
  )
}
