import { DriveTrainTable } from "@/features/settings/drive-trains/components/drive-train-table"
import { createDriveTrainsListQueryOptions } from "@/features/settings/drive-trains/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/drive-trains/"
)({
  component: RouteComponent,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      createDriveTrainsListQueryOptions(location.search)
    ),
})

function RouteComponent() {
  return <DriveTrainTable />
}
