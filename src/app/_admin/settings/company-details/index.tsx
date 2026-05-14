import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/company-details/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/settings/company-details/"!</div>
}
