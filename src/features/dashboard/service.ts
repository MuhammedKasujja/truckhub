import { DashboardStatistics } from "./types"
import * as apiClient from "@/lib/api-client"
import { createServerFn } from "@tanstack/react-start"

export const getDashboardStatistics = createServerFn({ method: "GET" }).handler(
  async () => {
    return await apiClient.getFn<DashboardStatistics>(`/v1/statistics`)
  }
)
