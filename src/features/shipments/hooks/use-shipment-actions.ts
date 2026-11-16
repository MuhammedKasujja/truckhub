import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import {
  EndShipmentInput,
  DispatchShipmentInput,
  AssignShipmentDriverInput,
  RecordShipmentDetailsInput,
  AssignShipmentVehicleInput,
  ChangeShipmentVehicleInput,
  ReportShipmentDelayInput,
} from "../schemas"
import {
  endShipmentFn,
  dispatchShipmentFn,
  shipmentAssignDriverFn,
  recordShipmentDetailsFn,
  shipmentAssignVehicleFn,
  changeShipmentVehicleFn,
  reportShipmentDelayFn,
} from "../services"
import { Shipment } from "../types"
import { EntityId } from "@/schemas"
import { queryKeys } from "@/lib/query-keys"
import { QueryClient, useQueryClient } from "@tanstack/react-query"

const useDispatchShipmentBase = createEntityActionHook(
  dispatchShipmentFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId).invalidate()
    // The trip's vehicle goes on the road, or comes back
    invalidator.vehicles.all.invalidate()
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
    invalidator.shipments.details(input.data.unitId).invalidate()
    // The trip's vehicle goes on the road, or comes back
    invalidator.vehicles.all.invalidate()
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
    invalidator.shipments.details(input.data.unitId).invalidate()
    // The trip's vehicle goes on the road, or comes back
    invalidator.vehicles.all.invalidate()
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
    invalidator.shipments.details(input.data.unitId).invalidate()
    invalidator.drivers.list.invalidate()
    invalidator.drivers.details(input.data.driverId).invalidate()
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
    invalidator.shipments.details(input.data.unitId).invalidate()
    invalidator.vehicles.list.invalidate()
    invalidator.vehicles.details(input.data.vehicleId).invalidate()
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

const useChangeShipmentVehicleBase = createEntityActionHook(
  changeShipmentVehicleFn,
  (invalidator, input) => {
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId).invalidate()
    invalidator.vehicles.list.invalidate()
    invalidator.vehicles.details(input.data.newVehicleId).invalidate()
  }
)

export function useChangeShipmentVehicle() {
  const queryClient = useQueryClient()

  const { isPending, execute, ...reset } = useChangeShipmentVehicleBase()

  function changeShipmentVehicle(data: ChangeShipmentVehicleInput) {
    const previousVehicleId = queryClient.getQueryData<Shipment>(
      queryKeys.shipments.detail(data.unitId)
    )?.vehicle?.id

    return execute(
      { data },
      {
        onSuccess: ({ data: shipment }) => {
          refreshShipmentDetails(queryClient, data.unitId, shipment)
          if (previousVehicleId && previousVehicleId !== data.newVehicleId) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.vehicles.detail(previousVehicleId),
            })
          }
        },
      }
    )
  }
  return { isPending, changeShipmentVehicle, ...reset }
}

const useReportShipmentDelayBase = createEntityActionHook(
  reportShipmentDelayFn,
  (invalidator, input) => {
    // A trip moves in or out of the delayed list, and the dashboard counts it
    invalidator.shipments.list.invalidate()
    invalidator.shipments.details(input.data.unitId).invalidate()
    invalidator.dashboard.app()
  }
)

export function useReportShipmentDelay() {
  const queryClient = useQueryClient()
  const { isPending, execute } = useReportShipmentDelayBase()

  /** Resolves to the other trips the delay collides with on the same vehicle. */
  async function reportShipmentDelay(data: ReportShipmentDelayInput) {
    const result = await execute({ data })
    refreshShipmentDetails(queryClient, data.unitId, result.data?.trip)
    return result.data?.affected_trips ?? []
  }
  return { isPending, reportShipmentDelay }
}

function refreshShipmentDetails(
  queryClient: QueryClient,
  unitId: EntityId,
  shipment: Shipment | undefined
) {
  // Without the updated trip there is nothing to write: the invalidation that
  // every action also runs refetches it instead
  if (!shipment) return
  queryClient.setQueryData(queryKeys.shipments.detail(unitId), shipment)
  // patch the item inside the cached list too, so the table updates immediately
  queryClient.setQueriesData(
    { queryKey: queryKeys.shipments.list() },
    // A cached list is a page: { data, pagination }
    (old: { data?: Shipment[] } | undefined) =>
      old && Array.isArray(old.data)
        ? {
            ...old,
            data: old.data.map((s) => (s.id === shipment.id ? shipment : s)),
          }
        : old
  )
}
