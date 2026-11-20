import { createFileRoute, redirect } from "@tanstack/react-router"
import { checkUserModuleAccess } from "@/features/auth/utils"

export const Route = createFileRoute("/")({
  // "/" has no page of its own: signed-out users go to login, signed-in users
  // to the first module they may open (same rule as after login).
  beforeLoad: async ({ location }) => {
    const { redirect: to, replace } = await checkUserModuleAccess()
    if (to === "/login") {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
    throw redirect({ to, replace })
  },
})
