import { createFileRoute } from "@tanstack/react-router"
import {
  InvoiceTable,
  InvoiceTableFilter,
} from "@/features/invoices/components"

export const Route = createFileRoute("/_admin/billing/invoices/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-5">
      <InvoiceTableFilter />
      <InvoiceTable />
    </div>
  )
}
