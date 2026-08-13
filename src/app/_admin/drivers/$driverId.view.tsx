import { DriverDetails } from "@/features/drivers/components/driver-details"
import { useDriverProfileQuery } from "@/features/drivers/hooks/user-driver"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/drivers/$driverId/view")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      driverProfileQueryOptions(params.driverId)
    ),
})

function RouteComponent() {
  const { driverId } = Route.useParams()
  const { data, error } = useDriverProfileQuery(driverId)
  useFetchEror(error)
  if (!data) return <div>Failed to load Driver details</div>
  return <DriverDetails driver={data} />
}
