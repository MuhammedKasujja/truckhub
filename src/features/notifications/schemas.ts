import z from "zod"
import { IDSchema } from "@/schemas"

export const NOTIFICATIONS_PER_PAGE = 20

export const listNotificationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(10).max(100).default(NOTIFICATIONS_PER_PAGE),
  unreadOnly: z.boolean().default(false),
})

export type ListNotificationsInput = z.input<typeof listNotificationSchema>

export const markNotificationReadSchema = z.object({
  /** The recipient row id (`NotificationItem.id`), not `notification_id`. */
  id: IDSchema,
})
