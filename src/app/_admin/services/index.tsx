import { ServiceListWrapper } from "@/features/services/components/service-list-wrapper"
import { serviceQueryOptions } from "@/features/services/query-options"
import { requirePermission } from "@/lib/auth"
import { ModuleAccess } from "@/features/auth/permissions"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/")({
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission(ModuleAccess.services),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(serviceQueryOptions()),
})

function RouteComponent() {
  const { data: services } = useSuspenseQuery(serviceQueryOptions())
  return <ServiceListWrapper services={services ?? []} />
}
