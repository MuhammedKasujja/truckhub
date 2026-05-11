import { UserForm } from "@/features/users/components/user-form"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/users/new/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("users:create"),
})

function RouteComponent() {
  return <UserForm/>
}
