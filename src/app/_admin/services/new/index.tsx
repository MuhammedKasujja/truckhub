import { ServiceForm } from "@/features/services/components/service-form"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/new/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("services:create"),
})

function RouteComponent() {
  return <ServiceForm />
}
