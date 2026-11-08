import { createFileRoute } from "@tanstack/react-router"
import type { DriverFormValues } from "@/features/drivers/schemas"
import type { Driver } from "@/features/drivers/types"
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { DriverRegistrationForm } from "@/features/drivers/components/driver-registration-form"
import {
  useDriverProfileSuspenseQuery,
  useEditDriver,
} from "@/features/drivers/hooks/user-driver"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/drivers/$driverId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      driverProfileQueryOptions(params.driverId)
    ),
})

/** Prefills the fields the driver API stores; the rest start empty. */
function toFormValues(driver: Driver): Partial<DriverFormValues> {
  return {
    fullName:
      driver.fullname ||
      [driver.first_name, driver.last_name].filter(Boolean).join(" "),
    phone: driver.phone ?? "",
    email: driver.email ?? "",
    licenseNumber: driver.licence_number ?? "",
  }
}

function RouteComponent() {
  const { driverId } = Route.useParams()
  const { data } = useDriverProfileSuspenseQuery(driverId)
  const { mutate, isPending } = useEditDriver()
  const back = useBackNavigation()

  return (
    <div>
      <PageHeader>
        <PageTitle>Edit driver</PageTitle>
        <PageDescription>
          {data.number ? `${data.number} · ` : ""}
          Update the driver's details, licence and screening.
        </PageDescription>
      </PageHeader>
      <DriverRegistrationForm
        mode="edit"
        initialValues={toFormValues(data)}
        avatarSrc={data.photo_url}
        isSubmitting={isPending}
        onCancel={back}
        onSubmit={({ payload }) => mutate({ id: driverId, ...payload })}
      />
    </div>
  )
}
