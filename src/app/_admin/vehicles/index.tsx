import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/features/vehicles/components/vehicle-table"
import { requirePermission } from "@/lib/auth"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"

import { createVehiclesListQueryOptions } from "@/features/vehicles/query-options"
import { createFileRoute, Link } from "@tanstack/react-router"
import { VehicleSearchParamsCache } from "@/features/vehicles/schemas"
import { VehicleFilterCard } from "@/features/vehicles/components"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { PlusIcon } from "lucide-react"

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
    <div className="space-y-6">
      <PageHeader className="pb-0">
        <PageTitle>Vehicles</PageTitle>
        <PageAction>
          <Can permission={"vehicles:create"}>
            <Button asChild>
              <Link to={"/vehicles/new"}>
                <PlusIcon />
                New Vehicle
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <VehicleFilterCard />
      <VehicleTable />
    </div>
  )
}
