import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { mapEditVehicle } from "@/features/vehicles/serializers"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:edit"),
  loader: async ({ context, params }) => {
    const { data } = await context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    )
    return mapEditVehicle(data)
  },
})

function RouteComponent() {
  const vehicle = Route.useLoaderData()
  return <VehicleForm initialData={vehicle} />
}
