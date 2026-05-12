import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SettingsSidebar } from "@/features/settings/_components/settings-sidebar"

import {
  PageDescription,
  PageHeader,
  PageTitle,
  PageTitleIcon,
} from "@/components/page-header"
import { SettingsIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/settings")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageHeader>
        <PageTitle>
          <PageTitleIcon>
            <SettingsIcon className="h-5 w-5" />
          </PageTitleIcon>
          Settings
        </PageTitle>
        <PageDescription>
          Manage system settings and preferences
        </PageDescription>
      </PageHeader>
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
