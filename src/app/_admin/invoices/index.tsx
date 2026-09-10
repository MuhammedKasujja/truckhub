import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  InvoiceTable,
  InvoiceTableFilter,
} from "@/features/invoices/components"
import {
  invoiceQueryOptions,
  invoiceStatisticsQueryOptions,
} from "@/features/invoices/query-options"
import { InvoiceSearchParams } from "@/features/invoices/schemas"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/invoices/")({
  validateSearch: InvoiceSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  pendingComponent: InvoiceTableSkeleton,
  component: RouteComponent,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(invoiceStatisticsQueryOptions())
    context.queryClient.prefetchQuery(invoiceQueryOptions(search))
  },
})

function RouteComponent() {
  return (
    <div>
      <PageHeader>
        <PageTitle>Invoices</PageTitle>
        <PageAction>
          <Button type="button" asChild>
            <Link to="/invoices/create">
              <PlusIcon />
              Create Invoice
            </Link>
          </Button>
        </PageAction>
      </PageHeader>
      <div className="space-y-5">
        <InvoiceTableFilter />
        <InvoiceTable />
      </div>
    </div>
  )
}

function InvoiceTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={6}
      filterCount={1}
      shrinkZero
      rowCount={25}
    />
  )
}
