import { createFileRoute } from "@tanstack/react-router"
import { logoutFn } from "@/features/auth/services"

export const Route = createFileRoute("/_auth/logout")({
  preload: false,
  loader: () => logoutFn(),
})
