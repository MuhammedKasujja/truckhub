import { createFileRoute } from "@tanstack/react-router"
import { StaffForm } from "@/features/hr/components/staff-form"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/staff/new")({
  beforeLoad: () => requirePermission("hr:staff:create"),
  component: () => <StaffForm />,
})
