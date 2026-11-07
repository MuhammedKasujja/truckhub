import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AuthProvider } from "@/components/providers/auth-provider"
import { getCurrentUser } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  NavigationActions,
  NavigationButtons,
} from "@/components/navigation-actions"
import { GlobalSearchDialog } from "@/components/global-search-dialog"
import { useGlobalShortcuts } from "@/hooks/use-shortcuts"
import { CreateEntityDialog } from "@/components/create-entity-dialog"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { AppBreadcrumbs } from "@/components/app-breadcrumbs"

export const Route = createFileRoute("/_admin")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
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
      <SidebarProvider
        className="overflow-x-clip"
        defaultOpen={false}
        style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset className="overflow-x-clip">
          <nav className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-5">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <NavigationButtons />
                <AppBreadcrumbs />
              </div>
              <div className="flex items-center gap-2">
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
