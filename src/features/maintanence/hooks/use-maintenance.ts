import {
  assignMechanicFn,
  changeMaintenanceStatusFn,
  createMaintenanceRecordFn,
  setLeadMechanicFn,
  unassignMechanicFn,
  updateMaintenanceRecordFn,
} from "../services"
import type { MoveRecordInput } from "../schemas"
import type { QueryInvalidator } from "@/hooks/use-query-invalidator"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useMoveMaintenanceRecordBase = createEntityActionHook(
  changeMaintenanceStatusFn,
  (invalidator, _) => {
    invalidator.maintenanceBoard.refresh()
  }
)

const useCreateMaintenanceRecordBase = createEntityActionHook(
  createMaintenanceRecordFn,
  (invalidator) => {
    invalidator.maintenanceBoard.refresh()
  }
)

const useUpdateMaintenanceRecordBase = createEntityActionHook(
  updateMaintenanceRecordFn,
  (invalidator) => {
    invalidator.maintenanceBoard.refresh()
  }
)

const refreshBoard = (invalidator: QueryInvalidator) =>
  invalidator.maintenanceBoard.refresh()

const useAssignMechanicBase = createEntityActionHook(assignMechanicFn, refreshBoard)
const useUnassignMechanicBase = createEntityActionHook(unassignMechanicFn, refreshBoard)
const useSetLeadMechanicBase = createEntityActionHook(setLeadMechanicFn, refreshBoard)

export const useAssignMechanic = () => useAssignMechanicBase()
export const useUnassignMechanic = () => useUnassignMechanicBase()
export const useSetLeadMechanic = () => useSetLeadMechanicBase()

export const useCreateMaintenanceRecord = () => useCreateMaintenanceRecordBase()

export const useUpdateMaintenanceRecord = () => useUpdateMaintenanceRecordBase()

export const useMoveMaintenanceRecord = () => {
  const { isPending, execute, ...rest } = useMoveMaintenanceRecordBase()

  function moveCard(data: MoveRecordInput) {
    return execute({ data })
  }

  return { isPending, moveCard, ...rest }
}
