import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/billing/quotations/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/billing/quotations/"!</div>
}
