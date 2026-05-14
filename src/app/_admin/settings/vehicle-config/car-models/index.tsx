import { CarModelTable } from "@/features/settings/car-model/components/car-model-table"
import { createCarModelsListQueryOptions } from "@/features/settings/car-model/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/car-models/"
)({
  component: RouteComponent,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      createCarModelsListQueryOptions(location.search)
    ),
})

function RouteComponent() {
  return <CarModelTable/>
}
