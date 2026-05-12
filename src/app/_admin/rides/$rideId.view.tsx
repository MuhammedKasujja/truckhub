import { hasPermission } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/rides/$rideId/view')({
  component: RouteComponent,
  beforeLoad: () => hasPermission('rides:view'),
  loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        serviceDetailsQueryOptions(params.serviceId)
      ),
})

function RouteComponent() {
  return <div>Hello "/_admin/rides/$rideId/view"!</div>
}
