import { createVehicleConfigurationsQueryOptions } from "@/features/settings/query-options"
import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/new/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("vehicles:create"),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(createVehicleConfigurationsQueryOptions())
  },
})

function RouteComponent() {
  return <VehicleForm />
}
