import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/reports/audits/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/reports/audits/"!</div>
}
