import { createFileRoute } from "@tanstack/react-router"
import { HrSetup } from "@/features/hr/components/hr-setup"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/setup/")({
  beforeLoad: () => requirePermission("hr:setup:view"),
  component: HrSetup,
})
