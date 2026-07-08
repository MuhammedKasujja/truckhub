import { EntityIdSchema } from "@/schemas"
import { createServerFn } from "@tanstack/react-start"
import { RouteCreateSchema, RouteUpdateSchema } from "../schemas"
import {
  createRoute,
  deleteRoute,
  updateRoute,
  getBookingRoutes,
} from "./server"

export const getBookingRoutesFn = createServerFn().handler(async () => {
  return getBookingRoutes()
})

export const createRouteFn = createServerFn({ method: "POST" })
  .inputValidator(RouteCreateSchema)
  .handler(async ({ data }) => {
    return createRoute(data)
  })

export const updateRouteFn = createServerFn({ method: "POST" })
  .inputValidator(RouteUpdateSchema)
  .handler(async ({ data }) => {
    return updateRoute(data)
  })

export const deleteRouteFn = createServerFn({ method: "POST" })
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteRoute(data.id)
  })
