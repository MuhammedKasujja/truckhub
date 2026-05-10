import { getCustomersByQueryFn } from "@/features/clients/services"
import { getServicesByQueryFn } from "@/features/services/services"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/bookings/new/")({
  component: RouteComponent,
  beforeLoad: async () => await requirePermission("bookings:create"),
  loader: () => {
    const promises = Promise.all([
      getServicesByQueryFn({}),
      getCustomersByQueryFn({}),
    ])
  },
})

function RouteComponent() {
  return <div>Hello "/_admin/bookings/new/"!</div>
}
