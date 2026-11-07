import { createFileRoute } from "@tanstack/react-router"
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { DriverRegistrationForm } from "@/features/drivers/components/driver-registration-form"
// import { DriverForm } from "@/features/drivers/components/driver-form"
// import { useCreateDriver } from "@/features/drivers/hooks/user-driver"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/drivers/new")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:create"),
})

function RouteComponent() {
  const back = useBackNavigation()
  // const { mutate } = useCreateDriver()
  return (
    <div>
      <PageHeader>
        <PageTitle>Register driver</PageTitle>
        <PageDescription>
          Capture the driver's details, licence and health screening for
          selection.
        </PageDescription>
      </PageHeader>
      {/* <DriverForm
        mode="create"
        onSubmit={(data) => {
          mutate(data)
        }}
      /> */}
      {/* TODO: send `payload` (toDriverCreatePayload) once POST /drivers
          accepts it; the existing create endpoint takes the older shape. */}
      <DriverRegistrationForm onSubmit={() => {}} onCancel={back} />
    </div>
  )
}
