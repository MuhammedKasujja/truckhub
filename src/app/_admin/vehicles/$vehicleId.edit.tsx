import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/edit")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("vehicles:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return <VehicleForm initialData={data} />
}
