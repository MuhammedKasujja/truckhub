import z from "zod"
import { IDSchema } from "@/schemas"

export const fetchNotificationSchema = z.object({
  userId: IDSchema,
})

export const listNotificationSchema = z.object({
  unreadOnly: z.boolean().default(false),
  ...fetchNotificationSchema.shape
})

export const markNotificationReadSchema = z.object({
  notificationId: IDSchema,
  ...fetchNotificationSchema.shape
})
