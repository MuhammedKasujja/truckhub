import { EntityId } from "@/schemas"
import { RouteEditType } from "../schemas"
import * as apiClient from "@/lib/api-client"

const endpoint = "/v1/routes"

export async function deleteRoute(routeId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}}/${routeId}`)
}

export async function updateRoute(data: RouteEditType) {
  const { id: routeId, ...rest } = data
  return await apiClient.putFn<RouteEditType>(`${endpoint}/${routeId}`, rest)
}

export async function createRoute(data: RouteEditType) {
  return await apiClient.postFn<RouteEditType>(endpoint, data)
}
