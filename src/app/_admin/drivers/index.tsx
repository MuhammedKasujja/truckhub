import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/drivers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/drivers/"!</div>
}
