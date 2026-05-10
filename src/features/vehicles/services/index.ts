import { Vehicle } from "@/features/vehicles/types"
import {
  VehicleUpdateSchema,
  VehicleCreateSchema,
  VehicleSearchParamsCache,
} from "@/features/vehicles/schemas"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"
import { createVehicle, getVehicles, updateVehicle } from "./data"

export const getVehiclesFn = createServerFn()
  .inputValidator((data) => VehicleSearchParamsCache.parse(data))
  .handler(async ({ data }) => {
    return await getVehicles(data)
  })

export async function getVehiclesByQueryFn({ search }: SearchQuery) {
  return getVehiclesFn({
    data: {
      page: 1,
      perPage: DEFAULT_FITER_QUERY_PER_PAGE,
      sort: [],
      search: search ?? "",
      created_at: [],
      filters: [],
      joinOperator: "and",
    },
  })
}

export async function getVehicleByIdFn(vehicleId: EntityId) {
  return await apiClient.getFn<Vehicle>(`/v1/vehicles/${vehicleId}`)
}

export async function getVehicleDetailsByIdFn(vehicleId: EntityId) {
  return await apiClient.getFn<Vehicle>(`/v1/vehicles/${vehicleId}`)
}

export async function deleteVehicleById(vehicleId: EntityId) {
  return await apiClient.deleteFn(`/v1/vehicles/${vehicleId}`)
}

export const updateVehicleFn = createServerFn()
  .inputValidator((data) => VehicleUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    return await updateVehicle(data)
  })

export const createVehicleFn = createServerFn()
  .inputValidator((data) => VehicleCreateSchema.parse(data))
  .handler(async ({ data: input }) => {
    const response = await createVehicle(input)
    return response
  })

export async function vehicleAssignDriver({
  vehicle_id,
  driver_id,
}: {
  vehicle_id: EntityId
  driver_id: EntityId
}) {
  return await apiClient.postFn(`/v1/vehicles/${vehicle_id}/driver`, {
    driver_id,
  })
}
