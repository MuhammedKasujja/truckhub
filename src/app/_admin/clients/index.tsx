import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/clients/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/clients/"!</div>
}
