import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/edit")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("vehicles:edit"),
  loader: async ({ context, params }) => {
    const { data } = await context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    )
    return {
      ...data,
      car_brand_id: data?.car_model.car_brand.id,
      cylinders: data?.cylinders.toString(),
      car_model_id: data?.car_model_id,
      features: data?.features.map((feat) => feat.id),
      consumption_rate: Number(data?.consumption_rate)
    }
  },
})

function RouteComponent() {
  const vehicle = Route.useLoaderData()
  return <VehicleForm initialData={{ ...vehicle }} />
}
