import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { useVehicleDetailsQuery } from "@/features/vehicles/hooks/use-vehicle"
import { vehicleDetailsQueryOptions } from "@/features/vehicles/query-options"
import { mapEditVehicle } from "@/features/vehicles/serializers"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/$vehicleId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:edit"),
  loader: async ({ context, params }) =>
    await context.queryClient.ensureQueryData(
      vehicleDetailsQueryOptions(params.vehicleId)
    ),
})

function RouteComponent() {
  const back = useBackNavigation()
  const { vehicleId } = Route.useParams()
  const { data } = useVehicleDetailsQuery(vehicleId)
  return (
    <>
      <PageHeader>
        <PageTitle>Edit vehicle</PageTitle>
        <PageDescription>
          Update the vehicle's registration, specs and features.
        </PageDescription>
      </PageHeader>
      <VehicleForm initialData={mapEditVehicle(data)} onCancel={back} />
    </>
  )
}
