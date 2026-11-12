import z from "zod"

export const NotificationSettingsSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  in_app: z.boolean(),
})

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: true,
  sms: false,
  in_app: true,
}
