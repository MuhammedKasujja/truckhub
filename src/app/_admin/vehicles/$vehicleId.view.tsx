import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { VehicleDetails } from "@/features/vehicles/components/vehicle-details"
import { useVehicleDetailsQuery } from "@/features/vehicles/hooks/use-vehicle"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/view")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:view"),
  errorComponent: DefaultCatchBoundary,
  // Awaited (not prefetched) so the loader data carries the vehicle, which
  // the navbar breadcrumbs use to show its number instead of the id.
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    ),
})

function RouteComponent() {
  const { vehicleId } = Route.useParams()
  const { data, error } = useVehicleDetailsQuery(vehicleId)
  useFetchEror(error)
  if (!data) return <div>Failed to load vehicle details</div>

  return <VehicleDetails vehicle={data} />
}
