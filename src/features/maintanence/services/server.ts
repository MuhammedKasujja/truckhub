import * as apiClient from "@/lib/api-client"
import { BoardResponse, MaintenanceRecord } from "../types"
import {
  MoveRecordInput,
  RecordBreakdownInput,
  MaintenanceCreateInput,
  MaintenanceUpdateInput,
  MaintenanceSearchParamsInput,
} from "../schemas"
import { EntityId } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"

const endpoint = "/v1/maintenance"

export async function getMaintenanceRecords() {
  return await apiClient.getFn<MaintenanceRecord>(endpoint)
}

export async function getMaintenanceBoardView(
  data: MaintenanceSearchParamsInput
) {
  const params = generateApiSearchParams(data)
  return await apiClient.getFn<BoardResponse>(`${endpoint}/board?${params}`)
}

export async function createMaintenanceRecord(data: MaintenanceCreateInput) {
  return await apiClient.postFn<MaintenanceRecord>(endpoint, data)
}

export async function updateMaintenanceRecord(data: MaintenanceUpdateInput) {
  const { maintanence_id, ...rest } = data
  return await apiClient.patchFn<MaintenanceRecord>(
    `${endpoint}/${maintanence_id}`,
    rest
  )
}

export async function recordBreakdownMaintenance(data: RecordBreakdownInput) {
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/breakdown`,
    data
  )
}

export async function changeMaintenanceStatus(data: MoveRecordInput) {
  const { maintanenceId, newStatus } = data
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/${maintanenceId}/move`,
    { to_status: newStatus }
  )
}
export async function cancleMaintenance(maintanenceId: EntityId) {
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/${maintanenceId}/cancel`,
    {}
  )
}
export async function startMaintenance(maintanenceId: EntityId) {
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/${maintanenceId}/start`,
    {}
  )
}
export async function finishMaintenanceRecord(maintanenceId: EntityId) {
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/${maintanenceId}/complete`,
    {}
  )
}
