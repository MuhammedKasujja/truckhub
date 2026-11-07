import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import {
  ShipmentTable,
  ShipmentTableSkeleton,
} from "@/features/shipments/components"
import { shipmentsConfirmedQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"

export const Route = createFileRoute("/_admin/shipments/confirmed/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  pendingComponent: ShipmentTableSkeleton,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.prefetchQuery(shipmentsConfirmedQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data, isLoading } = useQuery(shipmentsConfirmedQueryOptions(search))

  // Only the first load shows a skeleton; refetches keep the table in place
  if (isLoading) return <ShipmentTableSkeleton />

  return <ShipmentTable data={data?.data} pagination={data?.pagination} />
}
