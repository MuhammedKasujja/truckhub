import { ServiceForm } from "@/features/services/components/service-form"
import { serviceDetailsQueryOptions } from "@/features/services/query-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/services/$serviceId/edit")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("services:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      serviceDetailsQueryOptions(params.serviceId)
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return <ServiceForm initialData={data} />
}
