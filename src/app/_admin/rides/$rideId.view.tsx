import { RideRequestDetailsWrapper } from "@/features/ride-requests/components"
import { rideDetailsQueryOptions } from "@/features/ride-requests/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/rides/$rideId/view")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("rides:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(rideDetailsQueryOptions(params.rideId)),
})

function RouteComponent() {
  const params = Route.useParams()

  const { error } = Route.useLoaderData()

  useFetchEror(error)
  if (error) {
    return <div>Ride details not found</div>
  }

  return <RideRequestDetailsWrapper rideId={params.rideId} />
}
