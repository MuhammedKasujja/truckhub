import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { RideRequestForm } from "@/features/ride-requests/components"
import { servicesSearchQueryOptions } from "@/features/services/query-options"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/rides/new")({
  component: RouteComponent,
  beforeLoad: ()=> requirePermission('rides:create'),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(clientsSearchQueryOptions())
    return context.queryClient.ensureQueryData(servicesSearchQueryOptions())
  },
})

function RouteComponent() {
  return <RideRequestForm />
}
