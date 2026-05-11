import { getDashboardStatistics } from "./server"
import { createServerFn } from "@tanstack/react-start"

export const getDashboardStatisticsFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return getDashboardStatistics()
})
