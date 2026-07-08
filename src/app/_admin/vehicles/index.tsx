import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/features/vehicles/components/vehicle-table"
import { Suspense } from "react"
import { requirePermission } from "@/lib/auth"
import { PageHeader, PageTitle } from "@/components/page-header"

import { createVehiclesListQueryOptions } from "@/features/vehicles/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:module"),
  loader: ({ context, location }) => {
    context.queryClient.prefetchQuery(
      createVehiclesListQueryOptions(location.search)
    )
  },
})

function RouteComponent() {
  return (
    <Suspense fallback={<VehicleTableSkeleton />}>
      <PageHeader>
        <PageTitle>Vehicles</PageTitle>
      </PageHeader>
      <VehicleTable />
    </Suspense>
  )
}
