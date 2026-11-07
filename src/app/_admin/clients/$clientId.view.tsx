import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { CustomerDetailsWrapper } from "@/features/clients/components"
import {
  clientInvoicesQueryOptions,
  clientPaymentsQueryOptions,
  clientProfileQueryOptions,
  clientQuotationsQueryOptions,
} from "@/features/clients/query-options"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/$clientId/view")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  beforeLoad: () => requirePermission("clients:view"),
  loader: async ({ context: { queryClient }, params }) => {
    const clientId = params.clientId
    queryClient.ensureQueryData(clientPaymentsQueryOptions(clientId))
    queryClient.ensureQueryData(clientInvoicesQueryOptions(clientId))
    queryClient.ensureQueryData(clientQuotationsQueryOptions(clientId))
    return queryClient.ensureQueryData(clientProfileQueryOptions(clientId))
  },
})

function RouteComponent() {
  const { clientId } = Route.useParams()
  return <CustomerDetailsWrapper clientId={clientId} />
}
