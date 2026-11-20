import { createFileRoute } from "@tanstack/react-router"
import z from "zod"
import { PermissionsWrapper } from "@/features/settings/permissions/components/permissions-wrapper"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute(
  "/_admin/settings/user-management/permissions/"
)({
  // ?role=<id> opens the screen on that role.
  validateSearch: z.object({ role: z.string().optional() }),
  beforeLoad: () => requirePermission("config:roles:assign_permissions"),
  component: PermissionsWrapper,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createRolesQueryOptions()),
})
