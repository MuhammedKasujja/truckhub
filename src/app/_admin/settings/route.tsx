import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SettingsSidebar } from "@/features/settings/_components/settings-sidebar"

export const Route = createFileRoute("/_admin/settings")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <SidebarProvider className="items-start">
        <SettingsSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* <SettingsNavBar /> */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}
