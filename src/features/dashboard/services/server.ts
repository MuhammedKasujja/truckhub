import type { DashboardStatistics } from "@/features/dashboard/types"
import type { ResolvedDashboardPeriod } from "@/features/dashboard/schemas"
import * as apiClient from "@/lib/api-client"

export async function getDashboardStatistics(period?: ResolvedDashboardPeriod) {
  const params = period ? `?${new URLSearchParams(period).toString()}` : ""
  return await apiClient.getFn<DashboardStatistics>(`/v1/statistics${params}`)
}
