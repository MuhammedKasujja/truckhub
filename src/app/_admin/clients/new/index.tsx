import { ClientForm } from "@/features/clients/components"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/new/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("clients:create"),
})

function RouteComponent() {
  return <ClientForm />
}
