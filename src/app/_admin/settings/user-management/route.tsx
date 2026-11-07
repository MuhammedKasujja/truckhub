import { createFileRoute } from "@tanstack/react-router"
import { IconUsersGroup } from "@tabler/icons-react"
import { ShieldHalfIcon, UserCogIcon } from "lucide-react"
import { SettingsTabsLayout } from "@/features/settings/_components/settings-tabs"
import { useTranslation } from "@/i18n"

export const Route = createFileRoute("/_admin/settings/user-management")({
  component: RouteComponent,
})

function RouteComponent() {
  const tr = useTranslation()
  return (
    <SettingsTabsLayout
      tabs={[
        {
          label: tr("modules.users"),
          icon: IconUsersGroup,
          to: "/settings/user-management/users",
        },
        {
          label: tr("modules.roles"),
          icon: UserCogIcon,
          to: "/settings/user-management/roles",
        },
        {
          label: tr("modules.permissions"),
          icon: ShieldHalfIcon,
          to: "/settings/user-management/permissions",
        },
      ]}
    />
  )
}
