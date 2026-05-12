import { BookingDetailsWrapper } from "@/features/bookings/components/booking-details-wrapper"
import { bookingDetailsQueryOptions } from "@/features/bookings/queries-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/bookings/$bookingId/view")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("bookings:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      bookingDetailsQueryOptions(params.bookingId)
    ),
})

function RouteComponent() {
  const { data: booking } = Route.useLoaderData()
  return <BookingDetailsWrapper booking={booking} />
}
