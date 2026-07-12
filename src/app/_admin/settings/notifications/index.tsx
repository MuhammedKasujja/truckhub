import { NotificationSettingsForm } from "@/features/settings/notification-settings/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/notifications/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <NotificationSettingsForm onSubmit={(data) => {}} />
}
