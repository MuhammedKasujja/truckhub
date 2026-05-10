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
  },
})

function RouteComponent() {
  return <div>Hello "/_admin"!</div>
}
