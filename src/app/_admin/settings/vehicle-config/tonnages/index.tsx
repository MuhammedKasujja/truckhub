import { TonnageTable } from "@/features/settings/tonnage/components/tonnage-table"
import { createTonnagesQueryOptions } from "@/features/settings/tonnage/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/tonnages/"
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createTonnagesQueryOptions()),
})

function RouteComponent() {
  return <TonnageTable />
}
