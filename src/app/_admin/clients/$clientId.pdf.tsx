import { ClientPdf } from "@/features/clients/components/client-pdf"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/$clientId/pdf")({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  return <ClientPdf clientId={params.clientId} />
}
