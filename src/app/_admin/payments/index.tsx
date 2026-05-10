import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/payments/')({
  component: RouteComponent,
  
})

function RouteComponent() {
  return <div>Hello "/_admin/payments/"!</div>
}
