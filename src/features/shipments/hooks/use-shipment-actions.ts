import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import {
  EndShipmentInput,
  FinishShipmentInput,
  DispatchShipmentInput,
  AssignShipmentDriverInput,
  AssignShipmentVehicleInput,
} from "../schemas"
import {
  endShipmentFn,
  finishShipmentFn,
  dispatchShipmentFn,
  shipmentAssignDriverFn,
  shipmentAssignVehicleFn,
} from "../services"

const useDispatchShipmentBase = createEntityActionHook(
  dispatchShipmentFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
  }
)

export function useDispatchShipment() {
  const { isPending, execute } = useDispatchShipmentBase()

  function dispatchShipment(data: DispatchShipmentInput) {
    return execute({ data })
  }
  return { isPending, dispatchShipment }
}

const useEndShipmentBase = createEntityActionHook(
  endShipmentFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
  }
)

export function useEndShipment() {
  const { isPending, execute } = useEndShipmentBase()

  function endShipment(data: EndShipmentInput) {
    return execute({ data })
  }
  return { isPending, endShipment }
}

const useFinishShipmentBase = createEntityActionHook(
  finishShipmentFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
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
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
    invalidator.drivers.list.invalidate()
    invalidator.drivers.details(input.data.driverId)
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
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
    invalidator.vehicles.list.invalidate()
    invalidator.vehicles.details(input.data.vehicleId)
  }
)

export function useAssignShipmentVehicle() {
  const { isPending, execute } = useAssignShipmentVehicleBase()

  function assignShipmentVehicle(data: AssignShipmentVehicleInput) {
    return execute({ data })
  }
  return { isPending, assignShipmentVehicle }
}
