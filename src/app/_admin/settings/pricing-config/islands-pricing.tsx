import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_admin/settings/pricing-config/islands-pricing',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/settings/pricing-config/island-pricing"!</div>
}
