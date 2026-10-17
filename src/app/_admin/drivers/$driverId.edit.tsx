import { PageHeader, PageTitle } from "@/components/page-header"
import { DriverForm } from "@/features/drivers/components/driver-form"
import { useEditDriver } from "@/features/drivers/hooks/user-driver"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { useQuery } from "@tanstack/react-query"
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
  const { driverId } = Route.useParams()
  const { data, error } = useQuery(driverProfileQueryOptions(driverId))
  useFetchEror(error)
  const { mutate } = useEditDriver()
  return (
    <>
      <PageHeader>
        <PageTitle>Edit Driver</PageTitle>
      </PageHeader>
      <DriverForm
        defaultValues={{ ...data }}
        mode="edit"
        onSubmit={(data) => mutate(data)}
      />
    </>
  )
}
