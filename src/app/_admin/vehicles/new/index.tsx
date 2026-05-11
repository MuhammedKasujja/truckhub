import { createVehicleConfigurationsQueryOptions } from "@/features/settings/query-options"
import { VehicleForm } from "@/features/vehicles/components/vehicle-form"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/vehicles/new/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("vehicles:create"),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(createVehicleConfigurationsQueryOptions())
  },
})

function RouteComponent() {
  return <VehicleForm />
}
