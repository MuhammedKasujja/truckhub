import { RouteEditSchema } from "../schemas"
import { createServerFn } from "@tanstack/react-start"
import { createRoute, getBookingRoutes } from "./server"

export const getBookingRoutesFn = createServerFn().handler(async () => {
  return getBookingRoutes()
})

export const createRouteFn = createServerFn({ method: "POST" })
  .inputValidator(RouteEditSchema)
  .handler(async ({ data }) => {
    return createRoute(data)
  })

export const updateRouteFn = createServerFn({ method: "POST" })
  .inputValidator(RouteEditSchema)
  .handler(async ({ data }) => {
    return createRoute(data)
  })
