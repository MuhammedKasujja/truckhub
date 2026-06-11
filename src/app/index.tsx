import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentUser } from "@/lib/auth"

export const Route = createFileRoute("/")({
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
