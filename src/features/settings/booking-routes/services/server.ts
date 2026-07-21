import { EntityId } from "@/schemas"
import * as apiClient from "@/lib/api-client"
import { BookingRoute, RouteCreateType, RouteUpdateType } from "../schemas"

const endpoint = "/v1/routes"

export async function getBookingRoutes() {
  const { data, isSuccess, error } = await apiClient.getFn<BookingRoute[]>(
    `${endpoint}?page=1&perPage=100`
  )
  return { data: isSuccess ? data! : [], error }
}

export async function deleteRoute(routeId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}}/${routeId}`)
}

export async function updateRoute(data: RouteUpdateType) {
  const { id: routeId, ...rest } = data
  return await apiClient.putFn<BookingRoute>(`${endpoint}/${routeId}`, rest)
}

export async function createRoute(data: RouteCreateType) {
  return await apiClient.postFn<BookingRoute>(endpoint, data)
}
