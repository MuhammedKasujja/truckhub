import { ApiError } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import {
  getNotifications,
  websocketConnect,
  markNotificationRead,
  markAllNotificationsRead,
} from "./server"
import {
  listNotificationSchema,
  fetchNotificationSchema,
  markNotificationReadSchema,
} from "../schemas"

export const listNotificationsFn = createServerFn({ method: "GET" })
  .inputValidator(listNotificationSchema)
  .handler(async ({ data }) => {
    const { isSuccess, ...res } = await getNotifications(
      data.userId,
      data.unreadOnly
    )
    if (isSuccess) {
      return res.data
    }
    throw new ApiError(
      res.error?.message ?? "Could not fetch notification",
      400
    )
  })

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .inputValidator(markNotificationReadSchema)
  .handler(async ({ data }) => {
    // const user = await getCurrentUser()
    const res = await markNotificationRead(data.userId, data.notificationId)
    return res
  })

export const markAllNotificationsReadFn = createServerFn({
  method: "POST",
})
  .inputValidator(fetchNotificationSchema)
  .handler(async ({ data }) => {
    // const user = await getCurrentUser()
    const res = await markAllNotificationsRead(data.userId)
    return res
  })

export const getWsTicketFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const { isSuccess, data, error } = await websocketConnect()
    if (isSuccess && data) {
      return { ticket: data.ticket, expiresInSec: data.expires_in }
    }
    throw new ApiError(error?.message ?? "Failed to connect to socket", 401)
  }
)
