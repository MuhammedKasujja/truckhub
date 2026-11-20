import { createFileRoute } from "@tanstack/react-router"
import {
  Building2,
  CalendarClock,
  IdCardIcon,
  Settings2,
  Users,
  Wallet,
} from "lucide-react"
import type { SettingsTab } from "@/features/settings/_components/settings-tabs"
import type { UserPermission } from "@/features/auth/permissions"
import { SettingsTabsLayout } from "@/features/settings/_components/settings-tabs"
import {
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr")({
  beforeLoad: () => requirePermission("hr:module"),
  component: RouteComponent,
})

const TABS: (SettingsTab & { permission: UserPermission })[] = [
  { label: "Staff", icon: Users, to: "/hr/staff", permission: "hr:staff:view" },
  {
    label: "Departments",
    icon: Building2,
    to: "/hr/departments",
    permission: "hr:staff:view",
  },
  { label: "Leave", icon: CalendarClock, to: "/hr/leave", permission: "hr:leave:view" },
  { label: "Payroll", icon: Wallet, to: "/hr/payroll", permission: "hr:payroll:view" },
  { label: "Setup", icon: Settings2, to: "/hr/setup", permission: "hr:setup:view" },
]

function RouteComponent() {
  const { hasPermission } = usePermissions()
  return (
    <SettingsPage>
      <SettingsTabsLayout
        header={
          <SettingsPageHeader
            icon={IdCardIcon}
            title="HR"
            description="Staff and departments, leave, and monthly payroll."
            bordered={false}
          />
        }
        tabs={TABS.filter((tab) => hasPermission(tab.permission))}
      />
    </SettingsPage>
  )
}
