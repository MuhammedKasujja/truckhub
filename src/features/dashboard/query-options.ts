import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { getDashboardStatisticsFn } from "./services"
import type { ResolvedDashboardPeriod } from "./schemas"

export const dashboardQueryKeys = {
  app: () => ["main-dashboard"] as const,
  period: (period: ResolvedDashboardPeriod) =>
    [...dashboardQueryKeys.app(), period] as const,
}

export const dashboardQueryOptions = (period: ResolvedDashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.period(period),
    queryFn: () => getDashboardStatisticsFn({ data: period }),
    // Keep showing the last period while a new range loads
    placeholderData: keepPreviousData,
    // Refetch the data every 2 minutes
    refetchInterval: 2 * 60 * 1000,
  })
