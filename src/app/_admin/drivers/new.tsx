import { DriverForm } from "@/features/drivers/components/driver-form"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/drivers/new")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:create"),
})

function RouteComponent() {
  return <DriverForm />
}
