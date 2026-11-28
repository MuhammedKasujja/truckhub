import type { BoardResponse, MaintenanceRecord } from "../types"
import type {
  MaintenanceCreateInput,
  MaintenanceSearchParamsInput,
  MaintenanceUpdateInput,
  MechanicAssignInput,
  MechanicRefInput,
  MoveRecordInput,
  RecordBreakdownInput,
} from "../schemas"
import type { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
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

export async function assignMechanic({
  maintenanceId,
  staffId,
  isLead,
  notes,
}: MechanicAssignInput) {
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/${maintenanceId}/mechanics`,
    { staff_id: staffId, is_lead: isLead ?? false, notes: notes || null }
  )
}

export async function unassignMechanic({ maintenanceId, staffId }: MechanicRefInput) {
  return await apiClient.deleteFn<MaintenanceRecord>(
    `${endpoint}/${maintenanceId}/mechanics/${staffId}`
  )
}

export async function setLeadMechanic({ maintenanceId, staffId }: MechanicRefInput) {
  return await apiClient.postFn<MaintenanceRecord>(
    `${endpoint}/${maintenanceId}/mechanics/${staffId}/lead`,
    {}
  )
}
