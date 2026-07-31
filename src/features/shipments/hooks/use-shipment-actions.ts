import { EntityId } from "@/schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import {
  FinishShipmentInput,
  DispatchShipmentInput,
  AssignShipmentDriverInput,
  AssignShipmentVehicleInput,
} from "../schemas"
import {
  finishShipmentFn,
  completShipmentFn,
  dispatchShipmentFn,
  shipmentAssignDriverFn,
  shipmentAssignVehicleFn,
} from "../services"

const useDispatchShipmentBase = createEntityActionHook(
  dispatchShipmentFn,
  (invalidator, input) => {
    // invalidator.quotations.list.invalidate()
    // invalidator.quotations.details(input.data.id)
  }
)

export function useDispatchShipment() {
  const { isPending, execute } = useDispatchShipmentBase()

  function dispatchShipment(data: DispatchShipmentInput) {
    return execute({ data })
  }
  return { isPending, dispatchShipment }
}

const useCompleteShipmentBase = createEntityActionHook(
  completShipmentFn,
  (invalidator, input) => {
    // invalidator.quotations.list.invalidate()
    // invalidator.quotations.details(input.data.id)
  }
)

export function useCompleteShipment() {
  const { isPending, execute } = useCompleteShipmentBase()

  function completeShipment(id: EntityId) {
    return execute({ data: { id } })
  }
  return { isPending, completeShipment }
}

const useFinishShipmentBase = createEntityActionHook(
  finishShipmentFn,
  (invalidator, input) => {
    // invalidator.quotations.list.invalidate()
    // invalidator.quotations.details(input.data.id)
  }
)

export function useFinishShipment() {
  const { isPending, execute } = useFinishShipmentBase()

  function finishShipment(data: FinishShipmentInput) {
    return execute({ data })
  }
  return { isPending, finishShipment }
}

const useAssignShipmentDriverBase = createEntityActionHook(
  shipmentAssignDriverFn,
  (invalidator, input) => {
    // invalidator.quotations.list.invalidate()
    // invalidator.quotations.details(input.data.id)
  }
)

export function useAssignShipmentDriver() {
  const { isPending, execute } = useAssignShipmentDriverBase()

  function assignShipmentDriver(data: AssignShipmentDriverInput) {
    return execute({ data })
  }
  return { isPending, assignShipmentDriver }
}

const useAssignShipmentVehicleBase = createEntityActionHook(
  shipmentAssignVehicleFn,
  (invalidator, input) => {
    // invalidator.quotations.list.invalidate()
    // invalidator.quotations.details(input.data.id)
  }
)

export function useAssignShipmentVehicle() {
  const { isPending, execute } = useAssignShipmentVehicleBase()

  function assignShipmentVehicle(data: AssignShipmentVehicleInput) {
    return execute({ data })
  }
  return { isPending, assignShipmentVehicle }
}
