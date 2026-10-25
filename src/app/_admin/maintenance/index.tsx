import { maintenanceBoardQueryOptions } from "@/features/maintanence/query-options"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { BoardViewMaintenanceRecord } from "@/features/maintanence/components"

export const Route = createFileRoute("/_admin/maintenance/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(maintenanceBoardQueryOptions())
  },
})

function RouteComponent() {
  const { data } = useQuery(maintenanceBoardQueryOptions())

  return (
    <>
      <BoardViewMaintenanceRecord records={data ?? {}} />
    </>
  )
}
