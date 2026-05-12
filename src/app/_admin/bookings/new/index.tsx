import { BookingRequestForm } from "@/features/bookings/components/booking-request-form"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { servicesSearchQueryOptions } from "@/features/services/query-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/bookings/new/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("bookings:create"),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(clientsSearchQueryOptions())
    return context.queryClient.ensureQueryData(servicesSearchQueryOptions())
  },
})

function RouteComponent() {
  return <BookingRequestForm />
}
