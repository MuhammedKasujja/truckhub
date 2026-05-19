import {
  BookingRoutesTableSkeleton,
  BookingRoutesTable,
} from "@/features/settings/booking-routes/components"
import { bookingRoutesQueryOptions } from "@/features/settings/booking-routes/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/booking-routes/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(bookingRoutesQueryOptions()),
  component: RouteComponent,
  pendingComponent: BookingRoutesTableSkeleton,
})

function RouteComponent() {
  return <BookingRoutesTable />
}
