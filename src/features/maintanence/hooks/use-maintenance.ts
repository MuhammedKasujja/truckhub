import { MoveRecordInput } from "../schemas"
import { changeMaintenanceStatusFn } from "../services"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useMoveMaintenanceRecordBase = createEntityActionHook(
  changeMaintenanceStatusFn,
  (invalidator, _) => {
    invalidator.maintenanceBoard.refresh()
  }
)

export const useMoveMaintenanceRecord = () => {
  const { isPending, execute, ...rest} = useMoveMaintenanceRecordBase()

  function moveCard(data: MoveRecordInput) {
    return execute({ data })
  }

  return { isPending, moveCard, ...rest }
}
