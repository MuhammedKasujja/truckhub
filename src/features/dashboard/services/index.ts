import { z } from "zod"
import { getDashboardStatistics } from "./server"
import { createServerFn } from "@tanstack/react-start"
import { apiTransformSingle } from "@/lib/api-response-serializer"

const DashboardPeriodSchema = z.object({
  from: z.string(),
  to: z.string(),
})

export const getDashboardStatisticsFn = createServerFn({
  method: "GET",
})
  .validator(DashboardPeriodSchema)
  .handler(async ({ data }) => {
    return apiTransformSingle(getDashboardStatistics(data))
  })
