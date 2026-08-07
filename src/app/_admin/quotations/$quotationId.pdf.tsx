import { PdfViewer } from "@/components/pdf-viewer"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/$quotationId/pdf")({
  component: RouteComponent,
})

function RouteComponent() {
  return <PdfViewer pdfUrl={[]} />
}
