import { requirePermission } from "@/lib/auth"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import {
  RideRequestTable,
  RideRequestTableSkeleton,
} from "@/features/ride-requests/components/rides-table"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { createRidesQueryOptions } from "@/features/ride-requests/query-options"
import { RideRequestSearchParamsCache } from "@/features/ride-requests/schemas"

export const Route = createFileRoute("/_admin/rides/")({
  validateSearch: RideRequestSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("rides:module"),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(createRidesQueryOptions(search)),
})

function RouteComponent() {
  return (
    <Suspense fallback={<RideRequestTableSkeleton />}>
      <PageHeader>
        <PageTitle>Rides</PageTitle>
        <PageAction>
          <Can permission="rides:create">
            <Button size={"sm"} asChild>
              <Link to={"/rides/new"}>
                <PlusIcon />
                New Request
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <RideRequestTable />
    </Suspense>
  )
}
