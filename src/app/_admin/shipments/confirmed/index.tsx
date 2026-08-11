import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { ShipmentTable } from "@/features/shipments/components"
import { shipmentsConfirmedQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/shipments/confirmed/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(shipmentsConfirmedQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()

  const { data } = useQuery(shipmentsConfirmedQueryOptions(search))
  return (
    <div>
      <ShipmentTable data={data?.data} pagination={data?.pagination} />
    </div>
  )
}
