import { createServerFn } from "@tanstack/react-start"
import { listNotificationSchema, markNotificationReadSchema } from "../schemas"
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  websocketConnect,
} from "./server"
import { ApiError } from "@/types"
import { apiResponseTransform } from "@/lib/api-response-serializer"

export const listNotificationsFn = createServerFn({ method: "GET" })
  .validator(listNotificationSchema)
  .handler(async ({ data }) => {
    const response = await getNotifications(data)
    if (response.error) {
      const { message, erroCode, statusCode } = response.error
      throw new ApiError(message, statusCode, erroCode)
    }
    return { data: response.data, pagination: response.pagination }
  })

export const getUnreadNotificationCountFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const result = await apiResponseTransform(getUnreadNotificationCount())
  return result.data?.count ?? 0
})

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator(markNotificationReadSchema)
  .handler(async ({ data }) => {
    return await apiResponseTransform(markNotificationRead(data.id))
  })

export const markAllNotificationsReadFn = createServerFn({
  method: "POST",
}).handler(async () => {
  return await apiResponseTransform(markAllNotificationsRead())
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
