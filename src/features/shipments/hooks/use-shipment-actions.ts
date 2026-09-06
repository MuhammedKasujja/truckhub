import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import {
  EndShipmentInput,
  DispatchShipmentInput,
  AssignShipmentDriverInput,
  RecordShipmentDetailsInput,
  AssignShipmentVehicleInput,
} from "../schemas"
import {
  endShipmentFn,
  dispatchShipmentFn,
  shipmentAssignDriverFn,
  recordShipmentDetailsFn,
  shipmentAssignVehicleFn,
} from "../services"
import { Shipment } from "../types"
import { EntityId } from "@/schemas"
import { queryKeys } from "@/lib/query-keys"
import { QueryClient, useQueryClient } from "@tanstack/react-query"

const useDispatchShipmentBase = createEntityActionHook(
  dispatchShipmentFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
  }
)

export function useDispatchShipment() {
  const queryClient = useQueryClient()

  const { isPending, execute } = useDispatchShipmentBase()

  function dispatchShipment(data: DispatchShipmentInput) {
    return execute(
      { data },
      {
        onSuccess: ({ data: shipment }) => {
          refreshShipmentDetails(queryClient, data.unitId, shipment)
        },
      }
    )
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
  const queryClient = useQueryClient()

  const { isPending, execute } = useEndShipmentBase()

  function endShipment(data: EndShipmentInput) {
    return execute(
      { data },
      {
        onSuccess: ({ data: shipment }) => {
          refreshShipmentDetails(queryClient, data.unitId, shipment)
        },
      }
    )
  }
  return { isPending, endShipment }
}

const useRecordShipmentDetailsBase = createEntityActionHook(
  recordShipmentDetailsFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId)
  }
)

export function useRecordShipmentDetails() {
  const queryClient = useQueryClient()
  const { isPending, execute } = useRecordShipmentDetailsBase()

  function saveShipmentDetails(data: RecordShipmentDetailsInput) {
    return execute(
      { data },
      {
        onSuccess: ({ data: shipment }) => {
          refreshShipmentDetails(queryClient, data.unitId, shipment)
        },
      }
    )
  }
  return { isPending, saveShipmentDetails }
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
  const queryClient = useQueryClient()
  const { isPending, execute } = useAssignShipmentDriverBase()

  function assignShipmentDriver(data: AssignShipmentDriverInput) {
    return execute(
      { data },
      {
        onSuccess: ({ data: shipment }) => {
          refreshShipmentDetails(queryClient, data.unitId, shipment)
        },
      }
    )
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
  const queryClient = useQueryClient()

  const { isPending, execute } = useAssignShipmentVehicleBase()

  function assignShipmentVehicle(data: AssignShipmentVehicleInput) {
    return execute(
      { data },
      {
        onSuccess: ({ data: shipment }) => {
          refreshShipmentDetails(queryClient, data.unitId, shipment)
        },
      }
    )
  }
  return { isPending, assignShipmentVehicle }
}

function refreshShipmentDetails(
  queryClient: QueryClient,
  unitId: EntityId,
  shipment: Shipment | undefined
) {
  queryClient.setQueryData(queryKeys.shipments.detail(unitId), shipment)
  // patch the item inside the cached list too, so the table updates immediately
  queryClient.setQueriesData(
    { queryKey: queryKeys.shipments.list() },
    (old: Shipment[] | undefined) =>
      old?.map((s) => (s.id === shipment?.id ? shipment : s))
  )
}
