import { DriverDetails } from "@/features/drivers/components/driver-details"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/drivers/$driverId/view")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("drivers:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      driverProfileQueryOptions(params.driverId)
    ),
})

function RouteComponent() {
  const { data, error } = Route.useLoaderData()
  useFetchEror(error)
  return <DriverDetails driver={data} />
}
