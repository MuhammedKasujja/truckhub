import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  InvoiceTable,
  InvoiceTableSkeleton,
} from "@/features/invoices/components"
import {
  invoiceQueryOptions,
  invoiceStatisticsQueryOptions,
} from "@/features/invoices/query-options"
import { InvoiceSearchParams } from "@/features/invoices/schemas"
import { requirePermission } from "@/lib/auth"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/invoices/")({
  validateSearch: InvoiceSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  pendingComponent: InvoiceTableSkeleton,
  beforeLoad: () => requirePermission("invoices:module"),
  component: RouteComponent,
  loader: ({ context: { queryClient }, deps: { search }, cause }) => {
    // Statistics load in the background
    queryClient.prefetchQuery(invoiceStatisticsQueryOptions())
    const list = queryClient.prefetchQuery(invoiceQueryOptions(search))
    // Only opening the screen waits for the list. Changing a filter keeps the
    // screen up (and its open pickers and focused search box) while it reloads.
    return cause === "stay" ? undefined : list
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
      <InvoiceTable />
    </div>
  )
}
