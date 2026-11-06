import { z } from "zod"
import { createServerFn } from "@tanstack/react-start"
import { getDashboardStatistics } from "./server"

const DashboardPeriodSchema = z.object({
  from: z.string(),
  to: z.string(),
})

export const getDashboardStatisticsFn = createServerFn({
  method: "GET",
})
  .inputValidator(DashboardPeriodSchema)
  .handler(async ({ data }) => {
    return getDashboardStatistics(data)
  })
