import { IslandsTable } from "@/features/settings/islands/components/island-table"
import { islandsQueryOptions } from "@/features/settings/islands/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/islands/")({
  component: RouteComponent,
  loader: ({ context }) =>
      context.queryClient.ensureQueryData(islandsQueryOptions()),
})

function RouteComponent() {
  return <IslandsTable />
}
