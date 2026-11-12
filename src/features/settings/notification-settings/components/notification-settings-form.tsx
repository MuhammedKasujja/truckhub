import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BellRing,
  Info,
  Mail,
  MessageSquare,
  MonitorSmartphone,
} from "lucide-react"
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettingsSchema,
} from "../schemas"
import type { NotificationSettings } from "../schemas"
import { Switch } from "@/components/ui/switch"
import {
  SettingsSaveBar,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"

type ChannelKey = keyof NotificationSettings

const CHANNELS: {
  key: ChannelKey
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}[] = [
  {
    key: "in_app",
    icon: MonitorSmartphone,
    title: "In-app",
    description: "Show alerts in the notifications menu while you use TruckHub",
  },
  {
    key: "email",
    icon: Mail,
    title: "Email",
    description: "Send alerts to the email address on your profile",
  },
  {
    key: "sms",
    icon: MessageSquare,
    title: "SMS",
    description: "Text alerts to the phone number on your profile",
  },
]

type NotificationSettingsFormProps = {
  defaultValues?: NotificationSettings
  /**
   * Saves the preferences. Leave it out while there is no API for them: the
   * switches are then shown read-only with a note.
   */
  onSubmit?: (values: NotificationSettings) => Promise<void> | void
}

export function NotificationSettingsForm({
  defaultValues = DEFAULT_NOTIFICATION_SETTINGS,
  onSubmit,
}: NotificationSettingsFormProps) {
  const canSave = !!onSubmit

  const form = useForm<NotificationSettings>({
    resolver: zodResolver(NotificationSettingsSchema),
    defaultValues,
  })
  const { isDirty, isSubmitting } = form.formState

  async function handleSubmit(values: NotificationSettings) {
    await onSubmit?.(values)
    form.reset(values)
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-6"
    >
      <SettingsSection
        icon={BellRing}
        title="Delivery channels"
        description="Where you receive alerts about bookings, trips and payments"
        contentClassName="p-0"
        footer={
          canSave ? undefined : (
            <p className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              Saving notification preferences isn't available yet.
            </p>
          )
        }
      >
        <ul className="divide-y">
          {CHANNELS.map((channel) => {
            const id = `notification-${channel.key}`
            return (
              <li
                key={channel.key}
                className="flex items-center gap-4 px-5 py-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                  <channel.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={id} className="text-sm font-medium">
                    {channel.title}
                  </label>
                  <p
                    id={`${id}-description`}
                    className="text-xs text-muted-foreground"
                  >
                    {channel.description}
                  </p>
                </div>
                <Controller
                  control={form.control}
                  name={channel.key}
                  render={({ field }) => (
                    <Switch
                      id={id}
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      disabled={!canSave || isSubmitting}
                      aria-describedby={`${id}-description`}
                    />
                  )}
                />
              </li>
            )
          })}
        </ul>
      </SettingsSection>

      {canSave && (
        <SettingsSaveBar
          visible={isDirty}
          isSubmitting={isSubmitting}
          onDiscard={() => form.reset()}
          note="These only apply to your account"
        />
      )}
    </form>
  )
}
