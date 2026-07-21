import { QuotationTable } from "@/features/quotations/components"
import { QuotationSearchParams } from "@/features/quotations/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/billing/quotations/")({
  component: RouteComponent,
  validateSearch: QuotationSearchParams,
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  return <QuotationTable />
}
