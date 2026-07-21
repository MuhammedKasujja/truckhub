import { ClientForm } from "@/features/clients/components"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/new/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("clients:create"),
})

function RouteComponent() {
  return <ClientForm />
}
