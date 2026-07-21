"use server"

import * as apiClient from "@/lib/api-client"
import { AuditLog } from "@/features/audit_logs/types"
import { generateApiSearchParams } from "@/lib/search-params"
import {
  DeleteLogsRequest,
  AuditLogSearchParams,
} from "@/features/audit_logs/schemas"
import { EntityId } from "@/schemas"

const endpoint = "/v1/audit-logs"

export async function getAuditLogs(input: AuditLogSearchParams) {
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<AuditLog[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getAuditLogDetails(logId: EntityId) {
  return apiClient.getFn<AuditLog>(`${endpoint}/${logId}`)
}

export async function deleteAuditLogs({ log_ids }: DeleteLogsRequest) {
  return apiClient.postFn<AuditLog>(endpoint, { log_ids })
}
