import { VehicleDetails } from "@/features/vehicles/components/vehicle-details"
import { useVehicleDetailsQuery } from "@/features/vehicles/hooks/use-vehicle"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/view")({
  component: RouteComponent,
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
