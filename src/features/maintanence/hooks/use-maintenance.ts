import { MoveRecordInput } from "../schemas"
import {
  changeMaintenanceStatusFn,
  createMaintenanceRecordFn,
  updateMaintenanceRecordFn,
} from "../services"
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

export const useCreateMaintenanceRecord = () => useCreateMaintenanceRecordBase()

export const useUpdateMaintenanceRecord = () => useUpdateMaintenanceRecordBase()

export const useMoveMaintenanceRecord = () => {
  const { isPending, execute, ...rest } = useMoveMaintenanceRecordBase()

  function moveCard(data: MoveRecordInput) {
    return execute({ data })
  }

  return { isPending, moveCard, ...rest }
}
