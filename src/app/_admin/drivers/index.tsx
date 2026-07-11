import { createDriverListQueryOptions } from "@/features/drivers/queries"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import {
  DriverTable,
  DriverTableSkeleton,
} from "@/features/drivers/components/driver-table"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { requirePermission } from "@/lib/auth"
import { DriverSearchParamsCache } from "@/features/drivers/schemas"

export const Route = createFileRoute("/_admin/drivers/")({
  validateSearch: DriverSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:module"),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(createDriverListQueryOptions(search)),
})

function RouteComponent() {
  return (
    <Suspense fallback={<DriverTableSkeleton />}>
      <PageHeader>
        <PageTitle>Drivers</PageTitle>
        <PageAction>
          <Can permission={"drivers:create"}>
            <Button asChild>
              <Link to={"/drivers/new"}>
                <PlusIcon />
                New Driver
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <DriverTable />
    </Suspense>
  )
}
