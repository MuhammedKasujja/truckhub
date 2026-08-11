import { Shipment } from "../types"
import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { generateApiSearchParams } from "@/lib/search-params"
import {
  EndShipmentInput,
  FinishShipmentInput,
  DispatchShipmentInput,
  ShipmentSearchParamsInput,
  AssignShipmentDriverInput,
  AssignShipmentVehicleInput,
} from "../schemas"

const endpoint = "/v1/trips"

export async function getShipments(input: ShipmentSearchParamsInput) {
  const params = generateApiSearchParams(input)
  console.log("params", params)
  const response = await apiClient.getPaginatedFn<Shipment[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getShipmentById(unitId: EntityId) {
  return await apiClient.getFn<Shipment>(`${endpoint}/${unitId}`)
}

export async function dispatchShipment(data: DispatchShipmentInput) {
  return await apiClient.postFn<Shipment>(
    `${endpoint}/${data.unitId}/dispatch`,
    { start_mileage: data.startMileage }
  )
}

export async function endShipment(data: EndShipmentInput) {
  return await apiClient.postFn<Shipment>(`${endpoint}/${data.unitId}/end`, {
    end_mileage: data.endMileage,
  })
}

export async function finishShipment(data: FinishShipmentInput) {
  const { unitId, consumedFuelRates, notes, endMileage } = data
  const fuelRates = consumedFuelRates
    .filter((r) => r.value)
    .map((rate) => rate.value)

  return await apiClient.postFn<Shipment>(`${endpoint}/${unitId}/complete`, {
    notes,
    end_mileage: endMileage,
    consumed_fuel_rates: fuelRates,
  })
}

export async function shipmentAssignVehicle(data: AssignShipmentVehicleInput) {
  return await apiClient.postFn<Shipment>(
    `${endpoint}/${data.unitId}/vehicle`,
    { vehicle_id: data.vehicleId }
  )
}

export async function shipmentAssignDriver(data: AssignShipmentDriverInput) {
  return await apiClient.postFn<Shipment>(`${endpoint}/${data.unitId}/driver`, {
    driver_id: data.driverId,
  })
}
