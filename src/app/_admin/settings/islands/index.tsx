import { IslandsTable } from "@/features/settings/islands/components/island-table"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/islands/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <IslandsTable />
}
