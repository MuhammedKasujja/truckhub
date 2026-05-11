import * as apiClient from "@/lib/api-client"
import { DashboardStatistics } from "@/features/dashboard/types"

export async function getDashboardStatistics() {
  return await apiClient.getFn<DashboardStatistics>(`/v1/statistics`)
}
