import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { useBackNavigation } from "@/hooks/use-back-navigation"
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
  const back = useBackNavigation()
  return (
    <>
      <PageHeader>
        <PageTitle>New vehicle</PageTitle>
        <PageDescription>
          Register a car or truck to the fleet. The preview updates as you go.
        </PageDescription>
      </PageHeader>
      <VehicleForm onCancel={back} />
    </>
  )
}
