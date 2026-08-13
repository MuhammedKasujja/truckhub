import { ServiceListWrapper } from "@/features/services/components/service-list-wrapper"
import { serviceQueryOptions } from "@/features/services/query-options"
import { ServiceSearchParamsCache } from "@/features/services/schemas"
import { requirePermission } from "@/lib/auth"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/")({
  validateSearch: ServiceSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("services:module"),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(serviceQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(serviceQueryOptions(search))
  return <ServiceListWrapper services={data.data} />
}
