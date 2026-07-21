import { RolesTable } from "@/features/settings/roles/components"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/user-management/roles/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createRolesQueryOptions()),
})

function RouteComponent() {
  return <RolesTable />
}
