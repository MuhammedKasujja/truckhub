import { serviceDetailsQueryOptions } from "@/features/services/query-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/$serviceId/view")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("services:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      serviceDetailsQueryOptions(params.serviceId)
    ),
})

function RouteComponent() {
  return <h1>Display service details</h1>
}
