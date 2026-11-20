import { createFileRoute } from "@tanstack/react-router"
import { CarModelList } from "@/features/settings/vehicle-config/car-model/components"
import { createCarModelsListQueryOptions } from "@/features/settings/vehicle-config/car-model/query-options"
import { CarModelSearchParamsCache } from "@/features/settings/vehicle-config/car-model/schemas"
import { ConfigGridSkeleton } from "@/features/settings/vehicle-config/_components/config-ui"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/car-models/"
)({
  component: CarModelList,
  pendingComponent: ConfigGridSkeleton,
  validateSearch: CarModelSearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.ensureQueryData(
      createCarModelsListQueryOptions(search)
    ),
})
