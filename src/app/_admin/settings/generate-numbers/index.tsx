import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/generate-numbers/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/settings/generate-numbers/"!</div>
}
