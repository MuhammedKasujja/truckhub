import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/features/vehicles/components/vehicle-table"
import { requirePermission } from "@/lib/auth"
import { PageHeader, PageTitle } from "@/components/page-header"

import { createVehiclesListQueryOptions } from "@/features/vehicles/query-options"
import { createFileRoute } from "@tanstack/react-router"
import { VehicleSearchParamsCache } from "@/features/vehicles/schemas"

export const Route = createFileRoute("/_admin/vehicles/")({
  validateSearch: VehicleSearchParamsCache,
  pendingComponent: VehicleTableSkeleton,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:module"),
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(createVehiclesListQueryOptions(search))
  },
})

function RouteComponent() {
  return (
    <>
      <PageHeader>
        <PageTitle>Vehicles</PageTitle>
      </PageHeader>
      <VehicleTable />
    </>
  )
}
