import type { MaintenanceStatus, MaintenanceType } from "./enums"
import type { EntityId } from "@/schemas"

/** An HR staff member in the Mechanic position working on a task. */
export type MaintenanceMechanic = {
  staff_id: EntityId
  number: string | null
  name: string
  is_lead: boolean
  notes: string | null
}

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
  /** Lead first. */
  mechanics: MaintenanceMechanic[]
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
