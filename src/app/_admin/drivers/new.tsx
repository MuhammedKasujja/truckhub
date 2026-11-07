import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { DriverForm } from "@/features/drivers/components"
import { DriverRegistrationForm } from "@/features/drivers/components/driver-registration-form"
// import { DriverForm } from "@/features/drivers/components/driver-form"
// import { useCreateDriver } from "@/features/drivers/hooks/user-driver"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

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
      <DriverRegistrationForm onSubmit={() => {}} onCancel={back} />
    </div>
  )
}
