import { VehicleCategoryTable, VehicleCategoryTableSkeleton } from "@/features/settings/vehicle-config/vehicle-categories/components"
import { createVehicleCategorysQueryOptions } from "@/features/settings/vehicle-config/vehicle-categories/query-options"
import { VehicleCategorySearchParamsCache } from "@/features/settings/vehicle-config/vehicle-categories/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { stripSchemaDefaults } from "@/lib/search-params"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/vehicle-types/"
)({
  component: RouteComponent,
  pendingComponent: VehicleCategoryTableSkeleton,
  validateSearch: VehicleCategorySearchParamsCache,
  search: { middlewares: [stripSchemaDefaults(VehicleCategorySearchParamsCache)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.prefetchQuery(createVehicleCategorysQueryOptions(search)),
})

function RouteComponent() {
  return <VehicleCategoryTable />
}
