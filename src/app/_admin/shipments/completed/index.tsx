import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { ShipmentTable } from "@/features/shipments/components"
import { shipmentsCompletedQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/shipments/completed/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(shipmentsCompletedQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()

  const { data } = useQuery(shipmentsCompletedQueryOptions(search))
  return (
    <div>
      <ShipmentTable data={data?.data} pagination={data?.pagination} />
    </div>
  )
}
