import { Shipment } from "../types"
import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import type { ApiResponse } from "@/types"
import { vehicleConflictMessage } from "../format"
import { generateApiSearchParams } from "@/lib/search-params"
import {
  EndShipmentInput,
  DispatchShipmentInput,
  ShipmentSearchParamsInput,
  AssignShipmentDriverInput,
  RecordShipmentDetailsInput,
  AssignShipmentVehicleInput,
  ChangeShipmentVehicleInput,
} from "../schemas"

const endpoint = "/v1/trips"

/**
 * A vehicle that is taken for the trip's dates comes back as a 409 whose
 * message only names the vehicle's id. Say what it is busy with instead.
 */
function explainVehicleConflict<T>(response: ApiResponse<T>): ApiResponse<T> {
  const { error } = response
  if (!error || error.statusCode !== 409) return response

  const message = vehicleConflictMessage(error.details?.conflicts)
  return message ? { ...response, error: { ...error, message } } : response
}

export async function getShipments(input: ShipmentSearchParamsInput) {
  const params = generateApiSearchParams(input)
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
    { start_mileage: data.startMileage, contact_name: data.contactName }
  )
}

export async function endShipment(data: EndShipmentInput) {
  return await apiClient.postFn<Shipment>(
    `${endpoint}/${data.unitId}/complete`,
    {
      end_mileage: data.endMileage,
      ended_at: data.endedAt,
    }
  )
}

export async function recordShipmentDetails(data: RecordShipmentDetailsInput) {
  const { unitId, consumedFuelRates, notes, endMileage, endedAt } = data
  // The API rejects an empty list and prices of zero
  const fuelRates = consumedFuelRates
    .map((rate) => rate.value)
    .filter((value) => !!value && Number(value) > 0)

  return await apiClient.postFn<Shipment>(`${endpoint}/${unitId}/details`, {
    notes,
    end_mileage: endMileage,
    consumed_fuel_rates: fuelRates,
    // Ignored by the API once the trip has already been ended
    ended_at: endedAt ?? undefined,
  })
}

export async function shipmentAssignVehicle(data: AssignShipmentVehicleInput) {
  return explainVehicleConflict(
    await apiClient.postFn<Shipment>(
      `${endpoint}/${data.unitId}/vehicle/assign`,
      { vehicle_id: data.vehicleId }
    )
  )
}

export async function changeShipmentVehicle(data: ChangeShipmentVehicleInput) {
  const { unitId, reason, newVehicleId, note } = data
  // Responds with the trip as it is after the change
  return explainVehicleConflict(
    await apiClient.postFn<Shipment>(`${endpoint}/${unitId}/vehicle/reassign`, {
      new_vehicle_id: newVehicleId,
      reason,
      note,
    })
  )
}

export async function shipmentAssignDriver(data: AssignShipmentDriverInput) {
  return await apiClient.postFn<Shipment>(`${endpoint}/${data.unitId}/driver`, {
    driver_id: data.driverId,
  })
}
