import { getVehicles } from "@/features/vehicles/service"
import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/features/vehicles/components/vehicle-table"
import { generatePageSearchParams } from "@/lib/search-params"
import { VehicleSearchParamsCache } from "@/features/vehicles/schemas"
import { Suspense } from "react"
import { hasPermission } from "@/lib/auth"
import { PageHeader, PageTitle } from "@/components/page-header"

import { createVehiclesListQueryOptions } from "@/features/vehicles/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("vehicles:view"),
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
