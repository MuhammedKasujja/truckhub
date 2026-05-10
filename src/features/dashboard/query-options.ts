import { getDashboardStatistics } from "./service"
import { queryOptions } from "@tanstack/react-query"

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["main-dashboard"],
    queryFn: () => getDashboardStatistics(),
  })
