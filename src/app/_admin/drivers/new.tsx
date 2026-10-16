import { PageHeader, PageTitle } from "@/components/page-header"
import { DriverForm } from "@/features/drivers/components/driver-form"
import { useCreateDriver } from "@/features/drivers/hooks/user-driver"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/drivers/new")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:create"),
})

function RouteComponent() {
  const { mutate } = useCreateDriver()
  return (
    <>
      <PageHeader>
        <PageTitle>Add Driver</PageTitle>
      </PageHeader>
      <DriverForm
        mode="create"
        onSubmit={(data) => {
          mutate(data)
        }}
      />
    </>
  )
}
