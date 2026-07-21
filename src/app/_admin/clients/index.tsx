import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClientType, ClientTypeList } from "@/config/constants"

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
  const navigate = useNavigate({ from: "/clients/" })
  const { client_type } = Route.useSearch()

  function updateClientType(value: ClientType) {
    navigate({
      search: (prev) => ({
        ...prev,
        client_type: value,
        page: 1,
      }),
    })
  }

  return (
    <>
      <PageHeader>
        <PageTitle>
          <PageBackButton />
          {tr("common.clients")}
        </PageTitle>
        {/* <PageDescription>Manage your projects and team members</PageDescription> */}
        <PageAction className="flex flex-row gap-4">
          <Select
            value={client_type}
            onValueChange={(v) => {
              updateClientType(v as ClientType)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ClientTypeList.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
