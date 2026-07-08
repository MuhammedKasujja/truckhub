import { BookingRequestForm } from "@/features/bookings/components/booking-request-form"
import { bookingDetailsQueryOptions } from "@/features/bookings/queries-options"
import { clientsSearchQueryOptions } from "@/features/clients/query-options"
import { servicesSearchQueryOptions } from "@/features/services/query-options"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/bookings/$bookingId/edit")({
  component: RouteComponent,
  beforeLoad: async () => requirePermission("bookings:edit"),
  loader: async ({ context, params }) => {
    context.queryClient.prefetchQuery(clientsSearchQueryOptions())
    return await Promise.all([
      context.queryClient.ensureQueryData(
        bookingDetailsQueryOptions(params.bookingId)
      ),
      context.queryClient.ensureQueryData(servicesSearchQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const [{ data: booking }] = Route.useLoaderData()
  return <BookingRequestForm initialData={booking} />
}
