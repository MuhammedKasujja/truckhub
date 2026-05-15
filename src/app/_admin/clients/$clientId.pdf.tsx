import { PdfViewer } from "@/components/pdf-viewer"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/$clientId/pdf")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PdfViewer
      pdfUrl={
        "https://pdfobject.com/pdf/sample.pdf"
      }
    />
  )
}
