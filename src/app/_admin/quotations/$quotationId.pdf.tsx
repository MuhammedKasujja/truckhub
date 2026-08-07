import { PageAction, PageBackButton, PageHeader, PageTitle } from "@/components/page-header"
import { QuotationPdf } from "@/features/quotations/components/quotation-pdf"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/$quotationId/pdf")({
  component: RouteComponent,
})

function RouteComponent() {
  const { quotationId } = Route.useParams()
  return (
    <div>
      <PageHeader className="pb-0">
        <PageTitle>Quotation Pdf</PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton/>
        </PageAction>
      </PageHeader>
      <QuotationPdf quotationId={quotationId} />
    </div>
  )
}
