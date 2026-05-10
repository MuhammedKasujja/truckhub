import { AuthProvider } from "@/components/providers/auth-provider"
import { getCurrentUser } from "@/lib/session"
import { createFileRoute, redirect } from "@tanstack/react-router"

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
  return <AuthProvider value={user}>Hello "/_admin"!{user.email}</AuthProvider>
}
