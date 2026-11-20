import { DriveTrainTable } from "@/features/settings/vehicle-config/drive-trains/components/drive-train-table"
import { createDriveTrainsListQueryOptions } from "@/features/settings/vehicle-config/drive-trains/query-options"
import { DriveTrainSearchParamsCache } from "@/features/settings/vehicle-config/drive-trains/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { stripSchemaDefaults } from "@/lib/search-params"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/drive-trains/"
)({
  component: RouteComponent,
  validateSearch: DriveTrainSearchParamsCache,
  search: { middlewares: [stripSchemaDefaults(DriveTrainSearchParamsCache)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.ensureQueryData(
      createDriveTrainsListQueryOptions(search)
    ),
})

function RouteComponent() {
  return <DriveTrainTable />
}
