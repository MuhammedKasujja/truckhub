import { createFileRoute } from "@tanstack/react-router"
import { Bell } from "lucide-react"
import { NotificationSettingsForm } from "@/features/settings/notification-settings/components"
import {
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"

export const Route = createFileRoute("/_admin/settings/notifications/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={Bell}
        title="Notifications"
        description="Choose how TruckHub lets you know when something needs your attention."
      />

      {/* No API for notification preferences yet; pass onSubmit once there is. */}
      <NotificationSettingsForm />
    </SettingsPage>
  )
}
