import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/rides/live')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Display live Dispatch</div>
}
