import { VehicleTypeTable } from "@/features/settings/vehicle-types/components/vehicle-types-table"
import { createVehicleTypesQueryOptions } from "@/features/settings/vehicle-types/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/vehicle-types/"
)({
  component: RouteComponent,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      createVehicleTypesQueryOptions(location.search)
    ),
})

function RouteComponent() {
  return <VehicleTypeTable />
}
