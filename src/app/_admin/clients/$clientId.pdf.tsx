import { ClientPdf } from "@/features/clients/components/client-pdf"
import { clientProfileQueryOptions } from "@/features/clients/query-options"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/$clientId/pdf")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("clients:view"),
  loader: (ctx) =>
    ctx.context.queryClient.ensureQueryData(
      clientProfileQueryOptions(ctx.params.clientId)
    ),
})

function RouteComponent() {
  const params = Route.useParams()
  return <ClientPdf clientId={params.clientId} />
}
