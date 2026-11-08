import { createFileRoute } from "@tanstack/react-router"
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { DriverRegistrationForm } from "@/features/drivers/components/driver-registration-form"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { requirePermission } from "@/lib/auth"
import { useCreateDriver } from "@/features/drivers/hooks/user-driver"

export const Route = createFileRoute("/_admin/drivers/new")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:create"),
})

function RouteComponent() {
  const back = useBackNavigation()
  const mutation = useCreateDriver()
  return (
    <div>
      <PageHeader>
        <PageTitle>Register driver</PageTitle>
        <PageDescription>
          Capture the driver's details, licence and health screening for
          selection.
        </PageDescription>
      </PageHeader>
      <DriverRegistrationForm
        isSubmitting={mutation.isPending}
        onSubmit={({ payload }) => mutation.mutate(payload)}
        onCancel={back}
      />
    </div>
  )
}
