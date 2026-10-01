import { VehicleCategoryTable } from "@/features/settings/vehicle-categories/components/vehicle-types-table"
import { createVehicleCategorysQueryOptions } from "@/features/settings/vehicle-categories/query-options"
import { VehicleCategorySearchParamsCache } from "@/features/settings/vehicle-categories/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/vehicle-types/"
)({
  component: RouteComponent,
  validateSearch: VehicleCategorySearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.prefetchQuery(createVehicleCategorysQueryOptions(search)),
})

function RouteComponent() {
  return <VehicleCategoryTable />
}
