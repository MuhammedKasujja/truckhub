import { VehicleTypeTable } from "@/features/settings/vehicle-categories/components/vehicle-types-table"
import { createVehicleTypesQueryOptions } from "@/features/settings/vehicle-categories/query-options"
import { VehicleTypeSearchParamsCache } from "@/features/settings/vehicle-categories/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/vehicle-types/"
)({
  component: RouteComponent,
  validateSearch: VehicleTypeSearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.ensureQueryData(createVehicleTypesQueryOptions(search)),
})

function RouteComponent() {
  return <VehicleTypeTable />
}
