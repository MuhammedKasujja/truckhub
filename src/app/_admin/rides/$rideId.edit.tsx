import { hasPermission } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/rides/$rideId/edit')({
  component: RouteComponent,
  beforeLoad: () => hasPermission('rides:edit'),
  loader: ({ context, params }) =>
      context.queryClient.ensureQueryData(
        serviceDetailsQueryOptions(params.serviceId)
      ),
})

function RouteComponent() {
  return <div>Hello "/_admin/rides/$rideId/edit"!</div>
}
