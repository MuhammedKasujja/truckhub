import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { toEditVehicle } from "@/features/vehicles/serializers"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/edit")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("vehicles:edit"),
  loader: async ({ context, params }) => {
    const { data } = await context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    )
    return toEditVehicle(data)
  },
})

function RouteComponent() {
  const vehicle = Route.useLoaderData()
  return <VehicleForm initialData={vehicle} />
}
