import { Shipment } from "../types"
import * as apiClient from "@/lib/api-client"
import { ShipmentSearchParamsInput } from "../schemas"
import { generateApiSearchParams } from "@/lib/search-params"

const endpoint = "/v1/trips"

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
