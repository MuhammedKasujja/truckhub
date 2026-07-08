import { AuthProvider } from "@/components/providers/auth-provider"
import { getCurrentUser } from "@/lib/auth"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { NavigationActions, NavigationButtons } from "@/components/navigation-actions"
import { GlobalSearchDialog } from "@/components/global-search-dialog"
import { useGlobalShortcuts } from "@/hooks/use-shortcuts"
import { CreateEntityDialog } from "@/components/create-entity-dialog"

export const Route = createFileRoute("/_admin")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
    return { user }
  },
})

function RouteComponent() {
  useGlobalShortcuts()
  return (
    <AuthProvider>
      <SidebarProvider className="overflow-x-hidden" defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <nav className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-5">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex gap-2 items-center">
                <NavigationButtons />
                <GlobalSearchDialog />
                <CreateEntityDialog />
              </div>
              <NavigationActions />
            </div>
          </nav>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  )
}
