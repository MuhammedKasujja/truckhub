import { ShipmentTable } from "@/features/shipments/components"
import { shipmentsQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/shipments/")({
  component: RouteComponent,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(shipmentsQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()

  const { data } = useQuery(shipmentsQueryOptions(search))
  return (
    <div className="space-y-5">
      <ShipmentTable data={data?.data} pagination={data?.pagination} />
    </div>
  )
}
