import { AuthProvider } from "@/components/providers/auth-provider"
import { getCurrentUser } from "@/lib/session"
import {
  createFileRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { NavigationActions } from "@/components/navigation-actions"
import { SearchForm } from "@/components/search-form"
import { useGlobalShortcuts } from "@/hooks/use-shortcuts"

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
  const { user } = Route.useRouteContext()
  useGlobalShortcuts()
  return (
    <AuthProvider value={user}>
      <SidebarProvider className="overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="flex w-full items-center justify-between gap-4">
              <SearchForm />
              <NavigationActions />
            </div>
          </header>
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  )
}
