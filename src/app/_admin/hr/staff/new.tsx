import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { driverProfileQueryOptions } from "@/features/drivers/queries"
import { StaffForm } from "@/features/hr/components/staff-form"
import { LoadError } from "@/features/hr/components/hr-ui"
import { StaffNewSearchSchema } from "@/features/hr/schemas"
import {
  staffValuesFromDriver,
  staffValuesFromUser,
} from "@/features/hr/staff-source"
import { userDetailsQueryOptions } from "@/features/users/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/staff/new")({
  validateSearch: StaffNewSearchSchema,
  beforeLoad: () => requirePermission("hr:staff:create"),
  component: RouteComponent,
})

function RouteComponent() {
  const { from_user, from_driver } = Route.useSearch()
  // Creating staff from an existing user or driver: load it to prefill the form.
  const user = useQuery({
    ...userDetailsQueryOptions(from_user ?? ""),
    enabled: !!from_user,
  })
  const driver = useQuery({
    ...driverProfileQueryOptions(from_driver ?? ""),
    enabled: !from_user && !!from_driver,
  })

  if (from_user) {
    if (user.isLoading) return <FormLoading />
    if (!user.data?.data) {
      return <LoadError message="That user couldn't be loaded, so there is nothing to copy from." />
    }
    const record = user.data.data
    return (
      <StaffForm
        key={record.id}
        source={{ kind: "user", id: record.id, name: record.name }}
        prefill={staffValuesFromUser(record)}
      />
    )
  }

  if (from_driver) {
    if (driver.isLoading) return <FormLoading />
    if (!driver.data?.data) {
      return <LoadError message="That driver couldn't be loaded, so there is nothing to copy from." />
    }
    const record = driver.data.data
    return (
      <StaffForm
        key={record.id}
        source={{ kind: "driver", id: record.id, name: record.full_name }}
        prefill={staffValuesFromDriver(record)}
      />
    )
  }

  return <StaffForm />
}

function FormLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-busy="true">
      <div className="h-80 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-80 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )
}
