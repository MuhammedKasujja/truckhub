import { createFileRoute } from "@tanstack/react-router"
import {
  InvoiceTable,
  InvoiceTableFilter,
} from "@/features/invoices/components"
import { InvoiceSearchParams } from "@/features/invoices/schemas"

export const Route = createFileRoute("/_admin/billing/invoices/")({
  component: RouteComponent,
  validateSearch: InvoiceSearchParams,
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  return (
    <div className="space-y-5">
      <InvoiceTableFilter />
      <InvoiceTable />
    </div>
  )
}
