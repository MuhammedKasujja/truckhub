import { createDriverListQueryOptions } from "@/features/drivers/queries"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  DriverTable,
  DriverTableSkeleton,
} from "@/features/drivers/components/driver-table"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { requirePermission } from "@/lib/auth"
import { DriverSearchParamsCache } from "@/features/drivers/schemas"
import { ActionIcon } from "@/components/icons"

export const Route = createFileRoute("/_admin/drivers/")({
  validateSearch: DriverSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  pendingComponent: DriverTableSkeleton,
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:module"),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(createDriverListQueryOptions(search)),
})

function RouteComponent() {
  return (
    <>
      <PageHeader>
        <PageTitle>Drivers</PageTitle>
        <PageAction>
          <Can permission={"drivers:create"}>
            <Button asChild>
              <Link to={"/drivers/new"}>
                <ActionIcon action="create"/>
                New Driver
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <DriverTable />
    </>
  )
}
