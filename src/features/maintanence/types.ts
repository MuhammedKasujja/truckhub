import { EntityId } from "@/schemas"
import { MaintenanceStatus, MaintenanceType } from "./enums"

export type MaintenanceRecord = {
  id: EntityId
  type: MaintenanceType
  status: MaintenanceStatus
  reason: string
  scheduled_start: Date
  scheduled_end: Date | null
  expected_end: Date | null
  actual_start: Date | null
  actual_end: Date | null
  vehicle: {
    id: EntityId
    plate_number: string
    number: string
  }
  is_overdue: boolean
  allowed_transitions: MaintenanceStatus[]
}

export type BoardColumn = {
  status: MaintenanceStatus
  total: number
  cards: MaintenanceRecord[]
}

export type BoardResponse = {
  columns: BoardColumn[]
}
