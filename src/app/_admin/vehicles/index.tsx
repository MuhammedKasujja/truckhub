import {
  VehicleTable,
  VehicleTableSkeleton,
} from "@/features/vehicles/components/vehicle-table"
import { requirePermission } from "@/lib/auth"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"

import {
  createVehiclesListQueryOptions,
  vehicleStatisticsQueryOptions,
} from "@/features/vehicles/query-options"
import { createFileRoute, Link } from "@tanstack/react-router"
import { VehicleSearchParamsCache } from "@/features/vehicles/schemas"
import {
  VehicleFilterCard,
  VehicleStatisticsRow,
} from "@/features/vehicles/components"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { VehicleCardList } from "@/features/vehicles/components/vehicle-card-list"
import React, { Activity } from "react"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "cn"
import { Grid3X3Icon, ListIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/vehicles/")({
  validateSearch: VehicleSearchParamsCache,
  pendingComponent: VehicleTableSkeleton,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:module"),
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(vehicleStatisticsQueryOptions())
    context.queryClient.prefetchQuery(createVehiclesListQueryOptions(search))
  },
})

function RouteComponent() {
  const [view, setView] = React.useState<"card" | "list">("card")
  return (
    <div className="space-y-6">
      <PageHeader className="pb-0">
        <PageTitle>Vehicles</PageTitle>
        <PageAction>
          <Can permission={"vehicles:create"}>
            <Button asChild>
              <Link to={"/vehicles/new"}>
                <ActionIcon action="create" />
                New Vehicle
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <div className="flex justify-between gap-5">
        <VehicleStatisticsRow />
        <ButtonGroup>
          <Button
            variant={"secondary"}
            type="button"
            className={cn(
              view == "card"
                ? "border-primary text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => setView("card")}
          >
            <Grid3X3Icon />
            Card
          </Button>
          <Button
            variant={"secondary"}
            type="button"
            className={cn(
              view == "list"
                ? "border-primary text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => setView("list")}
          >
            <ListIcon />
            List
          </Button>
        </ButtonGroup>
      </div>
      <Activity mode={view === "list" ? "visible" : "hidden"}>
        <div className="grid grid-cols-8 gap-5">
          <div className="col-span-2">
            <VehicleFilterCard />
          </div>
          <div className="col-span-6">
            <VehicleTable />
          </div>
        </div>
      </Activity>
      <Activity mode={view === "card" ? "visible" : "hidden"}>
        <VehicleCardList />
      </Activity>
    </div>
  )
}
