"use server";

import { DashboardStatistics } from "./types";
import * as apiClient from "@/lib/api-client";

export async function getDashboardStatistics() {
  return await apiClient.getFn<DashboardStatistics>(`/v1/statistics`);
}
