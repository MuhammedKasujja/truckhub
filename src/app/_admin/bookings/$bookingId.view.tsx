import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { BookingDetailsWrapper } from "@/features/bookings/components/booking-details-wrapper"
import { bookingDetailsQueryOptions } from "@/features/bookings/queries-options"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/bookings/$bookingId/view")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("bookings:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      bookingDetailsQueryOptions(params.bookingId)
    ),
  errorComponent: DefaultCatchBoundary
})

function RouteComponent() {
  const { data: booking } = Route.useLoaderData()
  if(!booking) return <div>Booking not found</div>
  
  return <BookingDetailsWrapper booking={booking} />
}
