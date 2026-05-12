import { VehicleDetails } from "@/features/vehicles/components/vehicle-details"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/view")({
  component: RouteComponent,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(vehicleDetailsQueryOptions(params.vehicleId)),
})

function RouteComponent() {
  const { data, error } = Route.useLoaderData()
  useFetchEror(error)
  return <VehicleDetails vehicle={data} />
}
