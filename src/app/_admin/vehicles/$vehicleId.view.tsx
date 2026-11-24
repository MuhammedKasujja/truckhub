import { createFileRoute } from "@tanstack/react-router"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { VehicleDetails } from "@/features/vehicles/components/vehicle-details"
import { VehicleDetailsSkeleton } from "@/features/vehicles/components/vehicle-details-skeleton"
import { useVehicleDetailsSuspenseQuery } from "@/features/vehicles/hooks/use-vehicle"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/view")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:view"),
  errorComponent: DefaultCatchBoundary,
  pendingComponent: VehicleDetailsSkeleton,
  // Awaited (not prefetched) so the loader data carries the vehicle, which
  // the navbar breadcrumbs use to show its number instead of the id.
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    ),
})

function RouteComponent() {
  const { vehicleId } = Route.useParams()
  // Suspends while the query is pending (renders `pendingComponent`) and
  // throws on error (renders `errorComponent`), so `data` is always set here.
  const { data } = useVehicleDetailsSuspenseQuery(vehicleId)

  return <VehicleDetails vehicle={data} />
}
