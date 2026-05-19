import { RouteEditForm } from "@/features/settings/booking-routes/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/booking-routes/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <RouteEditForm />
}
