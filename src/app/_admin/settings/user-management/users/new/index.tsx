import { UserForm } from "@/features/users/components/user-form"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/user-management/users/new/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("users:create"),
})

function RouteComponent() {
  return <UserForm/>
}
