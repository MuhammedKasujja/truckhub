import { ServiceForm } from "@/features/services/components/service-form"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/new/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("services:create"),
})

function RouteComponent() {
  return <ServiceForm />
}
