import { PermissionsWrapper } from "@/features/settings/permissions/components/permissions-wrapper"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/permissions/")({
  beforeLoad: () => hasPermission("config:roles:assign_permissions"),
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(createRolesQueryOptions())
  },
})

function RouteComponent() {
  return (
    <div className="space-y-5">
      <PermissionsWrapper />
    </div>
  )
}
