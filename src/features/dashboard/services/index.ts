import { getDashboardStatistics } from "../service"
import { createServerFn } from "@tanstack/react-start"

export const getDashboardStatisticsFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return getDashboardStatistics()
})
