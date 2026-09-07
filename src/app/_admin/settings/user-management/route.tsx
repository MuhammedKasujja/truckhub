import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useRouter } from "@tanstack/react-router"
import { Route as RolesRoute } from "@/app/_admin/settings/user-management/roles"
import { Route as PermissionsRoute } from "@/app/_admin/settings/user-management/permissions"
import { Route as UsersRoute } from "@/app/_admin/settings/user-management/users"
import { IconUsersGroup } from "@tabler/icons-react"
import { ShieldHalfIcon, UserCogIcon } from "lucide-react"
import { useTranslation } from "@/i18n"

const userManagementTabs = [
  {
    name: "users",
    icon: IconUsersGroup,
    route: UsersRoute.to,
  },
  {
    name: "roles",
    icon: UserCogIcon,
    route: RolesRoute.to,
  },
  {
    name: "permissions",
    icon: ShieldHalfIcon,
    route: PermissionsRoute.to,
  },
] as const

export const Route = createFileRoute("/_admin/settings/user-management")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const tr = useTranslation()
  const router = useRouter()

  const activeTab = location.pathname ?? userManagementTabs[0].route
  return (
    <Tabs
      value={activeTab}
      className="w-full"
      onValueChange={(route) => router.navigate({ to: route })}
    >
      <TabsList>
        {userManagementTabs.map((section) => (
          <TabsTrigger key={section.name} value={section.route}>
            <section.icon/>
            {tr(`modules.${section.name}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        <Outlet />
      </div>
    </Tabs>
  )
}
