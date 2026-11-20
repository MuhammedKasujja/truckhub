import { createServerFn } from "@tanstack/react-start"
import { RouteCreateSchema, RouteUpdateSchema } from "../schemas"
import {
  createRoute,
  deleteRoute,
  getBookingRoutes,
  updateRoute,
} from "./server"
import { EntityIdSchema } from "@/schemas"

export const getBookingRoutesFn = createServerFn().handler(async () => {
  return getBookingRoutes()
})

export const createRouteFn = createServerFn({ method: "POST" })
  .validator(RouteCreateSchema)
  .handler(async ({ data }) => {
    return createRoute(data)
  })

export const updateRouteFn = createServerFn({ method: "POST" })
  .validator(RouteUpdateSchema)
  .handler(async ({ data }) => {
    return updateRoute(data)
  })

export const deleteRouteFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteRoute(data.id)
  })
