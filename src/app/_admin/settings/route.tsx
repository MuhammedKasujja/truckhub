import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SettingsSidebar } from "@/features/settings/_components/settings-sidebar"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/settings")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("config:module"),
})

function RouteComponent() {
  return (
    <div>
      <SidebarProvider className="items-start">
        <SettingsSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* <SettingsNavBar /> */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pl-4">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
