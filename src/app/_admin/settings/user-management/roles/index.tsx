import { createFileRoute } from "@tanstack/react-router"
import { RoleList } from "@/features/settings/roles/components"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"

export const Route = createFileRoute("/_admin/settings/user-management/roles/")({
  component: RoleList,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createRolesQueryOptions()),
})
