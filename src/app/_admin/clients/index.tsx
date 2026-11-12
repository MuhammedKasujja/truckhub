import { Link, createFileRoute } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import {
  PageAction,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  ClientList,
  ClientListSkeleton,
} from "@/features/clients/components/client-list"
import { clientsQueryOptions } from "@/features/clients/query-options"
import { ClientSearchParamsCache } from "@/features/clients/schemas"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/clients/")({
  validateSearch: ClientSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("clients:module"),
  pendingComponent: ClientListSkeleton,
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(clientsQueryOptions(search)),
})

function RouteComponent() {
  const tr = useTranslation()

  return (
    <>
      <PageHeader>
        <PageTitle>{tr("common.clients")}</PageTitle>
        <PageDescription>
          The companies you quote, book and invoice.
        </PageDescription>
        <PageAction>
          <Can permission="clients:create">
            <Button asChild>
              <Link to="/clients/new">
                <ActionIcon action="create" />
                New client
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <ClientList />
    </>
  )
}
