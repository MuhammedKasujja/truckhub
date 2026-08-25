import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { InvoicePdf } from "@/features/invoices/components"
import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/billing/invoices/$invoiceId/pdf")(
  {
    component: RouteComponent,
    loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        invoiceDetailsQueryOptions(params.invoiceId)
      ),
  }
)

function RouteComponent() {
  const { invoiceId } = Route.useParams()
  const { data: invoice } = Route.useLoaderData()
  return (
    <div>
      <PageHeader className="pb-0">
        <PageTitle>{invoice.number} · Pdf</PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton />
        </PageAction>
      </PageHeader>
      <InvoicePdf invoiceId={invoiceId} />
    </div>
  )
}
