import { createFileRoute } from "@tanstack/react-router"
import type { DriverFormValues } from "@/features/drivers/schemas"
import type { Driver } from "@/features/drivers/types"
import type { EducationLevel } from "@/features/drivers/components/driver-options"
import {
  DRIVER_TESTS,
  driverHealthAnswers,
  driverTest,
  toDateInput,
} from "@/features/drivers/driver-record"
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

/** Prefills the form from the driver record. Files are re-uploaded only to replace them. */
function toFormValues(driver: Driver): Partial<DriverFormValues> {
  const health = Object.fromEntries(
    driverHealthAnswers(driver).flatMap((a) => [
      [a.name, a.answered ? (a.answer ? "yes" : "no") : undefined],
      [`${a.name}Details`, a.details ?? ""],
    ])
  )
  const tests = Object.fromEntries(
    DRIVER_TESTS.map((t) => [t.field, driverTest(driver, t.type).status])
  )
  return {
    fullName: driver.full_name,
    phone: driver.phone,
    email: driver.email,
    nationalId: driver.national_id,
    dateOfBirth: toDateInput(driver.date_of_birth),
    vehicleTypes: driver.vehicle_types.map((v) => ({
      vehicleType: v.vehicle_type,
      yearsExperience: v.years_experience,
    })),
    education: driver.education as EducationLevel,
    smoker: driver.is_smoker,
    drugUser: driver.is_drug_user,
    licenseNumber: driver.license.license_number,
    licenseClasses: driver.license.license_classes,
    licenseExpiry: toDateInput(driver.license.expiry_date),
    driverConfirmed: driver.health_screening.driver_confirmed,
    ...health,
    ...tests,
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
