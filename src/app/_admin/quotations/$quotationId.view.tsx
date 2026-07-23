import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/quotations/$quotationId/view')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/quotations/$quotationId/view"!</div>
}
