import { hasPermission } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/bookings/$booking/edit')({
  component: RouteComponent,
  beforeLoad: () => hasPermission('bookings:edit'),
  loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        serviceDetailsQueryOptions(params.serviceId)
      ),
})

function RouteComponent() {
  return <div>Hello "/_admin/bookings/$booking/edit"!</div>
}
