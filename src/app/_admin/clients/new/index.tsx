import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/clients/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/clients/new/"!</div>
}
