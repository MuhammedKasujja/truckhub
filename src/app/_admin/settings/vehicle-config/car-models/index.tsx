import { CarModelTable } from "@/features/settings/car-model/components/car-model-table"
import { createCarModelsListQueryOptions } from "@/features/settings/car-model/query-options"
import { CarModelSearchParamsCache } from "@/features/settings/car-model/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/car-models/"
)({
  component: RouteComponent,
  validateSearch: CarModelSearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.ensureQueryData(
      createCarModelsListQueryOptions(search)
    ),
})

function RouteComponent() {
  return <CarModelTable />
}
