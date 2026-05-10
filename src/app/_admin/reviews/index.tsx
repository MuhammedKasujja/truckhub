import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/reviews/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/reviews/"!</div>
}
