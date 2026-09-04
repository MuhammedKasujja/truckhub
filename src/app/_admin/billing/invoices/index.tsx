import { createFileRoute } from "@tanstack/react-router"
import {
  InvoiceTable,
  InvoiceTableFilter,
} from "@/features/invoices/components"
import { InvoiceSearchParams } from "@/features/invoices/schemas"
import { invoiceStatisticsQueryOptions } from "@/features/invoices/query-options"

export const Route = createFileRoute("/_admin/billing/invoices/")({
  component: RouteComponent,
  validateSearch: InvoiceSearchParams,
  loaderDeps: ({ search }) => search,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(invoiceStatisticsQueryOptions())
  },
})

function RouteComponent() {
  return (
    <div className="space-y-5">
      <InvoiceTableFilter />
      <InvoiceTable />
    </div>
  )
}
