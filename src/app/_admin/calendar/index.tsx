import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/calendar/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/calendar/"!</div>
}
