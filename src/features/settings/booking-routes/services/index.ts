import { createRoute } from "./server"
import { RouteEditSchema } from "../schemas"
import { createServerFn } from "@tanstack/react-start"

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
