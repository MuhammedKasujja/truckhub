import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/rides/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/rides/new"!</div>
}
