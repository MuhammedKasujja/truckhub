import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import {
  ShipmentTable,
  ShipmentTableSkeleton,
} from "@/features/shipments/components"
import { shipmentsRequestsQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { requirePermission } from "@/lib/auth"
import { stripSchemaDefaults } from "@/lib/search-params"

export const Route = createFileRoute("/_admin/shipments/requests/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  pendingComponent: ShipmentTableSkeleton,
  beforeLoad: () => requirePermission("shipments:module"),
  validateSearch: ShipmentSearchParams,
  search: { middlewares: [stripSchemaDefaults(ShipmentSearchParams)] },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.prefetchQuery(shipmentsRequestsQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data, isLoading } = useQuery(shipmentsRequestsQueryOptions(search))

  // Only the first load shows a skeleton; refetches keep the table in place
  if (isLoading) return <ShipmentTableSkeleton />

  return <ShipmentTable data={data?.data} pagination={data?.pagination} />
}
