import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/rides/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/rides/"!</div>
}
