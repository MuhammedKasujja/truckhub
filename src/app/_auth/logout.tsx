import { createFileRoute } from "@tanstack/react-router"
import { logout } from "@/features/auth/service"

export const Route = createFileRoute("/_auth/logout")({
  preload: false,
  loader: () => logout(),
})
