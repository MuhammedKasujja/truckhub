import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/pricing-config/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/settings/pricing_config/"!</div>
}
