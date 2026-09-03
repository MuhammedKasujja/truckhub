import { DriveTrainTable } from "@/features/settings/drive-trains/components/drive-train-table"
import { createDriveTrainsListQueryOptions } from "@/features/settings/drive-trains/query-options"
import { DriveTrainSearchParamsCache } from "@/features/settings/drive-trains/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/drive-trains/"
)({
  component: RouteComponent,
  validateSearch: DriveTrainSearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.ensureQueryData(
      createDriveTrainsListQueryOptions(search)
    ),
})

function RouteComponent() {
  return <DriveTrainTable />
}
