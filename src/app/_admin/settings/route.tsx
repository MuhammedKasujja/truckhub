import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import {
  SettingsMobileNav,
  SettingsSidebar,
} from "@/features/settings/_components/settings-sidebar"
import {
  defaultSettingsPath,
  normalizePath,
} from "@/features/settings/_components/settings-nav"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/settings")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const path = normalizePath(location.pathname)
    // The profile used to live here; it is open to every signed-in user now.
    if (path === "/settings/user-profile") {
      throw redirect({ to: "/profile", replace: true })
    }
    await requirePermission("config:module")
    // /settings has no page of its own; open the first section.
    if (path === "/settings") {
      throw redirect({ to: defaultSettingsPath, replace: true })
    }
  },
})

function RouteComponent() {
  return (
    <div className="flex items-start gap-6">
      <SettingsSidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-4">
        <SettingsMobileNav />
        <Outlet />
      </main>
    </div>
  )
}
