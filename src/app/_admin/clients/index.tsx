import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CustomerTable,
  CustomerTableSkeleton,
} from "@/features/clients/components/customer-table"
import { requirePermission } from "@/lib/auth"
import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { PlusIcon } from "lucide-react"
import { useTranslation } from "@/i18n"
import { clientsQueryOptions } from "@/features/clients/query-options"
import { ClientSearchParamsCache } from "@/features/clients/schemas"

export const Route = createFileRoute("/_admin/clients/")({
  validateSearch: ClientSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("clients:module"),
  pendingComponent: CustomerTableSkeleton,
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(clientsQueryOptions(search)),
})

function RouteComponent() {
  const tr = useTranslation()
  return (
    <>
      <PageHeader>
        <PageTitle>
          <PageBackButton />
          {tr("common.clients")}
        </PageTitle>
        {/* <PageDescription>Manage your projects and team members</PageDescription> */}
        <PageAction>
          <Can permission={"clients:create"}>
            <Button asChild>
              <Link to={"/clients/new"}>
                <PlusIcon />
                New Customer
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <CustomerTable />
    </>
  )
}
