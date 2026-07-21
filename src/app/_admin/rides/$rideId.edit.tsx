import { RideRequestForm } from "@/features/ride-requests/components"
import { rideDetailsQueryOptions } from "@/features/ride-requests/query-options"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/rides/$rideId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("rides:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(rideDetailsQueryOptions(params.rideId)),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return <RideRequestForm initialData={data} />
}
