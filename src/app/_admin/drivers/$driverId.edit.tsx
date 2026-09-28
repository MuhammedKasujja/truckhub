import { PageHeader, PageTitle } from "@/components/page-header"
import { DriverForm } from "@/features/drivers/components/driver-form"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/drivers/$driverId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      driverProfileQueryOptions(params.driverId)
    ),
})

function RouteComponent() {
  const { data, error } = Route.useLoaderData()
  useFetchEror(error)
  return (
    <>
      <PageHeader>
        <PageTitle>Edit Driver</PageTitle>
      </PageHeader>
      <DriverForm initialData={data} />
    </>
  )
}
