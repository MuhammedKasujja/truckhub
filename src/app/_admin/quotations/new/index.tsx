import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/new/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div>Hello "/_admin/quotations/new/"!</div>
    </div>
  )
}
