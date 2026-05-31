import { LiveRideMap } from '@/features/ride-requests/components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/rides/live')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LiveRideMap/>
}
