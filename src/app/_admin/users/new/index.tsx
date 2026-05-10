import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/users/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/users/new/"!</div>
}
