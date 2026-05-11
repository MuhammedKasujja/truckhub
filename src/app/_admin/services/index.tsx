import { ServiceListWrapper } from "@/features/services/components/service-list-wrapper"
import { serviceQueryOprions } from "@/features/services/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/")({
  component: RouteComponent,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(serviceQueryOprions(location.search)),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return <ServiceListWrapper services={data} />
}
