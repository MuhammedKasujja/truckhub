import { hasPermission } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/bookings/$bookingId/view')({
  component: RouteComponent,
  beforeLoad: () => hasPermission('bookings:view'),
  loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        serviceDetailsQueryOptions(params.serviceId)
      ),
})

function RouteComponent() {
  return <div>Hello "/_admin/bookings/$bookingId/view"!</div>
}
