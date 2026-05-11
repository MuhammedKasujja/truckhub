import { queryOptions } from "@tanstack/react-query"
import { getDashboardStatisticsFn } from "./services"

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["main-dashboard"],
    queryFn: () => getDashboardStatisticsFn(),
  })
