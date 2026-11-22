import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { EntityId } from "@/schemas"
import { ServiceListWrapper } from "@/features/services/components/service-list-wrapper"
import { serviceQueryOptions } from "@/features/services/query-options"
import { ServiceListPageSearchSchema } from "@/features/services/schemas"
import { clientServiceProductsQueryOptions } from "@/features/clients/query-options"
import { requirePermission } from "@/lib/auth"
import { ModuleAccess } from "@/features/auth/permissions"

// With a client picked, list that client's services instead of the general ones.
function servicesListQueryOptions(clientId: EntityId | undefined) {
  return clientId
    ? clientServiceProductsQueryOptions(clientId)
    : serviceQueryOptions()
}

export const Route = createFileRoute("/_admin/services/")({
  validateSearch: ServiceListPageSearchSchema,
  loaderDeps: ({ search }) => ({ client: search.client }),
  component: RouteComponent,
  beforeLoad: () => requirePermission(ModuleAccess.services),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(servicesListQueryOptions(deps.client)),
})

function RouteComponent() {
  const { client } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: services } = useSuspenseQuery(servicesListQueryOptions(client))

  return (
    <ServiceListWrapper
      services={services ?? []}
      clientId={client}
      onClientChange={(clientId) =>
        navigate({ search: (prev) => ({ ...prev, client: clientId }) })
      }
    />
  )
}
