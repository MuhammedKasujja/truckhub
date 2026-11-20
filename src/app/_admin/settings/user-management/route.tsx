import { createFileRoute } from "@tanstack/react-router"
import { IconUsersGroup } from "@tabler/icons-react"
import { ShieldHalfIcon, UserCogIcon, Users } from "lucide-react"
import { SettingsTabsLayout } from "@/features/settings/_components/settings-tabs"
import {
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"
import { useTranslation } from "@/i18n"

export const Route = createFileRoute("/_admin/settings/user-management")({
  component: RouteComponent,
})

function RouteComponent() {
  const tr = useTranslation()
  return (
    <SettingsPage>
      <SettingsTabsLayout
        header={
          <SettingsPageHeader
            icon={Users}
            title="User management"
            description="Who can sign in, the roles they hold, and what each role is allowed to do."
            bordered={false}
          />
        }
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
    </SettingsPage>
  )
}
