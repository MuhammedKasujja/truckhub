import { getClientsByQueryFn } from "@/features/clients/services"
import { getServicesByQueryFn } from "@/features/services/services"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/bookings/new/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("bookings:create"),
  loader: () => {
    const promises = Promise.all([
      getServicesByQueryFn({}),
      getClientsByQueryFn({}),
    ])
  },
})

function RouteComponent() {
  return <div>Hello "/_admin/bookings/new/"!</div>
}
