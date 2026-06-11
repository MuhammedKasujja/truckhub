import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useRouter } from "@tanstack/react-router"
import { Route as RolesRoute } from "@/app/_admin/settings/user-management/roles"
import { Route as PermissionsRoute } from "@/app/_admin/settings/user-management/permissions"
import { Route as UsersRoute } from "@/app/_admin/settings/user-management/users"

const userManagementTabs = [
  {
    name: "users",
    route: UsersRoute.to,
  },
  {
    name: "roles",
    route: RolesRoute.to,
  },
  {
    name: "permissions",
    route: PermissionsRoute.to,
  },
]

export const Route = createFileRoute("/_admin/settings/user-management")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
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
            {section.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        <Outlet />
      </div>
    </Tabs>
  )
}
