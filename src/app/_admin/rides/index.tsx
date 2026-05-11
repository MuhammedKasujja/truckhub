import { hasPermission } from "@/lib/auth"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Suspense } from "react";
import {
  RideRequestTable,
  RideRequestTableSkeleton,
} from "@/features/ride-requests/components/ride-requests-table";
import { PageAction, PageHeader, PageTitle } from "@/components/page-header";
import { Can } from "@/components/has-permission";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { createRidesQueryOptions } from "@/features/ride-requests/query-options";

export const Route = createFileRoute("/_admin/rides/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("rides:view"),
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      createRidesQueryOptions(location.search)
    ),
})

function RouteComponent() {
  return <Suspense fallback={<RideRequestTableSkeleton />}>
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
}
